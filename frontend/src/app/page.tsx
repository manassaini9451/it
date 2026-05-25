import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Stats from '@/components/sections/Stats';
import Services from '@/components/sections/Services';
import Features from '@/components/sections/Features';
import Testimonials from '@/components/sections/Testimonials';
import Pricing from '@/components/sections/Pricing';
import BlogPreview from '@/components/sections/BlogPreview';
import Faq from '@/components/sections/Faq';
import Cta from '@/components/sections/Cta';
import api from '@/lib/api';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const r = await api.get('/v1/settings/seo');
    const seo = r.data?.data;
    if (seo) return {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      openGraph: { images: [seo.defaultOgImage] },
    };
  } catch {}
  return {
    title: 'SEO Platform - Enterprise SEO & Digital Marketing',
    description: 'Enterprise-grade SEO platform. Rank higher, drive traffic, grow your business.',
  };
}

async function getData() {
  const results = await Promise.allSettled([
    api.get('/v1/settings/hero'),
    api.get('/v1/settings/stats'),
    api.get('/v1/settings/features'),
    api.get('/v1/settings/pricing'),
    api.get('/v1/settings/faqs'),
    api.get('/v1/settings/cta'),
    api.get('/v1/services?limit=7&status=published'),
    api.get('/v1/testimonials?limit=6&status=published'),
    api.get('/v1/blogs?limit=3&status=published'),
    api.get('/v1/settings/general'),
  ]);
  const [heroR, statsR, featuresR, pricingR, faqsR, ctaR, servicesR, testimonialsR, blogsR, generalR] = results;
  return {
    hero:         heroR.status === 'fulfilled'         ? heroR.value.data?.data         : null,
    stats:        statsR.status === 'fulfilled'        ? statsR.value.data?.data        : null,
    features:     featuresR.status === 'fulfilled'     ? featuresR.value.data?.data     : null,
    pricing:      pricingR.status === 'fulfilled'      ? pricingR.value.data?.data      : null,
    faqs:         faqsR.status === 'fulfilled'         ? faqsR.value.data?.data         : null,
    cta:          ctaR.status === 'fulfilled'          ? ctaR.value.data?.data          : null,
    services:     servicesR.status === 'fulfilled'     ? servicesR.value.data?.data?.services || [] : [],
    testimonials: testimonialsR.status === 'fulfilled' ? testimonialsR.value.data?.data?.items || [] : [],
    blogs:        blogsR.status === 'fulfilled'        ? blogsR.value.data?.data?.blogs || [] : [],
    general:      generalR.status === 'fulfilled'      ? generalR.value.data?.data      : null,
  };
}

export default async function HomePage() {
  const data = await getData();

  const orgSchema = {
    '@context': 'https://schema.org', '@type': 'Organization',
    name: data.general?.siteName || 'SEO Platform',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    logo: data.general?.logo ? `${process.env.NEXT_PUBLIC_SITE_URL}${data.general.logo}` : undefined,
    contactPoint: { '@type': 'ContactPoint', telephone: data.general?.phone || '+1-800-555-1234', contactType: 'customer service' },
    sameAs: data.general?.socialLinks ? Object.values(data.general.socialLinks) : [],
  };

  return (
    <>
      <Navbar general={data.general}/>
      <main>
        <Hero data={data.hero}/>
        <Stats data={data.stats}/>
        <Services services={data.services}/>
        <Features features={data.features}/>
        <Testimonials testimonials={data.testimonials}/>
        <Pricing data={data.pricing}/>
        <BlogPreview blogs={data.blogs}/>
        <Faq faqs={data.faqs}/>
        <Cta data={data.cta}/>
      </main>
      <Footer general={data.general}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}/>
    </>
  );
}
