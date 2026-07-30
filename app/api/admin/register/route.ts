import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';

const REGISTER_CODE = process.env.ADMIN_REGISTER_CODE || '693366';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { allowed } = rateLimit(`register:${ip}`, 3, 60000);
    if (!allowed) {
      return NextResponse.json(
        { ok: false, error: 'Demasiados intentos. Intenta de nuevo en 1 minuto' },
        { status: 429 }
      );
    }

    const { name, email, password, code, role } = await req.json();

    if (!name || !email || !password || !code) {
      return NextResponse.json({ ok: false, error: 'Todos los campos son obligatorios' }, { status: 400 });
    }

    const userRole = role === 'staff' ? 'staff' : 'admin';

    if (code !== REGISTER_CODE) {
      return NextResponse.json({ ok: false, error: 'Código de registro incorrecto' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const emailLower = email.toLowerCase().trim();
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: false, error: 'Este email ya está registrado como admin' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('admin_users')
      .insert({
        email: emailLower,
        name: name.trim(),
        role: userRole,
        is_active: true,
        password_hash,
      })
      .select('id, email, name, role')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: 'Error al registrar: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      user: { uid: data.id, email: data.email, name: data.name, role: data.role },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
