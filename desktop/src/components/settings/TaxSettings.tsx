import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { settingsApi } from '@/api/settings';
import { productApi } from '@/api/products';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import type { Product } from '@/types/product';
import type { NormalizedError } from '@/types/api';
import type { SpecificDiscount, SpecificDiscountType } from '@/types/settings';

const DISCOUNT_TYPES: { value: SpecificDiscountType; label: string }[] = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percent', label: 'Percentage (%)' },
  { value: 'buy_one_get_one', label: 'Buy One Get One Free' },
  { value: 'buy_x_get_y', label: 'Buy X Get Y Free' },
];

const EMPTY_DISCOUNT: SpecificDiscount = {
  name: '',
  type: 'fixed',
  value: 0,
  productIds: [],
  buyQuantity: 2,
  getQuantity: 1,
  getProductId: null,
};

export function TaxSettings() {
  const { settings, reload } = useClient();
  const toast = useToast();

  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxRate, setTaxRate] = useState(0);
  const [taxInclusive, setTaxInclusive] = useState(false);

  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountLabel, setDiscountLabel] = useState('Discount');
  const [discountRate, setDiscountRate] = useState(0);

  const [specific, setSpecific] = useState<SpecificDiscount[]>([]);

  const [loyaltyEnabled, setLoyaltyEnabled] = useState(false);
  const [loyaltyPointsPerAmount, setLoyaltyPointsPerAmount] = useState(100);
  const [loyaltyLabel, setLoyaltyLabel] = useState('Loyalty Points');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTaxEnabled(settings.taxEnabled === true);
    setTaxRate(settings.taxRate ?? 0);
    setTaxInclusive(settings.taxInclusive === true);

    setDiscountEnabled(settings.discountEnabled === true);
    setDiscountLabel((settings.discountLabel as string) || 'Discount');
    setDiscountRate(settings.discountRate ?? 0);

    setSpecific(
      Array.isArray(settings.specificDiscounts)
        ? settings.specificDiscounts.map((d) => ({
            name: d.name || '',
            type: d.type || 'fixed',
            value: d.value || 0,
            productIds: (d.productIds || []).map(String),
            buyQuantity: d.buyQuantity ?? 2,
            getQuantity: d.getQuantity ?? 1,
            getProductId: d.getProductId ?? null,
          }))
        : []
    );

    setLoyaltyEnabled(settings.loyaltyEnabled === true);
    setLoyaltyPointsPerAmount(settings.loyaltyPointsPerAmount ?? 100);
    setLoyaltyLabel((settings.loyaltyLabel as string) || 'Loyalty Points');

    setLoading(false);
  }, [
    settings.taxEnabled,
    settings.taxRate,
    settings.taxInclusive,
    settings.discountEnabled,
    settings.discountLabel,
    settings.discountRate,
    settings.specificDiscounts,
    settings.loyaltyEnabled,
    settings.loyaltyPointsPerAmount,
    settings.loyaltyLabel,
  ]);

  useEffect(() => {
    productApi
      .list({ limit: 200, active: true })
      .then((res) => setProducts(res.data ?? []))
      .catch(() => {});
  }, []);

  const addDiscount = () => {
    setSpecific([...specific, { ...EMPTY_DISCOUNT }]);
  };

  const removeDiscount = (i: number) => {
    setSpecific(specific.filter((_, idx) => idx !== i));
  };

  const updateDiscount = (i: number, patch: Partial<SpecificDiscount>) => {
    const next = [...specific];
    next[i] = { ...next[i], ...patch };
    setSpecific(next);
  };

  const toggleProduct = (i: number, productId: string) => {
    const d = specific[i];
    const has = d.productIds.some((p) => String(p) === String(productId));
    const next = has
      ? d.productIds.filter((p) => String(p) !== String(productId))
      : [...d.productIds, String(productId)];
    updateDiscount(i, { productIds: next });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update({
        taxEnabled,
        taxRate,
        taxInclusive,
        discountEnabled,
        discountLabel,
        discountRate,
        specificDiscounts: specific,
        loyaltyEnabled,
        loyaltyPointsPerAmount,
        loyaltyLabel,
      });
      await reload();
      toast.success('Settings saved');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-foreground">
        Tax, Discount & Loyalty
      </h2>

      <div className="max-w-3xl space-y-8">
        {/* VAT */}
        <div className="space-y-3 rounded-xl bg-muted/40 p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={taxEnabled}
              onChange={(e) => setTaxEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-sm font-semibold text-foreground">Enable VAT</span>
          </label>

          {taxEnabled ? (
            <div className="space-y-3 border-l-2 border-border pl-7">
              <FormField label="VAT rate (%)" htmlFor="taxRate">
                <Input
                  id="taxRate"
                  type="number"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
                />
              </FormField>

              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={taxInclusive}
                  onChange={(e) => setTaxInclusive(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                />
                <span>
                  <span className="block text-sm font-medium text-foreground">
                    Prices include VAT
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    When on, listed prices already contain VAT.
                  </span>
                </span>
              </label>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            When disabled, VAT will not appear on receipts.
          </p>
        </div>

        {/* Global Discount */}
        <div className="space-y-3 rounded-xl bg-muted/40 p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={discountEnabled}
              onChange={(e) => setDiscountEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-sm font-semibold text-foreground">
              Enable Global Discount
            </span>
          </label>

          {discountEnabled ? (
            <div className="grid grid-cols-1 gap-4 border-l-2 border-border pl-7 sm:grid-cols-2">
              <FormField label="Discount label" htmlFor="discountLabel">
                <Input
                  id="discountLabel"
                  value={discountLabel}
                  onChange={(e) => setDiscountLabel(e.target.value)}
                  placeholder="Discount"
                />
              </FormField>
              <FormField label="Discount rate (%)" htmlFor="discountRate">
                <Input
                  id="discountRate"
                  type="number"
                  value={discountRate}
                  onChange={(e) => setDiscountRate(Number(e.target.value) || 0)}
                />
              </FormField>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Percentage discount applied to all products without a specific discount.
          </p>
        </div>

        {/* Specific Discounts */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Specific Discounts
            </h3>
            <Button
              size="sm"
              onClick={addDiscount}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Add Discount
            </Button>
          </div>

          <p className="mb-4 text-xs text-muted-foreground">
            Products with a specific discount are excluded from the global discount.
          </p>

          {specific.length === 0 ? (
            <p className="rounded-lg bg-muted/40 py-6 text-center text-sm text-muted-foreground">
              No specific discounts.
            </p>
          ) : (
            <div className="space-y-4">
              {specific.map((d, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-muted/30 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      Discount #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeDiscount(i)}
                      className="rounded p-1 text-destructive hover:bg-destructive/10"
                      aria-label="Remove discount"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <FormField label="Name">
                      <Input
                        value={d.name}
                        onChange={(e) => updateDiscount(i, { name: e.target.value })}
                        placeholder="Weekend sale"
                      />
                    </FormField>
                    <FormField label="Type">
                      <Select
                        value={d.type}
                        onChange={(e) =>
                          updateDiscount(i, {
                            type: e.target.value as SpecificDiscountType,
                          })
                        }
                      >
                        {DISCOUNT_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </Select>
                    </FormField>
                  </div>

                  {(d.type === 'fixed' || d.type === 'percent') ? (
                    <div className="mb-3">
                      <FormField
                        label={d.type === 'percent' ? 'Percentage (%)' : 'Amount'}
                      >
                        <Input
                          type="number"
                          value={d.value}
                          onChange={(e) =>
                            updateDiscount(i, { value: Number(e.target.value) || 0 })
                          }
                        />
                      </FormField>
                    </div>
                  ) : null}

                  {d.type === 'buy_one_get_one' ? (
                    <div className="mb-3 rounded-lg bg-primary/5 p-3 text-sm text-primary">
                      Buy 1, get 1 free.
                    </div>
                  ) : null}

                  {d.type === 'buy_x_get_y' ? (
                    <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <FormField label="Buy">
                        <Input
                          type="number"
                          value={d.buyQuantity ?? 2}
                          onChange={(e) =>
                            updateDiscount(i, {
                              buyQuantity: Number(e.target.value) || 1,
                            })
                          }
                        />
                      </FormField>
                      <FormField label="Get Free">
                        <Input
                          type="number"
                          value={d.getQuantity ?? 1}
                          onChange={(e) =>
                            updateDiscount(i, {
                              getQuantity: Number(e.target.value) || 1,
                            })
                          }
                        />
                      </FormField>
                      <FormField label="Free Product">
                        <Select
                          value={d.getProductId ?? ''}
                          onChange={(e) =>
                            updateDiscount(i, {
                              getProductId: e.target.value || null,
                            })
                          }
                        >
                          <option value="">Same product</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name}
                            </option>
                          ))}
                        </Select>
                      </FormField>
                    </div>
                  ) : null}

                  <div className="border-t border-border pt-3">
                    <label className="mb-2 block text-sm font-medium text-foreground">
                      Apply to Products ({d.productIds.length} selected)
                    </label>
                    {products.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No products yet. Add products first.
                      </p>
                    ) : (
                      <div className="grid max-h-48 grid-cols-1 gap-1.5 overflow-y-auto rounded-lg border border-border bg-background p-2 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map((p) => (
                          <label
                            key={p._id}
                            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={d.productIds.some(
                                (pid) => String(pid) === String(p._id)
                              )}
                              onChange={() => toggleProduct(i, p._id)}
                              className="h-4 w-4 rounded border-input accent-primary"
                            />
                            <span className="truncate">{p.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Loyalty */}
        <div className="space-y-3 rounded-xl bg-muted/40 p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={loyaltyEnabled}
              onChange={(e) => setLoyaltyEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-input accent-primary"
            />
            <span className="text-sm font-semibold text-foreground">
              Enable Loyalty Points
            </span>
          </label>

          {loyaltyEnabled ? (
            <div className="grid grid-cols-1 gap-4 border-l-2 border-border pl-7 sm:grid-cols-2">
              <FormField
                label="Currency per point"
                htmlFor="loyaltyPointsPerAmount"
                hint="How much a customer spends to earn 1 point"
              >
                <Input
                  id="loyaltyPointsPerAmount"
                  type="number"
                  value={loyaltyPointsPerAmount}
                  onChange={(e) =>
                    setLoyaltyPointsPerAmount(Number(e.target.value) || 100)
                  }
                />
              </FormField>
              <FormField label="Points label" htmlFor="loyaltyLabel">
                <Input
                  id="loyaltyLabel"
                  value={loyaltyLabel}
                  onChange={(e) => setLoyaltyLabel(e.target.value)}
                  placeholder="Loyalty Points"
                />
              </FormField>
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            When enabled, customers earn{' '}
            <span className="text-foreground">1 point</span> for every{' '}
            {loyaltyPointsPerAmount} spent. Points are awarded when a sale is attached
            to a customer.
          </p>
        </div>

        <Button onClick={handleSave} loading={saving} size="lg">
          Save Settings
        </Button>
      </div>
    </div>
  );
}