'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle, FileUp } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { loadXLSX } from '@/lib/xlsx';

interface ImportSummary {
  assetsAdded: number;
  assetsUpdated: number;
  licensesImported: number;
  movementsAdded: number;
  transfersAdded: number;
  inventoryImported: number;
  telephonesImported: number;
  printersImported: number;
  errors: string[];
}

const emptySummary: ImportSummary = {
  assetsAdded: 0,
  assetsUpdated: 0,
  licensesImported: 0,
  movementsAdded: 0,
  transfersAdded: 0,
  inventoryImported: 0,
  telephonesImported: 0,
  printersImported: 0,
  errors: [],
};

export function ImportExportClient() {
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    toast.info('Generating export...', { description: 'Building workbook with all sheets' });

    const XLSX = await loadXLSX();
    const { supabase } = await import('@/lib/supabase');

    const [assets, departments, movements, transfers, licenses, inventory, telephones, printers] = await Promise.all([
      supabase.from('assets').select('*, department:departments(name), employee:employees(name), vendor:vendors(name)').order('asset_tag').then(({ data }) => data || []),
      supabase.from('assets').select('*, department:departments(name)').order('status').then(({ data }) => data || []),
      supabase.from('departments').select('*').then(({ data }) => data || []),
      supabase.from('movements').select('*, asset:assets(asset_tag), department:departments(name)').order('movement_date', { ascending: false }).then(({ data }) => data || []),
      supabase.from('transfers').select('*, asset:assets(asset_tag), from_department:departments!from_department_id(name), to_department:departments!to_department_id(name)').order('transfer_date', { ascending: false }).then(({ data }) => data || []),
      supabase.from('software_licenses').select('*, asset:assets(asset_tag), department:departments(name), employee:employees(name), vendor:vendors(name)').order('license_number').then(({ data }) => data || []),
      supabase.from('inventory_items').select('*').order('type').then(({ data }) => data || []),
      supabase.from('telephones').select('*').order('organization').then(({ data }) => data || []),
      supabase.from('printers').select('*').order('brand').then(({ data }) => data || []),
    ]);

    const wb = XLSX.utils.book_new();

    const assetData = assets.map((a: any) => ({
      'Asset Tag': a.asset_tag, 'Type': a.type, 'Department': a.department?.name || '',
      'Employee': a.employee?.name || '', 'CPU Brand': a.cpu_brand || '', 'Monitor Brand': a.monitor_brand || '',
      'Keyboard Brand': a.keyboard_brand || '', 'Mouse Brand': a.mouse_brand || '',
      'CPU Serial': a.cpu_serial || '', 'Monitor Serial': a.monitor_serial || '',
      'Keyboard Serial': a.keyboard_serial || '', 'Mouse Serial': a.mouse_serial || '',
      'Vendor': a.vendor?.name || '', 'Invoice': a.invoice_number || '', 'Purchase Date': a.purchase_date || '',
      'Warranty Years': a.warranty_years, 'Warranty Expiry': a.warranty_expiry || '',
      'Windows License': a.windows_license || '', 'MS License': a.ms_license || '',
      'Antivirus': a.antivirus || '', 'Status': a.status, 'Notes': a.notes || '',
    }));

    const statusData = (['Active', 'WFH', 'Repair', 'Idle', 'Disposed'] as const).map((s) => ({
      'Status': s, 'Count': assets.filter((a: any) => a.status === s).length,
    }));

    const deptData = departments.map((d: any) => ({
      'Department': d.name, 'Head': d.head || '', 'Description': d.description || '',
    }));

    const movementData = movements.map((m: any) => ({
      'Date': m.movement_date, 'Asset': m.asset?.asset_tag || '', 'Type': m.movement_type,
      'Department': m.department?.name || '', 'From': m.from_location || '', 'To': m.to_location || '',
      'Notes': m.notes || '',
    }));

    const transferData = transfers.map((t: any) => ({
      'Date': t.transfer_date, 'Asset': t.asset?.asset_tag || '',
      'From Dept': t.from_department?.name || '', 'To Dept': t.to_department?.name || '',
      'Reason': t.reason || '', 'Approved By': t.approved_by || '', 'Handover': t.handover || '',
      'Status': t.status, 'Notes': t.notes || '',
    }));

    const licenseData = licenses.map((l: any) => ({
      'License Number': l.license_number, 'Type': l.type, 'Edition': l.edition || '',
      'Product Key': l.product_key || '', 'Linked Asset': l.asset?.asset_tag || '',
      'Department': l.department?.name || '', 'Assigned To': l.employee?.name || '',
      'Vendor': l.vendor?.name || '', 'Purchase Date': l.purchase_date || '',
      'Expiry Date': l.expiry_date || '', 'Status': l.status, 'Notes': l.notes || '',
    }));

    const inventoryData = inventory.map((i: any) => ({
      'Type': i.type, 'Brand': i.brand || '', 'Serial': i.serial || '',
      'Product Key': i.product_key || '', 'Condition': i.condition,
      'Assigned To': i.assigned_to || '', 'Notes': i.notes || '',
    }));

    const phoneData = telephones.map((t: any) => ({
      'Extension': t.extension || '', 'Contact': t.contact_number || '',
      'Assigned': t.assigned_to || '', 'Organization': t.organization || '',
      'Serial': t.serial || '', 'Status': t.status,
    }));

    const printerData = printers.map((p: any) => ({
      'Serial': p.serial || '', 'Brand': p.brand || '', 'Model': p.model || '',
      'Product Number': p.product_number || '', 'Assigned': p.assigned_to || '', 'Status': p.status,
    }));

    const warrantyData = assets.filter((a: any) => a.warranty_expiry).sort((a: any, b: any) =>
      new Date(a.warranty_expiry).getTime() - new Date(b.warranty_expiry).getTime()
    ).map((a: any) => ({
      'Asset Tag': a.asset_tag, 'Department': a.department?.name || '', 'Vendor': a.vendor?.name || '',
      'Purchase Date': a.purchase_date || '', 'Warranty Years': a.warranty_years,
      'Warranty Expiry': a.warranty_expiry || '',
    }));

    const sheets: Record<string, any[]> = {
      'Assets': assetData, 'Status': statusData, 'Departments': deptData,
      'Movements': movementData, 'Transfers': transferData, 'Licenses': licenseData,
      'Inventory': inventoryData, 'Telephone': phoneData, 'Printer': printerData,
      'Warranty': warrantyData,
    };

    Object.entries(sheets).forEach(([name, data]) => {
      const ws = XLSX.utils.json_to_sheet(data.length ? data : [{}]);
      XLSX.utils.book_append_sheet(wb, ws, name);
    });

    XLSX.writeFile(wb, `itam_export_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
    toast.success('Export complete', { description: '10-sheet workbook downloaded' });
  };

  const processFile = useCallback(async (file: File) => {
    setImporting(true);
    setProgress(10);
    setSummary(null);

    try {
      const XLSX = await loadXLSX();
      const { supabase } = await import('@/lib/supabase');
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const result: ImportSummary = { ...emptySummary };

      setProgress(20);

      // Process Assets sheet
      if (wb.SheetNames.includes('Assets')) {
        const ws = wb.Sheets['Assets'];
        const rows = XLSX.utils.sheet_to_json<any>(ws);

        for (const row of rows) {
          try {
            const assetTag = row['Asset Tag'] || row['asset_tag'];
            if (!assetTag) continue;

            const { data: existing } = await supabase
              .from('assets')
              .select('id')
              .eq('asset_tag', assetTag)
              .maybeSingle();

            const assetData: any = {
              asset_tag: assetTag,
              type: row['Type'] || row['type'] || 'Desktop',
              cpu_brand: row['CPU Brand'] || null,
              monitor_brand: row['Monitor Brand'] || null,
              keyboard_brand: row['Keyboard Brand'] || null,
              mouse_brand: row['Mouse Brand'] || null,
              cpu_serial: row['CPU Serial'] || null,
              monitor_serial: row['Monitor Serial'] || null,
              keyboard_serial: row['Keyboard Serial'] || null,
              mouse_serial: row['Mouse Serial'] || null,
              invoice_number: row['Invoice'] || row['Invoice Number'] || null,
              purchase_date: row['Purchase Date'] || null,
              warranty_years: Number(row['Warranty Years']) || 3,
              warranty_expiry: row['Warranty Expiry'] || null,
              windows_license: row['Windows License'] || null,
              ms_license: row['MS License'] || null,
              antivirus: row['Antivirus'] || null,
              status: row['Status'] || 'Active',
              notes: row['Notes'] || null,
            };

            if (existing) {
              await supabase.from('assets').update(assetData).eq('id', existing.id);
              result.assetsUpdated++;
            } else {
              await supabase.from('assets').insert(assetData);
              result.assetsAdded++;
            }
          } catch (e) {
            result.errors.push(`Asset: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
      }

      setProgress(40);

      // Process Licenses sheet
      if (wb.SheetNames.includes('Licenses')) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Licenses']);
        for (const row of rows) {
          try {
            const productKey = row['Product Key'] || row['product_key'];
            const licenseData: any = {
              license_number: row['License Number'] || `LIC-${Date.now()}`,
              type: row['Type'] || 'Unknown',
              edition: row['Edition'] || null,
              product_key: productKey || null,
              purchase_date: row['Purchase Date'] || null,
              expiry_date: row['Expiry Date'] || null,
              status: row['Status'] || 'Active',
              notes: row['Notes'] || null,
            };

            if (productKey) {
              const { data: existing } = await supabase
                .from('software_licenses')
                .select('id')
                .eq('product_key', productKey)
                .maybeSingle();
              if (existing) {
                await supabase.from('software_licenses').update(licenseData).eq('id', existing.id);
              } else {
                await supabase.from('software_licenses').insert(licenseData);
                result.licensesImported++;
              }
            } else {
              await supabase.from('software_licenses').insert(licenseData);
              result.licensesImported++;
            }
          } catch (e) {
            result.errors.push(`License: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
      }

      setProgress(55);

      // Process Movements sheet
      if (wb.SheetNames.includes('Movements')) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Movements']);
        for (const row of rows) {
          try {
            const assetTag = row['Asset'];
            if (!assetTag) continue;
            const { data: asset } = await supabase.from('assets').select('id').eq('asset_tag', assetTag).maybeSingle();
            if (!asset) continue;

            await supabase.from('movements').insert({
              asset_id: asset.id,
              movement_type: row['Type'] || 'Issued',
              movement_date: row['Date'] || new Date().toISOString(),
              from_location: row['From'] || null,
              to_location: row['To'] || null,
              notes: row['Notes'] || null,
            });
            result.movementsAdded++;
          } catch (e) {
            result.errors.push(`Movement: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
      }

      setProgress(70);

      // Process Transfers sheet
      if (wb.SheetNames.includes('Transfers')) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Transfers']);
        for (const row of rows) {
          try {
            const assetTag = row['Asset'];
            if (!assetTag) continue;
            const { data: asset } = await supabase.from('assets').select('id').eq('asset_tag', assetTag).maybeSingle();
            if (!asset) continue;

            await supabase.from('transfers').insert({
              asset_id: asset.id,
              transfer_date: row['Date'] || new Date().toISOString(),
              reason: row['Reason'] || null,
              approved_by: row['Approved By'] || null,
              handover: row['Handover'] || null,
              notes: row['Notes'] || null,
              status: row['Status'] || 'Completed',
            });
            result.transfersAdded++;
          } catch (e) {
            result.errors.push(`Transfer: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
      }

      setProgress(80);

      // Process Inventory sheet
      if (wb.SheetNames.includes('Inventory')) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Inventory']);
        for (const row of rows) {
          try {
            await supabase.from('inventory_items').insert({
              type: row['Type'] || 'Unknown',
              brand: row['Brand'] || null,
              serial: row['Serial'] || null,
              product_key: row['Product Key'] || null,
              condition: row['Condition'] || 'Working',
              assigned_to: row['Assigned To'] || null,
              notes: row['Notes'] || null,
            });
            result.inventoryImported++;
          } catch (e) {
            result.errors.push(`Inventory: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
      }

      setProgress(88);

      // Process Telephones sheet
      if (wb.SheetNames.includes('Telephone')) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Telephone']);
        for (const row of rows) {
          try {
            await supabase.from('telephones').insert({
              extension: row['Extension'] || null,
              contact_number: row['Contact'] || null,
              assigned_to: row['Assigned'] || null,
              organization: row['Organization'] || null,
              serial: row['Serial'] || null,
              status: row['Status'] || 'Working',
            });
            result.telephonesImported++;
          } catch (e) {
            result.errors.push(`Telephone: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
      }

      setProgress(94);

      // Process Printers sheet
      if (wb.SheetNames.includes('Printer')) {
        const rows = XLSX.utils.sheet_to_json<any>(wb.Sheets['Printer']);
        for (const row of rows) {
          try {
            await supabase.from('printers').insert({
              serial: row['Serial'] || null,
              brand: row['Brand'] || null,
              model: row['Model'] || null,
              product_number: row['Product Number'] || null,
              assigned_to: row['Assigned'] || null,
              status: row['Status'] || 'Working',
            });
            result.printersImported++;
          } catch (e) {
            result.errors.push(`Printer: ${e instanceof Error ? e.message : 'Unknown error'}`);
          }
        }
      }

      setProgress(100);
      setSummary(result);

      const totalImported = result.assetsAdded + result.assetsUpdated + result.licensesImported +
        result.movementsAdded + result.transfersAdded + result.inventoryImported +
        result.telephonesImported + result.printersImported;

      toast.success('Import complete', {
        description: `${totalImported} records processed${result.errors.length ? `, ${result.errors.length} errors` : ''}`,
      });
    } catch (e) {
      toast.error('Import failed', { description: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setImporting(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
      processFile(file);
    } else {
      toast.error('Invalid file', { description: 'Please upload an Excel file (.xlsx or .xls)' });
    }
  }, [processFile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import / Export</h1>
        <p className="text-muted-foreground mt-1">Import and export data using Excel workbooks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileUp className="w-5 h-5" /> Import Excel
            </CardTitle>
            <CardDescription>Upload an Excel workbook to import data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
              <p className="text-sm font-medium">Drag and drop Excel file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-xs text-muted-foreground text-center">Processing... {progress}%</p>
              </div>
            )}

            {summary && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" /> Import Summary
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {summary.assetsAdded > 0 && <div className="p-2 rounded bg-green-500/10">Assets added: {summary.assetsAdded}</div>}
                  {summary.assetsUpdated > 0 && <div className="p-2 rounded bg-blue-500/10">Assets updated: {summary.assetsUpdated}</div>}
                  {summary.licensesImported > 0 && <div className="p-2 rounded bg-purple-500/10">Licenses imported: {summary.licensesImported}</div>}
                  {summary.movementsAdded > 0 && <div className="p-2 rounded bg-amber-500/10">Movements added: {summary.movementsAdded}</div>}
                  {summary.transfersAdded > 0 && <div className="p-2 rounded bg-cyan-500/10">Transfers added: {summary.transfersAdded}</div>}
                  {summary.inventoryImported > 0 && <div className="p-2 rounded bg-indigo-500/10">Inventory imported: {summary.inventoryImported}</div>}
                  {summary.telephonesImported > 0 && <div className="p-2 rounded bg-teal-500/10">Telephones imported: {summary.telephonesImported}</div>}
                  {summary.printersImported > 0 && <div className="p-2 rounded bg-orange-500/10">Printers imported: {summary.printersImported}</div>}
                </div>
                {summary.errors.length > 0 && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
                    <p className="font-medium flex items-center gap-1 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {summary.errors.length} errors
                    </p>
                    <ul className="space-y-0.5 max-h-24 overflow-y-auto">
                      {summary.errors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Supported sheets:</p>
              <p>Assets, Status, Departments, Movements, Transfers, Licenses, Inventory, Telephone, Printer, Warranty</p>
              <p className="mt-2">Import logic: Match Asset Tag (update existing, insert new). License match by Product Key. Movements and Transfers are appended.</p>
            </div>
          </CardContent>
        </Card>

        {/* Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5" /> Export Excel
            </CardTitle>
            <CardDescription>Download a complete workbook with all data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {['Assets', 'Status', 'Departments', 'Movements', 'Transfers', 'Licenses', 'Inventory', 'Telephone', 'Printer', 'Warranty'].map((sheet) => (
                <div key={sheet} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  {sheet}
                </div>
              ))}
            </div>
            <Button onClick={handleExport} className="w-full" size="lg">
              <Download className="w-4 h-4 mr-2" /> Export Full Workbook
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Exports all data in a 10-sheet Excel workbook format
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
