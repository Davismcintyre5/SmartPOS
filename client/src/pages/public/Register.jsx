import { useSearchParams } from 'react-router-dom';
import { useSite } from '../../context/SiteContext';
import RegisterForm from '../../components/app/public/RegisterForm';

export default function Register() {
  const [params] = useSearchParams();
  const { site } = useSite();
  const plan = params.get('plan');
  const trialDays = site?.onboarding?.trialDays ?? 14;

  const heading =
    plan === 'trial' || !plan
      ? `Start your ${trialDays}-day free trial`
      : plan === 'ent'
        ? 'Purchase Enterprise'
        : 'Complete your signup';

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">{heading}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Takes about 60 seconds</p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 md:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}