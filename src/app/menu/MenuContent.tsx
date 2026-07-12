"use client";
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, Search, X, ShoppingBag, Menu } from 'lucide-react';
import { Product } from '@/types';
import { CartDrawer } from '@/components/shared/CartDrawer';
import { useUIStore } from '@/lib/stores/ui';
import { useCartStore } from '@/lib/stores/cart';
import { useSearchStore } from '@/lib/stores/search';
import { useProductActions } from '@/lib/hooks/useProductActions';

interface MenuContentProps {
  initialProducts: Product[];
}

interface SectionInfo {
  id: string;
  icon?: string;
  label: string;
  desc: string;
  keywords: string[];
}

const SECTIONS: SectionInfo[] = [
  { id: 'combos', label: 'Combos', desc: 'Para compartir con la gente', keywords: ['combo', 'promo', 'oferta', 'happy hour', '2x1'] },
  { id: 'platos-fuertes', label: 'Platos Fuertes', desc: 'Broaster, hamburguesas, alitas', keywords: ['pollo', 'broaster', 'hamburguesa', 'alita', 'presa', 'comida', 'platillo', 'fritura', 'parrilla', 'carne', 'chicharron'] },
  { id: 'postres', label: 'Postres', desc: 'Dulces y más', keywords: ['postre', 'dulce', 'helado', 'pie', 'torta'] },
  { id: 'ensaladas', label: 'Ensaladas', desc: 'Frescas y saludables', keywords: ['ensalada', 'verdura', 'vegetal', 'salad'] },
  { id: 'salsas', label: 'Salsas & Cremas', desc: 'Acompañantes', keywords: ['salsa', 'crema', 'aderezo', 'mayonesa', 'ketchup', 'mostaza'] },
  { id: 'caldos', label: 'Caldos', desc: 'Calientes y reconfortantes', keywords: ['caldo', 'sopa', 'consome'] },
  { id: 'platos-a-la-carta', label: 'Platos a la Carta', desc: 'Preparaciones especiales', keywords: ['plato a la carta', 'a la carta'] },
  { id: 'cocteles', label: 'Cocteles', desc: 'Tragos y más', keywords: ['trago', 'coctel', 'licor', 'ron', 'pisco', 'vodka', 'whisky', 'marciano', 'mike'] },
  { id: 'bebidas', label: 'Bebidas', desc: 'Gaseosas, jugos, tragos', keywords: ['gaseosa', 'bebida', 'refresco', 'cola', 'agua', 'jugo', 'cerveza', 'trago', 'licor', 'coctel', 'ron', 'pisco', 'vodka', 'whisky', 'marciano', 'mike'] },
  { id: 'extras', label: 'Extras', desc: 'Complementos', keywords: [] },
];

function getSectionForCategory(category: string): string {
  const lower = (category || '').toLowerCase();
  for (const s of SECTIONS) {
    if (s.id === 'extras') continue;
    if (s.keywords.some((kw) => lower.includes(kw))) return s.id;
  }
  return 'extras';
}

function MenuProductCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  const { handleAddToCart } = useProductActions();
  return (
    <div className="bg-[#1e1e20] rounded-xl overflow-hidden shadow-md shadow-black/30 border border-white/5 hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 transition-all group">
      <div className="relative w-full aspect-square overflow-hidden bg-[#2a2a2d]">
        {imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-500">
            <svg className="w-10 h-10 mb-1" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <span className="text-[10px] font-medium">{product.title}</span>
          </div>
        ) : (
          <Image
            src={product.image || '/logo-que-bravazo.png'}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">{product.title}</h3>
        {product.description && (
          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{product.description}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-base font-black text-[#ff5722]">S/ {product.price.toFixed(2)}</span>
          <button
            onClick={() => handleAddToCart(product, 'delivery')}
            className="w-8 h-8 bg-[#ff5722] hover:bg-orange-500 active:scale-90 text-white rounded-full flex items-center justify-center transition-all shadow-sm shadow-orange-500/30"
          >
            <Plus className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MenuContent({ initialProducts }: MenuContentProps) {
  const [activeSection, setActiveSection] = useState('combos');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCartOpen, setIsCartOpen } = useUIStore();
  const { items } = useCartStore();
  const { setIsOpen: setIsSearchOpen } = useSearchStore();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const sectionMap = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const s of SECTIONS) map.set(s.id, []);
    for (const p of initialProducts) {
      const secId = getSectionForCategory(p.category || '');
      const arr = map.get(secId);
      if (arr) arr.push(p);
    }
    return map;
  }, [initialProducts]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return initialProducts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [initialProducts, search]);

  const visibleSections = useMemo(() => {
    if (search) {
      const secs = new Set<string>();
      for (const p of searchResults!) secs.add(getSectionForCategory(p.category || ''));
      return Array.from(secs);
    }
    return SECTIONS.filter((s) => (sectionMap.get(s.id)?.length ?? 0) > 0).map((s) => s.id);
  }, [search, searchResults, sectionMap]);

  const categorizedSearch = useMemo(() => {
    if (!search) return null;
    const map = new Map<string, Product[]>();
    for (const p of searchResults!) {
      const secId = getSectionForCategory(p.category || '');
      if (!map.has(secId)) map.set(secId, []);
      map.get(secId)!.push(p);
    }
    return map;
  }, [search, searchResults]);

  const bebidas = useMemo(
    () => initialProducts.filter((p) => getSectionForCategory(p.category || '') === 'bebidas'),
    [initialProducts]
  );

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setSearch('');
    setSidebarOpen(false);
    const el = document.getElementById(`section-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Intersection Observer — active pill se actualiza al scrollear
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        intersecting.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = intersecting[0].target.id.replace('section-', '');
        setActiveSection(id);
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    const els = document.querySelectorAll('[id^="section-"]');
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [visibleSections]);

  return (
    <div className="min-h-screen relative pt-0 md:pt-20">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/menú.webp)' }} />
      <div className="fixed inset-0 bg-black/80" />

      <div className="relative z-10">
        {/* ════════════════════════════════════════
            SIDEBAR — overlay + panel deslizante
        ════════════════════════════════════════ */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-screen w-[320px] bg-[#1a1a1d] border-r border-white/10 shadow-2xl shadow-black/50 flex flex-col justify-between translate-x-0 animate-slide-in" style={{ fontFamily: 'var(--font-sans)' }}>
              {/* BLOQUE SUPERIOR: Header + Buscador + Enlaces */}
              <div>
                <div className="flex items-center justify-between px-5 h-16 border-b border-white/5">
                  <Link href="/" className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#ff5722]/30">
                      <Image src="/logo_que_bravazo.png" alt="¡Qué Bravazo!" fill className="object-cover" />
                    </div>
                    <div className="leading-tight">
                      <p className="text-stone-400 text-[10px] font-bold tracking-[0.2em] uppercase">Menú</p>
                      <p className="text-white font-black text-sm uppercase">¡Qué Bravazo!</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-stone-400 hover:text-white transition-colors"
                    aria-label="Cerrar"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="px-5 py-6 flex flex-col gap-1">
                  <button
                    onClick={() => { setIsSearchOpen(true); setSidebarOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 mb-6 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-stone-400 hover:text-white hover:border-[#ff5722]/50 transition-all"
                  >
                    <Search className="w-4 h-4" />
                    <span>Buscar platillos...</span>
                  </button>
                  <Link
                    href="/"
                    onClick={() => setSidebarOpen(false)}
                    className="block py-4 text-2xl font-black text-white uppercase tracking-widest hover:text-[#ff5722] transition-colors border-b border-white/5"
                  >
                    Inicio
                  </Link>
                  <Link
                    href="/ubicanos"
                    onClick={() => setSidebarOpen(false)}
                    className="block py-4 text-2xl font-black text-white uppercase tracking-widest hover:text-[#ff5722] transition-colors border-b border-white/5"
                  >
                    Ubícanos
                  </Link>
                  <button
                    onClick={() => { setIsCartOpen(true); setSidebarOpen(false); }}
                    className="block w-full text-left py-4 text-2xl font-black text-white uppercase tracking-widest hover:text-[#ff5722] transition-colors"
                  >
                    Carrito
                  </button>
                </div>
              </div>

              {/* ESPACIADOR CENTRAL */}
              <div className="flex-1" />

              {/* BLOQUE INFERIOR: Contacto y Redes */}
              <div className="px-5 py-6 border-t border-zinc-800">
                <div className="space-y-4">
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">PEDIDOS & RESERVAS</p>
                    <a href="https://wa.me/51946826535" target="_blank" rel="noopener noreferrer" className="text-zinc-400 text-sm hover:text-white transition-colors">
                      +51 946 826 535
                    </a>
                  </div>
                  <div>
                    <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase mb-1">VISÍTANOS</p>
                    <p className="text-zinc-400 text-sm">Urb. Los Jardines de San Andrés, Pisco</p>
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <a href="https://www.instagram.com/quebravazorestobar?igsh=dGF6Znd3anJjNDk0" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors" aria-label="Instagram">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a href="https://www.tiktok.com/@quebravazo.restobar?_r=1&_t=ZS-97w9t9lowuF" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors" aria-label="TikTok">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>
                    </a>
                    <a href="https://www.facebook.com/share/1BTpjrUm94/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-orange-500 transition-colors" aria-label="Facebook">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ════════════════════════════════════════
            HEADER DESKTOP (oculto en mobile)
        ════════════════════════════════════════ */}
        <div className="hidden md:block fixed top-0 z-50 bg-black/70 backdrop-blur-md border-b border-white/5 w-full">
          <div className="w-full px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 text-stone-400 hover:text-white transition-colors"
                aria-label="Menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            <Link href="/" className="flex items-center gap-3">
              <div className="relative w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-[#ff5722]/30 flex-shrink-0">
                <Image src="/logo_que_bravazo.png" alt="¡Qué Bravazo!" fill className="object-cover" />
              </div>
              <div className="leading-tight">
                <p className="text-stone-400 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">Menú</p>
                <p className="text-[#ff5722] font-black text-sm md:text-base leading-none">¡Qué Bravazo!</p>
              </div>
            </Link>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-400 hover:text-white transition-colors"
              aria-label="Carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[#ff5722] text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center border-2 border-black/70">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════
            BLOQUE DE PRESENTACIÓN
        ════════════════════════════════════════ */}
        <div className="text-center pt-10 pb-6 md:pt-14 md:pb-8 px-4">
          <p className="text-[#ff5722] text-xs md:text-sm font-bold tracking-[0.2em] uppercase mb-2">
            Tus favoritos en un solo lugar
          </p>
          <h1 className="font-black text-3xl md:text-5xl text-white uppercase tracking-widest leading-tight">
            ¡Qué <span className="text-[#ff5722]">Bravazo</span>!
          </h1>
          <p className="text-stone-500 text-xs md:text-sm mt-2 max-w-md mx-auto">
            Broaster · Hamburguesas · Alitas · Cervezas · Tragos
          </p>


        </div>

        {/* ════════════════════════════════════════
            PILL NAV — sticky con fondo + blur
        ════════════════════════════════════════ */}
        <div className="sticky top-0 md:top-24 z-40 bg-black py-4">
          <div className="w-full px-6 flex justify-center">
            <div className="inline-flex bg-[#ff5722] rounded-full p-1.5 shadow-lg shadow-orange-500/20 max-w-full">
              <div
                className="flex items-center gap-1 overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {SECTIONS.filter((s) => visibleSections.includes(s.id)).map((s) => {
                  const isActive = !search && activeSection === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollToSection(s.id)}
                      className={`flex-shrink-0 px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-300 snap-center flex items-center gap-1 ${
                        isActive
                          ? 'bg-white text-[#ff5722] shadow-md scale-105'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            CONTENIDO
        ════════════════════════════════════════ */}
        <main className="max-w-7xl mx-auto px-6 pb-32">
          {search && (
            <div className="py-4">
              <p className="text-stone-400 text-sm">
                <span className="font-semibold text-white">{searchResults?.length ?? 0}</span> resultado{searchResults?.length !== 1 ? 's' : ''} para{' '}
                <span className="text-[#ff5722] font-semibold">"{search}"</span>
                <button onClick={() => setSearch('')} className="ml-2 text-xs text-orange-400 hover:text-orange-300 font-semibold">Limpiar</button>
              </p>
            </div>
          )}

          {visibleSections.length === 0 && (
            <div className="text-center py-20">
              <p className="text-4xl mb-3">🔍</p>
              <h3 className="text-lg font-semibold text-stone-300 mb-1">
                {search ? 'Sin resultados' : 'Sin productos'}
              </h3>
              <p className="text-stone-500 text-sm">Pronto habrá más opciones</p>
            </div>
          )}

          <div>
            {visibleSections.map((secId, idx) => {
              const secInfo = SECTIONS.find((s) => s.id === secId)!;
              const products = search ? (categorizedSearch?.get(secId) ?? []) : (sectionMap.get(secId) ?? []);
              if (products.length === 0) return null;

              return (
                <section key={secId} id={`section-${secId}`} className="scroll-mt-16 md:scroll-mt-44">
                  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 lg:gap-8 xl:gap-12 py-8 lg:py-10">
                    <div className="min-w-0">
                      <div className="lg:sticky lg:top-44 flex lg:flex-col items-start gap-3 lg:gap-2">
                        <span className="text-2xl lg:text-3xl">{secInfo.icon}</span>
                        <div>
                          <h2 className="text-lg lg:text-xl font-black text-white uppercase tracking-widest leading-tight">
                            {secInfo.label}
                          </h2>
                          <p className="text-xs text-stone-500 mt-0.5 lg:mt-1 leading-relaxed">
                            {secInfo.desc}
                          </p>
                          <p className="text-[10px] text-stone-600 font-medium mt-1">
                            {products.length} producto{products.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                        {products.map((product) => (
                          <MenuProductCard key={product.id} product={product} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {idx < visibleSections.length - 1 && (
                    <div className="flex items-center gap-3 py-1">
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                      <span className="text-stone-600 text-[8px] font-bold tracking-[0.3em] uppercase">✦</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </main>

        <CartDrawer visible={isCartOpen} onClose={() => setIsCartOpen(false)} bebidas={bebidas} />
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slide-in 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}
