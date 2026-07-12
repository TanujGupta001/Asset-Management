'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatCard } from '@/components/shared/stat-card';
import { ChartContainer } from '@/components/shared/chart-container';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Package, CheckCircle2, Home, Wrench, Users, KeyRound,
  ArrowLeftRight, CalendarClock, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { DashboardStats } from '@/types';

const STATUS_COLORS: Record<string, string> = {
  Active: 'hsl(var(--chart-3))',
  WFH: 'hsl(var(--chart-4))',
  Repair: 'hsl(var(--chart-2))',
  Idle: 'hsl(var(--muted-foreground))',
  Disposed: 'hsl(var(--destructive))',
};

const TYPE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--muted-foreground))'];

const MOVEMENT_COLORS: Record<string, string> = {
  Issued: 'bg-green-600',
  Returned: 'bg-red-600',
  Repair: 'bg-blue-600',
  Disposed: 'bg-red-700',
  Transfer: 'bg-blue-500',
};

export function DashboardClient({ stats }: { stats: DashboardStats }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your IT asset inventory and operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Assets" value={stats.totalAssets} icon={Package} variant="primary" />
        <StatCard title="Active" value={stats.activeAssets} icon={CheckCircle2} variant="success" />
        <StatCard title="WFH" value={stats.wfhAssets} icon={Home} variant="info" />
        <StatCard title="Repair" value={stats.repairAssets.length} icon={Wrench} variant="warning" />
        <StatCard title="Employees" value={stats.totalEmployees} icon={Users} variant="default" />
        <StatCard title="Licenses" value={stats.totalLicenses} icon={KeyRound} variant="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Assets by Department</CardTitle>
            <CardDescription>Distribution of assets across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer height={280}>
              <BarChart data={stats.departmentDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assets by Status</CardTitle>
            <CardDescription>Current status distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer height={280}>
              <PieChart>
                <Pie data={stats.statusDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={40}>
                  {stats.statusDistribution.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] || TYPE_COLORS[i % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Recent Movements</CardTitle>
              <CardDescription>Latest asset in/out activities</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild><Link href="/tracking/in-out">View All</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentMovements.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent movements</p>
            ) : (
              stats.recentMovements.map((m) => (
                <div key={m.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full ${MOVEMENT_COLORS[m.movement_type] || 'bg-gray-500'} shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.asset?.asset_tag || 'Unknown'} <span className="text-muted-foreground">·</span> {m.movement_type}</p>
                    <p className="text-xs text-muted-foreground truncate">{m.from_location} → {m.to_location}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{format(parseISO(m.movement_date), 'MMM dd')}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Recent Transfers</CardTitle>
              <CardDescription>Latest asset transfers between departments</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild><Link href="/tracking/transfers">View All</Link></Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recentTransfers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No recent transfers</p>
            ) : (
              stats.recentTransfers.map((t) => (
                <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.asset?.asset_tag || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.from_department?.name || '—'} → {t.to_department?.name || '—'}</p>
                  </div>
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-muted-foreground shrink-0">{format(parseISO(t.transfer_date), 'MMM dd')}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Upcoming Warranty Expiry</CardTitle>
            <CardDescription>Assets with warranty expiring within 90 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.upcomingWarrantyExpiry.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming warranty expiries</p>
            ) : (
              stats.upcomingWarrantyExpiry.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{a.asset_tag}</p>
                    <p className="text-xs text-muted-foreground">{a.type} · {a.department?.name || 'Unassigned'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{a.warranty_expiry ? format(parseISO(a.warranty_expiry), 'MMM dd, yyyy') : '—'}</span>
                    <StatusBadge status="Expiring" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="w-4 h-4" /> Assets in Repair</CardTitle>
            <CardDescription>Currently undergoing repair</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats.repairAssets.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No assets in repair</p>
            ) : (
              stats.repairAssets.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <p className="text-sm font-medium">{a.asset_tag}</p>
                    <p className="text-xs text-muted-foreground">{a.type} · {a.department?.name || 'Unassigned'}</p>
                  </div>
                  <StatusBadge status="Repair" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
