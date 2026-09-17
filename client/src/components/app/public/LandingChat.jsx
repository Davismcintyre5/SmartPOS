import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Trash2, Sparkles } from 'lucide-react';
import api from '../../../api/axios';
import { useSite } from '../../../context/SiteContext';

const GREETING = {
  role: 'assistant',
  content: "Hi! I'm the SmartPOS assistant. Ask me anything about our POS, pricing, or getting started."
};

const SUGGESTIONS = [
  'How much does Starter cost?',
  'Does it work offline?',
  'How do I get started?',
  'What payment methods do you support?'
];

export default function LandingChat() {
  const { site } = useSite();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const bodyRef = useRef(null);
  const inputRef = useRef(null);

  const enabled = site?.ai?.features?.landingAi === true;
  const showSuggestions = messages.length <= 1 && !loading;

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 200);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const sendMessage = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || loading) return;

    const next = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/landing', {
        messages: next.slice(-10)
      });
      const reply = res.data?.data?.reply || 'Sorry, I could not respond.';
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: err?.message || 'Something went wrong.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleClear = () => {
    if (messages.length <= 1) return;
    if (!window.confirm('Clear this conversation?')) return;
    setMessages([GREETING]);
    setInput('');
  };

  if (!enabled) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--accent)] text-[var(--accent-fg)] shadow-lg flex items-center justify-center hover:bg-[var(--accent-hover)] transition-colors"
          aria-label="Open chat"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      )}

      {open && (
        <div
          className="fixed z-40 flex flex-col bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] shadow-2xl overflow-hidden
            inset-x-3 bottom-3 top-24
            sm:inset-x-auto sm:right-6 sm:bottom-6 sm:top-auto
            sm:w-80 sm:h-[22rem]
            md:w-96 md:h-[26rem]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-[var(--accent)] text-[var(--accent-fg)] shrink-0">
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">SmartPOS Assistant</p>
              <p className="text-[11px] opacity-80">Powered by AI</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleClear}
                disabled={messages.length <= 1}
                className="p-1.5 rounded hover:bg-white/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Clear conversation"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={bodyRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-[var(--radius)] text-[13px] leading-relaxed whitespace-pre-wrap break-words ${
                    m.role === 'user'
                      ? 'bg-[var(--accent)] text-[var(--accent-fg)]'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-primary)]'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Suggestions */}
            {showSuggestions && (
              <div className="pt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] mb-2 px-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Try asking</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      disabled={loading}
                      className="text-left text-[12px] px-3 py-2 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[var(--bg-secondary)] px-3 py-2 rounded-[var(--radius)] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--text-muted)]" />
                  <span className="text-[11px] text-[var(--text-muted)]">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-[var(--border-color)] p-2.5 flex gap-2 shrink-0 bg-[var(--card-bg)]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question…"
              disabled={loading}
              className="flex-1 min-w-0 px-3 py-2 rounded-[var(--radius)] border border-[var(--border-color)] bg-[var(--input-bg)] text-[var(--text-primary)] text-[13px] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent disabled:opacity-60"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="px-3 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 flex items-center justify-center"
              aria-label="Send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}