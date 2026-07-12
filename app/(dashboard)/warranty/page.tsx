export const dynamic = 'force-dynamic';
import { getAssets } from '@/lib/services';
import { WarrantyClient } from '@/components/tables/warranty-client';

export default async function WarrantyPage() {
  const assets = await getAssets();
  return <WarrantyClient assets={assets} />;
}
