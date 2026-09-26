import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CategoryFormModal } from './CategoryFormModal';
import { categoryApi } from '@/api/categories';
import { useToast } from '@/hooks/useNotification';
import type { Category } from '@/types/category';
import type { NormalizedError } from '@/types/api';

export function CategoriesTab() {
  const toast = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const load = () => {
    setLoading(true);
    categoryApi
      .list()
      .then(setCategories)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setModalOpen(true);
  };

  const handleDelete = async (c: Category) => {
    if (c.productCount > 0) {
      toast.error(
        `${c.productCount} product(s) still use this category. Move them first.`
      );
      return;
    }
    if (!window.confirm(`Delete "${c.name}"?`)) return;
    try {
      await categoryApi.remove(c.id);
      toast.success('Category deleted');
      load();
    } catch (e) {
      toast.error((e as NormalizedError).message);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...categories];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setCategories(next);
    try {
      await categoryApi.reorder(next.map((c) => c.id));
    } catch (e) {
      toast.error((e as NormalizedError).message);
      load();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
        </p>
        <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
          Add category
        </Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          title="No categories yet"
          description="Group your products into categories."
          action={
            <Button onClick={openAdd} leftIcon={<Plus className="h-4 w-4" />}>
              Add category
            </Button>
          }
        />
      ) : (
        <div className="space-y-2">
          {categories.map((c, i) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="rounded p-0.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={i === categories.length - 1}
                    className="rounded p-0.5 text-muted-foreground hover:bg-accent disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </button>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {c.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {c.productCount} product{c.productCount === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Badge variant="outline">#{c.position + 1}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(c)}
                  aria-label="Edit"
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(c)}
                  aria-label="Delete"
                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        category={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />
    </div>
  );
}