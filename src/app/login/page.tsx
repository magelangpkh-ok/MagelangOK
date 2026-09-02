'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CyberRobot from '@/components/CyberRobot';

export default function Login() {
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'typing' | 'error' | 'success'>('idle');
  const router = useRouter();

  // Reset from typing to idle after 1s of inactivity
  useEffect(() => {
    if (status === 'typing') {
      const timeout = setTimeout(() => setStatus('idle'), 800);
      return () => clearTimeout(timeout);
    }
  }, [status, password]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setStatus('success');
      localStorage.setItem('magelang_auth', 'authenticated');
      // Delay redirect to show success animation
      setTimeout(() => {
        router.push('/admin');
      }, 1500);
    } else {
      setStatus('error');
      setPassword('');
      setTimeout(() => setStatus('idle'), 1000); // Reset error after 1s
    }
  };

  return (
    <div className="portal-container" style={{ justifyContent: 'center', minHeight: '80vh' }}>
      <div className="cyber-grid"></div>
      
      <div className={`portal-card ${status === 'error' ? 'shake-animation' : ''} ${status === 'success' ? 'bounce-animation' : ''}`} 
           style={{ maxWidth: '450px', width: '100%', padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.85)', transition: 'all 0.3s' }}>
        
        <CyberRobot status={status} />

        <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          {status === 'success' ? 'Akses Diberikan!' : 'Otorisasi C2'}
        </h2>
        
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>
          {status === 'success' ? 'Menginisialisasi panel admin...' : 'Silakan masukkan sandi keamanan.'}
        </p>
        
        {status !== 'success' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'left' }}>
              <input 
                type="password" 
                className={`input-glass ${status === 'error' ? 'error-border' : ''}`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (status !== 'error') setStatus('typing');
                }}
                placeholder="Kata sandi..."
                required
                style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '3px' }}
              />
            </div>
            
            {status === 'error' && (
              <div style={{ color: '#ef4444', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Akses Ditolak! Coba lagi dong.
              </div>
            )}
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '1rem', fontSize: '1.1rem' }}>
              Verifikasi Identitas
            </button>
          </form>
        )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-30px); }
          60% { transform: translateY(-15px); }
        }
        .shake-animation { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; border-color: #ef4444 !important; }
        .bounce-animation { animation: bounce 1s; border-color: var(--accent-primary) !important; background: white !important; box-shadow: 0 0 50px rgba(5, 150, 105, 0.4) !important; }
        .error-border { border-color: #ef4444 !important; box-shadow: 0 0 15px rgba(239, 68, 68, 0.2) !important; background: rgba(239, 68, 68, 0.05) !important;}
      `}} />
    </div>
  );
}
