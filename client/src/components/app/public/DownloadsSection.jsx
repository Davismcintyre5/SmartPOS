import { Link } from 'react-router-dom';
import {
  Download as DownloadIcon,
  Monitor,
  Apple,
  Terminal,
  Smartphone,
  ArrowRight
} from 'lucide-react';
import { useSite } from '../../../context/SiteContext';

const ICONS = {
  windows: Monitor,
  macos: Apple,
  linux: Terminal,
  android: Smartphone,
  ios: Smartphone
};

const TYPE_LABELS = {
  windows: 'Windows',
  macos: 'macOS',
  linux: 'Linux',
  android: 'Android',
  ios: 'iOS'
};

function formatSize(bytes) {
  if (!bytes) return null;
  const mb = bytes / 1024 / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export default function DownloadsSection() {
  const { site } = useSite();
  const downloads = site?.downloads || [];

  if (downloads.length === 0) return null;

  const preview = downloads.slice(0, 4);
  const hasMore = downloads.length > 4;

  return (
    <section id="downloads" className="py-20 px-4 md:px-6 scroll-mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            Get SmartPOS
          </h2>
          <p className="text-[var(--text-secondary)] mt-3">
            Download the app for your platform — desktop or mobile.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {preview.map((d) => {
            const Icon = ICONS[d.type] || DownloadIcon;
            const size = formatSize(d.size);

            return (
              <a
                key={d.id}
                href={d.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-5 flex flex-col hover:border-[var(--accent)] transition-colors"
              >
                <div className="w-11 h-11 rounded-[var(--radius)] bg-[var(--accent)]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                </div>

                <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-tight">
                  {d.name}
                </h3>

                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {TYPE_LABELS[d.type] || d.type}
                  {d.arch ? ` · ${d.arch}` : ''}
                </p>

                <div className="mt-1 text-[11px] text-[var(--text-muted)] font-mono">
                  v{d.version}
                  {size ? ` · ${size}` : ''}
                </div>

                <div className="mt-4 pt-4 border-t border-[var(--border-color)] flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] group-hover:gap-2.5 transition-all">
                  <DownloadIcon className="w-3.5 h-3.5" />
                  <span>Download</span>
                </div>
              </a>
            );
          })}
        </div>

        {hasMore && (
          <div className="text-center mt-10">
            <Link to="/downloads">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline">
                View all downloads <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}