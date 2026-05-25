import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Cta from '@/components/sections/Cta';
import api from '@/lib/api';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';

export const revalidate = 300;

async function getService(slug: string) {
  try {
    const r = await api.get(`/v1/services/slug/${slug}`);
    return r.data?.data;
  } catch {
    return null;
  }
}

async function getSettings() {
  try {
    const [cta, general] = await Promise.allSettled([
      api.get('/v1/settings/cta'),
      api.get('/v1/settings/general'),
    ]);
    return {
      cta: cta.status === 'fulfilled' ? cta.value.data?.data : null,
      general: general.status === 'fulfilled' ? general.value.data?.data : null,
    };
  } catch {
    return { cta: null, general: null };
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getService(params.slug);
  if (!service) return { title: 'Service Not Found' };
  const seo = service.seo || {};
  return {
    title: seo.metaTitle || `${service.title} — SEO Services`,
    description: seo.metaDescription || service.excerpt || service.description,
    openGraph: {
      title: seo.ogTitle || service.title,
      description: seo.ogDescription || service.excerpt || service.description,
      images: service.image ? [service.image] : ['/og-image.jpg'],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: service.title,
      description: service.excerpt || service.description,
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/services/${params.slug}`,
    },
  };
}

export default async function ServiceDetailPage({ params }: { params: { slug: string } }) {
  const [service, { cta, general }] = await Promise.all([
    getService(params.slug),
    getSettings(),
  ]);

  if (!service) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.excerpt || service.description,
    provider: {
      '@type': 'Organization',
      name: general?.siteName || 'SEO Platform',
      url: siteUrl,
    },
    url: `${siteUrl}/services/${service.slug}`,
  };

  return (
    <>
      <Navbar general={general} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { position: 1, name: 'Home', item: siteUrl },
              { position: 2, name: 'Services', item: `${siteUrl}/services` },
              { position: 3, name: service.title, item: `${siteUrl}/services/${service.slug}` },
            ],
          }),
        }}
      />

      <main className="min-h-screen">
        {/* Hero */}
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-5xl mx-auto px-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
              <span>/</span>
              <Link href="/services" className="hover:text-foreground transition-colors">Services</Link>
              <span>/</span>
              <span className="text-foreground">{service.title}</span>
            </nav>

            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />Back to Services
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">
                  {service.category || 'SEO Service'}
                </p>
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight">{service.title}</h1>
                <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                  {service.excerpt || service.description}
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Link href="/contact" className="btn-primary gap-2">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/pricing" className="btn-outline">
                    View Pricing
                  </Link>
                </div>
              </div>

              {/* Feature highlights */}
              {service.features?.length > 0 && (
                <div className="rounded-2xl border border-border bg-card p-8">
                  <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-5">
                    What's included
                  </p>
                  <ul className="space-y-3">
                    {service.features.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main content */}
        {service.content && (
          <section className="section-padding">
            <div className="container max-w-4xl mx-auto px-4">
              <article
                className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-blockquote:border-l-primary"
                dangerouslySetInnerHTML={{ __html: service.content }}
              />
            </div>
          </section>
        )}

        {/* Benefits / process */}
        {service.benefits?.length > 0 && (
          <section className="section-padding bg-muted/20 border-y border-border">
            <div className="container max-w-5xl mx-auto px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">
                Why choose our <span className="gradient-text">{service.title}</span>?
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {service.benefits.map((b: any, i: number) => (
                  <div key={i} className="rounded-2xl border border-border bg-card p-6">
                    <p className="font-semibold mb-2">{b.title || b}</p>
                    {b.description && (
                      <p className="text-sm text-muted-foreground">{b.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <Cta data={cta} />
      </main>

      <Footer general={general} />
    </>
  );
}