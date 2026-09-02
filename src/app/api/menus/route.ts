import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: menus, error: menusError } = await supabase
      .from('menus')
      .select('*')
      .order('order_index', { ascending: true });

    if (menusError) throw menusError;

    const { data: submenus, error: subError } = await supabase
      .from('submenus')
      .select('*')
      .order('order_index', { ascending: true });

    if (subError) throw subError;

    // Combine
    const formattedData = menus.map(menu => ({
      id: menu.id,
      title: menu.title,
      url: menu.url,
      db_url: menu.db_url,
      order_index: menu.order_index,
      is_active: menu.is_active,
      submenus: submenus.filter(sub => sub.menu_id === menu.id).map(sub => ({
        id: sub.id,
        title: sub.title,
        url: sub.url,
        db_url: sub.db_url,
        order_index: sub.order_index,
        is_active: sub.is_active
      }))
    }));

    return NextResponse.json({ data: formattedData }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Simple Sync Strategy:
    // 1. Fetch current IDs
    // 2. Upsert incoming menus and submenus
    // 3. Delete those that are missing in the incoming payload

    const incomingMenuIds = body.map((m: any) => m.id);
    let incomingSubIds: string[] = [];
    
    const menusToUpsert = body.map((m: any) => {
      if (m.submenus) {
        incomingSubIds = [...incomingSubIds, ...m.submenus.map((s: any) => s.id)];
      }
      return {
        id: m.id,
        title: m.title,
        url: m.url,
        db_url: m.db_url || null,
        order_index: m.order_index,
        is_active: m.is_active !== false // default true
      };
    });

    const submenusToUpsert: any[] = [];
    body.forEach((m: any) => {
      if (m.submenus) {
        m.submenus.forEach((s: any) => {
          submenusToUpsert.push({
            id: s.id,
            menu_id: m.id,
            title: s.title,
            url: s.url,
            db_url: s.db_url || null,
            order_index: s.order_index,
            is_active: s.is_active !== false
          });
        });
      }
    });

    // UPSERT MENUS
    if (menusToUpsert.length > 0) {
      const { error: upsertMenuErr } = await supabase.from('menus').upsert(menusToUpsert);
      if (upsertMenuErr) throw upsertMenuErr;
    }

    // UPSERT SUBMENUS
    if (submenusToUpsert.length > 0) {
      const { error: upsertSubErr } = await supabase.from('submenus').upsert(submenusToUpsert);
      if (upsertSubErr) throw upsertSubErr;
    }

    // CLEANUP DELETED
    const { data: currentMenus } = await supabase.from('menus').select('id');
    const { data: currentSubmenus } = await supabase.from('submenus').select('id');

    if (currentSubmenus) {
      const subsToDelete = currentSubmenus.filter(s => !incomingSubIds.includes(s.id)).map(s => s.id);
      if (subsToDelete.length > 0) {
        await supabase.from('submenus').delete().in('id', subsToDelete);
      }
    }

    if (currentMenus) {
      const menusToDelete = currentMenus.filter(m => !incomingMenuIds.includes(m.id)).map(m => m.id);
      if (menusToDelete.length > 0) {
        await supabase.from('menus').delete().in('id', menusToDelete);
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
