export const dynamic = 'force-dynamic';
import { getAssets, getSoftwareLicenses, getDepartments, getEmployees, getVendors } from '@/lib/services';
import { LicensesClient } from '@/components/tables/licenses-client';

export default async function LicensesPage() {
  const [licenses, assets, departments, employees, vendors] = await Promise.all([
    getSoftwareLicenses(),
    getAssets(),
    getDepartments(),
    getEmployees(),
    getVendors(),
  ]);

  return <LicensesClient licenses={licenses} assets={assets} departments={departments} employees={employees} vendors={vendors} />;
}
