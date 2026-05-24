// components/settings/TaxDiscountSettings.jsx
import { useState, useEffect } from "react";
import { settingsApi } from "../../api/settingsApi";
import { productApi } from "../../api/productApi";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Spinner } from "../ui/Spinner";
import { Plus, Trash2 } from "lucide-react";

const discountTypes = [
  { value: "fixed", label: "Fixed Amount" },
  { value: "percent", label: "Percentage (%)" },
  { value: "buy_one_get_one", label: "Buy One Get One Free" },
  { value: "buy_x_get_y", label: "Buy X Get Y Free" },
];

export const TaxDiscountSettings = () => {
  const [form, setForm] = useState({
    vatRate: 0, vatEnabled: false,
    globalDiscountEnabled: false, globalDiscountName: "Discount", globalDiscountRate: 0,
    specificDiscounts: [],
    loyaltyEnabled: false, loyaltyPointsPerAmount: 100, loyaltyLabel: "Loyalty Points",
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    Promise.all([settingsApi.getReceipt(), productApi.getAll({ limit: 200 })])
      .then(([recRes, prodRes]) => {
        if (recRes.success) {
          const data = recRes.data || recRes;
          setForm({
            vatRate: data.vatRate ?? 0,
            vatEnabled: data.vatEnabled === true,
            globalDiscountEnabled: data.globalDiscountEnabled === true,
            globalDiscountName: data.globalDiscountName || "Discount",
            globalDiscountRate: data.globalDiscountRate || 0,
            specificDiscounts: (data.specificDiscounts || []).map((d) => ({ ...d, productIds: (d.productIds || []).map((id) => String(id)) })),
            loyaltyEnabled: data.loyaltyEnabled === true,
            loyaltyPointsPerAmount: data.loyaltyPointsPerAmount || 100,
            loyaltyLabel: data.loyaltyLabel || "Loyalty Points",
          });
        }
        if (prodRes.success) setProducts(prodRes.data?.products || prodRes.products || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSuccess("");
    try { await settingsApi.updateReceipt(form); setSuccess("Settings saved."); } catch {}
    setSaving(false);
  };

  const addDiscount = () => {
    setForm({ ...form, specificDiscounts: [...form.specificDiscounts, { name: "", type: "fixed", value: 0, productIds: [], buyQuantity: 2, getQuantity: 1, getProductId: "" }] });
  };

  const removeDiscount = (index) => {
    setForm({ ...form, specificDiscounts: form.specificDiscounts.filter((_, i) => i !== index) });
  };

  const updateDiscount = (index, field, value) => {
    const updated = [...form.specificDiscounts];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, specificDiscounts: updated });
  };

  const toggleProduct = (discountIndex, productId) => {
    const discount = form.specificDiscounts[discountIndex];
    const id = String(productId);
    const has = discount.productIds.some((pid) => String(pid) === id);
    updateDiscount(discountIndex, "productIds", has ? discount.productIds.filter((pid) => String(pid) !== id) : [...discount.productIds, id]);
  };

  if (loading) return <Spinner className="py-8" />;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tax, Discount & Loyalty</h2>
      <div className="space-y-8 max-w-2xl">

        {/* VAT */}
        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.vatEnabled} onChange={(e) => setForm({ ...form, vatEnabled: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable VAT</span>
          </label>
          {form.vatEnabled && <Input label="VAT Rate (%)" type="number" value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: Number(e.target.value) || 0 })} />}
          <p className="text-xs text-gray-400">When disabled, VAT will not appear on receipts.</p>
        </div>

        {/* Global Discount */}
        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.globalDiscountEnabled} onChange={(e) => setForm({ ...form, globalDiscountEnabled: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Global Discount</span>
          </label>
          {form.globalDiscountEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Discount Label" value={form.globalDiscountName} onChange={(e) => setForm({ ...form, globalDiscountName: e.target.value })} placeholder="Discount" />
              <Input label="Discount Rate (%)" type="number" value={form.globalDiscountRate} onChange={(e) => setForm({ ...form, globalDiscountRate: Number(e.target.value) || 0 })} />
            </div>
          )}
          <p className="text-xs text-gray-400">Percentage discount applied to all products without a specific discount.</p>
        </div>

        {/* Specific Discounts */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Specific Discounts</h3>
            <Button size="sm" onClick={addDiscount}><Plus className="w-4 h-4" /> Add Discount</Button>
          </div>
          <p className="text-xs text-gray-400 mb-4">Products with a specific discount are excluded from the global discount.</p>
          {form.specificDiscounts.length === 0 ? (
            <p className="text-sm text-gray-500 py-6 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">No specific discounts.</p>
          ) : (
            <div className="space-y-4">
              {form.specificDiscounts.map((discount, i) => (
                <div key={i} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Discount #{i + 1}</span>
                    <button onClick={() => removeDiscount(i)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input label="Name" value={discount.name} onChange={(e) => updateDiscount(i, "name", e.target.value)} />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                      <select value={discount.type} onChange={(e) => updateDiscount(i, "type", e.target.value)} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
                        {discountTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                  </div>
                  {(discount.type === "fixed" || discount.type === "percent") && (
                    <Input label={discount.type === "percent" ? "Percentage (%)" : "Amount"} type="number" value={discount.value} onChange={(e) => updateDiscount(i, "value", Number(e.target.value) || 0)} className="mb-3" />
                  )}
                  {discount.type === "buy_one_get_one" && <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-sm text-blue-700">Buy 1, get 1 free.</div>}
                  {discount.type === "buy_x_get_y" && (
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <Input label="Buy" type="number" value={discount.buyQuantity} onChange={(e) => updateDiscount(i, "buyQuantity", Number(e.target.value) || 1)} />
                      <Input label="Get Free" type="number" value={discount.getQuantity} onChange={(e) => updateDiscount(i, "getQuantity", Number(e.target.value) || 1)} />
                      <div>
                        <label className="block text-sm font-medium mb-1">Free Product</label>
                        <select value={discount.getProductId} onChange={(e) => updateDiscount(i, "getProductId", e.target.value)} className="w-full px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm">
                          <option value="">Same product</option>
                          {products.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-3 mt-3">
                    <label className="block text-sm font-medium mb-2">Apply to Products ({discount.productIds.length} selected)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto p-2 bg-white dark:bg-gray-800 rounded-lg border">
                      {products.map((p) => (
                        <label key={p._id} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm">
                          <input type="checkbox" checked={discount.productIds.some((pid) => String(pid) === String(p._id))} onChange={() => toggleProduct(i, p._id)} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
                          <span className="truncate">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyalty */}
        <div className="p-5 bg-gray-50 dark:bg-gray-900 rounded-xl space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.loyaltyEnabled} onChange={(e) => setForm({ ...form, loyaltyEnabled: e.target.checked })} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Loyalty Points</span>
          </label>
          {form.loyaltyEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Points per KSh" type="number" value={form.loyaltyPointsPerAmount} onChange={(e) => setForm({ ...form, loyaltyPointsPerAmount: Number(e.target.value) || 100 })} />
              <Input label="Points Label" value={form.loyaltyLabel} onChange={(e) => setForm({ ...form, loyaltyLabel: e.target.value })} placeholder="Loyalty Points" />
            </div>
          )}
          <p className="text-xs text-gray-400">When enabled, customers earn points on every sale. Points = Total ÷ Amount. Loyalty card input appears in POS.</p>
        </div>

        {success && <p className="text-sm text-green-600">{success}</p>}
        <Button onClick={handleSave} loading={saving} size="lg">Save Settings</Button>
      </div>
    </div>
  );
};