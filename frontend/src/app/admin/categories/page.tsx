'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, FolderOpen } from 'lucide-react';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';
import AdminModal from '@/components/admin/AdminModal';

const blank = () => ({ name:'',slug:'',description:'',type:'blog',order:0 });
const autoSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

export default function AdminCategoriesPage() {
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
    try { const r=await api.get(`/v1/categories?limit=100${search?`&search=${search}`:''}`); setItems(r.data?.data?.items||[]); }
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
      if (editing) { const r=await api.put(`/v1/categories/${editing._id}`,payload); setItems(p=>p.map(x=>x._id===editing._id?r.data?.data||payload:x)); dispatch(addToast({id:Date.now().toString(),title:'Updated',variant:'success'})); }
      else { const r=await api.post('/v1/categories',payload); setItems(p=>[...p,r.data?.data||payload]); dispatch(addToast({id:Date.now().toString(),title:'Created',variant:'success'})); }
      setModal(false);
    } catch(e: any) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:e?.response?.data?.message||'Save failed',variant:'destructive'})); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try { await api.delete(`/v1/categories/${id}`); setItems(p=>p.filter(x=>x._id!==id)); dispatch(addToast({id:Date.now().toString(),title:'Deleted',variant:'success'})); }
    catch { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Delete failed',variant:'destructive'})); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Categories</h1><p className="text-sm text-muted-foreground mt-0.5">Organize blog posts and content</p></div>
        <button onClick={openNew} className="btn-primary h-9 text-sm"><Plus className="h-4 w-4"/>Add Category</button>
      </div>
      <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search categories…" className="input-base pl-9 h-9 text-sm"/></div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {loading ? <div className="divide-y divide-border">{Array.from({length:5}).map((_,i)=><div key={i} className="px-4 py-3 flex gap-4 animate-pulse"><div className="h-4 flex-1 rounded bg-muted"/><div className="h-4 w-20 rounded bg-muted"/></div>)}</div> : (
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30"><th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th><th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Slug</th><th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Type</th><th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Description</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
            <tbody>
              {items.map((item,i)=>(
                <motion.tr key={item._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.03}} className="border-b border-border last:border-0 hover:bg-muted/20 group">
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground font-mono text-xs">{item.slug}</td>
                  <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.type}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-muted-foreground text-xs max-w-xs truncate">{item.description}</td>
                  <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={()=>openEdit(item)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors"><Edit className="h-3.5 w-3.5"/></button>
                    <button onClick={()=>handleDelete(item._id)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>
                  </div></td>
                </motion.tr>
              ))}
              {items.length===0&&<tr><td colSpan={5} className="py-16 text-center text-muted-foreground"><FolderOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/><p>No categories yet.</p><button onClick={openNew} className="mt-4 btn-primary text-sm">Add first category</button></td></tr>}
            </tbody>
          </table>
        )}
      </div>
      <AdminModal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Category':'New Category'} onSave={handleSave} saving={saving} size="md">
        <div className="space-y-4">
          <div><label className="block text-sm font-medium mb-1.5">Name *</label><input value={form.name} onChange={e=>{set('name',e.target.value);if(!editing)set('slug',autoSlug(e.target.value));}} className="input-base" placeholder="Technical SEO"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Slug</label><input value={form.slug} onChange={e=>set('slug',e.target.value)} className="input-base font-mono text-sm" placeholder="technical-seo"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Type</label><select value={form.type} onChange={e=>set('type',e.target.value)} className="input-base"><option value="blog">Blog</option><option value="service">Service</option><option value="project">Project</option></select></div>
          <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={2} className="input-base resize-none" placeholder="Brief description…"/></div>
          <div><label className="block text-sm font-medium mb-1.5">Order</label><input type="number" value={form.order} onChange={e=>set('order',+e.target.value)} className="input-base" min={0}/></div>
        </div>
      </AdminModal>
    </div>
  );
}
