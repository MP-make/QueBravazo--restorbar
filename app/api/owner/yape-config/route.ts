import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, role, yape_qr_url, yape_name')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ value: null });

    return NextResponse.json({
      value: { qr_url: data.yape_qr_url || '', name: data.yape_name || '' },
      role: data.role,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId, qr_url, name } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId requerido' }, { status: 400 });

    const supabase = createAdminClient();
    const { data: user, error: userError } = await supabase
      .from('admin_users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (userError || !user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    if (user.role !== 'owner') {
      return NextResponse.json({ error: 'Solo los dueños pueden configurar su propio Yape' }, { status: 403 });
    }

    const updates: Record<string, any> = {};
    if (qr_url !== undefined) updates.yape_qr_url = (qr_url || '').trim();
    if (name !== undefined) updates.yape_name = (name || '').trim();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', userId)
      .select('id, yape_qr_url, yape_name')
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
