import { AuthShell } from '@/components/public/AuthShell';
import { VerifyForm } from '@/components/public/VerifyForm';

export default function Verify() {
  return (
    <AuthShell
      title="Verify your email"
      subtitle="Confirming your account"
    >
      <VerifyForm />
    </AuthShell>
  );
}