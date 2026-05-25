'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Star, TrendingUp, Users, Award, CheckCircle2, Play } from 'lucide-react';

const ICON_MAP: Record<string, any> = { TrendingUp, Users, Award };
const COLOR_MAP: Record<string, string> = {
  green: 'text-green-500 bg-green-500/10',
  blue:  'text-blue-500 bg-blue-500/10',
  yellow:'text-yellow-500 bg-yellow-500/10',
};

const FALLBACK = {
  badge: '#1 Rated SEO Platform — G2 2024',
  headline1: 'Rank Higher.', headline2: 'Grow Faster.', headline3: 'Win Online.',
  subheadline: 'Enterprise-grade SEO powered by AI. We help businesses achieve top Google rankings, drive qualified traffic, and generate more revenue.',
  ctaPrimary: { label: 'Get Free SEO Audit', href: '/contact' },
  ctaSecondary: { label: 'Watch 2-min demo', href: '/about' },
  perks: ['No long-term contracts','Real-time reporting','Dedicated SEO manager','30-day money-back guarantee'],
  reviewCount: 2500, reviewScore: '4.9',
  statsCards: [
    { val: '+340%', label: 'Avg Traffic Increase', color: 'green' },
    { val: '2,500+', label: 'Happy Clients', color: 'blue' },
    { val: '48', label: 'Awards Won', color: 'yellow' },
  ],
};

export default function Hero({ data }: { data?: any }) {
  const d = data || FALLBACK;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start','end start'] });
  const y = useTransform(scrollYProgress, [0,1], ['0%','30%']);

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none"/>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background pointer-events-none"/>
      <motion.div style={{y}} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]"/>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-500/15 blur-[100px]"/>
      </motion.div>
      <div className="container max-w-7xl mx-auto px-4 relative z-10 py-20">
        <div className="max-w-5xl mx-auto text-center">
          {d.badge && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-8">
              <Star className="h-3.5 w-3.5 fill-current"/>{d.badge}<ArrowRight className="h-3.5 w-3.5"/>
            </motion.div>
          )}
          <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}} className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.05]">
            {d.headline1}<br/><span className="gradient-text">{d.headline2}</span><br/>{d.headline3}
          </motion.h1>
          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.2}} className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {d.subheadline}
          </motion.p>
          {d.perks?.length > 0 && (
            <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.25}} className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {d.perks.map((p: string) => <div key={p} className="flex items-center gap-1.5 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-500 shrink-0"/>{p}</div>)}
            </motion.div>
          )}
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href={d.ctaPrimary?.href||'/contact'} className="group h-12 px-8 flex items-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:bg-primary/90 hover:scale-[1.02] transition-all duration-200">
              {d.ctaPrimary?.label||'Get Free SEO Audit'}<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform"/>
            </Link>
            <Link href={d.ctaSecondary?.href||'/about'} className="group h-12 px-6 flex items-center gap-3 rounded-xl border border-border hover:border-primary/50 hover:bg-accent transition-all text-sm font-medium">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Play className="h-3.5 w-3.5 text-primary fill-current ml-0.5"/>
              </div>
              {d.ctaSecondary?.label||'Watch 2-min demo'}
            </Link>
          </motion.div>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="mt-10 flex items-center justify-center gap-3">
            <div className="flex -space-x-2">{[1,2,3,4,5].map(i=><div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/40 to-purple-500/40 flex items-center justify-center text-xs font-bold text-primary">{String.fromCharCode(64+i)}</div>)}</div>
            <div>
              <div className="flex items-center gap-0.5">{[1,2,3,4,5].map(i=><Star key={i} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"/>)}</div>
              <p className="text-xs text-muted-foreground"><span className="font-semibold text-foreground">{d.reviewScore}/5</span> from {Number(d.reviewCount).toLocaleString()}+ reviews</p>
            </div>
          </motion.div>
        </div>
        {d.statsCards?.length > 0 && (
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {d.statsCards.map((s: any, i: number) => {
              const colorCls = COLOR_MAP[s.color] || COLOR_MAP.blue;
              return (
                <motion.div key={s.label} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.5+i*0.1}}
                  className="rounded-2xl border border-border bg-card/80 backdrop-blur p-5 text-center card-hover">
                  <p className={`text-2xl font-bold ${colorCls.split(' ')[0]}`}>{s.val}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
