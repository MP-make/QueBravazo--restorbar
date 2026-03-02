"use client";
import Image from "next/image";
import { Utensils, Clock, Truck, Star } from "lucide-react";

export default function PresentacionSection() {
  return (
    <section id="presentacion" className="relative py-12 md:py-16 section-cream bg-pattern overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 bg-amber-100/80 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-amber-200/50">
            <Star className="w-4 h-4 fill-amber-600 text-amber-600" />
            BIENVENIDOS AL RESTOBAR
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-stone-800 mb-4">
            Conoce{" "}
            <span className="gradient-text">¡Qué Bravazo!</span>
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            El mejor restobar de comida rápida peruana 🇵🇪 — Broaster crujiente, hamburguesas jugosas,
            alitas BBQ y cervezas bien heladas.
          </p>
        </div>

        {/* Contenedor principal */}
        <div className="relative flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-0">
          {/* Imagen de platillos */}
          <div className="relative w-full lg:w-2/3 h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-warm transform lg:-rotate-2 hover:rotate-0 transition-transform duration-500">
            <Image
              src="/fondo_de_platillos.jpg"
              alt="Platillos de ¡Qué Bravazo!"
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-stone-900/70 via-stone-900/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
              <h3 className="text-2xl md:text-3xl font-extrabold mb-2">
                Sabor Bravazo en cada bocado
              </h3>
              <p className="text-white/80 max-w-md">
                Broaster · Mostrito · Hamburguesas · Alitas BBQ · Bebidas frías
              </p>
            </div>
            <div className="absolute top-6 right-6 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-5 py-3 rounded-full shadow-lg">
              <p className="font-bold text-lg">🔥 +50 opciones</p>
            </div>
          </div>

          {/* Personaje presentando */}
          <div className="relative lg:absolute lg:right-0 lg:-bottom-8 w-[280px] md:w-[350px] lg:w-[400px] h-[350px] md:h-[450px] lg:h-[550px] z-10">
            <Image
              src="/personaje presentando_sinfondo.png"
              alt="Chef presentando"
              fill
              sizes="(max-width: 768px) 280px, (max-width: 1024px) 350px, 400px"
              className="object-contain object-bottom drop-shadow-2xl"
              priority
            />
            <div className="absolute -top-4 -left-4 md:top-4 md:-left-8 glass-effect rounded-2xl p-4 shadow-soft max-w-[200px] transform -rotate-3 animate-bounce-slow border border-white/50">
              <p className="text-stone-700 font-semibold text-sm">
                ¡Pídete unas alitas con tu Pilsen! 🍺🍗
              </p>
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-white/90 transform rotate-45" />
            </div>
          </div>
        </div>

        {/* Cards de características */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <div className="group card-elegant p-6">
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-warm">
              <Utensils className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-xl text-stone-800 mb-2">Comida Peruana 🇵🇪</h3>
            <p className="text-stone-500">Broaster, mostrito, hamburguesas y alitas BBQ con sazón peruana</p>
          </div>

          <div className="group card-elegant p-6">
            <div className="bg-gradient-to-br from-amber-600 to-yellow-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="text-2xl">🍺</span>
            </div>
            <h3 className="font-bold text-xl text-stone-800 mb-2">Licorería Completa</h3>
            <p className="text-stone-500">Cervezas, Pilsen (lata/botella), Mike's (fresa, maracuyá, frambuesa) y gaseosas</p>
          </div>

          <div className="group card-elegant p-6">
            <div className="bg-gradient-to-br from-sky-500 to-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <h3 className="font-bold text-xl text-stone-800 mb-2">Delivery Express 🛵</h3>
            <p className="text-stone-500">Llevamos tu pedido hasta la puerta de tu casa bien rápido</p>
          </div>
        </div>
      </div>
    </section>
  );
}
