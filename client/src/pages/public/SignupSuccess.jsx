import { Link } from 'react-router-dom';
import { CheckCircle2, Mail } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function SignupSuccess() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="w-16 h-16 text-[var(--success)]" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        Payment received
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
        Thank you. Your account is being reviewed by our team.
        You'll receive an email once it's approved.
      </p>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-5 mt-8 text-left">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-[var(--accent)] shrink-0 mt-0.5" />
          <div className="text-sm text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">What happens next?</p>
            <p className="mt-1">
              We've sent you a confirmation email. Our team will approve your account shortly —
              usually within a few hours.
            </p>
          </div>
        </div>
      </div>

      <Link to="/" className="inline-block mt-8">
        <Button variant="secondary">Back to home</Button>
      </Link>
    </div>
  );
}