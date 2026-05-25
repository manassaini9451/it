'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';

const TYPES = ['Full-time','Part-time','Contract','Internship','Remote'];
const DEPTS = ['SEO','Content','Technical SEO','Link Building','PPC','Social Media','Engineering','Design','Sales','Operations'];

const blank = () => ({ title:'',slug:'',department:'',location:'',type:'Full-time',salary:'',description:'',requirements:'',benefits:'',status:'published' });
const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function JobForm({ jobId }: { jobId?: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isEdit = !!jobId;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState<any>(blank());

  useEffect(() => {
    if (!jobId) return;
    api.get(`/v1/jobs/${jobId}`).then(r => {
      const j = r.data?.data;
      if (j) setForm({ ...blank(), ...j });
    }).catch(()=>{}).finally(() => setLoading(false));
  }, [jobId]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title.trim()) { dispatch(addToast({ id: Date.now().toString(), title: 'Error', description: 'Title required', variant: 'destructive' })); return; }
    setSaving(true);
    try {
      const payload = { ...form, slug: form.slug || autoSlug(form.title) };
      if (isEdit) {
        await api.put(`/v1/jobs/${jobId}`, payload);
        dispatch(addToast({ id: Date.now().toString(), title: 'Updated', variant: 'success' }));
      } else {
        await api.post('/v1/jobs', payload);
        dispatch(addToast({ id: Date.now().toString(), title: 'Job posted', variant: 'success' }));
        router.push('/admin/jobs');
      }
    } catch (e: any) {
      dispatch(addToast({ id: Date.now().toString(), title: 'Error', description: e?.response?.data?.message || 'Save failed', variant: 'destructive' }));
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!jobId || !confirm('Delete this job posting?')) return;
    try {
      await api.delete(`/v1/jobs/${jobId}`);
      router.push('/admin/jobs');
      dispatch(addToast({ id: Date.now().toString(), title: 'Deleted', variant: 'success' }));
    } catch { dispatch(addToast({ id: Date.now().toString(), title: 'Error', description: 'Delete failed', variant: 'destructive' })); }
  };

  if (loading) return <div className="space-y-4 animate-pulse max-w-4xl"><div className="h-8 w-64 rounded-lg bg-muted"/><div className="h-48 rounded-xl bg-muted"/></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/jobs" className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"><ArrowLeft className="h-4 w-4"/></Link>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Job' : 'New Job Posting'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && (
            <button onClick={handleDelete} className="h-9 px-3 flex items-center gap-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-sm transition-colors">
              <Trash2 className="h-4 w-4"/>Delete
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary h-9 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Job Title *</label>
              <input value={form.title} onChange={e => { set('title', e.target.value); if (!isEdit) set('slug', autoSlug(e.target.value)); }} className="input-base text-lg font-medium" placeholder="Senior SEO Strategist"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <input value={form.slug} onChange={e => set('slug', e.target.value)} className="input-base font-mono text-sm" placeholder="senior-seo-strategist"/>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Job Description</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Description (HTML)</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={8} className="input-base resize-y font-mono text-sm" placeholder="<p>We are looking for…</p><h3>What You'll Do</h3><ul><li>...</li></ul>"/>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Requirements</h3>
            <textarea value={form.requirements} onChange={e => set('requirements', e.target.value)} rows={5} className="input-base resize-y font-mono text-sm" placeholder="<ul><li>5+ years experience</li>...</ul>"/>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Benefits</h3>
            <textarea value={form.benefits} onChange={e => set('benefits', e.target.value)} rows={5} className="input-base resize-y font-mono text-sm" placeholder="<ul><li>Competitive salary</li>...</ul>"/>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Position Details</h3>
            <div>
              <label className="block text-sm font-medium mb-1.5">Department</label>
              <select value={form.department} onChange={e => set('department', e.target.value)} className="input-base">
                <option value="">Select department</option>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)} className="input-base text-sm" placeholder="San Francisco, CA (Hybrid)"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Employment Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)} className="input-base">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Salary Range</label>
              <input value={form.salary} onChange={e => set('salary', e.target.value)} className="input-base text-sm" placeholder="$80,000 – $110,000"/>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)} className="input-base">
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
