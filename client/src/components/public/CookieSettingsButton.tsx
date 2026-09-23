import { Cookie } from 'lucide-react';
import { storage } from '@/utils/storage';

export function CookieSettingsButton() {
  const handleClick = () => {
    storage.remove('cookie_consent');
    window.location.reload();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
    >
      <Cookie className="h-3.5 w-3.5" />
      <span>Cookie settings</span>
    </button>
  );
}