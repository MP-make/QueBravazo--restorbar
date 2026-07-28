import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const API_URL = process.env.NEXT_PUBLIC_VENTIFY_API_URL;
const ACCOUNT_ID = process.env.NEXT_PUBLIC_VENTIFY_ACCOUNT_ID;
const API_KEY = process.env.NEXT_PUBLIC_VENTIFY_API_KEY;

export async function GET() {
  if (!API_URL || !ACCOUNT_ID || !API_KEY) {
    return NextResponse.json({ error: 'Configuración no disponible' }, { status: 500 });
  }

  const productCategoryMap = new Map<string, string | null>();
  const activeProductIds = new Set<string>();
  try {
    const supabase = createAdminClient();
    console.log('[products API] Fetching mappings from Supabase...');
    const [mappingsRes, categoriesRes] = await Promise.all([
      supabase.from('product_mappings').select('ventify_id, category_id').eq('is_active', true),
      supabase.from('categories').select('id, slug').eq('is_active', true),
    ]);

    if (mappingsRes.error) console.error('[products API] mappings error:', mappingsRes.error);
    if (categoriesRes.error) console.error('[products API] categories error:', categoriesRes.error);

    if (!mappingsRes.error && !categoriesRes.error) {
      const categorySlugMap = new Map((categoriesRes.data || []).map((c: any) => [c.id, c.slug]));
      console.log('[products API] categories loaded:', categorySlugMap.size);
      for (const m of mappingsRes.data || []) {
        activeProductIds.add(m.ventify_id);
        productCategoryMap.set(m.ventify_id, categorySlugMap.get(m.category_id) || null);
      }
      console.log('[products API] product mappings count:', productCategoryMap.size);
    }
  } catch (e) {
    console.error('[products API] Error fetching mappings:', e);
  }

  const endpoint = `${API_URL}/api/public/stores/${ACCOUNT_ID}/products?active=true`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Error al obtener productos' }, { status: response.status });
    }

    const json = await response.json();
    const ventifyProducts = json.data || [];

    const products = ventifyProducts
      .filter((item: any) => activeProductIds.has(item.id))
      .map((item: any) => ({
        id: item.id,
        sku: item.sku || item.id,
        title: item.name,
        price: item.price,
        image: item.imageUrl || '/logo-que-bravazo.png',
        category: item.category || 'Otros',
        category_slug: productCategoryMap.get(item.id) ?? null,
        description: item.description || '',
        stock: item.stock ?? 0,
        featured: item.isFeatured || false,
        isMenuDelDia: item.isMenuDelDia || false,
        minPrice: item.minPrice || item.price * 0.5,
        is_active: true,
      }));

    console.log('[products API] total products:', products.length);
    console.log('[products API] sample:', products.slice(0, 3).map((p: any) => ({ id: p.id, title: p.title, category: p.category, category_slug: p.category_slug })));

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
