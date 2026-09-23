import { AuthShell } from '@/components/public/AuthShell';
import { ResetPasswordForm } from '@/components/public/ResetPasswordForm';

export default function ResetPassword() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you haven't used before"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}