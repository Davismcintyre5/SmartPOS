import { useEffect, useState } from 'react';
import { Copy, Check, Trash2, Lock, Plus, Server, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { externalKeyApi, type ExternalKeyInfo } from '@/api/externalKeys';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import type { NormalizedError } from '@/types/api';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(
  /\/$/,
  ''
);

const FULL_ENDPOINT = `${API_BASE}/external/data`;

export function ApiKeysSettings() {
  const { aiFeatures } = useClient();
  const toast = useToast();

  const [current, setCurrent] = useState<ExternalKeyInfo | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const load = () => {
    setLoading(true);
    externalKeyApi
      .get()
      .then(setCurrent)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!aiFeatures.outwardApiKeys) {
      setLoading(false);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiFeatures.outwardApiKeys]);

  const handleCreate = async () => {
    const trimmed = keyName.trim();
    if (!trimmed) {
      toast.error('Give the key a name');
      return;
    }
    setCreating(true);
    try {
      const result = await externalKeyApi.create(trimmed);
      setNewKey(result.key);
      setKeyName('');
      load();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm('Revoke this API key? Any integration using it will stop working.')) {
      return;
    }
    setRevoking(true);
    try {
      await externalKeyApi.revoke();
      setNewKey(null);
      load();
      toast.success('API key revoked');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setRevoking(false);
    }
  };

  const copy = (text: string, which: 'key' | 'url') => {
    navigator.clipboard.writeText(text);
    if (which === 'key') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  if (!aiFeatures.outwardApiKeys) {
    return (
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">API Keys</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mb-1 text-sm font-medium text-foreground">API Keys Disabled</p>
          <p className="text-xs text-muted-foreground">
            Your administrator has disabled outward API keys.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">API Keys</h2>

      <div className="max-w-2xl space-y-5">
        {/* Full endpoint banner */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Server className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium text-primary">Endpoint</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 break-all rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
              GET {FULL_ENDPOINT}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => copy(FULL_ENDPOINT, 'url')}
              aria-label="Copy endpoint"
            >
              {copiedUrl ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="mt-3 space-y-1 border-t border-border pt-3">
            <p className="text-xs font-medium text-foreground">Send the key as a header:</p>
            <code className="block break-all rounded border border-border bg-background px-3 py-2 font-mono text-xs text-foreground">
              X-API-Key: {newKey || (current ? `${current.prefix}…` : '<your-api-key>')}
            </code>
          </div>
        </div>

        {/* New key banner */}
        {newKey ? (
          <div className="rounded-lg border border-success/30 bg-success/5 p-4">
            <p className="mb-2 text-sm font-medium text-success">
              ✨ New key created — copy it now, you won't see it again.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 break-all rounded border border-border bg-background px-3 py-2 text-xs">
                {newKey}
              </code>
              <Button variant="outline" size="icon" onClick={() => copy(newKey, 'key')}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        ) : null}

        {!current ? (
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-sm font-medium text-foreground">Generate a new key</p>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Key name (e.g. My Integration)"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreate();
                  }
                }}
                disabled={creating}
              />
              <Button
                onClick={handleCreate}
                loading={creating}
                disabled={!keyName.trim()}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Generate
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Active key
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">{current.name}</p>
              <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                {current.prefix}…
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                Created {new Date(current.createdAt).toLocaleDateString()}
                {current.lastUsedAt
                  ? ` · Last used ${new Date(current.lastUsedAt).toLocaleDateString()}`
                  : ' · Never used'}
              </p>
            </div>

            <Button
              variant="destructive"
              onClick={handleRevoke}
              loading={revoking}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Revoke key
            </Button>
          </>
        )}

        {/* Usage example */}
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <p className="text-xs font-medium text-foreground">Example request</p>
          </div>
          <pre className="overflow-x-auto rounded border border-border bg-background p-3 font-mono text-xs text-foreground">
{`curl -X GET "${FULL_ENDPOINT}" \\
  -H "X-API-Key: ${newKey || (current ? `${current.prefix}…` : 'YOUR_KEY')}"`}
          </pre>
        </div>
      </div>
    </div>
  );
}