import { Suspense } from 'react';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import MenuContent from './MenuContent';

async function getProducts() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${baseUrl}/api/products`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function MenuPage() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-stone-50">
      <Suspense fallback={<LoadingSkeleton />}>
        <MenuContent initialProducts={products} />
      </Suspense>
    </div>
  );
}