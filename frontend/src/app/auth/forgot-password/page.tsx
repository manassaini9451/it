'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

const schema = z.object({ email: z.string().email('Valid email required') });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError(null);
    try { await api.post('/v1/auth/forgot-password', data); setSuccess(true); }
    catch (err: any) { const msg=err.response?.data?.message; setError(Array.isArray(msg)?msg[0]:msg??'Request failed.'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"><ArrowLeft className="h-4 w-4"/>Back to Login</Link>
        {success ? (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="h-8 w-8 text-green-500"/></div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-muted-foreground">If that email exists, we sent a reset link. Check your inbox.</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-2">Forgot password?</h2>
            <p className="text-muted-foreground mb-8">Enter your email and we'll send you a reset link.</p>
            {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Email address</label>
                <input {...register('email')} type="email" placeholder="john@example.com" className={`input-base ${errors.email?'border-destructive':''}`}/>
                {errors.email&&<p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
                {isSubmitting?<><Loader2 className="h-4 w-4 animate-spin"/>Sending...</>:'Send Reset Link'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
