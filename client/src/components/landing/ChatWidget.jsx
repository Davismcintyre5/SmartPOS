// ChatWidget
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Trash2, Sparkles } from "lucide-react";
import { landingApi } from "../../api/landingApi";

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState(null);
  const [checked, setChecked] = useState(false);
  const bottomRef = useRef(null);

  // Suggested questions
  const suggestions = [
    { text: "💰 Pricing plans", query: "What are the pricing plans for SmartPOS?" },
    { text: "🎁 Free trial", query: "Is there a free trial available?" },
    { text: "⚡ Features", query: "What features does SmartPOS offer?" },
    { text: "💳 Payment methods", query: "What payment methods does SmartPOS support?" },
    { text: "📱 Mobile app", query: "Is there a mobile app for SmartPOS?" },
    { text: "🔒 Security", query: "How secure is my data with SmartPOS?" },
    { text: "🛠️ Support", query: "What support options are available?" },
    { text: "🌍 Offline mode", query: "Does SmartPOS work offline?" },
  ];

  useEffect(() => {
    // Fetch both AI status and config
    Promise.all([
      landingApi.getAIStatus(),
      landingApi.getChatbotConfig?.() || Promise.resolve({ data: null })
    ]).then(([statusRes, configRes]) => {
      if (statusRes.success) {
        setEnabled(statusRes.landingEnabled);
        if (statusRes.landingEnabled) {
          // Set config if available
          if (configRes?.data?.data) {
            setConfig(configRes.data.data);
            setMessages([{ role: "ai", text: configRes.data.data.welcomeMessage || "Hi! How can I help you?" }]);
          } else {
            setMessages([{ role: "ai", text: "Hi! 👋 I'm your SmartPOS assistant. How can I help you today?" }]);
          }
        }
      }
    }).finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const clearChat = () => {
    setMessages([{ 
      role: "ai", 
      text: config?.welcomeMessage || "Hi! 👋 I'm your SmartPOS assistant. How can I help you today?" 
    }]);
  };

  const handleSuggestionClick = (query) => {
    setInput(query);
    // Auto-send after a short delay
    setTimeout(() => {
      sendMessage(query);
    }, 100);
  };

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
    setInput("");
    setLoading(true);
    try {
      const res = await landingApi.chat({ message: messageText });
      const reply = res.data?.reply || res.data?.data?.reply || "Sorry, I couldn't process that. Please try again.";
      setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, { role: "ai", text: "Something went wrong. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  const send = async () => {
    await sendMessage(input);
  };

  if (!checked || !enabled) return null;

  // Use blue color (#3B82F6) as default
  const botColor = config?.color || '#3B82F6';
  const botName = config?.botName || 'SmartPOS AI';
  const showSuggestions = messages.length === 1; // Show suggestions only on first message

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {open && (
        <div className="w-[calc(100vw-2rem)] sm:w-96 h-[480px] sm:h-[384px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col mb-2 sm:mb-3 overflow-hidden">
          {/* Header */}
          <div 
            className="flex items-center justify-between px-4 py-3 text-white flex-shrink-0"
            style={{ backgroundColor: botColor }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold text-sm">{botName}</span>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <button 
                  onClick={clearChat} 
                  title="Clear chat"
                  className="text-white/80 hover:text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              )}
              <button 
                onClick={() => setOpen(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                    m.role === "user"
                      ? "bg-primary-600 text-white rounded-br-md"
                      : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-bl-md shadow-sm border border-gray-100 dark:border-gray-700"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            
            {/* Suggestions */}
            {showSuggestions && !loading && (
              <div className="mt-4">
                <div className="flex items-center gap-1 mb-2 text-xs text-gray-500 dark:text-gray-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Suggested questions:</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion.query)}
                      className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:border-primary-300 dark:hover:border-primary-700 transition-all hover:shadow-sm"
                    >
                      {suggestion.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl rounded-bl-md shadow-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-2 sm:p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me anything..."
              disabled={loading}
              className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 transition-all"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="p-3 sm:p-4 rounded-full shadow-lg hover:opacity-90 transition-all hover:scale-105"
          style={{ backgroundColor: botColor }}
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </button>
      )}
    </div>
  );
};