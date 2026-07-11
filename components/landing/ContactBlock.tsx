"use client";
import { useState } from 'react';
import Image from 'next/image';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CreditCard } from 'lucide-react';

export default function ContactBlock() {
  const [form, setForm] = useState({ name: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `*Nuevo Mensaje - ¡Qué Bravazo!*%0A%0A*Nombre:* ${form.name}%0A*Teléfono:* ${form.phone}%0A*Asunto:* ${form.subject}%0A*Mensaje:* ${form.message}`;
    window.open(`https://wa.me/51946826535?text=${text}`, '_blank');
  };

  return (
    <section className="w-full bg-[#141416]">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="text-center mb-12">
          <p className="text-[#ff5722] text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-2">Contacto</p>
          <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-widest">
            ¿Dónde encontrarnos o hacer tu pedido?
          </h2>
          <p className="text-stone-500 text-sm mt-3 max-w-lg mx-auto">
            Visítanos en nuestro local o pide por delivery. ¡También puedes escribirnos al WhatsApp!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8 mb-8">
          {/* Brand card */}
          <div className="lg:col-span-2 bg-[#1e1e20] rounded-2xl border border-white/5 p-6 md:p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-[#ff5722]/30 flex-shrink-0">
                <img src="/logo_que_bravazo.png" alt="¡Qué Bravazo!" className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="text-white font-black text-sm uppercase leading-tight">¡Qué Bravazo!</p>
                <p className="text-[#ff5722] text-xs font-bold">Restobar</p>
              </div>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">
              Restobar de comida rápida peruana. Broaster, hamburguesas, alitas BBQ y la mejor licorería del barrio.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <span className="text-xs text-stone-500 font-medium">Síguenos en redes</span>
              <div className="flex items-center gap-2">
                <a href="https://www.instagram.com/quebravazorestobar?igsh=dGF6Znd3anJjNDk0" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#ff5722]/20 flex items-center justify-center text-stone-400 hover:text-[#ff5722] transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
                <a href="https://www.tiktok.com/@quebravazo.restobar?_r=1&_t=ZS-97w9t9lowuF" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#ff5722]/20 flex items-center justify-center text-stone-400 hover:text-[#ff5722] transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                </a>
                <a href="https://www.facebook.com/share/1BTpjrUm94/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#ff5722]/20 flex items-center justify-center text-stone-400 hover:text-[#ff5722] transition-all">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5">
              <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mb-3">Aceptamos</p>
              <div className="flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ff5722]/10 border border-[#ff5722]/20 text-[#ff5722] text-xs font-bold">
                  <Image src="/icono-yape.png" alt="Yape" width={16} height={16} className="object-contain" /> Yape
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold">
                  <Image src="/icono-plin.png" alt="Plin" width={16} height={16} className="object-contain" /> Plin
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold">
                  <CreditCard className="w-3.5 h-3.5" /> Efectivo
                </span>
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div className="bg-[#1e1e20] rounded-2xl border border-white/5 p-5">
              <div className="w-9 h-9 rounded-full bg-[#ff5722]/10 flex items-center justify-center mb-3">
                <MapPin className="w-4 h-4 text-[#ff5722]" />
              </div>
              <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mb-1">Dirección</p>
              <p className="text-sm text-white font-medium leading-relaxed">
                Urb. Los Jardines de San Andrés<br />Pisco, Ica
              </p>
              <p className="text-[11px] text-stone-500 mt-2">(Consulta por WhatsApp)</p>
            </div>

            <div className="bg-[#1e1e20] rounded-2xl border border-white/5 p-5">
              <div className="w-9 h-9 rounded-full bg-[#ff5722]/10 flex items-center justify-center mb-3">
                <MessageCircle className="w-4 h-4 text-[#ff5722]" />
              </div>
              <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mb-1">WhatsApp / Pedidos</p>
              <p className="text-sm text-white font-bold">+51 946 826 535</p>
              <a
                href="https://wa.me/51946826535"
                target="_blank"
                className="inline-flex items-center gap-1 text-[11px] text-[#ff5722] font-bold hover:text-orange-400 mt-2 transition-colors"
              >
                ¡Escríbenos ahora! →
              </a>
            </div>

            <div className="bg-[#1e1e20] rounded-2xl border border-white/5 p-5">
              <div className="w-9 h-9 rounded-full bg-[#ff5722]/10 flex items-center justify-center mb-3">
                <Mail className="w-4 h-4 text-[#ff5722]" />
              </div>
              <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mb-1">Email</p>
              <p className="text-sm text-white font-medium break-all">quebravazorestobar@gmail.com</p>
            </div>

            <div className="bg-[#1e1e20] rounded-2xl border border-white/5 p-5">
              <div className="w-9 h-9 rounded-full bg-[#ff5722]/10 flex items-center justify-center mb-3">
                <Clock className="w-4 h-4 text-[#ff5722]" />
              </div>
              <p className="text-xs text-stone-500 font-bold tracking-widest uppercase mb-1">Horario</p>
              <div className="text-sm text-white font-medium space-y-0.5">
                <p>Lun – Sáb: 12pm – 11pm</p>
                <p>Dom: 12pm – 9pm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-[#1e1e20] rounded-2xl border border-white/5 p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[#ff5722]/10 flex items-center justify-center">
              <Send className="w-5 h-5 text-[#ff5722]" />
            </div>
            <div>
              <p className="text-white font-black text-sm uppercase">Envíanos un mensaje</p>
              <p className="text-stone-500 text-xs">Consultas, pedidos especiales o reservas de mesa</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-stone-500 font-bold tracking-widest uppercase mb-1.5">Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#ff5722] focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] text-stone-500 font-bold tracking-widest uppercase mb-1.5">Teléfono</label>
              <input
                type="tel"
                placeholder="946 826 535"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#ff5722] focus:border-transparent transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] text-stone-500 font-bold tracking-widest uppercase mb-1.5">Asunto</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#ff5722] focus:border-transparent transition-all appearance-none"
                style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23737373' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 12px center", backgroundRepeat: "no-repeat", backgroundSize: "20px" }}
              >
                <option value="" className="bg-[#1e1e20]">Selecciona un asunto</option>
                <option value="Pedido" className="bg-[#1e1e20]">Pedido</option>
                <option value="Reserva" className="bg-[#1e1e20]">Reserva de mesa</option>
                <option value="Consulta" className="bg-[#1e1e20]">Consulta</option>
                <option value="Sugerencia" className="bg-[#1e1e20]">Sugerencia</option>
                <option value="Otro" className="bg-[#1e1e20]">Otro</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] text-stone-500 font-bold tracking-widest uppercase mb-1.5">Mensaje</label>
              <textarea
                placeholder="Escribe tu mensaje aquí..."
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#ff5722] focus:border-transparent transition-all resize-none"
              />
            </div>
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-8 py-3 bg-[#ff5722] hover:bg-orange-500 active:scale-95 text-white font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-orange-500/25"
              >
                <Send className="w-4 h-4" />
                Enviar Mensaje
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
