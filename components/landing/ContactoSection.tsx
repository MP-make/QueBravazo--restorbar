"use client";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";

export default function ContactoSection() {
  return (
    <section id="contacto" className="py-10 md:py-14 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Dónde encontrarnos o <span className="text-amber-400">hacer tu pedido?</span>
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Visítanos en nuestro local o pide por delivery. ¡También puedes escribirnos al WhatsApp!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Info de contacto */}
          <div className="space-y-8">
            {/* Logo y descripción */}
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-3 rounded-2xl">
                <Image
                  src="/bravazo-logo.jpeg"
                  alt="¡Qué Bravazo! Logo"
                  width={70}
                  height={70}
                  className="object-contain rounded-xl"
                />
              </div>
              <div>
                <h3 className="text-xl font-extrabold mb-1">
                  <span className="text-amber-400">¡Qué Bravazo!</span> Restobar
                </h3>
                <p className="text-stone-400 text-sm">
                  Restobar de comida rápida peruana. Broaster, hamburguesas, alitas BBQ y la mejor licorería del barrio.
                </p>
              </div>
            </div>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-amber-500/20 hover:bg-amber-500/10 transition-colors">
                <div className="bg-amber-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-amber-400" />
                </div>
                <h4 className="font-semibold mb-2">Dirección</h4>
                <p className="text-stone-400 text-sm">
                  Urb. Los Jardines de San Andrés<br />
                  Pisco, Ica<br />
                  <span className="text-amber-400/80">(Consulta por WhatsApp)</span>
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">
                <div className="bg-emerald-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold mb-2">WhatsApp / Pedidos</h4>
                <p className="text-stone-400 text-sm">
                  <a href="https://wa.me/51946826535" target="_blank" rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 transition-colors font-semibold">
                    +51 946 826 535
                  </a><br />
                  <span className="text-emerald-400">¡Escríbenos ahora!</span>
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-sky-500/20 hover:bg-sky-500/10 transition-colors">
                <div className="bg-sky-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-sky-400" />
                </div>
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-stone-400 text-sm">
                  <a href="mailto:quebravazorestobar@gmail.com"
                    className="hover:text-sky-400 transition-colors break-all">
                    quebravazorestobar@gmail.com
                  </a>
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-violet-500/20 hover:bg-violet-500/10 transition-colors">
                <div className="bg-violet-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-violet-400" />
                </div>
                <h4 className="font-semibold mb-2">Horario</h4>
                <p className="text-stone-400 text-sm">
                  Lun – Sáb: 12pm – 11pm<br />
                  Dom: 12pm – 9pm
                </p>
              </div>
            </div>

            {/* Redes sociales */}
            <div>
              <h4 className="font-semibold mb-4">Síguenos en redes 📲</h4>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/quebravazorestobar/" target="_blank" rel="noopener noreferrer"
                  className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full hover:scale-110 transition-transform shadow-lg" aria-label="Instagram">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/quebravazorestobar" target="_blank" rel="noopener noreferrer"
                  className="bg-blue-600 p-3 rounded-full hover:scale-110 transition-transform shadow-lg" aria-label="Facebook">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://wa.me/51946826535" target="_blank" rel="noopener noreferrer"
                  className="bg-green-500 p-3 rounded-full hover:scale-110 transition-transform shadow-lg" aria-label="WhatsApp">
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Métodos de pago */}
            <div>
              <h4 className="font-semibold mb-4">Aceptamos</h4>
              <div className="flex items-center gap-4">
                <div className="bg-transparent p-2 rounded-lg">
                  <Image src="/icono-yape.png" alt="Yape" width={40} height={40} className="object-contain" />
                </div>
                <div className="bg-transparent p-2 rounded-lg">
                  <Image src="/icono-plin.png" alt="Plin" width={40} height={40} className="object-contain" />
                </div>
                <span className="text-stone-400 text-sm ml-2">Efectivo, Yape y Plin</span>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-amber-500/20">
            <h3 className="text-2xl font-bold mb-2">Envíanos un mensaje 💬</h3>
            <p className="text-stone-400 text-sm mb-6">Consultas, pedidos especiales o reservas de mesa</p>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-stone-300">Nombre</label>
                  <input type="text" placeholder="Tu nombre"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-stone-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-stone-300">Teléfono</label>
                  <input type="tel" placeholder="946 826 535"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-stone-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-stone-300">Asunto</label>
                <select className="w-full px-4 py-3 bg-stone-800 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-stone-300">
                  <option value="">Selecciona un asunto</option>
                  <option value="pedido">Consulta sobre pedido</option>
                  <option value="reserva">Reserva de mesa</option>
                  <option value="delivery">Delivery</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-stone-300">Mensaje</label>
                <textarea rows={4} placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-stone-500 resize-none" />
              </div>
              <button type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30">
                🔥 Enviar Mensaje
              </button>
            </form>
          </div>
        </div>

        {/* Mapa */}
        <div className="mt-12 rounded-3xl overflow-hidden h-80 border border-amber-500/20">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3846.4!2d-76.2022!3d-13.7100!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9110f000000001%3A0x1!2sUrb.%20Los%20Jardines%20de%20San%20Andr%C3%A9s%2C%20Pisco%2C%20Ica!5e0!3m2!1ses!2spe!4v1700000000000!5m2!1ses!2spe"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación ¡Qué Bravazo! — Pisco, Ica"
            className="grayscale-[20%] contrast-[1.1]"
          />
        </div>
      </div>
    </section>
  );
}
