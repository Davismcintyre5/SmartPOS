import { useEffect, useState, type FormEvent } from 'react';
import { AlertTriangle, CheckCircle2, Smartphone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { settingsApi } from '@/api/settings';
import { useToast } from '@/hooks/useNotification';
import type {
  MpesaSettings,
  MpesaEnv,
  UpdateMpesaInput,
} from '@/types/settings';
import type { NormalizedError } from '@/types/api';

export function PaymentSettings() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [data, setData] = useState<MpesaSettings | null>(null);

  const [enabled, setEnabled] = useState(false);
  const [env, setEnv] = useState<MpesaEnv>('sandbox');
  const [shortcode, setShortcode] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [passkey, setPasskey] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    settingsApi
      .getMpesa()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setEnabled(res.enabled);
        setEnv(res.env);
        setShortcode(res.shortcode);
        setConsumerKey(res.consumerKey);
        setConsumerSecret(res.consumerSecret);
        setPasskey(res.passkey);
      })
      .catch((e) => {
        if (!cancelled) toast.error((e as NormalizedError).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [toast]);

  const platformOff = data ? !data.platformEnabled : false;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (platformOff) return;

    const payload: UpdateMpesaInput = {
      enabled,
      env,
      shortcode: shortcode.trim(),
      consumerKey: consumerKey.trim(),
      consumerSecret: consumerSecret.trim(),
      passkey: passkey.trim(),
    };

    setSaving(true);
    try {
      const next = await settingsApi.updateMpesa(payload);
      setData(next);
      setEnabled(next.enabled);
      setEnv(next.env);
      setShortcode(next.shortcode);
      setConsumerKey(next.consumerKey);
      setConsumerSecret(next.consumerSecret);
      setPasskey(next.passkey);
      toast.success('M-Pesa settings saved');
    } catch (err) {
      toast.error((err as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      const res = await settingsApi.testMpesa();
      if (res.ok) {
        toast.success(`Connection OK (${res.environment ?? env})`);
      } else {
        toast.error(res.error || 'Connection failed');
      }
    } catch (err) {
      toast.error((err as NormalizedError).message);
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          M-Pesa STK Checkout
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Let customers pay directly from their phone during checkout. You need
          your own Safaricom Daraja API credentials.
        </p>
      </div>

      {platformOff ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="text-xs text-destructive">
            <p className="font-medium">Disabled by platform administrator</p>
            <p className="mt-0.5">
              M-Pesa STK checkout is currently switched off for all businesses.
              Contact support if you believe this is a mistake.
            </p>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
          <input
            id="mpesa-enabled"
            type="checkbox"
            checked={enabled}
            disabled={platformOff}
            onChange={(e) => setEnabled(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
          <label
            htmlFor="mpesa-enabled"
            className="flex-1 cursor-pointer select-none text-sm"
          >
            <span className="flex items-center gap-2 font-medium text-foreground">
              <Smartphone className="h-4 w-4" />
              Enable STK checkout in POS
            </span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              When on, the M-Pesa option appears in the cart payment screen.
            </span>
          </label>
        </div>

        <FormField label="Environment" htmlFor="mpesa-env">
          <Select
            id="mpesa-env"
            value={env}
            onChange={(e) => setEnv(e.target.value as MpesaEnv)}
            disabled={platformOff}
          >
            <option value="sandbox">Sandbox (testing)</option>
            <option value="production">Production (live)</option>
          </Select>
        </FormField>

        {env === 'production' ? (
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-warning">
              Production mode will send real money requests to customers&apos;
              phones. Only use live Daraja credentials here.
            </p>
          </div>
        ) : null}

        <FormField
          label="Business shortcode"
          htmlFor="mpesa-shortcode"
          hint="Your Paybill or Till number (e.g. 174379)"
        >
          <Input
            id="mpesa-shortcode"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
            disabled={platformOff}
            placeholder="174379"
            autoComplete="off"
          />
        </FormField>

        <FormField
          label="Consumer key"
          htmlFor="mpesa-key"
          hint="From your Safaricom Daraja app"
        >
          <Input
            id="mpesa-key"
            value={consumerKey}
            onChange={(e) => setConsumerKey(e.target.value)}
            disabled={platformOff}
            placeholder="••••"
            autoComplete="off"
            spellCheck={false}
          />
        </FormField>

        <FormField label="Consumer secret" htmlFor="mpesa-secret">
          <Input
            id="mpesa-secret"
            type="password"
            value={consumerSecret}
            onChange={(e) => setConsumerSecret(e.target.value)}
            disabled={platformOff}
            placeholder="••••"
            autoComplete="new-password"
            spellCheck={false}
          />
        </FormField>

        <FormField label="Passkey" htmlFor="mpesa-passkey">
          <Input
            id="mpesa-passkey"
            type="password"
            value={passkey}
            onChange={(e) => setPasskey(e.target.value)}
            disabled={platformOff}
            placeholder="••••"
            autoComplete="new-password"
            spellCheck={false}
          />
        </FormField>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" loading={saving} disabled={platformOff}>
            Save
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={platformOff || testing || !data?.configured}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span className="ml-2">Test connection</span>
          </Button>
        </div>

        {data?.updatedAt ? (
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(data.updatedAt).toLocaleString()}
          </p>
        ) : null}
      </form>

      <div className="rounded-lg border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">How to get credentials</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>
            Sign up at{' '}
            <a
              href="https://developer.safaricom.co.ke"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              developer.safaricom.co.ke
            </a>
          </li>
          <li>Create a new app and copy the Consumer Key and Consumer Secret</li>
          <li>Copy your Business Shortcode and Passkey from the app details</li>
          <li>
            For sandbox testing, use shortcode <code>174379</code> and the
            sandbox passkey shown on the Daraja portal
          </li>
        </ol>
        <p className="mt-3">
          We handle the callback URL for you &mdash; nothing to configure on
          Safaricom&apos;s side.
        </p>
      </div>
    </div>
  );
}