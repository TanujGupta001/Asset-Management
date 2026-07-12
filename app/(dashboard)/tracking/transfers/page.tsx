export const dynamic = 'force-dynamic';
import { getTransfers, getAssets, getDepartments, getEmployees } from '@/lib/services';
import { TransfersClient } from '@/components/tables/transfers-client';

export default async function TransfersPage() {
  const [transfers, assets, departments, employees] = await Promise.all([
    getTransfers(),
    getAssets(),
    getDepartments(),
    getEmployees(),
  ]);

  return (
    <TransfersClient
      transfers={transfers}
      assets={assets}
      departments={departments}
      employees={employees}
    />
  );
}
