import { useEffect, useState } from 'react';
import { Search, UserPlus, Users, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { customerApi } from '@/api/customers';
import { useToast } from '@/hooks/useNotification';
import { initials } from '@/utils/format';
import type { Customer } from '@/types/customer';
import type { NormalizedError } from '@/types/api';

export interface CustomerPickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (customer: Customer) => void;
}

export function CustomerPickerModal({
  open,
  onClose,
  onPick,
}: CustomerPickerModalProps) {
  const toast = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) return;

    setLoading(true);
    customerApi
      .list({ limit: 30, search: search.trim() || undefined })
      .then((res) => setCustomers(res.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, search]);

  const handleCreateQuick = async () => {
    if (!search.trim()) return;
    try {
      const created = await customerApi.create({ name: search.trim() });
      toast.success('Customer added');
      onPick(created);
      onClose();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Attach customer"
      size="md"
    >
      <div className="space-y-3">
        <Input
          autoFocus
          placeholder="Search by name, phone, email, or card…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          rightIcon={
            search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null
          }
        />

        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title={search ? 'No matches' : 'No customers yet'}
            description={
              search
                ? 'Add them as a new customer or try another search.'
                : 'Add your first customer.'
            }
            action={
              search ? (
                <Button
                  onClick={handleCreateQuick}
                  leftIcon={<UserPlus className="h-4 w-4" />}
                  size="sm"
                >
                  Add "{search}"
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="max-h-80 space-y-1 overflow-y-auto scrollbar-thin">
            {customers.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  onPick(c);
                  onClose();
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-accent"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {initials(c.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {c.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {c.phone || c.email || c.loyaltyCardNumber || '—'}
                  </p>
                </div>
                {c.loyaltyPoints > 0 ? (
                  <span className="shrink-0 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    {c.loyaltyPoints} pts
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}