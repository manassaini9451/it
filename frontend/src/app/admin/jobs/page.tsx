'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Mail, Phone, Eye, Users, TrendingUp, CheckCircle2, AlertCircle, Download } from 'lucide-react';
import api from '@/lib/api';
import { formatDateShort } from '@/utils/date';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';

const STATUS_CONFIG: Record<string,{label:string;color:string}> = {
  new:{label:'New',color:'text-blue-600 bg-blue-500/10'},
  contacted:{label:'Contacted',color:'text-purple-600 bg-purple-500/10'},
  qualified:{label:'Qualified',color:'text-yellow-600 bg-yellow-500/10'},
  proposal:{label:'Proposal',color:'text-orange-600 bg-orange-500/10'},
  won:{label:'Won',color:'text-green-600 bg-green-500/10'},
  lost:{label:'Lost',color:'text-red-600 bg-red-500/10'},
};

export default function AdminLeadsPage() {
  const dispatch = useAppDispatch();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState<any>(null);
  const limit = 15;

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({page:String(page),limit:String(limit)});
      if (search) params.set('search',search);
      if (status) params.set('status',status);
      const res = await api.get(`/v1/leads?${params}`);
      setLeads(res.data?.data?.leads || []);
      setTotal(res.data?.data?.total || 0);
    } catch { setLeads([]); setTotal(0); }
    finally { setLoading(false); }
  }, [page, search, status]);

  useEffect(()=>{ fetchLeads(); },[fetchLeads]);

  const updateStatus = async (id: string, s: string) => {
    try {
      await api.patch(`/v1/leads/${id}`,{status:s});
      setLeads(prev=>prev.map(l=>l._id===id?{...l,status:s}:l));
      dispatch(addToast({id:Date.now().toString(),title:'Updated',description:'Lead status updated',variant:'success'}));
    } catch { dispatch(addToast({id:Date.now().toString(),title:'Error',description:'Update failed',variant:'destructive'})); }
  };

  const stats = [
    {label:'Total Leads',value:total,icon:Users,color:'bg-blue-500'},
    {label:'New',value:leads.filter(l=>l.status==='new').length,icon:AlertCircle,color:'bg-purple-500'},
    {label:'Won',value:leads.filter(l=>l.status==='won').length,icon:CheckCircle2,color:'bg-green-500'},
    {label:'Conversion',value:`${total>0?Math.round((leads.filter(l=>l.status==='won').length/total)*100):0}%`,icon:TrendingUp,color:'bg-orange-500'},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Leads & CRM</h1><p className="text-sm text-muted-foreground mt-0.5">Manage and track your sales pipeline</p></div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-4 flex items-center gap-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors"><Download className="h-4 w-4"/>Export CSV</button>
          <button className="btn-primary h-9 text-sm"><Plus className="h-4 w-4"/>Add Lead</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s,i)=>(
          <motion.div key={s.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon className="h-4 w-4 text-white"/></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold mt-0.5">{s.value}</p></div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search leads..." className="input-base pl-9 h-9 text-sm w-56"/>
        </div>
        <select value={status} onChange={e=>{setStatus(e.target.value);setPage(1);}} className="h-9 px-3 rounded-lg border border-border bg-background text-sm">
          <option value="">All status</option>
          {Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Lead</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Contact</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Service</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">Score</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Date</th>
              <th className="text-right font-medium text-muted-foreground px-4 py-3">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i)=>(
                <tr key={i} className="border-b border-border">{Array.from({length:7}).map((_,j)=><td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse"/></td>)}</tr>
              )) : leads.map(lead=>{
                const sc = STATUS_CONFIG[lead.status]||STATUS_CONFIG.new;
                return (
                  <tr key={lead._id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">{lead.firstName[0]}{lead.lastName[0]}</div>
                        <div><p className="font-medium">{lead.firstName} {lead.lastName}</p><p className="text-xs text-muted-foreground">{lead.company||'—'}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3"/>{lead.email}</div>
                        {lead.phone&&<div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3"/>{lead.phone}</div>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{lead.service||'—'}</td>
                    <td className="px-4 py-3">
                      <select value={lead.status} onChange={e=>updateStatus(lead._id,e.target.value)} className={`badge border cursor-pointer text-xs font-medium ${sc.color} bg-transparent`}>
                        {Object.entries(STATUS_CONFIG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${lead.score>=70?'bg-green-500':lead.score>=40?'bg-yellow-500':'bg-red-500'}`} style={{width:`${lead.score}%`}}/>
                        </div>
                        <span className="text-xs font-medium">{lead.score}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{formatDateShort(lead.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={()=>setSelected(lead)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground transition-colors ml-auto opacity-0 group-hover:opacity-100"><Eye className="h-3.5 w-3.5"/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && leads.length===0 && <div className="py-16 text-center"><Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3"/><p className="text-muted-foreground">No leads found</p></div>}
        </div>
        {total > limit && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-sm text-muted-foreground">Showing {((page-1)*limit)+1}–{Math.min(page*limit,total)} of {total}</p>
            <div className="flex gap-1.5">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-accent disabled:opacity-40">Previous</button>
              <button onClick={()=>setPage(p=>p+1)} disabled={page*limit>=total} className="h-8 px-3 rounded-lg border border-border text-sm hover:bg-accent disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Lead detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30 backdrop-blur-sm" onClick={()=>setSelected(null)}>
          <motion.div initial={{x:'100%'}} animate={{x:0}} exit={{x:'100%'}} transition={{type:'spring',damping:25,stiffness:300}}
            className="w-full max-w-md h-full bg-card border-l border-border overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold">Lead Details</h2>
              <button onClick={()=>setSelected(null)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">✕</button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-lg">{selected.firstName[0]}{selected.lastName[0]}</div>
                <div><h3 className="text-lg font-semibold">{selected.firstName} {selected.lastName}</h3><p className="text-sm text-muted-foreground">{selected.company||'No company'}</p></div>
              </div>
              {[{label:'Email',value:selected.email,href:`mailto:${selected.email}`},{label:'Phone',value:selected.phone||'—',href:selected.phone?`tel:${selected.phone}`:undefined},{label:'Website',value:selected.website||'—'},{label:'Service',value:selected.service||'—'},{label:'Budget',value:selected.budget||'—'},{label:'Source',value:selected.source||'direct'}].map(f=>(
                <div key={f.label}><p className="text-xs text-muted-foreground">{f.label}</p>
                  {f.href?<a href={f.href} className="text-sm font-medium text-primary hover:underline">{f.value}</a>:<p className="text-sm font-medium">{f.value}</p>}
                </div>
              ))}
              {selected.message&&<div><p className="text-xs text-muted-foreground mb-1">Message</p><p className="text-sm text-muted-foreground bg-muted rounded-lg p-3">{selected.message}</p></div>}
              <div className="flex gap-3 pt-2">
                <a href={`mailto:${selected.email}`} className="flex-1 btn-primary h-9 text-sm justify-center"><Mail className="h-4 w-4"/>Email Lead</a>
                {selected.phone&&<a href={`tel:${selected.phone}`} className="flex-1 btn-outline h-9 text-sm justify-center"><Phone className="h-4 w-4"/>Call</a>}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}