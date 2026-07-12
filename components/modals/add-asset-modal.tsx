'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { assetSchema, type AssetFormValues } from '@/schemas';
import { createAssetAction } from '@/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import type { Department, Employee, Vendor, AssetType, AssetStatus } from '@/types';

interface AddAssetModalProps {
  open: boolean;
  onClose: () => void;
  departments: Department[];
  employees: Employee[];
  vendors: Vendor[];
}

const ASSET_TYPES: AssetType[] = ['Desktop', 'Laptop', 'Monitor', 'Server', 'Tablet', 'Other'];
const ASSET_STATUSES: AssetStatus[] = ['Active', 'WFH', 'Repair', 'Idle', 'Disposed'];

export function AddAssetModal({ open, onClose, departments, employees, vendors }: AddAssetModalProps) {
  const [loading, setLoading] = useState(false);
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyYears, setWarrantyYears] = useState('3');

  const form = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      asset_tag: '',
      type: 'Desktop',
      status: 'Active',
      warranty_years: 3,
    },
  });

  const calculateWarrantyExpiry = (pDate: string, years: string) => {
    if (!pDate || !years) return '';
    const d = new Date(pDate);
    d.setFullYear(d.getFullYear() + parseInt(years, 10));
    return d.toISOString().split('T')[0];
  };

  const onSubmit = async (data: AssetFormValues) => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });

    // Auto-calculate warranty expiry
    if (data.purchase_date && data.warranty_years) {
      const expiry = calculateWarrantyExpiry(data.purchase_date, String(data.warranty_years));
      formData.set('warranty_expiry', expiry);
    }

    // Auto-fill license purchase dates from asset purchase date
    if (data.purchase_date) {
      if (!data.windows_license_purchase_date) {
        formData.set('windows_license_purchase_date', data.purchase_date);
      }
      if (!data.ms_license_purchase_date) {
        formData.set('ms_license_purchase_date', data.purchase_date);
      }
    }

    const result = await createAssetAction(formData);
    setLoading(false);

    if (result.error) {
      toast.error('Failed to create asset', { description: result.error });
    } else {
      toast.success('Asset created', { description: `${data.asset_tag} has been added successfully` });
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Add New Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-4 flex-1">
            <div className="space-y-6">
              {/* Basic Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Asset Tag *</Label>
                    <Input {...form.register('asset_tag')} placeholder="AST-0001" />
                    {form.formState.errors.asset_tag && (
                      <p className="text-xs text-destructive">{form.formState.errors.asset_tag.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Type *</Label>
                    <Select onValueChange={(v) => form.setValue('type', v as AssetType)} defaultValue="Desktop">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ASSET_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
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
                </div>
              </div>

              <Separator />

              {/* Serial Numbers Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Serial Numbers & Brands</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>CPU Brand</Label>
                    <Input {...form.register('cpu_brand')} placeholder="Dell OptiPlex 7090" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>CPU Serial</Label>
                    <Input {...form.register('cpu_serial')} placeholder="Serial number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monitor Brand</Label>
                    <Input {...form.register('monitor_brand')} placeholder="Dell P2419H" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Monitor Serial</Label>
                    <Input {...form.register('monitor_serial')} placeholder="Serial number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Keyboard Brand</Label>
                    <Input {...form.register('keyboard_brand')} placeholder="Dell KM5221W" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Keyboard Serial</Label>
                    <Input {...form.register('keyboard_serial')} placeholder="Serial number" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mouse Brand</Label>
                    <Input {...form.register('mouse_brand')} placeholder="Dell MS116" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mouse Serial</Label>
                    <Input {...form.register('mouse_serial')} placeholder="Serial number" />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Purchase Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Purchase & Warranty</h3>
                <div className="grid grid-cols-2 gap-4">
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
                    <Label>Invoice Number</Label>
                    <Input {...form.register('invoice_number')} placeholder="INV-2024-001" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Purchase Date</Label>
                    <Input
                      type="date"
                      {...form.register('purchase_date')}
                      onChange={(e) => {
                        setPurchaseDate(e.target.value);
                        form.setValue('purchase_date', e.target.value);
                        const expiry = calculateWarrantyExpiry(e.target.value, warrantyYears);
                        form.setValue('warranty_expiry', expiry);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Warranty Years</Label>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      defaultValue="3"
                      {...form.register('warranty_years')}
                      onChange={(e) => {
                        setWarrantyYears(e.target.value);
                        form.setValue('warranty_years', parseInt(e.target.value, 10) || 0);
                        const expiry = calculateWarrantyExpiry(purchaseDate, e.target.value);
                        form.setValue('warranty_expiry', expiry);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5 col-span-2">
                    <Label>Warranty Expiry (auto-calculated)</Label>
                    <Input
                      type="date"
                      {...form.register('warranty_expiry')}
                      readOnly
                      className="bg-muted/50"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Software Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Software & Licenses</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Windows License</Label>
                    <Input {...form.register('windows_license')} placeholder="WPRO-11-XXXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>MS Office License</Label>
                    <Input {...form.register('ms_license')} placeholder="OFC2023-XXXXX" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Antivirus</Label>
                    <Input {...form.register('antivirus')} placeholder="Quick Heal Total Security" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select onValueChange={(v) => form.setValue('status', v as AssetStatus)} defaultValue="Active">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ASSET_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notes */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-primary">Notes</h3>
                <Textarea {...form.register('notes')} placeholder="Additional notes about this asset..." rows={3} />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Asset'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
