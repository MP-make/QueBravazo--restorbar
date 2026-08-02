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

    const [globalRes, ownersRes] = await Promise.all([
      supabase.from('site_settings').select('value').eq('key', 'yape_config').maybeSingle(),
      supabase.from('admin_users').select('id, yape_qr_url, yape_name').eq('role', 'owner'),
    ]);

    const globalConfig = globalRes.data?.value ?? { qr_url: '', name: '¡Qué Bravazo! Restobar' };
    const ownerMap = new Map<string, { qr_url: string; name: string }>();
    for (const o of ownersRes.data || []) {
      ownerMap.set(o.id, { qr_url: o.yape_qr_url || '', name: o.yape_name || '' });
    }

    const orders = (data || []).map((order: any) => {
      const ownerYape = ownerMap.get(order.waiter_id);
      const yapeConfig = ownerYape && (ownerYape.qr_url || ownerYape.name)
        ? { qr_url: ownerYape.qr_url || globalConfig.qr_url || '', name: ownerYape.name || globalConfig.name || '¡Qué Bravazo! Restobar' }
        : globalConfig;
      return { ...order, yape_config: yapeConfig };
    });

    return NextResponse.json({ data: orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

function needsKitchen(items: any[]): boolean {
  return items.some((item) => !item.skip_kitchen);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { waiter_id, waiter_name, table_number, order_type, items, subtotal, takeaway_charge, total, customer_name } = body;

    if (!waiter_id || !waiter_name || !order_type || !items || subtotal === undefined || total === undefined) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const status = needsKitchen(items) ? 'confirmed' : 'served';
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
        status,
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
