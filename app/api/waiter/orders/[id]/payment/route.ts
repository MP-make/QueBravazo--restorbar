import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { payment_method } = body;

    if (!payment_method || !['efectivo', 'yape'].includes(payment_method)) {
      return NextResponse.json({ error: 'Método de pago inválido' }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('waiter_orders')
      .update({
        payment_method,
        payment_status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
