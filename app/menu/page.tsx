"use client";
import { useEffect } from 'react';
import Image from 'next/image';
import { useProductStore } from '@/lib/stores/products';
import MenuContent from './MenuContent';

function SplashScreen() {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black">
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        <Image
          src="/logo_que_bravazo.png"
          alt="¡Qué Bravazo!"
          fill
          className="rounded-full object-cover"
          priority
        />
      </div>
      <div className="mt-8 relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-3 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-3 border-transparent border-t-[#ff5722] animate-spin" />
      </div>
    </div>
  );
}

export default function MenuPage() {
  const products = useProductStore((s) => s.products);
  const loaded = useProductStore((s) => s.loaded);

  if (!loaded) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen">
      <MenuContent initialProducts={products} />
    </div>
  );
}
