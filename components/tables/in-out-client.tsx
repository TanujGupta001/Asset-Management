'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MovementModal } from '@/components/modals/movement-modal';
import { ArrowUpDown, Plus, ArrowUpCircle, ArrowDownCircle, Wrench, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { Asset, Department, Movement, MovementType } from '@/types';

interface InOutClientProps {
  movements: Movement[];
  assets: Asset[];
  departments: Department[];
}

const MOVEMENT_ICONS: Record<
  MovementType,
  { icon: typeof ArrowUpCircle; color: string }
> = {
  Issued: { icon: ArrowUpCircle, color: 'text-green-600' },
  Returned: { icon: ArrowDownCircle, color: 'text-red-600' },
  Repair: { icon: Wrench, color: 'text-blue-600' },
  Disposed: { icon: Trash2, color: 'text-red-600' },
  Transfer: { icon: ArrowUpDown, color: 'text-blue-500' },
};

export function InOutClient({ movements, assets, departments }: InOutClientProps) {
  const [showMovement, setShowMovement] = useState(false);

  const columns: ColumnDef<Movement>[] = useMemo(
    () => [
      {
        accessorKey: 'movement_date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-sm">
            {format(parseISO(row.original.movement_date), 'MMM dd, yyyy')}
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
        accessorKey: 'asset.type',
        header: 'Type',
        cell: ({ row }) => row.original.asset?.type || '—',
      },
      {
        accessorKey: 'department',
        header: 'Department',
        cell: ({ row }) => row.original.department?.name || '—',
      },
      {
        accessorKey: 'movement_type',
        header: 'Movement Type',
        cell: ({ row }) => {
          const config = MOVEMENT_ICONS[row.original.movement_type];
          const Icon = config?.icon || ArrowUpDown;
          return (
            <div className={`flex items-center gap-1.5 font-medium ${config?.color || 'text-muted-foreground'}`}>
              <Icon className="w-4 h-4" />
              {row.original.movement_type}
            </div>
          );
        },
      },
      {
        accessorKey: 'from_location',
        header: 'From',
        cell: ({ row }) => row.original.from_location || '—',
      },
      {
        accessorKey: 'to_location',
        header: 'To',
        cell: ({ row }) => row.original.to_location || '—',
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
          <h1 className="text-2xl font-bold tracking-tight">In / Out Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Track all asset movements including issues, returns, and repairs
          </p>
        </div>
        <Button onClick={() => setShowMovement(true)}>
          <Plus className="w-4 h-4 mr-2" /> Log Movement
        </Button>
      </div>

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={movements}
          searchPlaceholder="Search movements..."
          searchColumn="asset"
          pageSize={10}
          emptyMessage="No movements recorded yet."
        />
      </Card>

      <MovementModal
        open={showMovement}
        onClose={() => setShowMovement(false)}
        assets={assets}
        departments={departments}
      />
    </div>
  );
}
