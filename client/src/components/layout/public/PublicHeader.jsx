import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { useSite } from '../../../context/SiteContext';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import Button from '../../ui/Button';

const SUPPORT_LINKS = [
  { label: 'Help Center', type: 'route', to: '/help' },
  { label: 'FAQs', type: 'route', to: '/faqs' },
  { label: 'Contact', type: 'scroll', target: 'contact' }
];

export default function PublicHeader() {
  const { site } = useSite();
  const { user } = useAuth();
  const { resolvedMode, toggleMode } = useTheme();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [mobileSupportOpen, setMobileSupportOpen] = useState(false);

  const dropdownRef = useRef(null);

  const name = site?.branding?.platformName || 'SmartPOS';
  const logoUrl = site?.branding?.logoUrl;
  const hasDownloads = (site?.downloads || []).length > 0;

  const navLinks = [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    ...(hasDownloads
      ? [{ label: 'Downloads', to: '/downloads', isRoute: true }]
      : [])
  ];

  const close = () => {
    setOpen(false);
    setSupportOpen(false);
    setMobileSupportOpen(false);
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setSupportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleScrollToFooter = () => {
    const el = document.getElementById('contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      close();
      return;
    }
    navigate('/');
    setTimeout(() => {
      const target = document.getElementById('contact');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    close();
  };

  const handleSupportClick = (item) => {
    if (item.type === 'route') {
      navigate(item.to);
      close();
    } else if (item.type === 'scroll') {
      handleScrollToFooter();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
      <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between gap-4">
<Link
  to="/"
  onClick={close}
  className="flex items-center gap-2 shrink-0 group"
>
  {logoUrl && (
    <img src={logoUrl} alt={name} className="h-8 object-contain" />
  )}
  <span className="text-lg font-semibold text-[var(--accent)] tracking-tight group-hover:opacity-80 transition-opacity">
    {name}
  </span>
</Link>
        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) =>
            link.isRoute ? (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                {link.label}
              </a>
            )
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setSupportOpen((v) => !v)}
              className="flex items-center gap-1 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Support
              <ChevronDown
                className={`w-4 h-4 transition-transform ${supportOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {supportOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-[var(--radius)] shadow-lg py-1 z-50">
                {SUPPORT_LINKS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSupportClick(item)}
                    className="w-full text-left px-4 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleMode}
            className="p-2 rounded-[var(--radius)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Toggle theme"
          >
            {resolvedMode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {user ? (
            <Button size="sm" onClick={() => navigate('/dashboard')}>
              Open app
            </Button>
          ) : (
            <>
              <Button size="sm" variant="ghost" onClick={() => navigate('/login')}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Start free trial
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 rounded-[var(--radius)] text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
          aria-label="Menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[var(--border-color)] bg-[var(--bg-primary)]">
          <div className="px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) =>
              link.isRoute ? (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={close}
                  className="px-3 py-2 rounded-[var(--radius)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="px-3 py-2 rounded-[var(--radius)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {link.label}
                </a>
              )
            )}

            <button
              onClick={() => setMobileSupportOpen((v) => !v)}
              className="flex items-center justify-between px-3 py-2 rounded-[var(--radius)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
            >
              Support
              <ChevronDown
                className={`w-4 h-4 transition-transform ${mobileSupportOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {mobileSupportOpen && (
              <div className="ml-3 pl-3 border-l border-[var(--border-color)] flex flex-col gap-1">
                {SUPPORT_LINKS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleSupportClick(item)}
                    className="text-left px-3 py-2 rounded-[var(--radius)] text-sm text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => { toggleMode(); close(); }}
              className="px-3 py-2 rounded-[var(--radius)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--sidebar-hover)] hover:text-[var(--text-primary)] transition-colors text-left flex items-center gap-2"
            >
              {resolvedMode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {resolvedMode === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>

            <div className="border-t border-[var(--border-color)] my-2" />

            {user ? (
              <Button onClick={() => { navigate('/dashboard'); close(); }}>
                Open app
              </Button>
            ) : (
              <>
                <Button variant="secondary" onClick={() => { navigate('/login'); close(); }}>
                  Sign in
                </Button>
                <Button onClick={() => { navigate('/register'); close(); }}>
                  Start free trial
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}