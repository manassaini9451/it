import Link from 'next/link';
import { Shield, Home } from 'lucide-react';
export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="text-center max-w-sm">
        <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6"><Shield className="h-8 w-8 text-destructive"/></div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-8">You don't have permission to access this page.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-outline h-10 px-5"><Home className="h-4 w-4"/>Go Home</Link>
          <Link href="/admin" className="btn-primary h-10 px-5">Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
