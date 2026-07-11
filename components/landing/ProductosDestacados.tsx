"use client";
import Link from "next/link";
import { ArrowRight, UtensilsCrossed } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "@/components/shared/ProductCard";

// SKUs de los productos estrella que queremos mostrar, en orden
// Acepta: SKU exacto, id exacto, o coincidencia parcial en el título
const FEATURED_SKUS = ['Hamb-005', 'Fri-001', 'Fri-002', 'Hamb-003'];

interface ProductosDestacadosProps {
  products: Product[];
}

export default function ProductosDestacados({ products }: ProductosDestacadosProps) {
  // Buscar los productos por SKU/id (case-insensitive) en el orden definido
  const productosAMostrar: Product[] = FEATURED_SKUS
    .map(sku => {
      const skuLower = sku.toLowerCase();
      return products.find(p =>
        (p.id || '').toLowerCase() === skuLower ||
        ((p as any).sku || '').toLowerCase() === skuLower
      );
    })
    .filter((p): p is Product => p !== undefined);

  // Fallback: si no se encontraron suficientes por SKU, completar con los primeros productos disponibles
  const lista: Product[] = productosAMostrar.length >= 2
    ? productosAMostrar
    : products.slice(0, 4);

  if (products.length === 0) {
    return (
        <section id="productos-destacados" className="py-10 md:py-14 bg-white/20 backdrop-blur-md overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block bg-amber-100/80 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-amber-200/50">
              ⭐ LO MÁS VENDIDO
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
              Nuestros Platos <span className="gradient-text">Estrella</span>
            </h2>
          </div>
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-amber-100 rounded-full mb-6 animate-pulse">
              <UtensilsCrossed className="w-12 h-12 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-stone-700 mb-2">Cargando productos...</h3>
            <p className="text-stone-500 max-w-md mx-auto">
              Los productos se cargarán automáticamente desde tu cuenta de Ventify.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="productos-destacados" className="py-10 md:py-14 bg-white/20 backdrop-blur-md overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="inline-block bg-amber-100/80 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-amber-200/50">
            ⭐ LO MÁS VENDIDO
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            Nuestros Platos <span className="gradient-text">Estrella</span>
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Los favoritos de nuestros clientes. Preparados al momento con ingredientes frescos. 🔥
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {lista.map((product) => (
            <ProductCard key={product.id} product={product} mode="delivery" />
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-soft hover:shadow-lg hover:scale-105 active:scale-95"
          >
            Ver Menú Completo
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
