export const dynamic = 'force-dynamic';
import { getAssets, getDepartments, getEmployees, getInventoryItems } from '@/lib/services';
import { InventoryClient } from '@/components/tables/inventory-client';

export default async function InventoryPage() {
  const [assets, departments, employees, inventoryItems] = await Promise.all([
    getAssets(),
    getDepartments(),
    getEmployees(),
    getInventoryItems(),
  ]);

  return (
    <InventoryClient
      assets={assets}
      departments={departments}
      employees={employees}
      inventoryItems={inventoryItems}
    />
  );
}
