export const dynamic = 'force-dynamic';
import { getDepartments, getVendors, getEmployees, getAuditLogs } from '@/lib/services';
import { SettingsClient } from '@/components/shared/settings-client';

export default async function SettingsPage() {
  const [departments, vendors, employees, auditLogs] = await Promise.all([
    getDepartments(),
    getVendors(),
    getEmployees(),
    getAuditLogs(20),
  ]);

  return (
    <SettingsClient
      departments={departments}
      vendors={vendors}
      employees={employees}
      auditLogs={auditLogs}
    />
  );
}
