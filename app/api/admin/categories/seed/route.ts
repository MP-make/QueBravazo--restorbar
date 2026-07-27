import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const DEFAULT_CATEGORIES = [
  { name: 'Combos', slug: 'combos', description: 'Para compartir con la gente', display_order: 0, menu_type: 'ambos', is_active: true },
  { name: 'Platos Fuertes', slug: 'platos-fuertes', description: 'Broaster, hamburguesas, alitas', display_order: 1, menu_type: 'ambos', is_active: true },
  { name: 'Postres', slug: 'postres', description: 'Dulces y más', display_order: 2, menu_type: 'ambos', is_active: true },
  { name: 'Ensaladas', slug: 'ensaladas', description: 'Frescas y saludables', display_order: 3, menu_type: 'ambos', is_active: true },
  { name: 'Salsas & Cremas', slug: 'salsas', description: 'Acompañantes', display_order: 4, menu_type: 'ambos', is_active: true },
  { name: 'Caldos', slug: 'caldos', description: 'Calientes y reconfortantes', display_order: 5, menu_type: 'ambos', is_active: true },
  { name: 'Platos a la Carta', slug: 'platos-a-la-carta', description: 'Preparaciones especiales', display_order: 6, menu_type: 'ambos', is_active: true },
  { name: 'Cocteles', slug: 'cocteles', description: 'Tragos y más', display_order: 7, menu_type: 'ambos', is_active: true },
  { name: 'Bebidas', slug: 'bebidas', description: 'Gaseosas, jugos, tragos', display_order: 8, menu_type: 'ambos', is_active: true },
  { name: 'Extras', slug: 'extras', description: 'Complementos', display_order: 9, menu_type: 'ambos', is_active: true },
];

export async function POST() {
  const supabase = createAdminClient();

  const { data: existing } = await supabase.from('categories').select('id').limit(1);
  if (existing && existing.length > 0) {
    return NextResponse.json({ error: 'Ya existen categorías. Elimínalas primero si deseas restaurar los valores por defecto.' }, { status: 409 });
  }

  const { data, error } = await supabase
    .from('categories')
    .insert(DEFAULT_CATEGORIES)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
