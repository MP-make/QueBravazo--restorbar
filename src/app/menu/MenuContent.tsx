"use client";
import { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductCard } from '@/components/shared/ProductCard';
import { CartDrawer } from '@/components/shared/CartDrawer';
import { useUIStore } from '@/lib/stores/ui';
import { useCartStore } from '@/lib/stores/cart';
import { Search, ShoppingBag, X, UtensilsCrossed, GlassWater, Sparkles, Beer, ChevronRight } from 'lucide-react';

interface MenuContentProps {
  initialProducts: Product[];
}

const TABS = [
  { id: 'platillos', label: 'Platillos', emoji: '🍗', icon: UtensilsCrossed,
    keywords: ['fritura', 'hamburguesa', 'combo', 'pollo', 'alita', 'presa', 'comida', 'platillo', 'broaster'] },
  { id: 'gaseosas', label: 'Gaseosas', emoji: '🥤', icon: GlassWater,
    keywords: ['gaseosa', 'refresco', 'cola', 'inca kola', 'sprite', 'fanta'] },
  { id: 'bebidas', label: 'Bebidas', emoji: '🍺', icon: Beer,
    keywords: ['bebida', 'cerveza', 'trago', 'licor', 'vino', 'ron', 'pisco', 'vodka', 'mike', 'cielo', 'agua', 'jugo', 'marciano'] },
  { id: 'extras', label: 'Extras', emoji: '✨', icon: Sparkles, keywords: [] },
] as const;

type TabId = typeof TABS[number]['id'];

function getTabForCategory(category: string): TabId {
  const lower = (category || '').toLowerCase();
  for (const tab of TABS) {
    if (tab.id === 'extras') continue;
    if (tab.keywords.some((kw) => lower.includes(kw))) return tab.id;
  }
  return 'extras';
}

export default function MenuContent({ initialProducts }: MenuContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('platillos');
  const [search, setSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { isCartOpen, setIsCartOpen } = useUIStore();
  const { items } = useCartStore();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const bebidas = useMemo(
    () => initialProducts.filter((p) => getTabForCategory(p.category || '') === 'bebidas'),
    [initialProducts]
  );

  const groupedProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const pool = q
      ? initialProducts.filter((p) =>
          (p.title || '').toLowerCase().includes(q) ||
          (p.category || '').toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
        )
      : initialProducts.filter((p) => getTabForCategory(p.category || '') === activeTab);

    const map = new Map<string, Product[]>();
    for (const p of pool) {
      const cat = p.category || 'Otros';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(p);
    }
    return map;
  }, [initialProducts, activeTab, search]);

  const tabCounts = useMemo(() => {
    const counts: Record<TabId, number> = { platillos: 0, gaseosas: 0, bebidas: 0, extras: 0 };
    for (const p of initialProducts) counts[getTabForCategory(p.category || '')]++;
    return counts;
  }, [initialProducts]);

  const allResults = Array.from(groupedProducts.values()).flat();

  return (
    <>
      {/* ════════════════════════════════════════════════════════
          HEADER — fondo oscuro, una sola fila limpia + tabs
      ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-[#1a1a1a] shadow-2xl">

        {/* Fila principal: logo | buscador | carrito */}
        <div className="max-w-5xl mx-auto px-4 h-[60px] flex items-center gap-3">

          {/* Logo + nombre */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="relative w-9 h-9 flex-shrink-0">
              <Image
                src="/bravazo-logo.jpeg"
                alt="¡Qué Bravazo!"
                fill
                className="rounded-full object-cover ring-2 ring-amber-500"
              />
            </div>
            <div className="leading-tight">
              <p className="text-white font-black text-sm leading-none">Carta Digital</p>
              <p className="text-amber-400 font-black text-sm leading-none">¡Qué Bravazo!</p>
            </div>
          </Link>

          {/* Buscador — ocupa todo el espacio central */}
          <div className="relative flex-1 mx-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar platillo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-stone-700/60 border border-stone-600 rounded-xl text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:bg-stone-700 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Botón carrito */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex-shrink-0 flex items-center justify-center bg-amber-500 hover:bg-amber-400 active:scale-95 text-white rounded-xl transition-all shadow-lg shadow-amber-500/20"
            style={{ width: 44, height: 44 }}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center font-black border-2 border-[#1a1a1a] px-0.5">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* ── Tab bar ── */}
        <div className="border-t border-white/10">
          <div className="max-w-5xl mx-auto px-2 flex overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const count = tabCounts[tab.id];
              const isActive = !search && activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                  className={`
                    flex items-center gap-1.5 px-4 py-3 text-sm font-semibold whitespace-nowrap
                    border-b-2 transition-all duration-150 flex-shrink-0
                    ${isActive
                      ? 'border-amber-500 text-white bg-white/5'
                      : 'border-transparent text-stone-400 hover:text-stone-200 hover:bg-white/5'}
                  `}
                >
                  <span className="text-base leading-none">{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {count > 0 && (
                    <span className={`
                      text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-none
                      ${isActive ? 'bg-amber-500 text-white' : 'bg-white/10 text-stone-400'}
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ════════════════════════════════════════════════════════
          CONTENIDO
      ════════════════════════════════════════════════════════ */}
      <main className="max-w-5xl mx-auto px-4 py-5 pb-32">

        {/* Banner del tab activo */}
        {!search && (
          <div className="mb-6 rounded-2xl overflow-hidden relative h-28 md:h-36 bg-stone-900 shadow-md">
            <Image
              src={
                activeTab === 'platillos' ? '/Fondo frituras.png' :
                activeTab === 'bebidas'   ? '/Fondo restaurante.png' :
                '/fondo_de_platillos.jpg'
              }
              alt={TABS.find(t => t.id === activeTab)?.label ?? activeTab}
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex items-center px-6">
              <div>
                <p className="text-3xl mb-0.5 leading-none">{TABS.find(t => t.id === activeTab)?.emoji}</p>
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">
                  {TABS.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-amber-300 text-xs mt-0.5 font-semibold">
                  {tabCounts[activeTab]} producto{tabCounts[activeTab] !== 1 ? 's' : ''} disponibles
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Cabecera resultado de búsqueda */}
        {search && (
          <div className="mb-5 flex items-center gap-2">
            <Search className="w-4 h-4 text-stone-400" />
            <p className="text-stone-500 text-sm">
              <span className="font-semibold text-stone-700">{allResults.length}</span>{' '}
              resultado{allResults.length !== 1 ? 's' : ''} para{' '}
              <span className="text-amber-600 font-semibold">"{search}"</span>
            </p>
            <button
              onClick={() => setSearch('')}
              className="ml-auto text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
            >
              Limpiar <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Estado vacío */}
        {groupedProducts.size === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-lg font-semibold text-stone-600 mb-1">
              {search ? 'Sin resultados' : 'Sin productos en esta sección'}
            </h3>
            <p className="text-stone-400 text-sm">
              {search ? `No encontramos nada para "${search}"` : 'Pronto habrá más opciones aquí'}
            </p>
          </div>
        )}

        {/* Categorías + productos */}
        <div className="space-y-10">
          {Array.from(groupedProducts.entries()).map(([category, products]) => (
            <section key={category}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-6 bg-amber-500 rounded-full" />
                <h3 className="text-base font-black text-stone-800 uppercase tracking-wide">{category}</h3>
                <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full font-semibold">
                  {products.length}
                </span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} mode="delivery" />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA delivery */}
        {!search && (
          <div className="mt-12 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-stone-800 hover:bg-stone-900 text-white px-6 py-3 rounded-full font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              🛵 Pedir delivery a domicilio
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      {/* Botón flotante carrito */}
      {cartCount > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 bg-amber-500 hover:bg-amber-400 active:scale-95 text-white px-6 py-3.5 rounded-full shadow-2xl shadow-amber-500/50 font-bold text-sm transition-all"
          >
            <ShoppingBag className="w-5 h-5" />
            Ver pedido · {cartCount}
            <span className="bg-white text-amber-600 text-xs font-black px-2.5 py-1 rounded-full">
              S/ {cartTotal.toFixed(2)}
            </span>
          </button>
        </div>
      )}

      <CartDrawer visible={isCartOpen} onClose={() => setIsCartOpen(false)} bebidas={bebidas} />
    </>
  );
}