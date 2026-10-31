import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Smartphone,
  Loader2,
  Banknote,
  Store,
  Send,
  ChevronDown,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { settingsApi } from '@/api/settings';
import { useToast } from '@/hooks/useNotification';
import { cn } from '@/utils/classNames';
import type {
  MpesaSettings,
  MpesaEnv,
  MpesaStkMethod,
  UpdateMpesaInput,
} from '@/types/settings';
import type { NormalizedError } from '@/types/api';

type MethodKey = 'paybill' | 'till' | 'sendMoney';

interface FormState {
  cashEnabled: boolean;
  stkEnabled: boolean;
  stkMethod: MpesaStkMethod | null;

  env: MpesaEnv;
  consumerKey: string;
  consumerSecret: string;
  passkey: string;

  paybill: {
    enabled: boolean;
    shortcode: string;
    accountReference: string;
  };
  till: {
    enabled: boolean;
    tillNumber: string;
    darajaShortcode: string;
  };
  sendMoney: {
    enabled: boolean;
    phone: string;
  };
}

const DEFAULTS: FormState = {
  cashEnabled: true,
  stkEnabled: false,
  stkMethod: null,
  env: 'sandbox',
  consumerKey: '',
  consumerSecret: '',
  passkey: '',
  paybill: {
    enabled: false,
    shortcode: '',
    accountReference: 'INV-{invoiceNumber}',
  },
  till: {
    enabled: false,
    tillNumber: '',
    darajaShortcode: '',
  },
  sendMoney: {
    enabled: false,
    phone: '',
  },
};

function fromSettings(s: MpesaSettings): FormState {
  return {
    cashEnabled: s.cashEnabled,
    stkEnabled: s.stkEnabled,
    stkMethod: s.stkMethod ?? null,
    env: s.credentials?.env || 'sandbox',
    consumerKey: s.credentials?.consumerKey || '',
    consumerSecret: s.credentials?.consumerSecret || '',
    passkey: s.credentials?.passkey || '',
    paybill: {
      enabled: s.paybill?.enabled ?? false,
      shortcode: s.paybill?.shortcode || '',
      accountReference: s.paybill?.accountReference || 'INV-{invoiceNumber}',
    },
    till: {
      enabled: s.till?.enabled ?? false,
      tillNumber: s.till?.tillNumber || '',
      darajaShortcode: s.till?.darajaShortcode || '',
    },
    sendMoney: {
      enabled: s.sendMoney?.enabled ?? false,
      phone: s.sendMoney?.phone || '',
    },
  };
}

const METHOD_LABEL: Record<MpesaStkMethod, string> = {
  paybill: 'Paybill',
  till: 'Till',
  sendMoney: 'Send Money',
};

export function PaymentSettings() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [data, setData] = useState<MpesaSettings | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULTS);

  const [expanded, setExpanded] = useState<MethodKey | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    settingsApi
      .getMpesa()
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setForm(fromSettings(res));
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

  const enabledMethods = useMemo<MpesaStkMethod[]>(() => {
    const list: MpesaStkMethod[] = [];
    if (form.paybill.enabled) list.push('paybill');
    if (form.till.enabled) list.push('till');
    if (form.sendMoney.enabled) list.push('sendMoney');
    return list;
  }, [form.paybill.enabled, form.till.enabled, form.sendMoney.enabled]);

  const anyMethodEnabled = enabledMethods.length > 0;

  const credentialsFilled = Boolean(
    form.consumerKey.trim() &&
      form.consumerSecret.trim() &&
      form.passkey.trim()
  );

  const canEnableStk = !platformOff && anyMethodEnabled && credentialsFilled;

  useEffect(() => {
    setForm((f) => {
      if (enabledMethods.length === 1) {
        if (f.stkMethod !== enabledMethods[0]) {
          return { ...f, stkMethod: enabledMethods[0] };
        }
        return f;
      }
      if (f.stkMethod && !enabledMethods.includes(f.stkMethod)) {
        return { ...f, stkMethod: null };
      }
      return f;
    });
  }, [enabledMethods]);

  const validation = useMemo(() => {
    const errors: Record<string, string> = {};

    if (form.paybill.enabled && !form.paybill.shortcode.trim()) {
      errors['paybill.shortcode'] = 'Paybill shortcode is required';
    }
    if (form.till.enabled && !form.till.tillNumber.trim()) {
      errors['till.tillNumber'] = 'Till number is required';
    }
    if (
      form.till.enabled &&
      form.stkEnabled &&
      form.stkMethod === 'till' &&
      !form.till.darajaShortcode.trim()
    ) {
      errors['till.darajaShortcode'] = 'Daraja shortcode is required for STK';
    }
    if (form.sendMoney.enabled && !form.sendMoney.phone.trim()) {
      errors['sendMoney.phone'] = 'Phone number is required';
    }

    if (form.stkEnabled) {
      if (!credentialsFilled) {
        errors['stk'] = 'Daraja credentials are required to enable STK checkout';
      } else if (!anyMethodEnabled) {
        errors['stk'] = 'Enable at least one M-Pesa method first';
      } else if (enabledMethods.length > 1 && !form.stkMethod) {
        errors['stk'] = 'Choose which method STK should use';
      } else if (form.stkMethod && !enabledMethods.includes(form.stkMethod)) {
        errors['stk'] = 'The selected STK method is not enabled';
      }
    }

    return errors;
  }, [form, credentialsFilled, anyMethodEnabled, enabledMethods]);

  const isValid = Object.keys(validation).length === 0;
  const hasAtLeastOneMethod = form.cashEnabled || anyMethodEnabled;

  const patch = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const patchPaybill = (p: Partial<FormState['paybill']>) => {
    setForm((f) => ({ ...f, paybill: { ...f.paybill, ...p } }));
  };
  const patchTill = (p: Partial<FormState['till']>) => {
    setForm((f) => ({ ...f, till: { ...f.till, ...p } }));
  };
  const patchSendMoney = (p: Partial<FormState['sendMoney']>) => {
    setForm((f) => ({ ...f, sendMoney: { ...f.sendMoney, ...p } }));
  };

  const toggleExpand = (key: MethodKey) => {
    setExpanded((k) => (k === key ? null : key));
  };

  const buildPayload = (): UpdateMpesaInput => ({
    cashEnabled: form.cashEnabled,
    stkEnabled: form.stkEnabled,
    stkMethod: form.stkMethod,
    credentials: {
      env: form.env,
      consumerKey: form.consumerKey.trim(),
      consumerSecret: form.consumerSecret.trim(),
      passkey: form.passkey.trim(),
    },
    paybill: {
      enabled: form.paybill.enabled,
      shortcode: form.paybill.shortcode.trim(),
      accountReference: form.paybill.accountReference.trim() || 'INV-{invoiceNumber}',
    },
    till: {
      enabled: form.till.enabled,
      tillNumber: form.till.tillNumber.trim(),
      darajaShortcode: form.till.darajaShortcode.trim(),
    },
    sendMoney: {
      enabled: form.sendMoney.enabled,
      phone: form.sendMoney.phone.trim(),
    },
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (platformOff) return;
    if (!hasAtLeastOneMethod) {
      toast.error('Enable at least one payment method');
      return;
    }
    if (!isValid) {
      toast.error(Object.values(validation)[0] || 'Please fix form errors');
      return;
    }

    setSaving(true);
    try {
      const next = await settingsApi.updateMpesa(buildPayload());
      setData(next);
      setForm(fromSettings(next));
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
        toast.success(`Connection OK (${res.environment ?? form.env})`);
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
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">M-Pesa Payments</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Accept payments from customers at checkout. Requires your own Safaricom
          Daraja API credentials — money lands directly in your account.
        </p>
      </div>

      {platformOff ? (
        <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div className="text-xs text-destructive">
            <p className="font-medium">Disabled by platform administrator</p>
            <p className="mt-0.5">
              M-Pesa STK checkout is currently switched off for all businesses.
              Cash payments still work. Contact support if you believe this is
              a mistake.
            </p>
          </div>
        </div>
      ) : null}

      {/* ── CREDENTIALS ── */}
      <section className="space-y-4 rounded-lg border border-border bg-card p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Your Daraja credentials
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Required to accept M-Pesa. Get these from{' '}
            <a
              href="https://developer.safaricom.co.ke"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              developer.safaricom.co.ke
            </a>
          </p>
        </div>

        <FormField label="Environment">
          <Select
            value={form.env}
            onChange={(e) => patch('env', e.target.value as MpesaEnv)}
            disabled={platformOff}
          >
            <option value="sandbox">Sandbox (testing)</option>
            <option value="production">Production (live)</option>
          </Select>
        </FormField>

        {form.env === 'production' ? (
          <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <p className="text-xs text-warning">
              Production mode sends real money requests. Only use live Daraja
              credentials here.
            </p>
          </div>
        ) : null}

        <FormField label="Consumer key">
          <Input
            value={form.consumerKey}
            onChange={(e) => patch('consumerKey', e.target.value)}
            disabled={platformOff}
            placeholder="From your Daraja app"
            autoComplete="off"
            spellCheck={false}
          />
        </FormField>

        <FormField label="Consumer secret">
          <Input
            type="password"
            value={form.consumerSecret}
            onChange={(e) => patch('consumerSecret', e.target.value)}
            disabled={platformOff}
            placeholder="••••"
            autoComplete="new-password"
            spellCheck={false}
          />
        </FormField>

        <FormField label="Passkey">
          <Input
            type="password"
            value={form.passkey}
            onChange={(e) => patch('passkey', e.target.value)}
            disabled={platformOff}
            placeholder="••••"
            autoComplete="new-password"
            spellCheck={false}
          />
        </FormField>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleTest}
            disabled={platformOff || testing || !data?.credentials?.configured}
          >
            {testing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            <span className="ml-2">Test connection</span>
          </Button>
          {data?.credentials?.configured ? (
            <span className="text-xs text-success">Credentials saved</span>
          ) : (
            <span className="text-xs text-muted-foreground">Not yet saved</span>
          )}
        </div>
      </section>

      {/* ── METHODS ── */}
      <section className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Payment methods you accept
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Choose how customers pay you. Each method uses your Daraja
            credentials above.
          </p>
        </div>

        {/* Cash */}
        <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.cashEnabled}
            onChange={(e) => patch('cashEnabled', e.target.checked)}
            disabled={platformOff}
            className="mt-0.5 h-4 w-4"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-foreground">Cash</span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Always works — records payment as cash
            </p>
          </div>
        </label>

        {/* Paybill */}
        <div className="rounded-lg border border-border bg-muted/20">
          <button
            type="button"
            onClick={() => toggleExpand('paybill')}
            className="flex w-full items-start gap-3 p-3 text-left"
          >
            <input
              type="checkbox"
              checked={form.paybill.enabled}
              onChange={(e) => {
                e.stopPropagation();
                patchPaybill({ enabled: e.target.checked });
                if (e.target.checked && expanded !== 'paybill') setExpanded('paybill');
              }}
              disabled={platformOff}
              className="mt-0.5 h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-1 items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">M-Pesa Paybill</span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Customers pay to your Paybill number
                </p>
                {form.paybill.enabled && form.paybill.shortcode ? (
                  <p className="mt-1 text-xs font-mono text-foreground">
                    {form.paybill.shortcode}
                  </p>
                ) : null}
              </div>
              {expanded === 'paybill' ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          </button>

          {expanded === 'paybill' ? (
            <div className="space-y-3 border-t border-border p-3">
              <FormField label="Paybill number" hint="e.g. 174379">
                <Input
                  value={form.paybill.shortcode}
                  onChange={(e) => patchPaybill({ shortcode: e.target.value })}
                  disabled={platformOff || !form.paybill.enabled}
                  placeholder="174379"
                  autoComplete="off"
                  error={Boolean(validation['paybill.shortcode'])}
                />
              </FormField>

              <FormField
                label="Account reference"
                hint="Appears on customer SMS. Use {invoiceNumber} or {saleNumber} as placeholders."
              >
                <Input
                  value={form.paybill.accountReference}
                  onChange={(e) =>
                    patchPaybill({ accountReference: e.target.value })
                  }
                  disabled={platformOff || !form.paybill.enabled}
                  placeholder="INV-{invoiceNumber}"
                  autoComplete="off"
                />
              </FormField>
            </div>
          ) : null}
        </div>

        {/* Till */}
        <div className="rounded-lg border border-border bg-muted/20">
          <button
            type="button"
            onClick={() => toggleExpand('till')}
            className="flex w-full items-start gap-3 p-3 text-left"
          >
            <input
              type="checkbox"
              checked={form.till.enabled}
              onChange={(e) => {
                e.stopPropagation();
                patchTill({ enabled: e.target.checked });
                if (e.target.checked && expanded !== 'till') setExpanded('till');
              }}
              disabled={platformOff}
              className="mt-0.5 h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-1 items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    M-Pesa Till (Buy Goods)
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Customers pay to your till directly
                </p>
                {form.till.enabled && form.till.tillNumber ? (
                  <p className="mt-1 text-xs font-mono text-foreground">
                    {form.till.tillNumber}
                  </p>
                ) : null}
              </div>
              {expanded === 'till' ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          </button>

          {expanded === 'till' ? (
            <div className="space-y-3 border-t border-border p-3">
              <FormField
                label="Till number"
                hint="The number customers enter to pay you (e.g. 5678901)"
              >
                <Input
                  value={form.till.tillNumber}
                  onChange={(e) => patchTill({ tillNumber: e.target.value })}
                  disabled={platformOff || !form.till.enabled}
                  placeholder="5678901"
                  autoComplete="off"
                  error={Boolean(validation['till.tillNumber'])}
                />
              </FormField>

              {form.stkEnabled && form.stkMethod === 'till' ? (
                <>
                  <FormField
                    label="Daraja shortcode"
                    hint="The Store / HO number Safaricom gave you when you registered the API. Required for STK."
                  >
                    <Input
                      value={form.till.darajaShortcode}
                      onChange={(e) =>
                        patchTill({ darajaShortcode: e.target.value })
                      }
                      disabled={platformOff || !form.till.enabled}
                      placeholder="123456"
                      autoComplete="off"
                      error={Boolean(validation['till.darajaShortcode'])}
                    />
                  </FormField>

                  <div className="rounded-lg border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">
                      Two numbers required
                    </p>
                    <p className="mt-1">
                      <strong>Till number</strong> →{' '}
                      <code className="font-mono">PartyB</code> — customers see
                      this.
                    </p>
                    <p className="mt-1">
                      <strong>Daraja shortcode</strong> →{' '}
                      <code className="font-mono">BusinessShortCode</code> —
                      Safaricom issued this with the API.
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Send Money */}
        <div className="rounded-lg border border-border bg-muted/20">
          <button
            type="button"
            onClick={() => toggleExpand('sendMoney')}
            className="flex w-full items-start gap-3 p-3 text-left"
          >
            <input
              type="checkbox"
              checked={form.sendMoney.enabled}
              onChange={(e) => {
                e.stopPropagation();
                patchSendMoney({ enabled: e.target.checked });
                if (e.target.checked && expanded !== 'sendMoney') {
                  setExpanded('sendMoney');
                }
              }}
              disabled={platformOff}
              className="mt-0.5 h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex flex-1 items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">
                    Send Money (Pochi la Biashara)
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Customer sends to your personal M-Pesa number
                </p>
                {form.sendMoney.enabled && form.sendMoney.phone ? (
                  <p className="mt-1 text-xs font-mono text-foreground">
                    {form.sendMoney.phone}
                  </p>
                ) : null}
              </div>
              {expanded === 'sendMoney' ? (
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
          </button>

          {expanded === 'sendMoney' ? (
            <div className="space-y-3 border-t border-border p-3">
              <FormField
                label="M-Pesa phone number"
                hint="The phone registered to your M-Pesa account (0712 345 678 or 254712345678)"
              >
                <Input
                  value={form.sendMoney.phone}
                  onChange={(e) => patchSendMoney({ phone: e.target.value })}
                  disabled={platformOff || !form.sendMoney.enabled}
                  placeholder="0712 345 678"
                  autoComplete="off"
                  error={Boolean(validation['sendMoney.phone'])}
                />
              </FormField>
            </div>
          ) : null}
        </div>

        {!hasAtLeastOneMethod ? (
          <p className="text-xs text-destructive">
            Enable at least one payment method
          </p>
        ) : null}
      </section>

      {/* ── STK PUSH ── */}
      <section className="space-y-4 rounded-lg border border-border bg-card p-4">
        <label
          className={cn(
            'flex items-start gap-3 cursor-pointer',
            (!canEnableStk && !form.stkEnabled) ? 'opacity-60' : ''
          )}
        >
          <input
            type="checkbox"
            checked={form.stkEnabled}
            onChange={(e) => patch('stkEnabled', e.target.checked)}
            disabled={platformOff || (!canEnableStk && !form.stkEnabled)}
            className="mt-0.5 h-4 w-4"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm font-medium text-foreground">
                STK Push (in-app checkout)
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Customer enters their PIN on their phone. Uses the methods
              you enabled above.
            </p>
            {!canEnableStk && !form.stkEnabled ? (
              <p className="mt-1 text-xs text-warning">
                {!anyMethodEnabled
                  ? 'Enable at least one M-Pesa method above first'
                  : !credentialsFilled
                    ? 'Enter your Daraja credentials to enable STK'
                    : 'STK is unavailable'}
              </p>
            ) : null}
          </div>
        </label>

        {form.stkEnabled && enabledMethods.length > 0 ? (
          <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs font-medium text-foreground">
              When a customer pays via STK, use:
            </p>

            {enabledMethods.length === 1 ? (
              <p className="text-sm font-medium text-primary">
                {METHOD_LABEL[enabledMethods[0]]}
                {enabledMethods[0] === 'paybill' && form.paybill.shortcode
                  ? ` — ${form.paybill.shortcode}`
                  : null}
                {enabledMethods[0] === 'till' && form.till.tillNumber
                  ? ` — ${form.till.tillNumber}`
                  : null}
                {enabledMethods[0] === 'sendMoney' && form.sendMoney.phone
                  ? ` — ${form.sendMoney.phone}`
                  : null}
              </p>
            ) : (
              <div className="space-y-1.5">
                {enabledMethods.map((m) => {
                  const checked = form.stkMethod === m;
                  const detail =
                    m === 'paybill'
                      ? form.paybill.shortcode
                      : m === 'till'
                        ? form.till.tillNumber
                        : form.sendMoney.phone;
                  return (
                    <label
                      key={m}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="stkMethod"
                        value={m}
                        checked={checked}
                        onChange={() => patch('stkMethod', m)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-sm text-foreground">
                        {METHOD_LABEL[m]}
                        {detail ? (
                          <span className="ml-1 font-mono text-xs text-muted-foreground">
                            ({detail})
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {enabledMethods.length > 1 && !form.stkMethod ? (
              <p className="text-xs text-destructive">
                Choose which method STK should use
              </p>
            ) : null}
          </div>
        ) : null}

        {validation['stk'] ? (
          <p className="text-xs text-destructive">{validation['stk']}</p>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" loading={saving} disabled={platformOff}>
          Save changes
        </Button>
        {data?.updatedAt ? (
          <span className="text-xs text-muted-foreground">
            Last updated: {new Date(data.updatedAt).toLocaleString()}
          </span>
        ) : null}
      </div>

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
          <li>Copy your Paybill/Till and Passkey from the app details</li>
          <li>
            For sandbox testing, use shortcode <code>174379</code> and the
            sandbox passkey shown on the Daraja portal
          </li>
        </ol>
        <p className="mt-3">
          We handle the callback URL for you — nothing to configure on
          Safaricom&apos;s side.
        </p>
      </div>
    </form>
  );
}