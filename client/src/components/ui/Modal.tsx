import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/utils/classNames';
import { Button } from './Button';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: ReactNode;
  children: ReactNode;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showClose?: boolean;
}

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-[95vw]',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  footer,
  children,
  closeOnOverlay = true,
  closeOnEsc = true,
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeOnEsc, onClose]);

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
        onClick={closeOnOverlay ? onClose : undefined}
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[calc(100vh-2rem)] w-full flex-col rounded-lg border border-border bg-card text-card-foreground shadow-xl animate-fade-in',
          sizes[size]
        )}
      >
        {(title || showClose) && (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-border p-4">
            <div className="min-w-0">
              {title ? (
                <h2 className="text-base font-semibold tracking-tight">{title}</h2>
              ) : null}
              {description ? (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {showClose ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 -mt-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : null}
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">{children}</div>
        {footer ? (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border p-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}