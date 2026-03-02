"use client";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

const SLIDES = [
  { type: "image", src: "/principal.png" },
  { type: "video", src: "/FLYER VIDEO HERO BRAVAZO.mp4" },
  { type: "video", src: "/flyer 2.mp4" },
] as const;

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  // Todos los slides duran 10s — videos también tienen fallback de 10s
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(next, 10000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, next]);

  // Play current video, reset others
  useEffect(() => {
    videoRefs.current.forEach((vid, i) => {
      if (!vid) return;
      if (i === current) {
        vid.currentTime = 0;
        vid.play().catch(() => {});
      } else {
        vid.pause();
        vid.currentTime = 0;
      }
    });
  }, [current]);

  const scrollToContent = () => {
    document.getElementById("productos-destacados")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section className="relative w-full h-[500px] md:h-[620px] overflow-hidden bg-black">
      {/* Slides con crossfade */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          {slide.type === "image" ? (
            <Image
              src={slide.src}
              alt="¡Qué Bravazo! Restobar"
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
          ) : (
            <video
              ref={(el) => { videoRefs.current[i] = el; }}
              src={slide.src}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
          )}
        </div>
      ))}

      {/* Overlay imagen */}
      {SLIDES[current].type === "image" && (
        <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/75 via-black/40 to-transparent pointer-events-none" />
      )}
      {/* Overlay video — muy sutil para no tapar el contenido */}
      {SLIDES[current].type === "video" && (
        <div className="absolute inset-0 z-20 bg-black/20 pointer-events-none" />
      )}

      {/* Texto hero — solo en imagen */}
      {SLIDES[current].type === "image" && (
        <div className="absolute inset-0 z-30 flex items-center">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 w-full">
            <div className="max-w-xl">
              {/* Bienvenida */}
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
      )}

      {/* Scroll indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 text-amber-400 hover:text-amber-300 animate-bounce cursor-pointer transition-colors p-2 rounded-full hover:bg-white/10"
        aria-label="Ver menú"
      >
        <ChevronDown className="w-8 h-8" />
      </button>
    </section>
  );
}
