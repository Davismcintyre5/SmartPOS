import { useState, useEffect } from 'react';
import {
  updateAi,
  getExternalKey,
  createExternalKey,
  revokeExternalKey
} from '../../api/settings';
import { useSite } from '../../context/SiteContext';
import { useToast } from '../../context/ToastContext';
import { formatRelative } from '../../utils/formatDate';
import Card from '../../components/ui/Card';
import FieldGroup from '../../components/ui/FieldGroup';
import Select from '../../components/ui/Select';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Key, Copy, Check, AlertTriangle, Trash2 } from 'lucide-react';

export default function AiSettings({ settings, onSaved }) {
  const { site } = useSite();
  const toast = useToast();

  const platformAi = site?.ai?.features || {};
  const clientAiEnabled = platformAi.clientAi === true;
  const fileUploadAllowed = platformAi.fileUpload === true;
  const apiKeysAllowed = platformAi.outwardApiKeys === true;

  const [form, setForm] = useState({
    enabled: settings.ai?.enabled ?? false,
    provider: settings.ai?.provider ?? null,
    allowFileUpload: settings.ai?.allowFileUpload ?? false
  });
  const [saving, setSaving] = useState(false);

  // External key state
  const [key, setKey] = useState(null);
  const [keyLoading, setKeyLoading] = useState(false);
  const [keyCreating, setKeyCreating] = useState(false);
  const [keyRevoking, setKeyRevoking] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(false);
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const fetchKey = () => {
    if (!apiKeysAllowed || !clientAiEnabled) {
      setKey(null);
      return;
    }
    setKeyLoading(true);
    getExternalKey()
      .then((res) => setKey(res?.data || null))
      .catch(console.error)
      .finally(() => setKeyLoading(false));
  };

  useEffect(() => { fetchKey(); }, [apiKeysAllowed, clientAiEnabled]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAi({ ai: form });
      onSaved({ ai: form });
      toast.success('Saved');
    } catch (err) {
      toast.error(err?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKey = async () => {
    setKeyCreating(true);
    try {
      const res = await createExternalKey();
      setNewKey(res?.data || res);
      fetchKey();
    } catch (err) {
      toast.error(err?.message || 'Could not create key');
    } finally {
      setKeyCreating(false);
    }
  };

  const handleRevokeKey = async () => {
    setKeyRevoking(true);
    try {
      await revokeExternalKey();
      setConfirmRevoke(false);
      fetchKey();
      toast.success('Key revoked');
    } catch (err) {
      toast.error(err?.message || 'Revoke failed');
    } finally {
      setKeyRevoking(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(newKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!clientAiEnabled) {
    return (
      <Card>
        <div className="py-10 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">AI is disabled</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            AI features are disabled by the platform admin.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <FieldGroup title="AI features">
          <Toggle
            label="Enable AI for this store"
            checked={form.enabled}
            onChange={(v) => set('enabled', v)}
          />

          {form.enabled && (
            <Select
              label="Default provider"
              value={form.provider || ''}
              onChange={(e) => set('provider', e.target.value || null)}
              options={[
                { value: '', label: 'Global default' },
                { value: 'hdm', label: 'HDM AI' },
                { value: 'deepseek', label: 'DeepSeek' },
                { value: 'chatgpt', label: 'ChatGPT (OpenAI)' },
                { value: 'claude', label: 'Claude (Anthropic)' },
                { value: 'gemini', label: 'Gemini (Google)' }
              ]}
            />
          )}
        </FieldGroup>
      </Card>

      {form.enabled && (
        <Card>
          <FieldGroup title="Advanced features">
            <div className={fileUploadAllowed ? '' : 'opacity-50'}>
              <Toggle
                label="Allow AI file analysis"
                checked={form.allowFileUpload}
                onChange={(v) => fileUploadAllowed && set('allowFileUpload', v)}
              />
              {!fileUploadAllowed && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Disabled by admin — temporarily unavailable.
                </p>
              )}
            </div>
          </FieldGroup>
        </Card>
      )}

      {/* External API key — under AI */}
      {form.enabled && (
        <Card>
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                External API key
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                One key per store. External apps use it to read products, sales, and customers.
              </p>
            </div>

            {apiKeysAllowed && !keyLoading && !key && (
              <Button size="sm" onClick={handleCreateKey} loading={keyCreating}>
                <Key className="w-4 h-4 mr-1" /> Generate key
              </Button>
            )}
          </div>

          {!apiKeysAllowed && (
            <div className="text-center py-6">
              <p className="text-sm text-[var(--text-muted)]">
                Disabled by admin — temporarily unavailable.
              </p>
            </div>
          )}

          {apiKeysAllowed && keyLoading && (
            <p className="text-sm text-[var(--text-muted)] text-center py-6">Loading…</p>
          )}

          {apiKeysAllowed && !keyLoading && key && (
            <div className="border border-[var(--border-color)] rounded-[var(--radius)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm text-[var(--text-primary)] break-all">
                    {key.prefix}…
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    {key.lastUsedAt
                      ? `Last used ${formatRelative(key.lastUsedAt)}`
                      : 'Never used'}
                    {' · '}
                    Created {formatRelative(key.createdAt)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setConfirmRevoke(true)}
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Revoke
                </Button>
              </div>
            </div>
          )}

          {apiKeysAllowed && !keyLoading && !key && (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              No key generated yet.
            </p>
          )}
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} loading={saving} size="lg">Save</Button>
      </div>

      {/* New key modal */}
      <Modal
        open={!!newKey}
        onClose={() => setNewKey(null)}
        title="Your API key"
        size="md"
      >
        {newKey && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-[var(--warning-soft)] border border-[var(--warning)] rounded-[var(--radius)]">
              <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-[var(--text-primary)]">Save this key now</p>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  You won't be able to see it again. If you lose it, revoke and generate a new one.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius)]">
              <Key className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <code className="flex-1 font-mono text-xs text-[var(--text-primary)] break-all">
                {newKey.key}
              </code>
              <button
                onClick={copyKey}
                className="text-[var(--accent)] hover:opacity-80 shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <Button className="w-full" onClick={() => setNewKey(null)}>
              I've saved it
            </Button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmRevoke}
        onClose={() => setConfirmRevoke(false)}
        onConfirm={handleRevokeKey}
        title="Revoke API key"
        message="Revoke this key? External apps using it will stop working immediately."
        confirmLabel="Revoke"
        variant="danger"
        loading={keyRevoking}
      />
    </div>
  );
}