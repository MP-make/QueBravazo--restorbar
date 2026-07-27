import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const DEFAULT_MEDIA = [
  { type: 'video', url: '/HAMBURGUESAS - HORIZONTAL.mp4', alt_text: 'Video hero horizontal - Hamburguesas', section: 'hero', display_order: 0, is_active: true },
  { type: 'video', url: '/HAMBURGUESAS - VERTICAL.mp4', alt_text: 'Video hero vertical - Hamburguesas', section: 'hero', display_order: 1, is_active: true },
  { type: 'image', url: '/menú.webp', alt_text: 'Fondo menú', section: 'background', display_order: 0, is_active: true },
  { type: 'image', url: '/Fondo restaurante.png', alt_text: 'Fondo restaurante', section: 'background', display_order: 1, is_active: true },
  { type: 'image', url: '/Fondo frituras.png', alt_text: 'Fondo frituras', section: 'background', display_order: 2, is_active: true },
  { type: 'image', url: '/fondo_de_platillos.jpg', alt_text: 'Fondo platillos', section: 'background', display_order: 3, is_active: true },
  { type: 'image', url: '/menu del dia.jpeg', alt_text: 'Menú del día', section: 'gallery', display_order: 0, is_active: true },
  { type: 'image', url: '/personaje presentando_sinfondo.png', alt_text: 'Personaje promocional', section: 'promo', display_order: 0, is_active: true },
];

export async function POST() {
  const supabase = createAdminClient();

  const { error: delError } = await supabase.from('media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (delError) return NextResponse.json({ error: delError.message }, { status: 500 });

  const { data, error } = await supabase
    .from('media')
    .insert(DEFAULT_MEDIA)
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
