import {
  LayoutDashboard,
  Package,
  CircleDot,
  Building2,
  ArrowLeftRight,
  FileBarChart,
  ScrollText,
  KeyRound,
  ShieldCheck,
  Boxes,
  Phone,
  ArrowUpDown,
  Settings,
  LogOut,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Assets',
    items: [
      { label: 'All Assets', href: '/assets', icon: Package },
      { label: 'By Status', href: '/assets/by-status', icon: CircleDot },
      { label: 'By Department', href: '/assets/by-department', icon: Building2 },
    ],
  },
  {
    title: 'Tracking',
    items: [
      { label: 'In / Out Log', href: '/tracking/in-out', icon: ArrowLeftRight },
      { label: 'Transfer Log', href: '/tracking/transfers', icon: ScrollText },
    ],
  },
  {
    title: 'Reports',
    items: [
      { label: 'Summary Report', href: '/reports/summary', icon: FileBarChart },
    ],
  },
  {
    title: 'Licenses & Warranty',
    items: [
      { label: 'Software Licenses', href: '/licenses', icon: KeyRound },
      { label: 'Warranty', href: '/warranty', icon: ShieldCheck },
    ],
  },
  {
    title: 'Extra Inventory',
    items: [
      { label: 'Extra Inventory', href: '/inventory', icon: Boxes },
      { label: 'Telephones & Printers', href: '/telephones-printers', icon: Phone },
    ],
  },
  {
    title: 'Bottom',
    items: [
      { label: 'Import / Export', href: '/import-export', icon: ArrowUpDown },
      { label: 'Settings', href: '/settings', icon: Settings },
      { label: 'Logout', href: '/logout', icon: LogOut },
    ],
  },
];
