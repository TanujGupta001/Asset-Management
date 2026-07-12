export const dynamic = 'force-dynamic';
import { getAssets, getDepartments, getEmployees, getVendors } from '@/lib/services';
import { AssetsClient } from '@/components/tables/assets-client';

export default async function AssetsPage() {
  const [assets, departments, employees, vendors] = await Promise.all([
    getAssets(),
    getDepartments(),
    getEmployees(),
    getVendors(),
  ]);

  return <AssetsClient assets={assets} departments={departments} employees={employees} vendors={vendors} />;
}
