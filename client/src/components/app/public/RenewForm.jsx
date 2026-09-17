import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Clock, Copy, Check, AlertTriangle, LogIn } from 'lucide-react';
import api from '../../../api/axios';
import { useAuth } from '../../../context/AuthContext';
import { useSite } from '../../../context/SiteContext';
import { useToast } from '../../../context/ToastContext';
import { formatMoney } from '../../../utils/formatMoney';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

export default function RenewForm() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user, client } = useAuth();
  const { site } = useSite();

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Plans: recurring only (trial and ent don't apply here)
  useEffect(() => {
    const recurring = (site?.plans || []).filter(
      (p) => p.billingType === 'recurring' && p.active !== false
    );
    setPlans(recurring);
    if (recurring.length && !selectedPlan) {
      setSelectedPlan(recurring[0]._id);
    }
  }, [site]);

  // Enabled payment methods for the client's subscription currency
  const enabledMethods = (site?.paymentMethods || []).filter((m) =>
    m.supportedCurrencies.includes(client?.subscriptionCurrency)
  );

  useEffect(() => {
    if (enabledMethods.length && !selectedMethod) {
      setSelectedMethod(enabledMethods[0]._id);
    }
  }, [enabledMethods.length]);

  const handlePay = async () => {
    if (!selectedPlan) return toast.error('Choose a plan');
    if (!selectedMethod) return toast.error('Choose a payment method');
    if ((selectedMethod === 'mpesa_stk' || selectedMethod === 'mpesa_send') && !phone) {
      return toast.error('Phone number required');
    }

    setLoading(true);
    try {
      const res = await api.post('/billing/renew/checkout', {
        plan: selectedPlan,
        method: selectedMethod,
        phone: phone || undefined
      });
      const data = res.data?.data || res.data;

      if (data.action === 'redirect' && data.checkoutUrl) {
        setPending({
          type: 'redirect',
          title: data.title || 'Redirecting…',
          description: data.description
        });
        setTimeout(() => {
          window.location.href = data.checkoutUrl;
        }, 1200);
        return;
      }

      if (data.action === 'awaiting_pin') {
        setPending({
          type: 'awaiting_pin',
          title: data.title || 'Check your phone',
          description: data.description,
          steps: data.steps || [],
          paymentId: data.paymentId,
          checkoutRequestId: data.checkoutRequestId
        });
        return;
      }

      if (data.action === 'submit_code') {
        setPending({
          type: 'submit_code',
          title: data.title,
          description: data.description,
          steps: data.steps || [],
          payTo: data.payTo,
          paymentId: data.paymentId
        });
        return;
      }

      toast.error('Unexpected server response');
    } catch (err) {
      toast.error(err?.message || 'Renewal failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!codeInput.trim()) return toast.error('Enter the M-Pesa code');
    setLoading(true);
    try {
      await api.post('/signup/mpesa/submit-code', {
        paymentId: pending.paymentId,
        mpesaCode: codeInput.trim()
      });
      navigate('/signup/success');
    } catch (err) {
      toast.error(err?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const copyPayTo = () => {
    if (!pending?.payTo) return;
    const clean = pending.payTo.replace(/\s*\(.*\)/, '').replace(/·.*/, '').trim();
    navigator.clipboard.writeText(clean);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetPending = () => {
    setPending(null);
    setCodeInput('');
  };

  // Not logged in
  if (!user || !client) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-full bg-[var(--warning-soft)] flex items-center justify-center">
            <LogIn className="w-6 h-6 text-[var(--warning)]" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Sign in to renew
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            You need to be signed in to renew your subscription.
          </p>
        </div>
        <Button onClick={() => navigate('/login', { state: { from: { pathname: '/renew' } } })}>
          Sign in
        </Button>
      </div>
    );
  }

  const currency = client.subscriptionCurrency || 'KES';
  const currentPlan = plans.find((p) => p._id === selectedPlan);
  const amountMinor = currentPlan?.prices?.[currency] || 0;

  // Pending state — instruction screens
  if (pending) {
    return (
      <div className="space-y-5">
        {pending.title && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{pending.title}</h2>
            {pending.description && (
              <p className="text-sm text-[var(--text-secondary)] mt-1">{pending.description}</p>
            )}
          </div>
        )}

        {pending.type === 'redirect' && (
          <div className="text-center py-8">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)] mx-auto mb-4" />
            <p className="text-sm text-[var(--text-secondary)]">
              Redirecting to complete payment…
            </p>
          </div>
        )}

        {pending.type === 'awaiting_pin' && (
          <>
            <div className="text-center py-6">
              <Loader2 className="w-10 h-10 animate-spin text-[var(--accent)] mx-auto mb-4" />
              <p className="text-sm text-[var(--text-secondary)]">
                Waiting for your M-Pesa confirmation…
              </p>
            </div>

            {pending.steps.length > 0 && (
              <ol className="space-y-2">
                {pending.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            <div className="flex items-start gap-2 p-3 bg-[var(--info-soft)] border border-[var(--info)] rounded-[var(--radius)]">
              <Clock className="w-5 h-5 text-[var(--info)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--text-primary)]">
                Once payment is confirmed, your account will be restored automatically.
              </p>
            </div>

            <Button variant="secondary" className="w-full" onClick={resetPending}>
              Use a different method
            </Button>
          </>
        )}

        {pending.type === 'submit_code' && (
          <>
            {pending.payTo && (
              <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius)] p-4">
                <p className="text-xs text-[var(--text-muted)] mb-1">Pay to</p>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-[var(--text-primary)] break-all">
                    {pending.payTo}
                  </span>
                  <button
                    type="button"
                    onClick={copyPayTo}
                    className="text-[var(--accent)] hover:opacity-80 shrink-0"
                    aria-label="Copy"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {pending.steps.length > 0 && (
              <ol className="space-y-2">
                {pending.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}

            <Input
              label="M-Pesa code"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="e.g. QWE123XYZ"
            />

            <Button className="w-full" loading={loading} onClick={handleSubmitCode}>
              Submit code
            </Button>

            <Button variant="secondary" className="w-full" onClick={resetPending}>
              Use a different method
            </Button>
          </>
        )}
      </div>
    );
  }

  // Main renewal form
  return (
    <div className="space-y-6">
      {/* Warning banner */}
      <div className="flex items-start gap-3 bg-[var(--warning-soft)] border border-[var(--warning)] rounded-[var(--radius)] p-4">
        <AlertTriangle className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
        <div className="text-sm text-[var(--text-primary)]">
          <p className="font-semibold capitalize">Your account is {client.status}</p>
          <p className="text-[var(--text-secondary)] mt-0.5">
            Renew to restore access immediately. Your data is safe.
          </p>
        </div>
      </div>

      {/* Account summary */}
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius)] p-4">
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Store</span>
            <span className="text-[var(--text-primary)] font-medium">{client.name}</span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Current plan</span>
            <span className="text-[var(--text-primary)]">{client.plan}</span>
          </div>
          <div className="flex justify-between text-[var(--text-secondary)]">
            <span>Billing currency</span>
            <span className="text-[var(--text-primary)]">{currency}</span>
          </div>
        </div>
      </div>

      {/* Plan selection */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Choose a plan</h3>
        {plans.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">No plans available. Contact support.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plans.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => setSelectedPlan(p._id)}
                className={`text-left p-3 rounded-[var(--radius)] border transition-colors ${
                  selectedPlan === p._id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                }`}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {formatMoney(p.prices?.[currency] || 0, currency)} · {p.cycle}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Payment method */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Payment method</h3>
        {enabledMethods.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">
            No payment methods available for {currency}. Contact support.
          </p>
        ) : (
          <div className="space-y-2">
            {enabledMethods.map((m) => (
              <button
                key={m._id}
                type="button"
                onClick={() => setSelectedMethod(m._id)}
                className={`w-full text-left p-3 rounded-[var(--radius)] border transition-colors ${
                  selectedMethod === m._id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text-primary)]">{m.name}</span>
                  <span className="text-xs text-[var(--text-muted)] capitalize">{m.type}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone for M-Pesa STK / Send */}
      {(selectedMethod === 'mpesa_stk' || selectedMethod === 'mpesa_send') && (
        <Input
          label="M-Pesa phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="254712345678"
        />
      )}

      {/* Warning for manual methods */}
      {selectedMethod && selectedMethod.startsWith('mpesa_') && (
        <div className="flex items-start gap-2 p-3 bg-[var(--warning-soft)] border border-[var(--warning)] rounded-[var(--radius)]">
          <Clock className="w-5 h-5 text-[var(--warning)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-primary)]">
            Unconfirmed renewals are auto-expired after 3 hours.
          </p>
        </div>
      )}

      <Button
        className="w-full"
        loading={loading}
        onClick={handlePay}
        disabled={!selectedPlan || !selectedMethod}
      >
        Pay {formatMoney(amountMinor, currency)}
      </Button>
    </div>
  );
}