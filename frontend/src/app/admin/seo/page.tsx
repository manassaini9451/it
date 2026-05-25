'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Globe, CheckCircle2, AlertCircle, XCircle, RefreshCw, Eye, Target, Link2, TrendingUp, Zap, Settings2 } from 'lucide-react';
import api from '@/lib/api';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';

const TABS = ['Overview','Pages','Sitemap'];

const score = (n: number) => n >= 80 ? 'text-green-500' : n >= 50 ? 'text-yellow-500' : 'text-red-500';
const scoreBg = (n: number) => n >= 80 ? 'bg-green-500' : n >= 50 ? 'bg-yellow-500' : 'bg-red-500';

export default function AdminSeoPage() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState('Overview');
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api.get('/v1/seo/audit').then(r => setAudit(r.data?.data || demoAudit)).catch(() => setAudit(demoAudit)).finally(() => setLoading(false));
  }, []);

  const generateSitemap = async () => {
    setGenerating(true);
    try {
      await api.post('/v1/seo/sitemap/generate');
      dispatch(addToast({ id: Date.now().toString(), title: 'Sitemap Generated', description: 'sitemap.xml updated successfully', variant: 'success' }));
    } catch { } finally { setTimeout(() => setGenerating(false), 2000); }
  };

  const d = audit || demoAudit;
  const overall = d.overallScore || 76;

  const overviewCards = [
    { label: 'SEO Score', value: `${overall}/100`, icon: Target, color: 'from-primary to-purple-600' },
    { label: 'Indexed Pages', value: '284', icon: Globe, color: 'from-blue-500 to-cyan-500' },
    { label: 'Keywords Ranking', value: '3,842', icon: Search, color: 'from-green-500 to-emerald-500' },
    { label: 'Backlinks', value: '12,491', icon: Link2, color: 'from-orange-500 to-amber-500' },
  ];

  const issues = [
    { type: 'error', title: 'Missing meta titles', desc: '4 pages without a meta title', count: 4 },
    { type: 'error', title: 'Duplicate H1 tags', desc: '2 pages with multiple H1 tags', count: 2 },
    { type: 'warn', title: 'Images missing alt text', desc: '28 images without alt attributes', count: 28 },
    { type: 'warn', title: 'Meta descriptions too short', desc: '11 pages under 120 characters', count: 11 },
    { type: 'warn', title: 'Missing schema markup', desc: '6 pages without structured data', count: 6 },
  ];

  const checklist = [
    { label: 'SSL Certificate Active', ok: true }, { label: 'Mobile Responsive', ok: true },
    { label: 'XML Sitemap Present', ok: true }, { label: 'Robots.txt Configured', ok: true },
    { label: 'Canonical URLs Set', ok: true }, { label: 'Open Graph Tags', ok: true },
    { label: 'Twitter Cards', ok: true }, { label: 'Schema Markup', ok: false },
    { label: 'Core Web Vitals Pass', ok: false }, { label: 'All Images Have Alt Text', ok: false },
    { label: 'No Broken Links', ok: false }, { label: 'Hreflang Tags', ok: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">SEO Manager</h1><p className="text-sm text-muted-foreground mt-0.5">Monitor and optimize your site's SEO performance</p></div>
        <div className="flex items-center gap-2">
          <button onClick={generateSitemap} disabled={generating} className="h-9 px-4 flex items-center gap-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`}/>{generating ? 'Generating...' : 'Regenerate Sitemap'}
          </button>
          <a href="/sitemap.xml" target="_blank" className="btn-primary h-9 text-sm"><Eye className="h-4 w-4"/>View Sitemap</a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border w-fit">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{t}</button>
        ))}
      </div>

      {tab === 'Overview' && (
        <div className="space-y-6">
          {/* Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {overviewCards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="rounded-2xl border border-border bg-card p-5">
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${c.color} mb-4`}><c.icon className="h-5 w-5 text-white"/></div>
                <p className="text-2xl font-bold">{c.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Score gauge + Issues */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="rounded-2xl border border-border bg-card p-6 text-center">
              <h2 className="font-semibold mb-6">SEO Health Score</h2>
              <div className="relative w-40 h-40 mx-auto">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="12"/>
                  <circle cx="50" cy="50" r="42" fill="none" stroke={overall >= 80 ? '#22c55e' : overall >= 50 ? '#eab308' : '#ef4444'} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${(overall / 100) * 264} 264`} className="transition-all duration-1000"/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${score(overall)}`}>{overall}</span>
                  <span className="text-xs text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="mt-6 space-y-2">
                {[{label:'Performance',val:92,c:'text-green-500'},{label:'Accessibility',val:96,c:'text-green-500'},{label:'Best Practices',val:83,c:'text-yellow-500'},{label:'SEO',val:91,c:'text-green-500'}].map(m => (
                  <div key={m.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span><span className={`font-medium ${m.c}`}>{m.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
              <h2 className="font-semibold mb-4">SEO Issues</h2>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {[{label:'Critical',count:2,icon:XCircle,c:'text-red-500 bg-red-500/10'},{label:'Warnings',count:3,icon:AlertCircle,c:'text-yellow-500 bg-yellow-500/10'},{label:'Passed',count:7,icon:CheckCircle2,c:'text-green-500 bg-green-500/10'}].map(s => (
                  <div key={s.label} className={`rounded-xl p-4 ${s.c.split(' ')[1]} text-center`}>
                    <s.icon className={`h-6 w-6 mx-auto mb-2 ${s.c.split(' ')[0]}`}/><p className={`text-2xl font-bold ${s.c.split(' ')[0]}`}>{s.count}</p><p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                {issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                    {issue.type === 'error' ? <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5"/> : <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5"/>}
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium">{issue.title}</p><p className="text-xs text-muted-foreground mt-0.5">{issue.desc}</p></div>
                    <span className="text-xs font-medium text-muted-foreground bg-muted rounded px-2 py-0.5 shrink-0">{issue.count} pages</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Checklist */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-5">SEO Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {checklist.map(item => (
                <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  {item.ok ? <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0"/> : <XCircle className="h-4 w-4 text-red-500 shrink-0"/>}
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {tab === 'Pages' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Page</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Meta Title</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Meta Description</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3">Score</th>
                <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Status</th>
                <th className="text-right font-medium text-muted-foreground px-4 py-3">Edit</th>
              </tr></thead>
              <tbody>
                {demoPages.map(p => (
                  <tr key={p._id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium">{p.page}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-[180px] truncate">{p.metaTitle || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs hidden md:table-cell"><span className="line-clamp-1">{p.metaDescription || '—'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden"><div className={`h-full rounded-full ${scoreBg(p.seoScore)}`} style={{ width: `${p.seoScore}%` }}/></div>
                        <span className={`text-xs font-bold ${score(p.seoScore)}`}>{p.seoScore}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`badge ${p.status === 'good' ? 'text-green-600 bg-green-500/10' : p.status === 'warning' ? 'text-yellow-600 bg-yellow-500/10' : 'text-red-600 bg-red-500/10'}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground hover:text-foreground ml-auto transition-colors"><Settings2 className="h-3.5 w-3.5"/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'Sitemap' && (
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div><h2 className="font-semibold">Dynamic Sitemap</h2><p className="text-sm text-muted-foreground mt-0.5">Auto-generated and updated on content changes</p></div>
            <button onClick={generateSitemap} disabled={generating} className="btn-primary h-9 text-sm">
              <RefreshCw className={`h-4 w-4 ${generating ? 'animate-spin' : ''}`}/>Regenerate
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {[{label:'Total URLs',value:'284',icon:Globe},{label:'Last Generated',value:'Just now',icon:RefreshCw},{label:'Avg Priority',value:'0.8',icon:TrendingUp}].map(s => (
              <div key={s.label} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 border border-border">
                <div className="p-2 rounded-lg bg-primary/10"><s.icon className="h-4 w-4 text-primary"/></div>
                <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="font-bold">{s.value}</p></div>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <a href="/sitemap.xml" target="_blank" className="btn-outline h-9 text-sm"><Eye className="h-4 w-4"/>View sitemap.xml</a>
            <a href="/robots.txt" target="_blank" className="btn-outline h-9 text-sm"><Eye className="h-4 w-4"/>View robots.txt</a>
          </div>
        </div>
      )}
    </div>
  );
}

const demoAudit = { overallScore: 76, pages: [] };
const demoPages = [
  { _id:'1', page:'/', metaTitle:'SEO Platform - Enterprise SEO', metaDescription:'Enterprise-grade SEO for businesses.', seoScore:91, status:'good' },
  { _id:'2', page:'/services', metaTitle:'SEO Services - Professional Search', metaDescription:'Comprehensive SEO services.', seoScore:84, status:'good' },
  { _id:'3', page:'/blog', metaTitle:'SEO Blog', metaDescription:'Read SEO tips.', seoScore:67, status:'warning' },
  { _id:'4', page:'/contact', metaTitle: null, metaDescription: null, seoScore:34, status:'error' },
  { _id:'5', page:'/about', metaTitle:'About SEO Platform', metaDescription:'Learn about our team.', seoScore:78, status:'warning' },
];
