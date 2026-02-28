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

// Datos mock para carga inicial rápida
const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Salmón a la Parrilla',
    price: 28,
    image: '/fondo_de_platillos.jpg',
    category: 'Platos Principales',
    description: 'Delicioso salmón fresco a la parrilla con vegetales',
    stock: 10,
    featured: true,
    isMenuDelDia: true,
    minPrice: 14
  },
  {
    id: '2',
    title: 'Coca Cola',
    price: 5,
    image: '/icono-yape.png',
    category: 'Bebidas',
    description: 'Refresco Coca Cola 500ml',
    stock: 50,
    featured: false,
    isMenuDelDia: false,
    minPrice: 2.5
  }
];

export default function DeliveryPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts); // Iniciar con datos mock
  const [isLoading, setIsLoading] = useState(false); // Cambiar a false para no mostrar loading inicialmente
  const [showWelcomeModal, setShowWelcomeModal] = useState(() => {
    // Solo mostrar modal la primera vez que visita
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hasVisitedVentify');
      if (hasVisited) return false;
      localStorage.setItem('hasVisitedVentify', 'true');
      return true;
    }
    return true;
  });
  const { isCartOpen, setIsCartOpen } = useUIStore();

  useEffect(() => {
    // Cargar productos de forma asíncrona (no bloqueante)
    const loadProducts = async () => {
      try {
        const realProducts = await fetchProducts();
        if (realProducts.length > 0) {
          setProducts(realProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        // Mantener datos mock si falla la API
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    // Auto-cerrar modal después de 3 segundos (reducido)
    if (showWelcomeModal) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(false);
      }, 3000); // Reducido de 5000 a 3000ms
      return () => clearTimeout(timer);
    }
  }, [showWelcomeModal]);

  const bebidas = products.filter(p => p.category === 'Bebidas');

  return (
    <div className="min-h-screen">
      {/* Modal de Bienvenida - Solo primera visita */}
      {showWelcomeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="relative max-w-6xl w-full">
            {/* Botón cerrar - MEJORADO */}
            <button
              onClick={() => setShowWelcomeModal(false)}
              className="absolute -top-3 -right-3 p-2.5 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-full transition-all z-20 shadow-2xl border-4 border-white hover:scale-110 active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Contenedor principal - Proporción equilibrada */}
            <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ aspectRatio: '16/9', maxHeight: '85vh' }}>
              {/* Grid de 2 columnas */}
              <div className="grid grid-cols-2 h-full">
                {/* ========== LADO IZQUIERDO: Contenido de texto ========== */}
                <div className="relative flex flex-col justify-center p-10 lg:p-14 bg-gradient-to-br from-white via-amber-50/20 to-orange-50/30">
                  {/* Badge BIENVENIDOS */}
                  <div className="text-center mb-6">
                    <span className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-5 py-2.5 rounded-full text-sm font-bold shadow-md border-2 border-amber-200">
                      ⭐ BIENVENIDOS
                    </span>
                  </div>

                  {/* Título principal */}
                  <h2 className="text-4xl lg:text-5xl font-bold text-center mb-4 leading-tight">
                    Conoce <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-700">Ventify</span> Restaurante
                  </h2>
                  <p className="text-center text-stone-700 text-lg mb-8 px-4">
                    Te presentamos lo mejor de nuestra cocina, preparada con amor y los ingredientes más frescos
                  </p>

                  {/* Tarjeta/Cartel con borde amarillo */}
                  <div className="relative mb-8 mx-auto w-full max-w-md">
                    {/* Badge "NUEVO" flotante */}
                    <div className="absolute -top-4 -right-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-xl animate-pulse z-10 border-2 border-white">
                      ¡NUEVO!
                    </div>

                    {/* Tarjeta con borde amarillo grueso */}
                    <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 rounded-3xl p-8 shadow-2xl border-[6px] border-amber-400">
                      {/* Icono de tenedor y cuchillo */}
                      <div className="text-center mb-4">
                        <span className="text-6xl drop-shadow-lg">🍽️</span>
                      </div>

                      {/* Texto del cartel */}
                      <p className="text-2xl lg:text-3xl font-bold text-orange-800 text-center leading-tight">
                        ¡Te invito a probar nuestros deliciosos platillos! 🍕
                      </p>
                    </div>
                  </div>

                  {/* Texto adicional */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-stone-800 mb-2">
                      Platillos que Enamoran
                    </h3>
                    <p className="text-stone-600">
                      Cada plato es una experiencia única preparada con ingredientes selectos
                    </p>
                  </div>

                  {/* Botón de acción */}
                  <button
                    onClick={() => setShowWelcomeModal(false)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 mx-auto"
                  >
                    Explorar Menú
                  </button>
                </div>

                {/* ========== LADO DERECHO: Imagen de fondo + Personaje ========== */}
                <div className="relative bg-stone-900 overflow-hidden">
                  {/* Imagen de fondo de platillos/restaurante */}
                  <div className="absolute inset-0">
                    <Image
                      src="/fondo_de_platillos.jpg"
                      alt="Fondo restaurante"
                      fill
                      className="object-cover opacity-50"
                      priority
                    />
                    {/* Overlay con gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-orange-800/40 to-transparent"></div>
                  </div>

                  {/* Contenido sobre la imagen */}
                  <div className="relative h-full flex flex-col">
                    {/* Texto superior: SABOR, EXPERIENCIA! */}
                    <div className="p-8 text-center">
                      <h2 className="text-5xl font-black text-white drop-shadow-2xl leading-tight mb-2">
                        SABOR,<br />EXPERIENCIA!
                      </h2>
                      <p className="text-2xl text-amber-300 font-semibold drop-shadow-lg">
                        Disfrutar Gourmet
                      </p>
                    </div>

                    {/* Personaje animado - Posicionado para señalar el cartel */}
                    <div className="flex-1 flex items-end justify-center pb-4">
                      <div className="relative animate-bounce-slow" style={{ marginRight: '-15%' }}>
                        <Image
                          src="/personaje presentando_sinfondo.png"
                          alt="Chef presentadora"
                          width={380}
                          height={480}
                          className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
                          priority
                        />
                      </div>
                    </div>

                    {/* Recomendación de platillo */}
                    <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-2xl max-w-xs">
                      <p className="text-sm text-stone-500 font-semibold mb-1">Recomendación</p>
                      <p className="text-lg font-bold text-orange-700">Salmón a la Parrilla</p>
                      <p className="text-2xl font-black text-orange-600">S/ 28</p>
                    </div>
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