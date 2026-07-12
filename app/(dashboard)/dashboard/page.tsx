export const dynamic = 'force-dynamic';
import { getDashboardStats } from '@/lib/services';
import { DashboardClient } from '@/components/dashboard-client';

export default async function DashboardPage() {
  const stats = await getDashboardStats();
  return <DashboardClient stats={stats} />;
}
