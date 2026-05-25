'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, FileText, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { formatDateShort, STATIC_DEMO_DATE, STATIC_DEMO_DATE_2, STATIC_DEMO_DATE_3, STATIC_DEMO_DATE_4 } from '@/utils/date';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';

export default function AdminBlogsPage() {
  const dispatch = useAppDispatch();
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      const res = await api.get(`/v1/blogs?${params}`);
      setBlogs(res.data?.data?.blogs || demoBlogs);
      setTotal(res.data?.data?.total || demoBlogs.length);
    } catch { setBlogs(demoBlogs); setTotal(demoBlogs.length); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(() => { fetchBlogs(); }, [fetchBlogs]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/v1/blogs/${id}`);
      setBlogs(prev => prev.filter(b => b._id !== id));
      dispatch(addToast({ id: Date.now().toString(), title:'Deleted', description:'Blog post deleted', variant:'success' }));
    } catch { dispatch(addToast({ id: Date.now().toString(), title:'Error', description:'Delete failed', variant:'destructive' })); }
  };

  const statusCls: Record<string,string> = {
    published:'text-green-600 bg-green-500/10', draft:'text-yellow-600 bg-yellow-500/10',
    scheduled:'text-blue-600 bg-blue-500/10', archived:'text-gray-600 bg-gray-500/10',
  };
  const stats = [
    { label:'Total', value: total, icon: FileText, color:'bg-blue-500' },
    { label:'Published', value: blogs.filter(b=>b.status==='published').length, icon: CheckCircle, color:'bg-green-500' },
    { label:'Drafts', value: blogs.filter(b=>b.status==='draft').length, icon: Clock, color:'bg-yellow-500' },
    { label:'Total Views', value: blogs.reduce((a,b)=>a+(b.viewCount||0),0).toLocaleString(), icon: TrendingUp, color:'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Blog Posts</h1><p className="text-sm text-muted-foreground mt-0.5">Manage your blog content and SEO</p></div>
        <Link href="/admin/blogs/new" className="btn-primary h-9 text-sm"><Plus className="h-4 w-4"/>New Post</Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon className="h-4 w-4 text-white"/></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold mt-0.5">{s.value}</p></div>
          </motion.div>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search posts..." className="input-base pl-9 h-9 text-sm"/>
        </div>
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="h-9 px-3 rounded-lg border border-border bg-background text-sm">
          <option value="">All status</option>
          {['published','draft','scheduled','archived'].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Title</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Status</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Author</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Views</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">SEO Score</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">Date</th>
              <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=>(
                <tr key={i} className="border-b border-border">{Array.from({length:7}).map((_,j)=><td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse"/></td>)}</tr>
              )) : blogs.map(blog => {
                const score = blog.seo?.seoScore || 0;
                return (
                  <tr key={blog._id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3">
                      <p className="font-medium truncate max-w-xs">{blog.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">/{blog.slug}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`badge ${statusCls[blog.status]||statusCls.draft}`}>{blog.status}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground">{blog.author?.firstName} {blog.author?.lastName}</td>
                    <td className="px-4 py-3 hidden lg:table-cell font-medium">{(blog.viewCount||0).toLocaleString()}</td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${score>=70?'bg-green-500':score>=40?'bg-yellow-500':'bg-red-500'}`} style={{width:`${score}%`}}/>
                        </div>
                        <span className="text-xs font-medium">{score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">{formatDateShort(blog.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/blog/${blog.slug}`} target="_blank" className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Eye className="h-3.5 w-3.5"/></Link>
                        <Link href={`/admin/blogs/${blog._id}/edit`} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Edit className="h-3.5 w-3.5"/></Link>
                        <button onClick={()=>handleDelete(blog._id)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && blogs.length===0 && (
            <div className="py-16 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3"/>
              <p className="text-muted-foreground">No blog posts found</p>
              <Link href="/admin/blogs/new" className="mt-4 inline-flex btn-primary text-sm">Create your first post</Link>
            </div>
          )}
        </div>
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">Showing {((page-1)*limit)+1}–{Math.min(page*limit,total)} of {total}</p>
            <div className="flex gap-1.5">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-accent disabled:opacity-40 transition-colors">Previous</button>
              <button onClick={()=>setPage(p=>p+1)} disabled={page*limit>=total} className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-accent disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const demoBlogs = [
  { _id:'1', title:'The Ultimate Guide to Technical SEO in 2025', slug:'technical-seo-guide', status:'published', author:{firstName:'John',lastName:'Doe'}, viewCount:12840, readingTime:12, seo:{seoScore:88}, createdAt:STATIC_DEMO_DATE },
  { _id:'2', title:'How to Build High-Authority Backlinks', slug:'build-backlinks', status:'published', author:{firstName:'Jane',lastName:'Smith'}, viewCount:8420, readingTime:8, seo:{seoScore:72}, createdAt:STATIC_DEMO_DATE_2 },
  { _id:'3', title:'Local SEO Strategy: Rank #1 in Google Maps', slug:'local-seo', status:'draft', author:{firstName:'Bob',lastName:'Wilson'}, viewCount:0, readingTime:10, seo:{seoScore:45}, createdAt:STATIC_DEMO_DATE_3 },
  { _id:'4', title:'Core Web Vitals Optimization Guide', slug:'core-web-vitals', status:'scheduled', author:{firstName:'Alice',lastName:'Johnson'}, viewCount:0, readingTime:15, seo:{seoScore:91}, createdAt:STATIC_DEMO_DATE_4 },
];
