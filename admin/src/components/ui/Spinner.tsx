import { classNames } from '@/utils/classNames';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-4',
};

export function Spinner({ size = 'md', className }: Props) {
  return (
    <span
      className={classNames(
        'inline-block rounded-full border-slate-300 border-t-brand-600 animate-spin',
        sizes[size],
        className
      )}
    />
  );
}