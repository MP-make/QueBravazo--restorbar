"use client";
import { useHomepageContent } from '@/lib/hooks/useHomepageContent';

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
}

export default function HeroSection() {
  const content = useHomepageContent();

  return (
    <section className="relative w-full min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {content.hero_video_desktop && isVideo(content.hero_video_desktop) ? (
        <video
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          autoPlay muted loop playsInline
        >
          <source src={content.hero_video_desktop} type="video/mp4" />
        </video>
      ) : content.hero_video_desktop ? (
        <img
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          src={content.hero_video_desktop}
          alt=""
        />
      ) : (
        <video
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          autoPlay muted loop playsInline
        >
          <source src="/HAMBURGUESAS - HORIZONTAL.mp4" type="video/mp4" />
        </video>
      )}
      {content.hero_video_mobile && isVideo(content.hero_video_mobile) ? (
        <video
          className="absolute inset-0 w-full h-full object-cover block md:hidden"
          autoPlay muted loop playsInline
        >
          <source src={content.hero_video_mobile} type="video/mp4" />
        </video>
      ) : content.hero_video_mobile ? (
        <img
          className="absolute inset-0 w-full h-full object-cover block md:hidden"
          src={content.hero_video_mobile}
          alt=""
        />
      ) : (
        <video
          className="absolute inset-0 w-full h-full object-cover block md:hidden"
          autoPlay muted loop playsInline
        >
          <source src="/HAMBURGUESAS - VERTICAL.mp4" type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/85" />

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
        <p className="text-[#ff5722] text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-4">
          {content.hero_subtitle}
        </p>
        <h1 className="font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white uppercase tracking-widest leading-[0.9] mb-8">
          ¡Qué <span className="text-[#ff5722]">Bravazo</span>!
        </h1>
        <p className="text-stone-400 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed">
          {content.hero_description}
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
