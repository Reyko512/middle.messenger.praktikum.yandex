import { HTTPTransport } from '@shared/lib/http';
import { API_BASE } from '@shared/config/api';
import type {
  Chat,
  ChatTokenResponse,
  CreateChatRequest,
  CreateChatResponse,
  DeleteChatRequest,
  UpdateChatUsersRequest,
} from '../model/types';
import type { User } from '@entities/user';

interface ChatsQuery {
  offset?: number;
  limit?: number;
  title?: string;
}

class ChatsApi {
  private readonly http = new HTTPTransport(`${API_BASE}/chats`);

  public readChats(query: ChatsQuery = {}) {
    return this.http.get<Chat[], ChatsQuery>('/', { data: query });
  }

  public createChat(data: CreateChatRequest) {
    return this.http.post<CreateChatResponse, CreateChatRequest>('/', {
      data,
    });
  }

  public deleteChat(data: DeleteChatRequest) {
    return this.http.delete<void, DeleteChatRequest>('/', { data });
  }

  public addUsers(data: UpdateChatUsersRequest) {
    return this.http.put<void, UpdateChatUsersRequest>('/users', {
      data,
    });
  }

  public removeUsers(data: UpdateChatUsersRequest) {
    return this.http.delete<void, UpdateChatUsersRequest>('/users', {
      data,
    });
  }

  public readChatUsers(chatId: number) {
    return this.http.get<User[]>(`/${chatId}/users`);
  }

  public createToken(chatId: number) {
    return this.http.post<ChatTokenResponse>(`/token/${chatId}`);
  }
}

export const chatsApi = new ChatsApi();
