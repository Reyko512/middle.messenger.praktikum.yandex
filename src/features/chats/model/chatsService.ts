import { chatsApi, resourcesApi } from '@entities/chat';
import type { Chat, WSMessageData } from '@entities/chat';
import { mergeSort } from '@shared/lib/algorithms/mergeSort';
import { normalizeError } from '@shared/lib/network/normalizeError';
import { sanitizeText } from '@shared/lib/security/sanitize';
import { appStore } from '@app/model';
import { chatSocketService } from './chatSocketService';
import { userApi } from '@entities/user';

const SELECTED_CHAT_STORAGE_KEY = 'selectedChatId';
const CHATS_PAGE_SIZE = 10;

function getChatActivityTimestamp(chat: Chat) {
  if (chat.last_message?.time) {
    return new Date(chat.last_message.time).getTime();
  }

  return 0;
}

function sortChatsByActivity(chats: readonly Chat[]) {
  return mergeSort(chats, (left, right) => {
    return getChatActivityTimestamp(right) - getChatActivityTimestamp(left);
  });
}

function sortMessages(messages: readonly WSMessageData[]) {
  return mergeSort(messages, (left, right) => {
    return new Date(left.time).getTime() - new Date(right.time).getTime();
  });
}

class ChatsService {
  private isChatInList(chatId: number, chats: readonly Chat[]) {
    return chats.some((chat) => chat.id === chatId);
  }

  private async findFirstUserByLogin(login: string) {
    const users = await userApi.searchByLogin({ login });
    return users[0] ?? null;
  }

  public async loadChats(title = '') {
    appStore.setState({
      isChatsLoading: true,
    });

    try {
      const chats = await chatsApi.readChats({
        limit: CHATS_PAGE_SIZE,
        offset: 0,
        title,
      });
      const sortedChats = sortChatsByActivity(chats);

      appStore.setState({
        chats: sortedChats,
        globalError: null,
      });

      const state = appStore.getState();
      if (
        state.selectedChatId !== null &&
        !this.isChatInList(state.selectedChatId, sortedChats)
      ) {
        this.resetSelectedChat();
      }

      if (state.selectedChatId !== null) {
        return sortedChats;
      }

      const persistedChatId = Number(
        sessionStorage.getItem(SELECTED_CHAT_STORAGE_KEY),
      );

      if (
        Number.isNaN(persistedChatId) ||
        !this.isChatInList(persistedChatId, sortedChats)
      ) {
        return sortedChats;
      }

      await this.selectChat(persistedChatId);
      return sortedChats;
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    } finally {
      appStore.setState({
        isChatsLoading: false,
      });
    }
  }

  public async createChat(title: string) {
    const sanitizedTitle = sanitizeText(title);

    if (!sanitizedTitle) {
      throw new Error('Chat title is required');
    }

    try {
      await chatsApi.createChat({
        title: sanitizedTitle,
      });
      appStore.setState({
        globalError: null,
      });
      await this.loadChats();
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async deleteSelectedChat() {
    const selectedChatId = appStore.getState().selectedChatId;

    if (!selectedChatId) {
      throw new Error('Select a chat first');
    }

    try {
      await chatsApi.deleteChat({
        chatId: selectedChatId,
      });

      this.resetSelectedChat();
      appStore.setState({
        globalError: null,
      });
      await this.loadChats();
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async selectChat(chatId: number) {
    const state = appStore.getState();
    if (!state.user) {
      throw new Error('User is not authorized');
    }

    if (!this.isChatInList(chatId, state.chats)) {
      throw new Error('Chat not found');
    }

    const existingMessages = state.messagesByChatId[chatId];

    appStore.setState({
      selectedChatId: chatId,
      selectedChatUsers: [],
      globalError: null,
      chatHistoryLoadingByChatId: {
        ...state.chatHistoryLoadingByChatId,
        [chatId]: !existingMessages,
      },
    });

    sessionStorage.setItem(SELECTED_CHAT_STORAGE_KEY, String(chatId));

    if (existingMessages) {
      appStore.setState({
        messagesByChatId: {
          ...state.messagesByChatId,
          [chatId]: sortMessages(existingMessages),
        },
      });
    }

    try {
      await Promise.all([
        this.loadSelectedChatUsers(chatId),
        chatSocketService.connect(state.user.id, chatId),
      ]);
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async loadSelectedChatUsers(chatId?: number) {
    const selectedChatId = chatId ?? appStore.getState().selectedChatId;
    if (!selectedChatId) {
      appStore.setState({
        selectedChatUsers: [],
      });
      return [];
    }

    try {
      const users = await chatsApi.readChatUsers(selectedChatId);
      appStore.setState({
        selectedChatUsers: users,
        globalError: null,
      });
      return users;
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async updateChatParticipant(
    action: 'add' | 'remove',
    login: string,
  ) {
    const selectedChatId = appStore.getState().selectedChatId;
    if (!selectedChatId) {
      throw new Error('Select a chat first');
    }

    const sanitizedLogin = sanitizeText(login);
    if (!sanitizedLogin) {
      throw new Error('User login is required');
    }

    try {
      const user = await this.findFirstUserByLogin(sanitizedLogin);

      if (!user) {
        throw new Error('User not found');
      }

      if (action === 'add') {
        await chatsApi.addUsers({
          chatId: selectedChatId,
          users: [user.id],
        });
      } else {
        await chatsApi.removeUsers({
          chatId: selectedChatId,
          users: [user.id],
        });
      }

      appStore.setState({
        globalError: null,
      });

      await this.loadSelectedChatUsers(selectedChatId);
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public sendMessage(content: string) {
    const sanitizedContent = sanitizeText(content);
    if (!sanitizedContent) {
      throw new Error('Message is empty');
    }

    chatSocketService.sendMessage(sanitizedContent);
  }

  public async sendFile(file: File) {
    const selectedChatId = appStore.getState().selectedChatId;
    if (!selectedChatId) {
      throw new Error('Chat is not selected');
    }

    if (!file) {
      throw new Error('File is required');
    }

    const formData = new FormData();
    formData.append('resource', file);

    try {
      const resource = await resourcesApi.upload(formData);
      chatSocketService.sendFile(String(resource.id));
      appStore.setState({
        globalError: null,
      });
      return resource;
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public async loadMoreMessages(chatId: number) {
    const state = appStore.getState();
    const currentMessages = state.messagesByChatId[chatId] ?? [];
    const isHistoryLoading = state.chatHistoryLoadingByChatId[chatId];

    if (isHistoryLoading) {
      return false;
    }

    appStore.setState({
      chatHistoryLoadingByChatId: {
        ...state.chatHistoryLoadingByChatId,
        [chatId]: true,
      },
    });

    try {
      const history = await chatSocketService.requestHistory(
        currentMessages.length,
      );

      if (history.length > 0) {
        chatSocketService.appendMessages(chatId, history);
      }

      appStore.setState({
        chatHistoryLoadingByChatId: {
          ...appStore.getState().chatHistoryLoadingByChatId,
          [chatId]: false,
        },
        globalError: null,
      });

      return history.length > 0;
    } catch (error) {
      appStore.setState({
        chatHistoryLoadingByChatId: {
          ...appStore.getState().chatHistoryLoadingByChatId,
          [chatId]: false,
        },
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public disconnect() {
    chatSocketService.disconnect();
  }

  public resetSelectedChat() {
    this.disconnect();
    sessionStorage.removeItem(SELECTED_CHAT_STORAGE_KEY);
    appStore.setState({
      selectedChatId: null,
      selectedChatUsers: [],
    });
  }
}

export const chatsService = new ChatsService();
