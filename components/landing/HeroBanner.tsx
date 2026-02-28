"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronDown } from "lucide-react";

export default function HeroBanner() {
  const scrollToContent = () => {
    const target = document.getElementById("productos-destacados");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative w-full h-[500px] md:h-[600px] overflow-hidden">
      {/* Banner Principal - Imagen: banner_ventify_1920x600 */}
      <Image
        src="/banner_ventify_1920x600.jpg"
        alt="Ventify Restaurante - Banner Principal"
        fill
        sizes="100vw"
        className="object-cover"
        priority
        loading="eager"
      />
      
      {/* Overlay gradiente más cálido */}
      <div className="absolute inset-0 bg-gradient-to-r from-stone-900/80 via-stone-900/50 to-amber-900/30" />
      
      {/* Contenido del Hero */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-xl ml-auto mr-8 md:mr-16 text-right">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
              Sabores que <span className="text-amber-400">enamoran</span>
            </h1>
            
            <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-lg ml-auto drop-shadow-md">
              Descubre los mejores platillos del Perú, preparados con ingredientes 
              frescos y entregados directamente a tu puerta.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={scrollToContent}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/30"
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                Ver Menú
              </button>
              <Link
                href="#contacto"
                className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-semibold rounded-full border-2 border-amber-400/40 transition-all duration-300"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicador de scroll funcional */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-amber-300 hover:text-amber-400 animate-bounce cursor-pointer transition-colors p-2 rounded-full hover:bg-white/10"
        aria-label="Desplazar hacia productos"
      >
        <ChevronDown className="w-10 h-10" />
      </button>
    </section>
  );
}
