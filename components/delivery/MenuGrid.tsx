"use client";
import { useState } from 'react';
import { Product } from '@/types';
import { ProductCard } from '@/components/shared/ProductCard';
import { useSearchStore } from '@/lib/stores/search';
import { Beer, UtensilsCrossed, Drumstick, BookOpen, LayoutGrid } from 'lucide-react';

interface MenuGridProps {
  products: Product[];
}

export const MenuGrid = ({ products }: MenuGridProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { query } = useSearchStore();

  // Extract unique categories
  const categories = Array.from(new Set(products.map(product => product.category)));

  // Filter products based on selected category and search query
  const filteredProducts = products
    .filter(product => !selectedCategory || product.category === selectedCategory)
    .filter(product => product.title.toLowerCase().includes(query.toLowerCase()));

  // Function to get icon for category
  const getCategoryIcon = (category: string) => {
    const lower = category.toLowerCase();
    if (lower.includes('bebidas') || lower.includes('tragos')) return Beer;
    if (lower.includes('platillos') || lower.includes('comida')) return UtensilsCrossed;
    if (lower.includes('frituras') || lower.includes('snacks')) return Drumstick;
    return LayoutGrid;
  };

  return (
    <div>
      {/* Category Filter Buttons */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 justify-start md:justify-center">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border transition-all flex-shrink-0 ${
            selectedCategory === null
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <BookOpen size={20} />
          <span className="text-xs mt-1">Todos</span>
        </button>
        {categories.map(category => {
          const IconComponent = getCategoryIcon(category);
          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex flex-col items-center justify-center w-16 h-16 rounded-lg border transition-all flex-shrink-0 ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              <IconComponent size={20} />
              <span className="text-xs mt-1">{category}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            mode="delivery"
          />
        ))}
      </div>
    </div>
  );
};