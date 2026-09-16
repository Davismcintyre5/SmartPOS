import PageHeader from '../components/layout/PageHeader';
import PageContent from '../components/layout/PageContent';
import Card from '../components/ui/Card';

export default function ComingSoon({ title = 'Page', code = null }) {
  return (
    <>
      <PageHeader title={title} description="This page is under construction" />
      <PageContent>
        <Card>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            {code && (
              <p className="text-6xl font-bold text-[var(--accent)] mb-4">{code}</p>
            )}
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              {title}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              Coming soon
            </p>
          </div>
        </Card>
      </PageContent>
    </>
  );
}