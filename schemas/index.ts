import { z } from 'zod';

export const assetSchema = z.object({
  asset_tag: z.string().min(1, 'Asset tag is required'),
  type: z.enum(['Desktop', 'Laptop', 'Monitor', 'Server', 'Tablet', 'Other']),
  department_id: z.string().uuid().optional().nullable(),
  employee_id: z.string().uuid().optional().nullable(),
  cpu_brand: z.string().optional().nullable(),
  monitor_brand: z.string().optional().nullable(),
  keyboard_brand: z.string().optional().nullable(),
  mouse_brand: z.string().optional().nullable(),
  cpu_serial: z.string().optional().nullable(),
  monitor_serial: z.string().optional().nullable(),
  keyboard_serial: z.string().optional().nullable(),
  mouse_serial: z.string().optional().nullable(),
  vendor_id: z.string().uuid().optional().nullable(),
  invoice_number: z.string().optional().nullable(),
  purchase_date: z.string().optional().nullable(),
  warranty_years: z.coerce.number().min(0).max(20).default(0),
  warranty_expiry: z.string().optional().nullable(),
  windows_license: z.string().optional().nullable(),
  ms_license: z.string().optional().nullable(),
  windows_license_purchase_date: z.string().optional().nullable(),
  ms_license_purchase_date: z.string().optional().nullable(),
  antivirus: z.string().optional().nullable(),
  status: z.enum(['Active', 'WFH', 'Repair', 'Idle', 'Disposed']).default('Active'),
  notes: z.string().optional().nullable(),
});

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  department_id: z.string().uuid().optional().nullable(),
  role: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  status: z.enum(['Active', 'Inactive', 'On Leave']).default('Active'),
});

export const movementSchema = z.object({
  asset_id: z.string().uuid('Asset is required'),
  movement_type: z.enum(['Issued', 'Returned', 'Repair', 'Disposed', 'Transfer']),
  movement_date: z.string().min(1, 'Date is required'),
  from_location: z.string().optional().nullable(),
  to_location: z.string().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const transferSchema = z.object({
  asset_id: z.string().uuid('Asset is required'),
  transfer_date: z.string().min(1, 'Date is required'),
  to_department_id: z.string().uuid('Target department is required'),
  to_employee_id: z.string().uuid().optional().nullable(),
  reason: z.string().min(1, 'Reason is required'),
  approved_by: z.string().min(1, 'Approver is required'),
  handover: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const licenseSchema = z.object({
  license_number: z.string().min(1, 'License number is required'),
  type: z.string().min(1, 'Type is required'),
  edition: z.string().optional().nullable(),
  product_key: z.string().optional().nullable(),
  asset_id: z.string().uuid().optional().nullable(),
  department_id: z.string().uuid().optional().nullable(),
  employee_id: z.string().uuid().optional().nullable(),
  vendor_id: z.string().uuid().optional().nullable(),
  purchase_date: z.string().optional().nullable(),
  expiry_date: z.string().optional().nullable(),
  status: z.enum(['Active', 'Expiring', 'Expired', 'Unassigned']).default('Active'),
  notes: z.string().optional().nullable(),
});

export const vendorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  contact_person: z.string().optional().nullable(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export const inventoryItemSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  brand: z.string().optional().nullable(),
  serial: z.string().optional().nullable(),
  product_key: z.string().optional().nullable(),
  condition: z.enum(['Working', 'Broken', 'Disposed']).default('Working'),
  assigned_to: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const telephoneSchema = z.object({
  extension: z.string().optional().nullable(),
  contact_number: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  serial: z.string().optional().nullable(),
  status: z.enum(['Working', 'Not Working', 'Spare']).default('Working'),
});

export const printerSchema = z.object({
  serial: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  product_number: z.string().optional().nullable(),
  assigned_to: z.string().optional().nullable(),
  status: z.enum(['Working', 'Not Working', 'Spare']).default('Working'),
});

export const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  head: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export type AssetFormValues = z.infer<typeof assetSchema>;
export type EmployeeFormValues = z.infer<typeof employeeSchema>;
export type MovementFormValues = z.infer<typeof movementSchema>;
export type TransferFormValues = z.infer<typeof transferSchema>;
export type LicenseFormValues = z.infer<typeof licenseSchema>;
export type VendorFormValues = z.infer<typeof vendorSchema>;
export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;
export type TelephoneFormValues = z.infer<typeof telephoneSchema>;
export type PrinterFormValues = z.infer<typeof printerSchema>;
export type DepartmentFormValues = z.infer<typeof departmentSchema>;
