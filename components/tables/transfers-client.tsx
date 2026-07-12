'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransferModal } from '@/components/modals/transfer-modal';
import { ArrowLeftRight, Plus, Building2, CalendarDays, Clock } from 'lucide-react';
import { format, parseISO, isThisYear } from 'date-fns';
import type { Asset, Department, Employee, Transfer } from '@/types';

interface TransfersClientProps {
  transfers: Transfer[];
  assets: Asset[];
  departments: Department[];
  employees: Employee[];
}

export function TransfersClient({
  transfers,
  assets,
  departments,
  employees,
}: TransfersClientProps) {
  const [showTransfer, setShowTransfer] = useState(false);

  const stats = useMemo(() => {
    const thisYear = transfers.filter((t) =>
      isThisYear(parseISO(t.transfer_date))
    ).length;
    const pending = transfers.filter((t) => t.status === 'Pending').length;
    const deptTransfers = transfers.filter(
      (t) => t.from_department_id && t.to_department_id && t.from_department_id !== t.to_department_id
    ).length;
    return {
      total: transfers.length,
      thisYear,
      deptTransfers,
      pending,
    };
  }, [transfers]);

  const columns: ColumnDef<Transfer>[] = useMemo(
    () => [
      {
        accessorKey: 'transfer_date',
        header: 'Transfer Date',
        cell: ({ row }) => (
          <span className="text-sm">
            {format(parseISO(row.original.transfer_date), 'MMM dd, yyyy')}
          </span>
        ),
      },
      {
        accessorKey: 'asset',
        header: 'Asset',
        cell: ({ row }) => (
          <span className="font-mono font-semibold text-sm">
            {row.original.asset?.asset_tag || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'from_department',
        header: 'From Dept',
        cell: ({ row }) => row.original.from_department?.name || '—',
      },
      {
        accessorKey: 'to_department',
        header: 'To Dept',
        cell: ({ row }) => row.original.to_department?.name || '—',
      },
      {
        accessorKey: 'to_employee',
        header: 'Employee',
        cell: ({ row }) => row.original.to_employee?.name || '—',
      },
      {
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground max-w-xs truncate block">
            {row.original.reason || '—'}
          </span>
        ),
      },
      {
        accessorKey: 'approved_by',
        header: 'Approved By',
        cell: ({ row }) => row.original.approved_by || '—',
      },
      {
        accessorKey: 'handover',
        header: 'Handover',
        cell: ({ row }) => row.original.handover || '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground max-w-xs truncate block">
            {row.original.notes || '—'}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Asset Transfers</h1>
          <p className="text-muted-foreground mt-1">
            Track all asset transfers between departments
          </p>
        </div>
        <Button onClick={() => setShowTransfer(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Transfer
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Transfers"
          value={stats.total}
          icon={ArrowLeftRight}
          variant="primary"
        />
        <StatCard
          title="This Year"
          value={stats.thisYear}
          icon={CalendarDays}
          variant="success"
        />
        <StatCard
          title="Dept Transfers"
          value={stats.deptTransfers}
          icon={Building2}
          variant="accent"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          variant="warning"
        />
      </div>

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={transfers}
          searchPlaceholder="Search transfers..."
          searchColumn="asset"
          pageSize={10}
          emptyMessage="No transfers recorded yet."
        />
      </Card>

      <TransferModal
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
        assets={assets}
        departments={departments}
        employees={employees}
      />
    </div>
  );
}
