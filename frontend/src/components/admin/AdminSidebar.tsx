'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, FileText, Briefcase, Users, BarChart2, Search, Settings, Image, Bell, ChevronLeft, ChevronRight, Star, FolderOpen, LogOut, Activity, Tag, Eye, TrendingUp, Mail } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { toggleSidebar, selectSidebarCollapsed } from '@/store/slices/uiSlice';
import { logout } from '@/store/slices/authSlice';
import api from '@/lib/api';

const groups = [
  { label:'Main', items:[
    { href:'/admin', icon:LayoutDashboard, label:'Dashboard', exact:true },
    { href:'/admin/analytics', icon:BarChart2, label:'Analytics' },
    { href:'/admin/visitors', icon:Eye, label:'Visitors' },
    { href:'/admin/leads', icon:Activity, label:'Leads & CRM' },
  ]},
  { label:'Content', items:[
    { href:'/admin/blogs', icon:FileText, label:'Blog Posts' },
    { href:'/admin/services', icon:Briefcase, label:'Services' },
    { href:'/admin/projects', icon:TrendingUp, label:'Case Studies' },
    { href:'/admin/media', icon:Image, label:'Media' },
  ]},
  { label:'Taxonomy', items:[
    { href:'/admin/categories', icon:FolderOpen, label:'Categories' },
    { href:'/admin/tags', icon:Tag, label:'Tags' },
  ]},
  { label:'Marketing', items:[
    { href:'/admin/seo', icon:Search, label:'SEO Manager' },
    { href:'/admin/newsletter', icon:Mail, label:'Newsletter' },
  ]},
  { label:'Showcase', items:[
    { href:'/admin/testimonials', icon:Star, label:'Testimonials' },
    { href:'/admin/jobs', icon:Briefcase, label:'Jobs' },
  ]},
  { label:'System', items:[
    { href:'/admin/users', icon:Users, label:'Users' },
    { href:'/admin/settings', icon:Settings, label:'Settings' },
  ]},
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const collapsed = useAppSelector(selectSidebarCollapsed);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  const handleLogout = async () => {
    try { await api.post('/v1/auth/logout'); } finally {
      dispatch(logout()); router.push('/auth/login');
    }
  };

  return (
    <motion.aside animate={{width: collapsed ? 72 : 260}} transition={{duration:0.2,ease:'easeInOut'}}
      className="relative flex flex-col h-full bg-card border-r border-border shrink-0 overflow-hidden z-30">
      {/* Logo */}
      <div className="h-16 flex items-center border-b border-border px-4 shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5 min-w-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">S</div>
          <AnimatePresence>{!collapsed && <motion.span initial={{opacity:0,x:-10}} animate={{opacity:1,x:0}} exit={{opacity:0}} className="font-bold text-sm truncate">SEO<span className="text-primary">Platform</span></motion.span>}</AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-5">
        {groups.map(group => (
          <div key={group.label}>
            <AnimatePresence>{!collapsed && <motion.p initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">{group.label}</motion.p>}</AnimatePresence>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.href, (item as any).exact);
                return (
                  <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                    <item.icon className="h-[1.125rem] w-[1.125rem] shrink-0"/>
                    <AnimatePresence>{!collapsed && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="truncate">{item.label}</motion.span>}</AnimatePresence>
                    {active && <motion.div layoutId="activeNav" className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-primary"/>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-2 shrink-0">
        <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
          <LogOut className="h-4 w-4 shrink-0"/>
          <AnimatePresence>{!collapsed && <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Logout</motion.span>}</AnimatePresence>
        </button>
      </div>

      {/* Toggle */}
      <button onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border border-border bg-card flex items-center justify-center shadow-sm hover:bg-accent transition-colors">
        {collapsed ? <ChevronRight className="h-3 w-3"/> : <ChevronLeft className="h-3 w-3"/>}
      </button>
    </motion.aside>
  );
}
