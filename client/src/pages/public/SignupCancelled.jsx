import { Link, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function SignupCancelled() {
  const [params] = useSearchParams();
  const reg = params.get('reg');

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        <XCircle className="w-16 h-16 text-[var(--warning)]" />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-primary)]">
        Payment cancelled
      </h1>
      <p className="text-sm text-[var(--text-secondary)] mt-3 leading-relaxed">
        Your payment was not completed. You can try again — your registration is still saved.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        {reg && (
          <Link to={`/checkout?reg=${reg}`}>
            <Button>Try again</Button>
          </Link>
        )}
        <Link to="/pricing">
          <Button variant="secondary">Back to pricing</Button>
        </Link>
      </div>
    </div>
  );
}