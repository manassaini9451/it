'use client';
import Link from 'next/link';
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, Youtube, Instagram, Facebook, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';

const SOCIAL_ICONS: Record<string, any> = { twitter: Twitter, linkedin: Linkedin, github: Github, youtube: Youtube, instagram: Instagram, facebook: Facebook };

const links = {
  services: [{label:'SEO Services',href:'/services/seo'},{label:'Local SEO',href:'/services/local-seo'},{label:'Link Building',href:'/services/link-building'},{label:'Technical SEO',href:'/services/technical-seo'},{label:'Content Marketing',href:'/services/content'},{label:'E-Commerce SEO',href:'/services/ecommerce-seo'}],
  company:  [{label:'About Us',href:'/about'},{label:'Blog',href:'/blog'},{label:'Portfolio',href:'/portfolio'},{label:'Pricing',href:'/pricing'},{label:'Careers',href:'/careers'},{label:'Contact',href:'/contact'}],
  legal:    [{label:'Privacy Policy',href:'/privacy'},{label:'Terms of Service',href:'/terms'},{label:'Cookie Policy',href:'/cookies'}],
};

export default function Footer({ general }: { general?: any }) {
  const [email, setEmail] = useState('');
  const [sub, setSub] = useState(false);
  const [loading, setLoading] = useState(false);

  const g = general || {};
  const siteName = g.siteName || 'SEO Platform';
  const contactEmail = g.supportEmail || 'hello@seoplatform.com';
  const contactPhone = g.phone || '+1 (800) 555-1234';
  const contactAddr  = g.address || '123 SEO Street, San Francisco CA';
  const socialLinks  = g.socialLinks || {};

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/v1/newsletter/subscribe', { email, source: 'footer' }); setSub(true); }
    catch { setSub(true); }
    finally { setLoading(false); }
  };

  return (
    <footer className="border-t border-border bg-background">
      {/* Newsletter */}
      <div className="border-b border-border bg-primary/5">
        <div className="container max-w-7xl mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-bold">Stay ahead in SEO</h3>
            <p className="text-muted-foreground text-sm mt-1">Weekly SEO tips and insights, no spam ever.</p>
          </div>
          {sub ? <p className="text-green-600 font-medium text-sm">✓ You're subscribed!</p> : (
            <form onSubmit={handleSubscribe} className="flex gap-2 w-full md:w-auto">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" className="input-base flex-1 md:w-64" required/>
              <button type="submit" disabled={loading} className="btn-primary shrink-0">{loading ? '…' : 'Subscribe'}<ArrowRight className="h-4 w-4"/></button>
            </form>
          )}
        </div>
      </div>

      {/* Links */}
      <div className="container max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm">S</div>
              {siteName.replace('SEO Platform','SEO')}<span className="text-primary">{siteName.includes('SEO Platform') ? 'Platform' : ''}</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mb-5">{g.tagline || 'Enterprise-grade SEO platform helping 2,500+ businesses rank higher and grow organic traffic.'}</p>
            <div className="space-y-2">
              {[{icon:Mail,val:contactEmail,href:`mailto:${contactEmail}`},{icon:Phone,val:contactPhone,href:`tel:${contactPhone.replace(/\D/g,'')}`},{icon:MapPin,val:contactAddr,href:'#'}].map(({icon:Icon,val,href})=>(
                <a key={val} href={href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"><Icon className="h-4 w-4 text-primary shrink-0"/>{val}</a>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-5">
              {Object.entries(socialLinks).filter(([,v])=>v).slice(0,5).map(([platform, url]) => {
                const Icon = SOCIAL_ICONS[platform] || Globe;
                return <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer" className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"><Icon className="h-4 w-4"/></a>;
              })}
              {/* Fallback socials if none in DB */}
              {Object.keys(socialLinks).length === 0 && [Twitter, Linkedin, Github].map((Icon, i) => (
                <a key={i} href="#" className="h-9 w-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"><Icon className="h-4 w-4"/></a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Services</h4>
            <ul className="space-y-2.5">{links.services.map(l=><li key={l.href}><Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2.5">{links.company.map(l=><li key={l.href}><Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>)}</ul>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-4">Legal</h4>
            <ul className="space-y-2.5">{links.legal.map(l=><li key={l.href}><Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link></li>)}</ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border">
        <div className="container max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteName}. All rights reserved.</p>
          <p>Made with ❤️ for better SEO</p>
        </div>
      </div>
    </footer>
  );
}
