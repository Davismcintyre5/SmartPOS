import RenewForm from '../../components/app/public/RenewForm';

export default function Renew() {
  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Renew your subscription</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Choose a plan and pay to restore access.
        </p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-6 md:p-8">
        <RenewForm />
      </div>
    </div>
  );
}