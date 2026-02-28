"use client";
import { useState } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/shared/ProductCard';
import { Search, Grid3x3, List, Sparkles, UtensilsCrossed } from 'lucide-react';

interface WaiterMenuProps {
  products: Product[];
}

export const WaiterMenu = ({ products }: WaiterMenuProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [menuFilter, setMenuFilter] = useState<'all' | 'menu' | 'carta'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Extract unique categories
  const categories = Array.from(new Set(products.map(product => product.category)));

  // Filter products based on selected category AND menu type AND search
  const filteredProducts = products
    .filter(product => !selectedCategory || product.category === selectedCategory)
    .filter(product => {
      if (menuFilter === 'menu') return product.isMenuDelDia === true;
      if (menuFilter === 'carta') return product.isMenuDelDia === false;
      return true;
    })
    .filter(product => 
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header con filtros */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="p-4 space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar platillo..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filtros de tipo de menú */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setMenuFilter('all')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                menuFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <UtensilsCrossed className="w-4 h-4" />
                Todo
              </span>
            </button>
            <button
              onClick={() => setMenuFilter('menu')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                menuFilter === 'menu'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Menú del Día
              </span>
            </button>
            <button
              onClick={() => setMenuFilter('carta')}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                menuFilter === 'carta'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Carta
            </button>
          </div>

          {/* Categorías con scroll horizontal */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
              }`}
            >
              Todos
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-blue-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Contador de resultados y toggle de vista */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredProducts.length}</span> productos
            </p>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid de productos con scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-lg font-semibold mb-1">No hay productos</p>
            <p className="text-sm text-gray-400">Intenta cambiar los filtros o la búsqueda</p>
          </div>
        ) : (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
          }>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                mode="waiter"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};