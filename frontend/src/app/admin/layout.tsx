import type { Metadata } from 'next';
import AuthGuard from '@/components/auth/AuthGuard';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';

export const metadata: Metadata = {
  title: { default: 'Admin Dashboard', template: '%s | Admin' },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRoles={['super-admin','admin','editor']}>
      <div className="flex h-screen bg-muted/20 overflow-hidden">
        <AdminSidebar/>
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <AdminHeader/>
          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1600px] mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
