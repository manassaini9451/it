import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="text-8xl font-black text-muted/20 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary h-10 px-5"><Home className="h-4 w-4"/>Go Home</Link>
          <Link href="/blog" className="btn-outline h-10 px-5">Browse Blog</Link>
        </div>
      </div>
    </div>
  );
}
