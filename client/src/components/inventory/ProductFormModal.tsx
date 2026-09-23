import { useEffect, useState, type FormEvent } from 'react';
import { Upload, X, ImageIcon, Camera, CameraOff, Barcode } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { CategoryCombobox } from './CategoryCombobox';
import { productApi } from '@/api/products';
import { useToast } from '@/hooks/useNotification';
import { useBarcodeScanner } from '@/hooks/useBarcodeScanner';
import { useCameraScanner } from '@/hooks/useCameraScanner';
import { cn } from '@/utils/classNames';
import type { Product, CreateProductInput } from '@/types/product';
import type { NormalizedError } from '@/types/api';

const EMPTY: CreateProductInput & { stock?: number } = {
  name: '',
  sku: '',
  barcode: '',
  category: '',
  price: 0,
  cost: 0,
  stock: 0,
  lowStockThreshold: 5,
  active: true,
};

export interface ProductFormModalProps {
  open: boolean;
  product: Product | null;
  initialBarcode?: string;
  onClose: () => void;
  onSaved: () => void;
}

export function ProductFormModal({
  open,
  product,
  initialBarcode,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imagePublicId, setImagePublicId] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);

  const isEdit = Boolean(product);

  useEffect(() => {
    if (!open) return;

    if (product) {
      setForm({
        name: product.name,
        sku: product.sku ?? '',
        barcode: product.barcode ?? '',
        category: product.category ?? '',
        price: product.price,
        cost: product.cost,
        lowStockThreshold: product.lowStockThreshold,
        active: product.active,
      });
      setImageUrl(product.imageUrl ?? null);
      setImagePublicId(product.imagePublicId ?? null);
    } else {
      setForm({ ...EMPTY, barcode: initialBarcode ?? '' });
      setImageUrl(null);
      setImagePublicId(null);
    }

    setScanLocked(Boolean(product) || Boolean(initialBarcode));
    setCameraOn(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product, initialBarcode]);

  useBarcodeScanner({
    enabled: open && !scanLocked && !cameraOn,
    onScan: (code) => {
      setForm((prev) => ({ ...prev, barcode: code }));
      setScanLocked(true);
      toast.success(`Scanned: ${code}`);
    },
  });

  const { starting: cameraStarting, error: cameraError } = useCameraScanner({
    enabled: open && cameraOn,
    onScan: (code) => {
      setForm((prev) => ({ ...prev, barcode: code }));
      setScanLocked(true);
      setCameraOn(false);
      toast.success(`Scanned: ${code}`);
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await productApi.uploadImage(file);
      setImageUrl(result.url);
      setImagePublicId(result.publicId);
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!form.price || form.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      const payload: CreateProductInput = {
        name: form.name.trim(),
        sku: form.sku?.trim() || undefined,
        barcode: form.barcode?.trim() || undefined,
        category: form.category?.trim() || undefined,
        price: form.price,
        cost: form.cost ?? 0,
        lowStockThreshold: form.lowStockThreshold ?? 5,
        imageUrl: imageUrl ?? undefined,
        imagePublicId: imagePublicId ?? undefined,
        active: form.active !== false,
      };

      if (isEdit && product) {
        await productApi.update(product.id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create({ ...payload, stock: form.stock ?? 0 });
        toast.success('Product added');
      }
      onSaved();
      onClose();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit product' : 'Add product'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Add product'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Image + name */}
        <div className="flex items-start gap-3">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted text-muted-foreground">
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <FormField label="Product name" htmlFor="p-name" required>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Sugar 1kg"
                autoFocus
              />
            </FormField>
            <div className="flex items-center gap-3 text-xs">
              <label className="inline-flex cursor-pointer items-center gap-1 text-primary hover:underline">
                <Upload className="h-3 w-3" />
                <span>
                  {uploading ? 'Uploading…' : imageUrl ? 'Change image' : 'Upload image'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUpload(f);
                  }}
                />
              </label>
              {imageUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl(null);
                    setImagePublicId(null);
                  }}
                  className="inline-flex items-center gap-1 text-destructive hover:underline"
                >
                  <X className="h-3 w-3" /> Remove
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Barcode + SKU */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Barcode" htmlFor="p-barcode">
            <Input
              id="p-barcode"
              value={form.barcode ?? ''}
              onChange={(e) => {
                setForm({ ...form, barcode: e.target.value });
                setScanLocked(true);
              }}
              placeholder="Scan or type"
              leftIcon={<Barcode className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => {
                    setCameraOn((v) => !v);
                    setScanLocked(true);
                  }}
                  className={cn(
                    'rounded p-1 transition-colors',
                    cameraOn
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  aria-label={cameraOn ? 'Stop camera' : 'Open camera scanner'}
                >
                  {cameraOn ? (
                    <CameraOff className="h-4 w-4" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
              }
            />
          </FormField>
          <FormField
            label="SKU"
            htmlFor="p-sku"
            hint={!isEdit ? 'Leave blank to auto-generate' : undefined}
          >
            <Input
              id="p-sku"
              value={form.sku ?? ''}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              placeholder={isEdit ? 'SUG-001' : 'Auto'}
            />
          </FormField>
        </div>

        {/* Camera preview */}
        {cameraOn ? (
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <video
              id="camera-preview"
              className="h-48 w-full object-cover"
              muted
              playsInline
            />
            <div className="bg-foreground px-3 py-1 text-center text-xs text-background">
              {cameraStarting
                ? 'Starting camera…'
                : cameraError
                  ? `Camera error: ${cameraError}`
                  : 'Point the barcode at the camera'}
            </div>
          </div>
        ) : null}

        {/* Category */}
        <FormField label="Category" htmlFor="p-category">
          <CategoryCombobox
            id="p-category"
            value={form.category ?? ''}
            onChange={(v) => setForm({ ...form, category: v })}
          />
        </FormField>

        {/* Price + Cost */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Price" htmlFor="p-price" required>
            <Input
              id="p-price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) || 0 })}
            />
          </FormField>
          <FormField label="Cost" htmlFor="p-cost">
            <Input
              id="p-cost"
              type="number"
              value={form.cost ?? 0}
              onChange={(e) => setForm({ ...form, cost: Number(e.target.value) || 0 })}
            />
          </FormField>
        </div>

        {/* Stock + threshold */}
        {!isEdit ? (
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Initial stock" htmlFor="p-stock">
              <Input
                id="p-stock"
                type="number"
                value={form.stock ?? 0}
                onChange={(e) =>
                  setForm({ ...form, stock: Number(e.target.value) || 0 })
                }
              />
            </FormField>
            <FormField label="Low stock alert" htmlFor="p-lowstock">
              <Input
                id="p-lowstock"
                type="number"
                value={form.lowStockThreshold ?? 5}
                onChange={(e) =>
                  setForm({
                    ...form,
                    lowStockThreshold: Number(e.target.value) || 5,
                  })
                }
              />
            </FormField>
          </div>
        ) : (
          <FormField
            label="Low stock alert"
            htmlFor="p-lowstock"
            hint="Restock via the Restock tab"
          >
            <Input
              id="p-lowstock"
              type="number"
              value={form.lowStockThreshold ?? 5}
              onChange={(e) =>
                setForm({
                  ...form,
                  lowStockThreshold: Number(e.target.value) || 5,
                })
              }
            />
          </FormField>
        )}

        {/* Active */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.active !== false}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
            className="h-4 w-4 rounded border-input accent-primary"
          />
          <span className="text-foreground">Active (available for sale)</span>
        </label>
      </form>
    </Modal>
  );
}