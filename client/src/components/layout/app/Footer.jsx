import { useSite } from '../../../context/SiteContext';

export default function Footer() {
  const { site } = useSite();
  const name = site?.branding?.platformName || 'SmartPOS';
  const email = site?.branding?.supportEmail;
  const phone = site?.branding?.supportPhone;

  return (
    <footer className="hidden md:flex h-10 shrink-0 px-6 items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
      <span>© {new Date().getFullYear()} {name}</span>
      <span className="flex items-center gap-3">
        {email && (
          <a href={`mailto:${email}`} className="hover:text-[var(--text-primary)] transition-colors">
            {email}
          </a>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="hover:text-[var(--text-primary)] transition-colors">
            {phone}
          </a>
        )}
      </span>
    </footer>
  );
}