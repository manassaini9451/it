'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Globe, Link2, FileText, BarChart2, Zap, Shield, Bot, ShoppingCart, MapPin, Star, Layers, ArrowRight } from 'lucide-react';

const ICON_MAP: Record<string, any> = { Search, Globe, Link2, FileText, BarChart2, Zap, Shield, Bot, ShoppingCart, MapPin, Star, Layers };
const FALLBACK = [
  { icon:'Search', title:'SEO Services', slug:'seo', excerpt:'Comprehensive SEO strategies to dominate search results.', color:'from-blue-500 to-cyan-500', features:['Keyword Research','On-Page Optimization','Content Strategy','Monthly Reports'] },
  { icon:'MapPin', title:'Local SEO', slug:'local-seo', excerpt:'Capture local customers and appear in Google Maps.', color:'from-green-500 to-emerald-500', features:['Google Business Profile','Citation Building','Local Keywords','Review Management'] },
  { icon:'Link2', title:'Link Building', slug:'link-building', excerpt:'High-authority, white-hat backlinks that boost rankings.', color:'from-purple-500 to-violet-500', features:['Guest Posting','Digital PR','Broken Link Building','Competitor Analysis'] },
  { icon:'FileText', title:'Content Marketing', slug:'content', excerpt:'SEO-optimized content that attracts and converts.', color:'from-orange-500 to-amber-500', features:['Blog Writing','Landing Pages','Pillar Pages','Content Calendar'] },
  { icon:'Zap', title:'Technical SEO', slug:'technical-seo', excerpt:'Fix crawlability, site speed, and Core Web Vitals.', color:'from-yellow-500 to-orange-500', features:['Core Web Vitals','Schema Markup','Site Speed','Mobile Optimization'] },
  { icon:'Bot', title:'AI Marketing', slug:'ai-marketing', excerpt:'Future-proof SEO with AI-driven strategies.', color:'from-indigo-500 to-purple-500', features:['AI Overview Optimization','Entity SEO','LLM Content','Featured Snippets'] },
];

export default function Services({ services }: { services?: any[] }) {
  const items = services?.length ? services : FALLBACK;
  return (
    <section className="section-padding">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Our Services</p>
          <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold">Everything you need to <span className="gradient-text">dominate search</span></h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">Comprehensive SEO solutions tailored for your business goals and budget.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((svc: any, i: number) => {
            const Icon = ICON_MAP[svc.icon] || Search;
            return (
              <motion.div key={svc.slug || svc._id || i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.07}}>
                <Link href={`/services/${svc.slug}`} className="group block h-full rounded-2xl border border-border bg-card p-6 hover:border-primary/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${svc.color||'from-blue-500 to-cyan-500'} mb-5`}><Icon className="h-6 w-6 text-white"/></div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{svc.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{svc.excerpt || svc.description}</p>
                  {svc.features?.length > 0 && (
                    <ul className="space-y-1.5 mb-5">{svc.features.slice(0,4).map((f: string) => <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground"><div className="h-1.5 w-1.5 rounded-full bg-primary"/>{f}</li>)}</ul>
                  )}
                  <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">Learn more<ArrowRight className="h-3.5 w-3.5"/></div>
                </Link>
              </motion.div>
            );
          })}
        </div>
        <div className="mt-12 text-center">
          <Link href="/services" className="btn-outline gap-2">View all services<ArrowRight className="h-4 w-4"/></Link>
        </div>
      </div>
    </section>
  );
}
