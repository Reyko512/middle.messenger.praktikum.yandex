import Component, {
  type ComponentProps,
} from '@shared/lib/components/Component';
import ChatsTemplate from './Chats.hbs';
import { CreateChatForm } from '@features/createChat';
import type { CreateChatFormValues } from '@features/createChat';
import { ChatParticipantForm } from '@features/chatParticipant';
import type { ChatParticipantSubmitPayload } from '@features/chatParticipant';
import { Search } from '@shared/ui/Search';
import { SendMessageForm } from '@features/sendMessage';
import type { SendMessageSubmitPayload } from '@features/sendMessage';
import type { WSMessageData } from '@entities/chat';
import { ChatInfoBar } from '@widgets/ChatInfobar';
import ChatFeed from '@widgets/ChatFeed/ChatFeed';
import { appStore } from '@app/model';
import type { AppState } from '@app/model';
import { chatsService } from '@features/chats';
import { buildAvatarURL } from '@entities/user';
import type { User } from '@entities/user';
import { ChatMessages } from '@widgets/ChatMessages';
import { normalizeError } from '@shared/lib/network/normalizeError';
import {
  MODAL_CHANGE_EVENT,
  closeModal,
  isModalActive,
  openModal,
} from '@shared/lib/location/modal';
import { ProfileModal } from '@widgets/ProfileModal';
import type { TemplateDelegate } from 'handlebars';

interface ChatsPageProps extends ComponentProps {
  chatClass: string;
  CreateChatForm: CreateChatForm;
  ChatParticipantForm: ChatParticipantForm;
  ProfileModal: ProfileModal;
  Search: Search;
  SendMessageForm: SendMessageForm;
  ChatInfoBar: ChatInfoBar;
  ChatFeed: ChatFeed;
  MessageList: ChatMessages;
  isChatSelected: boolean;
  isChatEmpty: boolean;
  isChatLoading: boolean;
  isChatSettingsOpen: boolean;
  isChatDeleteAvailable: boolean;
  isDeleteChatConfirmOpen: boolean;
}

const CHAT_SETTINGS_MODAL = 'chat-settings';

function formatTime(value: string | null | undefined) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getUserLabel(user: User | null | undefined) {
  if (!user) {
    return null;
  }

  return (
    user.display_name?.trim() ||
    user.first_name?.trim() ||
    user.login.trim()
  );
}

function buildSenderNamesById(
  users: AppState['selectedChatUsers'],
  currentUser: User | null,
) {
  const senderNamesById = users.reduce<Record<number, string>>(
    (acc, user) => {
      const label = getUserLabel(user);
      if (label) {
        acc[user.id] = label;
      }

      return acc;
    },
    {},
  );

  const currentUserLabel = getUserLabel(currentUser);
  if (currentUser && currentUserLabel) {
    senderNamesById[currentUser.id] = currentUserLabel;
  }

  return senderNamesById;
}

function isSameMessage(left: WSMessageData, right: WSMessageData) {
  if (left.id !== right.id) {
    return false;
  }

  return (
    left.chat_id === right.chat_id &&
    left.user_id === right.user_id &&
    left.type === right.type &&
    left.time === right.time &&
    left.content === right.content &&
    left.file?.path === right.file?.path &&
    left.file?.filename === right.file?.filename
  );
}

function areMessagesEqual(
  left: readonly WSMessageData[],
  right: readonly WSMessageData[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((message, index) => {
    const nextMessage = right[index];
    if (!nextMessage) {
      return false;
    }

    return isSameMessage(message, nextMessage);
  });
}

function areSenderNamesEqual(
  left: Record<number, string>,
  right: Record<number, string>,
) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);

  if (leftKeys.length !== rightKeys.length) {
    return false;
  }

  return leftKeys.every((key) => left[Number(key)] === right[Number(key)]);
}

function canDeleteSelectedChat(state: AppState) {
  const selectedChat =
    state.chats.find((chat) => chat.id === state.selectedChatId) ?? null;
  const currentChatMember =
    state.selectedChatUsers.find((user) => user.id === state.user?.id) ??
    null;

  return Boolean(
    selectedChat &&
    state.user &&
    (selectedChat.created_by === state.user.id ||
      currentChatMember?.role === 'admin'),
  );
}

export default class ChatsPage extends Component<ChatsPageProps> {
  private unsubscribe: (() => void) | null = null;
  private searchTimeoutId: number | null = null;
  private globalListenersController: AbortController | null = null;
  private isUnmounted = false;
  private lastSyncedChatId: number | null = null;
  private lastSyncedMessages: WSMessageData[] = [];
  private lastSyncedCurrentUserId: number | null = null;
  private lastSyncedSenderNamesById: Record<number, string> = {};

  private readonly locationChangeHandler = () => {
    this.syncChatSettingsState();
  };

  private readonly keyDownHandler = (event: KeyboardEvent) => {
    if (event.key !== 'Escape') {
      return;
    }

    if (this.props['isDeleteChatConfirmOpen'] as boolean) {
      this.closeDeleteChatConfirm();
      return;
    }

    if (isModalActive(CHAT_SETTINGS_MODAL)) {
      this.closeChatSettings();
    }
  };

  constructor() {
    let sendMessageForm: SendMessageForm | null = null;

    const handleSendMessage = async (
      payload: SendMessageSubmitPayload,
    ) => {
      sendMessageForm?.setProps({
        error: '',
      });

      try {
        if (payload.file) {
          await chatsService.sendFile(payload.file);
        }

        if (payload.message.trim()) {
          chatsService.sendMessage(payload.message);
        }
      } catch (error) {
        sendMessageForm?.setProps({
          error: normalizeError(error),
        });
        throw error;
      }
    };

    sendMessageForm = new SendMessageForm({
      error: '',
      onSubmit: handleSendMessage,
    });

    super('div', {
      attrs: {
        class: 'chats-page',
      },
      events: {
        click: (event: Event) => {
          const target = event.target as HTMLElement;

          if (target.closest('[data-role="chat-settings-close"]')) {
            this.closeChatSettings();
            return;
          }

          if (target.closest('[data-role="chat-settings-delete"]')) {
            this.openDeleteChatConfirm();
            return;
          }

          if (
            target.closest('[data-role="chat-delete-close"]') ||
            target.closest('[data-role="chat-delete-cancel"]')
          ) {
            this.closeDeleteChatConfirm();
            return;
          }

          if (target.closest('[data-role="chat-delete-confirm"]')) {
            void this.deleteSelectedChat();
            return;
          }

          if (target.matches('[data-role="chat-delete-backdrop"]')) {
            this.closeDeleteChatConfirm();
            return;
          }

          if (target.matches('[data-role="chat-settings-backdrop"]')) {
            this.closeChatSettings();
          }
        },
      },
      CreateChatForm: new CreateChatForm({
        error: '',
        onSubmit: async (payload) => {
          await this.handleCreateChatSubmit(payload);
        },
      }),
      ChatParticipantForm: new ChatParticipantForm({
        error: '',
        onSubmit: async (payload) => {
          await this.handleChatParticipantSubmit(payload);
        },
      }),
      ProfileModal: new ProfileModal(),
      Search: new Search({
        placeholder: 'Search chats',
        events: {
          input: (event: Event) => {
            const input = event.target as HTMLInputElement;
            this.searchChats(input.value);
          },
        },
      }),
      SendMessageForm: sendMessageForm,
      ChatInfoBar: new ChatInfoBar({
        name: '',
        avatarUrl: null,
        usersCount: 0,
        isSettingsOpen: false,
        onSettingsToggle: () => {
          this.toggleChatSettings();
        },
      }),
      ChatFeed: new ChatFeed({
        chats: [],
        selectedChatId: null,
        onSelect: () => undefined,
      }),
      MessageList: new ChatMessages({
        messages: [],
        currentUserId: null,
        senderNamesById: {},
        onLoadMore: () => {
          const selectedChatId = appStore.getState().selectedChatId;
          if (!selectedChatId) {
            return false;
          }

          return chatsService.loadMoreMessages(selectedChatId);
        },
      }),
      chatClass: 'chat chat_empty',
      isChatSelected: false,
      isChatEmpty: false,
      isChatLoading: false,
      isChatSettingsOpen: false,
      isChatDeleteAvailable: false,
      isDeleteChatConfirmOpen: false,
    });
  }

  private attachGlobalListeners() {
    this.detachGlobalListeners();

    const controller = new AbortController();
    const { signal } = controller;
    this.globalListenersController = controller;

    window.addEventListener('popstate', this.locationChangeHandler, {
      signal,
    });
    window.addEventListener(
      MODAL_CHANGE_EVENT,
      this.locationChangeHandler,
      {
        signal,
      },
    );
    window.addEventListener('keydown', this.keyDownHandler, {
      signal,
    });
  }

  private detachGlobalListeners() {
    this.globalListenersController?.abort();
    this.globalListenersController = null;
  }

  public override beforeMount() {
    if (this.isUnmounted) {
      return;
    }

    this.syncState(appStore.getState());
    this.syncChatSettingsState();
    this.attachGlobalListeners();
    this.unsubscribe = appStore.subscribe((state) => {
      this.syncState(state);
    });
  }

  public override componentDidMount() {
    if (this.isUnmounted) {
      return;
    }

    void chatsService.loadChats();
  }

  public override beforeComponentUnmount() {
    this.isUnmounted = true;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.detachGlobalListeners();

    if (this.searchTimeoutId !== null) {
      window.clearTimeout(this.searchTimeoutId);
      this.searchTimeoutId = null;
    }
  }

  private searchChats(query: string) {
    if (this.searchTimeoutId !== null) {
      window.clearTimeout(this.searchTimeoutId);
    }

    this.searchTimeoutId = window.setTimeout(() => {
      void chatsService.loadChats(query);
    }, 250);
  }

  private toggleChatSettings() {
    const selectedChatId = appStore.getState().selectedChatId;
    if (!selectedChatId) {
      return;
    }

    if (isModalActive(CHAT_SETTINGS_MODAL)) {
      this.closeChatSettings();
      return;
    }

    openModal(CHAT_SETTINGS_MODAL);
    this.syncChatSettingsState();
  }

  private openDeleteChatConfirm() {
    if (!(this.props['isChatDeleteAvailable'] as boolean)) {
      return;
    }

    this.setProps({
      isDeleteChatConfirmOpen: true,
    });
  }

  private closeDeleteChatConfirm() {
    if (!(this.props['isDeleteChatConfirmOpen'] as boolean)) {
      return;
    }

    this.setProps({
      isDeleteChatConfirmOpen: false,
    });
  }

  private closeChatSettings() {
    this.closeDeleteChatConfirm();
    closeModal(CHAT_SETTINGS_MODAL);
  }

  private syncChatSettingsState() {
    const hasSelectedChat = Boolean(appStore.getState().selectedChatId);
    const isOpen = hasSelectedChat && isModalActive(CHAT_SETTINGS_MODAL);
    const infoBar = this.children['ChatInfoBar'] as
      | ChatInfoBar
      | undefined;

    if (infoBar) {
      infoBar.setProps({
        isSettingsOpen: isOpen,
      });
    }

    const patch: Partial<ChatsPageProps> = {};

    if ((this.props['isChatSettingsOpen'] as boolean) !== isOpen) {
      patch.isChatSettingsOpen = isOpen;
    }

    if (!isOpen && (this.props['isDeleteChatConfirmOpen'] as boolean)) {
      patch.isDeleteChatConfirmOpen = false;
    }

    if (Object.keys(patch).length > 0) {
      this.setProps(patch);
    }
  }

  private clearCreateChatError() {
    const createChatForm = this.children['CreateChatForm'] as
      | CreateChatForm
      | undefined;
    createChatForm?.setProps({
      error: '',
    });
  }

  private setCreateChatError(errorMessage: string) {
    const createChatForm = this.children['CreateChatForm'] as
      | CreateChatForm
      | undefined;
    createChatForm?.setProps({
      error: errorMessage,
    });
  }

  private async handleCreateChatSubmit(payload: CreateChatFormValues) {
    try {
      await chatsService.createChat(payload.title);
      this.clearCreateChatError();
    } catch (error) {
      this.setCreateChatError(normalizeError(error));
      appStore.setState({
        globalError: null,
      });
    }
  }

  private setChatParticipantError(errorMessage: string) {
    const chatParticipantForm = this.children['ChatParticipantForm'] as
      | ChatParticipantForm
      | undefined;
    chatParticipantForm?.setProps({
      error: errorMessage,
    });
  }

  private async handleChatParticipantSubmit(
    payload: ChatParticipantSubmitPayload,
  ) {
    try {
      this.setChatParticipantError('');
      await chatsService.updateChatParticipant(
        payload.action,
        payload.login,
      );
      this.closeChatSettings();
    } catch (error) {
      this.setChatParticipantError(normalizeError(error));
      throw error;
    }
  }

  private async deleteSelectedChat() {
    if (!(this.props['isChatDeleteAvailable'] as boolean)) {
      return;
    }

    try {
      await chatsService.deleteSelectedChat();
      appStore.setState({
        globalError: null,
      });
      this.closeChatSettings();
    } catch (error) {
      appStore.setState({
        globalError: normalizeError(error),
      });
    }
  }

  private syncState(state: AppState) {
    const chatFeed = this.children['ChatFeed'] as ChatFeed;
    const messageList = this.children['MessageList'] as ChatMessages;
    const infoBar = this.children['ChatInfoBar'] as ChatInfoBar;

    chatFeed.setChats(
      state.chats.map((chat) => ({
        id: chat.id,
        name: chat.title,
        time: formatTime(chat.last_message?.time),
        lastMessage: chat.last_message?.content ?? null,
        counter: chat.unread_count || null,
        avatarUrl: buildAvatarURL(chat.avatar),
        isActive: chat.id === state.selectedChatId,
      })),
      state.selectedChatId,
      (chatId: number) => {
        void chatsService.selectChat(chatId);
      },
    );

    const selectedChat =
      state.chats.find((chat) => chat.id === state.selectedChatId) ?? null;
    const selectedMessages = state.selectedChatId
      ? (state.messagesByChatId[state.selectedChatId] ?? [])
      : [];
    const nextSenderNamesById = buildSenderNamesById(
      state.selectedChatUsers,
      state.user,
    );
    console.log(
      '[ChatsPage] Syncing state. Messages in selected chat:',
      selectedMessages.length,
    );

    this.syncChatSettingsState();
    const isChatSettingsOpen = this.props['isChatSettingsOpen'] as boolean;

    infoBar.setInfo(
      selectedChat?.title ?? '',
      buildAvatarURL(selectedChat?.avatar ?? null),
      state.selectedChatUsers.length,
      isChatSettingsOpen,
    );

    const currentUserId = state.user?.id ?? null;
    const shouldSyncMessages =
      this.lastSyncedChatId !== state.selectedChatId ||
      this.lastSyncedCurrentUserId !== currentUserId ||
      !areMessagesEqual(this.lastSyncedMessages, selectedMessages) ||
      !areSenderNamesEqual(this.lastSyncedSenderNamesById, nextSenderNamesById);

    if (shouldSyncMessages) {
      messageList.setMessages(
        selectedMessages,
        currentUserId,
        nextSenderNamesById,
      );
      this.lastSyncedChatId = state.selectedChatId;
      this.lastSyncedCurrentUserId = currentUserId;
      this.lastSyncedMessages = [...selectedMessages];
      this.lastSyncedSenderNamesById = { ...nextSenderNamesById };
    }

    const nextChatClass = selectedChat ? 'chat' : 'chat chat_empty';
    const nextIsChatSelected = Boolean(selectedChat);
    const nextIsChatLoading = Boolean(
      state.selectedChatId &&
      selectedMessages.length === 0 &&
      state.chatHistoryLoadingByChatId[state.selectedChatId],
    );
    const nextIsChatEmpty =
      nextIsChatSelected &&
      !nextIsChatLoading &&
      selectedMessages.length === 0;
    const nextIsChatDeleteAvailable = canDeleteSelectedChat(state);

    const patch: Partial<ChatsPageProps> = {};

    if ((this.props['chatClass'] as string) !== nextChatClass) {
      patch.chatClass = nextChatClass;
    }

    if ((this.props['isChatSelected'] as boolean) !== nextIsChatSelected) {
      patch.isChatSelected = nextIsChatSelected;
    }

    if ((this.props['isChatLoading'] as boolean) !== nextIsChatLoading) {
      patch.isChatLoading = nextIsChatLoading;
    }

    if ((this.props['isChatEmpty'] as boolean) !== nextIsChatEmpty) {
      patch.isChatEmpty = nextIsChatEmpty;
    }

    if (
      (this.props['isChatDeleteAvailable'] as boolean) !==
      nextIsChatDeleteAvailable
    ) {
      patch.isChatDeleteAvailable = nextIsChatDeleteAvailable;
    }

    if (
      (!nextIsChatDeleteAvailable || !nextIsChatSelected) &&
      (this.props['isDeleteChatConfirmOpen'] as boolean)
    ) {
      patch.isDeleteChatConfirmOpen = false;
    }

    if (Object.keys(patch).length > 0) {
      this.setProps(patch);
    }
  }

  public override render(): TemplateDelegate {
    return ChatsTemplate;
  }
}
