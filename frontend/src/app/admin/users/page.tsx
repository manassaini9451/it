'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, UserCheck, UserX, Shield } from 'lucide-react';
import api from '@/lib/api';
import { formatDateShort } from '@/utils/date';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const res = await api.get(`/v1/users?${params}`);
      setUsers(res.data?.data?.users || demoUsers);
      setTotal(res.data?.data?.total || demoUsers.length);
    } catch { setUsers(demoUsers); setTotal(demoUsers.length); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const statusCls: Record<string,string> = { active:'text-green-600 bg-green-500/10', inactive:'text-gray-600 bg-gray-500/10', suspended:'text-red-600 bg-red-500/10', pending:'text-yellow-600 bg-yellow-500/10' };
  const stats = [
    { label:'Total Users', value: total, icon: Users, color:'bg-blue-500' },
    { label:'Active', value: users.filter(u=>u.status==='active').length, icon: UserCheck, color:'bg-green-500' },
    { label:'Pending', value: users.filter(u=>u.status==='pending').length, icon: UserX, color:'bg-yellow-500' },
    { label:'Admins', value: users.filter(u=>['super-admin','admin'].includes(typeof u.role==='string'?u.role:u.role?.name)).length, icon: Shield, color:'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Users</h1><p className="text-sm text-muted-foreground mt-0.5">Manage platform users and roles</p></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s,i) => (
          <motion.div key={s.label} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon className="h-4 w-4 text-white"/></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold mt-0.5">{s.value}</p></div>
          </motion.div>
        ))}
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
        <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search users..." className="input-base pl-9 h-9 text-sm"/>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left font-medium text-muted-foreground px-4 py-3">User</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden md:table-cell">Role</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3">Status</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden lg:table-cell">Joined</th>
              <th className="text-left font-medium text-muted-foreground px-4 py-3 hidden xl:table-cell">Last Login</th>
            </tr></thead>
            <tbody>
              {loading ? Array.from({length:5}).map((_,i) => (
                <tr key={i} className="border-b border-border">{Array.from({length:5}).map((_,j) => <td key={j} className="px-4 py-3"><div className="h-4 rounded bg-muted animate-pulse"/></td>)}</tr>
              )) : users.map(user => {
                const role = typeof user.role==='string'?user.role:user.role?.name||'user';
                return (
                  <tr key={user._id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">{user.firstName?.[0]}{user.lastName?.[0]}</div>
                        <div><p className="font-medium">{user.firstName} {user.lastName}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell"><span className="badge bg-primary/10 text-primary capitalize">{role}</span></td>
                    <td className="px-4 py-3"><span className={`badge ${statusCls[user.status]||statusCls.pending}`}>{user.status}</span></td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{formatDateShort(user.createdAt)}</td>
                    <td className="px-4 py-3 hidden xl:table-cell text-xs text-muted-foreground">{user.lastLoginAt?formatDateShort(user.lastLoginAt):'Never'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!loading && users.length===0 && <div className="py-12 text-center"><Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3"/><p className="text-muted-foreground">No users found</p></div>}
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
    </div>
  );
}

const demoUsers = [
  { _id:'1', firstName:'Super', lastName:'Admin', email:'admin@seoplatform.com', role:{name:'super-admin'}, status:'active', createdAt:'2024-01-01T10:00:00.000Z', lastLoginAt:'2025-01-15T10:00:00.000Z' },
  { _id:'2', firstName:'John', lastName:'Editor', email:'editor@seoplatform.com', role:{name:'editor'}, status:'active', createdAt:'2024-02-01T10:00:00.000Z', lastLoginAt:'2025-01-10T10:00:00.000Z' },
  { _id:'3', firstName:'Jane', lastName:'User', email:'jane@example.com', role:{name:'user'}, status:'active', createdAt:'2024-03-01T10:00:00.000Z' },
  { _id:'4', firstName:'Bob', lastName:'Pending', email:'bob@example.com', role:{name:'user'}, status:'pending', createdAt:'2024-04-01T10:00:00.000Z' },
];
