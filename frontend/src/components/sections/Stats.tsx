'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, Users, Globe, Award } from 'lucide-react';

const ICONS: any = { TrendingUp, Users, Globe, Award };
const COLORS = ['from-green-500 to-emerald-600','from-blue-500 to-cyan-600','from-purple-500 to-violet-600','from-orange-500 to-amber-600'];

const FALLBACK = { totalClients:2500, avgTrafficIncrease:340, keywordsRanked:'50M+', clientRetention:98, awardsWon:48, yearsExperience:10 };

function Counter({ end, inView }: { end: number; inView: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const timer = setInterval(() => {
      start += Math.ceil(end / 60);
      if (start >= end) { setCount(end); clearInterval(timer); } else setCount(start);
    }, 30);
    return () => clearInterval(timer);
  }, [inView, end]);
  return <>{count.toLocaleString()}</>;
}

export default function Stats({ data }: { data?: any }) {
  const d = data || FALLBACK;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const items = [
    { val: d.avgTrafficIncrease, suffix: '%', label: 'Average Traffic Increase', color: COLORS[0] },
    { val: typeof d.totalClients === 'number' ? d.totalClients : 2500, suffix: '+', label: 'Happy Clients', color: COLORS[1] },
    { val: null, raw: d.keywordsRanked || '50M+', label: 'Keywords Ranked', color: COLORS[2] },
    { val: d.clientRetention, suffix: '%', label: 'Client Retention Rate', color: COLORS[3] },
  ];

  return (
    <section className="section-padding border-y border-border bg-muted/20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Our Impact</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Results that speak for themselves</h2>
        </div>
        <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, i) => (
            <motion.div key={item.label} initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{}} transition={{delay:i*0.1}}
              className="rounded-2xl border border-border bg-card p-8 card-hover text-center group">
              <div className={`text-4xl lg:text-5xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent tabular-nums`}>
                {item.raw ? item.raw : <><Counter end={item.val||0} inView={inView}/>{item.suffix}</>}
              </div>
              <p className="mt-2 font-semibold">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
