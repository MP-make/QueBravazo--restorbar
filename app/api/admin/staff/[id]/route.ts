import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, current_password, new_password } = await req.json();
    const supabase = createAdminClient();

    const updates: Record<string, any> = {};

    if (name) {
      updates.name = name.trim();
    }

    if (new_password) {
      if (!current_password) {
        return NextResponse.json({ ok: false, error: 'Contraseña actual requerida para cambiar contraseña' }, { status: 400 });
      }
      if (new_password.length < 6) {
        return NextResponse.json({ ok: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' }, { status: 400 });
      }

      const { data: user } = await supabase
        .from('admin_users')
        .select('password_hash')
        .eq('id', id)
        .single();

      if (!user) {
        return NextResponse.json({ ok: false, error: 'Usuario no encontrado' }, { status: 404 });
      }

      const valid = await bcrypt.compare(current_password, user.password_hash);
      if (!valid) {
        return NextResponse.json({ ok: false, error: 'Contraseña actual incorrecta' }, { status: 400 });
      }

      updates.password_hash = await bcrypt.hash(new_password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No hay campos para actualizar' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('admin_users')
      .update(updates)
      .eq('id', id)
      .select('id, email, name, role')
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
