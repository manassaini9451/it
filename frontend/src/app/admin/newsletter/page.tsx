'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Mail, Users, UserCheck, UserMinus, Download, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';
import { formatDateShort } from '@/utils/date';

export default function AdminNewsletterPage() {
  const dispatch = useAppDispatch();
  const [items, setItems]  = useState<any[]>([]);
  const [stats, setStats]  = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [total, setTotal]     = useState(0);
  const [pages, setPages]     = useState(1);
  const limit = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listR, statsR] = await Promise.allSettled([
        api.get(`/v1/newsletter?page=${page}&limit=${limit}${search ? `&search=${search}` : ''}`),
        api.get('/v1/newsletter/stats'),
      ]);
      if (listR.status === 'fulfilled') {
        const d = listR.value.data?.data;
        setItems(d?.items || []);
        setTotal(d?.total || 0);
        setPages(d?.pages || 1);
      }
      if (statsR.status === 'fulfilled') setStats(statsR.value.data?.data);
    } catch { setItems([]); } finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleUnsubscribe = async (email: string) => {
    try {
      await api.post('/v1/newsletter/unsubscribe', { email });
      setItems(prev => prev.map(x => x.email === email ? { ...x, status: 'unsubscribed' } : x));
      dispatch(addToast({ id: Date.now().toString(), title: 'Unsubscribed', variant: 'success' }));
    } catch { dispatch(addToast({ id: Date.now().toString(), title: 'Error', variant: 'destructive' })); }
  };

  const exportCsv = () => {
    const rows = [['Email','Name','Status','Source','Date'], ...items.map(i => [i.email, i.name||'', i.status, i.source||'', formatDateShort(i.createdAt)])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv])); a.download = 'subscribers.csv'; a.click();
  };

  const statCards = [
    { label: 'Total Subscribers', value: stats?.total ?? total, icon: Users,      color: 'bg-blue-500' },
    { label: 'Active',            value: stats?.active ?? '—', icon: UserCheck,   color: 'bg-green-500' },
    { label: 'Unsubscribed',      value: stats?.unsubscribed ?? '—', icon: UserMinus, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Newsletter</h1><p className="text-sm text-muted-foreground mt-0.5">Manage email subscribers</p></div>
        <button onClick={exportCsv} className="h-9 px-4 flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm font-medium">
          <Download className="h-4 w-4"/>Export CSV
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
            className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon className="h-4 w-4 text-white"/></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-2xl font-bold mt-0.5">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search by email…" className="input-base pl-9 h-9 text-sm"/>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Email</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Name</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Source</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({length: 8}).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  {Array.from({length: 6}).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse"/></td>)}
                </tr>
              ))
            ) : items.map((item, i) => (
              <motion.tr key={item._id || i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:i*0.02}}
                className="border-b border-border last:border-0 hover:bg-muted/20 group">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {item.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="font-medium">{item.email}</span>
                  </div>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{item.name || '—'}</td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {item.source && <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize">{item.source}</span>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{formatDateShort(item.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'active' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.status === 'active' && (
                      <button onClick={() => handleUnsubscribe(item.email)} className="h-7 px-2 rounded-md flex items-center gap-1 text-xs hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <UserMinus className="h-3.5 w-3.5"/>Unsub
                      </button>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
            {!loading && items.length === 0 && (
              <tr><td colSpan={6} className="py-16 text-center text-muted-foreground">
                <Mail className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30"/>
                <p>No subscribers yet.</p>
                <p className="text-xs mt-1">Add a newsletter sign-up form to your website to collect subscribers.</p>
              </td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">Showing {((page-1)*limit)+1}–{Math.min(page*limit,total)} of {total}</p>
            <div className="flex gap-1.5">
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-accent disabled:opacity-40 transition-colors">Previous</button>
              <button onClick={() => setPage(p => p+1)} disabled={page*limit>=total} className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-accent disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
