import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import ReduxProvider from '@/components/providers/ReduxProvider';
import ThemeProvider from '@/components/providers/ThemeProvider';
import ToastProvider from '@/components/providers/ToastProvider';
import SocketProvider from '@/components/providers/SocketProvider';
import PageTracker from '@/components/providers/PageTracker';
import '@/styles/globals.css';

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 5,
  themeColor: [{ media:'(prefers-color-scheme: light)',color:'#ffffff' },{ media:'(prefers-color-scheme: dark)',color:'#0a0a0a' }],
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default:'SEO Platform - Enterprise SEO & Digital Marketing', template:'%s | SEO Platform' },
  description: 'Enterprise-grade SEO platform. Rank higher, drive traffic, grow your business.',
  robots: { index:true, follow:true },
  openGraph: { type:'website', siteName:'SEO Platform', title:'SEO Platform', description:'Enterprise SEO platform', images:['/og-image.jpg'] },
  twitter: { card:'summary_large_image', title:'SEO Platform', images:['/og-image.jpg'] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ReduxProvider>
          <ThemeProvider>
            <SocketProvider>
              {/* Tracks every client-side route change as a visitor page hit */}
              <Suspense fallback={null}>
                <PageTracker />
              </Suspense>
              {children}
              <ToastProvider />
            </SocketProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}