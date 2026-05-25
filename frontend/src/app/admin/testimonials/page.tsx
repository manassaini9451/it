'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Star } from 'lucide-react';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';
import AdminModal from '@/components/admin/AdminModal';

const blank = () => ({ name:'',role:'',company:'',content:'',avatar:'',rating:5,trafficIncrease:'',status:'published',order:0 });

export default function AdminTestimonialsPage() {
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
    try { const r=await api.get(`/v1/testimonials?limit=50${search?`&search=${search}`:''}`); setItems(r.data?.data?.items||[]); }
    catch { setItems([]); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const openNew  = () => { setEditing(null); setForm(blank()); setModal(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({...blank(),...item}); setModal(true); };
  const set = (k: string, v: any) => setForm((f: any) => ({...f,[k]:v}));

  const handleSave = async () => {
    if (!form.name.trim()||!form.content.trim()) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Name and content required',variant:'destructive'})); return; }
    setSaving(true);
    try {
      if (editing) { const r=await api.put(`/v1/testimonials/${editing._id}`,form); setItems(p=>p.map(x=>x._id===editing._id?r.data?.data||form:x)); dispatch(addToast({id:Date.now().toString(),title:'Updated',variant:'success'})); }
      else { const r=await api.post('/v1/testimonials',form); setItems(p=>[...p,r.data?.data||form]); dispatch(addToast({id:Date.now().toString(),title:'Created',variant:'success'})); }
      setModal(false);
    } catch(e: any) { dispatch(addToast({id:Date.now().toString(),title:'Error',description:e?.response?.data?.message||'Save failed',variant:'destructive'})); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try { await api.delete(`/v1/testimonials/${id}`); setItems(p=>p.filter(x=>x._id!==id)); dispatch(addToast({id:Date.now().toString(),title:'Deleted',variant:'success'})); }
    catch { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Delete failed',variant:'destructive'})); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Testimonials</h1><p className="text-sm text-muted-foreground mt-0.5">Manage client reviews and success stories</p></div>
        <button onClick={openNew} className="btn-primary h-9 text-sm"><Plus className="h-4 w-4"/>Add Testimonial</button>
      </div>
      <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search testimonials…" className="input-base pl-9 h-9 text-sm"/></div>
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">{Array.from({length:6}).map((_,i)=><div key={i} className="h-48 rounded-xl bg-muted"/>)}</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item,i)=>(
            <motion.div key={item._id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}} className="group rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md transition-all flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-0.5">{Array.from({length:item.rating||5}).map((_,j)=><Star key={j} className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400"/>)}</div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>openEdit(item)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors"><Edit className="h-3.5 w-3.5"/></button>
                  <button onClick={()=>handleDelete(item._id)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground italic flex-1 line-clamp-3">"{item.content}"</p>
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">{item.avatar||item.name?.slice(0,2).toUpperCase()}</div>
                  <div><p className="text-sm font-semibold">{item.name}</p><p className="text-xs text-muted-foreground">{item.role}{item.company?`, ${item.company}`:''}</p></div>
                </div>
                {item.trafficIncrease&&<span className="text-sm font-bold text-green-500">{item.trafficIncrease}</span>}
              </div>
              <div className="mt-2"><span className={`text-xs px-2 py-0.5 rounded-full ${item.status==='published'?'bg-green-500/10 text-green-600':'bg-yellow-500/10 text-yellow-600'}`}>{item.status}</span></div>
            </motion.div>
          ))}
          {items.length===0&&<div className="col-span-3 py-20 text-center"><Star className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3"/><p className="text-muted-foreground">No testimonials yet.</p><button onClick={openNew} className="mt-4 btn-primary text-sm">Add first testimonial</button></div>}
        </div>
      )}
      <AdminModal open={modal} onClose={()=>setModal(false)} title={editing?'Edit Testimonial':'New Testimonial'} onSave={handleSave} saving={saving} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Client Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} className="input-base" placeholder="Sarah Johnson"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Role</label><input value={form.role} onChange={e=>set('role',e.target.value)} className="input-base" placeholder="CEO"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Company</label><input value={form.company} onChange={e=>set('company',e.target.value)} className="input-base" placeholder="TechStartup Inc"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Avatar Initials</label><input value={form.avatar} onChange={e=>set('avatar',e.target.value)} className="input-base uppercase" placeholder="SJ" maxLength={2}/></div>
            <div><label className="block text-sm font-medium mb-1.5">Traffic Increase</label><input value={form.trafficIncrease} onChange={e=>set('trafficIncrease',e.target.value)} className="input-base" placeholder="+420%"/></div>
            <div><label className="block text-sm font-medium mb-1.5">Rating (1–5)</label><input type="number" value={form.rating} onChange={e=>set('rating',Math.min(5,Math.max(1,+e.target.value)))} className="input-base" min={1} max={5}/></div>
            <div><label className="block text-sm font-medium mb-1.5">Status</label><select value={form.status} onChange={e=>set('status',e.target.value)} className="input-base"><option value="published">Published</option><option value="draft">Draft</option></select></div>
            <div><label className="block text-sm font-medium mb-1.5">Display Order</label><input type="number" value={form.order} onChange={e=>set('order',+e.target.value)} className="input-base" min={0}/></div>
          </div>
          <div><label className="block text-sm font-medium mb-1.5">Testimonial Content *</label><textarea value={form.content} onChange={e=>set('content',e.target.value)} rows={4} className="input-base resize-none" placeholder="What the client said about your service…"/></div>
        </div>
      </AdminModal>
    </div>
  );
}
