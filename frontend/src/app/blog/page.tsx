import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { formatDateShort, STATIC_DEMO_DATE, STATIC_DEMO_DATE_2, STATIC_DEMO_DATE_3, STATIC_DEMO_DATE_4 } from '@/utils/date';

export const revalidate = 300;
export const metadata: Metadata = {
  title: 'SEO Blog — Tips, Guides & Insights | SEO Platform',
  description: 'Read the latest SEO tips, strategies, and expert guides to help you rank higher on Google, drive qualified organic traffic, and grow your business online.',
  openGraph: {
    title: 'SEO Blog — Tips, Guides & Insights',
    description: 'Expert SEO tips, strategies, and guides to rank higher on Google and grow organic traffic.',
    images: ['/og-image.jpg'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SEO Blog — Tips, Guides & Insights',
    description: 'Expert SEO tips, strategies, and guides to rank higher on Google.',
    images: ['/og-image.jpg'],
  },
};

async function getBlogs(page=1, category?: string) {
  try {
    const p = new URLSearchParams({ page: String(page), limit:'12', status:'published' });
    if (category) p.set('category', category);
    const r = await api.get(`/v1/blogs?${p}`);
    return r.data?.data || { blogs:[], total:0, pages:0 };
  } catch { return { blogs: demoBlogs, total: demoBlogs.length, pages: 1 }; }
}

export default async function BlogPage({ searchParams }: { searchParams: { page?:string; category?:string } }) {
  const page = parseInt(searchParams.page||'1', 10);
  const { blogs, total, pages } = await getBlogs(page, searchParams.category);
  const items = blogs?.length ? blogs : demoBlogs;
  const featured = items[0];
  const rest = items.slice(1);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Blog",
        "name": "SEO Platform Blog",
        "description": "Expert SEO tips, strategies, and guides",
        "url": "https://seoplatform.com/blog",
        "publisher": { "@type": "Organization", "name": "SEO Platform", "logo": { "@type": "ImageObject", "url": "https://seoplatform.com/logo.svg" } }
      })}}/>
      <Navbar/>
      <main className="min-h-screen">
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">SEO <span className="gradient-text">Insights & Guides</span></h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Expert SEO tips and strategies to help you rank higher and grow organic traffic.</p>
          </div>
        </section>
        <div className="container max-w-7xl mx-auto px-4 py-12">
          {featured && (
            <Link href={`/blog/${featured.slug}`} className="group block mb-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-xl transition-all duration-300">
                <div className="h-64 lg:h-auto min-h-[280px] bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center">
                  <span className="text-6xl" role="img" aria-label="Blog post">📝</span>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <div className="flex gap-2 mb-4">
                    <span className="badge bg-primary/10 text-primary">Featured</span>
                    {featured.categories?.[0] && <span className="badge bg-muted text-muted-foreground">{featured.categories[0].name}</span>}
                  </div>
                  <h2 className="text-2xl lg:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">{featured.title}</h2>
                  <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-3">{featured.excerpt}</p>
                  <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{featured.readingTime} min read</span>
                    <span>•</span>
                    <span>{formatDateShort(featured.publishedAt||featured.createdAt)}</span>
                  </div>
                </div>
              </div>
            </Link>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((blog: any) => (
              <Link key={blog._id} href={`/blog/${blog.slug}`} className="group block h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="h-48 bg-gradient-to-br from-primary/5 to-purple-500/5 flex items-center justify-center">
                  <span className="text-4xl" role="img" aria-label="Article">📄</span>
                </div>
                <div className="p-5">
                  {blog.categories?.[0] && <span className="badge bg-primary/10 text-primary text-xs mb-3 inline-flex">{blog.categories[0].name}</span>}
                  <h3 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{blog.excerpt}</p>
                  <div className="mt-4 text-xs text-muted-foreground">{blog.readingTime} min read • {formatDateShort(blog.publishedAt||blog.createdAt)}</div>
                </div>
              </Link>
            ))}
          </div>
          {pages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-2">
              {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                <Link key={p} href={`/blog?page=${p}`} className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${p===page?'bg-primary text-primary-foreground':'border border-border hover:bg-accent'}`}>{p}</Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer/>
    </>
  );
}

const demoBlogs = [
  { _id:'1', title:'The Ultimate Guide to Technical SEO in 2025', slug:'technical-seo-guide-2025', excerpt:'Master Core Web Vitals, schema markup, and crawlability to dominate rankings.', readingTime:12, publishedAt:STATIC_DEMO_DATE, createdAt:STATIC_DEMO_DATE, categories:[{name:'Technical SEO'}] },
  { _id:'2', title:'How to Build High-Authority Backlinks That Work', slug:'build-high-authority-backlinks', excerpt:'Proven link building strategies to boost domain authority consistently.', readingTime:8, publishedAt:STATIC_DEMO_DATE_2, createdAt:STATIC_DEMO_DATE_2, categories:[{name:'Link Building'}] },
  { _id:'3', title:'Local SEO Strategy: Rank #1 in Google Maps Pack', slug:'local-seo-google-maps', excerpt:'Step-by-step tactics to dominate the local 3-pack and drive more calls.', readingTime:10, publishedAt:STATIC_DEMO_DATE_3, createdAt:STATIC_DEMO_DATE_3, categories:[{name:'Local SEO'}] },
  { _id:'4', title:'Core Web Vitals: Complete Optimization Guide', slug:'core-web-vitals-guide', excerpt:'Everything you need to know about LCP, FID, CLS and how to pass all thresholds.', readingTime:15, publishedAt:STATIC_DEMO_DATE_4, createdAt:STATIC_DEMO_DATE_4, categories:[{name:'Technical SEO'}] },
];