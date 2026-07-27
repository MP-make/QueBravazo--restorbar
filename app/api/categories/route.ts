import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const menuType = searchParams.get('menu_type');

  const supabase = createAdminClient();
  let query = supabase
    .from('categories')
    .select('id, name, slug, description, display_order, is_active, menu_type')
    .eq('is_active', true);

  if (menuType === 'criollo' || menuType === 'rapida') {
    query = query.in('menu_type', [menuType, 'ambos']);
  }

  const { data, error } = await query
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}
