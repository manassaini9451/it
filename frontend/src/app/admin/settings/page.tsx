'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, Loader2, Globe, Mail, Shield, Bell, Palette, Code, ChevronRight } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';
import api from '@/lib/api';

const TABS = [
  { id:'general', label:'General', icon:Globe },
  { id:'seo', label:'SEO Defaults', icon:Code },
  { id:'email', label:'Email / SMTP', icon:Mail },
  { id:'security', label:'Security', icon:Shield },
  { id:'notifications', label:'Notifications', icon:Bell },
  { id:'appearance', label:'Appearance', icon:Palette },
];

export default function AdminSettingsPage() {
  const dispatch = useAppDispatch();
  const [tab, setTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [maintenance, setMaintenance] = useState(false);
  const [allowReg, setAllowReg] = useState(true);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      siteName: 'SEO Platform', siteTagline: 'Enterprise SEO & Digital Marketing',
      siteEmail: 'hello@seoplatform.com', sitePhone: '+1 (800) 555-1234',
      siteUrl: 'https://yourdomain.com', googleAnalyticsId: '', metaPixelId: '',
      defaultMetaTitle: 'SEO Platform - Enterprise SEO', defaultMetaDescription: 'Enterprise-grade SEO platform for businesses.',
      robotsTxtContent: 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://yourdomain.com/sitemap.xml',
      googleSearchConsole: '', bingVerification: '',
    }
  });

  useEffect(() => {
    api.get('/v1/settings/general').then(r => { if (r.data?.data) reset(r.data.data); }).catch(() => {});
  }, []);

  const onSave = async (data: any) => {
    setSaving(true);
    try {
      await api.put('/v1/settings/general', { ...data, maintenanceMode: maintenance, allowRegistration: allowReg });
      dispatch(addToast({ id: Date.now().toString(), title: 'Saved', description: 'Settings updated successfully', variant: 'success' }));
    } catch { dispatch(addToast({ id: Date.now().toString(), title: 'Error', description: 'Failed to save settings', variant: 'destructive' })); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Settings</h1><p className="text-sm text-muted-foreground mt-0.5">Manage your platform configuration</p></div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="lg:w-56 shrink-0">
          <nav className="space-y-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}>
                <t.icon className="h-4 w-4 shrink-0"/><span className="flex-1 text-left">{t.label}</span><ChevronRight className="h-3.5 w-3.5 opacity-50"/>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'general' && (
            <motion.form initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit(onSave)} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-5">Site Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{n:'siteName',l:'Site Name',p:'SEO Platform'},{n:'siteTagline',l:'Tagline',p:'Enterprise SEO...'},{n:'siteUrl',l:'Site URL',p:'https://...',t:'url'},{n:'siteEmail',l:'Contact Email',p:'hello@...',t:'email'},{n:'sitePhone',l:'Phone',p:'+1 (800)...',t:'tel'}].map(f => (
                    <div key={f.n}>
                      <label className="text-sm font-medium mb-1.5 block">{f.l}</label>
                      <input {...register(f.n as any)} type={(f as any).t || 'text'} placeholder={f.p} className="input-base"/>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-5">Analytics Integration</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Google Analytics ID</label>
                    <input {...register('googleAnalyticsId')} placeholder="G-XXXXXXXXXX" className="input-base"/>
                    <p className="mt-1 text-xs text-muted-foreground">e.g. G-XXXXXXXXXX</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Meta Pixel ID</label>
                    <input {...register('metaPixelId')} placeholder="1234567890" className="input-base"/>
                    <p className="mt-1 text-xs text-muted-foreground">Facebook Pixel ID</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-5">Platform Controls</h2>
                <div className="space-y-4">
                  {[{label:'Maintenance Mode',desc:'Only admins can access the site.',checked:maintenance,set:setMaintenance},{label:'Allow Registration',desc:'Allow new users to register.',checked:allowReg,set:setAllowReg}].map(ctrl => (
                    <div key={ctrl.label} className="flex items-start justify-between gap-4 py-3 border-b border-border last:border-0">
                      <div><p className="text-sm font-medium">{ctrl.label}</p><p className="text-xs text-muted-foreground mt-0.5">{ctrl.desc}</p></div>
                      <button type="button" onClick={() => ctrl.set(!ctrl.checked)}
                        className={`relative h-6 w-11 rounded-full transition-colors shrink-0 ${ctrl.checked ? 'bg-primary' : 'bg-muted'}`}>
                        <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${ctrl.checked ? 'translate-x-5' : 'translate-x-0'}`}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary h-10 text-sm min-w-[120px]">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin"/>Saving...</> : <><Save className="h-4 w-4"/>Save Changes</>}
                </button>
              </div>
            </motion.form>
          )}

          {tab === 'seo' && (
            <motion.form initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit(onSave)} className="space-y-6">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-5">Default SEO Settings</h2>
                <div className="space-y-4">
                  <div><label className="text-sm font-medium mb-1.5 block">Default Meta Title</label><input {...register('defaultMetaTitle')} className="input-base"/></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Default Meta Description</label><textarea {...register('defaultMetaDescription')} rows={3} className="input-base resize-none"/></div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-5">Webmaster Tools</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium mb-1.5 block">Google Search Console</label><input {...register('googleSearchConsole')} placeholder="Verification code" className="input-base"/></div>
                  <div><label className="text-sm font-medium mb-1.5 block">Bing Webmaster</label><input {...register('bingVerification')} placeholder="Verification code" className="input-base"/></div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6">
                <h2 className="font-semibold mb-2">Custom robots.txt</h2>
                <p className="text-xs text-muted-foreground mb-4">Overrides the dynamically generated robots.txt</p>
                <textarea {...register('robotsTxtContent')} rows={10} className="input-base resize-none font-mono text-xs"/>
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={saving} className="btn-primary h-10 text-sm min-w-[120px]">
                  {saving ? <><Loader2 className="h-4 w-4 animate-spin"/>Saving...</> : <><Save className="h-4 w-4"/>Save Changes</>}
                </button>
              </div>
            </motion.form>
          )}

          {!['general','seo'].includes(tab) && (
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="rounded-2xl border border-border bg-card p-12 text-center">
              {(() => { const T = TABS.find(t => t.id === tab)!; return <T.icon className="h-10 w-10 text-primary mx-auto mb-4 opacity-50"/>; })()}
              <h3 className="font-semibold text-lg mb-2 capitalize">{tab} Settings</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">Configure {tab} settings via environment variables or contact your system administrator.</p>
              <p className="mt-4 text-xs text-muted-foreground">See <code className="bg-muted px-1.5 py-0.5 rounded text-primary">.env.example</code> for all options.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
