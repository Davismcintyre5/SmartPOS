import { useSite } from '../../context/SiteContext';
import ResetPassword from '../../components/app/public/ResetPassword';

export default function ForgotPassword() {
  const { site } = useSite();
  const name = site?.branding?.platformName || 'SmartPOS';

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Reset your password</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          We'll email you a link to reset it
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 md:p-8">
        <ResetPassword />
      </div>
    </div>
  );
}