'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferSchema, type TransferFormValues } from '@/schemas';
import { createTransferAction } from '@/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Asset, Department, Employee } from '@/types';

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  departments: Department[];
  employees: Employee[];
  defaultAssetId?: string;
}

export function TransferModal({ open, onClose, assets, departments, employees, defaultAssetId }: TransferModalProps) {
  const [loading, setLoading] = useState(false);
  const [toDeptId, setToDeptId] = useState('');

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      asset_id: defaultAssetId || '',
      transfer_date: new Date().toISOString().split('T')[0],
    },
  });

  const filteredEmployees = employees.filter((e) => !toDeptId || e.department_id === toDeptId);

  const onSubmit = async (data: TransferFormValues) => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, String(value));
    });
    const result = await createTransferAction(formData);
    setLoading(false);

    if (result.error) {
      toast.error('Failed to create transfer', { description: result.error });
    } else {
      toast.success('Transfer completed', { description: 'Asset, department, and movement log updated automatically' });
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Transfer Asset</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
          <div className="space-y-1.5">
            <Label>Asset *</Label>
            <Select onValueChange={(v) => form.setValue('asset_id', v)} defaultValue={defaultAssetId}>
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>
                {assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.asset_tag} · {a.type}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.formState.errors.asset_id && (
              <p className="text-xs text-destructive">{form.formState.errors.asset_id.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Transfer Date *</Label>
            <Input type="date" {...form.register('transfer_date')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>To Department *</Label>
              <Select
                onValueChange={(v) => {
                  form.setValue('to_department_id', v);
                  setToDeptId(v);
                }}
              >
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {form.formState.errors.to_department_id && (
                <p className="text-xs text-destructive">{form.formState.errors.to_department_id.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>To Employee</Label>
              <Select onValueChange={(v) => form.setValue('to_employee_id', v)}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {filteredEmployees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Reason *</Label>
            <Input {...form.register('reason')} placeholder="e.g. Department restructuring" />
            {form.formState.errors.reason && (
              <p className="text-xs text-destructive">{form.formState.errors.reason.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Approved By *</Label>
              <Input {...form.register('approved_by')} placeholder="e.g. Rajesh Kumar" />
              {form.formState.errors.approved_by && (
                <p className="text-xs text-destructive">{form.formState.errors.approved_by.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Handover</Label>
              <Input {...form.register('handover')} placeholder="e.g. John Abraham" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea {...form.register('notes')} placeholder="Additional notes..." rows={2} />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            This will automatically update the asset's department, employee, create a movement log, and record the transfer.
          </div>

          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Transferring...' : 'Complete Transfer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
