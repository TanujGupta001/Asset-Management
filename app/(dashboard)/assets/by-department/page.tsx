export const dynamic = 'force-dynamic';
import { getAssets, getDepartments, getEmployees } from '@/lib/services';
import { ByDepartmentClient } from '@/components/tables/by-department-client';

export default async function AssetsByDepartmentPage() {
  const [assets, departments, employees] = await Promise.all([
    getAssets(),
    getDepartments(),
    getEmployees(),
  ]);

  return (
    <ByDepartmentClient
      assets={assets}
      departments={departments}
      employees={employees}
    />
  );
}
