import { Link } from 'react-router-dom';
import { AuthShell } from '@/components/public/AuthShell';
import { LoginForm } from '@/components/public/LoginForm';

export default function Login() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your SmartPOS account"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/pricing" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}