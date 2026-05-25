'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

const schema = z.object({
  firstName: z.string().min(2,'Min 2 chars'),
  lastName: z.string().min(2,'Min 2 chars'),
  email: z.string().email('Valid email required'),
  password: z.string().min(8,'Min 8 chars'),
  confirm: z.string(),
  terms: z.boolean().refine(v=>v,'Must accept terms'),
}).refine(d=>d.password===d.confirm,{message:"Passwords don't match",path:['confirm']});
type Form = z.infer<typeof schema>;

const perks = ['Free 30-day trial','All SEO tools included','Real-time analytics','Dedicated onboarding'];

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const { register, handleSubmit, formState:{errors,isSubmitting} } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError(null);
    try {
      await api.post('/v1/auth/register', { firstName:data.firstName, lastName:data.lastName, email:data.email, password:data.password });
      setSuccess(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg)?msg[0]:msg??'Registration failed.');
    }
  };

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center max-w-md">
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="h-8 w-8 text-green-500"/></div>
        <h2 className="text-2xl font-bold mb-2">Check your email!</h2>
        <p className="text-muted-foreground mb-6">We sent a verification link. Click it to activate your account.</p>
        <Link href="/auth/login" className="btn-primary h-10 px-6">Back to Login</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary via-primary/80 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10"/>
        <Link href="/" className="relative flex items-center gap-2.5 text-white font-bold text-xl">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">S</div>SEO Platform
        </Link>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white">Start your SEO journey today</h1>
          <ul className="mt-8 space-y-4">{perks.map(p=><li key={p} className="flex items-center gap-3 text-white/80"><CheckCircle2 className="h-5 w-5 text-green-400 shrink-0"/>{p}</li>)}</ul>
        </div>
        <p className="relative text-white/40 text-sm">© {new Date().getFullYear()} SEO Platform</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <motion.div initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} className="w-full max-w-md py-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Create your account</h2>
            <p className="text-muted-foreground mt-1">Already have one? <Link href="/auth/login" className="text-primary hover:underline font-medium">Sign in</Link></p>
          </div>
          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">First name</label>
                <input {...register('firstName')} placeholder="John" className={`input-base ${errors.firstName?'border-destructive':''}`}/>
                {errors.firstName&&<p className="mt-1 text-xs text-destructive">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Last name</label>
                <input {...register('lastName')} placeholder="Doe" className={`input-base ${errors.lastName?'border-destructive':''}`}/>
                {errors.lastName&&<p className="mt-1 text-xs text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <input {...register('email')} type="email" placeholder="john@example.com" className={`input-base ${errors.email?'border-destructive':''}`}/>
              {errors.email&&<p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <input {...register('password')} type={showPass?'text':'password'} placeholder="Min 8 characters" className={`input-base pr-10 ${errors.password?'border-destructive':''}`}/>
                <button type="button" onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}
                </button>
              </div>
              {errors.password&&<p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Confirm password</label>
              <input {...register('confirm')} type="password" placeholder="Repeat password" className={`input-base ${errors.confirm?'border-destructive':''}`}/>
              {errors.confirm&&<p className="mt-1 text-xs text-destructive">{errors.confirm.message}</p>}
            </div>
            <div className="flex items-start gap-2">
              <input {...register('terms')} type="checkbox" id="terms" className="h-4 w-4 rounded border-border mt-0.5"/>
              <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the <Link href="/terms" className="text-primary hover:underline">Terms</Link> and <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </label>
            </div>
            {errors.terms&&<p className="text-xs text-destructive">{errors.terms.message}</p>}
            <button type="submit" disabled={isSubmitting} className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isSubmitting?<><Loader2 className="h-4 w-4 animate-spin"/>Creating account...</>:<>Create account<ArrowRight className="h-4 w-4"/></>}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
