import { Outlet } from 'react-router-dom';
import PublicHeader from './PublicHeader';
import PublicFooter from './PublicFooter';
import LandingChat from '../../app/public/LandingChat';
import CookieConsent from '../../app/public/CookieConsent';

export default function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-secondary)] text-[var(--text-primary)]">
      <PublicHeader />

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <PublicFooter />

      <LandingChat />
      <CookieConsent />
    </div>
  );
}