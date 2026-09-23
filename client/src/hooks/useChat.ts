import { useCallback, useEffect, useRef, useState } from 'react';
import { chatApi } from '@/api/chat';
import type { ChatMessage } from '@/types/chat';
import type { NormalizedError } from '@/types/api';

function uid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;

    chatApi
      .history(50)
      .then((items) => {
        if (abortRef.current) return;
        setMessages(
          (items || []).map((m) => ({
            id: uid(),
            role: m.role,
            content: m.content,
            ts: m.ts,
          }))
        );
      })
      .catch(() => {})
      .finally(() => {
        if (!abortRef.current) setHistoryLoaded(true);
      });

    return () => {
      abortRef.current = true;
    };
  }, []);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      setError(null);

      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: trimmed,
        ts: new Date().toISOString(),
      };

      const pendingMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: '',
        ts: new Date().toISOString(),
        pending: true,
      };

      setMessages((prev) => [...prev, userMsg, pendingMsg]);
      setLoading(true);

      try {
        const result = await chatApi.message(trimmed);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingMsg.id
              ? { ...m, content: result.reply, pending: false }
              : m
          )
        );
      } catch (e) {
        const err = e as NormalizedError;
        setError(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === pendingMsg.id
              ? {
                  ...m,
                  content: err.message || 'Failed to get a response.',
                  pending: false,
                  error: true,
                }
              : m
          )
        );
      } finally {
        setLoading(false);
      }
    },
    [loading]
  );

  const clear = useCallback(async () => {
    try {
      await chatApi.clear();
      setMessages([]);
      setError(null);
    } catch (e) {
      setError(e as NormalizedError);
    }
  }, []);

  return { messages, loading, historyLoaded, error, send, clear };
}