import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

const BUCKET = 'media';

async function ensureBucket(supabase: ReturnType<typeof createAdminClient>) {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.find((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) throw new Error(`Error al crear bucket: ${error.message}`);
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });

    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const supabase = createAdminClient();
    await ensureBucket(supabase);

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, file, { upsert: true, contentType: file.type });

    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
