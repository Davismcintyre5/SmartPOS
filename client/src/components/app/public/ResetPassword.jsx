import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, CheckCircle2 } from 'lucide-react';
import api from '../../../api/axios';
import { useToast } from '../../../context/ToastContext';
import { isEmail, isStrongPassword } from '../../../utils/validation';
import Button from '../../ui/Button';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const toast = useToast();

  const [mode, setMode] = useState(token ? 'reset' : 'forgot');

  useEffect(() => {
    setMode(token ? 'reset' : 'forgot');
  }, [token]);

  if (mode === 'forgot') {
    return <ForgotForm onSent={() => setMode('sent')} />;
  }

  if (mode === 'reset') {
    return <ResetForm token={token} onDone={() => navigate('/login')} />;
  }

  return <SentMessage onBack={() => setMode('forgot')} />;
}

function ForgotForm({ onSent }) {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    if (!isEmail(email)) return setError('Enter a valid email');
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      onSent();
    } catch (err) {
      toast.error(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className={`w-full pl-10 pr-3 py-2 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
              error ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
            }`}
          />
        </div>
        {error && <p className="text-xs text-[var(--danger)] mt-1">{error}</p>}
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Remembered it?{' '}
        <Link to="/login" className="text-[var(--accent)] hover:underline font-medium">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

function SentMessage({ onBack }) {
  return (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle2 className="w-12 h-12 text-[var(--success)]" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Check your email</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          If that email is registered, we've sent a reset link. It expires in 1 hour.
        </p>
      </div>
      <button
        onClick={onBack}
        className="text-sm text-[var(--accent)] hover:underline"
      >
        Didn't get it? Try again
      </button>
    </div>
  );
}

function ResetForm({ token, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({ password: '', confirm: '' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    const pwCheck = isStrongPassword(form.password);
    if (!pwCheck.valid) errs.password = pwCheck.reason;
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: form.password });
      toast.success('Password reset. Please sign in.');
      onDone();
    } catch (err) {
      toast.error(err?.message || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          New password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type={show ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            autoComplete="new-password"
            className={`w-full pl-10 pr-10 py-2 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
              errors.password ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-[var(--danger)] mt-1">{errors.password}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Confirm password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type={show ? 'text' : 'password'}
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••••"
            autoComplete="new-password"
            className={`w-full pl-10 pr-3 py-2 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
              errors.confirm ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
            }`}
          />
        </div>
        {errors.confirm && <p className="text-xs text-[var(--danger)] mt-1">{errors.confirm}</p>}
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Reset password
      </Button>
    </form>
  );
}