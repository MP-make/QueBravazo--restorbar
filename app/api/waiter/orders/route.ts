import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const waiterId = searchParams.get('waiter_id');
    const status = searchParams.get('status');
    const includeArchived = searchParams.get('archived') === 'true';

    const supabase = createAdminClient();
    let query = supabase
      .from('waiter_orders')
      .select('*');

    if (!includeArchived) query = query.eq('archived', false);
    if (waiterId) query = query.eq('waiter_id', waiterId);
    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { waiter_id, waiter_name, table_number, order_type, items, subtotal, takeaway_charge, total, customer_name } = body;

    if (!waiter_id || !waiter_name || !order_type || !items || subtotal === undefined || total === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('waiter_orders')
      .insert({
        waiter_id,
        waiter_name,
        table_number: table_number || null,
        order_type,
        items,
        subtotal,
        takeaway_charge: takeaway_charge || 0,
        total,
        customer_name: customer_name || '',
        status: 'confirmed',
        payment_status: 'pending',
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
