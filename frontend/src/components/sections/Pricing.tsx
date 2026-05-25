'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const FALLBACK = {
  headline: 'Simple, transparent pricing',
  subheadline: 'No hidden fees. No lock-in contracts. Cancel anytime.',
  plans: [
    { name:'Starter', price:499, billingPeriod:'/mo', description:'For small businesses and startups.', popular:false, features:['Up to 5 keywords','Monthly SEO audit','On-page optimization','5 backlinks/mo','Monthly reports','Email support'], cta:{label:'Get Started',href:'/contact'} },
    { name:'Professional', price:999, billingPeriod:'/mo', description:'For businesses serious about SEO.', popular:true, features:['Up to 20 keywords','Weekly SEO audits','Full optimization','20 backlinks/mo','4 blog posts/mo','Weekly reports','Priority support','Competitor analysis','Google Business Profile'], cta:{label:'Get Started',href:'/contact'} },
    { name:'Enterprise', price:2499, billingPeriod:'/mo', description:'For enterprises that demand results.', popular:false, features:['Unlimited keywords','Daily monitoring','Full technical SEO','50+ backlinks/mo','16 blog posts/mo','Real-time dashboard','Dedicated manager','Custom strategy','API access','SLA support'], cta:{label:'Contact Sales',href:'/contact'} },
  ],
};

export default function Pricing({ data }: { data?: any }) {
  const d = data || FALLBACK;
  const plans = d.plans || FALLBACK.plans;
  return (
    <section className="section-padding">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">Pricing</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">{d.headline || FALLBACK.headline}</h2>
          <p className="mt-4 text-muted-foreground">{d.subheadline || FALLBACK.subheadline}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan: any, i: number) => (
            <motion.div key={plan.name} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}
              className={`relative rounded-2xl border p-8 flex flex-col ${plan.popular?'border-primary bg-primary/5 shadow-lg scale-[1.02]':'border-border bg-card'}`}>
              {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold">MOST POPULAR</div>}
              <div className="mb-6">
                <h3 className="font-bold text-lg">{plan.name}</h3>
                {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">{plan.billingPeriod||'/mo'}</span>
                </div>
              </div>
              <ul className="space-y-3 flex-1 mb-8">
                {(plan.features||[]).map((f: string) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0 mt-0.5"/>
                    <span className="text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.cta?.href||'/contact'} className={`w-full flex items-center justify-center h-11 rounded-xl font-medium text-sm transition-all ${plan.popular?'bg-primary text-primary-foreground hover:bg-primary/90':'border border-border hover:bg-accent'}`}>
                {plan.cta?.label||'Get Started'}
              </Link>
            </motion.div>
          ))}
        </div>
        {d.addons?.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto">
            <h3 className="text-center font-semibold text-lg mb-6">Add-ons</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {d.addons.map((a: any) => (
                <div key={a.name} className="rounded-xl border border-border bg-card p-4 text-center">
                  <p className="font-semibold text-sm">{a.name}</p>
                  <p className="text-primary font-bold mt-1">${a.price}</p>
                  <p className="text-xs text-muted-foreground">{a.unit}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        <p className="text-center text-sm text-muted-foreground mt-8">Need custom pricing? <Link href="/contact" className="text-primary hover:underline font-medium">Talk to our team →</Link></p>
      </div>
    </section>
  );
}
