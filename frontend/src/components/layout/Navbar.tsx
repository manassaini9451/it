'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, Monitor, ChevronDown, ArrowRight } from 'lucide-react';
import { useAppSelector } from '@/hooks/useRedux';
import { selectIsAuth } from '@/store/slices/authSlice';

const STATIC_SERVICES = [
  { label:'SEO Services',     href:'/services/seo',          desc:'Full-service search optimization' },
  { label:'Local SEO',        href:'/services/local-seo',    desc:'Dominate local search results' },
  { label:'Link Building',    href:'/services/link-building', desc:'High-authority backlinks' },
  { label:'Technical SEO',    href:'/services/technical-seo', desc:'Site speed & crawlability' },
  { label:'Content Marketing',href:'/services/content',       desc:'SEO-optimized content' },
  { label:'AI Marketing',     href:'/services/ai-marketing',  desc:'Future-ready AI SEO strategy' },
];

const NAV = [
  { label:'Services', href:'/services', mega:true },
  { label:'About',    href:'/about' },
  { label:'Blog',     href:'/blog' },
  { label:'Portfolio',href:'/portfolio' },
  { label:'Pricing',  href:'/pricing' },
  { label:'Contact',  href:'/contact' },
];

interface Props { general?: any; }

export default function Navbar({ general }: Props) {
  const pathname   = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted]       = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen]     = useState(false);
  const isAuth = useAppSelector(selectIsAuth);

  const siteName = general?.siteName || 'SEO Platform';
  const logoChar = siteName.charAt(0).toUpperCase();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => { setMobileOpen(false); setMegaOpen(false); }, [pathname]);

  const cycleTheme = () => {
    const order = ['light','dark','system'];
    setTheme(order[(order.indexOf(theme||'system')+1)%3]);
  };
  const ThemeIcon = !mounted ? Monitor : theme==='dark' ? Moon : theme==='light' ? Sun : Monitor;

  const [namePart1, namePart2] = (() => {
    const parts = siteName.split(' ');
    return [parts.slice(0,-1).join(' '), parts[parts.length-1]];
  })();

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled?'bg-background/95 backdrop-blur-md border-b border-border shadow-sm':'bg-transparent'}`} style={{height:'var(--nav-height)'}}>
        <div className="container h-full flex items-center justify-between gap-4 max-w-7xl mx-auto px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">{logoChar}</div>
            {namePart1 ? <><span>{namePart1}</span><span className="text-primary">{namePart2}</span></> : <span className="text-primary">{siteName}</span>}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(link => link.mega ? (
              <div key={link.label} className="relative" onMouseEnter={()=>setMegaOpen(true)} onMouseLeave={()=>setMegaOpen(false)}>
                <button className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${megaOpen?'text-primary bg-primary/10':'text-foreground/80 hover:text-foreground hover:bg-accent'}`}>
                  {link.label}<ChevronDown className={`h-3.5 w-3.5 transition-transform ${megaOpen?'rotate-180':''}`}/>
                </button>
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}} transition={{duration:0.15}}
                      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[480px] rounded-2xl border border-border bg-popover shadow-xl p-4">
                      <div className="grid grid-cols-2 gap-1">
                        {STATIC_SERVICES.map(s => (
                          <Link key={s.href} href={s.href} className="flex flex-col gap-0.5 p-3 rounded-xl hover:bg-accent transition-colors">
                            <span className="text-sm font-medium">{s.label}</span>
                            <span className="text-xs text-muted-foreground">{s.desc}</span>
                          </Link>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-border flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">All SEO services</span>
                        <Link href="/services" className="text-xs font-medium text-primary flex items-center gap-1 hover:underline">View all<ArrowRight className="h-3 w-3"/></Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link key={link.href} href={link.href} className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${pathname===link.href?'text-primary bg-primary/10':'text-foreground/80 hover:text-foreground hover:bg-accent'}`}>{link.label}</Link>
            ))}
          </nav>

          {/* Right */}
          <div className="flex items-center gap-1.5">
            <button onClick={cycleTheme} className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors" aria-label="Toggle theme">
              <ThemeIcon className="h-4 w-4"/>
            </button>
            {isAuth ? (
              <Link href="/admin" className="hidden sm:flex btn-primary h-9 px-4 text-sm">Dashboard</Link>
            ) : (
              <>
                <Link href="/auth/login" className="hidden sm:flex h-9 px-4 items-center text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">Sign in</Link>
                <Link href="/contact" className="h-9 px-4 flex items-center rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">Free Audit</Link>
              </>
            )}
            <button onClick={()=>setMobileOpen(!mobileOpen)} className="lg:hidden h-9 w-9 rounded-lg flex items-center justify-center hover:bg-accent transition-colors">
              {mobileOpen ? <X className="h-5 w-5"/> : <Menu className="h-5 w-5"/>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{opacity:0,x:'100%'}} animate={{opacity:1,x:0}} exit={{opacity:0,x:'100%'}} transition={{type:'spring',damping:25,stiffness:300}}
            className="fixed inset-0 z-40 lg:hidden bg-background/98 backdrop-blur-md" style={{top:'var(--nav-height)'}}>
            <nav className="p-6 flex flex-col gap-2">
              {NAV.map(link => <Link key={link.href} href={link.href} className={`px-4 py-3 rounded-xl text-base font-medium transition-colors ${pathname===link.href?'bg-primary/10 text-primary':'hover:bg-accent'}`}>{link.label}</Link>)}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                {isAuth ? <Link href="/admin" className="btn-primary w-full justify-center h-11">Dashboard</Link> : (
                  <>
                    <Link href="/auth/login" className="btn-outline w-full justify-center h-11">Sign in</Link>
                    <Link href="/contact" className="btn-primary w-full justify-center h-11">Get Free Audit</Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{height:'var(--nav-height)'}}/>
    </>
  );
}
