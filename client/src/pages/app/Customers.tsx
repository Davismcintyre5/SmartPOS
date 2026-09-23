import { useEffect, useState } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CustomerStats } from '@/components/customer/CustomerStats';
import { CustomerCard } from '@/components/customer/CustomerCard';
import { CustomerFormModal } from '@/components/customer/CustomerFormModal';
import { CustomerDetailModal } from '@/components/customer/CustomerDetailModal';
import { customerApi } from '@/api/customers';
import { useAuth } from '@/hooks/useAuth';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { printLoyaltyCard } from '@/utils/loyaltyCard';
import type { Customer } from '@/types/customer';
import type { NormalizedError } from '@/types/api';

export default function Customers() {
  const { tenant } = useAuth();
  const { currency, settings } = useClient();
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);

  const limit = 30;

  const load = () => {
    setLoading(true);
    customerApi
      .list({ page, limit, search: search.trim() || undefined })
      .then((res) => {
        setCustomers(res.data ?? []);
        setTotal(res.meta?.total ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleDelete = async (c: Customer) => {
    const confirmed = window.confirm(
      `Permanently delete "${c.name}"? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await customerApi.remove(c.id);
      toast.success('Customer deleted');
      load();
    } catch (e) {
      const err = e as NormalizedError;

      if (err.code === 'CUSTOMER_HAS_SALES') {
        toast.error({
          title: 'Cannot delete',
          description: err.message,
        });
      } else {
        toast.error(err.message);
      }
    }
  };

  const handlePrint = (c: Customer) => {
    const businessName = tenant?.name || 'SmartPOS';

    if (!c.loyaltyCardNumber && !c.phone) {
      toast.error('Add a phone number to this customer before printing a card.');
      return;
    }

    printLoyaltyCard({
      customer: c,
      businessName,
      businessAddress: (settings.address as string) ?? null,
      businessPhone: (settings.phone as string) ?? null,
    });
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Customers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} customer{total === 1 ? '' : 's'}
          </p>
        </div>
        <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
          Add customer
        </Button>
      </div>

      <CustomerStats customers={customers} total={total} />

      <Input
        placeholder="Search by name, phone, email, or card number…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        leftIcon={<Search className="h-4 w-4" />}
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : customers.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title={search ? 'No matches' : 'No customers yet'}
          description={
            search
              ? 'Try a different search.'
              : 'Add your first customer to get started.'
          }
          action={
            !search ? (
              <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
                Add customer
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {customers.map((c) => (
            <CustomerCard
              key={c.id}
              customer={c}
              onView={setViewing}
              onPrint={handlePrint}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <CustomerFormModal
        open={formOpen}
        customer={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSaved={load}
      />

      <CustomerDetailModal
        open={Boolean(viewing)}
        customer={viewing}
        currency={currency}
        onClose={() => setViewing(null)}
        onPrint={handlePrint}
      />
    </div>
  );
}