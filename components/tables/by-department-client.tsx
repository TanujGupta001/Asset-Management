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
  Building2,
  Users,
  Package,
} from 'lucide-react';
import type { Asset, Department, Employee } from '@/types';
import { cn } from '@/lib/utils';

interface ByDepartmentClientProps {
  assets: Asset[];
  departments: Department[];
  employees: Employee[];
}

export function ByDepartmentClient({
  assets,
  departments,
  employees,
}: ByDepartmentClientProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (deptId: string) => {
    setOpenSections((prev) => ({ ...prev, [deptId]: !prev[deptId] }));
  };

  const grouped = departments.map((dept) => {
    const deptAssets = assets.filter((a) => a.department_id === dept.id);
    const deptEmployees = employees.filter((e) => e.department_id === dept.id);
    return {
      department: dept,
      assets: deptAssets,
      peopleCount: deptEmployees.length,
    };
  }).filter((g) => g.assets.length > 0 || g.peopleCount > 0);

  const unassignedAssets = assets.filter((a) => !a.department_id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assets by Department</h1>
        <p className="text-muted-foreground mt-1">
          {assets.length} assets across {departments.length} departments
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Departments</p>
              <p className="text-2xl font-bold tracking-tight">{departments.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total People</p>
              <p className="text-2xl font-bold tracking-tight">{employees.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
              <p className="text-2xl font-bold tracking-tight">{assets.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-green-500/10 text-green-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unassigned</p>
              <p className="text-2xl font-bold tracking-tight">{unassignedAssets.length}</p>
            </div>
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {grouped.length === 0 ? (
          <Card className="p-8">
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
              <Building2 className="w-10 h-10 mb-3 opacity-40" />
              <p>No departments with assets found.</p>
            </div>
          </Card>
        ) : (
          grouped.map(({ department: dept, assets: deptAssets, peopleCount }) => {
            const isOpen = openSections[dept.id] ?? false;
            return (
              <Collapsible
                key={dept.id}
                open={isOpen}
                onOpenChange={() => toggleSection(dept.id)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <button className="w-full text-left">
                      <div className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{dept.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {peopleCount} people · {deptAssets.length} assets
                              {dept.head && ` · Head: ${dept.head}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20">
                            <Users className="w-3 h-3 mr-1" />
                            {peopleCount}
                          </Badge>
                          <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                            <Package className="w-3 h-3 mr-1" />
                            {deptAssets.length}
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
                      {deptAssets.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                          No assets assigned to this department.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-left text-muted-foreground">
                                <th className="px-4 py-2 font-medium">Asset Tag</th>
                                <th className="px-4 py-2 font-medium">Type</th>
                                <th className="px-4 py-2 font-medium">Employee</th>
                                <th className="px-4 py-2 font-medium">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {deptAssets.map((asset) => (
                                <tr key={asset.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                                  <td className="px-4 py-2.5">
                                    <span className="font-mono font-semibold">{asset.asset_tag}</span>
                                  </td>
                                  <td className="px-4 py-2.5">{asset.type}</td>
                                  <td className="px-4 py-2.5">{asset.employee?.name || '—'}</td>
                                  <td className="px-4 py-2.5">
                                    <StatusBadge status={asset.status} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}

        {unassignedAssets.length > 0 && (
          <Collapsible
            open={openSections['unassigned'] ?? false}
            onOpenChange={() => toggleSection('unassigned')}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <button className="w-full text-left">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">Unassigned</h3>
                        <p className="text-sm text-muted-foreground">
                          {unassignedAssets.length} assets with no department
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-sm">
                        {unassignedAssets.length}
                      </Badge>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-muted-foreground transition-transform duration-200',
                          openSections['unassigned'] && 'rotate-180'
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
                          <th className="px-4 py-2 font-medium">Employee</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unassignedAssets.map((asset) => (
                          <tr key={asset.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-2.5">
                              <span className="font-mono font-semibold">{asset.asset_tag}</span>
                            </td>
                            <td className="px-4 py-2.5">{asset.type}</td>
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
        )}
      </div>
    </div>
  );
}
