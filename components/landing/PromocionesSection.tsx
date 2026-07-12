"use client";
import Image from "next/image";
import { Percent, Gift, Clock, Sparkles } from "lucide-react";
import { Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart";
import { useToastStore } from "@/lib/stores/toast";

interface PromocionesSectionProps {
  products: Product[];
}

const comboData = [
  {
    title: "Combo Bravazo",
    badge: "🔥 El Más Pedido",
    color: "from-amber-600 to-orange-700",
    precioAnterior: "S/ 28.00",
  },
  {
    title: "Combo Chevere",
    badge: "🍺 Con Cerveza",
    color: "from-emerald-600 to-teal-700",
    precioAnterior: "S/ 36.00",
  },
  {
    title: "Happy Hour",
    badge: "🍹 2x20",
    color: "from-violet-600 to-purple-700",
    precioAnterior: null,
  },
];

export default function PromocionesSection({ products }: PromocionesSectionProps) {
  const { addItem } = useCartStore();
  const { addToast } = useToastStore();

  const handleAddToCart = (product: Product) => {
    addItem(product);
    addToast({ title: '¡Añadido al carrito!', subtitle: `1x ${product.title}` });
  };

  const combos = comboData.map(data => {
    const product = products.find(p => p.title.toLowerCase().includes(data.title.toLowerCase()));
    return product ? { ...data, product } : null;
  }).filter(Boolean);

  return (
    <section id="promociones" className="py-16 md:py-24 bg-white/20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 bg-rose-100/80 text-rose-700 px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-rose-200/50">
            <Percent className="w-4 h-4" />
            OFERTAS ESPECIALES
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            Combos <span className="text-rose-600">Bien Bravazos</span> 🔥
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Aprovecha nuestros combos y come más por menos. ¡Pide ahora y te lo llevamos volando!
          </p>
        </div>

        {/* Grid de promociones */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {combos.map((combo) => {
            if (!combo || !combo.product) return null;
            const { product, badge, color, precioAnterior } = combo;
            return (
              <div key={product.id} className="bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden flex flex-col shadow-sm border border-stone-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group">
                <div className="relative w-full aspect-square overflow-hidden bg-stone-100">
                  <Image
                    src={product.image || '/Fondo frituras.png'}
                    alt={product.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${color} opacity-30`} />
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow">
                    {badge}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                    <span className="text-white font-black text-lg leading-none drop-shadow">
                      {precioAnterior && (
                        <span className="text-stone-400 line-through text-sm font-normal mr-2">{precioAnterior}</span>
                      )}
                      S/ {product.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="px-3 py-2.5 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wide leading-none mb-0.5">
                      Combo especial
                    </p>
                    <h3 className="text-sm font-bold text-stone-800 leading-tight line-clamp-2">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-stone-400 line-clamp-1 mt-0.5">{product.description || 'Combo especial'}</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-shrink-0 w-9 h-9 bg-gradient-to-br from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:scale-90 text-white rounded-full flex items-center justify-center shadow-md shadow-rose-500/30 transition-all"
                  >
                    <span className="text-lg font-bold">+</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Banner de oferta especial — OCULTO TEMPORALMENTE */}
        {/*
        <div className="mt-16 relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 p-8 md:p-12 shadow-warm">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle,_white_1px,_transparent_1px)] bg-[length:24px_24px]" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
                <Gift className="w-8 h-8 text-amber-200" />
                <span className="text-amber-200 font-bold text-lg">OFERTA LIMITADA</span>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                ¡Primera compra con 20% OFF!
              </h3>
              <p className="text-white/80 text-lg">
                Usa el código{" "}
                <span className="bg-white/20 px-3 py-1 rounded-lg font-mono font-bold">BRAVAZO20</span>{" "}
                en tu primer pedido
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center glass-effect !bg-white/15 px-6 py-4 rounded-2xl !border-white/20">
                <Clock className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="text-white/80 text-sm">Oferta válida</p>
                <p className="text-white font-bold text-lg">Tiempo limitado</p>
              </div>
              <button className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-105 shadow-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Pedir Ahora
              </button>
            </div>
          </div>
        </div>
        */}
      </div>
    </section>
  );
}
