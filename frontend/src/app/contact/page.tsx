import type { Metadata } from 'next';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ContactForm from '@/components/forms/ContactForm';
import api from '@/lib/api';
import { Mail, Phone, MapPin, Clock, MessageCircle, Calendar } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Contact Us — Get Your Free SEO Audit', description: 'Contact SEO Platform for a free SEO audit and consultation. Our experts will review your website and create a custom strategy.' };
}

async function getData() {
  try { const r = await api.get('/v1/settings/contact'); return r.data?.data || null; } catch { return null; }
}

const FALLBACK = {
  email: 'hello@seoplatform.com', phone: '+1 (800) 555-1234',
  address: '123 SEO Street, San Francisco, CA 94105', hours: 'Mon–Fri, 9am–6pm PST',
  whatsapp: '+18005551234', calendlyUrl: '',
  officeLocations: [
    { city:'San Francisco', country:'USA', address:'123 SEO Street, SF, CA 94105', phone:'+1 (800) 555-1234', isPrimary:true },
    { city:'London', country:'UK', address:'10 Digital Lane, London EC1A 1BB', phone:'+44 20 7946 0123', isPrimary:false },
  ],
};

export default async function ContactPage() {
  const contact = await getData() || FALLBACK;

  const infoCards = [
    { icon: Mail,  label:'Email',  value: contact.email,   href: `mailto:${contact.email}` },
    { icon: Phone, label:'Phone',  value: contact.phone,   href: `tel:${contact.phone?.replace(/\D/g,'')}` },
    { icon: MapPin,label:'Office', value: contact.address,  href: '#' },
    { icon: Clock, label:'Hours',  value: contact.hours,    href: '#' },
  ];

  return (
    <>
      <Navbar/>
      <main className="min-h-screen">
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">Get In Touch</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold">Let's grow your <span className="gradient-text">business</span></h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">Get a free SEO audit. Our team will review your website and provide a custom strategy.</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left: Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {infoCards.map(item => (
                      <a key={item.label} href={item.href} className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                        <div className="p-2.5 rounded-lg bg-primary/10 shrink-0"><item.icon className="h-5 w-5 text-primary"/></div>
                        <div><p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">{item.label}</p><p className="text-sm font-medium mt-0.5">{item.value}</p></div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="space-y-3">
                  {contact.whatsapp && (
                    <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g,'')}`} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-green-500/30 bg-green-500/5 hover:bg-green-500/10 transition-colors text-green-600 font-medium">
                      <MessageCircle className="h-5 w-5"/>Chat on WhatsApp
                    </a>
                  )}
                  {contact.calendlyUrl && (
                    <a href={contact.calendlyUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-colors text-blue-600 font-medium">
                      <Calendar className="h-5 w-5"/>Book a Free Consultation
                    </a>
                  )}
                </div>

                {/* Office Locations */}
                {contact.officeLocations?.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Our Offices</h3>
                    <div className="space-y-3">
                      {contact.officeLocations.map((loc: any) => (
                        <div key={loc.city} className={`p-4 rounded-xl border ${loc.isPrimary ? 'border-primary/30 bg-primary/5' : 'border-border bg-card'}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{loc.city}, {loc.country}</span>
                            {loc.isPrimary && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold">HQ</span>}
                          </div>
                          <p className="text-sm text-muted-foreground">{loc.address}</p>
                          {loc.phone && <p className="text-sm text-muted-foreground">{loc.phone}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Form */}
              <div className="rounded-2xl border border-border bg-card p-8">
                <h2 className="text-2xl font-bold mb-2">Get Your Free SEO Audit</h2>
                <p className="text-muted-foreground text-sm mb-6">Fill in the form and we'll get back to you within 24 hours.</p>
                <ContactForm/>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer/>
    </>
  );
}
