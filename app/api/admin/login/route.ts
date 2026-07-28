import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email/nombre y contraseña requeridos' });
    }

    const query = email.trim();
    const supabase = createAdminClient();

    let { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, password_hash')
      .eq('email', query.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (!data && !error) {
      const res = await supabase
        .from('admin_users')
        .select('id, email, name, role, password_hash')
        .eq('name', query)
        .eq('is_active', true)
        .maybeSingle();
      data = res.data;
      error = res.error;
    }

    if (error) {
      console.error('Error buscando usuario:', error);
      return NextResponse.json({ ok: false, error: 'Error de base de datos' });
    }

    if (!data) {
      return NextResponse.json({ ok: false, admin_exists: false, error: 'Usuario no encontrado' });
    }

    if (!data.password_hash) {
      return NextResponse.json({ ok: false, error: 'Usuario sin contraseña configurada' });
    }

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' });
    }

    return NextResponse.json({
      ok: true,
      admin: true,
      user: { uid: data.id, email: data.email, name: data.name, role: data.role },
    });
  } catch (err: any) {
    console.error('Error en login:', err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
