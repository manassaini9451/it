'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FALLBACK = [
  { q:'How long does SEO take to show results?', a:'Most clients see initial improvements in 3–6 months. Significant, sustained results typically appear in 6–12 months depending on your competition, domain authority, and strategy.' },
  { q:'What makes SEO Platform different from other agencies?', a:'We combine AI-powered insights, technical expertise, and complete transparency. Every strategy is tied to measurable business outcomes — not vanity metrics.' },
  { q:'Do you guarantee #1 rankings?', a:'No ethical SEO agency can guarantee specific rankings. We guarantee measurable improvement in traffic, rankings, and conversions, backed by our proven track record across 2,500+ clients.' },
  { q:'How much does SEO cost?', a:'Our plans start at $499/month for startups. Enterprise packages start at $2,499/month. Every investment includes clear deliverables and measurable ROI targets.' },
  { q:'Do you work with any industry?', a:'Yes. We have deep expertise in e-commerce, SaaS, healthcare, legal, real estate, and finance. Strategies are customized for your specific industry.' },
  { q:'Can I cancel anytime?', a:'Absolutely. We do not require long-term contracts. You can pause or cancel with 30 days notice.' },
];

export default function Faq({ faqs }: { faqs?: any[] }) {
  const items = faqs?.length ? faqs : FALLBACK;
  const [open, setOpen] = useState<number|null>(null);

  return (
    <section className="section-padding">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-widest">FAQ</p>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold">Common questions answered</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-3">
          {items.map((faq: any, i: number) => (
            <motion.div key={i} initial={{opacity:0,y:10}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.05}}
              className="rounded-xl border border-border bg-card overflow-hidden">
              <button onClick={() => setOpen(open===i?null:i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left font-medium hover:bg-accent transition-colors">
                <span>{faq.q || faq.question}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${open===i?'rotate-180':''}`}/>
              </button>
              {open===i && (
                <div className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a || faq.answer}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({
          '@context':'https://schema.org','@type':'FAQPage',
          mainEntity: items.map((f: any) => ({ '@type':'Question', name: f.q||f.question, acceptedAnswer: {'@type':'Answer', text: f.a||f.answer} }))
        })}}/>
      </div>
    </section>
  );
}
