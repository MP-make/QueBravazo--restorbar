"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingBag, Menu, X, User } from 'lucide-react';
import { useSearchStore } from '@/lib/stores/search';
import { useCartStore } from '@/lib/stores/cart';
import { useUIStore } from '@/lib/stores/ui';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { query, setQuery } = useSearchStore();
  const { items } = useCartStore();
  const { setIsCartOpen } = useUIStore();
  const pathname = usePathname();

  // Ocultar navbar en rutas específicas
  const hideNavbar = pathname?.startsWith('/waiter') || pathname === '/login' || pathname === '/register' || pathname?.startsWith('/delivery/checkout');

  // Detectar scroll para cambiar estilo del navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (hideNavbar) return null;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'glass-effect shadow-soft' 
        : 'bg-white/95 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <Image
              src="/ventify_logo.png"
              alt="Ventify"
              width={40}
              height={40}
              className="object-contain group-hover:scale-105 transition-transform"
              style={{ width: 'auto', height: 'auto' }}
            />
            <div className="text-xl font-bold">
              <span className="gradient-text">Ventify</span>
              <span className="text-stone-700"> Restaurante</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Link al Menú */}
            <Link
              href="/menu"
              className="text-stone-600 hover:text-amber-600 font-medium transition-colors"
            >
              Ver Menú
            </Link>

            {/* Buscador */}
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 text-stone-400 group-focus-within:text-amber-600 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-400 focus:bg-white transition-all"
              />
            </div>

            {/* Carrito */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center space-x-2 text-stone-600 hover:text-amber-700 transition-colors relative group"
            >
              <div className="relative p-2 rounded-full group-hover:bg-amber-50 transition-colors">
                <ShoppingBag size={22} />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </div>
              <span className="font-medium">Carrito</span>
            </button>

            {/* Login */}
            <Link
              href="/login"
              className="btn-primary flex items-center space-x-2"
            >
              <User size={18} />
              <span>Iniciar Sesión</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-stone-200 animate-fade-in-up">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-stone-400" size={18} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-2">
              <Link
                href="/menu"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-3 w-full text-stone-700 hover:text-amber-700 hover:bg-amber-50 p-3 rounded-xl transition-colors"
              >
                <span className="text-xl">🍽️</span>
                <span className="font-medium">Ver Menú Completo</span>
              </Link>

              <button
                onClick={() => {
                  setIsCartOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-3 w-full text-stone-700 hover:text-amber-700 hover:bg-amber-50 p-3 rounded-xl transition-colors"
              >
                <div className="relative">
                  <ShoppingBag size={22} />
                  {items.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {items.length}
                    </span>
                  )}
                </div>
                <span className="font-medium">Carrito</span>
              </button>

              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center space-x-3 w-full btn-primary"
              >
                <User size={22} />
                <span>Iniciar Sesión</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}