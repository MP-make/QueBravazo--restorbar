// components/shared/ProductCard.tsx
"use client";
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product, AppMode } from '@/types';
import { useProductActions } from '@/lib/hooks/useProductActions';

interface ProductCardProps {
  product: Product;
  mode: AppMode;
  onQuickView?: (product: Product) => void;
}

export const ProductCard = ({ product, mode, onQuickView }: ProductCardProps) => {
  const { handleAddToCart } = useProductActions();
  // Solo mostrar "agotado" en modo waiter, nunca al cliente final
  const isOutOfStock = mode === 'waiter' && product.stock !== undefined && product.stock <= 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden flex flex-col shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">

      {/* ── Imagen ──────────────────────────────────────────────── */}
      <div className="relative w-full aspect-square overflow-hidden bg-stone-100">
        <Image
          src={product.image || '/bravazo-logo.jpeg'}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-transform duration-300 ${!isOutOfStock ? 'group-hover:scale-105' : 'opacity-60'}`}
        />

        {/* Overlay agotado — solo waiter */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
              Agotado
            </span>
          </div>
        )}

        {/* Badge destacado */}
        {product.featured && !isOutOfStock && (
          <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            ⭐ Destacado
          </span>
        )}

        {/* Badge menú del día (waiter) */}
        {product.isMenuDelDia && mode === 'waiter' && (
          <span className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
            🍽️ Menú del día
          </span>
        )}

        {/* Precio sobre la imagen — abajo */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
          <span className="text-white font-black text-lg leading-none drop-shadow">
            S/ {product.price.toFixed(2)}
          </span>
        </div>
      </div>

      {/* ── Info + acción ────────────────────────────────────────── */}
      <div className="px-3 py-2.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wide leading-none mb-0.5">
            {product.category}
          </p>
          <h3 className="text-sm font-bold text-stone-800 leading-tight line-clamp-2">
            {product.title}
          </h3>
          {product.description && (
            <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{product.description}</p>
          )}
        </div>

        {/* Botón acción */}
        {!isOutOfStock ? (
          <>
            {(mode === 'delivery' || mode === 'menu') && (
              <button
                onClick={() => handleAddToCart(product, 'delivery')}
                className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 active:scale-90 text-white rounded-full flex items-center justify-center shadow-md shadow-orange-500/30 transition-all"
                title="Agregar al carrito"
              >
                <Plus className="w-5 h-5" strokeWidth={3} />
              </button>
            )}
            {mode === 'waiter' && (
              <button
                onClick={() => handleAddToCart(product, 'waiter')}
                className="flex-shrink-0 w-9 h-9 bg-green-500 hover:bg-green-600 active:scale-90 text-white rounded-full flex items-center justify-center shadow-md shadow-green-500/30 transition-all font-black text-xl"
                title="Agregar a comanda"
              >
                +
              </button>
            )}
          </>
        ) : (
          <span className="flex-shrink-0 text-[10px] text-red-400 font-bold bg-red-50 px-2 py-1 rounded-full border border-red-100">
            Sin stock
          </span>
        )}
      </div>
    </div>
  );
};