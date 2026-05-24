import { useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { useCookieConsent } from "../../hooks/useCookieConsent";

export const CookieSettingsModal = ({ isOpen, onClose }) => {
  const { consent, savePreferences } = useCookieConsent();
  const [prefs, setPrefs] = useState({
    analytics: consent?.analytics ?? true,
    marketing: consent?.marketing ?? true,
  });

  const handleSave = () => {
    savePreferences(prefs);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cookie Settings" size="md">
      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Essential Cookies</p>
            <p className="text-xs text-gray-500">Required for the website to function. Always enabled.</p>
          </div>
          <input type="checkbox" checked disabled className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Analytics Cookies</p>
            <p className="text-xs text-gray-500">Help us understand how you use the site.</p>
          </div>
          <input
            type="checkbox"
            checked={prefs.analytics}
            onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })}
            className="w-5 h-5 text-primary-600"
          />
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Marketing Cookies</p>
            <p className="text-xs text-gray-500">Used to show relevant ads and promotions.</p>
          </div>
          <input
            type="checkbox"
            checked={prefs.marketing}
            onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })}
            className="w-5 h-5 text-primary-600"
          />
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Preferences</Button>
        </div>
      </div>
    </Modal>
  );
};