import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { legalApi } from '@/api/legal';
import type { LegalType } from '@/types/legal';
import type { NormalizedError } from '@/types/api';

export interface LegalModalProps {
  open: boolean;
  type: LegalType | null;
  onClose: () => void;
}

export function LegalModal({ open, type, onClose }: LegalModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<NormalizedError | null>(null);

  useEffect(() => {
    if (!open || !type) return;
    let cancelled = false;

    setLoading(true);
    setError(null);
    setTitle('');
    setContent('');

    legalApi
      .getCurrent(type)
      .then((doc) => {
        if (cancelled) return;
        setTitle(doc.title);
        setContent(doc.content);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e as NormalizedError);
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
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-background/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-border bg-card text-card-foreground shadow-2xl animate-slide-in-right">
        <div className="flex items-start justify-between gap-4 border-b border-border p-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">
              {title || 'Legal'}
            </h2>
            {type ? (
              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
                {type}
              </p>
            ) : null}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner label="Loading…" />
            </div>
          ) : error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error.message}
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              {content}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}