'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Trash2, Plus } from 'lucide-react';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';

const blank = () => ({ title:'',slug:'',description:'',client:'',industry:'',challenge:'',solution:'',results:[''],metrics:{trafficBefore:0,trafficAfter:0,keywordsBefore:0,keywordsAfter:0,timeframe:''},status:'published',seo:{metaTitle:'',metaDescription:''} });
const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function ProjectForm({ projectId }: { projectId?: string }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isEdit = !!projectId;
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [form, setForm] = useState<any>(blank());

  useEffect(() => {
    if (!projectId) return;
    api.get(`/v1/projects/${projectId}`).then(r => {
      const p = r.data?.data;
      if (p) setForm({ ...blank(), ...p, results: p.results?.length ? p.results : [''], seo: p.seo || { metaTitle:'', metaDescription:'' } });
    }).catch(() => {}).finally(() => setLoading(false));
  }, [projectId]);

  const set    = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const setM   = (k: string, v: any) => setForm((f: any) => ({ ...f, metrics: { ...f.metrics, [k]: v } }));
  const setSeo = (k: string, v: any) => setForm((f: any) => ({ ...f, seo: { ...f.seo, [k]: v } }));
  const setRes = (i: number, v: string) => setForm((f: any) => { const a=[...f.results]; a[i]=v; return {...f,results:a}; });
  const addRes = () => setForm((f: any) => ({ ...f, results: [...f.results, ''] }));
  const rmRes  = (i: number) => setForm((f: any) => ({ ...f, results: f.results.filter((_: any,j: number)=>j!==i) }));

  const handleSave = async () => {
    if (!form.title.trim()) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Title required',variant:'destructive'})); return; }
    setSaving(true);
    try {
      const payload = { ...form, results: form.results.filter((x: string)=>x.trim()), slug: form.slug||autoSlug(form.title) };
      if (isEdit) { await api.put(`/v1/projects/${projectId}`,payload); dispatch(addToast({id:Date.now().toString(),title:'Updated',variant:'success'})); }
      else { await api.post('/v1/projects',payload); dispatch(addToast({id:Date.now().toString(),title:'Created',variant:'success'})); router.push('/admin/projects'); }
    } catch(e: any) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:e?.response?.data?.message||'Save failed',variant:'destructive'})); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!projectId||!confirm('Delete this case study?')) return;
    try { await api.delete(`/v1/projects/${projectId}`); router.push('/admin/projects'); dispatch(addToast({id:Date.now().toString(),title:'Deleted',variant:'success'})); }
    catch { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Delete failed',variant:'destructive'})); }
  };

  if (loading) return <div className="space-y-4 animate-pulse max-w-4xl"><div className="h-8 w-64 rounded-lg bg-muted"/><div className="h-48 rounded-xl bg-muted"/></div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/projects" className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors"><ArrowLeft className="h-4 w-4"/></Link>
          <h1 className="text-2xl font-bold">{isEdit ? 'Edit Case Study' : 'New Case Study'}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isEdit && <button onClick={handleDelete} className="h-9 px-3 flex items-center gap-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 text-sm transition-colors"><Trash2 className="h-4 w-4"/>Delete</button>}
          <button onClick={handleSave} disabled={saving} className="btn-primary h-9 text-sm">{saving?<Loader2 className="h-4 w-4 animate-spin"/>:<Save className="h-4 w-4"/>}{saving?'Saving…':'Save'}</button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div><label className="block text-sm font-medium mb-1.5">Title *</label><input value={form.title} onChange={e=>{set('title',e.target.value);if(!isEdit)set('slug',autoSlug(e.target.value));}} className="input-base text-lg font-medium" placeholder="Client Name — Result Achieved"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Slug</label><input value={form.slug} onChange={e=>set('slug',e.target.value)} className="input-base font-mono text-sm" placeholder="client-seo-case-study"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={3} className="input-base resize-none" placeholder="Brief overview of the case study…"/></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Challenge & Solution</h3>
            <div><label className="block text-sm font-medium mb-1.5">Challenge</label><textarea value={form.challenge||''} onChange={e=>set('challenge',e.target.value)} rows={3} className="input-base resize-none" placeholder="What problem did the client face?"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Solution</label><textarea value={form.solution||''} onChange={e=>set('solution',e.target.value)} rows={3} className="input-base resize-none" placeholder="What did you do to solve it?"/></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Results</h3>
            {form.results.map((r: string, i: number) => (
              <div key={i} className="flex gap-2"><input value={r} onChange={e=>setRes(i,e.target.value)} className="input-base flex-1 text-sm" placeholder="+420% organic traffic in 6 months"/><button type="button" onClick={()=>rmRes(i)} className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive text-muted-foreground shrink-0 transition-colors"><Trash2 className="h-3.5 w-3.5"/></button></div>
            ))}
            <button type="button" onClick={addRes} className="flex items-center gap-1.5 text-sm text-primary hover:underline"><Plus className="h-3.5 w-3.5"/>Add result</button>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-medium mb-1">Traffic Before</label><input type="number" value={form.metrics?.trafficBefore||0} onChange={e=>setM('trafficBefore',+e.target.value)} className="input-base text-sm"/></div>
              <div><label className="block text-xs font-medium mb-1">Traffic After</label><input type="number" value={form.metrics?.trafficAfter||0} onChange={e=>setM('trafficAfter',+e.target.value)} className="input-base text-sm"/></div>
              <div><label className="block text-xs font-medium mb-1">Keywords Before</label><input type="number" value={form.metrics?.keywordsBefore||0} onChange={e=>setM('keywordsBefore',+e.target.value)} className="input-base text-sm"/></div>
              <div><label className="block text-xs font-medium mb-1">Keywords After</label><input type="number" value={form.metrics?.keywordsAfter||0} onChange={e=>setM('keywordsAfter',+e.target.value)} className="input-base text-sm"/></div>
              <div className="col-span-2"><label className="block text-xs font-medium mb-1">Timeframe</label><input value={form.metrics?.timeframe||''} onChange={e=>setM('timeframe',e.target.value)} className="input-base text-sm" placeholder="6 months"/></div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="font-semibold">Details</h3>
            <div><label className="block text-sm font-medium mb-1.5">Client</label><input value={form.client||''} onChange={e=>set('client',e.target.value)} className="input-base text-sm" placeholder="TechStartup Inc"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Industry</label><input value={form.industry||''} onChange={e=>set('industry',e.target.value)} className="input-base text-sm" placeholder="SaaS / Technology"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className="input-base"><option value="published">Published</option><option value="draft">Draft</option></select></div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold">SEO</h3>
            <div><label className="block text-xs font-medium mb-1">Meta Title</label><input value={form.seo?.metaTitle||''} onChange={e=>setSeo('metaTitle',e.target.value)} className="input-base text-sm" placeholder="Case Study SEO title"/></div>
            <div><label className="block text-xs font-medium mb-1">Meta Description</label><textarea value={form.seo?.metaDescription||''} onChange={e=>setSeo('metaDescription',e.target.value)} rows={3} className="input-base resize-none text-sm" placeholder="Case study meta description…"/></div>
          </div>
        </div>
      </div>
    </div>
  );
}
