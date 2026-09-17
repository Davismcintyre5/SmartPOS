import Card from '../components/ui/Card';

export default function ComingSoon({ title = 'Page', code = null }) {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] truncate">{title}</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">This page is under construction</p>
      </div>

      <Card>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          {code && (
            <p className="text-6xl font-bold text-[var(--accent)] mb-4">{code}</p>
          )}
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">{title}</h2>
          <p className="text-sm text-[var(--text-muted)]">Coming soon</p>
        </div>
      </Card>
    </div>
  );
}