"use client";
import { useState, useEffect } from 'react';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import MenuContent from './MenuContent';
import { fetchProducts } from '@/lib/api/ventify';
import { Product } from '@/types';

export default function MenuPage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-stone-50">
      <MenuContent initialProducts={products} />
    </div>
  );
}
