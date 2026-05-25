'use client';
import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Trash2, Copy, Check, FileText, Film, Music, Archive, X } from 'lucide-react';
import { useAppDispatch } from '@/hooks/useRedux';
import { addToast } from '@/store/slices/uiSlice';

const ACCEPT = 'image/*,application/pdf,.doc,.docx,.mp4,.mp3,.zip';

interface MediaFile { id: string; name: string; url: string; type: string; size: number; uploadedAt: string; }

export default function AdminMediaPage() {
  const dispatch = useAppDispatch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState<string|null>(null);
  const [view, setView] = useState<'grid'|'list'>('grid');
  const [preview, setPreview] = useState<MediaFile|null>(null);

  const handleUpload = useCallback(async (fileList: FileList|null) => {
    if (!fileList?.length) return;
    setUploading(true);
    const newFiles: MediaFile[] = [];
    for (const file of Array.from(fileList)) {
      // Create object URL for preview (real upload would POST to /api/v1/media)
      const url = URL.createObjectURL(file);
      newFiles.push({ id: Date.now().toString()+Math.random(), name: file.name, url, type: file.type, size: file.size, uploadedAt: new Date().toISOString() });
    }
    // Simulate upload delay
    await new Promise(r => setTimeout(r, 800));
    setFiles(prev => [...newFiles, ...prev]);
    setUploading(false);
    dispatch(addToast({ id: Date.now().toString(), title: `${newFiles.length} file(s) uploaded`, variant: 'success' }));
  }, [dispatch]);

  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setDragging(false); handleUpload(e.dataTransfer.files); };
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    dispatch(addToast({ id: Date.now().toString(), title: 'URL copied!', variant: 'success' }));
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    dispatch(addToast({ id: Date.now().toString(), title: 'File removed', variant: 'success' }));
  };

  const fileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-400"/>;
    if (type.startsWith('video/')) return <Film className="h-8 w-8 text-purple-400"/>;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-green-400"/>;
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-400"/>;
    return <Archive className="h-8 w-8 text-gray-400"/>;
  };

  const fmtSize = (bytes: number) => bytes < 1024*1024 ? `${(bytes/1024).toFixed(1)}KB` : `${(bytes/(1024*1024)).toFixed(1)}MB`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold">Media Library</h1><p className="text-sm text-muted-foreground mt-0.5">{files.length} files uploaded</p></div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={()=>setView('grid')} className={`px-3 py-2 text-sm transition-colors ${view==='grid'?'bg-primary text-primary-foreground':'hover:bg-accent'}`}>Grid</button>
            <button onClick={()=>setView('list')} className={`px-3 py-2 text-sm transition-colors ${view==='list'?'bg-primary text-primary-foreground':'hover:bg-accent'}`}>List</button>
          </div>
          <button onClick={()=>inputRef.current?.click()} disabled={uploading} className="btn-primary h-9 text-sm">
            <Upload className="h-4 w-4"/>{uploading ? 'Uploading…' : 'Upload'}
          </button>
          <input ref={inputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={e=>handleUpload(e.target.files)}/>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop} onDragOver={onDragOver} onDragLeave={()=>setDragging(false)}
        onClick={()=>inputRef.current?.click()}
        className={`rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${dragging?'border-primary bg-primary/5':'border-border hover:border-primary/50 hover:bg-muted/20'}`}
      >
        <Upload className={`h-8 w-8 mx-auto mb-3 transition-colors ${dragging?'text-primary':'text-muted-foreground'}`}/>
        <p className="font-medium">{dragging ? 'Drop to upload!' : 'Drop files here or click to upload'}</p>
        <p className="text-sm text-muted-foreground mt-1">Images, PDFs, videos, docs — max 10MB each</p>
      </div>

      {/* File grid/list */}
      {files.length > 0 && (
        view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {files.map((file,i) => (
              <motion.div key={file.id} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:i*0.03}} className="group relative rounded-xl border border-border bg-card overflow-hidden hover:border-primary/30 hover:shadow-md transition-all">
                <div className="aspect-square flex items-center justify-center bg-muted/30 cursor-pointer" onClick={()=>setPreview(file)}>
                  {file.type.startsWith('image/') ? <img src={file.url} alt={file.name} className="w-full h-full object-cover"/> : <div className="p-4">{fileIcon(file.type)}</div>}
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-[10px] text-muted-foreground">{fmtSize(file.size)}</p>
                </div>
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={()=>copyUrl(file.url,file.id)} className="h-6 w-6 rounded bg-background/90 backdrop-blur flex items-center justify-center hover:bg-background shadow-sm">
                    {copied===file.id ? <Check className="h-3 w-3 text-green-500"/> : <Copy className="h-3 w-3"/>}
                  </button>
                  <button onClick={()=>deleteFile(file.id)} className="h-6 w-6 rounded bg-background/90 backdrop-blur flex items-center justify-center hover:bg-destructive/20 hover:text-destructive shadow-sm">
                    <Trash2 className="h-3 w-3"/>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30"><th className="text-left px-4 py-3 font-medium text-muted-foreground">File</th><th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Type</th><th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Size</th><th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th></tr></thead>
              <tbody>
                {files.map((file,i)=>(
                  <tr key={file.id} className="border-b border-border last:border-0 hover:bg-muted/20 group">
                    <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="h-8 w-8 rounded overflow-hidden bg-muted flex items-center justify-center shrink-0">{file.type.startsWith('image/')?<img src={file.url} alt="" className="w-full h-full object-cover"/>:fileIcon(file.type)}</div><span className="font-medium truncate max-w-xs">{file.name}</span></div></td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground text-xs">{file.type}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{fmtSize(file.size)}</td>
                    <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={()=>copyUrl(file.url,file.id)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-accent text-muted-foreground transition-colors">{copied===file.id?<Check className="h-3.5 w-3.5 text-green-500"/>:<Copy className="h-3.5 w-3.5"/>}</button>
                      <button onClick={()=>deleteFile(file.id)} className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="h-3.5 w-3.5"/></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={()=>setPreview(null)}>
          <div className="relative max-w-2xl w-full" onClick={e=>e.stopPropagation()}>
            <button onClick={()=>setPreview(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white"><X className="h-5 w-5"/></button>
            {preview.type.startsWith('image/') && <img src={preview.url} alt={preview.name} className="rounded-xl max-h-[80vh] w-full object-contain"/>}
            <div className="mt-2 flex items-center justify-between px-1">
              <p className="text-white/70 text-sm">{preview.name} · {fmtSize(preview.size)}</p>
              <button onClick={()=>copyUrl(preview.url,preview.id)} className="text-white/70 hover:text-white flex items-center gap-1.5 text-sm">{copied===preview.id?<Check className="h-4 w-4 text-green-400"/>:<Copy className="h-4 w-4"/>}Copy URL</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
