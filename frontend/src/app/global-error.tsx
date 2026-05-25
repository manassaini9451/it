'use client';
import { RefreshCw } from 'lucide-react';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html><body className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted-foreground mb-6 text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="btn-primary h-10 px-5"><RefreshCw className="h-4 w-4"/>Try again</button>
      </div>
    </body></html>
  );
}
