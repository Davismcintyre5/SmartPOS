import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { storage } from '@/utils/storage';

const STORAGE_KEY = 'cookie_consent';
const CONSENT_VERSION = 1;

type ConsentState = {
  version: number;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
};

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = storage.get<ConsentState | null>(STORAGE_KEY, null);
    if (!stored || stored.version !== CONSENT_VERSION) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const persist = (state: Omit<ConsentState, 'version' | 'decidedAt'>) => {
    const payload: ConsentState = {
      version: CONSENT_VERSION,
      decidedAt: new Date().toISOString(),
      ...state,
    };
    storage.set(STORAGE_KEY, payload);
    setVisible(false);
  };

  const acceptAll = () =>
    persist({ necessary: true, analytics: true, marketing: true });

  const rejectAll = () =>
    persist({ necessary: true, analytics: false, marketing: false });

  const savePreferences = () =>
    persist({ necessary: true, analytics, marketing });

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-4 animate-fade-in">
      <div className="mx-auto max-w-3xl rounded-xl border border-border bg-card text-card-foreground shadow-2xl">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Cookie className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold text-foreground">
                We use cookies
              </h3>
              <button
                type="button"
                onClick={rejectAll}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs leading-relaxed text-muted-foreground">
              SmartPOS uses cookies to keep you signed in and to understand how the
              product is used. You can choose which cookies to allow.{' '}
              <Link to="/legal/privacy" className="text-primary hover:underline">
                Learn more
              </Link>
            </p>

            {showDetails ? (
              <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-3">
                <label className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked
                    disabled
                    className="mt-0.5 h-3.5 w-3.5 accent-primary"
                  />
                  <span>
                    <span className="font-medium text-foreground">Strictly necessary</span>
                    <span className="block text-muted-foreground">
                      Required for login, security, and core functionality.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-primary"
                  />
                  <span>
                    <span className="font-medium text-foreground">Analytics</span>
                    <span className="block text-muted-foreground">
                      Helps us understand how the product is used.
                    </span>
                  </span>
                </label>

                <label className="flex items-start gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 accent-primary"
                  />
                  <span>
                    <span className="font-medium text-foreground">Marketing</span>
                    <span className="block text-muted-foreground">
                      Used to show relevant offers on other sites.
                    </span>
                  </span>
                </label>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Button size="sm" onClick={acceptAll}>
                Accept all
              </Button>
              <Button size="sm" variant="outline" onClick={rejectAll}>
                Reject all
              </Button>
              {showDetails ? (
                <Button size="sm" variant="ghost" onClick={savePreferences}>
                  Save preferences
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowDetails(true)}
                >
                  Customize
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}