'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const FALLBACK = {
  headline: 'Ready to dominate search results?',
  subheadline: 'Join 2,500+ businesses growing with SEO Platform. Get your free audit today.',
  primaryCta: { label: 'Get Free SEO Audit', href: '/contact' },
  secondaryCta: { label: 'View Pricing', href: '/pricing' },
  footnote: 'No credit card required • Free 30-minute consultation',
};

export default function Cta({ data }: { data?: any }) {
  const d = data || FALLBACK;
  return (
    <section className="section-padding">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.div initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} viewport={{once:true}}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-purple-700 p-12 md:p-20 text-center">
          <div className="absolute inset-0 bg-grid opacity-10"/>
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl"/>
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">{d.headline}</h2>
            <p className="mt-4 text-lg text-white/80 max-w-2xl mx-auto">{d.subheadline}</p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={d.primaryCta?.href||'/contact'} className="h-12 px-8 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-white/90 transition-colors flex items-center gap-2 shadow-lg">
                {d.primaryCta?.label||'Get Free SEO Audit'}<ArrowRight className="h-4 w-4"/>
              </Link>
              {d.secondaryCta && (
                <Link href={d.secondaryCta.href||'/pricing'} className="h-12 px-8 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center">
                  {d.secondaryCta.label||'View Pricing'}
                </Link>
              )}
            </div>
            {d.footnote && <p className="mt-6 text-sm text-white/60">{d.footnote}</p>}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
