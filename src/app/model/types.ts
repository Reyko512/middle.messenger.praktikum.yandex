import type { Chat, WSMessageData } from '@entities/chat';
import type { User } from '@entities/user';

export type SocketConnectionStatus =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'closed'
  | 'error';

export interface AppState {
  isAuthChecked: boolean;
  isAuthenticated: boolean;
  user: User | null;
  chats: Chat[];
  selectedChatId: number | null;
  selectedChatUsers: User[];
  messagesByChatId: Record<number, WSMessageData[]>;
  chatHistoryLoadingByChatId: Record<number, boolean>;
  socketStatusByChatId: Record<number, SocketConnectionStatus>;
  globalError: string | null;
  isChatsLoading: boolean;
}
