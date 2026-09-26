import { api } from './axios';
import type { ChatHistoryItem } from '@/types/chat';

export interface ChatReply {
  reply: string;
  tokensUsed: number;
}

export const chatApi = {
  message: (text: string) =>
    api
      .post<{ data: ChatReply }>('/client/chat/message', { text })
      .then((r) => r.data.data),

  history: (limit = 50) =>
    api
      .get<{ data: ChatHistoryItem[] }>('/client/chat/history', { params: { limit } })
      .then((r) => r.data.data),

  clear: () => api.delete('/client/chat/history').then((r) => r.data),
};