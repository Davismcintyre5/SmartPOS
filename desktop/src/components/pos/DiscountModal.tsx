import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { useCart } from '@/hooks/useCart';
import { formatMoney } from '@/utils/currency';

export interface DiscountModalProps {
  open: boolean;
  onClose: () => void;
}

export function DiscountModal({ open, onClose }: DiscountModalProps) {
  const { totals, discount, setDiscount } = useCart();
  const [mode, setMode] = useState<'flat' | 'percent'>('flat');
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (open) {
      setMode('flat');
      setValue(discount);
    }
  }, [open, discount]);

  const handleApply = () => {
    const computed =
      mode === 'percent' ? (totals.subtotal * value) / 100 : value;
    setDiscount(Math.max(0, computed));
    onClose();
  };

  const handleClear = () => {
    setDiscount(0);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Apply discount"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="ghost" onClick={handleClear}>
            Clear
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode('flat')}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'flat'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            Flat amount
          </button>
          <button
            type="button"
            onClick={() => setMode('percent')}
            className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
              mode === 'percent'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            Percentage
          </button>
        </div>

        <FormField
          label={mode === 'flat' ? 'Amount' : 'Percentage (%)'}
          htmlFor="discount-value"
          hint={
            mode === 'percent'
              ? `Subtotal: ${formatMoney(totals.subtotal, totals.currency)}`
              : undefined
          }
        >
          <Input
            id="discount-value"
            type="number"
            autoFocus
            value={value}
            onChange={(e) => setValue(Number(e.target.value) || 0)}
          />
        </FormField>

        {mode === 'percent' && value > 0 ? (
          <p className="text-xs text-muted-foreground">
            = {formatMoney((totals.subtotal * value) / 100, totals.currency)} off
          </p>
        ) : null}
      </div>
    </Modal>
  );
}