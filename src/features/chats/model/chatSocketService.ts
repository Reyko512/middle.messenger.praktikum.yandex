import { chatsApi } from '@entities/chat';
import type { WSMessageData, WSMessageRequest } from '@entities/chat';
import { WS_CHATS_BASE } from '@shared/config/api';
import { mergeSort } from '@shared/lib/algorithms/mergeSort';
import { normalizeError } from '@shared/lib/network/normalizeError';
import Queue from '@shared/lib/structures/Queue';
import { appStore } from '@app/model';
import type { SocketConnectionStatus } from '@app/model';

function isWSMessageData(value: unknown): value is WSMessageData {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const content = (value as { content?: unknown }).content;

  return (
    'chat_id' in value &&
    'content' in value &&
    'time' in value &&
    'type' in value &&
    'user_id' in value &&
    typeof value.chat_id === 'number' &&
    (typeof content === 'string' || typeof content === 'number') &&
    typeof value.time === 'string' &&
    typeof value.type === 'string' &&
    typeof value.user_id === 'number'
  );
}

function messageComparator(left: WSMessageData, right: WSMessageData) {
  return new Date(left.time).getTime() - new Date(right.time).getTime();
}

function isRenderableMessage(message: WSMessageData) {
  return message.type === 'message' || message.type === 'file';
}

function sortMessagesByTime(messages: readonly WSMessageData[]) {
  return mergeSort([...messages], messageComparator);
}

function makeMessageKey(message: WSMessageData) {
  if (typeof message.id === 'number' && Number.isFinite(message.id)) {
    return String(message.id);
  }

  return `${message.time}:${String(message.content)}`;
}

function mergeMessages(
  existing: readonly WSMessageData[],
  incoming: readonly WSMessageData[],
) {
  const map = new Map<string, WSMessageData>();

  for (const message of existing) {
    map.set(makeMessageKey(message), message);
  }

  for (const message of incoming) {
    map.set(makeMessageKey(message), message);
  }

  return mergeSort([...map.values()], messageComparator);
}

class ChatSocketService {
  private socket: WebSocket | null = null;
  private activeChatId: number | null = null;
  private pendingMessages = new Queue<WSMessageRequest>();
  private pendingHistoryRequest:
    | {
        chatId: number;
        promise: Promise<WSMessageData[]>;
        reject: (error: Error) => void;
        resolve: (messages: WSMessageData[]) => void;
      }
    | null = null;

  private setSocketStatus(
    chatId: number,
    status: SocketConnectionStatus,
  ) {
    const state = appStore.getState();
    appStore.setState({
      socketStatusByChatId: {
        ...state.socketStatusByChatId,
        [chatId]: status,
      },
    });
  }

  private setHistoryLoading(chatId: number, isLoading: boolean) {
    const state = appStore.getState();
    appStore.setState({
      chatHistoryLoadingByChatId: {
        ...state.chatHistoryLoadingByChatId,
        [chatId]: isLoading,
      },
    });
  }

  private setMessages(chatId: number, messages: WSMessageData[]) {
    const state = appStore.getState();
    const nextMessages = [...messages];
    const nextMessagesByChatId = {
      ...state.messagesByChatId,
      [chatId]: [...nextMessages],
    };

    if (chatId === state.selectedChatId) {
      appStore.setState({
        messagesByChatId: {
          ...nextMessagesByChatId,
        },
      });
      return;
    }

    appStore.setState({
      messagesByChatId: nextMessagesByChatId,
    });
  }

  public appendMessages(chatId: number, incoming: WSMessageData[]) {
    const state = appStore.getState();
    const currentMessages = [...(state.messagesByChatId[chatId] ?? [])];
    const newMergedMessages = mergeMessages(currentMessages, incoming);
    this.setMessages(chatId, [...newMergedMessages]);
  }

  private rejectPendingHistoryRequest(error: Error) {
    if (!this.pendingHistoryRequest) {
      return;
    }

    const { reject } = this.pendingHistoryRequest;
    this.pendingHistoryRequest = null;
    reject(error);
  }

  private flushQueue() {
    while (!this.pendingMessages.isEmpty()) {
      const payload = this.pendingMessages.dequeue();
      if (payload) {
        this.sendRaw(payload);
      }
    }
  }

  private sendRaw(payload: WSMessageRequest) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      return;
    }

    this.socket.send(JSON.stringify(payload));
  }

  public requestHistory(offset = 0): Promise<WSMessageData[]> {
    if (!this.activeChatId) {
      throw new Error('Chat is not selected');
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    if (
      this.pendingHistoryRequest &&
      this.pendingHistoryRequest.chatId === this.activeChatId
    ) {
      return this.pendingHistoryRequest.promise;
    }

    let resolveHistory!: (messages: WSMessageData[]) => void;
    let rejectHistory!: (error: Error) => void;

    const promise = new Promise<WSMessageData[]>((resolve, reject) => {
      resolveHistory = resolve;
      rejectHistory = reject;
    });

    this.pendingHistoryRequest = {
      chatId: this.activeChatId,
      promise,
      reject: rejectHistory,
      resolve: resolveHistory,
    };

    this.sendRaw({
      type: 'get old',
      content: String(offset),
    });

    return promise;
  }

  public async connect(userId: number, chatId: number) {
    if (
      this.activeChatId === chatId &&
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      return;
    }

    this.disconnect();
    this.activeChatId = chatId;
    this.setSocketStatus(chatId, 'connecting');

    try {
      const { token } = await chatsApi.createToken(chatId);
      const ws = new WebSocket(
        `${WS_CHATS_BASE}/${userId}/${chatId}/${token}`,
      );

      this.socket = ws;

      ws.addEventListener('open', () => {
        this.setSocketStatus(chatId, 'open');
        this.flushQueue();
        void this.requestHistory(0)
          .then((history) => {
            this.appendMessages(chatId, history);
            this.setHistoryLoading(chatId, false);
          })
          .catch((error) => {
            this.setHistoryLoading(chatId, false);
            appStore.setState({
              globalError: normalizeError(error),
            });
          });
      });

      ws.addEventListener('message', (event) => {
        if (!this.activeChatId) {
          return;
        }

        try {
          const payload = JSON.parse(event.data as string) as unknown;
          const activeChatId = this.activeChatId;

          if (Array.isArray(payload)) {
            const history = sortMessagesByTime(
              payload.filter(isWSMessageData).filter(isRenderableMessage),
            );
            if (
              this.pendingHistoryRequest &&
              this.pendingHistoryRequest.chatId === activeChatId
            ) {
              const { resolve } = this.pendingHistoryRequest;
              this.pendingHistoryRequest = null;
              resolve(history);
            } else {
              this.appendMessages(activeChatId, history);
            }
            this.setHistoryLoading(chatId, false);
            return;
          }

          if (!payload || typeof payload !== 'object') {
            return;
          }

          const normalizedPayload = {
            ...payload,
            chat_id:
              typeof (payload as { chat_id?: unknown }).chat_id === 'number'
                ? (payload as { chat_id: number }).chat_id
                : activeChatId,
          };

          if (!isWSMessageData(normalizedPayload)) {
            return;
          }

          if (!isRenderableMessage(normalizedPayload)) {
            return;
          }

          const currentMessages =
            appStore.getState().messagesByChatId[activeChatId] ?? [];
          const incomingMessageKey = makeMessageKey(normalizedPayload);
          const isDuplicate = currentMessages.some((message) => {
            if (
              typeof normalizedPayload.id === 'number' &&
              Number.isFinite(normalizedPayload.id) &&
              typeof message.id === 'number' &&
              Number.isFinite(message.id)
            ) {
              return message.id === normalizedPayload.id;
            }

            return makeMessageKey(message) === incomingMessageKey;
          });

          if (isDuplicate) {
            return;
          }

          this.appendMessages(activeChatId, [normalizedPayload]);
        } catch (error) {
          appStore.setState({
            globalError: normalizeError(error),
          });
        }
      });

      ws.addEventListener('close', () => {
        this.rejectPendingHistoryRequest(new Error('WebSocket connection closed'));
        this.setSocketStatus(chatId, 'closed');
        this.setHistoryLoading(chatId, false);
      });

      ws.addEventListener('error', () => {
        this.rejectPendingHistoryRequest(new Error('WebSocket connection error'));
        this.setSocketStatus(chatId, 'error');
        this.setHistoryLoading(chatId, false);
        appStore.setState({
          globalError: 'WebSocket connection error',
        });
      });
    } catch (error) {
      this.setSocketStatus(chatId, 'error');
      this.setHistoryLoading(chatId, false);
      appStore.setState({
        globalError: normalizeError(error),
      });
      throw error;
    }
  }

  public sendMessage(content: string) {
    if (!this.activeChatId) {
      throw new Error('Chat is not selected');
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.pendingMessages.enqueue({
        type: 'message',
        content,
      });
      return;
    }

    this.sendRaw({
      type: 'message',
      content,
    });
  }

  public sendFile(resourceId: string) {
    if (!this.activeChatId) {
      throw new Error('Chat is not selected');
    }

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.pendingMessages.enqueue({
        type: 'file',
        content: resourceId,
      });
      return;
    }

    this.sendRaw({
      type: 'file',
      content: resourceId,
    });
  }

  public disconnect() {
    if (this.socket) {
      this.rejectPendingHistoryRequest(new Error('WebSocket disconnected'));
      this.socket.close();
      this.socket = null;
    }

    if (this.activeChatId !== null) {
      this.setSocketStatus(this.activeChatId, 'closed');
      this.setHistoryLoading(this.activeChatId, false);
    }

    this.activeChatId = null;
    this.pendingMessages.clear();
  }
}

export const chatSocketService = new ChatSocketService();
