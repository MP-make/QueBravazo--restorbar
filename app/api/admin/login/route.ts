import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email y contraseña requeridos' });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, password_hash')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Error buscando admin:', error);
      return NextResponse.json({ ok: false, error: 'Error de base de datos' });
    }

    if (!data) {
      return NextResponse.json({ ok: false, admin_exists: false, error: 'Email no registrado como admin' });
    }

    if (!data.password_hash) {
      return NextResponse.json({ ok: false, error: 'Admin sin contraseña configurada. Ejecutá: node scripts/hash-password.mjs tu-contraseña' });
    }

    const valid = await bcrypt.compare(password, data.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Contraseña incorrecta' });
    }

    return NextResponse.json({
      ok: true,
      admin: true,
      user: { uid: data.id, email: data.email, name: data.name, role: 'admin' },
    });
  } catch (err: any) {
    console.error('Error en login:', err);
    return NextResponse.json({ ok: false, error: err.message });
  }
}
