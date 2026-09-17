import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Check, Copy, Key } from 'lucide-react';
import api from '../../../api/axios';
import { useSite } from '../../../context/SiteContext';
import { useToast } from '../../../context/ToastContext';
import { isEmail, isPhone, isStrongPassword } from '../../../utils/validation';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import LegalLink from './LegalLink';

export default function RegisterForm() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { site } = useSite();

  const planFromUrl = params.get('plan') || 'trial';
  const trialDays = site?.onboarding?.trialDays ?? 14;

  const [form, setForm] = useState({
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    password: '',
    storeName: '',
    country: 'Kenya',
    plan: planFromUrl
  });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [licenseKey, setLicenseKey] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const plans = site?.plans || [];

  const validate = () => {
    const errs = {};
    if (!form.ownerName.trim()) errs.ownerName = 'Your name is required';
    if (!form.ownerEmail.trim()) errs.ownerEmail = 'Email is required';
    else if (!isEmail(form.ownerEmail)) errs.ownerEmail = 'Enter a valid email';
    if (form.ownerPhone && !isPhone(form.ownerPhone)) errs.ownerPhone = 'Enter a valid phone';
    if (!form.storeName.trim()) errs.storeName = 'Store name is required';
    const pwCheck = isStrongPassword(form.password);
    if (!pwCheck.valid) errs.password = pwCheck.reason;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        ownerName: form.ownerName.trim(),
        ownerEmail: form.ownerEmail.trim().toLowerCase(),
        ownerPhone: form.ownerPhone.trim(),
        password: form.password,
        storeName: form.storeName.trim(),
        country: form.country
      };

      if (form.plan === 'trial') {
        const res = await api.post('/signup/trial', payload);
        const data = res.data?.data || res.data;
        if (data.licenseKey) {
          setLicenseKey(data.licenseKey);
        } else {
          toast.success('Trial started. Welcome!');
          navigate('/login');
        }
      } else {
        const res = await api.post('/signup/register', { ...payload, plan: form.plan });
        const registrationId = res.data?.data?.registrationId || res.data?.registrationId;
        if (!registrationId) throw new Error('Could not create registration');
        navigate(`/checkout?reg=${registrationId}`);
      }
    } catch (err) {
      toast.error(err?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const copyKey = () => {
    navigator.clipboard.writeText(licenseKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (licenseKey) {
    return (
      <div className="text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[var(--success-soft)] flex items-center justify-center">
            <Check className="w-8 h-8 text-[var(--success)]" />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Trial activated</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Save this license key — you'll need it to activate your device.
          </p>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[var(--radius)] p-5">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Key className="w-4 h-4 text-[var(--accent)]" />
            <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
              License Key
            </span>
          </div>
          <p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all select-all mb-3">
            {licenseKey}
          </p>
          <Button variant="secondary" size="sm" onClick={copyKey}>
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-1" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-1" /> Copy key
              </>
            )}
          </Button>
        </div>

        <div className="bg-[var(--danger-soft)] border border-[var(--danger)] rounded-[var(--radius)] p-3 text-left">
          <p className="text-xs text-[var(--danger)] font-medium">
            Save this key somewhere safe. You cannot recover it later.
          </p>
        </div>

        <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Your name"
          value={form.ownerName}
          onChange={(e) => set('ownerName', e.target.value)}
          error={errors.ownerName}
          placeholder="John Doe"
        />
        <Input
          label="Store name"
          value={form.storeName}
          onChange={(e) => set('storeName', e.target.value)}
          error={errors.storeName}
          placeholder="Acme Groceries"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Email"
          type="email"
          value={form.ownerEmail}
          onChange={(e) => set('ownerEmail', e.target.value)}
          error={errors.ownerEmail}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Input
          label="Phone (optional)"
          value={form.ownerPhone}
          onChange={(e) => set('ownerPhone', e.target.value)}
          error={errors.ownerPhone}
          placeholder="0712 345 678"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPw ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            placeholder="At least 8 characters"
            autoComplete="new-password"
            className={`w-full px-3 py-2 pr-10 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
              errors.password ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-[var(--danger)] mt-1">{errors.password}</p>}
      </div>

      {plans.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Plan
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {plans.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => set('plan', p._id)}
                className={`text-left p-3 rounded-[var(--radius)] border transition-colors ${
                  form.plan === p._id
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border-color)] hover:border-[var(--text-muted)]'
                }`}
              >
                <p className="text-sm font-semibold text-[var(--text-primary)]">{p.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {p.billingType === 'free'
                    ? `${trialDays} days`
                    : p.billingType === 'one-time'
                      ? 'One-time'
                      : p.cycle}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--text-muted)] leading-relaxed">
        By continuing, you agree to our{' '}
        <LegalLink type="terms" className="text-[var(--accent)] hover:underline">
          Terms
        </LegalLink>{' '}
        and{' '}
        <LegalLink type="privacy" className="text-[var(--accent)] hover:underline">
          Privacy Policy
        </LegalLink>
        .
      </p>

      <Button type="submit" className="w-full" loading={loading}>
        {form.plan === 'trial' ? `Start ${trialDays}-day trial` : 'Continue to payment'}
      </Button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Already have an account?{' '}
        <Link to="/login" className="text-[var(--accent)] hover:underline font-medium">
          Sign in
        </Link>
      </p>
    </form>
  );
}