// lib/api/ventify.ts
import { Product, OrderPayload } from '@/types';

// Todas las llamadas a Ventify se hacen server-side via nuestras APIs
// para mantener las credenciales seguras.

export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const response = await fetch('/api/products', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      return [];
    }

    const json = await response.json();
    const ventifyProducts = json.data || [];

    return ventifyProducts.map((item: any) => ({
      id: item.id,
      sku: item.sku || item.id,
      title: item.title,
      price: item.price,
      image: item.image || '/logo-que-bravazo.png',
      category: item.category || 'Otros',
      category_slug: item.category_slug || null,
      description: item.description || '',
      stock: item.stock ?? 0,
      featured: item.featured || false,
      isMenuDelDia: item.isMenuDelDia || false,
      minPrice: item.minPrice || item.price * 0.5,
      is_active: item.is_active !== undefined ? item.is_active : true,
    }));

  } catch (error) {
    return [];
  }
};

export const createOrder = async (payload: OrderPayload): Promise<any> => {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo enviar el pedido');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};
