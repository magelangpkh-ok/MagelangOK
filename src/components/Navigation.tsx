'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="navbar" style={{ padding: '1.25rem 2rem' }}>
      <div className="container flex-between" style={{ padding: 0 }}>
        <Link href="/" style={{ fontSize: '1.75rem', fontWeight: '900', letterSpacing: '-1px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-primary)' }}>MAGELANG</span>
          <span style={{ color: 'var(--text-primary)' }}>OK</span>
        </Link>

        <div>
          <Link href="/login" className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
            Login Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
