'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import CyberRobot from '@/components/CyberRobot';

export default function PortalClient({ initialMenus, initialSettings }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [robotState, setRobotState] = useState<'idle'|'typing'|'success'|'error'>('idle');
  const [greeting, setGreeting] = useState({ text: 'Selamat Datang', emoji: '👋' });
  
  // Audio State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Menggunakan file audio lokal murni (tanpa iframe pihak ketiga) untuk stabilitas & keamanan
  const themeMusicMap: Record<string, string> = {
    'theme-one-piece': '/audio/one-piece-we-are.mp3', 
    'theme-denny-caknan': '/audio/denny-caknan.mp3', 
    'theme-sepakbola': '/audio/sepakbola.mp3', 
    'theme-cyberpunk': '/audio/cyberpunk.mp3',
    'theme-kawaii': '/audio/kawaii-cat.mp3',
  };
  
  // Realtime State
  const [menus, setMenus] = useState(initialMenus || []);
  const [settings, setSettings] = useState(initialSettings || {
    title: 'PORTAL PEGAWAI',
    highlight: 'TERPADU',
    subtitle: 'Sistem Informasi & Layanan Kepegawaian Kabupaten Magelang',
    broadcast_active: true,
    broadcast_text: 'Batas akhir pengisian E-Kinerja triwulan ini adalah tanggal 30 September.'
  });
  
  useEffect(() => {
    // Dynamic greeting based on time
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) {
      setGreeting({ text: 'Selamat Pagi, Semangat!', emoji: '☀️' });
    } else if (hour >= 11 && hour < 15) {
      setGreeting({ text: 'Selamat Siang!', emoji: '☕️' });
    } else if (hour >= 15 && hour < 18) {
      setGreeting({ text: 'Selamat Sore!', emoji: '🌅' });
    } else {
      setGreeting({ text: 'Selamat Malam, Selamat Istirahat!', emoji: '🌙' });
    }
  }, []);

  // Realtime Listener
  useEffect(() => {
    const fetchLatestData = async () => {
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
    .filter((menu: any) => menu.is_active !== false)
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

  useEffect(() => {
    if (searchQuery.length > 0) {
      setRobotState('typing');
      const timer = setTimeout(() => {
        if (filteredMenus.length > 0) {
          setRobotState('success');
        } else {
          setRobotState('error');
        }
        setTimeout(() => setRobotState('idle'), 2000);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setRobotState('idle');
    }
  }, [searchQuery, filteredMenus.length]);

  // Audio Handler
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.log("[SECURITY LOG] Browser memblokir eksekusi audio secara otomatis:", e);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  // Reset audio when theme changes
  useEffect(() => {
    setIsPlaying(false);
  }, [settings.theme]);

  const currentAudioSrc = settings.theme ? themeMusicMap[settings.theme] : null;

  return (
    <div className={settings.theme || 'theme-default'} style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', position: 'relative', width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      <main className="portal-container" style={{ flex: 1 }}>
        <header className="portal-header animate-up delay-1">

          <div className="greeting-text">
            {greeting.emoji} {greeting.text}
          </div>
          
          <h1>{settings.title} <span>{settings.highlight}</span></h1>
          <p>{settings.subtitle}</p>
          
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Ketik untuk mencari layanan (Contoh: Bantuan)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* Global Broadcast Message - Glowing Banner */}
        {settings.broadcast_active && settings.broadcast_text && (
          <div className="animate-up delay-1" style={{ width: '100%', padding: '0 2rem' }}>
            <div className="announcement-banner">
              <div style={{ fontSize: '2rem' }}>📢</div>
              <div>
                <h4 style={{ fontWeight: '800', fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                  Pengumuman Sistem
                </h4>
                <p style={{ opacity: 0.9, fontSize: '0.95rem', margin: 0 }}>
                  {settings.broadcast_text}
                </p>
              </div>
            </div>
          </div>
        )}

        {settings.theme === 'theme-game' && (
          <div className="flappy-bird" />
        )}

        <div className="portal-grid" style={{ position: 'relative', zIndex: 2 }}>
          {filteredMenus.map((menu: any, index: number) => {
            const isUrgent = menu.title.toUpperCase().includes('SEGERA KERJAKAN') || menu.title.toUpperCase().includes('PENILAIAN');
            
            return (
              <div 
                key={menu.id} 
                className={`portal-card animate-up delay-1 ${isUrgent ? 'urgent-card' : ''}`}
                style={{ animationDelay: `${0.1 * (index + 2)}s` }}
              >
                <h3>
                  {menu.icon && <span style={{marginRight: '8px'}}>{menu.icon}</span>}
                  {menu.title}
                  {isUrgent && (
                    <span className="badge-prioritas">
                      PRIORITAS
                    </span>
                  )}
                </h3>
                
                {menu.url && menu.url !== '#' && (!menu.submenus || menu.submenus.length === 0) && (
                  <a href={menu.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                    Akses Layanan
                  </a>
                )}
                
                {menu.submenus && menu.submenus.length > 0 && (
                  <ul className="sub-links">
                    {menu.submenus.map((sub: any) => (
                      <li key={sub.id}>
                        <a href={sub.url} target="_blank" rel="noopener noreferrer" className={isUrgent ? 'urgent-sublink' : ''}>
                          {sub.icon ? <span style={{marginRight: '8px'}}>{sub.icon}</span> : <span className="bullet"></span>}
                          {sub.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
          
          {filteredMenus.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.3 }}>🔍</div>
              <h3 style={{ color: 'var(--text-primary)' }}>Layanan Tidak Ditemukan</h3>
              <p>Sistem tidak dapat menemukan modul yang Anda cari.</p>
            </div>
          )}
        </div>
      </main>

      {/* Floating Audio Player */}
      {currentAudioSrc && (
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          {isPlaying && (
            <div className="animate-up" style={{ background: 'var(--glass-bg)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--glass-border)', boxShadow: 'var(--glass-shadow)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ animation: 'text-blink 1s infinite' }}>🎵</span> System BGM Active
            </div>
          )}
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="btn btn-primary"
            style={{ 
              borderRadius: '50px', 
              width: '60px', 
              height: '60px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '1.5rem', 
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)',
              transition: 'all 0.3s ease',
              transform: isPlaying ? 'scale(1.05)' : 'scale(1)'
            }}
            title={isPlaying ? "Jeda Musik" : "Eksekusi Musik Tema"}
          >
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <audio 
            ref={audioRef} 
            src={currentAudioSrc} 
            loop 
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  );
}
