// components/settings/CurrencySettings.jsx
import { useState, useEffect } from "react";
import { currencyApi } from "../../api/currencyApi";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { storage } from "../../utils/storage";

const currencies = ["KES", "USD", "EUR", "GBP", "UGX", "TZS", "RWF", "BIF", "ZAR", "NGN", "GHS"];

export const CurrencySettings = () => {
  const [selected, setSelected] = useState("KES");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    currencyApi.get().then((res) => {
      if (res.success) {
        const currency = res.data?.currency || "KES";
        setSelected(currency);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try {
      await currencyApi.update({ currency: selected });
      storage.set("smartpos_currency", selected);
      window.dispatchEvent(new Event("storage"));
      setSuccess(`Currency changed to ${selected}. All pages updated.`);
      // Force reload after 1 second
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      setSuccess("Failed to update currency.");
    }
    setSaving(false);
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Currency</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Select your business currency. All prices will be displayed in this currency.
      </p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
        {currencies.map((c) => (
          <button
            key={c}
            onClick={() => setSelected(c)}
            className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
              selected === c
                ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400"
                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
        </div>
      )}

      <Button onClick={handleSave} loading={saving} size="lg">
        Save Currency
      </Button>
    </div>
  );
};