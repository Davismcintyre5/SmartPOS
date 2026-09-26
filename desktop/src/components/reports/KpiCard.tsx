import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/Card';

export interface KpiCardProps {
  icon?: ReactNode;
  label: string;
  value: string;
  hint?: string;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
}

const VARIANTS = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  destructive: 'bg-destructive/10 text-destructive',
} as const;

export function KpiCard({
  icon,
  label,
  value,
  hint,
  variant = 'default',
}: KpiCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 truncate text-xl font-bold text-foreground">
              {value}
            </p>
            {hint ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {hint}
              </p>
            ) : null}
          </div>
          {icon ? (
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${VARIANTS[variant]}`}
            >
              {icon}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}