'use client';

import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Application Error</h2>
            <p className="text-sm text-muted-foreground">A critical error occurred. Please try again.</p>
          </div>
          <Button onClick={reset}>
            <RotateCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
        </div>
      </body>
    </html>
  );
}
