/*
# Enterprise IT Asset Management - Full Schema

## Overview
Creates the complete normalized schema for an Enterprise IT Asset Management system:
employees, departments, assets, movements, transfers, software licenses,
inventory items, telephones, printers, vendors, audit logs, and admin user.

## Tables
1. departments - Company departments
2. employees - Staff records
3. vendors - Suppliers
4. assets - IT assets (tag, type, brands, serials, vendor, warranty, licenses, status)
5. movements - In/out log
6. transfers - Transfer log
7. software_licenses - License register
8. inventory_items - Extra inventory
9. telephones - Telephone register
10. printers - Printer register
11. audit_logs - Audit trail
12. admin_users - Single hardcoded admin account

Every table includes id (uuid), created_at, updated_at.
RLS enabled on all tables with anon+authenticated CRUD.
*/

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  head text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Employees
CREATE TABLE IF NOT EXISTS employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  role text,
  phone text,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Inactive','On Leave')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Vendors
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  contact_person text,
  email text,
  phone text,
  address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Assets
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('Desktop','Laptop','Monitor','Server','Tablet','Other')),
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  cpu_brand text,
  monitor_brand text,
  keyboard_brand text,
  mouse_brand text,
  cpu_serial text,
  monitor_serial text,
  keyboard_serial text,
  mouse_serial text,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  invoice_number text,
  purchase_date date,
  warranty_years integer DEFAULT 0,
  warranty_expiry date,
  windows_license text,
  ms_license text,
  windows_license_purchase_date date,
  ms_license_purchase_date date,
  antivirus text,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','WFH','Repair','Idle','Disposed')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_department_id ON assets(department_id);
CREATE INDEX IF NOT EXISTS idx_assets_employee_id ON assets(employee_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);

-- Movements (In/Out Log)
CREATE TABLE IF NOT EXISTS movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  movement_type text NOT NULL CHECK (movement_type IN ('Issued','Returned','Repair','Disposed','Transfer')),
  movement_date timestamptz NOT NULL DEFAULT now(),
  from_location text,
  to_location text,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movements_asset_id ON movements(asset_id);
CREATE INDEX IF NOT EXISTS idx_movements_movement_date ON movements(movement_date);

-- Transfers
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  transfer_date timestamptz NOT NULL DEFAULT now(),
  from_department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  to_department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  from_employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  to_employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  reason text,
  approved_by text,
  handover text,
  notes text,
  status text NOT NULL DEFAULT 'Completed' CHECK (status IN ('Pending','Completed','Rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfers_asset_id ON transfers(asset_id);
CREATE INDEX IF NOT EXISTS idx_transfers_transfer_date ON transfers(transfer_date);

-- Software Licenses
CREATE TABLE IF NOT EXISTS software_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  license_number text NOT NULL UNIQUE,
  type text NOT NULL,
  edition text,
  product_key text UNIQUE,
  asset_id uuid REFERENCES assets(id) ON DELETE SET NULL,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  purchase_date date,
  expiry_date date,
  status text NOT NULL DEFAULT 'Active' CHECK (status IN ('Active','Expiring','Expired','Unassigned')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_software_licenses_status ON software_licenses(status);
CREATE INDEX IF NOT EXISTS idx_software_licenses_asset_id ON software_licenses(asset_id);

-- Inventory Items (Extra Inventory)
CREATE TABLE IF NOT EXISTS inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  brand text,
  serial text,
  product_key text,
  condition text NOT NULL DEFAULT 'Working' CHECK (condition IN ('Working','Broken','Disposed')),
  assigned_to text,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_inventory_items_type ON inventory_items(type);
CREATE INDEX IF NOT EXISTS idx_inventory_items_condition ON inventory_items(condition);

-- Telephones
CREATE TABLE IF NOT EXISTS telephones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  extension text,
  contact_number text,
  assigned_to text,
  organization text,
  serial text,
  status text NOT NULL DEFAULT 'Working' CHECK (status IN ('Working','Not Working','Spare')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Printers
CREATE TABLE IF NOT EXISTS printers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  serial text,
  brand text,
  model text,
  product_number text,
  assigned_to text,
  status text NOT NULL DEFAULT 'Working' CHECK (status IN ('Working','Not Working','Spare')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity text NOT NULL,
  entity_id uuid,
  performed_by text,
  details text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Admin Users (single hardcoded admin)
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE software_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE telephones ENABLE ROW LEVEL SECURITY;
ALTER TABLE printers ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policies: anon+authenticated CRUD (single admin app, shared data)
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['departments','employees','vendors','assets','movements','transfers','software_licenses','inventory_items','telephones','printers','audit_logs','admin_users'])
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "anon_select_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "anon_select_%s" ON %I FOR SELECT TO anon, authenticated USING (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_insert_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "anon_insert_%s" ON %I FOR INSERT TO anon, authenticated WITH CHECK (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_update_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "anon_update_%s" ON %I FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true)', t, t);
    EXECUTE format('DROP POLICY IF EXISTS "anon_delete_%s" ON %I', t, t);
    EXECUTE format('CREATE POLICY "anon_delete_%s" ON %I FOR DELETE TO anon, authenticated USING (true)', t, t);
  END LOOP;
END $$;

-- updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

-- Apply triggers
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY['departments','employees','vendors','assets','movements','transfers','software_licenses','inventory_items','telephones','printers','admin_users'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_updated ON %I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t, t);
  END LOOP;
END $$;
