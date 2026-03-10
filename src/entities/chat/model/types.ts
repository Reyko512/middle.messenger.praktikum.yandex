import type { User } from '@entities/user';

export interface LastMessage {
  user: User;
  time: string;
  content: string;
}

export interface Chat {
  id: number;
  title: string;
  avatar: string | null;
  unread_count: number;
  created_by: number;
  last_message: LastMessage | null;
}

export interface CreateChatRequest {
  title: string;
}

export interface CreateChatResponse {
  id: number;
}

export interface DeleteChatRequest {
  chatId: number;
}

export interface UpdateChatUsersRequest {
  users: number[];
  chatId: number;
}

export interface ChatTokenResponse {
  token: string;
}

export interface ChatFileResource {
  id: number;
  user_id: number;
  path: string;
  filename: string;
  content_type: string;
  content_size: number;
  upload_date: string;
}

export interface WSMessageRequest {
  content: string;
  type: 'message' | 'file' | 'get old';
}

export interface WSMessageData {
  id: number;
  chat_id: number;
  type: 'message' | 'file' | 'sticker' | 'user connected';
  time: string;
  user_id: number;
  content: string | number;
  file?: ChatFileResource;
}
