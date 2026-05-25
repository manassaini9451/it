import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Cta from '@/components/sections/Cta';
import api from '@/lib/api';
import { TrendingUp } from 'lucide-react';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Portfolio — SEO Case Studies & Success Stories',
  description: 'Real SEO results for real businesses. See how SEO Platform delivered 200-420% traffic growth across e-commerce, SaaS, local businesses and enterprise clients.',
  openGraph: { title: 'SEO Case Studies & Success Stories', description: 'Real SEO results: 200-420% traffic growth across industries.', images: ['/og-image.jpg'], type: 'website' },
  twitter: { card: 'summary_large_image', title: 'SEO Portfolio — Real Results', images: ['/og-image.jpg'] },
};

async function getData() {
  const results = await Promise.allSettled([api.get('/v1/projects?status=published&limit=12'),api.get('/v1/settings/cta'),api.get('/v1/settings/general')]);
  return { projects:results[0].status==='fulfilled'?results[0].value.data?.data?.items||[]:[], cta:results[1].status==='fulfilled'?results[1].value.data?.data:null, general:results[2].status==='fulfilled'?results[2].value.data?.data:null };
}

export default async function PortfolioPage() {
  const { projects, cta, general } = await getData();

  return (
    <>
      <Navbar general={general}/>
      <main>
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Case Studies</p>
            <h1 className="text-4xl sm:text-5xl font-bold">Real results for <span className="gradient-text">real businesses</span></h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">Proof that our SEO strategies drive measurable growth across all industries.</p>
          </div>
        </section>
        <section className="section-padding">
          <div className="container max-w-7xl mx-auto px-4">
            {projects.length === 0 ? (
              <div className="py-20 text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                <p className="text-muted-foreground">No case studies published yet. Run the seed command to add examples.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((p: any) => (
                  <Link key={p._id} href={`/portfolio/${p.slug}`} className="group rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="h-48 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center">
                      <TrendingUp className="h-12 w-12 text-primary/40 group-hover:text-primary/60 transition-colors"/>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{p.industry||'SEO'}</span>
                        {p.metrics?.trafficAfter && p.metrics?.trafficBefore && (
                          <span className="text-sm font-bold text-green-500">+{Math.round(((p.metrics.trafficAfter-p.metrics.trafficBefore)/p.metrics.trafficBefore)*100)}%</span>
                        )}
                      </div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{p.client}</p>
                      {p.results?.length>0 && (
                        <ul className="mt-3 space-y-1">
                          {p.results.slice(0,3).map((r: string,i: number)=>(
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5"><div className="h-1.5 w-1.5 rounded-full bg-green-500"/>{r}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
        <Cta data={cta}/>
      </main>
      <Footer general={general}/>
    </>
  );
}