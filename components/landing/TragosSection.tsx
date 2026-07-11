"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Product } from "@/types";
import { ProductCard } from "@/components/shared/ProductCard";

interface TragosSectionProps {
  products: Product[];
}

export default function TragosSection({ products }: TragosSectionProps) {
  // Filtrar productos de tragos
  const tragos = products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    return cat.includes('trago') || cat.includes('licor') || cat.includes('coctel') || cat.includes('bebida alcoholica');
  }).slice(0, 4); // Mostrar hasta 4

  if (tragos.length === 0) return null;

  return (
    <section id="tragos" className="py-10 md:py-14 bg-white/20 backdrop-blur-md overflow-hidden">
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

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {tragos.map((product) => (
            <ProductCard key={product.id} product={product} mode="delivery" />
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