import { api } from './axios';

export interface PublicChatResponse {
  reply: string;
  tokensUsed: number;
}

export const publicChatApi = {
  message: (text: string) =>
    api
      .post<{ data: PublicChatResponse }>('/public/chat/message', { text })
      .then((r) => r.data.data),
};