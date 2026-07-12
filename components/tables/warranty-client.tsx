'use client';

import { useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatCard } from '@/components/shared/stat-card';
import { WarrantyBadge } from '@/components/shared/status-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, ShieldAlert, ShieldX, Download } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import type { Asset } from '@/types';

interface WarrantyClientProps {
  assets: Asset[];
}

export function WarrantyClient({ assets }: WarrantyClientProps) {
  const sortedAssets = useMemo(() => {
    return assets
      .filter((a) => a.warranty_expiry && a.status !== 'Disposed')
      .sort((a, b) => new Date(a.warranty_expiry!).getTime() - new Date(b.warranty_expiry!).getTime());
  }, [assets]);

  const now = new Date();
  const valid = sortedAssets.filter((a) => {
    const days = Math.ceil((new Date(a.warranty_expiry!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days > 90;
  });
  const expiringSoon = sortedAssets.filter((a) => {
    const days = Math.ceil((new Date(a.warranty_expiry!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 90;
  });
  const expired = sortedAssets.filter((a) => {
    const days = Math.ceil((new Date(a.warranty_expiry!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days < 0;
  });

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const data = sortedAssets.map((a) => ({
      'Asset Tag': a.asset_tag,
      'Department': a.department?.name || '',
      'Vendor': a.vendor?.name || '',
      'Purchase Date': a.purchase_date || '',
      'Warranty Years': a.warranty_years,
      'Warranty Expiry': a.warranty_expiry || '',
      'Status': a.warranty_expiry ? (new Date(a.warranty_expiry) < now ? 'Expired' : (Math.ceil((new Date(a.warranty_expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) <= 90 ? 'Expiring Soon' : 'Valid')) : 'N/A',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Warranty');
    XLSX.writeFile(wb, `warranty_report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Export successful', { description: `${sortedAssets.length} assets exported` });
  };

  const columns: ColumnDef<Asset>[] = useMemo(() => [
    {
      accessorKey: 'asset_tag',
      header: 'Asset',
      cell: ({ row }) => <span className="font-mono font-semibold text-sm">{row.original.asset_tag}</span>,
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => row.original.department?.name || '—',
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => row.original.vendor?.name || '—',
    },
    {
      accessorKey: 'purchase_date',
      header: 'Purchase Date',
      cell: ({ row }) => row.original.purchase_date ? format(parseISO(row.original.purchase_date), 'MMM dd, yyyy') : '—',
    },
    {
      accessorKey: 'warranty_years',
      header: 'Warranty',
      cell: ({ row }) => `${row.original.warranty_years} years`,
    },
    {
      accessorKey: 'warranty_expiry',
      header: 'Expiry',
      cell: ({ row }) => row.original.warranty_expiry ? format(parseISO(row.original.warranty_expiry), 'MMM dd, yyyy') : '—',
    },
    {
      id: 'warranty_status',
      header: 'Status',
      cell: ({ row }) => <WarrantyBadge expiryDate={row.original.warranty_expiry} />,
    },
  ], []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Warranty</h1>
          <p className="text-muted-foreground mt-1">Track asset warranty status (sorted by expiry)</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" /> Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Valid" value={valid.length} icon={ShieldCheck} variant="success" />
        <StatCard title="Expiring Soon" value={expiringSoon.length} icon={ShieldAlert} variant="warning" />
        <StatCard title="Expired" value={expired.length} icon={ShieldX} variant="error" />
      </div>

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={sortedAssets}
          searchPlaceholder="Search assets..."
          pageSize={10}
        />
      </Card>
    </div>
  );
}
