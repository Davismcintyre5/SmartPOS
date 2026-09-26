import { Download, Monitor, Apple, Terminal, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { useSite } from '@/hooks/useSite';

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

export function DownloadsSection() {
  const { downloads } = useSite();

  if (!downloads || downloads.length === 0) return null;

  return (
    <section id="downloads" className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Download SmartPOS
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Available for desktop and mobile. Install once, sell anywhere.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {downloads.map((d) => {
            const Icon = ICONS[d.type] ?? Download;
            const label = LABELS[d.type] ?? d.type;

            return (
              <div
                key={d.id}
                className="flex items-start gap-4 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{d.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {label}
                    {d.arch ? ` · ${d.arch}` : ''}
                    {d.size ? ` · ${d.size}` : ''}
                  </p>

                  <a
                    href={d.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block"
                  >
                    <Button size="sm" leftIcon={<Download className="h-3.5 w-3.5" />}>
                      Download v{d.version}
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/downloads"
            className="text-sm text-primary hover:underline"
          >
            See all downloads →
          </Link>
        </div>
      </div>
    </section>
  );
}