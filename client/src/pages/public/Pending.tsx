import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2, Mail, Phone, Wallet, Clock } from 'lucide-react';
import type { ReactNode } from 'react';
import { AuthShell } from '@/components/public/AuthShell';
import { PayWithMpesaModal } from '@/components/public/PayWithMpesaModal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useSite } from '@/hooks/useSite';
import { formatMoney } from '@/utils/currency';
import { formatDateTime } from '@/utils/format';

const STK_CODES = ['mpesa_stk'];

export default function Pending() {
  const { user, tenant, invoice, isAuthenticated, logout } = useAuth();
  const { settings } = useSite();
  const navigate = useNavigate();
  const [mpesaOpen, setMpesaOpen] = useState(false);

  const supportEmail = settings?.supportEmail ?? 'support@smartpos.co.ke';
  const supportPhone = settings?.supportPhone ?? '+254 768 784 909';

  const hasStk = Boolean(
    invoice?.paymentInstructions?.some((p) => STK_CODES.includes(p.code))
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <AuthShell
        title="Registration received"
        subtitle={
          isAuthenticated && tenant?.name
            ? `Welcome, ${tenant.name}`
            : 'Your account is being reviewed'
        }
        maxWidth="lg"
        footer={
          <>
            Need help?{' '}
            <a
              href={`mailto:${supportEmail}`}
              className="font-medium text-primary hover:underline"
            >
              {supportEmail}
            </a>
          </>
        }
      >
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            {isAuthenticated && invoice ? (
              <p className="text-sm text-muted-foreground">
                Invoice{' '}
                <span className="font-medium text-foreground">
                  {invoice.invoiceNumber}
                </span>{' '}
                has been sent to{' '}
                <span className="font-medium text-foreground">{user?.email}</span>
              </p>
            ) : isAuthenticated ? (
              <p className="text-sm text-muted-foreground">
                We&apos;ve sent a confirmation to{' '}
                <span className="font-medium text-foreground">{user?.email}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your registration is pending review. Check your inbox for the
                invoice and payment instructions.
              </p>
            )}
          </div>

          {isAuthenticated && invoice ? (
            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Amount due
                  </p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {formatMoney(invoice.amountDue, invoice.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Due
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {formatDateTime(invoice.dueDate)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {isAuthenticated && invoice ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                To activate your account:
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                {hasStk ? (
                  <Button
                    fullWidth
                    size="lg"
                    onClick={() => setMpesaOpen(true)}
                  >
                    Pay with M-Pesa
                  </Button>
                ) : null}
                <Link
                  to={`/invoice/${invoice.invoiceNumber}`}
                  className="flex-1"
                >
                  <Button variant="outline" fullWidth size="lg">
                    View invoice
                  </Button>
                </Link>
              </div>
            </div>
          ) : null}

          <div className="border-t border-border pt-5">
            <p className="mb-3 text-sm font-medium text-foreground">How it works</p>
            <ol className="space-y-3">
              <Step
                n={1}
                icon={<Wallet className="h-4 w-4" />}
                title="Pay the invoice"
                description={
                  isAuthenticated && invoice?.paymentInstructions?.length
                    ? invoice.paymentInstructions.map((p) => p.title).join(' · ')
                    : 'M-Pesa, Cash, or Bank transfer'
                }
              />
              <Step
                n={2}
                icon={<Clock className="h-4 w-4" />}
                title="We verify your payment"
                description="Usually within a few minutes during business hours."
              />
              <Step
                n={3}
                icon={<Mail className="h-4 w-4" />}
                title="Your account activates"
                description="You'll get an email the moment it's live."
              />
            </ol>
          </div>

          <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
            <a href={`mailto:${supportEmail}`} className="flex-1">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<Mail className="h-4 w-4" />}
              >
                Contact support
              </Button>
            </a>
            <a
              href={`tel:${supportPhone.replace(/\s/g, '')}`}
              className="flex-1"
            >
              <Button
                variant="ghost"
                fullWidth
                leftIcon={<Phone className="h-4 w-4" />}
              >
                {supportPhone}
              </Button>
            </a>
          </div>

          {isAuthenticated ? (
            <div className="text-center">
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </AuthShell>

      {isAuthenticated && invoice ? (
        <PayWithMpesaModal
          open={mpesaOpen}
          onClose={() => setMpesaOpen(false)}
          invoiceNumber={invoice.invoiceNumber}
          amount={invoice.amountDue}
          currency={invoice.currency}
        />
      ) : null}
    </>
  );
}

function Step({
  n,
  icon,
  title,
  description,
}: {
  n: number;
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">
          <span className="text-muted-foreground">{n}.</span> {title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </li>
  );
}