import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Cta from '@/components/sections/Cta';
import api from '@/lib/api';
import { MapPin, Briefcase, ArrowRight } from 'lucide-react';

export const revalidate = 60;
export const metadata: Metadata = {
  title: 'Careers — Join Our SEO Team | SEO Platform',
  description: 'Join our world-class SEO team. We are hiring SEO strategists, content managers, link builders and technical SEO analysts. View all open positions.',
  openGraph: { title: 'Careers — Join Our SEO Team', description: 'We are hiring! View open positions at SEO Platform.', images: ['/og-image.jpg'], type: 'website' },
  twitter: { card: 'summary_large_image', title: 'Careers — SEO Platform', images: ['/og-image.jpg'] },
};

async function getData() {
  const results = await Promise.allSettled([api.get('/v1/jobs?status=published&limit=50'),api.get('/v1/settings/cta'),api.get('/v1/settings/general')]);
  return { jobs:results[0].status==='fulfilled'?results[0].value.data?.data?.items||[]:[], cta:results[1].status==='fulfilled'?results[1].value.data?.data:null, general:results[2].status==='fulfilled'?results[2].value.data?.data:null };
}

const typeBadge: Record<string,string> = {'Full-time':'bg-green-500/10 text-green-600','Part-time':'bg-blue-500/10 text-blue-600','Contract':'bg-orange-500/10 text-orange-600','Remote':'bg-purple-500/10 text-purple-600'};

export default async function CareersPage() {
  const { jobs, cta, general } = await getData();
  const departments: Record<string,any[]> = {};
  jobs.forEach((j: any) => { const d=j.department||'General'; if(!departments[d])departments[d]=[]; departments[d].push(j); });

  return (
    <>
      <Navbar general={general}/>
      <main>
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-7xl mx-auto px-4 text-center">
            <p className="text-sm font-medium text-primary uppercase tracking-widest mb-3">Careers</p>
            <h1 className="text-4xl sm:text-5xl font-bold">Join our <span className="gradient-text">world-class team</span></h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">{jobs.length>0?`${jobs.length} open positions available.`:'Check back soon for openings.'}</p>
          </div>
        </section>
        <section className="section-padding">
          <div className="container max-w-4xl mx-auto px-4">
            {jobs.length===0 ? (
              <div className="py-20 text-center rounded-2xl border border-border bg-card">
                <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30"/>
                <h2 className="text-xl font-semibold">No open positions right now</h2>
                <p className="text-muted-foreground mt-2">Send your CV to <a href={`mailto:${general?.supportEmail||'careers@seoplatform.com'}`} className="text-primary hover:underline">{general?.supportEmail||'careers@seoplatform.com'}</a></p>
              </div>
            ) : (
              <div className="space-y-10">
                {Object.entries(departments).map(([dept,deptJobs])=>(
                  <div key={dept}>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><span className="h-1 w-6 rounded-full bg-primary inline-block"/>{dept}</h2>
                    <div className="space-y-3">
                      {deptJobs.map((job: any)=>(
                        <Link key={job._id} href={`/careers/${job.slug}`} className="group flex items-center justify-between gap-4 p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all">
                          <div>
                            <h3 className="font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
                            <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
                              {job.location&&<span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/>{job.location}</span>}
                              {job.salary&&<span>{job.salary}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {job.type&&<span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-full font-medium ${typeBadge[job.type]||'bg-muted text-muted-foreground'}`}>{job.type}</span>}
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all"/>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        <Cta data={cta}/>
      </main>
      <Footer general={general}/>
    </>
  );
}