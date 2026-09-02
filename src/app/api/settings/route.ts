import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('portal_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Return default if not found
        return NextResponse.json({ data: { title: "Sistem Operasi", highlight: "PKH", subtitle: "Portal Aplikasi" } }, { status: 200 });
      }
      throw error;
    }

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const { error } = await supabase
      .from('portal_settings')
      .upsert({
        id: 1,
        title: body.title,
        highlight: body.highlight,
        subtitle: body.subtitle,
        broadcast_active: body.broadcast_active,
        broadcast_text: body.broadcast_text
      });

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
