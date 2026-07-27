import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ admin: false, user: null });

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('admin_users')
      .select('id, name, role')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error('Supabase error en verify:', error);
      return NextResponse.json({ admin: false, user: null, error: error.message });
    }

    return NextResponse.json({ admin: !!data, user: data || null });
  } catch (err: any) {
    console.error('Error en verify:', err);
    return NextResponse.json({ admin: false, user: null, error: err.message });
  }
}
