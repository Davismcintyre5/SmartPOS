import { forwardRef, TextareaHTMLAttributes } from 'react';
import { classNames } from '@/utils/classNames';

interface Props extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { error, className, rows = 4, ...rest },
  ref
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={classNames(
        'block w-full rounded-md border text-sm transition resize-y',
        'focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500',
        error ? 'border-red-400' : 'border-slate-300',
        'px-3 py-2',
        'disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed',
        className
      )}
      {...rest}
    />
  );
});