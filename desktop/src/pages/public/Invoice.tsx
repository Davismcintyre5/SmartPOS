import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { PayWithMpesaModal } from '@/components/public/PayWithMpesaModal';
import { publicInvoiceApi } from '@/api/invoices';
import { formatMoney } from '@/utils/currency';
import { formatDate } from '@/utils/format';
import type { PublicInvoice } from '@/types/invoice';

const STK_CODES = ['mpesa_stk'];

export default function Invoice() {
  const { number } = useParams<{ number: string }>();
  const [invoice, setInvoice] = useState<PublicInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [mpesaOpen, setMpesaOpen] = useState(false);

  useEffect(() => {
    if (!number) return;
    publicInvoiceApi
      .get(number)
      .then(setInvoice)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [number]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-foreground">Invoice not found</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Check the link or contact support.
        </p>
      </div>
    );
  }

  const paid = invoice.status === 'paid';
  const hasStk = invoice.paymentInstructions?.some((p) => STK_CODES.includes(p.code));

  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Logo size={32} />
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              paid ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
            }`}
          >
            {paid ? 'Paid' : 'Payment due'}
          </span>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Invoice
              </p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {invoice.invoiceNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Issued
              </p>
              <p className="mt-1 text-sm text-foreground">
                {formatDate(invoice.issuedAt)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Due {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          <div className="py-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Billed to
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {invoice.customerSnapshot?.name}
            </p>
            {invoice.customerSnapshot?.email ? (
              <p className="text-xs text-muted-foreground">
                {invoice.customerSnapshot.email}
              </p>
            ) : null}
          </div>

          <div className="border-t border-border pt-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 text-left font-medium">Description</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, i) => (
                  <tr key={i} className="border-t border-border">
                    <td className="py-3 text-foreground">
                      {item.name}
                      <span className="block text-xs text-muted-foreground">
                        {item.qty} × {formatMoney(item.unitPrice, invoice.currency)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-foreground">
                      {formatMoney(item.subtotal, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatMoney(invoice.subtotal, invoice.currency)}</span>
            </div>
            {invoice.discount > 0 ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Discount</span>
                <span>-{formatMoney(invoice.discount, invoice.currency)}</span>
              </div>
            ) : null}
            {invoice.tax > 0 ? (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax</span>
                <span>{formatMoney(invoice.tax, invoice.currency)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground">
              <span>Total</span>
              <span>{formatMoney(invoice.total, invoice.currency)}</span>
            </div>
            {!paid ? (
              <div className="flex justify-between text-sm font-semibold text-warning">
                <span>Amount due</span>
                <span>{formatMoney(invoice.amountDue, invoice.currency)}</span>
              </div>
            ) : null}
          </div>

          {!paid && hasStk ? (
            <div className="mt-6 border-t border-border pt-4">
              <Button
                fullWidth
                size="lg"
                onClick={() => setMpesaOpen(true)}
              >
                Pay with M-Pesa
              </Button>
            </div>
          ) : null}

          {!paid && invoice.paymentInstructions?.length ? (
            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Other payment methods
              </p>
              <div className="space-y-3">
                {invoice.paymentInstructions.map((p, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border bg-muted/40 p-4"
                  >
                    <p className="text-sm font-medium text-foreground">{p.title}</p>
                    {p.description ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {p.description}
                      </p>
                    ) : null}

                    {p.recipient && Object.keys(p.recipient).length ? (
                      <div className="mt-2 space-y-0.5 text-xs">
                        {Object.entries(p.recipient).map(([k, v]) =>
                          v ? (
                            <p key={k} className="text-foreground">
                              <span className="capitalize text-muted-foreground">
                                {k}:
                              </span>{' '}
                              <span className="font-mono">{v}</span>
                            </p>
                          ) : null
                        )}
                      </div>
                    ) : null}

                    {p.steps?.length ? (
                      <ol className="mt-2 list-inside list-decimal space-y-1 text-xs text-muted-foreground">
                        {p.steps.map((s, j) => (
                          <li key={j}>{s}</li>
                        ))}
                      </ol>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {invoice.notes ? (
            <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
              {invoice.notes}
            </div>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <a
            href="mailto:support@smartpos.co.ke"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Questions? support@smartpos.co.ke
          </a>
        </div>
      </div>

      <PayWithMpesaModal
        open={mpesaOpen}
        onClose={() => setMpesaOpen(false)}
        invoiceNumber={invoice.invoiceNumber}
        amount={invoice.amountDue}
        currency={invoice.currency}
      />
    </>
  );
}