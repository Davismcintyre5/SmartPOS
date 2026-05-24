// components/settings/ApiKeySettings.jsx
import { useState, useEffect } from "react";
import { apiKeyApi } from "../../api/apiKeyApi";
import { aiApi } from "../../api/aiApi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";
import { Copy, Check, Trash2, Lock } from "lucide-react";

export const ApiKeySettings = () => {
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [outwardEnabled, setOutwardEnabled] = useState(true);

  const fetchKeys = () => {
    apiKeyApi.getAll().then((res) => {
      if (res.success && res.data) setKeys(res.data);
    });
  };

  useEffect(() => {
    aiApi.getSettings().then((res) => {
      if (res.success) {
        const data = res.data || res;
        setOutwardEnabled(data.outwardKeyEnabled !== false);
      }
    });
    fetchKeys();
    setLoading(false);
  }, []);

  const handleGenerate = async () => {
    if (!name.trim()) return;
    setGenerating(true);
    try {
      const res = await apiKeyApi.generate({ name });
      if (res.success && res.data) {
        setNewKey(res.data.key);
        setName("");
        fetchKeys();
      }
    } catch {}
    setGenerating(false);
  };

  const handleRevoke = async (id) => {
    await apiKeyApi.revoke(id);
    fetchKeys();
  };

  if (loading) return <Spinner className="py-8" />;

  if (!outwardEnabled) {
    return (
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Keys</h2>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-5">
            <Lock className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">API Keys Disabled</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            API key generation has been disabled by your administrator. Contact support if you need access.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">API Keys</h2>

      {newKey && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">New key created — copy it now:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-white dark:bg-gray-900 px-3 py-2 rounded border break-all">{newKey}</code>
            <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(newKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-6">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" className="flex-1" />
        <Button onClick={handleGenerate} loading={generating}>Generate</Button>
      </div>

      <div className="space-y-2">
        {keys.map((k) => (
          <div key={k._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{k.name}</p>
              <code className="text-xs text-gray-500">{k.maskedKey}</code>
            </div>
            <button onClick={() => handleRevoke(k._id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        {keys.length === 0 && <p className="text-sm text-gray-500 py-4 text-center">No API keys yet.</p>}
      </div>
    </div>
  );
};