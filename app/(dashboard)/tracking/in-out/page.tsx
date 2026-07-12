export const dynamic = 'force-dynamic';
import { getMovements, getAssets, getDepartments } from '@/lib/services';
import { InOutClient } from '@/components/tables/in-out-client';

export default async function InOutPage() {
  const [movements, assets, departments] = await Promise.all([
    getMovements(),
    getAssets(),
    getDepartments(),
  ]);

  return (
    <InOutClient
      movements={movements}
      assets={assets}
      departments={departments}
    />
  );
}
