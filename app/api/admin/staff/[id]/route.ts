import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';

const VALID_ROLES = ['admin', 'staff', 'chef'] as const;

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name, dni, role, is_active, current_password, new_password } = await req.json();
    const supabase = createAdminClient();

    const updates: Record<string, any> = {};

    if (name) {
      updates.name = name.trim();
    }

    if (dni !== undefined) {
      const dniTrim = String(dni).trim();
      if (dniTrim && !/^\d{8}$/.test(dniTrim)) {
        return NextResponse.json({ ok: false, error: 'El DNI debe tener 8 dígitos' }, { status: 400 });
      }

      if (dniTrim) {
        const { data: existingDni } = await supabase
          .from('admin_users')
          .select('id')
          .eq('dni', dniTrim)
          .neq('id', id)
          .maybeSingle();

        if (existingDni) {
          return NextResponse.json({ ok: false, error: 'Este DNI ya está registrado' }, { status: 400 });
        }
      }

      if (current_password) {
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
      }

      updates.dni = dniTrim || null;
    }

    if (role && VALID_ROLES.includes(role as any)) {
      updates.role = role;
    }

    if (typeof is_active === 'boolean') {
      updates.is_active = is_active;
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
      .select('id, email, name, dni, role')
      .single();

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, data });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', id);

    if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
