'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Tag } from 'lucide-react';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';
import AdminModal from '@/components/admin/AdminModal';

const blank = () => ({ name:'',slug:'',description:'' });
const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function AdminTagsPage() {
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
    try { const r=await api.get(`/v1/tags?limit=200${search?`&search=${search}`:''}`); setItems(r.data?.data?.items||[]); }
    catch { setItems([]); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openNew  = () => { setEditing(null); setForm(blank()); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({...blank(),...item}); setModal(true); };
  const set = (k: string, v: any) => setForm((f: any) => ({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.name.trim()) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Name required',variant:'destructive'})); return; }
    setSaving(true);
    try {
      const payload = {...form, slug: form.slug||autoSlug(form.name)};
      if (editing) { const r=await api.put(`/v1/tags/${editing._id}`,payload); setItems(p=>p.map(x=>x._id===editing._id?r.data?.data||payload:x)); dispatch(addToast({id:Date.now().toString(),title:'Updated',variant:'success'})); }
      else { const r=await api.post('/v1/tags',payload); setItems(p=>[...p,r.data?.data||payload]); dispatch(addToast({id:Date.now().toString(),title:'Created',variant:'success'})); }
      setModal(false);
    } catch(e: any) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:e?.response?.data?.message||'Save failed',variant:'destructive'})); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this tag?')) return;
    try { await api.delete(`/v1/tags/${id}`); setItems(p=>p.filter(x=>x._id!==id)); dispatch(addToast({id:Date.now().toString(),title:'Deleted',variant:'success'})); }
    catch { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Delete failed',variant:'destructive'})); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Tags</h1><p className="text-sm text-muted-foreground mt-0.5">{items.length} tags total</p></div>
        <button onClick={openNew} className="btn-primary h-9 text-sm"><Plus className="h-4 w-4"/>Add Tag</button>
      </div>
      <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tags…" className="input-base pl-9 h-9 text-sm"/></div>
      {loading ? <div className="flex flex-wrap gap-2 animate-pulse">{Array.from({length:10}).map((_,i)=><div key={i} className="h-8 w-24 rounded-full bg-muted"/>)}</div> : (
        <div>
          {items.length>0 ? (
            <div className="flex flex-wrap gap-2">
              {items.map((item,i)=>(
                <motion.div key={item._id} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:i*0.02}} className="group flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full border border-border bg-card hover:border-primary/30 transition-colors">
                  <span className="text-sm font-medium">{item.name}</span>
                  <span className="text-xs text-muted-foreground font-mono">/{item.slug}</span>
                  <div className="flex gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>openEdit(item)} className="h-5 w-5 rounded flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors"><Edit className="h-3 w-3"/></button>
                    <button onClick={()=>handleDelete(item._id)} className="h-5 w-5 rounded flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3 w-3"/></button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center rounded-xl border border-border bg-card">
              <Tag className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3"/>
              <p className="text-muted-foreground">No tags yet.</p>
              <button onClick={openNew} className="mt-4 btn-primary text-sm">Add first tag</button>
            </div>
          )}
        </div>
      )}
      <AdminModal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Tag':'New Tag'} onSave={handleSave} saving={saving} size="sm">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Name *</label><input value={form.name} onChange={e=>{set('name',e.target.value);if(!editing)set('slug',autoSlug(e.target.value));}} className="input-base" placeholder="Core Web Vitals" autoFocus/></div>
          <div><label className="block text-sm font-medium mb-1.5">Slug</label><input value={form.slug} onChange={e=>set('slug',e.target.value)} className="input-base font-mono text-sm" placeholder="core-web-vitals"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Description</label><input value={form.description} onChange={e=>set('description',e.target.value)} className="input-base text-sm" placeholder="Optional description…"/></div>
        </div>
      </AdminModal>
    </div>
  );
}
