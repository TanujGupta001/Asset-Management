export const dynamic = 'force-dynamic';
import { getAssets } from '@/lib/services';
import { ByStatusClient } from '@/components/tables/by-status-client';

export default async function AssetsByStatusPage() {
  const assets = await getAssets();

  return <ByStatusClient assets={assets} />;
}
