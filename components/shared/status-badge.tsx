import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const badgeVariants: Record<BadgeVariant, string> = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary/10 text-primary border-primary/20',
  accent: 'bg-accent/10 text-accent border-accent/20',
  success: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20',
  warning: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
  error: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20',
  neutral: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
};

const statusMap: Record<string, BadgeVariant> = {
  Active: 'success',
  WFH: 'info',
  Repair: 'warning',
  Idle: 'neutral',
  Disposed: 'error',
  Working: 'success',
  'Not Working': 'error',
  Spare: 'neutral',
  Broken: 'error',
  Expiring: 'warning',
  Expired: 'error',
  Unassigned: 'neutral',
  Pending: 'warning',
  Completed: 'success',
  Rejected: 'error',
  'On Leave': 'warning',
  Inactive: 'neutral',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const variant = statusMap[status] || 'default';
  return (
    <Badge variant="outline" className={cn('font-medium', badgeVariants[variant], className)}>
      {status}
    </Badge>
  );
}

export function WarrantyBadge({ expiryDate }: { expiryDate: string | null }) {
  if (!expiryDate) return <span className="text-muted-foreground text-sm">—</span>;

  const expiry = new Date(expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  let variant: BadgeVariant = 'success';
  let label = 'Valid';

  if (daysUntilExpiry < 0) {
    variant = 'error';
    label = 'Expired';
  } else if (daysUntilExpiry <= 90) {
    variant = 'warning';
    label = 'Expiring Soon';
  }

  return (
    <Badge variant="outline" className={cn('font-medium', badgeVariants[variant])}>
      {label}
    </Badge>
  );
}

export { badgeVariants, type BadgeVariant };
