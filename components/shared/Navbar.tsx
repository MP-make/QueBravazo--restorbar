"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useSearchStore } from '@/lib/stores/search';
import { useCartStore } from '@/lib/stores/cart';
import { useUIStore } from '@/lib/stores/ui';
import { usePathname, useRouter } from 'next/navigation';
import { fetchProducts } from '@/lib/api/ventify';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  const {
    query, results, isOpen,
    setQuery, setIsOpen, clearSearch, setAllProducts,
  } = useSearchStore();
  const { items } = useCartStore();
  const { setIsCartOpen } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();

  const hideNavbar =
    pathname?.startsWith('/waiter') ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname?.startsWith('/delivery/checkout');

  const isOnMenu = pathname === '/menu';

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load products into search store once
  useEffect(() => {
    fetchProducts().then((products) => {
      if (products.length > 0) setAllProducts(products);
    });
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

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-stone-900/95 backdrop-blur-md shadow-lg shadow-black/30'
          : 'bg-stone-900/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <Image
                src="/bravazo-logo.jpeg"
                alt="¡Qué Bravazo!"
                width={44}
                height={44}
                className="object-contain rounded-full group-hover:scale-105 transition-transform ring-2 ring-amber-500/50"
              />
              <div className="text-lg font-extrabold leading-tight">
                <span className="text-amber-400">¡Qué</span>
                <span className="text-white"> Bravazo!</span>
              </div>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-4">
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

            {/* Mobile buttons */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setIsOpen(true)} className="text-stone-300 p-2 rounded-lg hover:bg-stone-800 transition-colors">
                <Search size={22} />
              </button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-stone-300 p-2 rounded-lg hover:bg-stone-800 transition-colors">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-stone-700 animate-fade-in-up space-y-2">
              <Link href="/menu" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 w-full text-stone-300 hover:text-amber-400 hover:bg-stone-800 p-3 rounded-xl transition-colors">
                <span className="text-xl">🍽️</span>
                <span className="font-medium">Ver Menú Completo</span>
              </Link>
              <button
                onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}
                className="flex items-center space-x-3 w-full text-stone-300 hover:text-amber-400 hover:bg-stone-800 p-3 rounded-xl transition-colors"
              >
                <div className="relative">
                  <ShoppingBag size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="font-medium">Carrito</span>
              </button>
            </div>
          )}
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
                    <p className="text-stone-400 text-sm">No se encontraron resultados para <span className="font-semibold text-stone-600">"{query}"</span></p>
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

                          {/* Price */}
                          <div className="flex-shrink-0 text-right">
                            <p className="text-amber-600 font-bold text-sm">S/ {product.price.toFixed(2)}</p>
                            {product.featured && (
                              <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                                Destacado
                              </span>
                            )}
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
                      Ver todos los resultados para "{query}" →
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