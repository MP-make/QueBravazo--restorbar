"use client";
import Image from 'next/image';
import { Product } from '@/types';

const TOP_PRODUCTS = [
  { rankName: '#2 Vendido', category: 'HAMBURGUESAS', search: ['que bravazo', 'bravazo'], name: 'QUE BRAVAZO!', price: 18.00, emoji: '🍔' },
  { rankName: '#3 Vendido', category: 'FRITURAS', search: ['alitas bbq', 'alitas'], name: 'Alitas BBQ con papas fritas', price: 15.00, emoji: '🍗' },
  { rankName: '#4 Vendido', category: 'FRITURAS', search: ['broaster'], name: 'Broaster Bravazo', price: 15.00, emoji: '🍗' },
];

function findProductImage(products: Product[], search: string[]): string {
  for (const term of search) {
    const lower = term.toLowerCase();
    const match = products.find(p => p.title.toLowerCase().includes(lower));
    if (match?.image) return match.image;
  }
  return '';
}

interface FuegoSectionProps {
  products: Product[];
}

export default function FuegoSection({ products }: FuegoSectionProps) {
  return (
    <section className="w-full bg-gradient-to-r from-[#e64a19] to-[#ff5722]">
      <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest leading-[1.1] mb-6">
              ¿Por qué somos <span className="text-black">bravazos</span>?
            </h2>
            <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-md">
              Hamburguesas 100% artesanales, alitas BBQ adictivas y la mejor barra de tragos de Pisco. 
              Todo hecho con sazón peruana y el fuelle que solo un verdadero bravazo puede dar.
            </p>
            <div className="flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#ff5722] bg-stone-700 flex items-center justify-center text-[10px] text-white font-bold shadow-md">
                    {['🔥','🍔','🍗'][i-1]}
                  </div>
                ))}
              </div>
              <p className="text-white/70 text-xs font-medium">+{products.length} productos disponibles</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {TOP_PRODUCTS.map((item, i) => {
              const productImage = findProductImage(products, item.search);
              return (
                <div key={i} className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-[#1e1e20] border border-white/10 group shadow-xl shadow-black/30">
                  <div className="absolute inset-0">
                    {productImage ? (
                      <Image src={productImage} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-stone-700 to-stone-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
                    <span className="text-3xl mb-1.5">{item.emoji}</span>
                    <p className="text-white font-bold text-[11px] leading-tight mb-0.5">{item.name}</p>
                    <p className="text-[#ff5722] font-black text-sm">S/ {item.price.toFixed(2)}</p>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-bold text-white bg-black/50 px-2 py-0.5 rounded-full">{item.category}</span>
                  </div>
                  {item.rankName && (
                    <div className="absolute top-2 right-2">
                      <span className="text-[10px] font-bold text-white bg-[#ff5722] px-2 py-0.5 rounded-full">{item.rankName}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
