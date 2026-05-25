import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Services from '@/components/sections/Services';
import Features from '@/components/sections/Features';
import Cta from '@/components/sections/Cta';
import api from '@/lib/api';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'SEO Services — Full-Service Search Engine Optimization',
  description: 'Comprehensive SEO services including technical SEO, link building, content marketing, local SEO, and enterprise SEO solutions. Drive more organic traffic today.',
  openGraph: {
    title: 'SEO Services — Full-Service Search Optimization',
    description: 'Technical SEO, link building, content marketing, local SEO and more. Enterprise-grade results for every business.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Services — SEO Platform',
    images: ['/og-image.jpg'],
  },
};

async function getData() {
  const results = await Promise.allSettled([
    api.get('/v1/services?status=published&limit=20'),
    api.get('/v1/settings/features'),
    api.get('/v1/settings/cta'),
    api.get('/v1/settings/general'),
  ]);
  return {
    services: results[0].status === 'fulfilled' ? results[0].value.data?.data?.services || [] : [],
    features: results[1].status === 'fulfilled' ? results[1].value.data?.data : null,
    cta:      results[2].status === 'fulfilled' ? results[2].value.data?.data : null,
    general:  results[3].status === 'fulfilled' ? results[3].value.data?.data : null,
  };
}

export default async function ServicesPage() {
  const { services, features, cta, general } = await getData();
  return (
    <>
      <Navbar general={general}/>
      <main>
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Our Services</p>
            <h1 className="text-4xl sm:text-5xl font-bold">Everything you need to <span className="gradient-text">dominate search</span></h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Comprehensive SEO solutions tailored for businesses of all sizes.</p>
          </div>
        </section>
        <Services services={services}/>
        <Features features={features}/>
        <Cta data={cta}/>
      </main>
      <Footer general={general}/>
    </>
  );
}