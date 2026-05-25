'use client';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/hooks/useRedux';
import { setCredentials } from '@/store/slices/authSlice';
import api, { setToken } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = params.get('token');
    if (!token) { router.replace('/auth/login'); return; }
    setToken(token);
    api.get('/v1/auth/me').then(res => {
      const user = res.data?.data;
      dispatch(setCredentials({ user, accessToken: token }));
      const role = typeof user.role === 'string' ? user.role : user.role?.name;
      router.replace(['super-admin','admin','editor'].includes(role) ? '/admin' : '/');
    }).catch(() => router.replace('/auth/login'));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"/>
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}
