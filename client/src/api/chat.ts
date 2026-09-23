import { api } from './axios';
import type { ChatMessage, ChatResponse } from '@/types/insight';

export interface ChatHistoryResponse {
  messages: ChatMessage[];
}

export const chatApi = {
  message: (text: string) =>
    api
      .post<{ data: ChatResponse }>('/client/chat/message', { text })
      .then((r) => r.data.data),

  history: (limit = 50) =>
    api
      .get<{ data: ChatMessage[] }>('/client/chat/history', {
        params: { limit },
      })
      .then((r) => r.data.data),

  clear: () => api.delete('/client/chat/history').then((r) => r.data),
};