import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/ui/FormField';
import { categoryApi } from '@/api/categories';
import { useToast } from '@/hooks/useNotification';
import type { Category } from '@/types/category';
import type { NormalizedError } from '@/types/api';

export interface CategoryFormModalProps {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}

export function CategoryFormModal({
  open,
  category,
  onClose,
  onSaved,
}: CategoryFormModalProps) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  const isEdit = Boolean(category);

  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? '');
  }, [open, category]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && category) {
        await categoryApi.update(category.id, { name: name.trim() });
        toast.success('Category updated');
      } else {
        await categoryApi.create({ name: name.trim() });
        toast.success('Category created');
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
      title={isEdit ? 'Edit category' : 'New category'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            {isEdit ? 'Save changes' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Name" htmlFor="c-name" required>
          <Input
            id="c-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Beverages"
            autoFocus
          />
        </FormField>
      </form>
    </Modal>
  );
}