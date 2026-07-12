export const dynamic = 'force-dynamic';
import { getDashboardStats, getDepartments, getAssets, getSoftwareLicenses } from '@/lib/services';
import { SummaryReportClient } from '@/components/reports/summary-report-client';

export default async function SummaryReportPage() {
  const [stats, departments, assets, licenses] = await Promise.all([
    getDashboardStats(),
    getDepartments(),
    getAssets(),
    getSoftwareLicenses(),
  ]);

  return <SummaryReportClient stats={stats} departments={departments} assets={assets} licenses={licenses} />;
}
