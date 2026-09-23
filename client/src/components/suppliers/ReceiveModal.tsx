import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, PackagePlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { Badge } from '@/components/ui/Badge';
import { CreateProductPrompt } from './CreateProductPrompt';
import { purchaseOrderApi } from '@/api/purchaseOrders';
import { useToast } from '@/hooks/useNotification';
import { formatMoney } from '@/utils/currency';
import type { PurchaseOrder } from '@/types/purchaseOrder';
import type { NormalizedError } from '@/types/api';

const money = (n: number, c: string) => formatMoney(n, c, { decimals: 0 });

interface ReceiveLine {
  productId: string | null;
  name: string;
  sku: string | null;
  qty: number;
  remaining: number;
  unitCost: number;
  receiveNow: number;
  createProduct: boolean;
}

export interface ReceiveModalProps {
  open: boolean;
  po: PurchaseOrder | null;
  currency: string;
  onClose: () => void;
  onReceived: () => void;
}

export function ReceiveModal({
  open,
  po,
  currency,
  onClose,
  onReceived,
}: ReceiveModalProps) {
  const toast = useToast();
  const [lines, setLines] = useState<ReceiveLine[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [createPromptFor, setCreatePromptFor] = useState<ReceiveLine | null>(null);

  useEffect(() => {
    if (!open || !po) return;
    setLines(
      po.items
        .filter((i) => i.remaining > 0)
        .map((i) => ({
          productId: i.productId,
          name: i.name || '',
          sku: i.sku,
          qty: i.qty,
          remaining: i.remaining,
          unitCost: i.unitCost,
          receiveNow: 0,
          createProduct: false,
        }))
    );
    setNotes('');
  }, [open, po]);

  const totalLines = lines.length;
  const readyLines = lines.filter((l) => l.receiveNow > 0).length;

  const canSubmit = useMemo(
    () =>
      totalLines > 0 &&
      lines.some((l) => l.receiveNow > 0) &&
      lines.every(
        (l) => l.receiveNow === 0 || l.productId || l.createProduct
      ),
    [lines, totalLines]
  );

  const updateLine = (i: number, patch: Partial<ReceiveLine>) => {
    setLines((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], ...patch };
      return next;
    });
  };

  const handleReceive = async () => {
    if (!po) return;
    if (!canSubmit) {
      toast.error('Fix outstanding lines before receiving');
      return;
    }

    setSaving(true);
    try {
      const result = await purchaseOrderApi.receive(po.id, {
        items: lines
          .filter((l) => l.receiveNow > 0)
          .map((l) => ({
            productId: l.productId,
            name: l.name,
            receivedQty: l.receiveNow,
            createProduct: l.createProduct,
            newProduct: l.createProduct
              ? {
                  name: l.name,
                  sku: l.sku || undefined,
                  cost: l.unitCost,
                  price: Math.ceil(l.unitCost * 1.3),
                }
              : undefined,
          })),
        notes: notes.trim() || undefined,
      });

      const created = result.createdProducts?.length || 0;
      toast.success(
        created > 0
          ? `Received. Created ${created} new product${created === 1 ? '' : 's'}.`
          : 'Stock received'
      );
      onReceived();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  if (!po) return null;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title={`Receive — ${po.poNumber}`}
        size="xl"
        footer={
          <>
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleReceive}
              loading={saving}
              disabled={!canSubmit}
            >
              Receive ({readyLines})
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
            <div>
              <p className="text-xs text-muted-foreground">Supplier</p>
              <p className="text-sm font-medium text-foreground">
                {po.supplierSnapshot?.name || '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-semibold text-foreground">
                {money(po.total, po.currency || currency)}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {lines.map((line, i) => {
              const missing = !line.productId;
              return (
                <div
                  key={i}
                  className="rounded-lg border border-border bg-card p-3"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {line.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {line.qty} ordered · {line.remaining} remaining
                        {line.sku ? ` · ${line.sku}` : ''}
                      </p>
                    </div>
                    {missing ? (
                      <Badge variant="warning">New product</Badge>
                    ) : null}
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <FormField label="Receive now">
                      <Input
                        type="number"
                        min={0}
                        max={line.remaining}
                        value={line.receiveNow || ''}
                        onChange={(e) =>
                          updateLine(i, {
                            receiveNow: Math.min(
                              Number(e.target.value) || 0,
                              line.remaining
                            ),
                          })
                        }
                        placeholder="0"
                      />
                    </FormField>
                    <div className="flex items-center gap-2 sm:col-span-2 sm:pt-6">
                      {missing ? (
                        <>
                          <input
                            type="checkbox"
                            id={`create-${i}`}
                            checked={line.createProduct}
                            onChange={(e) =>
                              updateLine(i, {
                                createProduct: e.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-input accent-primary"
                          />
                          <label
                            htmlFor={`create-${i}`}
                            className="cursor-pointer text-sm text-foreground"
                          >
                            Create product on receive
                          </label>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => setCreatePromptFor(line)}
                            leftIcon={<PackagePlus className="h-3.5 w-3.5" />}
                          >
                            Edit details
                          </Button>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Line total:{' '}
                          <span className="font-medium text-foreground">
                            {money(
                              Math.round(line.unitCost * line.receiveNow),
                              currency
                            )}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {line.receiveNow > 0 && missing && !line.createProduct ? (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Enable "Create product on receive" or pick a product.
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>

          <FormField label="Note" htmlFor="receive-note">
            <Input
              id="receive-note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional — e.g. partial delivery, damaged boxes"
            />
          </FormField>
        </div>
      </Modal>

      <CreateProductPrompt
        open={Boolean(createPromptFor)}
        product={createPromptFor}
        onClose={() => setCreatePromptFor(null)}
        onSaved={(name) => {
          if (!createPromptFor) return;
          const idx = lines.indexOf(createPromptFor);
          if (idx >= 0) {
            updateLine(idx, {
              name,
              createProduct: true,
            });
          }
          setCreatePromptFor(null);
        }}
      />
    </>
  );
}