import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import Button from '../../ui/Button';
import LegalLink from './LegalLink';
import storage from '../../../utils/storage';

const STORAGE_KEY = 'cookie_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = storage.getItem(STORAGE_KEY);
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    storage.setItem(STORAGE_KEY, { accepted: true, at: Date.now() });
    setVisible(false);
  };

  const handleReject = () => {
    storage.setItem(STORAGE_KEY, { accepted: false, at: Date.now() });
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 py-3 bg-[var(--card-bg)] border-t border-[var(--border-color)] shadow-lg">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Cookie className="w-5 h-5 text-[var(--accent)] shrink-0" />

        <p className="flex-1 text-sm text-[var(--text-secondary)] leading-relaxed">
          We use cookies to improve your experience and analyze traffic. See our{' '}
          <LegalLink type="privacy" className="text-[var(--accent)] hover:underline">
            Privacy Policy
          </LegalLink>{' '}
          for details.
        </p>

        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="secondary" onClick={handleReject}>
            Reject
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}