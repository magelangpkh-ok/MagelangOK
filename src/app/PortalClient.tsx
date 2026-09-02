'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PortalClient({ initialMenus, initialSettings }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Realtime State
  const [menus, setMenus] = useState(initialMenus);
  const [settings, setSettings] = useState(initialSettings);
  
  // Realtime Listener
  useEffect(() => {
    const fetchLatestData = async () => {
      console.log("Realtime event detected! Fetching fresh data...");
      const { data: m } = await supabase.from('menus').select('*').order('order_index', { ascending: true });
      const { data: sm } = await supabase.from('submenus').select('*').order('order_index', { ascending: true });
      const { data: s } = await supabase.from('portal_settings').select('*').single();
      
      if (m && sm) {
        const formattedData = m.map(menu => ({
          ...menu,
          submenus: sm.filter(sub => sub.menu_id === menu.id)
        }));
        setMenus(formattedData);
      }
      if (s) {
        setSettings(s);
      }
    };

    // Subscribe to all changes in the 3 tables
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menus' }, fetchLatestData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'submenus' }, fetchLatestData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portal_settings' }, fetchLatestData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredMenus = menus
    .filter((menu: any) => menu.is_active !== false) // Exclude inactive main menus
    .map((menu: any) => {
      if (menu.submenus) {
        return {
          ...menu,
          submenus: menu.submenus.filter((sub: any) => sub.is_active !== false)
        };
      }
      return menu;
    })
    .filter((menu: any) => {
      const matchMenu = menu.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSub = menu.submenus?.some((sub: any) => sub.title.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchMenu || matchSub;
    });

  return (
    <div className="portal-container">
      {/* Background FX */}
      <div className="cyber-grid"></div>

      {/* Broadcast Banner */}
      {settings.broadcast_active && settings.broadcast_text && (
        <div style={{
          width: '100%',
          background: 'var(--accent-primary)',
          color: 'white',
          padding: '0.75rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(5, 150, 105, 0.4)',
          zIndex: 10
        }}>
          <div style={{ padding: '0 1.5rem', fontWeight: 'bold', borderRight: '1px solid rgba(255,255,255,0.3)', marginRight: '1rem', whiteSpace: 'nowrap' }}>
            INFO PENTING
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              animation: 'marquee linear infinite',
              animationDuration: `${Math.max(20, (settings.broadcast_text?.length || 0) * 0.3)}s`,
              fontWeight: 500,
              letterSpacing: '1px'
            }}>
              {settings.broadcast_text} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {settings.broadcast_text} &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {settings.broadcast_text}
            </div>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes marquee {
              0% { transform: translateX(100%); }
              100% { transform: translateX(-100%); }
            }
          `}} />
        </div>
      )}
      
      <div className="portal-header animate-up delay-1">
        <h1>{settings.title} <span>{settings.highlight}</span></h1>
        <p>{settings.subtitle}</p>
        
        <div className="search-box">
          <input 
            type="text" 
            placeholder="Ketik untuk mencari layanan atau menu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="portal-grid">
        {filteredMenus.map((menu: any, index: number) => {
          const isUrgent = menu.title.toUpperCase().includes('SEGERA KERJAKAN');
          
          return (
          <div key={menu.id} className={`portal-card animate-up ${isUrgent ? 'urgent-card' : ''}`} style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
            <div className="card-glare"></div>
            <h3 style={isUrgent ? { color: '#ef4444' } : {}}>{isUrgent && '🚨 '} {menu.title}</h3>
            {menu.url && menu.url !== '#' && (!menu.submenus || menu.submenus.length === 0) && (
              <a href={menu.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: isUrgent ? 'linear-gradient(135deg, #ef4444, #f97316)' : undefined }}>
                Akses Layanan
              </a>
            )}
            
            {menu.submenus && menu.submenus.length > 0 && (
              <ul className="sub-links">
                {menu.submenus.map((sub: any) => (
                  <li key={sub.id}>
                    <a href={sub.url} target="_blank" rel="noopener noreferrer" className={isUrgent ? 'urgent-sublink' : ''}>
                      <span className="bullet" style={isUrgent ? { background: '#ef4444', boxShadow: '0 0 10px #ef4444' } : {}}></span>
                      {sub.title}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
          );
        })}
      </div>
    </div>
  );
}
