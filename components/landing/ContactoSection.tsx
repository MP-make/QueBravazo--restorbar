"use client";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, MessageCircle } from "lucide-react";

export default function ContactoSection() {
  return (
    <section id="contacto" className="py-10 md:py-14 bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900 text-white relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Tienes alguna <span className="text-amber-400">pregunta?</span>
          </h2>
          <p className="text-stone-400 max-w-2xl mx-auto">
            Estamos aquí para ayudarte. Contáctanos por cualquiera de nuestros 
            canales o visítanos en nuestro local.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="space-y-8">
            {/* Logo y descripción */}
            <div className="flex items-start gap-4">
              <div className="bg-white/10 p-4 rounded-2xl">
                {/* Logo pequeño - Imagen: ventify_logo */}
                <Image
                  src="/ventify_logo.png"
                  alt="Ventify Logo"
                  width={120}
                  height={40}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Ventify Restaurante</h3>
                <p className="text-gray-400">
                  Tu destino favorito para disfrutar de los mejores sabores peruanos 
                  con un servicio excepcional.
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
                  Av. Principal 123, Lima<br />
                  Perú
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-emerald-500/20 hover:bg-emerald-500/10 transition-colors">
                <div className="bg-emerald-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Phone className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="font-semibold mb-2">Teléfono</h4>
                <p className="text-stone-400 text-sm">
                  +51 999 888 777<br />
                  (01) 234-5678
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-sky-500/20 hover:bg-sky-500/10 transition-colors">
                <div className="bg-sky-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Mail className="w-6 h-6 text-sky-400" />
                </div>
                <h4 className="font-semibold mb-2">Email</h4>
                <p className="text-stone-400 text-sm">
                  info@ventify.com.pe<br />
                  pedidos@ventify.com.pe
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border border-violet-500/20 hover:bg-violet-500/10 transition-colors">
                <div className="bg-violet-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-violet-400" />
                </div>
                <h4 className="font-semibold mb-2">Horario</h4>
                <p className="text-stone-400 text-sm">
                  Lun - Sáb: 11am - 10pm<br />
                  Dom: 12pm - 8pm
                </p>
              </div>
            </div>

            {/* Redes sociales */}
            <div>
              <h4 className="font-semibold mb-4">Síguenos en redes</h4>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/ventify.pe/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6" />
                </a>
                <a
                  href="https://www.facebook.com/VentifyPE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6" />
                </a>
                <a
                  href="https://wa.me/51943952732"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 p-3 rounded-full hover:scale-110 transition-transform shadow-lg"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Métodos de pago - LOGOS SIN FONDO BLANCO */}
            <div>
              <h4 className="font-semibold mb-4">Aceptamos</h4>
              <div className="flex items-center gap-4">
                <div className="bg-transparent p-2 rounded-lg">
                  <Image
                    src="/icono-yape.png"
                    alt="Yape"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="bg-transparent p-2 rounded-lg">
                  <Image
                    src="/icono-plin.png"
                    alt="Plin"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <span className="text-stone-400 text-sm ml-2">
                  Efectivo, Tarjetas de crédito y débito
                </span>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-amber-500/20">
            <h3 className="text-2xl font-bold mb-6">Envíanos un mensaje</h3>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-stone-300">
                    Nombre
                  </label>
                  <input
                    type="text"
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-stone-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-stone-300">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    placeholder="999 888 777"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-stone-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-stone-300">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-stone-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-stone-300">
                  Asunto
                </label>
                <select className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all text-stone-300">
                  <option value="" className="bg-stone-800">Selecciona un asunto</option>
                  <option value="pedido" className="bg-stone-800">Consulta sobre pedido</option>
                  <option value="reserva" className="bg-stone-800">Reservación</option>
                  <option value="sugerencia" className="bg-stone-800">Sugerencia</option>
                  <option value="otro" className="bg-stone-800">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-stone-300">
                  Mensaje
                </label>
                <textarea
                  rows={4}
                  placeholder="Escribe tu mensaje aquí..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all placeholder-stone-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </div>

        {/* Mapa de Google Maps */}
        <div className="mt-12 rounded-3xl overflow-hidden h-80 border border-amber-500/20">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.9764289388687!2d-77.03196122412567!3d-12.046373988142!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105c8b5d35662c7%3A0x15f0bbc10f262bc1!2sPlaza%20Mayor%20de%20Lima!5e0!3m2!1ses!2spe!4v1705849200000!5m2!1ses!2spe"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Ubicación de Ventify Restaurante"
            className="grayscale-[20%] contrast-[1.1]"
          />
        </div>
      </div>
    </section>
  );
}
