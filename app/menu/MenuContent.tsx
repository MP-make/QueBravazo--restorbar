"use client";
import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, X, ShoppingBag, Menu } from 'lucide-react';
import { Product } from '@/types';
import { CartDrawer } from '@/components/shared/CartDrawer';
import { useUIStore } from '@/lib/stores/ui';
import { useCartStore } from '@/lib/stores/cart';
import { useSearchStore } from '@/lib/stores/search';
import { useProductActions } from '@/lib/hooks/useProductActions';

interface MenuContentProps {
  initialProducts: Product[];
}

interface CategoryInfo {
  name: string;
  slug: string;
  description: string;
}

const FALLBACK_KEYWORDS: Record<string, string[]> = {
  'platos-fuertes': ['pollo', 'broaster', 'hamburguesa', 'alita', 'presa', 'comida', 'platillo', 'fritura', 'parrilla', 'carne', 'chicharron'],
  'bebidas': ['gaseosa', 'bebida', 'refresco', 'cola', 'agua', 'jugo', 'cerveza', 'trago', 'licor', 'coctel', 'ron', 'pisco', 'vodka', 'whisky'],
};

function matchFallback(category: string): string {
  const lower = (category || '').toLowerCase();
  for (const [slug, keywords] of Object.entries(FALLBACK_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return slug;
  }
  return '';
}

function getProductSlug(p: Product, categories: CategoryInfo[]): string {
  if (p.category_slug) {
    if (categories.some((c) => c.slug === p.category_slug)) return p.category_slug;
    if (p.category_slug === 'extras') return 'extras';
  }
  const lower = (p.category || '').toLowerCase();
  for (const cat of categories) {
    const nameLower = cat.name.toLowerCase();
    if (lower.includes(nameLower) || lower.includes(cat.slug.replace(/-/g, ' '))) return cat.slug;
  }
  return matchFallback(p.category || '');
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
  const [activeSection, setActiveSection] = useState('');
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [activeCategorySlugs, setActiveCategorySlugs] = useState<Set<string> | null>(null);
  const { isCartOpen, setIsCartOpen } = useUIStore();
  const { items } = useCartStore();
  const { setIsOpen: setIsSearchOpen } = useSearchStore();
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => {
    fetch('/api/schedules/active')
      .then((r) => r.json())
      .then(async (sched) => {
        if (!sched.active_types || sched.active_types.length === 0) {
          setActiveCategorySlugs(new Set());
          setCategories([]);
          return;
        }
        const results = await Promise.all(
          sched.active_types.map((type: string) =>
            fetch(`/api/categories?menu_type=${type}`).then(r => r.json())
          )
        );
        const seen = new Set<string>();
        const merged = results
          .flatMap(r => r.data || [])
          .filter((c: any) => {
            if (seen.has(c.slug)) return false;
            seen.add(c.slug);
            return true;
          });
        setCategories(merged.map((c: any) => ({ name: c.name, slug: c.slug, description: c.description || '' })));
        setActiveCategorySlugs(new Set(merged.map((c: any) => c.slug)));
      })
      .catch((err) => {
        console.error('Schedule/categories fetch error:', err);
      });
  }, []);

  const filteredProducts = useMemo(
    () => initialProducts.filter((p) => p.title?.trim() && p.price > 0),
    [initialProducts],
  );

  const sectionMap = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const cat of categories) map.set(cat.slug, []);
    for (const p of filteredProducts) {
      const slug = getProductSlug(p, categories);
      if (slug && map.has(slug)) map.get(slug)!.push(p);
    }
    return map;
  }, [filteredProducts, categories]);

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return filteredProducts.filter(
      (p) =>
        (p.title || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.description || '').toLowerCase().includes(q)
    );
  }, [filteredProducts, search]);

  const visibleSections = useMemo(() => {
    if (search) {
      const secs = new Set<string>();
      for (const p of searchResults!) {
        const slug = getProductSlug(p, categories);
        if (slug) secs.add(slug);
      }
      return Array.from(secs);
    }
    return categories
      .filter((c) => {
        if ((sectionMap.get(c.slug)?.length ?? 0) === 0) return false;
        if (activeCategorySlugs && !activeCategorySlugs.has(c.slug)) return false;
        return true;
      })
      .map((c) => c.slug);
  }, [search, searchResults, sectionMap, activeCategorySlugs, categories]);

  const categorizedSearch = useMemo(() => {
    if (!search) return null;
    const map = new Map<string, Product[]>();
    for (const p of searchResults!) {
      const slug = getProductSlug(p, categories);
      if (!slug) continue;
      if (!map.has(slug)) map.set(slug, []);
      map.get(slug)!.push(p);
    }
    return map;
  }, [search, searchResults, categories]);

  const bebidas = useMemo(
    () => filteredProducts.filter((p) => getProductSlug(p, categories) === 'bebidas'),
    [filteredProducts, categories]
  );

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    setSearch('');
    setSidebarOpen(false);
    const el = document.getElementById(`section-${id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    if (categories.length > 0 && !activeSection) {
      setActiveSection(categories[0].slug);
    }
  }, [categories, activeSection]);

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

  useEffect(() => {
    if (categories.length > 0 && filteredProducts.length > 0) {
      console.log('DEBUG categories:', categories.map((c) => c.slug));
      console.log('DEBUG activeCategorySlugs:', activeCategorySlugs ? [...activeCategorySlugs] : null);
      console.log('DEBUG sectionMap sizes:', [...sectionMap.entries()].map(([k, v]) => `${k}:${v.length}`));
      console.log('DEBUG visibleSections:', visibleSections);
      console.log('DEBUG products sample:', JSON.stringify(filteredProducts.slice(0, 5).map((p) => ({ id: p.id, title: p.title, category: p.category, category_slug: p.category_slug })), null, 2));
      console.log('DEBUG broster products:', JSON.stringify(filteredProducts.filter((p) => p.category === 'Frituras' || p.category_slug === 'broster' || p.category_slug === 'alitas-broster').map((p) => ({ title: p.title, category: p.category, category_slug: p.category_slug })), null, 2));
    }
  }, [categories, filteredProducts, sectionMap, visibleSections, activeCategorySlugs]);

  return (
    <div className="min-h-screen relative pt-0 md:pt-20">
      <div className="fixed inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/menú.webp)' }} />
      <div className="fixed inset-0 bg-black/80" />

      <div className="relative z-10">
        {sidebarOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
            <aside className="absolute left-0 top-0 h-screen w-[320px] bg-[#1a1a1d] border-r border-white/10 shadow-2xl shadow-black/50 flex flex-col justify-between translate-x-0 animate-slide-in" style={{ fontFamily: 'var(--font-sans)' }}>
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
                    className="block w-full text-left py-4 text-2xl font-black text-white uppercase tracking-widest hover:text-[#ff5722] transition-colors border-b border-white/5"
                  >
                    Buscar
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
                </div>
              </div>

              <div className="flex-1" />

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

        <div className="sticky top-0 md:top-16 z-40 bg-black py-4">
          <div className="w-full px-6 flex justify-center">
            <div className="inline-flex bg-[#ff5722] rounded-full p-1.5 shadow-lg shadow-orange-500/20 max-w-full">
              <div
                className="flex items-center gap-1 overflow-x-auto snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {categories.filter((c) => visibleSections.includes(c.slug)).map((c) => {
                  const isActive = !search && activeSection === c.slug;
                  return (
                    <button
                      key={c.slug}
                      onClick={() => scrollToSection(c.slug)}
                      className={`flex-shrink-0 px-4 py-1.5 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-300 snap-center flex items-center gap-1 ${
                        isActive
                          ? 'bg-white text-[#ff5722] shadow-md scale-105'
                          : 'text-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span>{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 pb-32">
          {search && (
            <div className="py-4">
              <p className="text-stone-400 text-sm">
                <span className="font-semibold text-white">{searchResults?.length ?? 0}</span> resultado{searchResults?.length !== 1 ? 's' : ''} para{' '}
                <span className="text-[#ff5722] font-semibold">&quot;{search}&quot;</span>
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
              const cat = categories.find((c) => c.slug === secId)!;
              const products = search ? (categorizedSearch?.get(secId) ?? []) : (sectionMap.get(secId) ?? []);
              if (products.length === 0) return null;

              return (
                <section key={secId} id={`section-${secId}`} className="scroll-mt-16 md:scroll-mt-44">
                  <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 lg:gap-8 xl:gap-12 py-8 lg:py-10">
                    <div className="min-w-0">
                      <div className="lg:sticky lg:top-44 flex lg:flex-col items-start gap-3 lg:gap-2">
                        <div>
                          <h2 className="text-lg lg:text-xl font-black text-white uppercase tracking-widest leading-tight">
                            {cat.name}
                          </h2>
                          {cat.description && (
                            <p className="text-xs text-stone-500 mt-0.5 lg:mt-1 leading-relaxed">
                              {cat.description}
                            </p>
                          )}
                          <p className="text-[10px] text-stone-600 font-medium mt-1">
                            {products.length} producto{products.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                        {products.map((product, i) => (
                          <div key={product.id} className="animate-scale-up" style={{ animationDelay: `${i * 0.05}s` }}>
                            <MenuProductCard product={product} />
                          </div>
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
