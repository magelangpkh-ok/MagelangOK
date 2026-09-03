'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial preference
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="navbar animate-up">
      <div className="container flex-between" style={{ height: '70px', padding: '0 2rem' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            background: 'var(--accent-primary)',
            borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '900', color: '#fff', fontSize: '1.2rem',
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
          }}>
            M
          </div>
          <h2 style={{ letterSpacing: '1px', fontWeight: '500', fontSize: '1.2rem', margin: 0 }}>
            MAGELANG <span style={{ fontWeight: '800', color: 'var(--accent-primary)' }}>PORTAL</span>
          </h2>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle Dark Mode">
            {isDark ? '☀️' : '🌙'}
          </button>
          <Link href="/admin" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem' }}>
            Akses Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
