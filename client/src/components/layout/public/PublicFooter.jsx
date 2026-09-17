import { Link } from 'react-router-dom';
import { Mail, Phone, Store } from 'lucide-react';
import { useSite } from '../../../context/SiteContext';
import LegalLink from '../../app/public/LegalLink';

export default function PublicFooter() {
  const { site } = useSite();
  const name = site?.branding?.platformName || 'SmartPOS';
  const email = site?.branding?.supportEmail;
  const phone = site?.branding?.supportPhone;
  const hasDownloads = (site?.downloads || []).length > 0;

  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <Store className="w-6 h-6 text-[var(--accent)]" />
              <span className="text-lg font-bold text-[var(--accent)] group-hover:opacity-80 transition-opacity">
                {name}
              </span>
            </Link>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed mt-4 max-w-xs">
              Fast, reliable point of sale built for supermarkets, wholesale, and retail shops across Africa.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="/#features"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Pricing
                </Link>
              </li>
              {hasDownloads && (
                <li>
                  <Link
                    to="/downloads"
                    className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    Downloads
                  </Link>
                </li>
              )}
              <li>
                <Link
                  to="/register"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Start free trial
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/help"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/faqs"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  FAQs
                </Link>
              </li>
            </ul>

            {(email || phone) && (
              <div className="mt-4 space-y-3">
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors break-all"
                  >
                    <Mail className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{email}</span>
                  </a>
                )}
                {phone && (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-start gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    <Phone className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
                    <span>{phone}</span>
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              <li className="leading-none">
                <LegalLink
                  type="terms"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Terms of Service
                </LegalLink>
              </li>
              <li className="leading-none">
                <LegalLink
                  type="privacy"
                  className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  Privacy Policy
                </LegalLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
          <p>© {year} {name}. All rights reserved.</p>
          <p>Built for retail, everywhere.</p>
        </div>
      </div>
    </footer>
  );
}