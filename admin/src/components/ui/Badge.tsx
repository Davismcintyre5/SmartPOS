import { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';

type Variant = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

interface Props {
  variant?: Variant;
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<Variant, string> = {
  neutral: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-amber-100 text-amber-800',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  brand: 'bg-brand-100 text-brand-700',
};

const dotColors: Record<Variant, string> = {
  neutral: 'bg-slate-500',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
  brand: 'bg-brand-500',
};

export function Badge({ variant = 'neutral', children, className, dot }: Props) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {dot && <span className={classNames('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  );
}