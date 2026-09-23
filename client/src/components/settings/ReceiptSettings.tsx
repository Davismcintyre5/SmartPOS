import { useEffect, useState } from 'react';
import { Receipt } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { FormField } from '@/components/ui/FormField';
import { Spinner } from '@/components/ui/Spinner';
import { settingsApi } from '@/api/settings';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import type { NormalizedError } from '@/types/api';

export function ReceiptSettings() {
  const { settings, currency, reload } = useClient();
  const toast = useToast();

  const [header, setHeader] = useState('');
  const [footer, setFooter] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setHeader((settings.receiptTemplate as string) ?? '');
    setFooter((settings.receiptFooter as string) ?? '');
    setLoading(false);
  }, [settings.receiptTemplate, settings.receiptFooter]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update({
        receiptTemplate: header,
        receiptFooter: footer,
      });
      await reload();
      toast.success('Receipt saved');
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
      <h2 className="mb-4 text-lg font-semibold text-foreground">Receipt</h2>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="max-w-md space-y-4">
          <FormField
            label="Header"
            htmlFor="header"
            hint="Business name and address shown at the top."
          >
            <Textarea
              id="header"
              rows={3}
              value={header}
              onChange={(e) => setHeader(e.target.value)}
            />
          </FormField>

          <FormField
            label="Footer"
            htmlFor="footer"
            hint="Thank-you message shown above the system line."
          >
            <Textarea
              id="footer"
              rows={2}
              value={footer}
              onChange={(e) => setFooter(e.target.value)}
            />
          </FormField>

          <Button onClick={handleSave} loading={saving}>
            Save receipt
          </Button>
        </div>

        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4">
          <p className="mb-3 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <Receipt className="h-3.5 w-3.5" /> Preview
          </p>
          <div className="mx-auto max-w-[220px] text-center font-mono text-xs text-foreground">
            {header.split('\n').map((line, i) => (
              <p key={i} className="font-semibold">{line || ' '}</p>
            ))}
            <p className="mt-1 text-[10px] text-muted-foreground">
              {new Date().toLocaleDateString()}{' '}
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] text-muted-foreground">Receipt: #ABC123</p>
            <p className="text-[10px] text-muted-foreground">Cashier: John</p>
            <p className="text-[10px] text-muted-foreground">Customer: Jane Doe</p>

            <div className="my-2 border-t border-dashed border-border pt-1">
              <div className="flex justify-between"><span>Item A ×2</span><span>{formatMoney(200, currency)}</span></div>
              <div className="flex justify-between"><span>Item B ×1</span><span>{formatMoney(150, currency)}</span></div>
            </div>
            <div className="my-2 border-t border-dashed border-border pt-1">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(350, currency)}</span></div>
              <div className="flex justify-between"><span>VAT (16%)</span><span>{formatMoney(56, currency)}</span></div>
            </div>
            <div className="my-2 flex justify-between border-t border-dashed border-border pt-1 font-bold">
              <span>Total</span><span>{formatMoney(406, currency)}</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span>Payment: M-Pesa</span>
            </div>

            {footer ? <p className="mt-2 text-muted-foreground">{footer}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
}