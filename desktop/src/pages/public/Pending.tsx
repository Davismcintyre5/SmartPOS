import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  LogOut,
  Mail,
  Phone,
  FileText,
  Smartphone,
  Send,
  Building2,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSite } from '@/hooks/useSite';
import { authApi } from '@/api/auth';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { PayWithMpesaModal } from '@/components/public/PayWithMpesaModal';

function formatMoney(amount: number, currency: string) {
  return `${currency} ${Number(amount).toLocaleString('en-KE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

interface Instruction {
  code?: string;
  method?: string;
  title: string;
  description?: string | null;
  steps?: string[];
  payTo?: string | null;
  recipient?: Record<string, string | number | null>;
}

const METHOD_ICONS: Record<string, typeof Smartphone> = {
  mpesa_stk: Smartphone,
  mpesa_send: Send,
  mpesa_paybill: Building2,
  mpesa_till: Wallet,
  bank: Building2,
  cash: Wallet,
};

export default function Pending() {
  const navigate = useNavigate();
  const { user, tenant, plan, invoice, logout, loading, isAuthenticated, scope } = useAuth();
  const { settings } = useSite();
  const [refreshing, setRefreshing] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (loading) {
      setReady(false);
      return;
    }
    const t = setTimeout(() => setReady(true), 250);
    return () => clearTimeout(t);
  }, [loading]);

  useEffect(() => {
    if (!ready) return;

    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (scope === 'active') {
      navigate('/app', { replace: true });
    }
  }, [ready, isAuthenticated, scope, navigate]);

  useEffect(() => {
    if (!isAuthenticated || scope !== 'pending') return;
    const interval = setInterval(async () => {
      try {
        const me = await authApi.me();
        if (me.tenant.status === 'active') {
          window.location.href = '/app';
        }
      } catch {
        /* silent */
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, scope]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      const me = await authApi.me();
      if (me.tenant.status === 'active') {
        window.location.href = '/app';
        return;
      }
      window.location.reload();
    } catch {
      setRefreshing(false);
    }
  };

  const handlePaymentSuccess = () => {
    setMpesaOpen(false);
    setTimeout(() => window.location.reload(), 1500);
  };

  if (loading || !ready) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  const supportEmail = settings?.supportEmail || 'support@bizos.co.ke';
  const supportPhone = settings?.supportPhone || '+254 700 000 000';

  const hasInvoice = Boolean(invoice);
  const isPaid = invoice?.status === 'paid';
  const planName = plan?.name || tenant?.planId || 'Standard';
  const canPay = hasInvoice && !isPaid && (invoice?.amountDue || 0) > 0;
  const amountDue = invoice?.amountDue || 0;
  const currency = invoice?.currency || 'KES';

  // Cast through unknown so TS allows the index access
  const inv = invoice as unknown as Record<string, unknown> | null;
  const invoiceNumber =
    (inv?.invoiceNumber as string) || (inv?.number as string) || '';

  const rawInstructions: Instruction[] = Array.isArray(
    (inv?.paymentInstructions as Instruction[] | undefined)
  )
    ? (inv!.paymentInstructions as Instruction[])
    : [];

  const manualMethods = rawInstructions.filter(
    (p) => p.code && p.code !== 'mpesa_stk'
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background py-10 px-4">
      <div className="mx-auto max-w-lg">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
              <Clock size={32} className="text-warning" />
            </div>

            <h1 className="mt-4 text-xl font-semibold text-foreground">
              Waiting for approval
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Thanks for registering{' '}
              <strong className="text-foreground">{tenant?.name}</strong>.
              {hasInvoice && !isPaid && (
                <>
                  {' '}
                  Pay the invoice below to activate your account on the{' '}
                  <strong className="text-foreground">{planName}</strong> plan.
                </>
              )}
              {hasInvoice && isPaid && (
                <>
                  {' '}
                  We&apos;ve received your payment for the{' '}
                  <strong className="text-foreground">{planName}</strong> plan.
                </>
              )}
              {!hasInvoice && <> Your registration is now with our team for review.</>}{' '}
              We&apos;ll email you the moment you&apos;re approved.
            </p>
          </div>

          {hasInvoice && (
            <div className="mt-6 space-y-2.5 rounded-xl border border-border bg-muted/40 p-4 text-sm">
              <Row label="Business" value={tenant?.name || '—'} />
              <Row label="Plan" value={planName} capitalize />
              <Row label="Invoice" value={invoiceNumber || '—'} mono bold />
              <Row
                label="Amount"
                value={formatMoney(amountDue, currency)}
                bold
                valueClass="text-lg text-foreground"
              />
              <Row
                label="Status"
                value={isPaid ? 'Paid' : 'Unpaid'}
                valueClass={
                  isPaid
                    ? 'font-semibold text-success'
                    : 'font-semibold text-warning'
                }
              />
              <Row label="Email" value={user?.email || '—'} truncate />
            </div>
          )}

          <div className="mt-6 flex flex-col gap-2.5">
            {canPay && (
              <Button
                fullWidth
                size="lg"
                variant="success"
                leftIcon={<Smartphone size={16} />}
                onClick={() => setMpesaOpen(true)}
              >
                Pay {formatMoney(amountDue, currency)} with M-Pesa
              </Button>
            )}

            {canPay && invoiceNumber && (
              <Link to={`/invoice/${invoiceNumber}`} className="block w-full">
                <Button
                  fullWidth
                  variant="outline"
                  size="lg"
                  leftIcon={<FileText size={16} />}
                >
                  View full invoice
                </Button>
              </Link>
            )}

            <Button
              fullWidth
              variant={canPay ? 'ghost' : 'primary'}
              onClick={refresh}
              loading={refreshing}
            >
              Check status
            </Button>

            <Button
              fullWidth
              variant="ghost"
              onClick={logout}
              leftIcon={<LogOut size={16} />}
            >
              Log out
            </Button>
          </div>

          {canPay && manualMethods.length > 0 && (
            <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Other ways to pay
              </p>
              <ul className="mt-3 space-y-3">
                {manualMethods.map((p, i) => {
                  const Icon = METHOD_ICONS[p.code || ''] || Wallet;
                  const recipient = p.recipient || {};
                  const recipientEntries = Object.entries(recipient).filter(
                    ([, v]) => v !== null && v !== undefined && v !== ''
                  );

                  return (
                    <li
                      key={`${p.code || p.title}-${i}`}
                      className="rounded-lg border border-border bg-background p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Icon size={14} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">
                            {p.title}
                          </p>
                          {p.description ? (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {p.description}
                            </p>
                          ) : null}

                          {recipientEntries.length > 0 ? (
                            <div className="mt-2 space-y-0.5">
                              {recipientEntries.map(([k, v]) => (
                                <p key={k} className="text-xs text-foreground">
                                  <span className="capitalize text-muted-foreground">
                                    {k}:
                                  </span>{' '}
                                  <span className="font-mono font-medium">
                                    {String(v)}
                                  </span>
                                </p>
                              ))}
                            </div>
                          ) : p.payTo ? (
                            <p className="mt-1 font-mono text-xs text-foreground">
                              {p.payTo}
                            </p>
                          ) : null}

                          {p.steps && p.steps.length > 0 ? (
                            <ol className="mt-2 list-decimal space-y-0.5 pl-4 text-xs text-muted-foreground">
                              {p.steps.map((s, j) => (
                                <li key={j}>{s}</li>
                              ))}
                            </ol>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {hasInvoice && isPaid && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <div className="text-sm">
                <p className="font-medium text-success">Payment received</p>
                <p className="mt-0.5 text-xs text-success/80">
                  Your account will be activated shortly. Check your email for
                  the confirmation.
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-center text-xs font-medium text-muted-foreground">
              Need help?
            </p>
            <div className="mt-2 flex flex-col items-center gap-1.5 text-xs">
              <a
                href={`mailto:${supportEmail}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <Mail size={12} /> {supportEmail}
              </a>
              <a
                href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
              >
                <Phone size={12} /> {supportPhone}
              </a>
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Usually takes less than 24 hours.
        </p>
      </div>

      {canPay && invoiceNumber && (
        <PayWithMpesaModal
          open={mpesaOpen}
          onClose={() => setMpesaOpen(false)}
          invoiceNumber={invoiceNumber}
          amount={amountDue}
          currency={currency}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
  mono,
  capitalize,
  truncate,
  valueClass,
}: {
  label: string;
  value: string;
  bold?: boolean;
  mono?: boolean;
  capitalize?: boolean;
  truncate?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span
        className={[
          'text-right',
          bold ? 'font-semibold text-foreground' : 'font-medium text-foreground',
          mono ? 'font-mono text-xs' : '',
          capitalize ? 'capitalize' : '',
          truncate ? 'truncate' : '',
          valueClass || '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {value}
      </span>
    </div>
  );
}