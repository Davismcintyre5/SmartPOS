import { forwardRef, InputHTMLAttributes } from 'react';
import { classNames } from '@/utils/classNames';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { error, icon, className, ...rest },
  ref
) {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={classNames(
          'block w-full rounded-md border text-sm transition',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300',
          icon ? 'pl-10 pr-3 py-2' : 'px-3 py-2',
          'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
          className
        )}
        {...rest}
      />
    </div>
  );
});