import { useEffect, useState } from 'react';
import { HiX } from 'react-icons/hi';
import api from '../../../../api/axios';
import Spinner from '../../../ui/Spinner';

export default function LegalModal({ open, onClose, type }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !type) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get(`/legal/${type}`)
      .then((res) => {
        if (cancelled) return;
        const data = res.data?.data || res.data;
        setDoc(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || 'Could not load document');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, type]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[var(--overlay)]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] truncate">
              {doc?.title || (type === 'terms' ? 'Terms of Service' : 'Privacy Policy')}
            </h2>
            {doc?.version && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Version {doc.version}
                {doc.effectiveFrom
                  ? ` · Effective ${new Date(doc.effectiveFrom).toLocaleDateString()}`
                  : ''}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none transition-colors"
            aria-label="Close"
          >
            <HiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Spinner size="lg" />
            </div>
          )}

          {!loading && error && (
            <div className="py-10 text-center text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          {!loading && !error && doc && (
            <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
              {doc.content}
            </div>
          )}

          {!loading && !error && !doc && (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">
              No content available.
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[var(--border-color)] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-[var(--radius)] bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}