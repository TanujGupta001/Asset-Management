'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { licenseSchema, type LicenseFormValues } from '@/schemas';
import { createLicenseAction } from '@/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Asset, Department, Employee, Vendor, LicenseStatus } from '@/types';

interface AddLicenseModalProps {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  departments: Department[];
  employees: Employee[];
  vendors: Vendor[];
}

const LICENSE_STATUSES: LicenseStatus[] = ['Active', 'Expiring', 'Expired', 'Unassigned'];

export function AddLicenseModal({ open, onClose, assets, departments, employees, vendors }: AddLicenseModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<LicenseFormValues>({
    resolver: zodResolver(licenseSchema),
    defaultValues: { license_number: '', type: '', status: 'Active' },
  });

  const onSubmit = async (data: LicenseFormValues) => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, String(value));
    });
    const result = await createLicenseAction(formData);
    setLoading(false);

    if (result.error) {
      toast.error('Failed to create license', { description: result.error });
    } else {
      toast.success('License created', { description: `${data.license_number} has been added` });
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Add Software License</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>License Number *</Label>
              <Input {...form.register('license_number')} placeholder="LIC-001" />
              {form.formState.errors.license_number && (
                <p className="text-xs text-destructive">{form.formState.errors.license_number.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Type *</Label>
              <Input {...form.register('type')} placeholder="Windows 11 Pro" />
              {form.formState.errors.type && (
                <p className="text-xs text-destructive">{form.formState.errors.type.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Edition</Label>
              <Input {...form.register('edition')} placeholder="Professional" />
            </div>
            <div className="space-y-1.5">
              <Label>Product Key</Label>
              <Input {...form.register('product_key')} placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX" />
            </div>
            <div className="space-y-1.5">
              <Label>Linked Asset</Label>
              <Select onValueChange={(v) => form.setValue('asset_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
                <SelectContent>
                  {assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.asset_tag}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select onValueChange={(v) => form.setValue('department_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Assigned To</Label>
              <Select onValueChange={(v) => form.setValue('employee_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Vendor</Label>
              <Select onValueChange={(v) => form.setValue('vendor_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendors.map((v) => <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Purchase Date</Label>
              <Input type="date" {...form.register('purchase_date')} />
            </div>
            <div className="space-y-1.5">
              <Label>Expiry Date</Label>
              <Input type="date" {...form.register('expiry_date')} />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select onValueChange={(v) => form.setValue('status', v as LicenseStatus)} defaultValue="Active">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LICENSE_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea {...form.register('notes')} placeholder="Additional notes..." rows={2} />
          </div>

          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create License'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
