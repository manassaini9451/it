'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { selectIsAuth, selectIsLoading, selectRole, setCredentials, setAuthenticated } from '@/store/slices/authSlice';
import api, { setToken } from '@/lib/api';

export default function AuthGuard({ children, requiredRoles }: { children: React.ReactNode; requiredRoles?: string[] }) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuth = useAppSelector(selectIsAuth);
  const isLoading = useAppSelector(selectIsLoading);
  const role = useAppSelector(selectRole);

  useEffect(() => {
    const verify = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) { dispatch(setAuthenticated(false)); router.replace('/auth/login'); return; }
      try {
        const res = await api.get('/v1/auth/me');
        dispatch(setCredentials({ user: res.data.data, accessToken: token }));
      } catch { dispatch(setAuthenticated(false)); router.replace('/auth/login'); }
    };
    if (!isAuth) verify();
  }, [isAuth]);

  useEffect(() => {
    if (!isLoading && isAuth && requiredRoles && role && !requiredRoles.includes(role)) {
      router.replace('/unauthorized');
    }
  }, [isLoading, isAuth, role, requiredRoles]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin"/>
        <p className="text-sm text-muted-foreground">Authenticating...</p>
      </div>
    </div>
  );

  if (!isAuth) return null;
  return <>{children}</>;
}
