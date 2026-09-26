import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { settingsApi } from '@/api/settings';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { cn } from '@/utils/classNames';
import type { NormalizedError } from '@/types/api';

const CURRENCIES = [
  'KES',
  'USD',
  'EUR',
  'GBP',
  'UGX',
  'TZS',
  'RWF',
  'BIF',
  'ZAR',
  'NGN',
  'GHS',
];

export function CurrencySettings() {
  const { settings, reload } = useClient();
  const toast = useToast();

  const [selected, setSelected] = useState('KES');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setSelected(settings.currency ?? 'KES');
    setLoading(false);
  }, [settings.currency]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update({ currency: selected });
      await reload();
      toast.success(`Currency changed to ${selected}`);
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
      <h2 className="mb-2 text-lg font-semibold text-foreground">Currency</h2>
      <p className="mb-4 text-sm text-muted-foreground">
        Select your business currency. All prices will be displayed in this currency.
      </p>

      <div className="mb-6 grid max-w-2xl grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {CURRENCIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setSelected(c)}
            className={cn(
              'rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors',
              selected === c
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-foreground/30'
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <Button onClick={handleSave} loading={saving} size="lg">
        Save currency
      </Button>
    </div>
  );
}