'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit, Trash2, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';
import { formatDateShort } from '@/utils/date';

export default function AdminProjectsPage() {
  const dispatch = useAppDispatch();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.get(`/v1/projects?limit=50${search ? `&search=${search}` : ''}`); setItems(r.data?.data?.items || []); }
    catch { setItems([]); } finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this case study?')) return;
    try { await api.delete(`/v1/projects/${id}`); setItems(p => p.filter(x => x._id !== id)); dispatch(addToast({ id: Date.now().toString(), title: 'Deleted', variant: 'success' })); }
    catch { dispatch(addToast({ id: Date.now().toString(), title: 'Error', description: 'Delete failed', variant: 'destructive' })); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Case Studies</h1><p className="text-sm text-muted-foreground mt-0.5">Portfolio and client success stories</p></div>
        <Link href="/admin/projects/new" className="btn-primary h-9 text-sm"><Plus className="h-4 w-4"/>New Case Study</Link>
      </div>
      <div className="relative max-w-xs"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects…" className="input-base pl-9 h-9 text-sm"/></div>
      {loading ? <div className="space-y-3 animate-pulse">{Array.from({length:4}).map((_,i)=><div key={i} className="h-24 rounded-xl bg-muted"/>)}</div> : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Client</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Industry</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((item, i) => (
                <motion.tr key={item._id} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.04}} className="border-b border-border last:border-0 hover:bg-muted/20 group">
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-1">{item.title}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">/{item.slug}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{item.client}</td>
                  <td className="px-4 py-3 hidden lg:table-cell"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{item.industry}</span></td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{formatDateShort(item.createdAt)}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${item.status==='published'?'bg-green-500/10 text-green-600':'bg-yellow-500/10 text-yellow-600'}`}>{item.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/portfolio/${item.slug}`} target="_blank" className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors"><ExternalLink className="h-3.5 w-3.5"/></Link>
                      <Link href={`/admin/projects/${item._id}/edit`} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors"><Edit className="h-3.5 w-3.5"/></Link>
                      <button onClick={()=>handleDelete(item._id)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {items.length === 0 && <tr><td colSpan={6} className="py-16 text-center text-muted-foreground"><TrendingUp className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/><p>No case studies yet.</p><Link href="/admin/projects/new" className="mt-4 inline-flex btn-primary text-sm">Add first case study</Link></td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
