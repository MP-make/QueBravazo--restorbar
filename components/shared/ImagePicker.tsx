"use client";
import { useState, useRef } from "react";
import { Upload, Link, Clipboard, X, Loader2, FileVideo, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImagePickerProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  compact?: boolean;
}

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
}

function getFileName(url: string) {
  try { return url.split('/').pop() || url; } catch { return url; }
}

export default function ImagePicker({ value, onChange, label, compact }: ImagePickerProps) {
  const [uploading, setUploading] = useState(false);
  const [pasting, setPasting] = useState(false);
  const [imgError, setImgError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setImgError(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) onChange(json.url);
    } catch {} finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handlePasteFromClipboard() {
    try {
      setPasting(true);
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find(t => t.startsWith('image/'));
        if (imageType) {
          const blob = await item.getType(imageType);
          const fd = new FormData();
          fd.append('file', blob, `pasted.${imageType.split('/')[1] || 'png'}`);
          const res = await fetch('/api/admin/media/upload', { method: 'POST', body: fd });
          const json = await res.json();
          if (json.url) onChange(json.url);
          break;
        }
      }
    } catch {} finally {
      setPasting(false);
    }
  }

  function handleInputPaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          setUploading(true);
          const fd = new FormData();
          fd.append('file', file);
          fetch('/api/admin/media/upload', { method: 'POST', body: fd })
            .then(r => r.json())
            .then(json => { if (json.url) onChange(json.url); })
            .finally(() => setUploading(false));
        }
        break;
      }
    }
  }

  const isVideo = isVideoUrl(value);

  return (
    <div className={compact ? "" : ""}>
      {label && <label className="block text-xs font-medium text-stone-400 mb-1.5">{label}</label>}

      {/* Preview */}
      {value && (
        <div className={`relative mb-2 rounded-xl overflow-hidden bg-stone-800 border border-stone-700 group ${compact ? 'h-20' : 'h-28'}`}>
          {isVideo ? (
            <div className="w-full h-full flex items-center justify-center bg-stone-800/80">
              <video src={value} muted loop playsInline preload="metadata" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs">
                  <FileVideo size={14} />
                  {getFileName(value)}
                </div>
              </div>
            </div>
          ) : (
            <>
              {imgError ? (
                <div className="w-full h-full flex items-center justify-center bg-stone-800/80">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 text-white text-xs">
                    <ImageIcon size={14} />
                    {getFileName(value)}
                  </div>
                </div>
              ) : (
                <Image
                  src={value}
                  alt={label || ""}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={() => setImgError(true)}
                />
              )}
            </>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white/60 hover:text-white transition-colors"
          >
            <X size={11} />
          </button>
        </div>
      )}

      {/* URL input + buttons */}
      <div className="flex gap-1.5">
        <div className="flex-1 relative">
          <Link size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPaste={handleInputPaste}
            placeholder="URL, pegar (Ctrl+V) o subir..."
            className="w-full pl-8 pr-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-white text-xs placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
        </div>
        <label className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${uploading ? 'bg-stone-700 text-stone-400' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'}`}>
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          <input type="file" accept="image/*,video/*,.gif,.webp" className="hidden" onChange={handleFileUpload} disabled={uploading} ref={fileInputRef} />
        </label>
        <button
          type="button"
          onClick={handlePasteFromClipboard}
          disabled={pasting}
          className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${pasting ? 'bg-stone-700 text-stone-400' : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'}`}
          title="Pegar desde portapapeles"
        >
          {pasting ? <Loader2 size={13} className="animate-spin" /> : <Clipboard size={13} />}
        </button>
      </div>
    </div>
  );
}
