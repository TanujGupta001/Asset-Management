'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  ChevronDown,
  CheckCircle2,
  Home,
  Wrench,
  Ban,
  Trash2,
  Package,
} from 'lucide-react';
import type { Asset, AssetStatus } from '@/types';
import { cn } from '@/lib/utils';

interface ByStatusClientProps {
  assets: Asset[];
}

const STATUS_ORDER: AssetStatus[] = ['Active', 'WFH', 'Repair', 'Idle', 'Disposed'];

const STATUS_ICONS: Record<AssetStatus, typeof CheckCircle2> = {
  Active: CheckCircle2,
  WFH: Home,
  Repair: Wrench,
  Idle: Ban,
  Disposed: Trash2,
};

const STATUS_ICON_COLORS: Record<AssetStatus, string> = {
  Active: 'text-green-600',
  WFH: 'text-blue-600',
  Repair: 'text-amber-600',
  Idle: 'text-slate-500',
  Disposed: 'text-red-600',
};

export function ByStatusClient({ assets }: ByStatusClientProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Active: true,
  });

  const grouped = STATUS_ORDER.map((status) => ({
    status,
    assets: assets.filter((a) => a.status === status),
  })).filter((g) => g.assets.length > 0);

  const toggleSection = (status: string) => {
    setOpenSections((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assets by Status</h1>
        <p className="text-muted-foreground mt-1">
          {assets.length} assets grouped by their current status
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {STATUS_ORDER.map((status) => {
          const Icon = STATUS_ICONS[status];
          const count = assets.filter((a) => a.status === status).length;
          return (
            <Card key={status} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{status}</p>
                  <p className="text-2xl font-bold tracking-tight">{count}</p>
                </div>
                <div className={cn('p-2.5 rounded-lg bg-muted/50', STATUS_ICON_COLORS[status])}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        {grouped.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
              <Package className="w-10 h-10 mb-3 opacity-40" />
              <p>No assets found.</p>
            </div>
          </Card>
        ) : (
          grouped.map(({ status, assets: statusAssets }) => {
            const Icon = STATUS_ICONS[status];
            const isOpen = openSections[status] ?? false;
            return (
              <Collapsible key={status} open={isOpen} onOpenChange={() => toggleSection(status)}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <button className="w-full text-left">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className={cn('p-2 rounded-lg bg-muted/50', STATUS_ICON_COLORS[status])}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{status}</h3>
                            <p className="text-sm text-muted-foreground">
                              {statusAssets.length} asset{statusAssets.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-sm">
                            {statusAssets.length}
                          </Badge>
                          <ChevronDown
                            className={cn(
                              'w-5 h-5 text-muted-foreground transition-transform duration-200',
                              isOpen && 'rotate-180'
                            )}
                          />
                        </div>
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="border-t border-border" />
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-muted-foreground">
                              <th className="px-4 py-2 font-medium">Asset Tag</th>
                              <th className="px-4 py-2 font-medium">Type</th>
                              <th className="px-4 py-2 font-medium">Department</th>
                              <th className="px-4 py-2 font-medium">Employee</th>
                              <th className="px-4 py-2 font-medium">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {statusAssets.map((asset) => (
                              <tr key={asset.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-2.5">
                                  <span className="font-mono font-semibold">{asset.asset_tag}</span>
                                </td>
                                <td className="px-4 py-2.5">{asset.type}</td>
                                <td className="px-4 py-2.5">{asset.department?.name || '—'}</td>
                                <td className="px-4 py-2.5">{asset.employee?.name || '—'}</td>
                                <td className="px-4 py-2.5">
                                  <StatusBadge status={asset.status} />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </div>
    </div>
  );
}
