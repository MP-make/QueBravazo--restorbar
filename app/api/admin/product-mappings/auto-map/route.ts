import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const VENTIFY_API_URL = process.env.NEXT_PUBLIC_VENTIFY_API_URL;
const VENTIFY_ACCOUNT_ID = process.env.NEXT_PUBLIC_VENTIFY_ACCOUNT_ID;
const VENTIFY_API_KEY = process.env.VENTIFY_API_KEY;

interface SectionRule {
  slug: string;
  keywords: string[];
}

const SECTIONS: SectionRule[] = [
  { slug: 'combos', keywords: ['combo', 'promo', 'oferta', 'happy hour', '2x1'] },
  { slug: 'platos-fuertes', keywords: ['pollo', 'broaster', 'hamburguesa', 'alita', 'presa', 'comida', 'platillo', 'fritura', 'parrilla', 'carne', 'chicharron'] },
  { slug: 'postres', keywords: ['postre', 'dulce', 'helado', 'pie', 'torta'] },
  { slug: 'ensaladas', keywords: ['ensalada', 'verdura', 'vegetal', 'salad'] },
  { slug: 'salsas', keywords: ['salsa', 'crema', 'aderezo', 'mayonesa', 'ketchup', 'mostaza'] },
  { slug: 'caldos', keywords: ['caldo', 'sopa', 'consome'] },
  { slug: 'platos-a-la-carta', keywords: ['plato a la carta', 'a la carta'] },
  { slug: 'cocteles', keywords: ['trago', 'coctel', 'licor', 'ron', 'pisco', 'vodka', 'whisky', 'marciano', 'mike'] },
  { slug: 'bebidas', keywords: ['gaseosa', 'bebida', 'refresco', 'cola', 'agua', 'jugo', 'cerveza', 'trago', 'licor', 'coctel', 'ron', 'pisco', 'vodka', 'whisky', 'marciano', 'mike'] },
  { slug: 'extras', keywords: [] },
];

function matchCategorySlug(originalCategory: string): string {
  const lower = (originalCategory || '').toLowerCase();
  for (const s of SECTIONS) {
    if (s.slug === 'extras') continue;
    if (s.keywords.some((kw) => lower.includes(kw))) return s.slug;
  }
  return 'extras';
}

export async function POST() {
  const supabase = createAdminClient();

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug');

  if (catError) return NextResponse.json({ error: catError.message }, { status: 500 });

  const slugToId = new Map(categories.map((c: { id: string; slug: string }) => [c.slug, c.id]));

  let ventifyProducts: { ventify_id: string; title: string; price: number; image: string; sku: string; original_category: string }[] = [];

  if (VENTIFY_API_URL && VENTIFY_ACCOUNT_ID && VENTIFY_API_KEY) {
    try {
      const endpoint = `${VENTIFY_API_URL}/api/public/stores/${VENTIFY_ACCOUNT_ID}/products?active=true`;
      const res = await fetch(endpoint, {
        headers: { 'Content-Type': 'application/json', 'X-API-Key': VENTIFY_API_KEY },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        ventifyProducts = (json.data || []).map((item: { id: string; sku?: string; name: string; price: number; imageUrl?: string; category?: string }) => ({
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

  if (ventifyProducts.length === 0) {
    return NextResponse.json({ error: 'No se pudieron obtener productos de Ventify' }, { status: 500 });
  }

  const mappings = ventifyProducts.map((vp) => {
    const matchedSlug = matchCategorySlug(vp.original_category);
    const categoryId = slugToId.get(matchedSlug) || null;
    return {
      ventify_id: vp.ventify_id,
      sku: vp.sku,
      title: vp.title,
      price: vp.price,
      image: vp.image,
      category_id: categoryId,
      is_active: true,
      menu_types: ['criollo', 'rapida'],
    };
  });

  const { data, error } = await supabase
    .from('product_mappings')
    .upsert(mappings, { onConflict: 'ventify_id', ignoreDuplicates: false })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ mapped: data?.length || 0, total: ventifyProducts.length });
}
