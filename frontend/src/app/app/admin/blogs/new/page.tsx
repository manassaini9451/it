'use client';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blogs" className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"><ArrowLeft className="h-4 w-4"/></Link>
        <div><h1 className="text-2xl font-bold">New Blog Post</h1><p className="text-sm text-muted-foreground">Create a new SEO-optimized blog post</p></div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-muted-foreground text-sm">Blog editor with full CMS functionality would be here. Connect to the backend POST /api/v1/blogs endpoint.</p>
        <div className="mt-4 space-y-4">
          {['Title','Slug','Excerpt'].map(f=><div key={f}><label className="text-sm font-medium mb-1.5 block">{f}</label><input className="input-base" placeholder={`Enter ${f.toLowerCase()}...`}/></div>)}
          <div><label className="text-sm font-medium mb-1.5 block">Content</label><textarea rows={10} className="input-base resize-none" placeholder="Write your blog content here..."/></div>
          <button className="btn-primary h-10 text-sm">Publish Post</button>
        </div>
      </div>
    </div>
  );
}
