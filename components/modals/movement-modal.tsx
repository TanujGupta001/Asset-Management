'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { movementSchema, type MovementFormValues } from '@/schemas';
import { createMovementAction } from '@/actions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { Asset, Department, MovementType } from '@/types';

interface MovementModalProps {
  open: boolean;
  onClose: () => void;
  assets: Asset[];
  departments: Department[];
  defaultAssetId?: string;
}

const MOVEMENT_TYPES: MovementType[] = ['Issued', 'Returned', 'Repair', 'Disposed', 'Transfer'];

export function MovementModal({ open, onClose, assets, departments, defaultAssetId }: MovementModalProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<MovementFormValues>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      asset_id: defaultAssetId || '',
      movement_type: 'Issued',
      movement_date: new Date().toISOString().split('T')[0],
    },
  });

  const onSubmit = async (data: MovementFormValues) => {
    setLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== null && value !== undefined) formData.append(key, String(value));
    });
    const result = await createMovementAction(formData);
    setLoading(false);

    if (result.error) {
      toast.error('Failed to log movement', { description: result.error });
    } else {
      toast.success('Movement logged', { description: `Asset status updated to ${data.movement_type}` });
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <DialogTitle>Log Asset Movement</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-4 flex-1 space-y-4">
          <div className="space-y-1.5">
            <Label>Asset *</Label>
            <Select
              onValueChange={(v) => form.setValue('asset_id', v)}
              defaultValue={defaultAssetId}
            >
              <SelectTrigger><SelectValue placeholder="Select asset" /></SelectTrigger>
              <SelectContent>
                {assets.map((a) => <SelectItem key={a.id} value={a.id}>{a.asset_tag} · {a.type}</SelectItem>)}
              </SelectContent>
            </Select>
            {form.formState.errors.asset_id && (
              <p className="text-xs text-destructive">{form.formState.errors.asset_id.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Movement Type *</Label>
              <Select onValueChange={(v) => form.setValue('movement_type', v as MovementType)} defaultValue="Issued">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MOVEMENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Date *</Label>
              <Input type="date" {...form.register('movement_date')} />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>From Location</Label>
              <Input {...form.register('from_location')} placeholder="e.g. IT Stockroom" />
            </div>
            <div className="space-y-1.5">
              <Label>To Location</Label>
              <Input {...form.register('to_location')} placeholder="e.g. John's Desk" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea {...form.register('notes')} placeholder="Additional notes..." rows={2} />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium mb-1">Status will be updated automatically:</p>
            <ul className="space-y-0.5">
              <li>Issued → Active</li>
              <li>Returned → Idle</li>
              <li>Repair → Repair</li>
              <li>Disposed → Disposed</li>
            </ul>
          </div>

          </div>

          <DialogFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Logging...' : 'Log Movement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
