import { Download, Monitor, Apple, Terminal, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useSite } from '@/hooks/useSite';
import { formatDate } from '@/utils/format';

const ICONS: Record<string, typeof Monitor> = {
  windows: Monitor,
  macos: Apple,
  linux: Terminal,
  android: Smartphone,
  ios: Smartphone,
};

const LABELS: Record<string, string> = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS',
};

export default function Downloads() {
  const { downloads } = useSite();

  if (!downloads || downloads.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <EmptyState
          icon={<Download className="h-6 w-6" />}
          title="No downloads yet"
          description="Desktop and mobile builds will appear here soon."
        />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Downloads
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Get SmartPOS for your platform.
        </p>
      </div>

      <div className="space-y-3">
        {downloads.map((d) => {
          const Icon = ICONS[d.type] ?? Download;
          const label = LABELS[d.type] ?? d.type;

          return (
            <div
              key={d.id}
              className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-start"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-6 w-6" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-foreground">{d.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  v{d.version}
                  {d.arch ? ` · ${d.arch}` : ''}
                  {d.size ? ` · ${d.size}` : ''}
                  {d.minOS ? ` · ${d.minOS}` : ''}
                  {` · ${label}`}
                </p>

                {d.releaseNotes ? (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                    {d.releaseNotes}
                  </p>
                ) : null}
              </div>

              <a
                href={d.link}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0"
              >
                <Button leftIcon={<Download className="h-4 w-4" />}>
                  Download
                </Button>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}