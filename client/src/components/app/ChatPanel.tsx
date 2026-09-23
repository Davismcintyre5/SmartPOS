import { useEffect, useRef, useState } from 'react';
import { Send, Trash2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { ChatMessage } from './ChatMessage';
import { ChatSuggestions } from './ChatSuggestions';
import { useChat } from '@/hooks/useChat';

export function ChatPanel() {
  const { messages, loading, historyLoaded, send, clear } = useChat();
  const [input, setInput] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (historyLoaded) inputRef.current?.focus();
  }, [historyLoaded]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = async () => {
    await clear();
    setConfirmClear(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <h1 className="text-sm font-semibold text-foreground">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">
              Ask about sales, stock, or customers
            </p>
          </div>
        </div>

        {messages.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmClear(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Clear
          </Button>
        ) : null}
      </div>

      {/* Body */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
        {!historyLoaded ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : messages.length === 0 ? (
          <ChatSuggestions onPick={(text) => send(text)} />
        ) : (
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            rows={1}
            placeholder="Ask about your business…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="max-h-40 min-h-[44px] flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            style={{ height: 'auto' }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
            }}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            aria-label="Send"
            className="h-11 w-11 shrink-0"
          >
            {loading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mx-auto mt-2 max-w-3xl text-[10px] text-muted-foreground">
          Shift + Enter for a new line. AI can make mistakes — verify important details.
        </p>
      </div>

      {/* Confirm clear */}
      {confirmClear ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmClear(false)}
          />
          <div className="relative z-10 w-full max-w-xs rounded-xl border border-border bg-card p-5 shadow-2xl">
            <h3 className="text-sm font-semibold text-foreground">
              Clear conversation?
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              This removes all messages from your history. This can&apos;t be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleClear}>
                Clear
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}