'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Save, Loader2, ArrowLeft, Eye, Globe, Tag, Settings, ChevronDown, ChevronUp, X, Plus } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';

interface Props { blogId?: string; }

const STATUSES = ['draft', 'published', 'scheduled', 'archived'];

export default function BlogEditor({ blogId }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isEdit = !!blogId;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [seoOpen, setSeoOpen] = useState(false);

  const [form, setForm] = useState({
    title: '', slug: '', excerpt: '', content: '',
    status: 'draft', isFeatured: false,
    categories: [] as string[], tags: [] as string[],
    publishedAt: '',
    seo: { metaTitle: '', metaDescription: '', focusKeyword: '', seoScore: 50 },
  });

  // Load categories + tags
  useEffect(() => {
    Promise.allSettled([
      api.get('/v1/categories?limit=100'),
      api.get('/v1/tags?limit=200'),
    ]).then(([catR, tagR]) => {
      if (catR.status === 'fulfilled') setCategories(catR.value.data?.data?.items || []);
      if (tagR.status === 'fulfilled') setTags(tagR.value.data?.data?.items || []);
    });
  }, []);

  // Load blog if editing
  useEffect(() => {
    if (!blogId) return;
    api.get(`/v1/blogs/id/${blogId}`).then(r => {
      const b = r.data?.data;
      if (b) setForm({
        title: b.title || '',
        slug: b.slug || '',
        excerpt: b.excerpt || '',
        content: b.content || '',
        status: b.status || 'draft',
        isFeatured: b.isFeatured || false,
        categories: (b.categories || []).map((c: any) => c._id || c),
        tags: (b.tags || []).map((t: any) => t._id || t),
        publishedAt: b.publishedAt ? new Date(b.publishedAt).toISOString().slice(0, 16) : '',
        seo: { metaTitle: b.seo?.metaTitle || '', metaDescription: b.seo?.metaDescription || '', focusKeyword: b.seo?.focusKeyword || '', seoScore: b.seo?.seoScore || 50 },
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [blogId]);

  // Auto-generate slug from title
  const handleTitleChange = (val: string) => {
    setForm(f => ({
      ...f, title: val,
      slug: f.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  };

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }));
  const setSeo = (key: string, val: any) => setForm(f => ({ ...f, seo: { ...f.seo, [key]: val } }));

  const toggleArr = (key: 'categories' | 'tags', id: string) => {
    setForm(f => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x: string) => x !== id) : [...f[key], id],
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      dispatch(addToast({ id: Date.now().toString(), title: 'Validation Error', description: 'Title is required', variant: 'destructive' }));
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        publishedAt: form.status === 'published' ? (form.publishedAt || new Date().toISOString()) : form.publishedAt,
      };
      if (isEdit) {
        await api.put(`/v1/blogs/${blogId}`, payload);
        dispatch(addToast({ id: Date.now().toString(), title: 'Saved!', description: 'Blog post updated', variant: 'success' }));
      } else {
        await api.post('/v1/blogs', payload);
        dispatch(addToast({ id: Date.now().toString(), title: 'Created!', description: 'Blog post created', variant: 'success' }));
        router.push('/admin/blogs');
      }
    } catch (err: any) {
      dispatch(addToast({ id: Date.now().toString(), title: 'Error', description: err?.response?.data?.message || 'Save failed', variant: 'destructive' }));
    } finally { setSaving(false); }
  };

  const seoScore = form.seo.seoScore;

  if (loading) return (
    <div className="space-y-4 animate-pulse max-w-5xl">
      <div className="h-8 w-64 rounded-lg bg-muted"/>
      <div className="h-48 rounded-xl bg-muted"/>
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/blogs" className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4"/>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{isEdit ? 'Edit Post' : 'New Post'}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{isEdit ? `Editing: ${form.title}` : 'Create a new blog post'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {form.slug && (
            <Link href={`/blog/${form.slug}`} target="_blank" className="h-9 px-3 flex items-center gap-1.5 rounded-lg border border-border hover:bg-accent transition-colors text-sm text-muted-foreground">
              <Eye className="h-4 w-4"/>Preview
            </Link>
          )}
          <select value={form.status} onChange={e => set('status', e.target.value)} className="h-9 px-3 rounded-lg border border-border bg-background text-sm font-medium">
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <button onClick={handleSave} disabled={saving} className="btn-primary h-9 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content — 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Title */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title <span className="text-destructive">*</span></label>
              <input
                value={form.title}
                onChange={e => handleTitleChange(e.target.value)}
                placeholder="Enter post title…"
                className="input-base text-lg font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">/blog/</span>
                <input
                  value={form.slug}
                  onChange={e => set('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="post-url-slug"
                  className="input-base flex-1"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={e => set('excerpt', e.target.value)}
                placeholder="Brief summary of the post (shown in listings and meta description)…"
                rows={3}
                className="input-base resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">{form.excerpt.length}/160 characters</p>
            </div>
          </div>

          {/* Content */}
          <div className="rounded-xl border border-border bg-card p-5">
            <label className="block text-sm font-medium mb-1.5">Content <span className="text-destructive">*</span></label>
            <p className="text-xs text-muted-foreground mb-3">Write HTML or plain content. A rich text editor can be integrated separately.</p>
            <textarea
              value={form.content}
              onChange={e => set('content', e.target.value)}
              placeholder="<h2>Introduction</h2><p>Start writing your blog post content here…</p>"
              rows={20}
              className="input-base resize-y font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.content.split(/\s+/).filter(Boolean).length} words · ~{Math.ceil(form.content.split(/\s+/).filter(Boolean).length / 200)} min read
            </p>
          </div>
        </div>

        {/* Sidebar — 1/3 */}
        <div className="space-y-4">
          {/* Publish settings */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><Settings className="h-4 w-4 text-primary"/>Publish</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input-base">
                {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            {(form.status === 'published' || form.status === 'scheduled') && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Publish Date</label>
                <input type="datetime-local" value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)} className="input-base"/>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className={`relative h-5 w-9 rounded-full transition-colors ${form.isFeatured ? 'bg-primary' : 'bg-muted'}`} onClick={() => set('isFeatured', !form.isFeatured)}>
                <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-4' : 'translate-x-0.5'}`}/>
              </div>
              <span className="text-sm font-medium">Featured post</span>
            </label>
          </div>

          {/* Categories */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><Globe className="h-4 w-4 text-primary"/>Categories</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map(cat => (
                <label key={cat._id} className="flex items-center gap-2 cursor-pointer py-0.5">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(cat._id)}
                    onChange={() => toggleArr('categories', cat._id)}
                    className="rounded border-border"
                  />
                  <span className="text-sm">{cat.name}</span>
                </label>
              ))}
              {categories.length === 0 && <p className="text-xs text-muted-foreground">No categories yet. <Link href="/admin/categories" className="text-primary hover:underline">Add categories →</Link></p>}
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><Tag className="h-4 w-4 text-primary"/>Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag._id}
                  type="button"
                  onClick={() => toggleArr('tags', tag._id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${form.tags.includes(tag._id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}
                >
                  {tag.name}
                </button>
              ))}
              {tags.length === 0 && <p className="text-xs text-muted-foreground">No tags yet. <Link href="/admin/tags" className="text-primary hover:underline">Add tags →</Link></p>}
            </div>
          </div>

          {/* SEO */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setSeoOpen(o => !o)}
              className="w-full flex items-center justify-between p-5 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">SEO Settings</span>
                <div className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${seoScore >= 70 ? 'bg-green-500' : seoScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}/>
                  <span className="text-xs text-muted-foreground">{seoScore}/100</span>
                </div>
              </div>
              {seoOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground"/> : <ChevronDown className="h-4 w-4 text-muted-foreground"/>}
            </button>
            {seoOpen && (
              <div className="px-5 pb-5 space-y-3 border-t border-border pt-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Focus Keyword</label>
                  <input value={form.seo.focusKeyword} onChange={e => setSeo('focusKeyword', e.target.value)} placeholder="primary keyword" className="input-base text-sm"/>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Meta Title</label>
                  <input value={form.seo.metaTitle} onChange={e => setSeo('metaTitle', e.target.value)} placeholder="SEO title (60 chars)" className="input-base text-sm"/>
                  <p className="text-xs text-muted-foreground mt-0.5">{form.seo.metaTitle.length}/60</p>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Meta Description</label>
                  <textarea value={form.seo.metaDescription} onChange={e => setSeo('metaDescription', e.target.value)} placeholder="SEO description (160 chars)" rows={3} className="input-base text-sm resize-none"/>
                  <p className="text-xs text-muted-foreground mt-0.5">{form.seo.metaDescription.length}/160</p>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">SEO Score (manual)</label>
                  <input type="range" min={0} max={100} value={form.seo.seoScore} onChange={e => setSeo('seoScore', +e.target.value)} className="w-full"/>
                  <div className="flex justify-between text-xs text-muted-foreground mt-0.5"><span>0</span><span className="font-medium">{form.seo.seoScore}</span><span>100</span></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}