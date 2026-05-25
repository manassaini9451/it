import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Pricing from '@/components/sections/Pricing';
import Faq from '@/components/sections/Faq';
import Cta from '@/components/sections/Cta';
import api from '@/lib/api';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Pricing — Simple, Transparent SEO Plans | SEO Platform',
  description: 'Affordable SEO plans for every business size. Starter from $499/mo, Professional $999/mo, Enterprise $2,499/mo. No long-term contracts. Cancel anytime.',
  openGraph: {
    title: 'SEO Pricing — Simple, Transparent Plans',
    description: 'SEO plans from $499/mo. No contracts. Cancel anytime. See what is included in each plan.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Pricing — SEO Platform',
    images: ['/og-image.jpg'],
  },
};

async function getData() {
  const results = await Promise.allSettled([
    api.get('/v1/settings/pricing'),
    api.get('/v1/settings/faqs'),
    api.get('/v1/settings/cta'),
    api.get('/v1/settings/general'),
  ]);
  return {
    pricing: results[0].status === 'fulfilled' ? results[0].value.data?.data : null,
    faqs:    results[1].status === 'fulfilled' ? results[1].value.data?.data : null,
    cta:     results[2].status === 'fulfilled' ? results[2].value.data?.data : null,
    general: results[3].status === 'fulfilled' ? results[3].value.data?.data : null,
  };
}

export default async function PricingPage() {
  const { pricing, faqs, cta, general } = await getData();
  return (
    <>
      <Navbar general={general}/>
      <main>
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Pricing</p>
            <h1 className="text-4xl sm:text-5xl font-bold">{pricing?.headline || 'Simple, transparent pricing'}</h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">{pricing?.subheadline || 'No hidden fees. No long-term contracts. Cancel anytime.'}</p>
          </div>
        </section>
        <Pricing data={pricing}/>
        <Faq faqs={faqs}/>
        <Cta data={cta}/>
      </main>
      <Footer general={general}/>
    </>
  );
}