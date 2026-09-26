import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/classNames';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-8 w-8' };

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2 text-muted-foreground">
      <Loader2 className={cn('animate-spin', sizes[size], className)} />
      {label ? <span className="text-sm">{label}</span> : null}
    </span>
  );
}