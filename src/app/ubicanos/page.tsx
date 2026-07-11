"use client";
import Link from 'next/link';
import { MapPin, Phone, Clock } from 'lucide-react';
import LandingHeader from '@/components/landing/LandingHeader';

export default function UbicanosPage() {
  return (
    <div className="min-h-screen relative pt-16">
      <LandingHeader />
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/menú.webp)' }} />
      <div className="fixed inset-0 bg-black/85" />

      <div className="relative z-10">
        <div className="max-w-4xl mx-auto px-6 pt-8 pb-20">

          <div className="text-center mb-12">
            <p className="text-[#ff5722] text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-2">
              Encuéntranos
            </p>
            <h1 className="font-black text-3xl md:text-5xl text-white uppercase tracking-widest">
              Ubícanos
            </h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
            <div className="bg-[#1e1e20]/90 backdrop-blur-sm rounded-2xl border border-white/5 p-6 md:p-8">
              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6">Información</h2>

              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff5722]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#ff5722]" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mb-1">Dirección</p>
                    <p className="text-sm text-white font-medium leading-relaxed">
                      Urb. Los Jardines de San Andrés MZ CA LT 5<br />
                      Pisco, Perú
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff5722]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#ff5722]" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mb-1">Teléfono</p>
                    <p className="text-sm text-white font-medium">+51 946 826 535</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ff5722]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[#ff5722]" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mb-1">Horario</p>
                    <div className="text-sm text-white font-medium space-y-1">
                      <p>Vie — Dom: 6:00 pm — 11:30 pm</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1e1e20]/90 backdrop-blur-sm rounded-2xl border border-white/5 p-6 md:p-8">
              <h2 className="text-lg font-black text-white uppercase tracking-widest mb-6">Redes</h2>
              <p className="text-stone-400 text-sm leading-relaxed mb-6">
                Síguenos para estar al tanto de promociones, nuevos platos y eventos especiales.
              </p>
              <div className="flex flex-col gap-3">
                <a href="https://www.instagram.com/quebravazorestobar?igsh=dGF6Znd3anJjNDk0" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-[#ff5722]/10 border border-white/5 hover:border-[#ff5722]/30 transition-all group">
                  <svg className="w-5 h-5 text-stone-400 group-hover:text-[#ff5722] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                  <span className="text-sm font-semibold text-stone-300 group-hover:text-white transition-colors">@quebravazorestobar</span>
                </a>
                <a href="https://www.tiktok.com/@quebravazo.restobar?_r=1&_t=ZS-97w9t9lowuF" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-[#ff5722]/10 border border-white/5 hover:border-[#ff5722]/30 transition-all group">
                  <svg className="w-5 h-5 text-stone-400 group-hover:text-[#ff5722] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                  <span className="text-sm font-semibold text-stone-300 group-hover:text-white transition-colors">@quebravazo.restobar</span>
                </a>
                <a href="https://www.facebook.com/share/1BTpjrUm94/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-[#ff5722]/10 border border-white/5 hover:border-[#ff5722]/30 transition-all group">
                  <svg className="w-5 h-5 text-stone-400 group-hover:text-[#ff5722] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                  <span className="text-sm font-semibold text-stone-300 group-hover:text-white transition-colors">QueBravazo</span>
                </a>
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e20]/90 backdrop-blur-sm rounded-2xl border border-white/5 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-white/5">
              <h2 className="text-lg font-black text-white uppercase tracking-widest">Mapa</h2>
            </div>
            <div className="w-full aspect-[16/7] md:aspect-[16/5] relative">
              <iframe
                src="https://www.google.com/maps?q=Urb.+Los+Jardines+de+San+Andr%C3%A9s+MZ+CA+LT+5,+Pisco&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, position: 'absolute', inset: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
