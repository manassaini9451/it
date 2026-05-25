'use client';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { removeToast, selectToasts } from '@/store/slices/uiSlice';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function ToastProvider() {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => <ToastItem key={t.id} {...t} onDismiss={() => dispatch(removeToast(t.id))} />)}
    </div>
  );
}

function ToastItem({ id, title, description, variant = 'default', onDismiss }: any) {
  useEffect(() => { const timer = setTimeout(onDismiss, 4000); return () => clearTimeout(timer); }, []);
  const cls = variant === 'destructive' ? 'bg-red-500 text-white border-red-600' : variant === 'success' ? 'bg-green-500 text-white border-green-600' : 'bg-card border-border text-card-foreground';
  const Icon = variant === 'success' ? CheckCircle2 : variant === 'destructive' ? AlertCircle : Info;
  return (
    <div className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-fade-in-up ${cls}`}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold">{title}</p>}
        {description && <p className="text-xs opacity-90 mt-0.5">{description}</p>}
      </div>
      <button onClick={onDismiss} className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"><X className="h-3.5 w-3.5" /></button>
    </div>
  );
}
