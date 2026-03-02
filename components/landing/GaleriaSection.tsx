"use client";
import Image from "next/image";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

// Imágenes referenciales del restaurante
// Agrega más imágenes aquí conforme las tengas
const galeriaImagenes = [
  {
    id: 1,
    src: "/Fondo restaurante.png",
    alt: "Interior del restaurante",
    titulo: "Nuestro Ambiente",
  },
  {
    id: 2,
    src: "/Fondo frituras.png",
    alt: "Especialidades de la casa",
    titulo: "Especialidades",
  },
  {
    id: 3,
    src: "/menu del dia.jpeg",
    alt: "Menú del día",
    titulo: "Menú del Día",
  },
  {
    id: 4,
    src: "/fondo_de_platillos.jpg",
    alt: "Variedad de platillos",
    titulo: "Nuestros Platillos",
  },
];

export default function GaleriaSection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galeriaImagenes.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galeriaImagenes.length) % galeriaImagenes.length);
  };

  return (
    <section id="galeria" className="py-16 md:py-24 section-warm bg-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-sky-100/80 text-sky-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-sky-200/50">
            📸 GALERÍA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            Conoce <span className="gradient-text">¡Qué Bravazo!</span>
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Echa un vistazo a nuestro restobar, el ambiente y los platillos que nos hacen únicos 🔥
          </p>
        </div>

        {/* Grid de galería con diseño masonry */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {galeriaImagenes.map((imagen, index) => (
            <div
              key={imagen.id}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer shadow-warm ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
              onClick={() => openLightbox(index)}
            >
              <div className={`relative ${index === 0 ? "h-64 md:h-full" : "h-48 md:h-56"}`}>
                <Image
                  src={imagen.src}
                  alt={imagen.alt}
                  fill
                  sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 50vw, 25vw"}
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Overlay con texto */}
                <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="glass-effect px-4 py-2 rounded-xl border border-white/30">
                    <p className="font-semibold text-stone-800">{imagen.titulo}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center">
            {/* Botón cerrar */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>

            {/* Botón anterior */}
            <button
              onClick={prevImage}
              className="absolute left-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            {/* Imagen */}
            <div className="relative w-full max-w-4xl h-[80vh] mx-4">
              <Image
                src={galeriaImagenes[currentImageIndex].src}
                alt={galeriaImagenes[currentImageIndex].alt}
                fill
                className="object-contain"
              />
            </div>

            {/* Botón siguiente */}
            <button
              onClick={nextImage}
              className="absolute right-4 text-white/80 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Título y contador */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <p className="text-white font-semibold text-lg mb-2">
                {galeriaImagenes[currentImageIndex].titulo}
              </p>
              <p className="text-white/60">
                {currentImageIndex + 1} / {galeriaImagenes.length}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
