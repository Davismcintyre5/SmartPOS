import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/utils/classNames';
import { categoryApi } from '@/api/categories';
import type { Category } from '@/types/category';

export interface CategoryComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

export function CategoryCombobox({
  value,
  onChange,
  placeholder = 'Type or select a category',
  disabled = false,
  id,
}: CategoryComboboxProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    categoryApi
      .list()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch(value);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, value]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories.slice(0, 50);
    return categories
      .filter((c) => c.name.toLowerCase().includes(q))
      .slice(0, 50);
  }, [categories, search]);

  const exactMatch = useMemo(
    () => categories.find((c) => c.name.toLowerCase() === search.trim().toLowerCase()),
    [categories, search]
  );

  const showCreate =
    search.trim().length > 0 && !exactMatch && search.trim() !== value;

  const pick = (name: string) => {
    onChange(name);
    setSearch(name);
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setSearch('');
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          'flex h-10 w-full items-center rounded-lg border bg-background px-3 text-sm',
          'focus-within:ring-2 focus-within:ring-ring',
          disabled && 'cursor-not-allowed opacity-60',
          'border-input'
        )}
        onClick={() => !disabled && setOpen(true)}
      >
        <input
          id={id}
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground"
        />
        {search ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="ml-1 rounded p-0.5 text-muted-foreground hover:text-foreground"
            aria-label="Clear"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : (
          <ChevronDown className="ml-1 h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg">
          <div className="max-h-56 overflow-y-auto p-1 scrollbar-thin">
            {filtered.length === 0 && !showCreate ? (
              <p className="px-3 py-4 text-center text-xs text-muted-foreground">
                No categories
              </p>
            ) : (
              <>
                {showCreate ? (
                  <button
                    type="button"
                    onClick={() => pick(search.trim())}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-primary transition-colors hover:bg-accent"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>
                      Create &ldquo;{search.trim()}&rdquo;
                    </span>
                  </button>
                ) : null}

                {filtered.map((c) => {
                  const selected = c.name === value;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => pick(c.name)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors',
                        'hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <span className="truncate text-foreground">{c.name}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        <span className="text-xs text-muted-foreground">
                          {c.productCount}
                        </span>
                        {selected ? (
                          <Check className="h-3.5 w-3.5 text-primary" />
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}