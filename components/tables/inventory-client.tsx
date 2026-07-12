'use client';

import { useState, useMemo } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/data-table';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { ChartContainer } from '@/components/shared/chart-container';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Boxes,
  Building2,
  Package,
  CheckCircle2,
  XCircle,
  Trash2,
  MoreHorizontal,
  Users,
  Monitor,
  PackageOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { Asset, Department, Employee, InventoryItem } from '@/types';
import { deleteInventoryItemAction } from '@/actions';

interface InventoryClientProps {
  assets: Asset[];
  departments: Department[];
  employees: Employee[];
  inventoryItems: InventoryItem[];
}

export function InventoryClient({
  assets,
  departments,
  employees,
  inventoryItems,
}: InventoryClientProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await deleteInventoryItemAction(deleteId);
    if (result.error) {
      toast.error('Delete failed', { description: result.error });
    } else {
      toast.success('Inventory item deleted');
    }
    setDeleteId(null);
  };

  const workingCount = inventoryItems.filter((i) => i.condition === 'Working').length;
  const brokenCount = inventoryItems.filter((i) => i.condition === 'Broken').length;
  const disposedCount = inventoryItems.filter((i) => i.condition === 'Disposed').length;

  const groupedByType = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    for (const item of inventoryItems) {
      if (!groups[item.type]) groups[item.type] = [];
      groups[item.type].push(item);
    }
    return groups;
  }, [inventoryItems]);

  const departmentStats = useMemo(() => {
    return departments.map((dept) => {
      const deptEmployees = employees.filter((e) => e.department_id === dept.id);
      const deptAssets = assets.filter((a) => a.department_id === dept.id);
      return {
        department: dept,
        peopleCount: deptEmployees.length,
        computers: deptAssets.filter((a) => a.type === 'Desktop').length,
        laptops: deptAssets.filter((a) => a.type === 'Laptop').length,
        wfh: deptAssets.filter((a) => a.status === 'WFH').length,
        repair: deptAssets.filter((a) => a.status === 'Repair').length,
        spare: deptAssets.filter((a) => a.status === 'Idle').length,
        total: deptAssets.length,
      };
    });
  }, [departments, employees, assets]);

  const chartData = useMemo(
    () =>
      departmentStats.map((d) => ({
        name: d.department.name,
        assets: d.total,
      })),
    [departmentStats],
  );

  const spareAssets = useMemo(
    () => assets.filter((a) => a.status === 'Idle'),
    [assets],
  );

  const columns: ColumnDef<InventoryItem>[] = useMemo(
    () => [
      { accessorKey: 'type', header: 'Type', cell: ({ row }) => <span className="font-medium">{row.original.type}</span> },
      { accessorKey: 'brand', header: 'Brand', cell: ({ row }) => row.original.brand || '—' },
      {
        accessorKey: 'serial',
        header: 'Serial',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.serial || '—'}</span>,
      },
      {
        accessorKey: 'product_key',
        header: 'Product Key',
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.product_key || '—'}</span>,
      },
      {
        accessorKey: 'condition',
        header: 'Condition',
        cell: ({ row }) => <StatusBadge status={row.original.condition} />,
      },
      { accessorKey: 'assigned_to', header: 'Assigned To', cell: ({ row }) => row.original.assigned_to || '—' },
      { accessorKey: 'notes', header: 'Notes', cell: ({ row }) => row.original.notes || '—' },
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
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(row.original.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [],
  );

  const spareColumns: ColumnDef<Asset>[] = useMemo(
    () => [
      {
        accessorKey: 'asset_tag',
        header: 'Asset Tag',
        cell: ({ row }) => <span className="font-mono font-semibold text-sm">{row.original.asset_tag}</span>,
      },
      { accessorKey: 'type', header: 'Type' },
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
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
    ],
    [],
  );

  const sectionButtons = [
    { label: 'Department Headcount', icon: Building2, href: '/assets/by-department' },
    { label: 'Spare Devices', icon: PackageOpen, href: '#spare' },
    { label: 'Extra Inventory', icon: Boxes, href: '#inventory' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Extra Inventory</h1>
        <p className="text-muted-foreground mt-1">
          Manage spare peripherals, inventory items, and department headcount
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sectionButtons.map((btn) => {
          const Icon = btn.icon;
          return (
            <Button
              key={btn.label}
              variant="outline"
              className="h-auto py-6 justify-start"
              asChild
            >
              <a href={btn.href}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-base font-semibold">{btn.label}</span>
                </div>
              </a>
            </Button>
          );
        })}
      </div>

      <Tabs defaultValue="inventory" className="w-full">
        <TabsList>
          <TabsTrigger value="inventory">Extra Inventory</TabsTrigger>
          <TabsTrigger value="department">Department</TabsTrigger>
          <TabsTrigger value="spare">Spare</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard title="Working" value={workingCount} icon={CheckCircle2} variant="success" />
            <StatCard title="Broken" value={brokenCount} icon={XCircle} variant="error" />
            <StatCard title="Disposed" value={disposedCount} icon={Trash2} variant="default" />
          </div>

          {Object.entries(groupedByType).map(([type, items]) => (
            <Card key={type} className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">{type}</h3>
                <span className="text-sm text-muted-foreground">({items.length})</span>
              </div>
              <DataTable
                columns={columns}
                data={items}
                searchPlaceholder="Search inventory..."
                pageSize={10}
              />
            </Card>
          ))}

          {inventoryItems.length === 0 && (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                <Boxes className="w-10 h-10 mb-3 opacity-40" />
                <p>No inventory items found.</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="department" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Assets per Department</CardTitle>
                <CardDescription>Distribution of assets across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer height={300}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="assets" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Department Summary</CardTitle>
                <CardDescription>People and asset counts per department</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground">
                        <th className="px-3 py-2 font-medium">Department</th>
                        <th className="px-3 py-2 font-medium text-center">People</th>
                        <th className="px-3 py-2 font-medium text-center">Desktops</th>
                        <th className="px-3 py-2 font-medium text-center">Laptops</th>
                        <th className="px-3 py-2 font-medium text-center">WFH</th>
                        <th className="px-3 py-2 font-medium text-center">Repair</th>
                        <th className="px-3 py-2 font-medium text-center">Spare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentStats.map((d) => (
                        <tr key={d.department.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2.5 font-medium">{d.department.name}</td>
                          <td className="px-3 py-2.5 text-center">{d.peopleCount}</td>
                          <td className="px-3 py-2.5 text-center">{d.computers}</td>
                          <td className="px-3 py-2.5 text-center">{d.laptops}</td>
                          <td className="px-3 py-2.5 text-center">{d.wfh}</td>
                          <td className="px-3 py-2.5 text-center">{d.repair}</td>
                          <td className="px-3 py-2.5 text-center">{d.spare}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Total People" value={employees.length} icon={Users} variant="primary" />
            <StatCard title="Departments" value={departments.length} icon={Building2} variant="default" />
            <StatCard title="Total Assets" value={assets.length} icon={Package} variant="accent" />
            <StatCard title="Spare Devices" value={spareAssets.length} icon={PackageOpen} variant="warning" />
          </div>
        </TabsContent>

        <TabsContent value="spare" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Spare Assets" value={spareAssets.length} icon={PackageOpen} variant="primary" />
            <StatCard title="Idle" value={assets.filter((a) => a.status === 'Idle').length} icon={Monitor} variant="default" />
            <StatCard title="Available Employees" value={employees.filter((e) => e.status === 'Active').length} icon={Users} variant="success" />
            <StatCard title="Departments" value={departments.length} icon={Building2} variant="accent" />
          </div>

          <Card className="p-4">
            <div className="mb-4 flex items-center gap-2">
              <PackageOpen className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Spare / Idle Assets</h3>
              <span className="text-sm text-muted-foreground">({spareAssets.length})</span>
            </div>
            <DataTable
              columns={spareColumns}
              data={spareAssets}
              searchPlaceholder="Search spare assets..."
              pageSize={10}
            />
          </Card>

          {spareAssets.length === 0 && (
            <Card className="p-8">
              <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                <PackageOpen className="w-10 h-10 mb-3 opacity-40" />
                <p>No spare devices found.</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Inventory Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The inventory item will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
