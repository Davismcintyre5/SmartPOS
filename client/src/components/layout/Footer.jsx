import { useSite } from '../../context/SiteContext';

export default function Footer() {
  const { site } = useSite();
  const name = site?.branding?.platformName || 'SmartPOS';
  const email = site?.branding?.supportEmail;
  const phone = site?.branding?.supportPhone;

  return (
    <footer className="h-10 px-6 flex items-center justify-between text-xs text-[var(--text-muted)] border-t border-[var(--border-color)]">
      <span>© {new Date().getFullYear()} {name}</span>
      <span className="flex items-center gap-3">
        {email && <a href={`mailto:${email}`} className="hover:text-[var(--text-primary)]">{email}</a>}
        {phone && <a href={`tel:${phone}`} className="hover:text-[var(--text-primary)]">{phone}</a>}
      </span>
    </footer>
  );
}