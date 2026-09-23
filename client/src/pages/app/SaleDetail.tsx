import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Ban,
  XCircle,
  User,
  CreditCard,
  Calendar,
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
import { saleApi } from '@/api/sales';
import { useAuth } from '@/hooks/useAuth';
import { useClient } from '@/hooks/useClient';
import { useToast } from '@/hooks/useNotification';
import { buildReceiptHtml, printReceiptHtml } from '@/utils/receiptHtml';
import { formatMoney } from '@/utils/currency';
import { formatDateTime } from '@/utils/format';
import type { Sale } from '@/types/sale';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

export default function SaleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, tenant } = useAuth();
  const { settings } = useClient();
  const toast = useToast();

  const [sale, setSale] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [voidModalOpen, setVoidModalOpen] = useState(false);
  const [voidReason, setVoidReason] = useState('');
  const [voiding, setVoiding] = useState(false);

  const canVoid = user?.role === 'owner' || user?.role === 'manager';

  const load = () => {
    if (!id) return;
    setLoading(true);
    saleApi
      .get(id)
      .then(setSale)
      .catch((e) => {
        toast.error((e as NormalizedError).message);
        navigate('/app/sales', { replace: true });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleReprint = () => {
    if (!sale) return;
    setPrinting(true);
    try {
      const header =
        (settings.receiptTemplate as string | undefined)?.split('\n')[0] ||
        tenant?.name ||
        'SmartPOS';
      const footer =
        (settings.receiptFooter as string | undefined) ||
        'Thank you for your business.';

      const html = buildReceiptHtml({
        saleNumber: sale.saleNumber,
        items: sale.items.map((i) => ({
          name: i.name,
          qty: i.qty,
          price: i.price,
        })),
        subtotal: sale.subtotal,
        discount: sale.discount,
        vatEnabled: sale.vatAmount > 0,
        vatRate: sale.vatRate,
        vatAmount: sale.vatAmount,
        total: sale.total,
        currency: sale.currency,
        paymentMethod: sale.paymentMethod || 'cash',
        amountPaid: sale.amountPaid,
        changeAmount: sale.changeAmount,
        customerName: sale.customerName || 'Walk-in Customer',
        createdAt: sale.createdAt,
        cashierName: user?.fullName || 'Cashier',
        header,
        footer,
      });

      printReceiptHtml(html, `Receipt — ${sale.saleNumber}`);
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setPrinting(false);
    }
  };

  const handleVoid = async () => {
    if (!sale) return;
    if (!voidReason.trim()) {
      toast.error('Reason is required');
      return;
    }
    setVoiding(true);
    try {
      const updated = await saleApi.void(sale.id, voidReason.trim());
      setSale(updated);
      setVoidModalOpen(false);
      setVoidReason('');
      toast.success('Sale voided, stock restored');
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setVoiding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sale) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <button
        type="button"
        onClick={() => navigate('/app/sales')}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Sales
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-bold text-foreground">
              {sale.saleNumber}
            </h1>
            <Badge variant={sale.voided ? 'destructive' : 'success'}>
              {sale.voided ? 'Voided' : 'Paid'}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(sale.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReprint}
            loading={printing}
            leftIcon={<Printer className="h-4 w-4" />}
          >
            Reprint
          </Button>
          {canVoid && !sale.voided ? (
            <Button
              variant="destructive"
              onClick={() => setVoidModalOpen(true)}
              leftIcon={<Ban className="h-4 w-4" />}
            >
              Void
            </Button>
          ) : null}
        </div>
      </div>

      {sale.voided ? (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="flex items-start gap-3 p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <p className="text-sm font-medium text-destructive">
                This sale was voided
              </p>
              <p className="mt-0.5 text-xs text-destructive/80">
                {sale.voidReason || 'No reason provided'}
              </p>
              {sale.voidedAt ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDateTime(sale.voidedAt)}
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Payment</p>
              <p className="text-sm font-medium capitalize text-foreground">
                {sale.paymentMethod || '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Customer</p>
              <p className="truncate text-sm font-medium text-foreground">
                {sale.customerName || 'Walk-in'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Amount paid</p>
              <p className="text-sm font-medium text-foreground">
                {money(sale.amountPaid, sale.currency)}
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
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    {item.sku ? (
                      <p className="text-xs text-muted-foreground">{item.sku}</p>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {money(item.price, sale.currency)}
                  </TableCell>
                  <TableCell className="text-center text-sm text-foreground">
                    {item.qty}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold text-foreground">
                    {money(item.subtotal, sale.currency)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums text-foreground">
              {money(sale.subtotal, sale.currency)}
            </span>
          </div>

          {sale.discount > 0 ? (
            <div className="flex justify-between text-sm text-success">
              <span>Discount</span>
              <span className="tabular-nums">
                -{money(sale.discount, sale.currency)}
              </span>
            </div>
          ) : null}

          {sale.vatAmount > 0 ? (
            <div className="flex justify-between text-sm text-destructive">
              <span>VAT ({sale.vatRate}%)</span>
              <span className="tabular-nums">
                {money(sale.vatAmount, sale.currency)}
              </span>
            </div>
          ) : null}

          <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
            <span>Total</span>
            <span className="tabular-nums text-primary">
              {money(sale.total, sale.currency)}
            </span>
          </div>

          {sale.paymentMethod === 'cash' && sale.changeAmount > 0 ? (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Change given</span>
              <span className="tabular-nums">
                {money(sale.changeAmount, sale.currency)}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal
        open={voidModalOpen}
        onClose={() => setVoidModalOpen(false)}
        title="Void sale"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setVoidModalOpen(false)}
              disabled={voiding}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoid}
              loading={voiding}
            >
              Void sale
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <Ban className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs text-destructive">
              Voiding reverses the sale and returns all items to stock. This
              cannot be undone.
            </p>
          </div>

          <FormField
            label="Reason"
            htmlFor="void-reason"
            required
            hint="Explain why this sale is being voided"
          >
            <Input
              id="void-reason"
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              placeholder="Customer returned item, wrong product, etc."
              autoFocus
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}