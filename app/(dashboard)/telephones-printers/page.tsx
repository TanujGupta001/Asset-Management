export const dynamic = 'force-dynamic';
import { getTelephones, getPrinters } from '@/lib/services';
import { TelephonesPrintersClient } from '@/components/tables/telephones-printers-client';

export default async function TelephonesPrintersPage() {
  const [telephones, printers] = await Promise.all([
    getTelephones(),
    getPrinters(),
  ]);

  return <TelephonesPrintersClient telephones={telephones} printers={printers} />;
}
