import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';

export default function Login() {
  const { login, status } = useAuth();
  const { toast } = useNotifications();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      toast({ type: 'success', message: 'Welcome back' });
      navigate('/');
    } catch (err) {
      const msg = (err as { message?: string }).message || 'Login failed';
      setError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg p-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white text-sm font-bold">
            B
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 leading-none">SmartPOS</p>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Admin Panel</p>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-slate-900 mb-1">Sign in</h1>
        <p className="text-sm text-slate-500 mb-6">Super admin access only.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Email" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smartpos.co.ke"
              autoComplete="email"
              required
            />
          </FormField>

          <FormField label="Password" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </FormField>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={status === 'loading'}>
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}