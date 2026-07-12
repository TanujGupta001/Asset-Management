export type AssetStatus = 'Active' | 'WFH' | 'Repair' | 'Idle' | 'Disposed';
export type AssetType = 'Desktop' | 'Laptop' | 'Monitor' | 'Server' | 'Tablet' | 'Other';
export type MovementType = 'Issued' | 'Returned' | 'Repair' | 'Disposed' | 'Transfer';
export type LicenseStatus = 'Active' | 'Expiring' | 'Expired' | 'Unassigned';
export type InventoryCondition = 'Working' | 'Broken' | 'Disposed';
export type PhonePrinterStatus = 'Working' | 'Not Working' | 'Spare';
export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';
export type TransferStatus = 'Pending' | 'Completed' | 'Rejected';

export interface Department {
  id: string;
  name: string;
  head: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string | null;
  department_id: string | null;
  role: string | null;
  phone: string | null;
  status: EmployeeStatus;
  created_at: string;
  updated_at: string;
  department?: Department | null;
}

export interface Vendor {
  id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: string;
  asset_tag: string;
  type: AssetType;
  department_id: string | null;
  employee_id: string | null;
  cpu_brand: string | null;
  monitor_brand: string | null;
  keyboard_brand: string | null;
  mouse_brand: string | null;
  cpu_serial: string | null;
  monitor_serial: string | null;
  keyboard_serial: string | null;
  mouse_serial: string | null;
  vendor_id: string | null;
  invoice_number: string | null;
  purchase_date: string | null;
  warranty_years: number;
  warranty_expiry: string | null;
  windows_license: string | null;
  ms_license: string | null;
  windows_license_purchase_date: string | null;
  ms_license_purchase_date: string | null;
  antivirus: string | null;
  status: AssetStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  department?: Department | null;
  employee?: Employee | null;
  vendor?: Vendor | null;
}

export interface Movement {
  id: string;
  asset_id: string;
  movement_type: MovementType;
  movement_date: string;
  from_location: string | null;
  to_location: string | null;
  department_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  asset?: Asset | null;
  department?: Department | null;
}

export interface Transfer {
  id: string;
  asset_id: string;
  transfer_date: string;
  from_department_id: string | null;
  to_department_id: string | null;
  from_employee_id: string | null;
  to_employee_id: string | null;
  reason: string | null;
  approved_by: string | null;
  handover: string | null;
  notes: string | null;
  status: TransferStatus;
  created_at: string;
  updated_at: string;
  asset?: Asset | null;
  from_department?: Department | null;
  to_department?: Department | null;
  from_employee?: Employee | null;
  to_employee?: Employee | null;
}

export interface SoftwareLicense {
  id: string;
  license_number: string;
  type: string;
  edition: string | null;
  product_key: string | null;
  asset_id: string | null;
  department_id: string | null;
  employee_id: string | null;
  vendor_id: string | null;
  purchase_date: string | null;
  expiry_date: string | null;
  status: LicenseStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  asset?: Asset | null;
  department?: Department | null;
  employee?: Employee | null;
  vendor?: Vendor | null;
}

export interface InventoryItem {
  id: string;
  type: string;
  brand: string | null;
  serial: string | null;
  product_key: string | null;
  condition: InventoryCondition;
  assigned_to: string | null;
  department_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Telephone {
  id: string;
  extension: string | null;
  contact_number: string | null;
  assigned_to: string | null;
  organization: string | null;
  serial: string | null;
  status: PhonePrinterStatus;
  created_at: string;
  updated_at: string;
}

export interface Printer {
  id: string;
  serial: string | null;
  brand: string | null;
  model: string | null;
  product_number: string | null;
  assigned_to: string | null;
  status: PhonePrinterStatus;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity: string;
  entity_id: string | null;
  performed_by: string | null;
  details: string | null;
  created_at: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalAssets: number;
  activeAssets: number;
  wfhAssets: number;
  // repairAssets: number;
  idleAssets: number;
  disposedAssets: number;
  totalEmployees: number;
  totalDepartments: number;
  totalLicenses: number;
  activeLicenses: number;
  expiringLicenses: number;
  expiredLicenses: number;
  upcomingWarrantyExpiry: Asset[];
  recentMovements: (Movement & { asset?: Asset | null })[];
  recentTransfers: (Transfer & { asset?: Asset | null; from_department?: Department | null; to_department?: Department | null })[];
  repairAssets: Asset[];
  todayMovements: (Movement & { asset?: Asset | null })[];
  departmentDistribution: { name: string; count: number }[];
  statusDistribution: { name: string; count: number }[];
  typeDistribution: { name: string; count: number }[];
}
