import { useState } from "react";
import { useCookieConsent } from "../../hooks/useCookieConsent";
import { Button } from "../ui/Button";
import { LegalModal } from "./LegalModal";
import { Cookie } from "lucide-react";

export const CookieConsentBanner = () => {
  const { showBanner, acceptAll, declineAll, savePreferences } = useCookieConsent();
  const [showPolicy, setShowPolicy] = useState(false);

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-xl z-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Cookie className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">We Use Cookies</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                We use cookies to enhance your experience. By continuing, you agree to our use of cookies.{" "}
                <button
                  onClick={() => setShowPolicy(true)}
                  className="text-primary-600 hover:underline"
                >
                  Learn more
                </button>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={declineAll}>Decline</Button>
            <Button variant="outline" size="sm" onClick={() => savePreferences({ analytics: false, marketing: false })}>Essential Only</Button>
            <Button size="sm" onClick={acceptAll}>Accept All</Button>
          </div>
        </div>
      </div>

      <LegalModal section="cookies" isOpen={showPolicy} onClose={() => setShowPolicy(false)} />
    </>
  );
};