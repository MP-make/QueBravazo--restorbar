"use client";
import { useState, useEffect } from "react";
import { useHomepageContent } from '@/lib/hooks/useHomepageContent';

function isVideo(url: string) {
  return /\.(mp4|webm|ogg|mov|avi)$/i.test(url);
}

function pickVideo(
  activeType: string | null,
  desktopDefault: string,
  mobileDefault: string,
  desktopCriollo: string,
  mobileCriollo: string,
  desktopRapida: string,
  mobileRapida: string,
): { desktop: string; mobile: string } {
  if (activeType === "criollo") {
    return {
      desktop: desktopCriollo || desktopDefault,
      mobile: mobileCriollo || mobileDefault,
    };
  }
  if (activeType === "rapida") {
    return {
      desktop: desktopRapida || desktopDefault,
      mobile: mobileRapida || mobileDefault,
    };
  }
  return { desktop: desktopDefault, mobile: mobileDefault };
}

export default function HeroSection() {
  const content = useHomepageContent();
  const [activeType, setActiveType] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/schedules/active")
      .then((r) => r.json())
      .then((sched) => {
        const types = sched.active_types || [];
        if (types.includes("criollo")) setActiveType("criollo");
        else if (types.includes("rapida")) setActiveType("rapida");
        else setActiveType(null);
      })
      .catch(() => setActiveType(null));
  }, []);

  const videos = pickVideo(
    activeType,
    content.hero_video_desktop,
    content.hero_video_mobile,
    content.hero_video_desktop_criollo,
    content.hero_video_mobile_criollo,
    content.hero_video_desktop_rapida,
    content.hero_video_mobile_rapida,
  );

  return (
    <section className="relative w-full min-h-[85vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {videos.desktop && isVideo(videos.desktop) ? (
        <video
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          autoPlay muted loop playsInline
        >
          <source src={videos.desktop} type="video/mp4" />
        </video>
      ) : videos.desktop ? (
        <img
          className="absolute inset-0 w-full h-full object-cover hidden md:block"
          src={videos.desktop}
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
      {videos.mobile && isVideo(videos.mobile) ? (
        <video
          className="absolute inset-0 w-full h-full object-cover block md:hidden"
          autoPlay muted loop playsInline
        >
          <source src={videos.mobile} type="video/mp4" />
        </video>
      ) : videos.mobile ? (
        <img
          className="absolute inset-0 w-full h-full object-cover block md:hidden"
          src={videos.mobile}
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
