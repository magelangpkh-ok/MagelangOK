'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [menus, setMenus] = useState<any[]>([]);
  const [settings, setSettings] = useState({ 
    title: 'Sistem Operasi', 
    highlight: 'PKH', 
    subtitle: 'Pusat Integrasi Data & Layanan Kabupaten Magelang',
    broadcast_active: false,
    broadcast_text: ''
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const [menuRes, settingsRes] = await Promise.all([
          fetch('/api/menus'),
          fetch('/api/settings')
        ]);
        
        const menuJson = await menuRes.json();
        const settingsJson = await settingsRes.json();
        
        if (menuJson.data) {
          const sorted = menuJson.data.sort((a: any, b: any) => a.order_index - b.order_index);
          setMenus(sorted);
        }
        
        if (settingsJson.data) {
          setSettings(settingsJson.data);
        }
      } catch (error) {
        console.error('Failed to intercept payload', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredMenus = menus
    .filter(menu => menu.is_active !== false) // Exclude inactive main menus
    .map(menu => {
      if (menu.submenus) {
        return {
          ...menu,
          submenus: menu.submenus.filter((sub: any) => sub.is_active !== false)
        };
      }
      return menu;
    })
    .filter(menu => {
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
        {loading ? (
          <div style={{ textAlign: 'center', width: '100%', color: 'var(--accent-primary)', gridColumn: '1 / -1' }}>
            Mendekripsi Jaringan...
          </div>
        ) : (
          filteredMenus.map((menu, index) => {
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
          })
        )}
      </div>
    </div>
  );
}
