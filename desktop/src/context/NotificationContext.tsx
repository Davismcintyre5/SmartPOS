import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
  duration: number;
}

export interface ToastInput {
  title: string;
  description?: string;
  duration?: number;
}

interface NotificationContextValue {
  toasts: Toast[];
  notify: {
    success: (input: ToastInput | string) => string;
    error: (input: ToastInput | string) => string;
    warning: (input: ToastInput | string) => string;
    info: (input: ToastInput | string) => string;
  };
  dismiss: (id: string) => void;
  clear: () => void;
}

export const NotificationContext = createContext<NotificationContextValue | null>(null);

const DEFAULT_DURATION = 4000;
const ERROR_DURATION = 6000;

function normalize(input: ToastInput | string): ToastInput {
  return typeof input === 'string' ? { title: input } : input;
}

function iconFor(variant: ToastVariant) {
  const className = 'h-5 w-5 shrink-0';
  switch (variant) {
    case 'success':
      return <CheckCircle2 className={className} />;
    case 'error':
      return <AlertCircle className={className} />;
    case 'warning':
      return <AlertTriangle className={className} />;
    default:
      return <Info className={className} />;
  }
}

const variantClasses: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-card text-card-foreground',
  error: 'border-destructive/30 bg-card text-card-foreground',
  warning: 'border-warning/30 bg-card text-card-foreground',
  info: 'border-border bg-card text-card-foreground',
};

const iconClasses: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-destructive',
  warning: 'text-warning',
  info: 'text-primary',
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer !== undefined) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (variant: ToastVariant, input: ToastInput | string): string => {
      const { title, description, duration } = normalize(input);
      const id =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      const finalDuration =
        duration ?? (variant === 'error' ? ERROR_DURATION : DEFAULT_DURATION);

      setToasts((prev) => [...prev, { id, variant, title, description, duration: finalDuration }]);

      if (finalDuration > 0) {
        const timer = window.setTimeout(() => {
          dismiss(id);
        }, finalDuration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss]
  );

  const clear = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const value = useMemo<NotificationContextValue>(
    () => ({
      toasts,
      notify: {
        success: (input) => push('success', input),
        error: (input) => push('error', input),
        warning: (input) => push('warning', input),
        info: (input) => push('info', input),
      },
      dismiss,
      clear,
    }),
    [toasts, push, dismiss, clear]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-lg border p-3 shadow-lg animate-slide-in-right ${variantClasses[t.variant]}`}
          >
            <span className={iconClasses[t.variant]}>{iconFor(t.variant)}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              {t.description ? (
                <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}