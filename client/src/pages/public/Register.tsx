import { AuthShell } from '@/components/public/AuthShell';
import { RegisterForm } from '@/components/public/RegisterForm';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your 14-day free trial"
      maxWidth="lg"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}