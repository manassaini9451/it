'use client';
import Link from 'next/link';
import { ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';

interface Props {
  title: string;
  backHref: string;
  onSave: () => void;
  onDelete?: () => void;
  saving?: boolean;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export default function AdminFormPage({ title, backHref, onSave, onDelete, saving, children, actions }: Props) {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="h-9 w-9 rounded-lg border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ArrowLeft className="h-4 w-4"/>
          </Link>
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {onDelete && (
            <button onClick={onDelete} className="h-9 px-4 flex items-center gap-2 rounded-lg border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium">
              <Trash2 className="h-4 w-4"/>Delete
            </button>
          )}
          <button onClick={onSave} disabled={saving} className="btn-primary h-9 text-sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <Save className="h-4 w-4"/>}
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
