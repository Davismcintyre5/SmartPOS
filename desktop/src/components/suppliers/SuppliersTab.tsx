import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Truck, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { SupplierFormModal } from './SupplierFormModal';
import { supplierApi } from '@/api/suppliers';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import type { Supplier } from '@/types/supplier';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export function SuppliersTab() {
  const { currency } = useClient();
  const toast = useToast();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const limit = 20;

  const load = () => {
    setLoading(true);
    supplierApi
      .list({ page, limit, search: search.trim() || undefined })
      .then((res) => {
        setSuppliers(res.data ?? []);
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
    setModalOpen(true);
  };

  const openEdit = (s: Supplier) => {
    setEditing(s);
    setModalOpen(true);
  };

  const handleDelete = async (s: Supplier) => {
    if (!window.confirm(`Delete supplier "${s.name}"?`)) return;
    try {
      await supplierApi.remove(s.id);
      toast.success('Supplier deleted');
      load();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <Input
            placeholder="Search suppliers…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
          Add supplier
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : suppliers.length === 0 ? (
        <EmptyState
          icon={<Truck className="h-6 w-6" />}
          title={search ? 'No matches' : 'No suppliers yet'}
          description={
            search
              ? 'Try a different search.'
              : 'Add your first supplier to start creating purchase orders.'
          }
          action={
            !search ? (
              <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
                Add supplier
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Total spent</TableHead>
                <TableHead>Last order</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">
                      {s.name}
                    </p>
                    {s.notes ? (
                      <p className="text-xs text-muted-foreground">{s.notes}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.contactName || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {s.phone || '—'}
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">
                    {money(s.totalSpent || 0, currency)}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {s.lastOrderAt ? formatDate(s.lastOrderAt) : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(s)}
                        aria-label="Edit"
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(s)}
                        aria-label="Delete"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

      <SupplierFormModal
        open={modalOpen}
        supplier={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSaved={load}
      />
    </div>
  );
}