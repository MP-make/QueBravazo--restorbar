import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createAdminClient();
    const now = new Date();
    const peruOffset = -300;
    const peruTime = new Date(now.getTime() + (now.getTimezoneOffset() + peruOffset) * 60000);
    const currentDay = peruTime.getDay();
    const currentTime = peruTime.toTimeString().slice(0, 5);

    const { data, error } = await supabase
      .from('menu_schedules')
      .select('menu_type, start_time, end_time, days_of_week, day_of_week')
      .eq('is_active', true);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const activeTypes = new Set<string>();
    for (const s of data || []) {
      const dw = (s as any).days_of_week || ((s as any).day_of_week !== null ? [(s as any).day_of_week] : [0, 1, 2, 3, 4, 5, 6]);
      if (!dw.includes(currentDay)) continue;
      if (currentTime >= (s as any).start_time.slice(0, 5)) {
        if ((s as any).end_time.slice(0, 5) === '00:00') {
          activeTypes.add((s as any).menu_type);
        } else if (currentTime <= (s as any).end_time.slice(0, 5)) {
          activeTypes.add((s as any).menu_type);
        }
      }
    }

    return NextResponse.json({
      active_types: Array.from(activeTypes),
      current_time: currentTime,
      current_day: currentDay,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}
