'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { formatDateShort, STATIC_DEMO_DATE, STATIC_DEMO_DATE_2, STATIC_DEMO_DATE_3 } from '@/utils/date';

const defaults = [
  { _id:'1', title:'The Ultimate Guide to Technical SEO in 2025', slug:'technical-seo-guide-2025', excerpt:'Master Core Web Vitals, schema markup, and crawlability to dominate rankings.', readingTime:12, createdAt:STATIC_DEMO_DATE, categories:[{name:'Technical SEO'}] },
  { _id:'2', title:'How to Build High-Authority Backlinks That Work', slug:'build-high-authority-backlinks', excerpt:'Proven link building strategies used by top agencies to boost domain authority.', readingTime:8, createdAt:STATIC_DEMO_DATE_2, categories:[{name:'Link Building'}] },
  { _id:'3', title:'Local SEO Strategy: Rank #1 in Google Maps', slug:'local-seo-google-maps', excerpt:'Step-by-step tactics to dominate the local 3-pack and drive more calls.', readingTime:10, createdAt:STATIC_DEMO_DATE_3, categories:[{name:'Local SEO'}] },
];

export default function BlogPreview({ blogs }: { blogs?: any[] }) {
  const items = blogs?.length ? blogs : defaults;
  return (
    <section className="section-padding bg-muted/20">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-12">
          <div><p className="text-sm font-medium text-primary uppercase tracking-widest">SEO Blog</p><h2 className="mt-3 text-3xl sm:text-4xl font-bold">Latest SEO insights</h2></div>
          <Link href="/blog" className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline">View all<ArrowRight className="h-3.5 w-3.5"/></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((blog,i)=>(
            <motion.article key={blog._id} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*0.1}}>
              <Link href={`/blog/${blog.slug}`} className="group block h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center"><span className="text-4xl">📝</span></div>
                <div className="p-5">
                  {blog.categories?.[0]&&<span className="badge bg-primary/10 text-primary text-xs mb-3 inline-flex">{blog.categories[0].name}</span>}
                  <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                  <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{blog.readingTime} min read</span><span>•</span><span>{formatDateShort(blog.createdAt)}</span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
