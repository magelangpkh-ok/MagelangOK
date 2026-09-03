'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Item = { id: string, title: string, url: string, order_index: number, submenus?: any[], is_active?: boolean, db_url?: string };

export default function AdminDashboard() {
  const router = useRouter();
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'menu' | 'submenu'>('menu');
  const [editId, setEditId] = useState<string | null>(null);
  const [parentMenuId, setParentMenuId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ title: '', url: '', db_url: '' });
  
  // Settings State
  const [settings, setSettings] = useState({ title: '', highlight: '', subtitle: '', broadcast_active: false, broadcast_text: '', theme: 'theme-default' });
  const [savingSettings, setSavingSettings] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'matrix' | 'pengumuman' | 'metrics' | 'logs'>('matrix');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, settingsRes] = await Promise.all([
        fetch('/api/menus'),
        fetch('/api/settings')
      ]);
      const menuJson = await menuRes.json();
      const settingsJson = await settingsRes.json();
      
      if (menuJson.data) setData(menuJson.data);
      if (settingsJson.data) setSettings(settingsJson.data);
    } catch (error) {
      console.error('Failed to intercept payload', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auth Check
    const auth = localStorage.getItem('magelang_auth');
    if (auth !== 'authenticated') {
      router.push('/login');
    } else {
      fetchData();
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('magelang_auth');
    router.push('/login');
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      alert('Konfigurasi Header Berhasil Disimpan!');
    } catch (error) {
      console.error('Save settings failed', error);
      alert('Gagal menyimpan konfigurasi');
    } finally {
      setSavingSettings(false);
    }
  };

  const saveData = async (newData: any[]) => {
    try {
      await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      setData(newData); // Optimistic update
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  // --- Handlers ---
  const openModal = (mode: 'menu' | 'submenu', parentId: string | null = null, existingData: Item | null = null) => {
    setModalMode(mode);
    setParentMenuId(parentId);
    if (existingData) {
      setEditId(existingData.id);
      setFormData({ title: existingData.title, url: existingData.url, db_url: existingData.db_url || '' });
    } else {
      setEditId(null);
      setFormData({ title: '', url: mode === 'menu' ? '#' : 'https://', db_url: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ title: '', url: '', db_url: '' });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let newData = [...data];

    if (modalMode === 'menu') {
      if (editId) {
        // Edit Menu
        const index = newData.findIndex(m => m.id === editId);
        if (index > -1) {
          newData[index].title = formData.title;
          newData[index].url = formData.url;
          newData[index].db_url = formData.db_url;
        }
      } else {
        // Add Menu
        newData.push({ id: crypto.randomUUID(), title: formData.title, url: formData.url, db_url: formData.db_url, order_index: newData.length + 1, submenus: [] });
      }
    } else if (modalMode === 'submenu' && parentMenuId) {
      const parentIndex = newData.findIndex(m => m.id === parentMenuId);
      if (parentIndex > -1) {
        let subs = newData[parentIndex].submenus || [];
        if (editId) {
          // Edit Sub
          const subIndex = subs.findIndex((s: any) => s.id === editId);
          if (subIndex > -1) {
            subs[subIndex].title = formData.title;
            subs[subIndex].url = formData.url;
            subs[subIndex].db_url = formData.db_url;
          }
        } else {
          // Add Sub
          subs.push({ id: crypto.randomUUID(), title: formData.title, url: formData.url, db_url: formData.db_url, order_index: subs.length + 1 });
        }
        newData[parentIndex].submenus = subs;
      }
    }

    saveData(newData);
    closeModal();
  };

  const deleteItem = (id: string, parentId?: string) => {
    if (!confirm('TERMINASI: Hapus objek ini secara permanen?')) return;
    let newData = [...data];
    if (parentId) {
      const parent = newData.find(m => m.id === parentId);
      if (parent) parent.submenus = parent.submenus?.filter((s: any) => s.id !== id);
    } else {
      newData = newData.filter(m => m.id !== id);
    }
    saveData(newData);
  };

  const moveMenu = (index: number, direction: 'up' | 'down') => {
    let newData = [...data];
    if (direction === 'up' && index > 0) {
      [newData[index - 1], newData[index]] = [newData[index], newData[index - 1]];
    } else if (direction === 'down' && index < newData.length - 1) {
      [newData[index + 1], newData[index]] = [newData[index], newData[index + 1]];
    }
    // Re-index
    newData.forEach((m, i) => m.order_index = i + 1);
    saveData(newData);
  };

  const toggleVisibility = (menuId: string, subId?: string) => {
    let newData = [...data];
    if (subId) {
      const parent = newData.find(m => m.id === menuId);
      if (parent && parent.submenus) {
        const sub = parent.submenus.find((s: any) => s.id === subId);
        if (sub) sub.is_active = sub.is_active === false ? true : false;
      }
    } else {
      const menu = newData.find(m => m.id === menuId);
      if (menu) menu.is_active = menu.is_active === false ? true : false;
    }
    saveData(newData);
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '2.5rem', letterSpacing: '-0.5px', fontSize: '1.75rem', fontWeight: 900 }}>
          C2 COMMAND<br/>
          <span style={{ color: 'var(--accent-primary)' }}>CENTER</span>
        </h2>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <li>
            <button onClick={() => setActiveTab('matrix')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', color: activeTab === 'matrix' ? 'white' : 'var(--text-secondary)', backgroundColor: activeTab === 'matrix' ? 'var(--accent-primary)' : 'transparent', fontWeight: activeTab === 'matrix' ? 'bold' : 'normal', transition: 'all 0.3s' }}>
              {activeTab === 'matrix' && '► '} Navigation Matrix
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('pengumuman')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', color: activeTab === 'pengumuman' ? 'white' : 'var(--text-secondary)', backgroundColor: activeTab === 'pengumuman' ? 'var(--accent-primary)' : 'transparent', fontWeight: activeTab === 'pengumuman' ? 'bold' : 'normal', transition: 'all 0.3s' }}>
              {activeTab === 'pengumuman' && '► '} Broadcast Banner
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('metrics')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', color: activeTab === 'metrics' ? 'white' : 'var(--text-secondary)', backgroundColor: activeTab === 'metrics' ? 'var(--accent-primary)' : 'transparent', fontWeight: activeTab === 'metrics' ? 'bold' : 'normal', transition: 'all 0.3s' }}>
              {activeTab === 'metrics' && '► '} System Metrics
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('logs')} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', color: activeTab === 'logs' ? 'white' : 'var(--text-secondary)', backgroundColor: activeTab === 'logs' ? 'var(--accent-primary)' : 'transparent', fontWeight: activeTab === 'logs' ? 'bold' : 'normal', transition: 'all 0.3s' }}>
              {activeTab === 'logs' && '► '} Access Logs
            </button>
          </li>
          <li><button onClick={handleLogout} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', cursor: 'pointer', color: '#ef4444', marginTop: '3rem', display: 'block', padding: '1rem', width: '100%', textAlign: 'center', borderRadius: '12px', fontWeight: 'bold', transition: 'all 0.3s' }}>TERMINASI SESI (LOGOUT)</button></li>
        </ul>
      </aside>

      <main className="admin-content" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        {activeTab === 'matrix' && (
          <>
            {/* Header Settings Section */}
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem' }}>
                <h2 style={{ letterSpacing: '-0.5px', fontSize: '1.8rem', color: 'var(--text-primary)' }}>Konfigurasi Header Portal</h2>
                <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Atur judul dan deskripsi utama yang muncul di halaman depan.</p>
              </div>
              <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Judul Utama (Warna Dasar)</label>
                    <input 
                      type="text" 
                      className="input-glass" 
                      value={settings.title} 
                      onChange={(e) => setSettings({...settings, title: e.target.value})}
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Teks Sorotan (Gradient/Aksen)</label>
                    <input 
                      type="text" 
                      className="input-glass" 
                      value={settings.highlight} 
                      onChange={(e) => setSettings({...settings, highlight: e.target.value})}
                      required 
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Tema Tampilan Portal</label>
                  <select 
                    className="input-glass" 
                    value={settings.theme || 'theme-default'} 
                    onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    style={{ cursor: 'pointer', appearance: 'auto' }}
                  >
                    <option value="theme-default">Glassmorphism Modern (Default)</option>
                    <option value="theme-sketsa">Sketsa Komik (Hand-drawn)</option>
                    <option value="theme-simpel">Apple Minimalist (Simpel)</option>
                    <option value="theme-game">Retro Game (8-Bit Pixel Art)</option>
                  </select>
                </div>
                
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Sub-judul / Deskripsi Pendek</label>
                  <input 
                    type="text" 
                    className="input-glass" 
                    value={settings.subtitle} 
                    onChange={(e) => setSettings({...settings, subtitle: e.target.value})}
                    required 
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                  <button type="submit" className="btn btn-primary" disabled={savingSettings}>
                    {savingSettings ? 'Menyimpan...' : 'Simpan Konfigurasi'}
                  </button>
                </div>
              </form>
            </div>

            {/* Navigation Matrix Section */}
            <div className="glass-panel" style={{ padding: '2.5rem' }}>
              <div className="flex-between" style={{ marginBottom: '2.5rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ letterSpacing: '-0.5px', fontSize: '1.8rem', color: 'var(--text-primary)' }}>Struktur Navigasi Utama</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Kelola daftar menu dan sub-menu yang ditampilkan di Portal.</p>
                </div>
                <button className="btn btn-primary" onClick={() => openModal('menu')}>+ INJEKSI MENU</button>
              </div>

              {loading ? <p style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>Decrypting payload streams...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {data.map((menu, index) => (
                    <div key={menu.id} style={{ background: 'var(--bg-card)', padding: '1.75rem', borderRadius: '16px', border: '1px solid var(--card-border)', boxShadow: 'var(--glass-shadow)' }}>
                      
                      {/* MAIN MENU ROW */}
                      <div className="flex-between">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button onClick={() => moveMenu(index, 'up')} style={{ background: 'none', border: 'none', color: index === 0 ? 'rgba(0,0,0,0.1)' : 'var(--accent-primary)', cursor: index === 0 ? 'default' : 'pointer' }}>▲</button>
                            <button onClick={() => moveMenu(index, 'down')} style={{ background: 'none', border: 'none', color: index === data.length - 1 ? 'rgba(0,0,0,0.1)' : 'var(--accent-primary)', cursor: index === data.length - 1 ? 'default' : 'pointer' }}>▼</button>
                          </div>
                          <div>
                            <h3 style={{ color: 'var(--text-primary)', fontSize: '1.3rem', fontWeight: 800 }}>{menu.title}</h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--accent-secondary)', marginTop: '0.25rem', fontFamily: 'monospace' }}>{menu.url}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-glass" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', color: menu.is_active === false ? '#94a3b8' : 'var(--accent-primary)', borderColor: menu.is_active === false ? 'rgba(0,0,0,0.1)' : 'rgba(5,150,105,0.3)' }} onClick={() => toggleVisibility(menu.id)}>
                            {menu.is_active === false ? '👁️ TAMPILKAN' : '👁️ SEMBUNYIKAN'}
                          </button>
                          {menu.db_url && (
                            <a href={menu.db_url} target="_blank" rel="noopener noreferrer" className="btn btn-glass" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)', textDecoration: 'none' }}>📂 DATABASE</a>
                          )}
                          <button className="btn btn-glass" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem' }} onClick={() => openModal('submenu', menu.id)}>+ SUB-MENU</button>
                          <button className="btn btn-glass" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem' }} onClick={() => openModal('menu', null, menu)}>EDIT</button>
                          <button className="btn btn-glass" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }} onClick={() => deleteItem(menu.id)}>HAPUS</button>
                        </div>
                      </div>

                      {/* SUB MENUS */}
                      {menu.submenus && menu.submenus.length > 0 && (
                        <div style={{ marginTop: '1.5rem', paddingLeft: '2.5rem', borderLeft: '2px solid rgba(5,150,105,0.2)' }}>
                          {menu.submenus.map((sub: any, sIdx: number) => (
                            <div key={sub.id} className="flex-between" style={{ padding: '1rem 0', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                              <div>
                                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>└ {sub.title}</span>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', paddingLeft: '1.25rem', marginTop: '0.25rem' }}>{sub.url}</div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button className="btn btn-glass" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: sub.is_active === false ? '#94a3b8' : 'var(--accent-primary)', borderColor: sub.is_active === false ? 'rgba(0,0,0,0.1)' : 'rgba(5,150,105,0.3)' }} onClick={() => toggleVisibility(menu.id, sub.id)}>
                                  {sub.is_active === false ? '👁️ Tampil' : '👁️ Sembunyi'}
                                </button>
                                {sub.db_url && (
                                  <a href={sub.db_url} target="_blank" rel="noopener noreferrer" className="btn btn-glass" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)', textDecoration: 'none' }}>📂 Database</a>
                                )}
                                <button className="btn btn-glass" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => openModal('submenu', menu.id, sub)}>Edit</button>
                                <button className="btn btn-glass" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444', border: 'none' }} onClick={() => deleteItem(sub.id, menu.id)}>Hapus</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ---------------- NEW TABS IMPLEMENTATION ---------------- */}

        {activeTab === 'pengumuman' && (
          <div className="glass-panel" style={{ padding: '3rem' }}>
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📢</div>
              <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Broadcast Banner</h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Tampilkan pita pengumuman berjalan (running text) di bagian atas portal.
              </p>
            </div>
            
            <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>
              
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(5, 150, 105, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(5, 150, 105, 0.2)' }}>
                <input 
                  type="checkbox" 
                  id="broadcast_active"
                  checked={settings.broadcast_active || false}
                  onChange={(e) => setSettings({...settings, broadcast_active: e.target.checked})}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="broadcast_active" style={{ cursor: 'pointer', margin: 0, fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                  Aktifkan Pengumuman Berjalan
                </label>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ margin: 0 }}>Teks Pengumuman</label>
                  <span style={{ 
                    fontSize: '0.85rem', 
                    color: (settings.broadcast_text?.length || 0) > 200 ? '#ef4444' : 'var(--text-secondary)',
                    fontWeight: (settings.broadcast_text?.length || 0) > 200 ? 'bold' : 'normal'
                  }}>
                    {(settings.broadcast_text?.length || 0)} / 250 Karakter
                  </span>
                </div>
                <textarea 
                  className="input-glass" 
                  value={settings.broadcast_text || ''} 
                  onChange={(e) => setSettings({...settings, broadcast_text: e.target.value})}
                  placeholder="Ketik pesan informasi darurat atau pengumuman di sini..."
                  rows={4}
                  maxLength={250}
                  style={{ 
                    resize: 'none', 
                    borderColor: (settings.broadcast_text?.length || 0) > 200 ? '#ef4444' : 'var(--glass-border)' 
                  }}
                />
                {(settings.broadcast_text?.length || 0) > 150 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span>⚠️</span> Teks yang terlalu panjang dapat membuat animasi bergerak terlalu cepat dan sulit dibaca oleh pengunjung.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={savingSettings} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>
                  {savingSettings ? 'Menyimpan...' : 'Simpan & Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="glass-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', color: 'var(--text-primary)', borderBottom: '1px solid rgba(0,0,0,0.05)', paddingBottom: '1rem' }}>System Metrics (Live)</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: 'var(--accent-primary)', fontWeight: 900, marginBottom: '0.5rem' }}>99.9%</div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Uptime Server</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: 'var(--accent-secondary)', fontWeight: 900, marginBottom: '0.5rem' }}>142</div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Pengunjung Aktif</div>
              </div>
              <div style={{ background: 'var(--bg-card)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', color: '#10b981', fontWeight: 900, marginBottom: '0.5rem' }}>14ms</div>
                <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Latency</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="glass-panel" style={{ padding: '2.5rem', background: '#0f172a', color: '#10b981', fontFamily: 'monospace' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: '#f8fafc' }}>&gt; _SERVER_ACCESS_LOGS</h2>
            <div style={{ height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div>[18:14:22] GET /api/menus - 200 OK (IP: 192.168.1.45)</div>
              <div>[18:14:15] GET /candi-bg.jpg - 200 OK (IP: 192.168.1.12)</div>
              <div>[18:13:05] POST /api/auth - 401 UNAUTHORIZED (IP: 103.11.22.x) [BLOCK]</div>
              <div>[18:11:55] POST /api/settings - 200 OK (IP: 127.0.0.1)</div>
              <div>[18:10:10] GET / - 200 OK (IP: 114.125.x.x)</div>
              <div style={{ color: 'var(--text-secondary)' }}>Loading more logs...</div>
            </div>
          </div>
        )}
      </main>

      {/* CUSTOM MODAL */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-header">
              {editId ? 'MODIFIKASI' : 'INJEKSI BARU'} {modalMode === 'menu' ? 'MENU UTAMA' : 'SUB-MENU'}
            </h3>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Judul Tampilan</label>
                <input 
                  type="text" 
                  className="input-glass" 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required 
                  placeholder="Misal: Portal Edukasi"
                />
              </div>
              <div className="form-group">
                <label>Target URL</label>
                <input 
                  type="text" 
                  className="input-glass" 
                  value={formData.url} 
                  onChange={(e) => setFormData({...formData, url: e.target.value})}
                  required 
                  placeholder="https://... atau # jika sebagai folder"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  * Gunakan <strong>#</strong> jika item ini hanya sebagai wadah untuk sub-menu.
                </p>
              </div>
              <div className="form-group">
                <label>Link Database Khusus Admin (Opsional)</label>
                <input 
                  type="text" 
                  className="input-glass" 
                  value={formData.db_url} 
                  onChange={(e) => setFormData({...formData, db_url: e.target.value})}
                  placeholder="https://docs.google.com/spreadsheets/..."
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  * Hanya muncul di halaman Admin. Jika diisi, tombol 📂 Database akan aktif.
                </p>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-glass" onClick={closeModal}>Batal</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Simpan Perubahan' : 'Eksekusi'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
