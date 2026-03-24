"use client";
import { MapPin, Clock, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white pt-10 pb-5 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 text-sm">
          {/* Ubicación */}
          <div>
            <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
              <img src="/logo_que_bravazo.png" alt="Logo" className="w-8 h-8 rounded-full border border-stone-800" />
              <MapPin className="w-5 h-5" /> Ubicación
            </h3>
            <a 
              href="https://maps.app.goo.gl/Znvn9Nqmwabpj67N7" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-stone-400 hover:text-amber-400 transition-colors block"
            >
              Urb. los jardines de san andrés<br />
              MZ CA LT 5
            </a>
          </div>

          {/* Horario */}
          <div>
             <h3 className="text-amber-500 font-bold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" /> Horario de Atención
            </h3>
            <p className="text-stone-400 uppercase">
              TODOS LOS DIAS, MENOS LUNES<br />
              DE 6:00 pm a 11:30 p.m.
            </p>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="text-amber-500 font-bold mb-4">Síguenos</h3>
            <div className="flex items-center gap-4">
              <a 
                href="https://www.facebook.com/quebravazorestobar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-stone-800 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="https://www.am.com/quebravazorestobar/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-stone-800 text-white p-2 rounded-full hover:bg-pink-600 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-5 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-stone-500 text-xs">
          <p>© 2026 <span className="text-amber-400 font-semibold">¡Qué Bravazo! Restobar</span>. Todos los derechos reservados.</p>
          <p>🔥 Broaster · Hamburguesas · Alitas BBQ · Cervezas</p>
        </div>
      </div>
    </footer>
  );
}