import { Suspense } from 'react';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import MenuContent from './MenuContent';

async function getProducts() {
  const apiUrl = process.env.NEXT_PUBLIC_VENTIFY_API_URL;
  const accountId = process.env.NEXT_PUBLIC_VENTIFY_ACCOUNT_ID;

  if (!apiUrl || !accountId) {
    console.warn("Faltan variables de entorno para API Ventify");
    return [];
  }

  try {
    const res = await fetch(`${apiUrl}/api/v1/products?accountId=${accountId}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        ...(process.env.NEXT_PUBLIC_VENTIFY_API_KEY && {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_VENTIFY_API_KEY}`
        })
      }
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch (error) {
    console.error("Error obteniendo productos de Ventify:", error);
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