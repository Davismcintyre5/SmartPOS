import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Send,
  Ban,
  Pencil,
  PackageCheck,
  FileText,
  Truck,
  Calendar,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { PurchaseOrderFormModal } from '@/components/suppliers/PurchaseOrderFormModal';
import { ReceiveModal } from '@/components/suppliers/ReceiveModal';
import { purchaseOrderApi } from '@/api/purchaseOrders';
import { useAuth } from '@/hooks/useAuth';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { formatDateTime, formatDate } from '@/utils/format';
import type { PurchaseOrder, PurchaseOrderStatus } from '@/types/purchaseOrder';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

const STATUS_VARIANT: Record<
  PurchaseOrderStatus,
  'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  draft: 'outline',
  sent: 'primary',
  partial: 'warning',
  received: 'success',
  cancelled: 'destructive',
};

export default function PurchaseOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currency } = useClient();
  const toast = useToast();

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const canManage = user?.role === 'owner' || user?.role === 'manager';

  const load = () => {
    if (!id) return;
    setLoading(true);
    purchaseOrderApi
      .get(id)
      .then(setPo)
      .catch((e) => {
        toast.error((e as NormalizedError).message);
        navigate('/app/suppliers?tab=pos', { replace: true });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSend = async () => {
    if (!po) return;
    if (!window.confirm(`Send ${po.poNumber} to ${po.supplierSnapshot?.name}?`)) {
      return;
    }
    setSending(true);
    try {
      const updated = await purchaseOrderApi.send(po.id);
      setPo(updated);
      toast.success('Purchase order sent');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSending(false);
    }
  };

  const handleCancel = async () => {
    if (!po) return;
    if (!cancelReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setCancelling(true);
    try {
      const updated = await purchaseOrderApi.cancel(po.id, cancelReason.trim());
      setPo(updated);
      setCancelOpen(false);
      setCancelReason('');
      toast.success('Purchase order cancelled');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!po) return null;

  const totalOrdered = po.items.reduce((s, i) => s + i.qty, 0);
  const totalReceived = po.items.reduce((s, i) => s + (i.receivedQty || 0), 0);
  const pct = totalOrdered
    ? Math.round((totalReceived / totalOrdered) * 100)
    : 0;

  const canSend = po.status === 'draft' && canManage;
  const canCancel =
    ['draft', 'sent', 'partial'].includes(po.status) && canManage;
  const canEdit = po.status === 'draft' && canManage;
  const canReceive = ['draft', 'sent', 'partial'].includes(po.status);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <button
        type="button"
        onClick={() => navigate('/app/suppliers?tab=pos')}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Purchase Orders
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground">
              {po.poNumber}
            </h1>
            <Badge variant={STATUS_VARIANT[po.status]}>{po.status}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {formatDateTime(po.createdAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {canEdit ? (
            <Button
              variant="outline"
              onClick={() => setEditOpen(true)}
              leftIcon={<Pencil className="h-4 w-4" />}
            >
              Edit
            </Button>
          ) : null}

          {canSend ? (
            <Button
              onClick={handleSend}
              loading={sending}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Send to supplier
            </Button>
          ) : null}

          {canReceive ? (
            <Button
              variant={po.status === 'sent' ? 'primary' : 'outline'}
              onClick={() => setReceiveOpen(true)}
              leftIcon={<PackageCheck className="h-4 w-4" />}
            >
              Receive
            </Button>
          ) : null}

          {canCancel ? (
            <Button
              variant="destructive"
              onClick={() => setCancelOpen(true)}
              leftIcon={<Ban className="h-4 w-4" />}
            >
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      {po.status === 'cancelled' ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <Ban className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                This purchase order was cancelled
              </p>
              <p className="mt-0.5 text-xs text-destructive/80">
                {po.cancelReason || 'No reason provided'}
              </p>
              {po.cancelledAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(po.cancelledAt)}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Progress bar (only when partial/sent/received) */}
      {po.status !== 'draft' && po.status !== 'cancelled' ? (
        <Card>
          <CardContent className="space-y-2 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Receiving progress</span>
              <span className="font-medium text-foreground">
                {totalReceived} / {totalOrdered} units · {pct}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Truck className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Supplier</p>
              <p className="truncate text-sm font-medium text-foreground">
                {po.supplierSnapshot?.name || '—'}
              </p>
              {po.supplierSnapshot?.phone ? (
                <p className="truncate text-xs text-muted-foreground">
                  {po.supplierSnapshot.phone}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Expected</p>
              <p className="text-sm font-medium text-foreground">
                {po.expectedAt ? formatDate(po.expectedAt) : '—'}
              </p>
              {po.sentAt ? (
                <p className="text-xs text-muted-foreground">
                  Sent {formatDate(po.sentAt)}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-semibold text-foreground">
                {money(po.total, po.currency || currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                {po.items.length} item{po.items.length === 1 ? '' : 's'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Unit cost</TableHead>
                <TableHead className="text-center">Ordered</TableHead>
                <TableHead className="text-center">Received</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {po.items.map((item, i) => {
                const fullyReceived = (item.receivedQty || 0) >= item.qty;
                const noneReceived = (item.receivedQty || 0) === 0;
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">
                          {item.name}
                        </p>
                        {!item.productId ? (
                          <Badge variant="outline" className="text-[10px]">
                            No product link
                          </Badge>
                        ) : null}
                      </div>
                      {item.sku ? (
                        <p className="text-xs text-muted-foreground">{item.sku}</p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {money(item.unitCost, po.currency || currency)}
                    </TableCell>
                    <TableCell className="text-center text-sm text-foreground">
                      {item.qty}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          fullyReceived
                            ? 'text-sm font-medium text-success'
                            : noneReceived
                              ? 'text-sm text-muted-foreground'
                              : 'text-sm font-medium text-warning'
                        }
                      >
                        {item.receivedQty || 0} / {item.qty}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-foreground">
                      {money(item.subtotal, po.currency || currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums text-foreground">
              {money(po.subtotal, po.currency || currency)}
            </span>
          </div>
          {po.tax > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span className="tabular-nums text-foreground">
                {money(po.tax, po.currency || currency)}
              </span>
            </div>
          ) : null}
          {po.shipping > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="tabular-nums text-foreground">
                {money(po.shipping, po.currency || currency)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
            <span>Total</span>
            <span className="tabular-nums text-primary">
              {money(po.total, po.currency || currency)}
            </span>
          </div>
        </CardContent>
      </Card>

      {po.notes ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {po.notes}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {po.receivedAt ? (
        <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 p-3 text-sm text-success">
          <Package className="h-4 w-4" />
          Fully received {formatDateTime(po.receivedAt)}
        </div>
      ) : null}

      {/* Edit modal */}
      <PurchaseOrderFormModal
        open={editOpen}
        po={po}
        currency={currency}
        onClose={() => setEditOpen(false)}
        onSaved={(updated) => {
          setPo(updated);
          setEditOpen(false);
        }}
      />

      {/* Receive modal */}
      <ReceiveModal
        open={receiveOpen}
        po={po}
        currency={currency}
        onClose={() => setReceiveOpen(false)}
        onReceived={() => {
          setReceiveOpen(false);
          load();
        }}
      />

      {/* Cancel modal */}
      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Cancel purchase order"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCancelOpen(false)}
              disabled={cancelling}
            >
              Keep
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              loading={cancelling}
            >
              Cancel order
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs text-destructive">
              This cancels the PO and notifies the supplier. It cannot be
              undone.
            </p>
          </div>

          <FormField label="Reason" htmlFor="cancel-reason" required>
            <Input
              id="cancel-reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Supplier out of stock, changed order, etc."
              autoFocus
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}