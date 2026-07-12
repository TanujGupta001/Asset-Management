'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SESSION_KEY } from '@/lib/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    document.cookie = `${SESSION_KEY}=; path=/; max-age=0`;
    sessionStorage.removeItem(SESSION_KEY);
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Logging out...</p>
    </div>
  );
}
