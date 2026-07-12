'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, type EmployeeFormValues } from '@/schemas';
import { createEmployeeAction } from '@/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import type { Department, Employee, Asset, InventoryItem, Telephone } from '@/types';

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  departments: Department[];
}

export function AddEmployeeModal({ open, onClose, departments }: AddEmployeeModalProps) {
  const [loading, setLoading] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [availableInventory, setAvailableInventory] = useState<InventoryItem[]>([]);
  const [availablePhones, setAvailablePhones] = useState<Telephone[]>([]);
  const [selectedDept, setSelectedDept] = useState('');

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', status: 'Active' },
  });

  useEffect(() => {
    if (open) {
      supabase
        .from('assets')
        .select('*, department:departments(*)')
        .in('status', ['Idle', 'Active'])
        .is('employee_id', null)
        .order('asset_tag')
        .then(({ data }) => setAvailableAssets(data || []));

      supabase
        .from('inventory_items')
        .select('*')
        .eq('condition', 'Working')
        .order('type')
        .then(({ data }) => setAvailableInventory(data || []));

      supabase
        .from('telephones')
        .select('*')
        .eq('status', 'Spare')
        .order('extension')
        .then(({ data }) => setAvailablePhones(data || []));
    }
  }, [open]);

  const onSubmit = async (data: EmployeeFormValues) => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, String(value));
    });

    const result = await createEmployeeAction(formData);
    setLoading(false);

    if (result.error) {
      toast.error('Failed to onboard employee', { description: result.error });
    } else {
      const parts = ['Employee onboarded successfully'];
      if (result.assignedAsset) parts.push('Asset assigned');
      toast.success('Employee Onboarded', { description: parts.join(' · ') });
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Onboard New Employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-4 flex-1">
            <div className="space-y-6">
              {/* Employee Information */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Employee Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name *</Label>
                    <Input {...form.register('name')} placeholder="John Abraham" />
                    {form.formState.errors.name && (
                      <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Email</Label>
                    <Input {...form.register('email')} placeholder="john@company.com" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Department</Label>
                    <Select
                      onValueChange={(v) => {
                        form.setValue('department_id', v);
                        setSelectedDept(v);
                      }}
                    >
                      <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      <SelectContent>
                        {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Role</Label>
                    <Input {...form.register('role')} placeholder="IT Manager" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Phone</Label>
                    <Input {...form.register('phone')} placeholder="9988776655" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select onValueChange={(v) => form.setValue('status', v as any)} defaultValue="Active">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="On Leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Assign Computer */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Assign Computer</h3>
                <Select name="assign_asset_id">
                  <SelectTrigger><SelectValue placeholder="Select available computer (optional)" /></SelectTrigger>
                  <SelectContent>
                    {availableAssets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.asset_tag} · {a.type} {a.cpu_brand ? `· ${a.cpu_brand}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {availableAssets.length} available assets in stock
                </p>
              </div>

              <Separator />

              {/* Assign Peripherals */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Assign Peripherals</h3>
                <Select name="assign_peripheral_ids">
                  <SelectTrigger><SelectValue placeholder="Select peripherals (optional)" /></SelectTrigger>
                  <SelectContent>
                    {availableInventory.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.type} · {i.brand || 'N/A'} {i.serial ? `(${i.serial})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {availableInventory.length} available peripherals
                </p>
              </div>

              <Separator />

              {/* Assign Phone */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Assign Phone</h3>
                <Select name="assign_phone_id">
                  <SelectTrigger><SelectValue placeholder="Select available phone (optional)" /></SelectTrigger>
                  <SelectContent>
                    {availablePhones.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        Ext {t.extension} · {t.serial || 'N/A'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {availablePhones.length} available phones
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Onboarding...' : 'Onboard Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
