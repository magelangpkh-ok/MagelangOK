import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let { data, error } = await supabase
      .from('portal_settings')
      .select('*')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') {
      const fallback = await supabase
        .from('portal_settings_rows')
        .select('*')
        .eq('id', 1)
        .single();
      if (!fallback.error) {
        data = fallback.data;
        error = null;
      }
    }

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
    
    let { error } = await supabase
      .from('portal_settings')
      .upsert({
        id: 1,
        title: body.title,
        highlight: body.highlight,
        subtitle: body.subtitle,
        broadcast_active: body.broadcast_active,
        broadcast_text: body.broadcast_text,
        theme: body.theme || 'theme-default'
      });

    if (error) {
      const fallback = await supabase
        .from('portal_settings_rows')
        .upsert({
          id: 1,
          title: body.title,
          highlight: body.highlight,
          subtitle: body.subtitle,
          broadcast_active: body.broadcast_active,
          broadcast_text: body.broadcast_text,
          theme: body.theme || 'theme-default'
        });
      if (!fallback.error) error = null;
    }

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
