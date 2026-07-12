'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, ChevronLeft } from 'lucide-react';
import { navSections } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/ui-store';
import { Button } from '@/components/ui/button';

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 no-print',
        sidebarCollapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-sidebar-accent shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-accent text-accent-foreground shrink-0">
          <Building2 className="w-5 h-5" />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm tracking-tight leading-tight">GoalSeek</p>
            <p className="font-bold text-sm tracking-tight leading-tight">Asset Manager</p>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-2">
        {navSections.map((section) => (
          <div key={section.title} className="mb-4">
            {!sidebarCollapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                      isActive
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground',
                      sidebarCollapsed && 'justify-center'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-2 border-t border-sidebar-accent shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="w-full text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent justify-center"
        >
          <ChevronLeft className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
        </Button>
      </div>
    </aside>
  );
}
