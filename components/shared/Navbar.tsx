"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, X, Plus, Home, MessageCircle, UtensilsCrossed, MapPin } from 'lucide-react';
import { useSearchStore } from '@/lib/stores/search';
import { useCartStore } from '@/lib/stores/cart';
import { useUIStore } from '@/lib/stores/ui';
import { useToastStore } from '@/lib/stores/toast';
import { usePathname, useRouter } from 'next/navigation';
import { fetchProducts } from '@/lib/api/ventify';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    query, results, isOpen,
    setQuery, setIsOpen, clearSearch, setAllProducts,
  } = useSearchStore();
  const { items, addItem } = useCartStore();
  const { setIsCartOpen } = useUIStore();
  const { addToast } = useToastStore();
  const pathname = usePathname();
  const router = useRouter();

  // Close cart on any navigation
  useEffect(() => {
    setIsCartOpen(false);
  }, [pathname, setIsCartOpen]);

  const hideNavbar =
    pathname?.startsWith('/waiter') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/delivery/checkout') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/owner');

  const isOnMenu = pathname === '/menu';

  // Scroll effect for top nav
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load products into search store once, filtered by active schedules
  useEffect(() => {
    (async () => {
      const products = await fetchProducts();
      if (products.length === 0) return;
      try {
        const schedRes = await fetch('/api/schedules/active');
        const sched = await schedRes.json();
        if (sched.active_types?.length) {
          const results = await Promise.all(
            sched.active_types.map((type: string) =>
              fetch(`/api/categories?menu_type=${type}`).then(r => r.json())
            )
          );
          const slugs = new Set(results.flatMap(r => r.data || []).map((c: any) => c.slug));
          setAllProducts(products.filter(p => p.category_slug && slugs.has(p.category_slug)));
        } else {
          setAllProducts([]);
        }
      } catch {
        setAllProducts(products);
      }
    })();
  }, [setAllProducts]);

  // Close modal on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, setIsOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') clearSearch();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [clearSearch]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const handleResultClick = (productId: string) => {
    clearSearch();
    router.push(`/menu?product=${productId}`);
  };

  if (hideNavbar) return null;

  const navItems = [
    { href: '/', icon: Home, label: 'Inicio', isActive: pathname === '/' },
    { href: '/menu', icon: UtensilsCrossed, label: 'Menú', isActive: pathname === '/menu' },
    { href: null, icon: Search, label: 'Buscar', isActive: false, action: () => setIsOpen(true) },
    { href: '/ubicanos', icon: MapPin, label: 'Ubícanos', isActive: pathname === '/ubicanos' },
    { href: null, icon: ShoppingBag, label: 'Carrito', isActive: false, action: () => setIsCartOpen(true), badge: cartCount },
  ];

  return (
    <>
      {/* Desktop top navbar — oculto en /menu y / porque tienen su propio header */}
      {pathname !== '/menu' && pathname !== '/' && pathname !== '/ubicanos' && (
      <nav className={`hidden md:block fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-stone-900/95 backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-stone-900/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/20">
                <Image
                  src="/logo_que_bravazo.png"
                  alt="¡Qué Bravazo! Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-extrabold leading-tight">
                  <span className="text-amber-400">¡Qué</span>
                  <span className="text-white"> Bravazo!</span>
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="flex items-center space-x-4">
              {!isOnMenu && (
                <Link href="/menu" className="text-stone-300 hover:text-amber-400 font-medium transition-colors text-sm">
                  🍽️ Ver Menú
                </Link>
              )}

              {/* Search trigger */}
              <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-800 border border-stone-700 rounded-full text-stone-400 hover:border-amber-500/60 hover:text-stone-200 transition-all text-sm w-48"
              >
                <Search size={15} />
                <span>Buscar platillos...</span>
              </button>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center space-x-1.5 text-stone-300 hover:text-amber-400 transition-colors group"
              >
                <div className="relative p-2 rounded-full group-hover:bg-amber-500/10 transition-colors">
                  <ShoppingBag size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="font-medium text-sm">Carrito</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      )}

      {/* Mobile bottom navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-md border-t border-stone-700/50 safe-area-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="flex flex-col items-center justify-center gap-0.5 w-full h-full text-stone-400 hover:text-amber-400 transition-colors relative"
                >
                  <Icon size={22} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute top-0.5 right-1/4 bg-gradient-to-r from-amber-500 to-red-500 text-white text-[9px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              );
            }
            return (
              <Link
                key={item.label}
                href={item.href!}
                onClick={() => setIsCartOpen(false)}
                className={`flex flex-col items-center justify-center gap-0.5 w-full h-full transition-colors ${
                  item.isActive ? 'text-amber-400' : 'text-stone-400 hover:text-amber-400'
                }`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Search Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-24 px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => clearSearch()} />

          {/* Modal */}
          <div
            ref={modalRef}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
          >
            {/* Input row */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
              <Search size={20} className="text-stone-400 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Buscar platillos, bebidas..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-stone-800 placeholder-stone-400 text-base outline-none bg-transparent"
              />
              {query && (
                <button onClick={() => setQuery('')} className="text-stone-400 hover:text-stone-600 transition-colors">
                  <X size={18} />
                </button>
              )}
              <button
                onClick={clearSearch}
                className="text-stone-400 hover:text-stone-700 transition-colors text-sm font-medium ml-1"
              >
                Cerrar
              </button>
            </div>

            {/* Results */}
            {query.trim().length >= 1 && (
              <div className="max-h-80 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-stone-400 text-sm">No se encontraron resultados para <span className="font-semibold text-stone-600">&ldquo;{query}&rdquo;</span></p>
                  </div>
                ) : (
                  <ul>
                    {results.map((product) => (
                      <li key={product.id}>
                        <button
                          onClick={() => handleResultClick(product.id)}
                          className="w-full flex items-center gap-4 px-5 py-3 hover:bg-stone-50 transition-colors text-left"
                        >
                          {/* Thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                            <Image
                              src={product.image}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-stone-800 font-semibold text-sm truncate">{product.title}</p>
                            <p className="text-stone-400 text-xs">{product.category}</p>
                          </div>

                          {/* Price + Add */}
                          <div className="flex-shrink-0 flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-amber-600 font-bold text-sm">S/ {product.price.toFixed(2)}</p>
                              {product.featured && (
                                <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                                  Destacado
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addItem(product);
                                addToast({ title: '¡Añadido al carrito!', subtitle: `1x ${product.title}` }, 'success');
                              }}
                              className="w-7 h-7 bg-amber-500 hover:bg-amber-600 text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
                            >
                              <Plus className="w-4 h-4" strokeWidth={3} />
                            </button>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {/* View all results link */}
                {results.length > 0 && (
                  <div className="border-t border-stone-100 px-5 py-3">
                    <button
                      onClick={() => {
                        router.push(`/menu?q=${encodeURIComponent(query)}`);
                        clearSearch();
                      }}
                      className="text-amber-600 hover:text-amber-700 text-sm font-semibold transition-colors"
                    >
                      Ver todos los resultados para &ldquo;{query}&rdquo; →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty state — no query yet */}
            {query.trim().length === 0 && (
              <div className="px-5 py-6 text-center text-stone-400 text-sm">
                Escribe para buscar en el menú 🍗
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
