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
      <div className="relative w-28 h-28 md:w-36 md:h-36 animate-bounce">
        <Image
          src="/logo_que_bravazo.png"
          alt="¡Qué Bravazo!"
          fill
          className="object-contain"
          priority
        />
      </div>
      <p className="mt-6 text-stone-500 text-xs font-bold tracking-[0.3em] uppercase animate-pulse">
        Cargando...
      </p>
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
    <div className="min-h-screen bg-stone-50">
      <MenuContent initialProducts={products} />
    </div>
  );
}
