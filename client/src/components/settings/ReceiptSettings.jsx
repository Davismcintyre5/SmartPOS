// components/settings/ReceiptSettings.jsx
import { useState, useEffect } from "react";
import { settingsApi } from "../../api/settingsApi";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { Receipt } from "lucide-react";

export const ReceiptSettings = () => {
  const [form, setForm] = useState({ receiptHeader: "", receiptFooter: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    settingsApi.getBusiness().then((res) => {
      const business = res.success ? (res.data || res) : {};
      const defaultHeader = `${business.businessName || "SmartPOS"}\n${business.address || "Nairobi, Kenya"}`;
      const defaultFooter = "Thank you for shopping with us!";

      settingsApi.getReceipt().then((recRes) => {
        if (recRes.success) {
          const data = recRes.data || recRes;
          setForm({
            receiptHeader: data.receiptHeader || defaultHeader,
            receiptFooter: data.receiptFooter || defaultFooter,
          });
        } else {
          setForm({ receiptHeader: defaultHeader, receiptFooter: defaultFooter });
        }
      }).finally(() => setLoading(false));
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try { await settingsApi.updateReceipt(form); setSuccess("Receipt saved."); } catch {}
    setSaving(false);
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Receipt</h2>
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Header</label>
          <textarea rows={3} value={form.receiptHeader} onChange={(e) => setForm({ ...form, receiptHeader: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <p className="text-xs text-gray-400 mt-1">Business name and address shown at the top.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Footer</label>
          <textarea rows={2} value={form.receiptFooter} onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          <p className="text-xs text-gray-400 mt-1">Thank you message shown above the system line.</p>
        </div>

        {/* Preview */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 mb-3 flex items-center gap-1"><Receipt className="w-3.5 h-3.5" /> Preview</p>
          <div className="text-xs text-center font-mono text-gray-700 dark:text-gray-300 max-w-[220px] mx-auto">
            {form.receiptHeader.split("\n").map((line, i) => <p key={i} className="font-semibold">{line || " "}</p>)}
            <p className="text-gray-400 text-[10px] mt-1">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-gray-400 text-[10px]">Receipt: #ABC123</p>
            <p className="text-gray-400 text-[10px]">Cashier: John</p>
            <p className="text-gray-400 text-[10px]">Customer: Jane Doe</p>
            <div className="border-t border-dashed border-gray-300 my-2 pt-1">
              <div className="flex justify-between"><span>Item A x2</span><span>200.00</span></div>
              <div className="flex justify-between"><span>Item B x1</span><span>150.00</span></div>
            </div>
            <div className="border-t border-dashed border-gray-300 my-2 pt-1">
              <div className="flex justify-between"><span>Subtotal</span><span>350.00</span></div>
              <div className="flex justify-between"><span>VAT (16%)</span><span>56.00</span></div>
              <div className="flex justify-between text-red-500"><span>Discount</span><span>-20.00</span></div>
            </div>
            <div className="border-t border-dashed border-gray-300 my-2 pt-1 flex justify-between font-bold"><span>Total</span><span>386.00</span></div>
            <div className="flex justify-between text-[10px] mt-1">
              <span>Payment: M-Pesa</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Paid: 400.00</span>
              <span>Change: 14.00</span>
            </div>
            {form.receiptFooter && <p className="mt-2 text-gray-500">{form.receiptFooter}</p>}
            <p className="text-[9px] text-gray-400 mt-2 pt-2 border-t border-dashed border-gray-200">
              Generated by SmartPOS on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        {success && <p className="text-sm text-green-600">{success}</p>}
        <Button onClick={handleSave} loading={saving}>Save Receipt</Button>
      </div>
    </div>
  );
};