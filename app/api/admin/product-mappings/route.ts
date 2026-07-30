import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const VENTIFY_API_URL = process.env.NEXT_PUBLIC_VENTIFY_API_URL;
const VENTIFY_ACCOUNT_ID = process.env.NEXT_PUBLIC_VENTIFY_ACCOUNT_ID;
const VENTIFY_API_KEY = process.env.NEXT_PUBLIC_VENTIFY_API_KEY;

export async function GET() {
  const supabase = createAdminClient();

  const [mappingsRes, categoriesRes] = await Promise.all([
    supabase.from('product_mappings').select('*').order('display_order'),
    supabase.from('categories').select('id, name, slug').eq('is_active', true).order('display_order'),
  ]);

  if (mappingsRes.error) return NextResponse.json({ error: mappingsRes.error.message }, { status: 500 });
  if (categoriesRes.error) return NextResponse.json({ error: categoriesRes.error.message }, { status: 500 });

  let ventifyProducts: any[] = [];
  if (VENTIFY_API_URL && VENTIFY_ACCOUNT_ID && VENTIFY_API_KEY) {
    try {
      const endpoint = `${VENTIFY_API_URL}/api/public/stores/${VENTIFY_ACCOUNT_ID}/products?active=true`;
      const res = await fetch(endpoint, {
        headers: { 'Content-Type': 'application/json', 'X-API-Key': VENTIFY_API_KEY },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        ventifyProducts = (json.data || []).map((item: any) => ({
          ventify_id: item.id,
          sku: item.sku || item.id,
          title: item.name,
          price: item.price,
          image: item.imageUrl || '/logo-que-bravazo.png',
          original_category: item.category || 'Otros',
        }));
      }
    } catch {}
  }

  const mappingMap = new Map(mappingsRes.data.map((m: any) => [m.ventify_id, m]));
  const categoriesMap = new Map(categoriesRes.data.map((c: any) => [c.id, c]));

  const products = ventifyProducts.map((vp) => {
    const map = mappingMap.get(vp.ventify_id);
    return {
      ...vp,
      mapping_id: map?.id || null,
      category_id: map?.category_id || null,
      category_name: map?.category_id ? categoriesMap.get(map.category_id)?.name || null : null,
      display_order: map?.display_order ?? 0,
      menu_types: map?.menu_types || ['criollo', 'rapida'],
      is_active: map?.is_active ?? true,
      is_featured: map?.is_featured ?? false,
      is_mapped: !!map,
    };
  });

  const unmapped = ventifyProducts.filter((vp) => !mappingMap.has(vp.ventify_id));
  const mapped = products.filter((p) => p.is_mapped);

  return NextResponse.json({
    products,
    mapped_count: mapped.length,
    unmapped_count: unmapped.length,
    total: products.length,
    categories: categoriesRes.data,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('product_mappings')
 .upsert(
   Array.isArray(body) ? body : [body],
   { onConflict: 'ventify_id', ignoreDuplicates: false }
 )
 .select();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
