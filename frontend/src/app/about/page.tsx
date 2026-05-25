import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Cta from '@/components/sections/Cta';
import api from '@/lib/api';
import { CheckCircle2, TrendingUp } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  try { const r = await api.get('/v1/settings/general'); const g = r.data?.data; if (g) return { title: `About Us — ${g.siteName}`, description: `Learn about ${g.siteName} — our mission, team and story.` }; } catch {}
  return { title: 'About Us — Our Story, Mission & Expert Team', description: 'Learn about SEO Platform — our mission to help businesses rank higher.' };
}

async function getData() {
  const results = await Promise.allSettled([api.get('/v1/settings/about'), api.get('/v1/settings/stats'), api.get('/v1/settings/cta')]);
  return {
    about: results[0].status === 'fulfilled' ? results[0].value.data?.data : null,
    stats: results[1].status === 'fulfilled' ? results[1].value.data?.data : null,
    cta:   results[2].status === 'fulfilled' ? results[2].value.data?.data : null,
  };
}

const FALLBACK_STATS = [{ value:'2,500+',label:'Happy Clients'},{value:'10+',label:'Years Experience'},{value:'50M+',label:'Keywords Ranked'},{value:'98%',label:'Client Retention'}];
const FALLBACK_TEAM = [
  {name:'Alex Johnson',role:'CEO & Founder',bio:'15+ years in SEO. Former Google employee and author of "SEO at Scale".',initials:'AJ'},
  {name:'Sarah Chen',role:'Head of SEO Strategy',bio:'Expert in technical SEO, e-commerce SEO, and international strategy.',initials:'SC'},
  {name:'Mike Roberts',role:'Director, Link Building',bio:'White-hat link acquisition specialist with 10+ years experience.',initials:'MR'},
  {name:'Lisa Park',role:'Head of Content',bio:'SEO-driven content strategy expert. Former editor at Search Engine Journal.',initials:'LP'},
  {name:'David Kim',role:'Technical SEO Lead',bio:'Core Web Vitals and JavaScript SEO specialist. Google certified.',initials:'DK'},
  {name:'Emma Wilson',role:'Analytics Director',bio:'SEO attribution modeling and data science expert.',initials:'EW'},
];
const FALLBACK_TIMELINE = [
  {year:'2015',event:'Founded in San Francisco with a mission to democratize enterprise SEO'},
  {year:'2017',event:'Reached 500 clients and launched our AI SEO analysis tool'},
  {year:'2019',event:'Expanded to enterprise clients and launched real-time analytics platform'},
  {year:'2021',event:'Crossed $10M ARR and opened offices in London and Singapore'},
  {year:'2023',event:'Launched AI-powered recommendations and hit 2,000+ clients'},
  {year:'2024',event:'Named #1 SEO Platform by G2 with 2,500+ global clients'},
];

export default async function AboutPage() {
  const { about, stats, cta } = await getData();
  const a = about || {};
  const team = a.team?.length ? a.team : FALLBACK_TEAM;
  const timeline = a.timeline?.length ? a.timeline : FALLBACK_TIMELINE;
  const statItems = stats ? [
    { value: `${stats.totalClients?.toLocaleString()}+`, label:'Happy Clients' },
    { value: `${stats.yearsExperience}+`, label:'Years Experience' },
    { value: stats.keywordsRanked, label:'Keywords Ranked' },
    { value: `${stats.clientRetention}%`, label:'Client Retention' },
  ] : FALLBACK_STATS;

  return (
    <>
      <Navbar/>
      <main className="min-h-screen">
        {/* Hero */}
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-widest">About Us</p>
            <h1 className="mt-3 text-4xl sm:text-5xl font-bold">We exist to help businesses <span className="gradient-text">win online</span></h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">{a.mission || 'Our mission is to democratize enterprise SEO and help every business compete online.'}</p>
          </div>
        </section>

        {/* Stats */}
        <section className="section-padding border-b border-border">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {statItems.map((s: any) => (
                <div key={s.label} className="text-center">
                  <p className="text-4xl font-bold gradient-text">{s.value}</p>
                  <p className="mt-2 text-muted-foreground font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section-padding">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{a.story || 'Founded in 2015 by a team of ex-Google engineers and digital marketing veterans, we were built to bridge the gap between enterprise SEO tools and small-to-medium businesses.'}</p>
          </div>
        </section>

        {/* Values */}
        {a.values?.length > 0 && (
          <section className="section-padding bg-muted/20">
            <div className="container max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {a.values.map((v: any) => (
                  <div key={v.title} className="rounded-xl border border-border bg-card p-6">
                    <CheckCircle2 className="h-8 w-8 text-primary mb-4"/>
                    <h3 className="font-semibold text-lg mb-2">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Timeline */}
        <section className="section-padding">
          <div className="container max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
            <div className="relative border-l-2 border-primary/20 pl-8 space-y-8">
              {timeline.map((t: any) => (
                <div key={t.year} className="relative">
                  <div className="absolute -left-[41px] top-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white"/>
                  </div>
                  <span className="inline-block text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full mb-1">{t.year}</span>
                  <p className="text-muted-foreground">{t.event}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section-padding bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Meet the Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {team.map((m: any) => (
                <div key={m.name} className="rounded-xl border border-border bg-card p-6 text-center">
                  <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-4">
                    {m.initials || m.name?.slice(0,2).toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-lg">{m.name}</h3>
                  <p className="text-sm text-primary font-medium mt-1">{m.role}</p>
                  <p className="text-sm text-muted-foreground mt-3">{m.bio}</p>
                  {m.linkedIn && m.linkedIn !== '#' && (
                    <Link href={m.linkedIn} target="_blank" className="inline-flex items-center gap-1 mt-4 text-xs text-primary hover:underline">LinkedIn →</Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Awards */}
        {a.awards?.length > 0 && (
          <section className="section-padding">
            <div className="container max-w-7xl mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Awards & Recognition</h2>
              <div className="flex flex-wrap justify-center gap-4">
                {a.awards.map((aw: any) => (
                  <div key={aw.name} className="flex items-center gap-3 px-6 py-4 rounded-xl border border-border bg-card">
                    <TrendingUp className="h-6 w-6 text-primary"/>
                    <div><p className="font-semibold">{aw.name}</p><p className="text-xs text-muted-foreground">{aw.category}</p></div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <Cta data={cta}/>
      </main>
      <Footer/>
    </>
  );
}
