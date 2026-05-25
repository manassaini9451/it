'use client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const FALLBACK = [
  { name:'Sarah Johnson', role:'CEO', company:'TechStartup Inc', content:'SEO Platform took us from page 5 to #1 for our main keyword in 6 months. The ROI has been absolutely incredible.', rating:5, avatar:'SJ', trafficIncrease:'+420%' },
  { name:'Michael Chen', role:'Marketing Director', company:'E-Shop Pro', content:'Their technical SEO expertise is truly unmatched. Organic traffic doubled in 90 days after the audit. Highly recommended.', rating:5, avatar:'MC', trafficIncrease:'+285%' },
  { name:'Emily Roberts', role:'Founder', company:'Local Business Hub', content:'The local SEO campaign changed our business completely. We now rank in the top 3 for all our target keywords.', rating:5, avatar:'ER', trafficIncrease:'+190%' },
  { name:'David Park', role:'VP Growth', company:'SaaS Co', content:'The real-time dashboard is phenomenal. We see exactly what keywords are moving and why. Best-in-class transparency.', rating:5, avatar:'DP', trafficIncrease:'+340%' },
  { name:'Lisa Martinez', role:'Head of Digital', company:'Retail Chain', content:'E-commerce SEO results exceeded every expectation. Revenue from organic search is up 380% year over year.', rating:5, avatar:'LM', trafficIncrease:'+380%' },
  { name:'James Wilson', role:'CMO', company:'B2B Solutions', content:'The content strategy positioned us as genuine thought leaders. Our blog now drives over 60% of new leads.', rating:5, avatar:'JW', trafficIncrease:'+260%' },
];

export default function Testimonials({ testimonials }: { testimonials?: any[] }) {
  const items = testimonials?.length ? testimonials : FALLBACK;
  return (
    <section className="section-padding bg-muted/20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Client Success Stories</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">What our clients say</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t: any, i: number) => (
            <motion.div key={t._id||t.name||i} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.08}}
              className="rounded-2xl border border-border bg-card p-6 flex flex-col">
              <div className="flex items-center gap-1 mb-4">
                {Array.from({length: t.rating||5}).map((_,j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400"/>)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 italic">"{t.content}"</p>
              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {t.avatar || t.name?.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}{t.company ? `, ${t.company}` : ''}</p>
                  </div>
                </div>
                {(t.trafficIncrease || t.increase) && (
                  <span className="text-sm font-bold text-green-500">{t.trafficIncrease || t.increase}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
