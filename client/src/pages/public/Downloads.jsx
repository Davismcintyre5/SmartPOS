import {
  Download as DownloadIcon,
  Monitor,
  Apple,
  Terminal,
  Smartphone
} from 'lucide-react';
import { useSite } from '../../context/SiteContext';

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

export default function Downloads() {
  const { site } = useSite();
  const downloads = site?.downloads || [];

  const grouped = downloads.reduce((acc, d) => {
    if (!acc[d.type]) acc[d.type] = [];
    acc[d.type].push(d);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-semibold uppercase tracking-wider mb-4">
          <DownloadIcon className="w-3 h-3" /> Downloads
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
          Get SmartPOS
        </h1>
        <p className="text-lg text-[var(--text-secondary)] mt-4">
          Choose the version for your platform.
        </p>
      </div>

      {downloads.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          Downloads coming soon.
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([type, items]) => {
            const Icon = ICONS[type] || DownloadIcon;
            return (
              <div key={type}>
                <div className="flex items-center gap-2 mb-5">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                  <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    {TYPE_LABELS[type] || type}
                  </h2>
                  <span className="text-xs text-[var(--text-muted)]">
                    ({items.length})
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {items.map((d) => {
                    const size = formatSize(d.size);
                    return (
                      <div
                        key={d.id}
                        className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] p-5 flex flex-col"
                      >
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                          {d.name}
                        </h3>

                        <div className="text-xs text-[var(--text-muted)] mt-1 space-x-2">
                          <span className="font-mono">v{d.version}</span>
                          {d.arch && (<><span>·</span><span>{d.arch}</span></>)}
                          {d.minOS && (<><span>·</span><span>{d.minOS}</span></>)}
                        </div>

                        {size && (
                          <p className="text-xs text-[var(--text-secondary)] mt-1">{size}</p>
                        )}

                        {d.releaseNotes && (
                          <p className="text-xs text-[var(--text-secondary)] mt-3 line-clamp-3 leading-relaxed">
                            {d.releaseNotes}
                          </p>
                        )}

                        <div className="mt-auto pt-5 flex flex-col gap-2">
                          <a
                            href={d.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] text-sm font-medium transition-colors"
                          >
                            <DownloadIcon className="w-4 h-4" /> Download
                          </a>

                          {d.checksum && (
                            <p className="text-[10px] text-[var(--text-muted)] font-mono break-all">
                              SHA-256: {d.checksum}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}