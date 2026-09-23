import { Link } from 'react-router-dom';
import { Printer, Pencil } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/format';
import { formatMoney } from '@/utils/currency';
import { initials } from '@/utils/format';
import type { Customer } from '@/types/customer';

export interface CustomerDetailModalProps {
  open: boolean;
  customer: Customer | null;
  currency: string;
  onClose: () => void;
  onPrint: (c: Customer) => void;
}

export function CustomerDetailModal({
  open,
  customer,
  currency,
  onClose,
  onPrint,
}: CustomerDetailModalProps) {
  if (!customer) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Customer details"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={() => onPrint(customer)} leftIcon={<Printer className="h-4 w-4" />}>
            Print card
          </Button>
          <Link to={`/app/customers/${customer.id}/edit`}>
            <Button leftIcon={<Pencil className="h-4 w-4" />}>Edit</Button>
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {initials(customer.name)}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-foreground">
              {customer.name}
            </h2>
            <p className="text-xs text-muted-foreground">
              Customer since {formatDate(customer.createdAt)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Stat label="Phone" value={customer.phone || '—'} />
          <Stat label="Email" value={customer.email || '—'} />
          <Stat
            label="Card number"
            value={customer.loyaltyCardNumber || '—'}
            mono
          />
          <Stat
            label="Loyalty points"
            value={String(customer.loyaltyPoints || 0)}
            accent="warning"
          />
          <Stat
            label="Total spent"
            value={formatMoney(customer.totalSpent || 0, currency)}
          />
          <Stat label="Visits" value={String(customer.visitCount || 0)} />
        </div>
      </div>
    </Modal>
  );
}

function Stat({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: string;
  mono?: boolean;
  accent?: 'warning';
}) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-0.5 truncate text-sm font-medium ${
          mono ? 'font-mono' : ''
        } ${accent === 'warning' ? 'text-warning' : 'text-foreground'}`}
      >
        {value}
      </p>
    </div>
  );
}