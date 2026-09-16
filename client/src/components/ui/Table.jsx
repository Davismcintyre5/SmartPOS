export default function Table({ columns = [], data = [], loading = false, emptyMessage = 'No data', onRowClick }) {
  if (loading) {
    return (
      <div className="py-12 text-center text-sm text-[var(--text-muted)]">Loading...</div>
    );
  }

  if (!data.length) {
    return (
      <div className="py-12 text-center text-sm text-[var(--text-muted)]">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-color)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left font-medium text-[var(--text-secondary)] px-3 py-2 whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row._id || row.id || i}
              className={`border-b border-[var(--border-color)] last:border-0 ${
                onRowClick ? 'cursor-pointer hover:bg-[var(--sidebar-hover)]' : ''
              }`}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-3 py-2 text-[var(--text-primary)]">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}