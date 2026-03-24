"use client";
import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, ArrowRight, Wine } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart";
import { useToastStore } from "@/lib/stores/toast";

interface TragosSectionProps {
  products: Product[];
}

export default function TragosSection({ products }: TragosSectionProps) {
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  const handleAddToCart = (product: Product) => {
    addItem(product);
    addToast(`✅ ${product.title} agregado al carrito`);
  };

  // Filtrar productos de tragos
  const tragos = products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('trago') || cat.includes('licor') || cat.includes('coctel') || cat.includes('bebida alcoholica');
  }).slice(0, 4); // Mostrar hasta 4

  if (tragos.length === 0) return null;

  return (
    <section id="tragos" className="py-10 md:py-14 section-warm overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block bg-amber-100/80 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-amber-200/50">
            🍹 NUEVA CATEGORÍA
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            Nuestros <span className="gradient-text">Tragos</span>
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Disfruta de nuestros cocteles y bebidas premium. ¡Para celebrar con estilo! 🥂
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {tragos.map((product, index) => (
            <div
              key={product.id}
              className="group card-elegant overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              <div className="relative">
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                    🔥 Nuevo
                  </span>
                </div>

                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-7xl">🍹</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>

              <div className="p-5">
                {product.category && (
                  <span className="text-xs text-amber-600 font-medium uppercase tracking-wide">
                    {product.category}
                  </span>
                )}

                <div className="flex items-center gap-1 mt-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < 4 ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}`}
                    />
                  ))}
                  <span className="text-sm text-stone-500 ml-2">(4.5)</span>
                </div>

                <h3 className="font-bold text-stone-800 text-lg mb-1 line-clamp-1 group-hover:text-amber-700 transition-colors">
                  {product.title}
                </h3>
                <p className="text-stone-500 text-sm mb-3 line-clamp-2">
                  {product.description || "Delicioso trago preparado con los mejores ingredientes"}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <span className="text-2xl font-bold gradient-text">
                    S/ {product.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="btn-primary !p-3 !rounded-full group-hover:scale-110 transition-transform"
                  >
                    <ShoppingCart className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/menu?tab=tragos"
            className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-soft hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Ver Todos los Tragos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}