import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('menu_schedules')
    .select('*')
    .order('start_time');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = createAdminClient();

    const payload = {
      menu_type: body.menu_type,
      label: body.label || '',
      day_of_week: null,
      days_of_week: body.days_of_week || null,
      start_time: body.start_time,
      end_time: body.end_time,
      is_active: body.is_active ?? true,
    };

    const { data, error } = await supabase
      .from('menu_schedules')
      .insert(payload)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
