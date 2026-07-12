'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Plus,
  UserPlus,
  FileSpreadsheet,
  Menu,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/components/theme-provider';
import { useUIStore } from '@/store/ui-store';
import { SESSION_KEY, getSessionUsername } from '@/lib/auth';
import { cn } from '@/lib/utils';

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/assets': 'All Assets',
  '/assets/by-status': 'Assets by Status',
  '/assets/by-department': 'Assets by Department',
  '/tracking/in-out': 'In / Out Log',
  '/tracking/transfers': 'Transfer Log',
  '/reports/summary': 'Summary Report',
  '/licenses': 'Software Licenses',
  '/warranty': 'Warranty',
  '/inventory': 'Extra Inventory',
  '/telephones-printers': 'Telephones & Printers',
  '/import-export': 'Import / Export',
  '/settings': 'Settings',
};

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { toggleSidebar, globalSearch, setGlobalSearch } = useUIStore();
  const [searchValue, setSearchValue] = useState('');
  const [notifications, setNotifications] = useState(3);
  const searchRef = useRef<HTMLInputElement>(null);

  const username = typeof window !== 'undefined' ? getSessionUsername(sessionStorage.getItem(SESSION_KEY)) || 'admin' : 'admin';
  const currentPage = pageNames[pathname] || 'Page';

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      setGlobalSearch(searchValue);
      router.push(`/assets?q=${encodeURIComponent(searchValue)}`);
    }
  };

  const handleLogout = () => {
    document.cookie = `${SESSION_KEY}=; path=/; max-age=0`;
    sessionStorage.removeItem(SESSION_KEY);
    router.replace('/login');
  };

  const breadcrumbs = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-border flex items-center px-4 gap-4 no-print">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleSidebar}>
        <Menu className="w-5 h-5" />
      </Button>

      <div className="hidden md:flex items-center gap-1.5 text-sm shrink-0">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground" />}
            <span className={cn(i === breadcrumbs.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground capitalize')}>
              {crumb === 'dashboard' ? 'Dashboard' : crumb.replace(/-/g, ' ')}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={searchRef}
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search assets, employees, licenses... (Ctrl+K)"
            className="pl-10 h-9"
          />
        </div>
      </form>

      <div className="flex items-center gap-2 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex">
              <Plus className="w-4 h-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/assets?action=add')}>
              <Plus className="w-4 h-4 mr-2" /> Add Asset
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/assets?action=add-employee')}>
              <UserPlus className="w-4 h-4 mr-2" /> Add Employee
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/import-export')}>
              <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" onClick={toggleTheme} title="Toggle theme">
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </Button>

        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center bg-accent text-accent-foreground">
                  {notifications}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="text-sm font-medium">Warranty Expiring</span>
              <span className="text-xs text-muted-foreground">2 assets have warranty expiring soon</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="text-sm font-medium">License Expiring</span>
              <span className="text-xs text-muted-foreground">1 software license expires within 30 days</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex flex-col items-start gap-1">
              <span className="text-sm font-medium">Asset in Repair</span>
              <span className="text-xs text-muted-foreground">2 assets currently in repair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{username}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{username}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="w-4 h-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
