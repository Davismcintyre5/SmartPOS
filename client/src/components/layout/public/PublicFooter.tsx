import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone } from 'lucide-react';
import { LegalModal } from '@/components/public/LegalModal';
import { CookieSettingsButton } from '@/components/public/CookieSettingsButton';
import { Logo } from '@/components/ui/Logo';
import { useSite } from '@/hooks/useSite';
import type { LegalType } from '@/types/legal';

const YEAR = new Date().getFullYear();

interface LegalLink {
  label: string;
  type: LegalType;
}

const LEGAL_LINKS: LegalLink[] = [
  { label: 'Terms of Service', type: 'terms' },
  { label: 'Privacy Policy', type: 'privacy' },
  { label: 'Refund Policy', type: 'refund' },
  { label: 'Data Processing', type: 'dpa' },
  { label: 'Acceptable Use', type: 'aup' },
];

export function PublicFooter() {
  const [legalType, setLegalType] = useState<LegalType | null>(null);
  const { settings, downloads } = useSite();

  const supportEmail = settings?.supportEmail ?? 'support@smartpos.co.ke';
  const supportPhone = settings?.supportPhone ?? '+254 700 000 000';
  const hasDownloads = downloads.length > 0;

  return (
    <>
      <footer className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="space-y-3 sm:col-span-2 md:col-span-1">
            <Logo size={32} />
            <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
              Modern point of sale for growing businesses. Sell faster, track every
              shilling, and manage stock — all from one place.
            </p>

            <div className="space-y-1.5 pt-1">
              <a
                href={`mailto:${supportEmail}`}
                className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{supportEmail}</span>
              </a>
              <a
                href={`tel:${supportPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{supportPhone}</span>
              </a>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground transition-colors hover:text-foreground">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground transition-colors hover:text-foreground">
                  Help
                </Link>
              </li>
              {hasDownloads ? (
                <li>
                  <Link to="/downloads" className="text-muted-foreground transition-colors hover:text-foreground">
                    Downloads
                  </Link>
                </li>
              ) : null}
              <li>
                <Link to="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                  Get started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              {LEGAL_LINKS.map((link) => (
                <li key={link.type}>
                  <button
                    type="button"
                    onClick={() => setLegalType(link.type)}
                    className="text-left text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li className="pt-1">
                <CookieSettingsButton />
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-foreground">
              Account
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/login" className="text-muted-foreground transition-colors hover:text-foreground">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">
                  Create account
                </Link>
              </li>
              <li>
                <Link to="/pending" className="text-muted-foreground transition-colors hover:text-foreground">
                  Check status
                </Link>
              </li>
              <li>
                <Link to="/verify" className="text-muted-foreground transition-colors hover:text-foreground">
                  Verify email
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
            <span>© {YEAR} SmartPOS. All rights reserved.</span>
            <span>Built for African businesses.</span>
          </div>
        </div>
      </footer>

      <LegalModal
        open={Boolean(legalType)}
        type={legalType}
        onClose={() => setLegalType(null)}
      />
    </>
  );
}