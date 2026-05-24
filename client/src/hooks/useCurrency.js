// hooks/useCurrency.js
import { useState, useEffect } from "react";
import { storage } from "../utils/storage";

const symbols = {
  KES: "KSh", USD: "$", EUR: "€", GBP: "£",
  UGX: "USh", TZS: "TSh", RWF: "RF", BIF: "FBu",
  ZAR: "R", NGN: "₦", GHS: "GH₵",
};

export const useCurrency = () => {
  const [currency, setCurrency] = useState(() => storage.get("smartpos_currency") || "KES");

  useEffect(() => {
    const handleStorage = () => {
      const c = storage.get("smartpos_currency") || "KES";
      setCurrency(c);
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const symbol = symbols[currency] || currency;

  return { currency, symbol };
};