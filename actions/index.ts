'use server';

import { supabase } from '@/lib/supabase';
import { createAuditLog } from '@/lib/services';
import {
  assetSchema,
  employeeSchema,
  movementSchema,
  transferSchema,
  licenseSchema,
  vendorSchema,
  inventoryItemSchema,
  telephoneSchema,
  printerSchema,
  departmentSchema,
} from '@/schemas';
import { revalidatePath } from 'next/cache';

const STATUS_FROM_MOVEMENT: Record<string, string> = {
  Issued: 'Active',
  Returned: 'Idle',
  Repair: 'Repair',
  Disposed: 'Disposed',
  Transfer: 'Active',
};

// ============ Assets ============
export async function createAssetAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = assetSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data: existing } = await supabase
    .from('assets')
    .select('asset_tag')
    .eq('asset_tag', parsed.data.asset_tag)
    .maybeSingle();

  if (existing) {
    return { error: 'Asset tag already exists' };
  }

  const { data, error } = await supabase.from('assets').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'CREATE',
    entity: 'Asset',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Created asset ${parsed.data.asset_tag}`,
  });

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true, id: data.id };
}

export async function updateAssetAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = assetSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { error } = await supabase.from('assets').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'UPDATE',
    entity: 'Asset',
    entity_id: id,
    performed_by: 'admin',
    details: `Updated asset ${parsed.data.asset_tag}`,
  });

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteAssetAction(id: string) {
  const { error } = await supabase.from('assets').delete().eq('id', id);
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'DELETE',
    entity: 'Asset',
    entity_id: id,
    performed_by: 'admin',
    details: `Deleted asset ${id}`,
  });

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function bulkDeleteAssetsAction(ids: string[]) {
  const { error } = await supabase.from('assets').delete().in('id', ids);
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'BULK_DELETE',
    entity: 'Asset',
    performed_by: 'admin',
    details: `Bulk deleted ${ids.length} assets`,
  });

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============ Employees ============
export async function createEmployeeAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = employeeSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data, error } = await supabase.from('employees').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  // Assign asset if provided
  const assetId = formData.get('assign_asset_id') as string;
  if (assetId) {
    await supabase
      .from('assets')
      .update({ employee_id: data.id, department_id: parsed.data.department_id, status: 'Active' })
      .eq('id', assetId);

    await supabase.from('movements').insert({
      asset_id: assetId,
      movement_type: 'Issued',
      movement_date: new Date().toISOString(),
      from_location: 'IT Stockroom',
      to_location: data.name,
      department_id: parsed.data.department_id,
      notes: `Assigned during onboarding of ${data.name}`,
    });
  }

  // Assign peripherals if provided
  const peripheralIds = formData.getAll('assign_peripheral_ids') as string[];
  for (const pid of peripheralIds) {
    await supabase
      .from('inventory_items')
      .update({ assigned_to: data.name, condition: 'Working' })
      .eq('id', pid);
  }

  // Assign phone if provided
  const phoneId = formData.get('assign_phone_id') as string;
  if (phoneId) {
    await supabase
      .from('telephones')
      .update({ assigned_to: data.name, status: 'Working' })
      .eq('id', phoneId);
  }

  await createAuditLog({
    action: 'CREATE',
    entity: 'Employee',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Onboarded employee ${data.name}`,
  });

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true, id: data.id, assignedAsset: !!assetId };
}

export async function deleteEmployeeAction(id: string) {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'DELETE',
    entity: 'Employee',
    entity_id: id,
    performed_by: 'admin',
    details: `Deleted employee ${id}`,
  });

  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============ Movements ============
export async function createMovementAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = movementSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data, error } = await supabase.from('movements').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  // Update asset status based on movement type
  const newStatus = STATUS_FROM_MOVEMENT[parsed.data.movement_type];
  if (newStatus) {
    await supabase.from('assets').update({ status: newStatus }).eq('id', parsed.data.asset_id);
  }

  await createAuditLog({
    action: 'CREATE',
    entity: 'Movement',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Logged ${parsed.data.movement_type} movement for asset`,
  });

  revalidatePath('/tracking/in-out');
  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============ Transfers ============
export async function createTransferAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = transferSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  // Get current asset data
  const { data: asset } = await supabase
    .from('assets')
    .select('*, department:departments(*)')
    .eq('id', parsed.data.asset_id)
    .maybeSingle();

  if (!asset) return { error: 'Asset not found' };

  const { data: transfer, error } = await supabase
    .from('transfers')
    .insert({
      asset_id: parsed.data.asset_id,
      transfer_date: parsed.data.transfer_date,
      from_department_id: asset.department_id,
      to_department_id: parsed.data.to_department_id,
      from_employee_id: asset.employee_id,
      to_employee_id: parsed.data.to_employee_id || null,
      reason: parsed.data.reason,
      approved_by: parsed.data.approved_by,
      handover: parsed.data.handover,
      notes: parsed.data.notes,
      status: 'Completed',
    })
    .select()
    .single();

  if (error) return { error: error.message };

  // Update asset department and employee
  await supabase
    .from('assets')
    .update({
      department_id: parsed.data.to_department_id,
      employee_id: parsed.data.to_employee_id || null,
    })
    .eq('id', parsed.data.asset_id);

  // Create movement log
  await supabase.from('movements').insert({
    asset_id: parsed.data.asset_id,
    movement_type: 'Transfer',
    movement_date: parsed.data.transfer_date,
    from_location: asset.department?.name || 'Unknown',
    to_location: 'New Department',
    department_id: parsed.data.to_department_id,
    notes: `Transferred: ${parsed.data.reason}`,
  });

  await createAuditLog({
    action: 'CREATE',
    entity: 'Transfer',
    entity_id: transfer.id,
    performed_by: 'admin',
    details: `Transferred asset to new department`,
  });

  revalidatePath('/tracking/transfers');
  revalidatePath('/tracking/in-out');
  revalidatePath('/assets');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============ Software Licenses ============
export async function createLicenseAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = licenseSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data, error } = await supabase.from('software_licenses').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'CREATE',
    entity: 'License',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Created license ${parsed.data.license_number}`,
  });

  revalidatePath('/licenses');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function updateLicenseAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = licenseSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { error } = await supabase.from('software_licenses').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'UPDATE',
    entity: 'License',
    entity_id: id,
    performed_by: 'admin',
    details: `Updated license ${parsed.data.license_number}`,
  });

  revalidatePath('/licenses');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function deleteLicenseAction(id: string) {
  const { error } = await supabase.from('software_licenses').delete().eq('id', id);
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'DELETE',
    entity: 'License',
    entity_id: id,
    performed_by: 'admin',
    details: `Deleted license ${id}`,
  });

  revalidatePath('/licenses');
  revalidatePath('/dashboard');
  return { success: true };
}

// ============ Vendors ============
export async function createVendorAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = vendorSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data, error } = await supabase.from('vendors').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'CREATE',
    entity: 'Vendor',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Created vendor ${parsed.data.name}`,
  });

  revalidatePath('/settings');
  return { success: true };
}

export async function deleteVendorAction(id: string) {
  const { error } = await supabase.from('vendors').delete().eq('id', id);
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'DELETE',
    entity: 'Vendor',
    entity_id: id,
    performed_by: 'admin',
    details: `Deleted vendor ${id}`,
  });

  revalidatePath('/settings');
  return { success: true };
}

// ============ Inventory ============
export async function createInventoryItemAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inventoryItemSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data, error } = await supabase.from('inventory_items').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'CREATE',
    entity: 'Inventory',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Created inventory item ${parsed.data.type}`,
  });

  revalidatePath('/inventory');
  return { success: true };
}

export async function updateInventoryItemAction(id: string, formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = inventoryItemSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { error } = await supabase.from('inventory_items').update(parsed.data).eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/inventory');
  return { success: true };
}

export async function deleteInventoryItemAction(id: string) {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/inventory');
  return { success: true };
}

// ============ Telephones ============
export async function createTelephoneAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = telephoneSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data, error } = await supabase.from('telephones').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'CREATE',
    entity: 'Telephone',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Created telephone entry`,
  });

  revalidatePath('/telephones-printers');
  return { success: true };
}

export async function deleteTelephoneAction(id: string) {
  const { error } = await supabase.from('telephones').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/telephones-printers');
  return { success: true };
}

// ============ Printers ============
export async function createPrinterAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = printerSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data, error } = await supabase.from('printers').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'CREATE',
    entity: 'Printer',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Created printer entry`,
  });

  revalidatePath('/telephones-printers');
  return { success: true };
}

export async function deletePrinterAction(id: string) {
  const { error } = await supabase.from('printers').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/telephones-printers');
  return { success: true };
}

// ============ Departments ============
export async function createDepartmentAction(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  const parsed = departmentSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid data' };
  }

  const { data, error } = await supabase.from('departments').insert(parsed.data).select().single();
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'CREATE',
    entity: 'Department',
    entity_id: data.id,
    performed_by: 'admin',
    details: `Created department ${parsed.data.name}`,
  });

  revalidatePath('/settings');
  revalidatePath('/assets');
  return { success: true };
}

export async function deleteDepartmentAction(id: string) {
  const { error } = await supabase.from('departments').delete().eq('id', id);
  if (error) return { error: error.message };

  await createAuditLog({
    action: 'DELETE',
    entity: 'Department',
    entity_id: id,
    performed_by: 'admin',
    details: `Deleted department ${id}`,
  });

  revalidatePath('/settings');
  revalidatePath('/assets');
  return { success: true };
}
