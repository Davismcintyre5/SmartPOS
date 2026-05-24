// ChatWidget
import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { landingApi } from "../../api/landingApi";

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: "ai", text: "Hi! How can I help you?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [checked, setChecked] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    landingApi.getAIStatus().then((res) => {
      if (res.success) setEnabled(res.landingEnabled);
    }).finally(() => setChecked(true));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!checked || !enabled) return null;

  const send = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text: input }]);
    const msg = input;
    setInput("");
    setLoading(true);
    try {
      const res = await landingApi.chat({ message: msg });
      setMessages((prev) => [...prev, { role: "ai", text: res.data?.reply || "Sorry, try again." }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Something went wrong." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {!open && <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 z-40 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700"><MessageCircle className="w-6 h-6" /></button>}
      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-80 sm:w-96 h-[480px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-primary-600 text-white rounded-t-2xl">
            <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5" /><span className="font-semibold text-sm">SmartPOS AI</span></div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-full hover:bg-primary-700"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <span className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${m.role === "user" ? "bg-primary-600 text-white rounded-br-md" : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md border"}`}>{m.text}</span>
              </div>
            ))}
            {loading && <div className="flex gap-1 px-3 py-2"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" /><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} /><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} /></div>}
            <div ref={bottomRef} />
          </div>
          <div className="p-2 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex gap-2 rounded-b-2xl">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Ask me anything..." className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500" />
            <button onClick={send} disabled={loading || !input.trim()} className="w-9 h-9 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-full flex items-center justify-center"><Send className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </>
  );
};