import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import api from '@/lib/api';
import { ArrowLeft, MapPin, Clock, Briefcase, DollarSign, Calendar } from 'lucide-react';

export const revalidate = 60;

async function getJob(slug: string) {
  try {
    const r = await api.get(`/v1/jobs/slug/${slug}`);
    return r.data?.data || null;
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: 'Job Not Found' };
  return { title: `${job.title} — Careers`, description: `${job.title} at ${job.department || 'SEO Platform'}. ${job.location}` };
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [job, general] = await Promise.all([
    getJob(slug),
    api.get('/v1/settings/general').then(r => r.data?.data).catch(() => null),
  ]);
  if (!job) notFound();

  const meta = [
    { icon: Briefcase, label: 'Department', val: job.department },
    { icon: MapPin,    label: 'Location',   val: job.location },
    { icon: Clock,     label: 'Type',       val: job.type },
    { icon: DollarSign,label: 'Salary',     val: job.salary },
  ].filter(m => m.val);

  return (
    <>
      <Navbar general={general}/>
      <main className="min-h-screen">
        <section className="section-padding border-b border-border bg-muted/20">
          <div className="container max-w-4xl mx-auto px-4">
            <Link href="/careers" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4"/>Back to careers
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">{job.title}</h1>
                <div className="flex flex-wrap gap-3 mt-3">
                  {meta.map(m => (
                    <span key={m.label} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <m.icon className="h-4 w-4 text-primary"/>{m.val}
                    </span>
                  ))}
                </div>
              </div>
              <a href={`mailto:${general?.supportEmail || 'careers@seoplatform.com'}?subject=Application: ${job.title}`}
                className="btn-primary h-11 px-6 text-sm shrink-0">Apply Now</a>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              <div className="lg:col-span-2 space-y-8">
                {job.description && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">About the Role</h2>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: job.description }}/>
                  </div>
                )}
                {job.requirements && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Requirements</h2>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: job.requirements }}/>
                  </div>
                )}
                {job.benefits && (
                  <div>
                    <h2 className="text-xl font-bold mb-4">Benefits</h2>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: job.benefits }}/>
                  </div>
                )}
              </div>
              <div>
                <div className="rounded-xl border border-border bg-card p-6 sticky top-24">
                  <h3 className="font-semibold mb-4">Apply for this role</h3>
                  <p className="text-sm text-muted-foreground mb-4">Send your CV and a short cover letter to:</p>
                  <a href={`mailto:${general?.supportEmail || 'careers@seoplatform.com'}?subject=Application: ${job.title}`}
                    className="text-sm font-medium text-primary hover:underline break-all">
                    {general?.supportEmail || 'careers@seoplatform.com'}
                  </a>
                  <div className="mt-6">
                    <a href={`mailto:${general?.supportEmail || 'careers@seoplatform.com'}?subject=Application: ${job.title}`}
                      className="btn-primary w-full justify-center text-sm h-11">Apply Now</a>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 text-center">We respond to all applications within 5 business days.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer general={general}/>
    </>
  );
}
