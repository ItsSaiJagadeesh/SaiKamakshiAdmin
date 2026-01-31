import { cn } from '@/lib/utils';
import type { Visibility, StockStatus } from '@/types/admin';

interface VisibilityBadgeProps {
  status: Visibility;
}

export function VisibilityBadge({ status }: VisibilityBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      status === 'published' ? 'badge-success' : 'badge-draft'
    )}>
      {status === 'published' ? 'Published' : 'Draft'}
    </span>
  );
}

interface StockBadgeProps {
  status: StockStatus;
}

export function StockBadge({ status }: StockBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      status === 'in-stock' ? 'badge-success' : 'badge-warning'
    )}>
      {status === 'in-stock' ? 'In Stock' : 'Out of Stock'}
    </span>
  );
}
