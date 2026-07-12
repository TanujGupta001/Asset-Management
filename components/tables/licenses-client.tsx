'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { AddLicenseModal } from '@/components/modals/add-license-modal';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, MoreHorizontal, Trash2, Eye, EyeOff, KeyRound, CheckCircle2, AlertTriangle, XCircle, Package } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import type { SoftwareLicense, Asset, Department, Employee, Vendor } from '@/types';
import { deleteLicenseAction } from '@/actions';

interface LicensesClientProps {
  licenses: SoftwareLicense[];
  assets: Asset[];
  departments: Department[];
  employees: Employee[];
  vendors: Vendor[];
}

export function LicensesClient({ licenses, assets, departments, employees, vendors }: LicensesClientProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const toggleKey = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const maskKey = (key: string | null) => {
    if (!key) return '—';
    return key.slice(0, 5) + '•••••••••••••' + key.slice(-5);
  };

  const handleExport = async () => {
    const XLSX = await import('xlsx');
    const data = licenses.map((l) => ({
      'License Number': l.license_number,
      'Type': l.type,
      'Edition': l.edition || '',
      'Product Key': l.product_key || '',
      'Linked Asset': l.asset?.asset_tag || '',
      'Department': l.department?.name || '',
      'Assigned To': l.employee?.name || '',
      'Vendor': l.vendor?.name || '',
      'Purchase Date': l.purchase_date || '',
      'Expiry Date': l.expiry_date || '',
      'Status': l.status,
      'Notes': l.notes || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Licenses');
    XLSX.writeFile(wb, `licenses_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Export successful', { description: `${licenses.length} licenses exported` });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteLicenseAction(deleteId);
    if (result.error) {
      toast.error('Delete failed', { description: result.error });
    } else {
      toast.success('License deleted');
    }
    setDeleteId(null);
  };

  const columns: ColumnDef<SoftwareLicense>[] = useMemo(() => [
    {
      accessorKey: 'license_number',
      header: 'License Number',
      cell: ({ row }) => <span className="font-mono font-semibold text-sm">{row.original.license_number}</span>,
    },
    { accessorKey: 'type', header: 'Type' },
    { accessorKey: 'edition', header: 'Edition', cell: ({ row }) => row.original.edition || '—' },
    {
      accessorKey: 'product_key',
      header: 'Product Key',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs">
            {visibleKeys.has(row.original.id) ? row.original.product_key || '—' : maskKey(row.original.product_key)}
          </span>
          {row.original.product_key && (
            <button onClick={() => toggleKey(row.original.id)} className="text-muted-foreground hover:text-foreground">
              {visibleKeys.has(row.original.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'asset',
      header: 'Linked Asset',
      cell: ({ row }) => row.original.asset?.asset_tag || '—',
    },
    {
      accessorKey: 'department',
      header: 'Department',
      cell: ({ row }) => row.original.department?.name || '—',
    },
    {
      accessorKey: 'employee',
      header: 'Assigned To',
      cell: ({ row }) => row.original.employee?.name || '—',
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
      accessorKey: 'expiry_date',
      header: 'Expiry Date',
      cell: ({ row }) => row.original.expiry_date ? format(parseISO(row.original.expiry_date), 'MMM dd, yyyy') : '—',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(row.original.id)}>
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [visibleKeys]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Software Licenses</h1>
          <p className="text-muted-foreground mt-1">Independent software license register</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add License
          </Button>
          <Button variant="outline" onClick={handleExport}>Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Total" value={licenses.length} icon={KeyRound} variant="primary" />
        <StatCard title="Active" value={licenses.filter((l) => l.status === 'Active').length} icon={CheckCircle2} variant="success" />
        <StatCard title="Expiring" value={licenses.filter((l) => l.status === 'Expiring').length} icon={AlertTriangle} variant="warning" />
        <StatCard title="Expired" value={licenses.filter((l) => l.status === 'Expired').length} icon={XCircle} variant="error" />
        <StatCard title="Unassigned" value={licenses.filter((l) => l.status === 'Unassigned').length} icon={Package} variant="default" />
      </div>

      <Card className="p-4">
        <DataTable
          columns={columns}
          data={licenses}
          searchPlaceholder="Search licenses..."
          pageSize={10}
        />
      </Card>

      <AddLicenseModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        assets={assets}
        departments={departments}
        employees={employees}
        vendors={vendors}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete License?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The license will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
