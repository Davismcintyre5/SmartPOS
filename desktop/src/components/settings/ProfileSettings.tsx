import { useEffect, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { profileApi } from '@/api/profile';
import { authApi } from '@/api/auth';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useNotification';
import type { NormalizedError } from '@/types/api';

export function ProfileSettings() {
  const { user } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    setLoading(true);
    profileApi
      .get()
      .then((res) => {
        if (res.owner) {
          setFullName(res.owner.fullName);
          setPhone(res.owner.phone ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await profileApi.updateMe({ fullName, phone });
      toast.success('Profile updated');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSavingPassword(false);
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
    <div className="space-y-8">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">Profile</h2>
        <form onSubmit={saveProfile} className="max-w-md space-y-4">
          <FormField label="Full name" htmlFor="fullName">
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </FormField>
          <FormField label="Email" htmlFor="email" hint="Contact support to change your email">
            <Input id="email" value={user?.email ?? ''} disabled />
          </FormField>
          <FormField label="Phone" htmlFor="phone">
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+254 700 000 000"
            />
          </FormField>
          <Button type="submit" loading={savingProfile}>
            Save profile
          </Button>
        </form>
      </div>

      <div className="border-t border-border pt-8">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Change password</h2>
        <form onSubmit={savePassword} className="max-w-md space-y-4">
          <FormField label="Current password" htmlFor="currentPassword">
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </FormField>
          <FormField label="New password" htmlFor="newPassword" hint="At least 8 characters">
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          <FormField label="Confirm new password" htmlFor="confirmPassword">
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" loading={savingPassword}>
            Change password
          </Button>
        </form>
      </div>
    </div>
  );
}