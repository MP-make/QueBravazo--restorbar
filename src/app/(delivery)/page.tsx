"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { fetchProducts } from '@/lib/api/ventify';
import { Product } from '@/types';
import { CartDrawer } from '@/components/shared/CartDrawer';
import { useUIStore } from '@/lib/stores/ui';
import Footer from '@/components/shared/Footer';
import { X } from 'lucide-react';

// Componentes de Landing Page
import HeroBanner from '@/components/landing/HeroBanner';
import ProductosDestacados from '@/components/landing/ProductosDestacados';
import PromocionesSection from '@/components/landing/PromocionesSection';
import ContactoSection from '@/components/landing/ContactoSection';

export default function DeliveryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const { isCartOpen, setIsCartOpen } = useUIStore();

  useEffect(() => {
    const hasVisited = localStorage.getItem('hasVisitedBravazo');
    if (!hasVisited) {
      localStorage.setItem('hasVisitedBravazo', 'true');
      setShowWelcomeModal(true);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 Iniciando carga de productos...');
    fetchProducts()
      .then((data) => {
        console.log('✅ Productos cargados:', data.length, data);
        if (data.length > 0) setProducts(data);
      })
      .catch((error) => console.error('❌ Error al cargar productos:', error));
  }, []);

  useEffect(() => {
    if (showWelcomeModal) {
      const timer = setTimeout(() => setShowWelcomeModal(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeModal]);

  // ✅ Filtro case-insensitive para bebidas
  const bebidas = products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('bebida') || cat.includes('gaseosa') || cat.includes('cerveza') || cat.includes('trago') || cat.includes('licor');
  });

  return (
    <div className="min-h-screen">
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative max-w-5xl w-full">
            <div className="relative bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200/50">
              <button
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-5 right-5 p-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full transition-all z-20 shadow-lg hover:scale-110 border border-white/20"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-white drop-shadow-lg" />
              </button>
              <div className="grid md:grid-cols-2 min-h-[520px]">
                <div className="relative flex flex-col justify-center p-6 sm:p-8 md:p-12 bg-gradient-to-br from-white/80 via-amber-50/50 to-transparent">
                  <div className="text-center mb-5">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      🔥 BIENVENIDOS AL RESTOBAR
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-3 leading-tight">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">¡Qué Bravazo!</span>
                  </h2>
                  <p className="text-center text-stone-600 text-sm sm:text-base mb-6 px-2">
                    Broaster · Hamburguesas · Alitas BBQ · Cervezas heladas 🍺
                  </p>
                  <div className="relative mb-6">
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse z-10 border-2 border-white">
                      ¡PIDE AHORA!
                    </div>
                    <div className="relative bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 rounded-2xl p-5 sm:p-6 shadow-xl border-4 border-amber-400">
                      <div className="text-center mb-3"><span className="text-3xl sm:text-5xl drop-shadow-lg">🍗</span></div>
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-800 text-center leading-tight">
                        ¡Pídete un Broaster bien crujiente! 🔥
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                  >
                    🛍️ Ver el Menú
                  </button>
                </div>
                <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden min-h-[400px] md:min-h-0">
                  <div className="absolute inset-0">
                    <Image src="/fondo_de_platillos.jpg" alt="Platillos Bravazo" fill className="object-cover opacity-40" priority />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-200/80 via-transparent to-orange-100/50"></div>
                  </div>
                  <div className="relative h-full flex items-end justify-center pb-4 sm:pb-8">
                    <div className="relative animate-bounce-slow">
                      <Image src="/personaje presentando_sinfondo.png" alt="Chef presentadora" width={280} height={350} className="object-contain drop-shadow-2xl w-full max-w-[240px] sm:max-w-[300px]" priority />
                    </div>
                  </div>
                  <div className="hidden md:block absolute bottom-8 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-xl">
                    <p className="text-xs text-stone-500 font-semibold">🔥 Más pedido</p>
                    <p className="text-base font-bold text-orange-700">Combo Bravazo</p>
                    <p className="text-xl font-black text-orange-600">S/ 18</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <HeroBanner />
      <ProductosDestacados products={products} />
      <PromocionesSection />
      <ContactoSection />
      <Footer />
      <CartDrawer visible={isCartOpen} onClose={() => setIsCartOpen(false)} bebidas={bebidas} />
    </div>
  );
}