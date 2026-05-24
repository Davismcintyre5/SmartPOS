import { createContext, useState, useEffect } from "react";

export const CookieConsentContext = createContext(null);

export const CookieConsentProvider = ({ children }) => {
  const [consent, setConsent] = useState(() => localStorage.getItem("cookie_consent"));

  const acceptAll = () => { localStorage.setItem("cookie_consent", "all"); setConsent("all"); };
  const acceptEssential = () => { localStorage.setItem("cookie_consent", "essential"); setConsent("essential"); };
  const showBanner = consent === null;

  return (
    <CookieConsentContext.Provider value={{ consent, showBanner, acceptAll, acceptEssential }}>
      {children}
    </CookieConsentContext.Provider>
  );
};