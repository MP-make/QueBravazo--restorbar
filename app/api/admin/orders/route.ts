import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const paid = searchParams.get('paid');
    const archived = searchParams.get('archived');

    const supabase = createAdminClient();
    let query = supabase
      .from('waiter_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (paid === 'true') query = query.eq('payment_status', 'paid');
    if (archived === 'true') query = query.eq('archived', true);
    else if (archived === 'false') query = query.eq('archived', false);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
