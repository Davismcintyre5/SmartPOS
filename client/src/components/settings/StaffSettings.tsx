import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { userApi } from '@/api/users';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import { formatDate } from '@/utils/format';
import type { User, UserRole } from '@/types/auth';
import type { NormalizedError } from '@/types/api';

export function StaffSettings() {
  const { user: currentUser } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'cashier' as UserRole,
  });

  const load = () => {
    setLoading(true);
    userApi
      .list({ limit: 50 })
      .then((res) => setUsers(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      await userApi.invite({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        role: form.role,
      });
      toast.success('Staff invited');
      setShowForm(false);
      setForm({ fullName: '', email: '', phone: '', role: 'cashier' });
      load();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  const handleRoleChange = async (id: string, role: UserRole) => {
    try {
      await userApi.updateRole(id, role);
      load();
      toast.success('Role updated');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Permanently delete this staff member? This cannot be undone.')) {
      return;
    }
    try {
      await userApi.remove(id);
      load();
      toast.success('Staff deleted');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    }
  };

  const handleResetPassword = async (id: string) => {
    if (!window.confirm('Send a new temporary password to this user?')) return;
    try {
      await userApi.resetPassword(id);
      toast.success('New password sent by email');
    } catch (e) {
      toast.error((e as NormalizedError).message);
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
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Staff</h2>
        <Button
          size="sm"
          onClick={() => setShowForm(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Invite staff
        </Button>
      </div>

      <div className="space-y-2">
        {users.map((u) => {
          const isSelf = u.id === currentUser?.id;
          return (
            <div
              key={u.id}
              className="flex flex-col gap-3 rounded-lg bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {u.fullName}{' '}
                  {isSelf ? <span className="text-xs text-muted-foreground">(you)</span> : null}
                </p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="primary" className="capitalize">
                    {u.role}
                  </Badge>
                  <Badge variant={u.status === 'active' ? 'success' : 'warning'}>
                    {u.status}
                  </Badge>
                  {u.lastLoginAt ? (
                    <span className="text-xs text-muted-foreground">
                      Last login {formatDate(u.lastLoginAt)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {!isSelf && u.role !== 'owner' ? (
                  <>
                    <Select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                      className="h-8 text-xs"
                    >
                      <option value="manager">Manager</option>
                      <option value="cashier">Cashier</option>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleResetPassword(u.id)}
                      aria-label="Reset password"
                      className="h-8 w-8"
                    >
                      <UserCog className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(u.id)}
                      aria-label="Delete"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Invite staff member"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowForm(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleInvite} loading={saving}>
              Send invite
            </Button>
          </>
        }
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <FormField label="Full name" htmlFor="fullName" required>
            <Input
              id="fullName"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </FormField>
          <FormField label="Email" htmlFor="email" required>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </FormField>
          <FormField label="Role" htmlFor="role">
            <Select
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
            >
              <option value="manager">Manager</option>
              <option value="cashier">Cashier</option>
            </Select>
          </FormField>
        </form>
      </Modal>
    </div>
  );
}