import { supabase } from './supabase';
import type {
  Asset,
  Department,
  Employee,
  Vendor,
  Movement,
  Transfer,
  SoftwareLicense,
  InventoryItem,
  Telephone,
  Printer,
  AuditLog,
  DashboardStats,
} from '@/types';

// ============ Departments ============
export async function getDepartments(): Promise<Department[]> {
  const { data, error } = await supabase.from('departments').select('*').order('name');
  if (error) throw error;
  return data || [];
}

// ============ Employees ============
export async function getEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*, department:departments(*)')
    .order('name');
  if (error) throw error;
  return data || [];
}

export async function getAvailableEmployees(): Promise<Employee[]> {
  const { data, error } = await supabase
    .from('employees')
    .select('*, department:departments(*)')
    .eq('status', 'Active')
    .order('name');
  if (error) throw error;
  return data || [];
}

// ============ Vendors ============
export async function getVendors(): Promise<Vendor[]> {
  const { data, error } = await supabase.from('vendors').select('*').order('name');
  if (error) throw error;
  return data || [];
}

// ============ Assets ============
export async function getAssets(): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*, department:departments(*), employee:employees(*), vendor:vendors(*)')
    .order('asset_tag');
  if (error) throw error;
  return data || [];
}

export async function getAssetById(id: string): Promise<Asset | null> {
  const { data, error } = await supabase
    .from('assets')
    .select('*, department:departments(*), employee:employees(*), vendor:vendors(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getAssetsByStatus(status: string): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*, department:departments(*), employee:employees(*), vendor:vendors(*)')
    .eq('status', status)
    .order('asset_tag');
  if (error) throw error;
  return data || [];
}

export async function getAssetsByDepartment(deptId: string): Promise<Asset[]> {
  const { data, error } = await supabase
    .from('assets')
    .select('*, department:departments(*), employee:employees(*), vendor:vendors(*)')
    .eq('department_id', deptId)
    .order('asset_tag');
  if (error) throw error;
  return data || [];
}

// ============ Movements ============
export async function getMovements(): Promise<Movement[]> {
  const { data, error } = await supabase
    .from('movements')
    .select('*, asset:assets(*, department:departments(*)), department:departments(*)')
    .order('movement_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getRecentMovements(limit = 5): Promise<Movement[]> {
  const { data, error } = await supabase
    .from('movements')
    .select('*, asset:assets(*, department:departments(*)), department:departments(*)')
    .order('movement_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ============ Transfers ============
export async function getTransfers(): Promise<Transfer[]> {
  const { data, error } = await supabase
    .from('transfers')
    .select('*, asset:assets(*), from_department:departments!from_department_id(*), to_department:departments!to_department_id(*), from_employee:employees!from_employee_id(*), to_employee:employees!to_employee_id(*)')
    .order('transfer_date', { ascending: false });
  if (error) throw error;
  return data || [];
}

// ============ Software Licenses ============
export async function getSoftwareLicenses(): Promise<SoftwareLicense[]> {
  const { data, error } = await supabase
    .from('software_licenses')
    .select('*, asset:assets(*), department:departments(*), employee:employees(*), vendor:vendors(*)')
    .order('license_number');
  if (error) throw error;
  return data || [];
}

// ============ Inventory ============
export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase.from('inventory_items').select('*').order('type');
  if (error) throw error;
  return data || [];
}

// ============ Telephones ============
export async function getTelephones(): Promise<Telephone[]> {
  const { data, error } = await supabase.from('telephones').select('*').order('organization');
  if (error) throw error;
  return data || [];
}

// ============ Printers ============
export async function getPrinters(): Promise<Printer[]> {
  const { data, error } = await supabase.from('printers').select('*').order('brand');
  if (error) throw error;
  return data || [];
}

// ============ Audit Logs ============
export async function getAuditLogs(limit = 20): Promise<AuditLog[]> {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function createAuditLog(log: Omit<AuditLog, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('audit_logs').insert(log);
  if (error) throw error;
}

// ============ Dashboard Stats ============
export async function getDashboardStats(): Promise<DashboardStats> {
  const [assets, employees, departments, licenses, movements, transfers] = await Promise.all([
    getAssets(),
    getEmployees(),
    getDepartments(),
    getSoftwareLicenses(),
    getRecentMovements(10),
    getTransfers(),
  ]);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const statusCount = (s: string) => assets.filter((a) => a.status === s).length;
  const licenseStatusCount = (s: string) => licenses.filter((l) => l.status === s).length;

  const upcomingWarrantyExpiry = assets
    .filter((a) => {
      if (!a.warranty_expiry || a.status === 'Disposed') return false;
      const days = Math.ceil((new Date(a.warranty_expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days >= 0 && days <= 90;
    })
    .sort((a, b) => new Date(a.warranty_expiry!).getTime() - new Date(b.warranty_expiry!).getTime())
    .slice(0, 5);

  const repairAssets = assets.filter((a) => a.status === 'Repair');

  const todayMovements = movements.filter((m) => {
    const mDate = new Date(m.movement_date);
    return mDate.toISOString().split('T')[0] === todayStr;
  });

  const departmentDistribution = departments.map((d) => ({
    name: d.name,
    count: assets.filter((a) => a.department_id === d.id).length,
  }));

  const statusDistribution = (['Active', 'WFH', 'Repair', 'Idle', 'Disposed'] as const).map((s) => ({
    name: s,
    count: statusCount(s),
  }));

  const typeDistribution = (['Desktop', 'Laptop', 'Monitor', 'Server', 'Tablet', 'Other'] as const).map((t) => ({
    name: t,
    count: assets.filter((a) => a.type === t).length,
  }));

  return {
    totalAssets: assets.length,
    activeAssets: statusCount('Active'),
    wfhAssets: statusCount('WFH'),
    repairAssets: repairAssets as Asset[],
    idleAssets: statusCount('Idle'),
    disposedAssets: statusCount('Disposed'),
    totalEmployees: employees.length,
    totalDepartments: departments.length,
    totalLicenses: licenses.length,
    activeLicenses: licenseStatusCount('Active'),
    expiringLicenses: licenseStatusCount('Expiring'),
    expiredLicenses: licenseStatusCount('Expired'),
    upcomingWarrantyExpiry,
    recentMovements: movements.slice(0, 5),
    recentTransfers: transfers.slice(0, 5),
    todayMovements,
    departmentDistribution,
    statusDistribution,
    typeDistribution,
  };
}
