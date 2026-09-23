import { useEffect, useRef, useState } from 'react';
import { MessageCircle, Send, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { publicChatApi } from '@/api/publicChat';
import { useSite } from '@/hooks/useSite';
import { cn } from '@/utils/classNames';
import type { NormalizedError } from '@/types/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
}

const SUGGESTIONS = [
  'How much does it cost?',
  'Do you support M-Pesa?',
  'Can I use it offline?',
  'How do I get started?',
];

export function PublicChatWidget() {
  const { aiFeatures, loading } = useSite();

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, sending]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (loading) return null;
  if (!aiFeatures.landingAi) return null;

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    setInput('');
    setError(null);
    setMessages((prev) => [
      ...prev,
      { role: 'user', content: trimmed, ts: new Date().toISOString() },
    ]);
    setSending(true);

    try {
      const result = await publicChatApi.message(trimmed);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: result.reply, ts: new Date().toISOString() },
      ]);
    } catch (e) {
      const err = e as NormalizedError;
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  const clearConversation = () => {
    setMessages([]);
    setError(null);
    setConfirmClear(false);
  };

  return (
    <>
      {open ? (
        <div className="fixed bottom-24 right-4 z-40 flex h-[420px] w-[340px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-xl border border-primary/30 bg-primary text-primary-foreground shadow-2xl animate-fade-in sm:right-6">
          <div className="flex items-center justify-between gap-2 border-b border-primary-foreground/15 px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">SmartPOS Assistant</p>
                <p className="text-[10px] text-primary-foreground/70">Powered by AI</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setConfirmClear(true)}
                  aria-label="Delete conversation"
                  className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              ) : null}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
            {messages.length === 0 ? (
              <div className="space-y-3">
                <div className="rounded-lg bg-primary-foreground/10 p-3 text-sm">
                  Hi 👋 I&apos;m the SmartPOS assistant. Ask me anything about pricing,
                  features, or getting started.
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-primary-foreground/70">
                    Try asking
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => send(s)}
                        className="rounded-full border border-primary-foreground/25 bg-primary-foreground/5 px-2.5 py-1 text-xs text-primary-foreground/90 transition-colors hover:bg-primary-foreground/15"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[85%] rounded-lg px-3 py-2 text-sm',
                  m.role === 'user'
                    ? 'ml-auto bg-primary-foreground text-primary'
                    : 'bg-primary-foreground/10 text-primary-foreground'
                )}
              >
                {m.content}
              </div>
            ))}

            {sending ? (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-foreground/70 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-foreground/70 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary-foreground/70" />
              </div>
            ) : null}

            {error ? (
              <div className="rounded-lg border border-destructive bg-destructive/20 px-3 py-2 text-xs text-primary-foreground">
                {error}
              </div>
            ) : null}
          </div>

          <div className="border-t border-primary-foreground/15 p-3">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                placeholder="Type a message…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                disabled={sending}
                className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 focus-visible:ring-primary-foreground/40"
              />
              <Button
                size="icon"
                onClick={() => send(input)}
                disabled={sending || !input.trim()}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {confirmClear ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmClear(false)}
          />
          <div className="relative z-10 w-full max-w-xs rounded-xl border border-border bg-card p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground">
              Delete conversation?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              This will remove all messages in this chat. This can&apos;t be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={clearConversation}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:right-6"
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>
    </>
  );
}