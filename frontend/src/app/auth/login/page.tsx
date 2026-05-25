'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useRedux';
import { setCredentials } from '@/store/slices/authSlice';
import api, { setToken } from '@/lib/api';

const schema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(1, 'Password required'),
});
type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    setError(null);
    try {
      const res = await api.post('/v1/auth/login', data);
      const payload = res.data?.data ?? res.data;
      const { user, accessToken } = payload;

      if (!user || !accessToken) throw new Error('Invalid response from server');

      setToken(accessToken);
      dispatch(setCredentials({ user, accessToken }));

      const role = typeof user.role === 'string' ? user.role : user.role?.name;
      const dest = ['super-admin', 'admin', 'editor'].includes(role) ? '/admin' : '/';
      router.push(dest);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message;
      setError(Array.isArray(msg) ? msg[0] : msg ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary via-primary/80 to-purple-700 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10"/>
        <Link href="/" className="relative flex items-center gap-2.5 text-white font-bold text-xl">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">S</div>SEO Platform
        </Link>
        <div className="relative">
          <h1 className="text-4xl font-bold text-white leading-tight">Welcome back to the future of SEO</h1>
          <p className="mt-4 text-white/70 text-lg">Sign in to access your SEO dashboard, analytics, and tools.</p>
          <div className="mt-10 p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/20">
            <p className="text-white/90 italic">"SEO Platform increased our organic traffic by 420% in 8 months. Extraordinary ROI."</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white">SJ</div>
              <div><p className="font-semibold text-sm text-white">Sarah Johnson</p><p className="text-xs text-white/60">CEO, TechStartup Inc</p></div>
            </div>
          </div>
        </div>
        <p className="relative text-white/40 text-sm">© {new Date().getFullYear()} SEO Platform</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md">
          <Link href="/" className="lg:hidden flex items-center gap-2 mb-8 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">S</div>SEO Platform
          </Link>
          <div className="mb-8">
            <h2 className="text-2xl font-bold">Sign in to your account</h2>
            <p className="text-muted-foreground mt-1">Don't have an account? <Link href="/auth/register" className="text-primary hover:underline font-medium">Sign up free</Link></p>
          </div>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <input {...register('email')} type="email" placeholder="john@example.com" autoComplete="email" className={`input-base pl-9 ${errors.email ? 'border-destructive' : ''}`}/>
              </div>
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <input {...register('password')} type={showPass ? 'text' : 'password'} placeholder="••••••••" autoComplete="current-password" className={`input-base pl-9 pr-10 ${errors.password ? 'border-destructive' : ''}`}/>
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full h-11 flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin"/>Signing in...</> : <>Sign in<ArrowRight className="h-4 w-4"/></>}
            </button>
          </form>

          <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Demo credentials:</p>
            <p className="text-xs text-foreground">Email: <span className="font-mono text-primary">admin@seoplatform.com</span></p>
            <p className="text-xs text-foreground">Password: <span className="font-mono text-primary">Admin@1234</span></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}