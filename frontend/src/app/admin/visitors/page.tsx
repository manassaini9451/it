'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, Globe, Monitor, Smartphone, Tablet,
  RefreshCw, Activity, MapPin, Clock, TrendingUp,
  ChevronDown, ChevronUp, Link as LinkIcon, Download, X, FileDown,
} from 'lucide-react';
import api from '@/lib/api';
import { formatDateShort } from '@/utils/date';

const COLORS = ['#6366f1','#8b5cf6','#a855f7','#c084fc','#e879f9','#f472b6'];

function deviceIcon(type: string) {
  if (type === 'mobile') return <Smartphone className="h-3.5 w-3.5"/>;
  if (type === 'tablet') return <Tablet className="h-3.5 w-3.5"/>;
  return <Monitor className="h-3.5 w-3.5"/>;
}

function BrowserBadge({ browser }: { browser?: string }) {
  if (!browser) return <span className="text-muted-foreground">—</span>;
  return <span className="font-medium">{browser}</span>;
}

function OSBadge({ os }: { os?: string }) {
  if (!os) return <span className="text-muted-foreground">—</span>;
  const color =
    os === 'Windows' ? 'bg-blue-500/10 text-blue-600'
    : os === 'macOS'   ? 'bg-gray-500/10 text-gray-600'
    : os === 'Android' ? 'bg-green-500/10 text-green-600'
    : os === 'iOS'     ? 'bg-purple-500/10 text-purple-600'
    : 'bg-muted text-muted-foreground';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{os}</span>;
}

// ── Download Modal ─────────────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function DownloadModal({ onClose }: { onClose: () => void }) {
  const now = new Date();
  const [mode, setMode]         = useState<'month'|'range'>('month');
  const [year, setYear]         = useState(now.getFullYear());
  const [month, setMonth]       = useState(now.getMonth()); // 0-based
  const [fromDate, setFromDate] = useState(now.toISOString().slice(0,10));
  const [toDate, setToDate]     = useState(now.toISOString().slice(0,10));
  const [loading, setLoading]   = useState(false);

  const years = Array.from({ length: 3 }, (_, i) => now.getFullYear() - i);

  const download = async () => {
    setLoading(true);
    try {
      let from: string, to: string;

      if (mode === 'month') {
        const start = new Date(year, month, 1);
        const end   = new Date(year, month + 1, 0); // last day of month
        from = start.toISOString().slice(0, 10);
        to   = end.toISOString().slice(0, 10);
      } else {
        from = fromDate;
        to   = toDate;
      }

      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/v1/visitors/export?from=${from}&to=${to}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `visitors_${from}_to_${to}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      onClose();
    } catch (e) {
      alert('Download failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}/>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileDown className="h-5 w-5 text-primary"/>
            </div>
            <div>
              <h2 className="font-semibold text-lg">Export Visitors</h2>
              <p className="text-xs text-muted-foreground">Download as CSV file</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="h-4 w-4"/>
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-5">
          {(['month','range'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                mode === m ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}>
              {m === 'month' ? 'By Month' : 'Custom Range'}
            </button>
          ))}
        </div>

        {mode === 'month' ? (
          <div className="space-y-4">
            {/* Year */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Year</label>
              <div className="flex gap-2">
                {years.map(y => (
                  <button key={y} onClick={() => setYear(y)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      year === y ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-accent'
                    }`}>
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Month grid */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Month</label>
              <div className="grid grid-cols-4 gap-2">
                {MONTHS.map((m, i) => {
                  const isFuture = year === now.getFullYear() && i > now.getMonth();
                  return (
                    <button key={m} onClick={() => !isFuture && setMonth(i)}
                      disabled={isFuture}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        month === i && !isFuture
                          ? 'bg-primary text-primary-foreground border-primary'
                          : isFuture
                          ? 'opacity-30 cursor-not-allowed border-border'
                          : 'border-border hover:bg-accent'
                      }`}>
                      {m.slice(0,3)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Will export: <span className="font-medium text-foreground">{MONTHS[month]} {year}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">From</label>
                <input
                  type="date"
                  value={fromDate}
                  max={toDate}
                  onChange={e => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">To</label>
                <input
                  type="date"
                  value={toDate}
                  min={fromDate}
                  max={now.toISOString().slice(0,10)}
                  onChange={e => setToDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Will export: <span className="font-medium text-foreground">{fromDate}</span> → <span className="font-medium text-foreground">{toDate}</span>
            </div>
          </div>
        )}

        {/* CSV columns info */}
        <div className="mt-4 rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground font-medium mb-1.5">CSV includes:</p>
          <div className="flex flex-wrap gap-1">
            {['IP','Country','City','Browser','OS','Device','Landing Page','Page Views','Type','Referrer','First Visit','Last Seen','Pages Visited'].map(col => (
              <span key={col} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{col}</span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium hover:bg-accent transition-colors">
            Cancel
          </button>
          <button
            onClick={download}
            disabled={loading}
            className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <><RefreshCw className="h-4 w-4 animate-spin"/> Exporting...</>
            ) : (
              <><Download className="h-4 w-4"/> Download CSV</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Expandable visitor row ─────────────────────────────────────────────────
function VisitorRow({ v }: { v: any }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className="border-t border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => setOpen(o => !o)}>
        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {open ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
            {v.ip || '—'}
          </div>
        </td>
        <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{[v.city,v.country].filter(Boolean).join(', ')||'—'}</td>
        <td className="px-4 py-3 hidden lg:table-cell text-xs"><BrowserBadge browser={v.browser}/></td>
        <td className="px-4 py-3 hidden xl:table-cell text-xs"><OSBadge os={v.os}/></td>
        <td className="px-4 py-3 hidden lg:table-cell">
          <div className="flex items-center gap-1 text-xs text-muted-foreground capitalize">{deviceIcon(v.deviceType)}<span>{v.deviceType||'desktop'}</span></div>
        </td>
        <td className="px-4 py-3 font-mono text-xs max-w-[140px] truncate">{v.landingPage||'/'}</td>
        <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{formatDateShort(v.createdAt)}</td>
        <td className="px-4 py-3 text-right font-medium">{v.pageViews||1}</td>
        <td className="px-4 py-3 hidden md:table-cell text-center">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${v.isReturning?'bg-purple-500/10 text-purple-600':'bg-blue-500/10 text-blue-600'}`}>
            {v.isReturning?'Returning':'New'}
          </span>
        </td>
      </tr>
      <AnimatePresence>
        {open && (
          <tr className="border-t border-border/30 bg-muted/10">
            <td colSpan={9} className="px-6 py-4">
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Session Info</p>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">Session ID</span><span className="font-mono truncate max-w-[160px]">{v.sessionId||'—'}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">IP</span><span className="font-mono">{v.ip||'—'}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">Last Seen</span><span>{v.lastSeenAt?new Date(v.lastSeenAt).toLocaleString():'—'}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">First Visit</span><span>{v.createdAt?new Date(v.createdAt).toLocaleString():'—'}</span></div>
                </div>
                <div className="space-y-1.5">
                  <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Device & Browser</p>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">Browser</span><span>{v.browser||'—'}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">OS</span><span>{v.os||'—'}</span></div>
                  <div className="flex gap-2"><span className="text-muted-foreground w-20">Device</span><span className="capitalize">{v.deviceType||'desktop'}</span></div>
                  {v.referrer&&(
                    <div className="flex gap-2"><span className="text-muted-foreground w-20">Referrer</span>
                      <a href={v.referrer} target="_blank" rel="noopener noreferrer" className="text-primary underline truncate max-w-[160px] flex items-center gap-1">
                        <LinkIcon className="h-3 w-3 flex-shrink-0"/>{v.referrer}
                      </a>
                    </div>
                  )}
                  {v.utm&&Object.keys(v.utm).length>0&&(
                    <div className="flex gap-2"><span className="text-muted-foreground w-20">UTM</span>
                      <span className="font-mono">{Object.entries(v.utm).map(([k,val])=>`${k}=${val}`).join(', ')}</span>
                    </div>
                  )}
                </div>
                {v.pageHistory?.length>0&&(
                  <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
                    <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">Page History ({v.pageHistory.length})</p>
                    <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                      {v.pageHistory.map((ph:any,idx:number)=>(
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-muted-foreground w-4 text-right">{idx+1}.</span>
                          <span className="font-mono flex-1 truncate">{ph.url}</span>
                          <span className="text-muted-foreground flex-shrink-0">{ph.enteredAt?new Date(ph.enteredAt).toLocaleTimeString():''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {v.userAgent&&(
                  <div className="space-y-1 md:col-span-2 lg:col-span-3">
                    <p className="font-semibold text-muted-foreground uppercase tracking-wide text-[10px]">User Agent</p>
                    <p className="font-mono text-[10px] text-muted-foreground break-all">{v.userAgent}</p>
                  </div>
                )}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function AdminVisitorsPage() {
  const [tab, setTab]           = useState<'live'|'all'|'summary'>('summary');
  const [data, setData]         = useState<any>(null);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [active, setActive]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [pages, setPages]       = useState(1);
  const [refreshing, setRefreshing]   = useState(false);
  const [showDownload, setShowDownload] = useState(false);

  const fetchSummary = useCallback(async (silent=false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try { const res = await api.get('/v1/visitors/summary'); setData(res.data?.data||demoSummary); }
    catch { setData(demoSummary); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  const fetchAll = useCallback(async (p=1) => {
    setLoading(true);
    try {
      const res = await api.get(`/v1/visitors?page=${p}&limit=20`);
      const d = res.data?.data;
      setVisitors(d?.visitors||[]); setTotal(d?.total||0); setPages(d?.pages||1);
    } catch { setVisitors([]); setTotal(0); setPages(1); }
    finally { setLoading(false); }
  }, []);

  const fetchActive = useCallback(async (silent=false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try { const res = await api.get('/v1/visitors/active?minutes=5'); setActive(res.data?.data?.visitors||[]); }
    catch { setActive([]); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    if (tab==='summary') fetchSummary();
    else if (tab==='all') fetchAll(page);
    else fetchActive();
  }, [tab, page, fetchSummary, fetchAll, fetchActive]);

  useEffect(() => {
    if (tab!=='live') return;
    const id = setInterval(()=>fetchActive(true), 15000);
    return ()=>clearInterval(id);
  }, [tab, fetchActive]);

  const d = data || demoSummary;
  const statCards = [
    { label:'Total Visitors', value:d.total?.toLocaleString(),    icon:Eye,        color:'bg-blue-500'   },
    { label:'This Month',     value:d.thisMonth?.toLocaleString(), icon:TrendingUp, color:'bg-purple-500' },
    { label:'This Week',      value:d.thisWeek?.toLocaleString(),  icon:Activity,   color:'bg-green-500'  },
    { label:'Today',          value:d.today?.toLocaleString(),     icon:Clock,      color:'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <AnimatePresence>{showDownload && <DownloadModal onClose={()=>setShowDownload(false)}/>}</AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Visitor Tracking</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Real-time and historical visitor data</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={()=>setShowDownload(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4"/>
            Export CSV
          </button>
          <button
            onClick={()=>{ if(tab==='summary') fetchSummary(true); else if(tab==='all') fetchAll(page); else fetchActive(true); }}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-sm font-medium"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing?'animate-spin':''}`}/>
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {(['summary','live','all'] as const).map(t=>(
          <button key={t} onClick={()=>{setTab(t);setPage(1);}}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${tab===t?'bg-background shadow-sm text-foreground':'text-muted-foreground hover:text-foreground'}`}>
            {t==='live'?'🟢 Live':t==='summary'?'Summary':'All Visitors'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {[...Array(4)].map((_,i)=><div key={i} className="h-28 rounded-xl bg-muted"/>)}
        </div>
      ) : (
        <>
          {tab==='summary'&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((s,i)=>(
                  <motion.div key={s.label} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}
                    className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">{s.label}</span>
                      <div className={`h-9 w-9 rounded-lg ${s.color}/10 flex items-center justify-center`}>
                        <s.icon className="h-4 w-4"/>
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{s.value??'—'}</p>
                    <p className="text-xs text-muted-foreground mt-1">{Math.round(d.returningRate||0)}% returning visitors</p>
                  </motion.div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4"><Globe className="h-4 w-4 text-primary"/><h3 className="font-semibold">Top Countries</h3></div>
                  <div className="space-y-3">
                    {(d.topCountries||[]).map((c:any,i:number)=>{
                      const pct=d.total>0?Math.round((c.count/d.total)*100):0;
                      return(<div key={c._id||i}>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <div className="flex items-center gap-2"><MapPin className="h-3 w-3 text-muted-foreground"/><span>{c._id||'Unknown'}</span></div>
                          <span className="text-muted-foreground">{c.count?.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${pct}%`}}/></div>
                      </div>);
                    })}
                    {(!d.topCountries||d.topCountries.length===0)&&<p className="text-sm text-muted-foreground py-4 text-center">No country data yet.</p>}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4"><Monitor className="h-4 w-4 text-primary"/><h3 className="font-semibold">Device Types</h3></div>
                  <div className="space-y-3">
                    {(d.topDevices||[]).map((dev:any,i:number)=>{
                      const pct=d.total>0?Math.round((dev.count/d.total)*100):0;
                      return(<div key={dev._id||i} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{background:COLORS[i]+'20',color:COLORS[i]}}>{deviceIcon(dev._id)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs mb-1"><span className="capitalize font-medium">{dev._id||'unknown'}</span><span className="text-muted-foreground">{pct}%</span></div>
                          <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:COLORS[i]}}/></div>
                        </div>
                      </div>);
                    })}
                    {(!d.topDevices||d.topDevices.length===0)&&<p className="text-sm text-muted-foreground py-4 text-center">No device data yet.</p>}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Top Landing Pages</h3>
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">#</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Page</th>
                    <th className="text-right py-2 font-medium text-muted-foreground">Visits</th>
                  </tr></thead>
                  <tbody>
                    {(d.topPages||[]).map((p:any,i:number)=>(
                      <tr key={p._id||i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 pr-4 text-muted-foreground">{i+1}</td>
                        <td className="py-2.5 pr-4 font-mono text-xs">{p._id||'/'}</td>
                        <td className="py-2.5 text-right font-medium">{p.count?.toLocaleString()}</td>
                      </tr>
                    ))}
                    {(!d.topPages||d.topPages.length===0)&&<tr><td colSpan={3} className="py-6 text-center text-muted-foreground text-sm">No page data yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab==='live'&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 w-fit">
                <Activity className="h-4 w-4 text-green-500 animate-pulse"/>
                <span className="text-sm font-medium text-green-600">{active.length} active in last 5 minutes</span>
              </div>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Visitor</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Browser</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">OS</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Device</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Landing Page</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">Last Seen</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Views</th>
                  </tr></thead>
                  <tbody>
                    {active.map((v:any,i:number)=>(
                      <tr key={v.sessionId||i} className="border-t border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"/><span className="font-mono text-xs text-muted-foreground">{v.ip||'—'}</span></div></td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">{[v.city,v.country].filter(Boolean).join(', ')||'—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs"><BrowserBadge browser={v.browser}/></td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs"><OSBadge os={v.os}/></td>
                        <td className="px-4 py-3 hidden lg:table-cell"><div className="flex items-center gap-1 text-xs text-muted-foreground capitalize">{deviceIcon(v.deviceType)}<span>{v.deviceType||'desktop'}</span></div></td>
                        <td className="px-4 py-3 font-mono text-xs">{v.landingPage||'/'}</td>
                        <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">{v.lastSeenAt?new Date(v.lastSeenAt).toLocaleTimeString():'—'}</td>
                        <td className="px-4 py-3 text-right font-medium">{v.pageViews||1}</td>
                      </tr>
                    ))}
                    {active.length===0&&<tr><td colSpan={8} className="py-12 text-center text-muted-foreground">No active visitors right now.</td></tr>}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {tab==='all'&&(
            <motion.div initial={{opacity:0}} animate={{opacity:1}} className="space-y-4">
              <p className="text-sm text-muted-foreground">{total.toLocaleString()} total visitors — click any row to expand</p>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50"><tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Location</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Browser</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden xl:table-cell">OS</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Device</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Landing Page</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">First Visit</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Pages</th>
                      <th className="text-center px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Type</th>
                    </tr></thead>
                    <tbody>
                      {visitors.map((v:any,i:number)=><VisitorRow key={v.sessionId||i} v={v}/>)}
                      {visitors.length===0&&<tr><td colSpan={9} className="py-12 text-center text-muted-foreground">No visitor records found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
              {pages>1&&(
                <div className="flex items-center justify-center gap-2 pt-2">
                  {Array.from({length:pages},(_,i)=>i+1).map(p=>(
                    <button key={p} onClick={()=>setPage(p)}
                      className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${p===page?'bg-primary text-primary-foreground':'border border-border hover:bg-accent'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}

const demoSummary = { total:0,today:0,thisWeek:0,thisMonth:0,returningCount:0,returningRate:0,topCountries:[],topDevices:[],topPages:[] };