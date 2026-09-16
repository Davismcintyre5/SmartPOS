import Button from './Button';

export default function Pagination({ page = 1, totalPages = 1, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center justify-between mt-4">
      <p className="text-xs text-[var(--text-muted)]">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Prev
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === page ? 'primary' : 'secondary'}
            onClick={() => onPageChange(p)}
          >
            {p}
          </Button>
        ))}
        <Button size="sm" variant="secondary" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}