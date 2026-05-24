// pages/app/AIChat.jsx
import { useState, useRef, useEffect } from "react";
import { aiApi } from "../../api/aiApi";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import {
  Bot, User, Send, Sparkles, Trash2, Zap, BarChart3, Package,
  TrendingUp, MessageSquare, Lightbulb, ArrowRight
} from "lucide-react";
import toast from "react-hot-toast";

export const AIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: `Hello ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your HDM AI business assistant. I can help you with:\n\n• Sales analytics & reports\n• Product & inventory insights\n• Customer trends\n• Business recommendations\n\nJust ask me anything!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input;
    if (!msg.trim()) return;
    const userMsg = { role: "user", text: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await aiApi.chat({ message: msg, conversation_id: conversationId });
      if (res.success) {
        const reply = res.data?.reply || res.reply || "I didn't get that.";
        setMessages((prev) => [...prev, { role: "ai", text: reply }]);
        if (res.data?.conversation_id) setConversationId(res.data.conversation_id);
      } else {
        setMessages((prev) => [...prev, { role: "ai", text: "Sorry, I couldn't process that. Try again." }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "AI is temporarily unavailable. Please try again later." }]);
    }
    setLoading(false);
  };

  const clearChat = () => {
    setMessages([{ role: "ai", text: "Chat cleared. How can I help you?" }]);
    setConversationId(null);
  };

  const suggestedPrompts = [
    { icon: TrendingUp, text: "Show me today's sales summary", color: "from-emerald-500 to-teal-600" },
    { icon: Package, text: "Which products are low in stock?", color: "from-amber-500 to-orange-600" },
    { icon: BarChart3, text: "What's my best selling product?", color: "from-blue-500 to-indigo-600" },
    { icon: Lightbulb, text: "Give me business recommendations", color: "from-purple-500 to-violet-600" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-950 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">HDM AI Assistant</h1>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              Powered by HDM AI — Ready to help
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={clearChat} className="text-gray-400 hover:text-red-500">
          <Trash2 className="w-4 h-4" /> Clear Chat
        </Button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-gradient-to-b from-blue-50/50 to-white dark:from-gray-800/50 dark:to-gray-800 rounded-2xl border border-blue-100 dark:border-gray-700 p-6 overflow-y-auto mb-4 shadow-inner">
        {messages.length === 1 && (
          <div className="mb-6">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Suggested questions
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestedPrompts.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => sendMessage(prompt.text)}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 text-left hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${prompt.color} flex items-center justify-center shadow-lg flex-shrink-0`}>
                    <prompt.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {prompt.text}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 ml-auto flex-shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600"
                }`}>
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-lg"
                    : "bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-lg border border-gray-100 dark:border-gray-700"
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-md">
                  <Bot className="w-4 h-4 text-blue-600" />
                </div>
                <div className="px-5 py-3 bg-white dark:bg-gray-900 rounded-2xl rounded-tl-lg border border-gray-100 dark:border-gray-700 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything about your business..."
            className="w-full pl-5 pr-5 py-3.5 border-2 border-blue-200 dark:border-blue-900 rounded-2xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm"
          />
        </div>
        <Button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25 rounded-2xl px-6"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};