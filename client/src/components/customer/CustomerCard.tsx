import { Link } from 'react-router-dom';
import { Phone, Mail, CreditCard, Gift, Printer, Eye, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/utils/format';
import { initials } from '@/utils/format';
import type { Customer } from '@/types/customer';

export interface CustomerCardProps {
  customer: Customer;
  onView: (c: Customer) => void;
  onPrint: (c: Customer) => void;
  onDelete: (c: Customer) => void;
}

export function CustomerCard({ customer, onView, onPrint, onDelete }: CustomerCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {initials(customer.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{customer.name}</p>
          <p className="text-xs text-muted-foreground">
            Joined {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      <div className="space-y-1 text-xs">
        {customer.phone ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{customer.phone}</span>
          </div>
        ) : null}
        {customer.email ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{customer.email}</span>
          </div>
        ) : null}
        {customer.loyaltyCardNumber ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <CreditCard className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate font-mono">{customer.loyaltyCardNumber}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1 text-sm font-medium text-warning">
          <Gift className="h-4 w-4" />
          {customer.loyaltyPoints || 0} pts
        </span>

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onView(customer)}
            aria-label="View"
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Link to={`/app/customers/${customer.id}/edit`}>
            <Button variant="ghost" size="icon" aria-label="Edit" className="h-8 w-8">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPrint(customer)}
            aria-label="Print card"
            className="h-8 w-8"
          >
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(customer)}
            aria-label="Delete"
            className="h-8 w-8 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}