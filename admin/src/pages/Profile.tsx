import { FormEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { adminAuthApi } from '@/api/auth';

export default function Profile() {
  const { admin } = useAuth();
  const { toast } = useNotifications();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast({ type: 'error', message: 'Passwords do not match' });
      return;
    }
    if (next.length < 8) {
      toast({ type: 'error', message: 'Password must be at least 8 characters' });
      return;
    }
    setBusy(true);
    try {
      await adminAuthApi.changePassword({ currentPassword: current, newPassword: next });
      toast({ type: 'success', message: 'Password changed' });
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      toast({ type: 'error', message: (err as { message?: string }).message || 'Failed' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Profile</h1>
        <p className="text-sm text-slate-500 mt-1">Your admin account</p>
      </div>

      <Card title="Account">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Name</dt>
            <dd className="text-slate-900">{admin?.fullName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Email</dt>
            <dd className="text-slate-900">{admin?.email}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Role</dt>
            <dd className="text-slate-900">Super admin</dd>
          </div>
        </dl>
      </Card>

      <Card title="Change password">
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField label="Current password" required>
            <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
          </FormField>
          <FormField label="New password" required hint="At least 8 characters">
            <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} required />
          </FormField>
          <FormField label="Confirm new password" required>
            <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </FormField>
          <Button type="submit" icon={<KeyRound size={16} />} loading={busy}>
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}