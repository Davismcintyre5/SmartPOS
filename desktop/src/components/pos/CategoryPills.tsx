import { cn } from '@/utils/classNames';

export interface CategoryPillsProps {
  categories: string[];
  active: string | null;
  onChange: (category: string | null) => void;
}

export function CategoryPills({ categories, active, onChange }: CategoryPillsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
      <button
        type="button"
        onClick={() => onChange(null)}
        className={cn(
          'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
          active === null
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
        )}
      >
        All
      </button>
      {categories.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={cn(
            'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
            active === c
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
          )}
        >
          {c}
        </button>
      ))}
    </div>
  );
}