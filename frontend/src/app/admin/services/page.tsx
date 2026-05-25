'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Briefcase } from 'lucide-react';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';
import AdminModal from '@/components/admin/AdminModal';

const COLOR_OPTIONS = [
  { label:'Blue',   value:'from-blue-500 to-cyan-500' },
  { label:'Green',  value:'from-green-500 to-emerald-500' },
  { label:'Purple', value:'from-purple-500 to-violet-500' },
  { label:'Orange', value:'from-orange-500 to-amber-500' },
  { label:'Red',    value:'from-red-500 to-pink-500' },
  { label:'Yellow', value:'from-yellow-500 to-orange-500' },
  { label:'Indigo', value:'from-indigo-500 to-purple-500' },
];

const blank = () => ({ title:'',slug:'',excerpt:'',content:'',icon:'Search',color:'from-blue-500 to-cyan-500',features:[''],status:'published',order:0,seo:{metaTitle:'',metaDescription:''} });
const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function AdminServicesPage() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>(blank());

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get(`/v1/services?limit=50${search?`&search=${search}`:''}`); setItems(r.data?.data?.services||[]); }
    catch { setItems([]); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openNew  = () => { setEditing(null); setForm(blank()); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({...item,features:item.features?.length?item.features:[''],seo:item.seo||{metaTitle:'',metaDescription:''}}); setModal(true); };
  const set  = (k: string, v: any) => setForm((f: any) => ({...f,[k]:v}));
  const setSeo = (k: string, v: any) => setForm((f: any) => ({...f,seo:{...f.seo,[k]:v}}));
  const setFeat = (i: number, v: string) => setForm((f: any) => { const a=[...f.features]; a[i]=v; return {...f,features:a}; });
  const addFeat = () => setForm((f: any) => ({...f,features:[...f.features,'']}));
  const rmFeat  = (i: number) => setForm((f: any) => ({...f,features:f.features.filter((_: any,j: number)=>j!==i)}));

  const handleSave = async () => {
    if (!form.title.trim()) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Title required',variant:'destructive'})); return; }
    setSaving(true);
    try {
      const payload = {...form,features:form.features.filter((x: string)=>x.trim()),slug:form.slug||autoSlug(form.title)};
      if (editing) { const r=await api.put(`/v1/services/${editing._id}`,payload); setItems(p=>p.map(x=>x._id===editing._id?r.data?.data||payload:x)); dispatch(addToast({id:Date.now().toString(),title:'Updated',variant:'success'})); }
      else { const r=await api.post('/v1/services',payload); setItems(p=>[...p,r.data?.data||payload]); dispatch(addToast({id:Date.now().toString(),title:'Created',variant:'success'})); }
      setModal(false);
    } catch(e: any) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:e?.response?.data?.message||'Save failed',variant:'destructive'})); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    try { await api.delete(`/v1/services/${id}`); setItems(p=>p.filter(x=>x._id!==id)); dispatch(addToast({id:Date.now().toString(),title:'Deleted',variant:'success'})); }
    catch { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Delete failed',variant:'destructive'})); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Services</h1><p className="text-sm text-muted-foreground mt-0.5">Manage service offerings shown on the website</p></div>
        <button onClick={openNew} className="btn-primary h-9 text-sm"><Plus className="h-4 w-4"/>Add Service</button>
      </div>
      <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search services…" className="input-base pl-9 h-9 text-sm"/></div>
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">{Array.from({length:6}).map((_,i)=><div key={i} className="h-48 rounded-xl bg-muted"/>)}</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item,i)=>(
            <motion.div key={item._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${item.color||'from-blue-500 to-cyan-500'} flex items-center justify-center`}><Briefcase className="h-5 w-5 text-white"/></div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>openEdit(item)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors"><Edit className="h-3.5 w-3.5"/></button>
                  <button onClick={()=>handleDelete(item._id)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.excerpt}</p>
              {item.features?.length>0&&<div className="mt-3 flex flex-wrap gap-1">{item.features.slice(0,3).map((f: string)=><span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{f}</span>)}{item.features.length>3&&<span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{item.features.length-3}</span>}</div>}
              <div className="mt-3 flex items-center justify-between"><span className={`text-xs px-2 py-0.5 rounded-full ${item.status==='published'?'bg-green-500/10 text-green-600':'bg-yellow-500/10 text-yellow-600'}`}>{item.status}</span><span className="text-xs text-muted-foreground">Order: {item.order}</span></div>
            </motion.div>
          ))}
          {items.length===0&&<div className="col-span-3 py-20 text-center"><Briefcase className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3"/><p className="text-muted-foreground">No services yet.</p><button onClick={openNew} className="mt-4 btn-primary text-sm">Add first service</button></div>}
        </div>
      )}
      <AdminModal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Service':'New Service'} onSave={handleSave} saving={saving} size="xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Title *</label><input value={form.title} onChange={e=>{set('title',e.target.value);if(!editing)set('slug',autoSlug(e.target.value));}} className="input-base" placeholder="SEO Services"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Slug</label><input value={form.slug} onChange={e=>set('slug',e.target.value)} className="input-base font-mono text-sm" placeholder="seo-services"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className="input-base"><option value="published">Published</option><option value="draft">Draft</option></select></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Excerpt</label><textarea value={form.excerpt} onChange={e=>set('excerpt',e.target.value)} rows={2} className="input-base resize-none" placeholder="Short description…"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Card Color</label><select value={form.color} onChange={e=>set('color',e.target.value)} className="input-base">{COLOR_OPTIONS.map(c=><option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
          <div><label className="block text-sm font-medium mb-1.5">Display Order</label><input type="number" value={form.order} onChange={e=>set('order',+e.target.value)} className="input-base" min={0}/></div>
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Features</label>
            <div className="space-y-2">
              {(form.features||['']).map((f: string,i: number)=>(
                <div key={i} className="flex gap-2"><input value={f} onChange={e=>setFeat(i,e.target.value)} className="input-base flex-1 text-sm" placeholder={`Feature ${i+1}`}/><button type="button" onClick={()=>rmFeat(i)} className="h-10 w-10 rounded-lg border border-border flex items-center justify-center hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors shrink-0"><Trash2 className="h-3.5 w-3.5"/></button></div>
              ))}
              <button type="button" onClick={addFeat} className="flex items-center gap-1.5 text-sm text-primary hover:underline"><Plus className="h-3.5 w-3.5"/>Add feature</button>
            </div>
          </div>
          <div className="md:col-span-2"><label className="block text-sm font-medium mb-1.5">Content (HTML)</label><textarea value={form.content||''} onChange={e=>set('content',e.target.value)} rows={4} className="input-base resize-y font-mono text-xs" placeholder="<h2>About this service</h2><p>…</p>"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Meta Title</label><input value={form.seo?.metaTitle||''} onChange={e=>setSeo('metaTitle',e.target.value)} className="input-base text-sm" placeholder="SEO meta title…"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Meta Description</label><textarea value={form.seo?.metaDescription||''} onChange={e=>setSeo('metaDescription',e.target.value)} rows={2} className="input-base resize-none text-sm" placeholder="SEO meta description…"/></div>
        </div>
      </AdminModal>
    </div>
  );
}
