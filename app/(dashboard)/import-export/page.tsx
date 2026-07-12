'use client';

import dynamic from 'next/dynamic';

const ImportExportClient = dynamic(
  () => import('@/components/import-export-client').then((m) => m.ImportExportClient),
  { ssr: false }
);

export default function ImportExportPage() {
  return <ImportExportClient />;
}
