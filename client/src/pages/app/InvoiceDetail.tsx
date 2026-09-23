import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Bell, FileDown, Ban, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/Table';
import { invoiceApi } from '@/api/invoices';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import { RecordPaymentModal } from '@/components/invoices/RecordPaymentModal';
import { CancelInvoiceModal } from '@/components/invoices/CancelInvoiceModal';
import type { Invoice, InvoiceStatus } from '@/types/invoice';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

const STATUS_VARIANT: Record<
  InvoiceStatus,
  'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  draft: 'outline',
  sent: 'primary',
  partial: 'warning',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'destructive',
};

export default function InvoiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    invoiceApi
      .get(id)
      .then(setInvoice)
      .catch((e) => {
        toast.error((e as NormalizedError).message);
        navigate('/app/invoices');
      })
      .finally(() => setLoading(false));
  }, [id, navigate, toast]);

  const withBusy = async (fn: () => Promise<Invoice>, ok: string) => {
    setBusy(true);
    try {
      const updated = await fn();
      setInvoice(updated);
      toast.success(ok);
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !invoice) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  const canPay = invoice.status !== 'paid' && invoice.status !== 'cancelled';
  const canCancel = invoice.status !== 'cancelled' && invoice.status !== 'paid';
  const canSend = invoice.status === 'draft';
  const canRemind = invoice.status === 'sent' || invoice.status === 'partial' || invoice.status === 'overdue';

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => navigate('/app/invoices')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-mono text-xl font-bold text-foreground">
              {invoice.invoiceNumber}
            </h1>
            <p className="text-xs text-muted-foreground">
              Created {formatDate(invoice.createdAt)}
            </p>
          </div>
          <Badge variant={STATUS_VARIANT[invoice.status]}>{invoice.status}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {canSend && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={busy}
              onClick={() => withBusy(() => invoiceApi.send(invoice.id), 'Invoice sent')}
              leftIcon={<Send className="h-4 w-4" />}
            >
              Send
            </Button>
          )}
          {canRemind && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={busy}
              onClick={() => withBusy(async () => {
                await invoiceApi.remind(invoice.id);
                return invoiceApi.get(invoice.id);
              }, 'Reminder sent')}
              leftIcon={<Bell className="h-4 w-4" />}
            >
              Remind
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => invoiceApi.pdf(invoice.id).then((r) => r.url && window.open(r.url, '_blank'))}
            leftIcon={<FileDown className="h-4 w-4" />}
          >
            PDF
          </Button>
          {canPay && (
            <Button
              type="button"
              size="sm"
              onClick={() => setPayOpen(true)}
              leftIcon={<DollarSign className="h-4 w-4" />}
            >
              Record payment
            </Button>
          )}
          {canCancel && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => setCancelOpen(true)}
              leftIcon={<Ban className="h-4 w-4" />}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="space-y-1 p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Billed to</p>
          <p className="text-sm font-semibold text-foreground">
            {invoice.customerSnapshot.name}
          </p>
          {invoice.customerSnapshot.email && (
            <p className="text-xs text-muted-foreground">{invoice.customerSnapshot.email}</p>
          )}
          {invoice.customerSnapshot.phone && (
            <p className="text-xs text-muted-foreground">{invoice.customerSnapshot.phone}</p>
          )}
          {invoice.customerSnapshot.address && (
            <p className="text-xs text-muted-foreground">{invoice.customerSnapshot.address}</p>
          )}
        </Card>

        <Card className="space-y-1 p-4 text-right">
          {invoice.issuedAt && (
            <p className="text-xs text-muted-foreground">
              Issued: <span className="text-foreground">{formatDate(invoice.issuedAt)}</span>
            </p>
          )}
          {invoice.dueDate && (
            <p className="text-xs text-muted-foreground">
              Due: <span className="text-foreground">{formatDate(invoice.dueDate)}</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Currency: <span className="text-foreground">{invoice.currency}</span>
          </p>
          <p className="text-2xl font-bold text-primary">
            {money(invoice.total, invoice.currency)}
          </p>
          {invoice.amountDue > 0 && (
            <p className="text-sm font-semibold text-warning">
              Due {money(invoice.amountDue, invoice.currency)}
            </p>
          )}
        </Card>
      </div>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoice.items.map((it, i) => (
              <TableRow key={i}>
                <TableCell>
                  <p className="text-sm text-foreground">{it.name}</p>
                  {it.description && (
                    <p className="text-xs text-muted-foreground">{it.description}</p>
                  )}
                </TableCell>
                <TableCell className="text-center text-sm">{it.qty}</TableCell>
                <TableCell className="text-right text-sm">
                  {money(it.unitPrice, invoice.currency)}
                </TableCell>
                <TableCell className="text-right text-sm font-semibold">
                  {money(it.subtotal, invoice.currency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="ml-auto w-full max-w-xs space-y-1 p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{money(invoice.subtotal, invoice.currency)}</span>
        </div>
        {invoice.discount > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount</span>
            <span>-{money(invoice.discount, invoice.currency)}</span>
          </div>
        )}
        {invoice.tax > 0 && (
          <div className="flex justify-between text-destructive">
            <span>Tax</span>
            <span>{money(invoice.tax, invoice.currency)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-1 font-semibold text-primary">
          <span>Total</span>
          <span>{money(invoice.total, invoice.currency)}</span>
        </div>
        {invoice.amountPaid > 0 && (
          <div className="flex justify-between text-success">
            <span>Paid</span>
            <span>{money(invoice.amountPaid, invoice.currency)}</span>
          </div>
        )}
      </Card>

      {invoice.notes && (
        <Card className="border-l-4 border-l-primary p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground">Notes</p>
          <p className="mt-1 text-sm text-foreground">{invoice.notes}</p>
        </Card>
      )}

      <RecordPaymentModal
        open={payOpen}
        invoice={invoice}
        onClose={() => setPayOpen(false)}
        onSaved={setInvoice}
      />
      <CancelInvoiceModal
        open={cancelOpen}
        invoice={invoice}
        onClose={() => setCancelOpen(false)}
        onSaved={setInvoice}
      />
    </div>
  );
}