'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Eye, Users, TrendingUp, Target, ArrowUpRight, ArrowDownRight, Activity, Globe, AlertCircle } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { selectActiveVisitors } from '@/store/slices/uiSlice';
import api from '@/lib/api';

const COLORS = ['#6366f1','#8b5cf6','#a855f7','#c084fc'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-popover shadow-lg px-3 py-2 text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full" style={{background:p.color}}/>
          <span className="text-muted-foreground capitalize text-xs">{p.name}:</span>
          <span className="font-medium text-xs">{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [current, setCurrent] = useState<any>(null);
  const [previous, setPrevious] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const activeVisitors = useAppSelector(selectActiveVisitors);

  useEffect(() => {
    const now = new Date();
    const from30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const from60 = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    Promise.all([
      api.get(`/v1/analytics/dashboard?from=${from30.toISOString()}&to=${now.toISOString()}`),
      api.get(`/v1/analytics/dashboard?from=${from60.toISOString()}&to=${from30.toISOString()}`),
    ])
      .then(([cur, prev]) => {
        setCurrent(cur.data?.data);
        setPrevious(prev.data?.data);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const calcChange = (cur: number, prev: number) => {
    if (!prev) return null;
    return +((( cur - prev) / prev) * 100).toFixed(1);
  };

  const cur = current?.summary || {};
  const prv = previous?.summary || {};

  const topStats = [
    {
      label: 'Total Visitors',
      value: cur.totalVisitors ?? 0,
      change: calcChange(cur.totalVisitors, prv.totalVisitors),
      icon: Eye, color: 'bg-blue-500',
    },
    {
      label: 'Unique Visitors',
      value: cur.uniqueVisitors ?? 0,
      change: calcChange(cur.uniqueVisitors, prv.uniqueVisitors),
      icon: Users, color: 'bg-purple-500',
    },
    {
      label: 'Returning Visitors',
      value: cur.returningVisitors ?? 0,
      change: calcChange(cur.returningVisitors, prv.returningVisitors),
      icon: Globe, color: 'bg-green-500',
    },
    {
      label: 'Bounce Rate',
      value: `${cur.bounceRate ?? 0}%`,
      change: calcChange(cur.bounceRate, prv.bounceRate),
      icon: Target, color: 'bg-orange-500',
      invertColor: true,
    },
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

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 rounded-lg bg-muted"/>
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i=><div key={i} className="h-32 rounded-2xl bg-muted"/>)}</div>
      <div className="grid grid-cols-3 gap-6"><div className="col-span-2 h-80 rounded-2xl bg-muted"/><div className="h-80 rounded-2xl bg-muted"/></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <AlertCircle className="h-10 w-10 text-destructive mb-3"/>
      <p className="font-semibold">Failed to load analytics</p>
      <p className="text-sm text-muted-foreground mt-1">Check your API connection and permissions.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-sm text-muted-foreground mt-0.5">Last 30 days — live data</p></div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
          <Activity className="h-4 w-4 text-green-500 animate-pulse"/>
          <span className="text-sm font-medium text-green-600">{activeVisitors ?? 0} active now</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {topStats.map((s, i) => (
          <motion.div key={s.label} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <div className={`p-2 rounded-lg ${s.color}`}><s.icon className="h-4 w-4 text-white"/></div>
            </div>
            <p className="text-2xl font-bold">{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
            {s.change !== null ? (
              <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium ${
                s.invertColor
                  ? (s.change <= 0 ? 'text-green-500' : 'text-red-500')
                  : (s.change >= 0 ? 'text-green-500' : 'text-red-500')
              }`}>
                {s.change >= 0 ? <ArrowUpRight className="h-3.5 w-3.5"/> : <ArrowDownRight className="h-3.5 w-3.5"/>}
                {Math.abs(s.change)}% vs prev 30d
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1.5">No previous data</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Traffic + Device */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.3}} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-6">
            <div><h2 className="font-semibold">Traffic Overview</h2><p className="text-xs text-muted-foreground">Last 30 days</p></div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary"/>Total</div>
              <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-purple-400"/>Unique</div>
            </div>
          </div>
          {trafficChart.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">No traffic data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={trafficChart} margin={{top:5,right:5,left:-20,bottom:5}}>
                <defs>
                  <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/><stop offset="95%" stopColor="#6366f1" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gUnique" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/><stop offset="95%" stopColor="#a855f7" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                <XAxis dataKey="date" tick={{fontSize:11,fill:'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fontSize:11,fill:'hsl(var(--muted-foreground))'}} tickLine={false} axisLine={false}/>
                <Tooltip content={<CustomTooltip/>}/>
                <Area type="monotone" dataKey="visitors" name="Total" stroke="#6366f1" strokeWidth={2.5} fill="url(#gTotal)" dot={false}/>
                <Area type="monotone" dataKey="unique" name="Unique" stroke="#a855f7" strokeWidth={2} fill="url(#gUnique)" dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.4}} className="rounded-2xl border border-border bg-card p-6">
          <h2 className="font-semibold mb-5">Device Breakdown</h2>
          {deviceData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={deviceData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                    {deviceData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                  </Pie>
                  <Tooltip formatter={(v: number) => [v.toLocaleString(), 'Visitors']}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {deviceData.map((d: any, i: number) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="h-2.5 w-2.5 rounded-full" style={{background:COLORS[i%COLORS.length]}}/><span className="capitalize text-muted-foreground">{d.name}</span></div>
                    <span className="font-medium">{d.value?.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      {/* Top pages + Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'Top Pages', items: (current?.topPages || []).slice(0, 7), keyField: '_id', valField: 'count' },
          { title: 'Top Countries', items: (current?.countryBreakdown || []).slice(0, 7), keyField: '_id', valField: 'count' },
        ].map((section, si) => (
          <motion.div key={section.title} initial={{opacity:0,y:15}} animate={{opacity:1,y:0}} transition={{delay:0.5+si*0.05}} className="rounded-2xl border border-border bg-card p-6">
            <h2 className="font-semibold mb-5">{section.title}</h2>
            {section.items.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">No data yet</div>
            ) : (
              <div className="space-y-3">
                {section.items.map((item: any, i: number) => {
                  const max = section.items[0]?.[section.valField] || 1;
                  const pct = Math.round((item[section.valField] / max) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground truncate max-w-[200px]">{item[section.keyField]}</span>
                        <span className="font-medium shrink-0">{item[section.valField]?.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-700" style={{width:`${pct}%`}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}