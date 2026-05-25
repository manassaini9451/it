'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

const schema = z.object({
  firstName: z.string().min(2,'Min 2 chars'),
  lastName: z.string().min(2,'Min 2 chars'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  service: z.string().min(1,'Please select a service'),
  budget: z.string().min(1,'Please select a budget'),
  message: z.string().min(20,'At least 20 characters'),
});
type Form = z.infer<typeof schema>;

const services = ['SEO Services','Local SEO','Link Building','Content Marketing','Technical SEO','SEO Audit','E-Commerce SEO','Enterprise SEO'];
const budgets = ['Under $500/mo','$500–$1,000/mo','$1,000–$2,500/mo','$2,500–$5,000/mo','$5,000–$10,000/mo','$10,000+/mo'];

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const { register, handleSubmit, formState:{errors,isSubmitting}, reset } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError(null);
    try { await api.post('/v1/leads', data); setSubmitted(true); reset(); }
    catch (err: any) { const msg=err.response?.data?.message; setError(Array.isArray(msg)?msg[0]:msg??'Submission failed. Please try again.'); }
  };

  if (submitted) return (
    <div className="h-full flex items-center justify-center text-center py-16">
      <div>
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="h-8 w-8 text-green-500"/></div>
        <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
        <p className="text-muted-foreground max-w-sm mx-auto">Our team will review your details and get back to you within 2 business hours.</p>
        <button onClick={()=>setSubmitted(false)} className="mt-6 btn-outline h-10 text-sm">Send another message</button>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="First Name *" error={errors.firstName?.message}><input {...register('firstName')} placeholder="John" className={`input-base ${errors.firstName?'border-destructive':''}`}/></Field>
        <Field label="Last Name *" error={errors.lastName?.message}><input {...register('lastName')} placeholder="Doe" className={`input-base ${errors.lastName?'border-destructive':''}`}/></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Email *" error={errors.email?.message}><input {...register('email')} type="email" placeholder="john@company.com" className={`input-base ${errors.email?'border-destructive':''}`}/></Field>
        <Field label="Phone"><input {...register('phone')} type="tel" placeholder="+1 (555) 000-0000" className="input-base"/></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Company"><input {...register('company')} placeholder="Your Company" className="input-base"/></Field>
        <Field label="Website" error={errors.website?.message}><input {...register('website')} type="url" placeholder="https://yourwebsite.com" className={`input-base ${errors.website?'border-destructive':''}`}/></Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field label="Service Needed *" error={errors.service?.message}>
          <select {...register('service')} className={`input-base ${errors.service?'border-destructive':''}`}>
            <option value="">Select a service</option>
            {services.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Monthly Budget *" error={errors.budget?.message}>
          <select {...register('budget')} className={`input-base ${errors.budget?'border-destructive':''}`}>
            <option value="">Select budget range</option>
            {budgets.map(b=><option key={b} value={b}>{b}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Message *" error={errors.message?.message}>
        <textarea {...register('message')} rows={5} placeholder="Tell us about your business goals and current SEO challenges..." className={`input-base resize-none ${errors.message?'border-destructive':''}`}/>
      </Field>
      {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}
      <button type="submit" disabled={isSubmitting} className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm">
        {isSubmitting?<><Loader2 className="h-4 w-4 animate-spin"/>Sending...</>:<><Send className="h-4 w-4"/>Send Message &amp; Get Free Audit</>}
      </button>
      <p className="text-center text-xs text-muted-foreground">We respect your privacy. No spam, ever.</p>
    </form>
  );
}

function Field({ label, error, children }: { label:string; error?:string; children:React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
