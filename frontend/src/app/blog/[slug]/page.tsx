import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { Clock, Eye, ArrowLeft, Tag, Calendar } from 'lucide-react';

export const revalidate = 300;

async function getBlog(slug: string) {
  try { const r = await api.get(`/v1/blogs/${slug}`); return r.data?.data; }
  catch { return null; }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug);
  if (!blog) return { title: 'Post Not Found' };
  const seo = blog.seo || {};
  return {
    title: seo.metaTitle || blog.title,
    description: seo.metaDescription || blog.excerpt,
    openGraph: { type:'article', title: seo.ogTitle||blog.title, description: seo.ogDescription||blog.excerpt, images: blog.featuredImage ? [blog.featuredImage] : [] },
    twitter: { card:'summary_large_image', title: blog.title, description: blog.excerpt },
    alternates: { canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blog.slug}` },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);
  if (!blog) notFound();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const articleSchema = {
    '@context':'https://schema.org','@type':'Article',
    headline: blog.title, description: blog.excerpt,
    author: { '@type':'Person', name: blog.author ? `${blog.author.firstName} ${blog.author.lastName}` : 'SEO Platform' },
    publisher: { '@type':'Organization', name:'SEO Platform', logo:{ '@type':'ImageObject', url:`${siteUrl}/logo.png` } },
    datePublished: blog.publishedAt, dateModified: blog.updatedAt,
    mainEntityOfPage: { '@type':'WebPage', '@id':`${siteUrl}/blog/${blog.slug}` },
  };

  return (
    <>
      <Navbar/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleSchema)}}/>
      <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{position:1,name:'Home',item:siteUrl},{position:2,name:'Blog',item:`${siteUrl}/blog`},{position:3,name:blog.title,item:`${siteUrl}/blog/${blog.slug}`}]})}}/>
      <main className="min-h-screen py-12">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground line-clamp-1">{blog.title}</span>
          </nav>

          <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4"/>Back to Blog
          </Link>

          <header className="mb-10">
            <div className="flex flex-wrap gap-2 mb-4">
              {blog.categories?.map((cat: any) => (
                <Link key={cat._id} href={`/blog?category=${cat.slug}`} className="badge bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{cat.name}</Link>
              ))}
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">{blog.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{blog.excerpt}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {blog.author && (
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">{blog.author.firstName?.[0]}{blog.author.lastName?.[0]}</div>
                  <span className="font-medium text-foreground text-xs">{blog.author.firstName} {blog.author.lastName}</span>
                </div>
              )}
              <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5"/><time dateTime={blog.publishedAt}>{new Date(blog.publishedAt||blog.createdAt).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})}</time></div>
              <div className="flex items-center gap-1"><Clock className="h-3.5 w-3.5"/><span>{blog.readingTime||5} min read</span></div>
              <div className="flex items-center gap-1"><Eye className="h-3.5 w-3.5"/><span>{(blog.viewCount||0).toLocaleString()} views</span></div>
            </div>
          </header>

          {/* Featured image placeholder */}
          {!blog.featuredImage && (
            <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center mb-10 border border-border">
              <span className="text-6xl">📝</span>
            </div>
          )}

          {/* Content */}
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-blockquote:border-l-primary"
            dangerouslySetInnerHTML={{ __html: blog.content || `<p>This is where the full blog post content will appear. The content is managed from the admin panel and rendered here with full HTML support.</p><h2>Why Technical SEO Matters</h2><p>Technical SEO forms the foundation of any successful search strategy. Without proper technical implementation, even the best content struggles to rank.</p><h2>Key Areas to Focus On</h2><ul><li>Site speed and Core Web Vitals</li><li>Mobile-first indexing</li><li>Schema markup implementation</li><li>Crawlability and indexation</li></ul>` }}
          />

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border">
              <p className="text-sm font-medium mb-3 flex items-center gap-2"><Tag className="h-4 w-4"/>Tags</p>
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag: any) => (
                  <Link key={tag._id} href={`/blog?tag=${tag.slug}`} className="badge border border-border text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors">#{tag.name}</Link>
                ))}
              </div>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 p-6 rounded-2xl border border-border bg-muted/20 text-center">
            <p className="font-semibold mb-3">Found this helpful? Share it!</p>
            <div className="flex items-center justify-center gap-3">
              {[
                { label:'Twitter/X', href:`https://twitter.com/intent/tweet?url=${siteUrl}/blog/${blog.slug}&text=${encodeURIComponent(blog.title)}` },
                { label:'LinkedIn', href:`https://www.linkedin.com/sharing/share-offsite/?url=${siteUrl}/blog/${blog.slug}` },
              ].map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">{s.label}</a>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer/>
    </>
  );
}
