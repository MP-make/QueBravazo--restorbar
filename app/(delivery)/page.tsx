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
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);
  const { isCartOpen, setIsCartOpen } = useUIStore();

  useEffect(() => {
    console.log('🔄 Iniciando carga de productos...');
    setIsLoading(true);
    
    fetchProducts()
      .then((data) => {
        console.log('✅ Productos cargados:', data.length, 'productos');
        console.log('📦 Datos:', data);
        setProducts(data);
      })
      .catch((error) => {
        console.error('❌ Error al cargar productos:', error);
      })
      .finally(() => {
        setIsLoading(false);
        console.log('✔️ Carga finalizada');
      });
  }, []);

  useEffect(() => {
    // Auto-cerrar modal después de 5 segundos
    if (showWelcomeModal) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showWelcomeModal]);

  const bebidas = products.filter(p => p.category === 'Bebidas');

  return (
    <div className="min-h-screen">
      {/* Modal de Bienvenida - DISEÑO MEJORADO */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative max-w-5xl w-full">
            {/* Contenedor principal del modal */}
            <div className="relative bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200/50">
              {/* Botón cerrar DENTRO del modal con fondo TRANSPARENTE */}
              <button 
                onClick={() => setShowWelcomeModal(false)}
                className="absolute top-5 right-5 p-2.5 bg-black/20 hover:bg-black/30 backdrop-blur-md rounded-full transition-all z-20 shadow-lg hover:shadow-xl group border border-white/20 hover:scale-110"
                aria-label="Cerrar modal"
              >
                <X className="w-5 h-5 text-white group-hover:text-white transition-colors drop-shadow-lg" />
              </button>

              {/* Grid de 2 columnas */}
              <div className="grid md:grid-cols-2 min-h-[520px]">
                {/* Lado izquierdo: Contenido de texto */}
                <div className="relative flex flex-col justify-center p-6 sm:p-8 md:p-12 bg-gradient-to-br from-white/80 via-amber-50/50 to-transparent">
                  {/* Badge BIENVENIDOS */}
                  <div className="text-center mb-5">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                      ⭐ BIENVENIDOS
                    </span>
                  </div>

                  {/* Título principal */}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3 bg-gradient-to-r from-stone-800 to-stone-600 bg-clip-text text-transparent">
                    Conoce <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">Ventify</span> Restaurante
                  </h2>
                  <p className="text-center text-stone-600 text-sm sm:text-base mb-6 px-2">
                    Te presentamos lo mejor de nuestra cocina, preparada con amor y los ingredientes más frescos
                  </p>

                  {/* Tarjeta/Cartel con borde */}
                  <div className="relative mb-6">
                    {/* Badge "NUEVO" flotante */}
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse z-10 border-2 border-white">
                      ¡NUEVO!
                    </div>
                    
                    {/* Tarjeta con borde dorado mejorado */}
                    <div className="relative bg-gradient-to-br from-amber-100 via-orange-50 to-amber-100 rounded-2xl p-5 sm:p-6 shadow-xl border-4 border-amber-400">
                      {/* Icono de tenedor y cuchillo */}
                      <div className="text-center mb-3">
                        <span className="text-3xl sm:text-5xl drop-shadow-lg">🍽️</span>
                      </div>
                      
                      {/* Texto del cartel */}
                      <p className="text-lg sm:text-xl md:text-2xl font-bold text-orange-800 text-center leading-tight">
                        ¡Te invito a probar nuestros deliciosos platillos! 🍕
                      </p>
                    </div>
                  </div>

                  {/* Texto adicional */}
                  <div className="text-center mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-stone-800 mb-1">
                      Platillos que Enamoran
                    </h3>
                    <p className="text-stone-600 text-sm">
                      Cada plato es una experiencia única
                    </p>
                  </div>

                  {/* Botón de acción */}
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3.5 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
                  >
                    🛍️ Explorar Menú
                  </button>
                </div>

                {/* Lado derecho: Personaje con fondo de comida */}
                <div className="relative bg-gradient-to-br from-amber-100 to-orange-100 overflow-hidden min-h-[400px] md:min-h-0">
                  {/* Imagen de fondo de platillos */}
                  <div className="absolute inset-0">
                    <Image
                      src="/fondo_de_platillos.jpg"
                      alt="Platillos del restaurante"
                      fill
                      className="object-cover opacity-40"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-200/80 via-transparent to-orange-100/50"></div>
                  </div>

                  {/* Personaje animado encima */}
                  <div className="relative h-full flex items-end justify-center pb-4 sm:pb-8">
                    <div className="relative animate-bounce-slow">
                      <Image
                        src="/personaje presentando_sinfondo.png"
                        alt="Chef presentadora"
                        width={280}
                        height={350}
                        className="object-contain drop-shadow-2xl w-full max-w-[240px] sm:max-w-[300px]"
                        priority
                      />
                    </div>
                  </div>

                  {/* Decoraciones: emojis flotantes */}
                  <div className="hidden md:block absolute top-10 right-10 text-4xl opacity-30 animate-spin-slow">
                    🍝
                  </div>
                  <div className="hidden md:block absolute top-20 left-10 text-3xl opacity-30 animate-bounce">
                    🍕
                  </div>
                  <div className="hidden md:block absolute bottom-32 right-12 text-3xl opacity-30 animate-pulse">
                    🥗
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. Hero Banner Principal */}
      <HeroBanner />

      {/* 2. Productos Destacados / Lo más vendido */}
      <ProductosDestacados products={products} />

      {/* 3. Sección de Promociones (Ingredientes, Preparación, Delivery) */}
      <PromocionesSection />

      {/* 4. Información de Contacto */}
      <ContactoSection />

      {/* 5. Footer */}
      <Footer />

      {/* Cart Drawer */}
      <CartDrawer visible={isCartOpen} onClose={() => setIsCartOpen(false)} bebidas={bebidas} />
    </div>
  );
}