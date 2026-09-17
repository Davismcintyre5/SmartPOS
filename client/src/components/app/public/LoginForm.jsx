import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { isEmail } from '../../../utils/validation';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

export default function LoginForm() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!isEmail(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err?.message || 'Login failed');
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
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="you@example.com"
            autoComplete="email"
            className={`w-full pl-10 pr-3 py-2 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
              errors.email ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
            }`}
          />
        </div>
        {errors.email && <p className="text-xs text-[var(--danger)] mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            autoComplete="current-password"
            className={`w-full pl-10 pr-10 py-2 rounded-[var(--radius)] border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-colors ${
              errors.password ? 'border-[var(--danger)]' : 'border-[var(--border-color)]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-xs text-[var(--danger)] mt-1">{errors.password}</p>}
      </div>

      <div className="flex items-center justify-end">
        <Link
          to="/forgot-password"
          className="text-sm text-[var(--accent)] hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="w-full" loading={loading}>
        Sign in
      </Button>

      <p className="text-center text-sm text-[var(--text-muted)]">
        Don't have an account?{' '}
        <Link to="/register" className="text-[var(--accent)] hover:underline font-medium">
          Start a free trial
        </Link>
      </p>
    </form>
  );
}