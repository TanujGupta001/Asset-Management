import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted">
        <FileQuestion className="w-10 h-10 text-muted-foreground" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
      </div>
      <Button asChild>
        <Link href="/dashboard">
          <Home className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
      </Button>
    </div>
  );
}
