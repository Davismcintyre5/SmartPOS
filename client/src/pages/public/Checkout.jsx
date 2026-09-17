import { useSearchParams } from 'react-router-dom';
import CheckoutForm from '../../components/app/public/CheckoutForm';

export default function Checkout() {
  const [params] = useSearchParams();
  const hasReg = params.get('reg');

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Complete payment</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Choose a method and pay securely
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 md:p-8">
        {hasReg ? (
          <CheckoutForm />
        ) : (
          <p className="text-sm text-[var(--text-secondary)] text-center py-8">
            Missing registration reference. Please{' '}
            <a href="/pricing" className="text-[var(--accent)] hover:underline">start again</a>.
          </p>
        )}
      </div>
    </div>
  );
}