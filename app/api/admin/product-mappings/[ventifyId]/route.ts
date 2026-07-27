import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function PUT(req: Request, { params }: { params: Promise<{ ventifyId: string }> }) {
  try {
    const { ventifyId } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const upsert = {
      ventify_id: ventifyId,
      sku: body.sku || '',
      title: body.title || '',
      price: body.price ?? 0,
      image: body.image || '',
      display_order: body.display_order ?? 0,
      category_id: body.category_id || null,
      menu_types: body.menu_types || ['criollo', 'rapida'],
      is_active: body.is_active ?? true,
      is_featured: body.is_featured ?? false,
    };

    const { data, error } = await supabase
      .from('product_mappings')
      .upsert(upsert, { onConflict: 'ventify_id' })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ ventifyId: string }> }) {
  try {
    const { ventifyId } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('product_mappings')
      .delete()
      .eq('ventify_id', ventifyId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
