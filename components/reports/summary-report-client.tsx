'use client';

import { ChartContainer } from '@/components/shared/chart-container';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { Building2, FileBarChart, Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, HorizontalBarChart,
} from 'recharts';
import type { DashboardStats, Department, Asset, SoftwareLicense } from '@/types';

interface SummaryReportClientProps {
  stats: DashboardStats;
  departments: Department[];
  assets: Asset[];
  licenses: SoftwareLicense[];
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'hsl(var(--chart-3))',
  WFH: 'hsl(var(--chart-4))',
  Repair: 'hsl(var(--chart-2))',
  Idle: 'hsl(var(--muted-foreground))',
  Disposed: 'hsl(var(--destructive))',
};

const TYPE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted-foreground))'];

export function SummaryReportClient({ stats, departments, assets, licenses }: SummaryReportClientProps) {
  const handlePrint = () => window.print();

  const handleExportCSV = () => {
    const headers = ['Section', 'Metric', 'Value'];
    const rows: string[][] = [
      ['Organization Overview', 'Total Assets', String(stats.totalAssets)],
      ['Organization Overview', 'Total Employees', String(stats.totalEmployees)],
      ['Organization Overview', 'Total Departments', String(stats.totalDepartments)],
      ['Organization Overview', 'Total Licenses', String(stats.totalLicenses)],
      ...stats.departmentDistribution.map((d) => ['Department Summary', d.name, String(d.count)]),
      ...stats.statusDistribution.map((s) => ['Status Distribution', s.name, String(s.count)]),
      ...stats.typeDistribution.map((t) => ['Device Distribution', t.name, String(t.count)]),
      ['License Coverage', 'Active', String(stats.activeLicenses)],
      ['License Coverage', 'Expiring', String(stats.expiringLicenses)],
      ['License Coverage', 'Expired', String(stats.expiredLicenses)],
    ];
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const spareDevices = assets.filter((a) => a.status === 'Idle');
  const licenseCoverage = [
    { name: 'Active', count: stats.activeLicenses },
    { name: 'Expiring', count: stats.expiringLicenses },
    { name: 'Expired', count: stats.expiredLicenses },
    { name: 'Unassigned', count: licenses.filter((l) => l.status === 'Unassigned').length },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Summary Report</h1>
          <p className="text-muted-foreground mt-1">Comprehensive IT asset overview report</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print Report
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="print-only mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary text-primary-foreground">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">IT Asset Manager</h1>
            <p className="text-sm text-muted-foreground">Enterprise IT Asset Management System</p>
          </div>
        </div>
        <div className="mt-2 border-b-2 border-red-700 pb-2">
          <p className="text-sm">Summary Report · {format(new Date(), 'MMMM dd, yyyy')}</p>
        </div>
      </div>

      {/* Organization Overview */}
      <Card className="print-container">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="w-5 h-5" /> Organization Overview
          </CardTitle>
          <CardDescription>High-level statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold">{stats.totalAssets}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold">{stats.totalDepartments}</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Software Licenses</p>
              <p className="text-2xl font-bold">{stats.totalLicenses}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Summary + Device Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="print-container">
          <CardHeader>
            <CardTitle>Department Summary</CardTitle>
            <CardDescription>Assets per department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer height={250}>
              <BarChart data={stats.departmentDistribution} layout="vertical" margin={{ left: 20, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" width={80} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="print-container">
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>Assets by type</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer height={250}>
              <PieChart>
                <Pie data={stats.typeDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {stats.typeDistribution.map((_, i) => <Cell key={i} fill={TYPE_COLORS[i % TYPE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Spare Devices */}
      <Card className="print-container">
        <CardHeader>
          <CardTitle>Spare Devices</CardTitle>
          <CardDescription>Idle assets available for assignment</CardDescription>
        </CardHeader>
        <CardContent>
          {spareDevices.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No spare devices</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Asset Tag</th>
                    <th className="text-left px-3 py-2 font-semibold">Type</th>
                    <th className="text-left px-3 py-2 font-semibold">Department</th>
                    <th className="text-left px-3 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {spareDevices.map((a) => (
                    <tr key={a.id} className="border-t border-border">
                      <td className="px-3 py-2 font-mono">{a.asset_tag}</td>
                      <td className="px-3 py-2">{a.type}</td>
                      <td className="px-3 py-2">{a.department?.name || '—'}</td>
                      <td className="px-3 py-2"><StatusBadge status={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* License Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="print-container">
          <CardHeader>
            <CardTitle>License Coverage</CardTitle>
            <CardDescription>Software license status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer height={250}>
              <BarChart data={licenseCoverage} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="print-container">
          <CardHeader>
            <CardTitle>Department Comparison</CardTitle>
            <CardDescription>Asset count by department</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer height={250}>
              <BarChart data={stats.departmentDistribution} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
