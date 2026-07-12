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
      <div className="relative flex flex-col items-center">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 logo-bounce">
          <Image
            src="/logo_que_bravazo.png"
            alt="¡Qué Bravazo!"
            fill
            className="rounded-full object-cover"
            priority
          />
        </div>
        <div className="logo-shadow" />
      </div>
      <style>{`
        .logo-bounce {
          animation: logoBounce 1.5s infinite;
        }
        .logo-shadow {
          width: 65%;
          height: 8px;
          margin-top: 12px;
          border-radius: 50%;
          background: rgba(255, 87, 34, 0.35);
          animation: shadowPulse 1.5s infinite;
        }
        @keyframes logoBounce {
          0% { transform: scale(0.95); animation-timing-function: ease-out; }
          50% { transform: scale(1.2); animation-timing-function: ease-in; }
          100% { transform: scale(0.95); }
        }
        @keyframes shadowPulse {
          0% { transform: scale(1.2); opacity: 0.5; filter: blur(2px); animation-timing-function: ease-out; }
          50% { transform: scale(2.5); opacity: 0.06; filter: blur(16px); animation-timing-function: ease-in; }
          100% { transform: scale(1.2); opacity: 0.5; filter: blur(2px); }
        }
      `}</style>
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
