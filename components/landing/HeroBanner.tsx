"use client";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

export default function HeroBanner() {
  const scrollToContent = () => {
    document.getElementById("productos-destacados")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative w-full h-[500px] md:h-[620px] overflow-hidden bg-black">
      {/* Video de fondo */}
      <video
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/HAMBURGUESAS - HORIZONTAL.mp4" type="video/mp4" />
      </video>
      <video
        className="absolute inset-0 w-full h-full object-cover block md:hidden"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/HAMBURGUESAS - VERTICAL.mp4" type="video/mp4" />
      </video>

      {/* Contenido */}
      <div className="absolute inset-0 z-10 flex items-center">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
          <div className="max-w-xl">
            <p className="text-stone-300 text-lg md:text-xl font-medium mb-2 drop-shadow">
              👋 ¡Bienvenido a
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 leading-none drop-shadow-xl">
              <span className="text-amber-400">¡Qué</span>{" "}
              Bravazo!
            </h1>
            <p className="text-stone-200 text-base md:text-lg font-medium mb-2 drop-shadow">
              Restobar de comida rápida — Pisco, Ica
            </p>
            <p className="text-stone-300 text-sm md:text-base mb-8 max-w-md drop-shadow leading-relaxed">
              Pollo Broaster, hamburguesas artesanales, alitas BBQ, papas fritas y la mejor licorería del barrio. 
              Pide por delivery o ven a disfrutar con tu gente. 🍗🍔🔥
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToContent}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/40 text-sm md:text-base"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Ver Menú y Pedir
              </button>
              <Link
                href="#contacto"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-full border border-white/30 hover:border-amber-400/60 transition-all duration-300 text-sm md:text-base"
              >
                📍 ¿Cómo llegar?
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
