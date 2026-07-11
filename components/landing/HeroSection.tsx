"use client";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
        autoPlay muted loop playsInline
      >
        <source src="/HAMBURGUESAS - HORIZONTAL.mp4" type="video/mp4" />
      </video>
      <video
        className="absolute inset-0 w-full h-full object-cover block md:hidden"
        autoPlay muted loop playsInline
      >
        <source src="/HAMBURGUESAS - VERTICAL.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/85" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="text-[#ff5722] text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-4">
          Tus favoritos en un solo lugar
        </p>
        <h1 className="font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase tracking-widest leading-[0.9] mb-8">
          ¡Qué <span className="text-[#ff5722]">Bravazo</span>!
        </h1>
        <p className="text-stone-400 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
          Broaster, hamburguesas artesanales, alitas BBQ y la mejor barra de tragos del barrio.
        </p>

      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center pt-2">
          <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
