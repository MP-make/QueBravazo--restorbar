import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, email, name, role, is_active, created_at')
      .in('role', ['staff', 'admin', 'chef'])
      .order('name');

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Nombre, email y contraseña requeridos' }, { status: 400 });
    }

    const validRoles = ['admin', 'staff', 'chef'];
    const userRole = validRoles.includes(role) ? role : 'staff';
    if (password.length < 6) {
      return NextResponse.json({ ok: false, error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const emailLower = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', emailLower)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ ok: false, error: 'Este email ya está registrado' }, { status: 400 });
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
      .select('id, email, name, role, is_active, created_at')
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: 'Error al crear: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
