// components/settings/AISettings.jsx
import { useState, useEffect } from "react";
import { aiApi } from "../../api/aiApi";
import { apiKeyApi } from "../../api/apiKeyApi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";
import { Copy, Check, Trash2, Lock, Plus, Server } from "lucide-react";

const providers = [
  { value: "hdm", label: "HDM AI" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "chatgpt", label: "ChatGPT" },
  { value: "claude", label: "Claude" },
  { value: "gemini", label: "Gemini" },
];

export const AISettings = () => {
  const [aiForm, setAiForm] = useState({ useGlobalAI: true, provider: "hdm", apiKey: "" });
  const [keys, setKeys] = useState([]);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [outwardEnabled, setOutwardEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState("");

  // Get base URL from env and remove /api
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || "smartpos-server.pxxl.click")
    .replace(/\/api$/, "")
    .replace(/\/$/, "");

  const fetchKeys = () => {
    apiKeyApi.getAll().then((res) => {
      if (res.success && res.data) setKeys(res.data);
    });
  };

  useEffect(() => {
    aiApi.getSettings().then((res) => {
      if (res.success) {
        const data = res.data || res;
        setAiForm({
          useGlobalAI: data.useGlobalAI !== false,
          provider: data.provider || "hdm",
          apiKey: data.apiKey || "",
        });
        setOutwardEnabled(data.outwardKeyEnabled !== false);
      }
    });
    fetchKeys();
    setLoading(false);
  }, []);

  const handleSaveAI = async () => {
    setSaving(true);
    setSuccess("");
    try { await aiApi.updateSettings(aiForm); setSuccess("AI settings saved."); } catch {}
    setSaving(false);
  };

  const handleGenerateKey = async () => {
    if (!keyName.trim()) return;
    setGenerating(true);
    try {
      const res = await apiKeyApi.generate({ name: keyName });
      if (res.success && res.data) { setNewKey(res.data.key); setKeyName(""); fetchKeys(); }
    } catch {}
    setGenerating(false);
  };

  const handleRevokeKey = async (id) => {
    await apiKeyApi.revoke(id);
    fetchKeys();
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        🤖 AI & API Keys
      </h2>

      {/* AI Section */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">AI Configuration</h3>
        <div className="space-y-4 max-w-md">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={aiForm.useGlobalAI} onChange={(e) => setAiForm({ ...aiForm, useGlobalAI: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Use global AI (provided by SmartPOS)</span>
          </label>
          {!aiForm.useGlobalAI && (
            <div className="space-y-4 pl-7 border-l-2 border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">AI Provider</label>
                <select value={aiForm.provider} onChange={(e) => setAiForm({ ...aiForm, provider: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
                  {providers.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <Input label="API Key" type="password" value={aiForm.apiKey} onChange={(e) => setAiForm({ ...aiForm, apiKey: e.target.value })} placeholder="Enter your API key" />
            </div>
          )}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button onClick={handleSaveAI} loading={saving}>Save AI Settings</Button>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">API Keys</h3>

        {!outwardEnabled ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3"><Lock className="w-6 h-6 text-gray-400" /></div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">API Keys Disabled</p>
            <p className="text-xs text-gray-500">Your administrator has disabled outward API keys.</p>
          </div>
        ) : (
          <div className="max-w-md space-y-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-1">
                <Server className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">API Base URL</p>
              </div>
              <p className="text-sm font-mono font-medium text-gray-900 dark:text-white break-all">
                {baseUrl}
              </p>
            </div>

            {newKey && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">✨ New key created — copy it now:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded border break-all">{newKey}</code>
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(newKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Input value={keyName} onChange={(e) => setKeyName(e.target.value)} placeholder="Key name" className="flex-1" />
              <Button onClick={handleGenerateKey} loading={generating}><Plus className="w-4 h-4" /> Generate</Button>
            </div>

            <div className="space-y-2">
              {keys.map((k) => (
                <div key={k._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{k.name}</p>
                    <code className="text-xs text-gray-500">{k.maskedKey}</code>
                  </div>
                  <button onClick={() => handleRevokeKey(k._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {keys.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No API keys yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Generate your first key above ☝️</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};