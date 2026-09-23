export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: string;
  pending?: boolean;
  error?: boolean;
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}