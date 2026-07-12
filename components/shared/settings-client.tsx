'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2,
  Truck,
  ScrollText,
  User,
  Plus,
  Trash2,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import type { Department, Vendor, Employee, AuditLog } from '@/types';
import { departmentSchema, vendorSchema, type DepartmentFormValues, type VendorFormValues } from '@/schemas';
import {
  createDepartmentAction,
  deleteDepartmentAction,
  createVendorAction,
  deleteVendorAction,
} from '@/actions';

interface SettingsClientProps {
  departments: Department[];
  vendors: Vendor[];
  employees: Employee[];
  auditLogs: AuditLog[];
}

export function SettingsClient({
  departments,
  vendors,
  employees,
  auditLogs,
}: SettingsClientProps) {
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [deleteDepartmentId, setDeleteDepartmentId] = useState<string | null>(null);
  const [deleteVendorId, setDeleteVendorId] = useState<string | null>(null);

  const handleDeleteDepartment = async () => {
    if (!deleteDepartmentId) return;
    const result = await deleteDepartmentAction(deleteDepartmentId);
    if (result.error) {
      toast.error('Delete failed', { description: result.error });
    } else {
      toast.success('Department deleted');
    }
    setDeleteDepartmentId(null);
  };

  const handleDeleteVendor = async () => {
    if (!deleteVendorId) return;
    const result = await deleteVendorAction(deleteVendorId);
    if (result.error) {
      toast.error('Delete failed', { description: result.error });
    } else {
      toast.success('Vendor deleted');
    }
    setDeleteVendorId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage departments, vendors, audit logs, and profile settings
        </p>
      </div>

      <Tabs defaultValue="departments" className="w-full">
        <TabsList>
          <TabsTrigger value="departments">
            <Building2 className="w-4 h-4 mr-2" /> Departments
          </TabsTrigger>
          <TabsTrigger value="vendors">
            <Truck className="w-4 h-4 mr-2" /> Vendors
          </TabsTrigger>
          <TabsTrigger value="audit">
            <ScrollText className="w-4 h-4 mr-2" /> Audit Log
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" /> Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Departments</h2>
              <p className="text-sm text-muted-foreground">{departments.length} departments registered</p>
            </div>
            <Button onClick={() => setShowAddDepartment(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Department
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground bg-muted/50">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Head</th>
                      <th className="px-4 py-3 font-medium">Employees</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {departments.map((dept) => {
                      const deptEmployees = employees.filter((e) => e.department_id === dept.id);
                      return (
                        <tr key={dept.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{dept.name}</td>
                          <td className="px-4 py-3">{dept.head || '—'}</td>
                          <td className="px-4 py-3">{deptEmployees.length}</td>
                          <td className="px-4 py-3 text-muted-foreground">{dept.description || '—'}</td>
                          <td className="px-4 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteDepartmentId(dept.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                    {departments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          No departments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Vendors</h2>
              <p className="text-sm text-muted-foreground">{vendors.length} vendors registered</p>
            </div>
            <Button onClick={() => setShowAddVendor(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Vendor
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground bg-muted/50">
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Contact Person</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">Phone</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor) => (
                      <tr key={vendor.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{vendor.name}</td>
                        <td className="px-4 py-3">{vendor.contact_person || '—'}</td>
                        <td className="px-4 py-3">{vendor.email || '—'}</td>
                        <td className="px-4 py-3">{vendor.phone || '—'}</td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteVendorId(vendor.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {vendors.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          No vendors found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Audit Log</h2>
            <p className="text-sm text-muted-foreground">Recent {auditLogs.length} system activities</p>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground bg-muted/50">
                      <th className="px-4 py-3 font-medium">Action</th>
                      <th className="px-4 py-3 font-medium">Entity</th>
                      <th className="px-4 py-3 font-medium">Performed By</th>
                      <th className="px-4 py-3 font-medium">Details</th>
                      <th className="px-4 py-3 font-medium">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium">{log.action}</span>
                        </td>
                        <td className="px-4 py-3">{log.entity}</td>
                        <td className="px-4 py-3">{log.performed_by || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{log.details || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                          {format(parseISO(log.created_at), 'MMM dd, yyyy HH:mm')}
                        </td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          No audit logs found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" /> Admin Profile
              </CardTitle>
              <CardDescription>System administrator account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-full bg-primary/10 text-primary">
                  <User className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">admin</h3>
                  <p className="text-sm text-muted-foreground">Administrator</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Username</Label>
                  <p className="text-sm font-medium">admin</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Role</Label>
                  <p className="text-sm font-medium">Administrator</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Total Departments</Label>
                  <p className="text-sm font-medium">{departments.length}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Total Vendors</Label>
                  <p className="text-sm font-medium">{vendors.length}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Total Employees</Label>
                  <p className="text-sm font-medium">{employees.length}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-muted-foreground">Audit Log Entries</Label>
                  <p className="text-sm font-medium">{auditLogs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AddDepartmentDialog open={showAddDepartment} onClose={() => setShowAddDepartment(false)} />
      <AddVendorDialog open={showAddVendor} onClose={() => setShowAddVendor(false)} />

      <AlertDialog open={!!deleteDepartmentId} onOpenChange={(v) => !v && setDeleteDepartmentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Department?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The department will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDepartment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteVendorId} onOpenChange={(v) => !v && setDeleteVendorId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The vendor will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVendor}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddDepartmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: { name: '', head: '', description: '' },
  });

  const onSubmit = async (data: DepartmentFormValues) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('head', data.head || '');
    formData.append('description', data.description || '');
    const result = await createDepartmentAction(formData);
    setLoading(false);
    if (result.error) {
      toast.error('Failed to add department', { description: result.error });
    } else {
      toast.success('Department added');
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>Create a new department record.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dept-name">Name</Label>
            <Input id="dept-name" {...register('name')} placeholder="Department name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-head">Head</Label>
            <Input id="dept-head" {...register('head')} placeholder="Department head" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dept-description">Description</Label>
            <Textarea id="dept-description" {...register('description')} placeholder="Brief description" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddVendorDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorSchema),
    defaultValues: { name: '', contact_person: '', email: '', phone: '', address: '' },
  });

  const onSubmit = async (data: VendorFormValues) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('contact_person', data.contact_person || '');
    formData.append('email', data.email || '');
    formData.append('phone', data.phone || '');
    formData.append('address', data.address || '');
    const result = await createVendorAction(formData);
    setLoading(false);
    if (result.error) {
      toast.error('Failed to add vendor', { description: result.error });
    } else {
      toast.success('Vendor added');
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Vendor</DialogTitle>
          <DialogDescription>Create a new vendor record.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-name">Name</Label>
            <Input id="vendor-name" {...register('name')} placeholder="Vendor name" />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-contact">Contact Person</Label>
            <Input id="vendor-contact" {...register('contact_person')} placeholder="Contact person" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-email">Email</Label>
            <Input id="vendor-email" type="email" {...register('email')} placeholder="contact@vendor.com" />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-phone">Phone</Label>
            <Input id="vendor-phone" {...register('phone')} placeholder="Phone number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vendor-address">Address</Label>
            <Textarea id="vendor-address" {...register('address')} placeholder="Vendor address" />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Vendor'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
