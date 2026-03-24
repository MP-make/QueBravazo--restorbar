import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_VENTIFY_API_URL;
const ACCOUNT_ID = process.env.NEXT_PUBLIC_VENTIFY_ACCOUNT_ID;
const API_KEY = process.env.NEXT_PUBLIC_VENTIFY_API_KEY;

export async function GET() {
  if (!API_URL || !ACCOUNT_ID || !API_KEY) {
    return NextResponse.json({ error: 'Configuración no disponible' }, { status: 500 });
  }

  const endpoint = `${API_URL}/api/public/stores/${ACCOUNT_ID}/products?active=true`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      cache: 'no-store', // siempre fresco, sin caché de 1 hora
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Error al obtener productos' }, { status: response.status });
    }

    const json = await response.json();
    const ventifyProducts = json.data || [];

    const products = ventifyProducts.map((item: any) => ({
      id: item.id,
      sku: item.sku || item.id,
      title: item.name,
      price: item.price,
      image: item.imageUrl || '/BRAVAZO-LOGO.jpeg',
      category: item.category || 'Otros',
      description: item.description || '',
      stock: item.stock ?? 0,
      featured: item.isFeatured || false,
      isMenuDelDia: item.isMenuDelDia || false,
      minPrice: item.minPrice || item.price * 0.5,
    }));

    return NextResponse.json(
      { data: products },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}