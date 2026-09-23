import { AuthShell } from '@/components/public/AuthShell';
import { ForgotPasswordForm } from '@/components/public/ForgotPasswordForm';

export default function ForgotPassword() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send you a link to reset it"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}