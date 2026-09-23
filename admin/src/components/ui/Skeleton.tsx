import { classNames } from '@/utils/classNames';

interface Props {
  className?: string;
  count?: number;
}

export function Skeleton({ className, count = 1 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={classNames('animate-pulse bg-slate-200 rounded', className || 'h-4 w-full')}
        />
      ))}
    </>
  );
}