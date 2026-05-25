'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RefreshCw, Activity, ArrowUpRight, ArrowDownRight, Eye, Users, Globe, Target, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { selectActiveVisitors } from '@/store/slices/uiSlice';
import api from '@/lib/api';

const COLORS = ['#6366f1','#8b5cf6','#a855f7','#c084fc','#e879f9','#f472b6'];
const ranges = [{ label:'7d', value:'7' },{ label:'30d', value:'30' },{ label:'90d', value:'90' }];

export default function AdminAnalyticsPage() {
  const [range, setRange] = useState('30');
  const [current, setCurrent] = useState<any>(null);
  const [previous, setPrevious] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);
  const active = useAppSelector(selectActiveVisitors);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) { setLoading(true); setError(false); } else setRefreshing(true);
    const days = Number(range);
    const now = new Date();
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const prevFrom = new Date(Date.now() - days * 2 * 24 * 60 * 60 * 1000);
    try {
      const [cur, prev] = await Promise.all([
        api.get(`/v1/analytics/dashboard?from=${from.toISOString()}&to=${now.toISOString()}`),
        api.get(`/v1/analytics/dashboard?from=${prevFrom.toISOString()}&to=${from.toISOString()}`),
      ]);
      setCurrent(cur.data?.data);
      setPrevious(prev.data?.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const calcChange = (cur: number, prev: number) => {
    if (!prev) return null;
    return +((( cur - prev) / prev) * 100).toFixed(1);
  };

  const cur = current?.summary || {};
  const prv = previous?.summary || {};

  const topStats = [
    { label:'Total Visitors', value: cur.totalVisitors ?? 0, change: calcChange(cur.totalVisitors, prv.totalVisitors), icon: Eye, color:'bg-blue-500' },
    { label:'Unique Visitors', value: cur.uniqueVisitors ?? 0, change: calcChange(cur.uniqueVisitors, prv.uniqueVisitors), icon: Users, color:'bg-purple-500' },
    { label:'Returning Visitors', value: cur.returningVisitors ?? 0, change: calcChange(cur.returningVisitors, prv.returningVisitors), icon: Globe, color:'bg-green-500' },
    { label:'Bounce Rate', value: `${cur.bounceRate ?? 0}%`, change: calcChange(cur.bounceRate, prv.bounceRate), icon: Target, color:'bg-orange-500', invertColor: true },
  ];

  const trafficChart = (current?.dailyTraffic || []).map((x: any) => ({
    date: `${x._id?.month}/${x._id?.day}`,
    visitors: x.count || 0,
    unique: x.uniqueCount || 0,
  }));

  const deviceData = (current?.deviceBreakdown || []).map((x: any, i: number) => ({
    name: x._id || 'Unknown',
    value: x.count,
    fill: COLORS[i % COLORS.length],
  }));

  const browserData = (current?.browserBreakdown || []).map((x: any, i: number) => ({
    name: x._id || 'Unknown',
    value: x.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Analytics</h1><p className="text-sm text-muted-foreground mt-0.5">Real-time website traffic and behaviour</p></div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
            <Activity className="h-3.5 w-3.5 text-green-500 animate-pulse"/>
            <span className="text-xs font-medium text-green-600">{active ?? 0} live now</span>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/30">
            {ranges.map(r => (
              <button key={r.value} onClick={() => setRange(r.value)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${range===r.value?'bg-background shadow-sm text-foreground':'text-muted-foreground hover:text-foreground'}`}>{r.label}</button>
            ))}
          </div>
          <button onClick={() => fetchData(true)} disabled={refreshing} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50">
            <RefreshCw className={`h-4 w-4 ${refreshing?'animate-spin':''}`}/>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0"/>
          Failed to load analytics data. Check your API connection and permissions.
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? Array.from({length:4}).map((_,i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse"/>) :
          topStats.map((s, i) => (
            <motion.div key={s.label} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-3"><p className="text-sm text-muted-foreground">{s.label}</p><div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-4 w-4 text-white"/></div></div>
              <p className="text-2xl font-bold">{typeof s.value==='number'?s.value.toLocaleString():s.value}</p>
              {s.change !== null ? (
                <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
                  (s as any).invertColor
                    ? (s.change! <= 0 ? 'text-green-500' : 'text-red-500')
                    : (s.change! >= 0 ? 'text-green-500' : 'text-red-500')
                }`}>
                  {s.change! >= 0 ? <ArrowUpRight className="h-3.5 w-3.5"/> : <ArrowDownRight className="h-3.5 w-3.5"/>}
                  {Math.abs(s.change!)}% vs previous period
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-1.5">No previous data</p>
              )}
            </motion.div>
          ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-1">Traffic Over Time</h2>
          <p className="text-xs text-muted-foreground mb-5">Total vs unique visitors</p>
          {loading ? <div className="h-64 rounded-xl bg-muted animate-pulse"/> : (
            trafficChart.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No traffic data for this period</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={trafficChart} margin={{top:5,right:5,left:-20,bottom:5}}>
                  <defs>
                    <linearGradient id="gT" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                    <linearGradient id="gU" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="date" tick={{fontSize:11,fill:'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false}/>
                  <YAxis tick={{fontSize:11,fill:'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false}/>
                  <Tooltip/>
                  <Area type="monotone" dataKey="visitors" name="Total" stroke="#6366f1" strokeWidth={2.5} fill="url(#gT)" dot={false}/>
                  <Area type="monotone" dataKey="unique" name="Unique" stroke="#a855f7" strokeWidth={2} fill="url(#gU)" dot={false}/>
                </AreaChart>
              </ResponsiveContainer>
            )
          )}
        </motion.div>

        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-5">Device Breakdown</h2>
          {loading ? <div className="h-56 rounded-xl bg-muted animate-pulse"/> : (
            deviceData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {deviceData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                    </Pie>
                    <Tooltip formatter={(v: number) => [v.toLocaleString(),'Visitors']}/>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 mt-2">
                  {deviceData.map((item: any, i: number) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{background:COLORS[i%COLORS.length]}}/><span className="capitalize text-muted-foreground">{item.name}</span></div>
                      <span className="font-medium">{item.value?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </>
            )
          )}
        </motion.div>
      </div>

      {/* Browser breakdown */}
      {!loading && browserData.length > 0 && (
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.45}} className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-5">Browser Breakdown</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={browserData} margin={{top:5,right:5,left:-20,bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
              <XAxis dataKey="name" tick={{fontSize:11,fill:'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fontSize:11,fill:'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false}/>
              <Tooltip/>
              <Bar dataKey="value" name="Visitors" fill="#6366f1" radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Country breakdown */}
      <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.5}} className="rounded-2xl border border-border bg-card p-6">
        <h2 className="font-semibold mb-5">Traffic by Country</h2>
        {loading ? <div className="h-48 rounded-xl bg-muted animate-pulse"/> : (
          !current?.countryBreakdown?.length ? (
            <div className="py-10 text-center text-muted-foreground text-sm">No country data yet</div>
          ) : (
            <div className="space-y-3">
              {current.countryBreakdown.slice(0, 10).map((c: any, i: number) => {
                const max = current.countryBreakdown[0]?.count || 1;
                const pct = Math.round((c.count / max) * 100);
                return (
                  <div key={c._id||i}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{c._id || 'Unknown'}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{pct}%</span>
                        <span className="font-medium text-xs w-16 text-right">{c.count?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-700" style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </motion.div>
    </div>
  );
}