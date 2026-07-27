"use client";
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui';
import { useSearchStore } from '@/lib/stores/search';
import { useHomepageContent } from '@/lib/hooks/useHomepageContent';

export default function LandingHeader() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { setIsCartOpen } = useUIStore();
  const { setIsOpen: setIsSearchOpen } = useSearchStore();
  const content = useHomepageContent();
  const whatsappNumber = content.contact_whatsapp.replace(/[^0-9]/g, '');

  return (
    <>
      {/* Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-screen w-[320px] bg-[#1a1a1d] border-r border-white/10 shadow-2xl shadow-black/50 flex flex-col justify-between animate-slide-in" style={{ fontFamily: 'var(--font-sans)' }}>
            {/* BLOQUE SUPERIOR: Header + Buscador + Enlaces */}
            <div>
              <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
                <Link href="/" className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#ff5722]/30">
                    <Image src="/logo_que_bravazo.png" alt="¡Qué Bravazo!" fill className="object-cover" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-stone-400 text-[10px] font-bold tracking-[0.2em] uppercase">Menú</p>
                    <p className="text-white font-black text-sm uppercase">¡Qué Bravazo!</p>
                  </div>
                </Link>
                <button onClick={() => setSidebarOpen(false)} className="p-2 text-stone-400 hover:text-white transition-colors" aria-label="Cerrar">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-5 py-6 flex flex-col gap-1">
                <button
                  onClick={() => { setIsSearchOpen(true); setSidebarOpen(false); }}
                  className="block w-full text-left py-4 text-2xl font-black text-white uppercase tracking-widest hover:text-[#ff5722] transition-colors border-b border-white/5"
                >
                  Buscar
                </button>
                <Link href="/" onClick={() => setSidebarOpen(false)} className="block py-4 text-2xl font-black text-white uppercase tracking-widest hover:text-[#ff5722] transition-colors border-b border-white/5">
                  Inicio
                </Link>
                <Link href="/menu" onClick={() => setSidebarOpen(false)} className="block py-4 text-2xl font-black text-white uppercase tracking-widest hover:text-[#ff5722] transition-colors border-b border-white/5">
                  Menú
                </Link>
                <Link href="/ubicanos" onClick={() => setSidebarOpen(false)} className="block py-4 text-2xl font-black text-white uppercase tracking-widest hover:text-[#ff5722] transition-colors border-b border-white/5">
                  Ubícanos
                </Link>
              </div>
            </div>

            {/* ESPACIADOR CENTRAL */}
            <div className="flex-1" />

            {/* BLOQUE INFERIOR: Contacto y Redes */}
            <div className="px-5 py-6 border-t border-zinc-800">
              <div className="space-y-4">
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">PEDIDOS & RESERVAS</p>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-zinc-400 text-sm hover:text-white transition-colors">
                    {content.contact_whatsapp}
                  </a>
                </div>
                <div>
                  <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">VISÍTANOS</p>
                  <p className="text-zinc-400 text-sm">{content.contact_address}</p>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <a href="https://www.instagram.com/quebravazorestobar?igsh=dGF6Znd3anJjNDk0" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors" aria-label="Instagram">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  </a>
                  <a href="https://www.tiktok.com/@quebravazo.restobar?_r=1&_t=ZS-97w9t9lowuF" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors" aria-label="TikTok">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                  </a>
                  <a href="https://www.facebook.com/share/1BTpjrUm94/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors" aria-label="Facebook">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Header */}
      <div className="fixed top-0 w-full z-40 bg-black/70 backdrop-blur-md border-b border-white/5 hidden md:block">
        <div className="w-full px-6 h-16 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors" aria-label="Menú">
            <Menu className="w-5 h-5" />
            <span className="text-xs font-bold tracking-[0.15em] uppercase hidden sm:block">Menú</span>
          </button>

          <Link href="/" className="flex flex-col items-center">
            <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#ff5722]/30">
              <Image src="/logo_que_bravazo.png" alt="¡Qué Bravazo!" fill className="object-cover" />
            </div>
            <span className="text-[9px] text-stone-500 font-bold tracking-[0.3em] uppercase mt-0.5">Restobar</span>
          </Link>

          <Link href="/menu" className="px-4 py-2 bg-[#ff5722] hover:bg-orange-500 text-white text-xs font-bold tracking-[0.15em] uppercase rounded-xl border border-[#ff5722] hover:border-orange-500 transition-all shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95">
            Carta
          </Link>
        </div>
      </div>
    </>
  );
}
