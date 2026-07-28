import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'yape_config')
      .single();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ value: data?.value ?? { qr_url: '', name: '¡Qué Bravazo! Restobar' } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { qr_url, name } = body;

    if (!name) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('site_settings')
      .upsert({ key: 'yape_config', value: { qr_url: qr_url || '', name } }, { onConflict: 'key' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
