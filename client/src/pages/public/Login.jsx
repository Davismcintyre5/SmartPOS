import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import LoginForm from '../../components/app/public/LoginForm';

export default function Login() {
  const { site } = useSite();
  const name = site?.branding?.platformName || 'SmartPOS';

  useEffect(() => {
    document.title = `Sign in · ${name}`;
  }, [name]);

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Sign in to your {name} account
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 md:p-8">
        <LoginForm />
      </div>
    </div>
  );
}