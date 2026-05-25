'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { Bell, Search, Sun, Moon, Monitor, Settings, User, ChevronDown, Activity } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/hooks/useRedux';
import { selectUser } from '@/store/slices/authSlice';
import { selectActiveVisitors } from '@/store/slices/uiSlice';

export default function AdminHeader() {
  const { theme, setTheme } = useTheme();
  const [userMenu, setUserMenu] = useState(false);
  const user = useAppSelector(selectUser);
  const activeVisitors = useAppSelector(selectActiveVisitors);

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 z-20">
      {/* Search */}
      <div className="relative hidden md:flex items-center max-w-sm w-full">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none"/>
        <input type="search" placeholder="Search anything..." className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"/>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 ml-auto">
        {/* Live visitors */}
        <Link href="/admin/analytics" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-600 bg-green-500/10 hover:bg-green-500/20 transition-colors">
          <Activity className="h-3.5 w-3.5 animate-pulse"/>{activeVisitors || 0} live
        </Link>

        {/* Theme */}
        <div className="flex items-center rounded-lg border border-border bg-muted/50 p-0.5">
          {([['light', Sun],['dark', Moon],['system', Monitor]] as const).map(([val, Icon]) => (
            <button key={val} onClick={()=>setTheme(val)} aria-label={`${val} theme`}
              className={`p-1.5 rounded-md transition-all ${theme===val?'bg-background shadow-sm text-foreground':'text-muted-foreground hover:text-foreground'}`}>
              <Icon className="h-3.5 w-3.5"/>
            </button>
          ))}
        </div>

        <Link href="/admin/settings" className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
          <Settings className="h-[1.125rem] w-[1.125rem]"/>
        </Link>

        {/* User menu */}
        <div className="relative">
          <button onClick={()=>setUserMenu(!userMenu)} className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-accent transition-colors">
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold leading-none">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">{typeof user?.role==='string'?user.role:(user?.role as any)?.name}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground"/>
          </button>
          {userMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-popover shadow-xl z-50 py-1" onClick={()=>setUserMenu(false)}>
              <Link href="/admin/profile" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"><User className="h-4 w-4 text-muted-foreground"/>Profile</Link>
              <Link href="/admin/settings" className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"><Settings className="h-4 w-4 text-muted-foreground"/>Settings</Link>
              <div className="border-t border-border my-1"/>
              <Link href="/" className="flex items-center gap-2.5 px-3 py-2 text-sm text-muted-foreground hover:bg-accent transition-colors">View Website</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
