import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/Table';
import { formatDateTime } from '@/utils/format';
import type { RestockMovement } from '@/types/inventory';

const TYPE_LABEL: Record<string, string> = {
  in: 'In',
  out: 'Out',
  adjustment: 'Adjust',
  purchase: 'Purchase',
  sale: 'Sale',
  sale_return: 'Return',
  invoice: 'Invoice',
  invoice_return: 'Invoice return',
  purchase_return: 'Purchase return',
};

export interface RestockHistoryProps {
  movements: RestockMovement[];
  loading: boolean;
}

export function RestockHistory({ movements, loading }: RestockHistoryProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <EmptyState
        title="No movements yet"
        description="Restocks and stock changes will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Product</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-right">Qty</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead>By</TableHead>
            <TableHead>Reason</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((m) => {
            const positive = m.qty > 0;
            return (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {formatDateTime(m.createdAt)}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-foreground">{m.productName}</p>
                  {m.productSku ? (
                    <p className="text-xs text-muted-foreground">{m.productSku}</p>
                  ) : null}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={positive ? 'success' : 'outline'}>
                    {TYPE_LABEL[m.type] || m.type}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`text-right text-sm font-medium ${
                    positive ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {positive ? '+' : ''}
                  {m.qty}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {m.balanceAfter ?? '—'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {m.userName || '—'}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-xs text-muted-foreground">
                  {m.reason || '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}