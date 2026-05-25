'use client';
import { motion } from 'framer-motion';
import { Bot, BarChart2, Globe, Layers, Lock, Zap, Search, Star, ArrowRight, Shield, TrendingUp, Users } from 'lucide-react';

const ICON_MAP: Record<string, any> = { Bot, BarChart2, Globe, Layers, Lock, Zap, Search, Star, ArrowRight, Shield, TrendingUp, Users };
const FALLBACK = [
  { icon:'Bot',      title:'AI-Powered SEO',      desc:'ML-driven ranking predictions, automated recommendations, and NLP-optimized content scoring.', badge:'AI' },
  { icon:'BarChart2',title:'Real-Time Analytics', desc:'Live dashboards updated every 60 seconds with full attribution across all channels.',            badge:'Live' },
  { icon:'Globe',    title:'Global SEO',           desc:'Multi-language, hreflang configuration, and international SEO strategies for 35+ markets.',       badge:'Global' },
  { icon:'Layers',   title:'Content Optimization', desc:'AI-powered content scoring, semantic analysis, and keyword density optimization.',               badge:'Smart' },
  { icon:'Lock',     title:'Enterprise Security',  desc:'SOC 2 Type II compliant with RBAC, audit logs, SSO, and end-to-end encryption.',                  badge:'Secure' },
  { icon:'Zap',      title:'Core Web Vitals',      desc:'Automated LCP, CLS, FID monitoring with green-score optimization recommendations.',              badge:'Fast' },
];

export default function Features({ features }: { features?: any[] }) {
  const items = features?.length ? features : FALLBACK;
  return (
    <section className="section-padding bg-muted/20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Platform Features</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Built for <span className="gradient-text">serious growth</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((f: any, i: number) => {
            const Icon = ICON_MAP[f.icon] || Zap;
            return (
              <motion.div key={f.title || i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
                className="rounded-2xl border border-border bg-card p-6 hover:border-primary/30 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors"><Icon className="h-5 w-5 text-primary"/></div>
                  {f.badge && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">{f.badge}</span>}
                </div>
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc || f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
