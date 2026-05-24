import { useContext } from "react";
import { CookieConsentContext } from "../context/CookieConsentContext";

export const useCookieConsent = () => {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) throw new Error("useCookieConsent must be used within CookieConsentProvider");
  return ctx;
};