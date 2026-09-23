import { ReactNode } from 'react';
import { classNames } from '@/utils/classNames';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  width?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  onChange: (page: number) => void;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyState?: ReactNode;
  rowKey?: (row: T) => string;
  onRowClick?: (row: T) => void;
  pagination?: Pagination;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyState,
  rowKey,
  onRowClick,
  pagination,
  className,
}: Props<T>) {
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 0;

  return (
    <div className={classNames('bg-white border border-slate-200 rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={c.width ? { width: c.width } : undefined}
                  className={classNames(
                    'px-4 py-3 font-medium text-slate-600 text-left whitespace-nowrap',
                    c.align === 'right' && 'text-right',
                    c.align === 'center' && 'text-center',
                    c.className
                  )}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center">
                  <div className="flex justify-center">
                    <Spinner />
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  {emptyState || <EmptyState title="Nothing here yet" />}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={rowKey ? rowKey(row) : (row._id as string) || i}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={classNames(
                    'hover:bg-slate-50 transition',
                    onRowClick && 'cursor-pointer'
                  )}
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={classNames(
                        'px-4 py-3 text-slate-700',
                        c.align === 'right' && 'text-right',
                        c.align === 'center' && 'text-center',
                        c.className
                      )}
                    >
                      {c.render ? c.render(row) : (row[c.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50 text-sm">
          <span className="text-slate-500">
            Page {pagination.page} of {totalPages} · {pagination.total} total
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onChange(Math.max(1, pagination.page - 1))}
              disabled={pagination.page <= 1}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
            >
              Prev
            </button>
            <button
              onClick={() => pagination.onChange(Math.min(totalPages, pagination.page + 1))}
              disabled={pagination.page >= totalPages}
              className="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}