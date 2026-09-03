'use client';

import { useEffect, useState } from 'react';

type RobotStatus = 'idle' | 'typing' | 'success' | 'error';

export default function CyberRobot({ status = 'idle' }: { status?: RobotStatus }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="quantum-core-container" style={{ margin: '0 auto', width: '250px', height: '250px', position: 'relative' }}>
      <svg viewBox="0 0 200 200" width="250" height="250" className={`ai-core ${status}`}>
        <defs>
          <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--accent-secondary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Glow */}
        <circle cx="100" cy="100" r="85" fill="url(#coreGlow)" className="ambient-pulse" />

        {/* Outer Ring 1 */}
        <circle cx="100" cy="100" r="75" fill="none" stroke="var(--accent-primary)" strokeWidth="1" strokeDasharray="4 8" className="spin-slow" opacity="0.3" />
        
        {/* Outer Ring 2 */}
        <circle cx="100" cy="100" r="65" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeDasharray="30 10 10 10" className="spin-reverse" opacity="0.4" />

        {/* The Core Sphere */}
        <circle cx="100" cy="100" r="45" fill="var(--bg-card)" stroke="var(--accent-primary)" strokeWidth="2" filter="url(#softGlow)" className="core-sphere" />
        
        {/* Inner Data Ring */}
        <circle cx="100" cy="100" r="28" fill="none" stroke="var(--accent-secondary)" strokeWidth="1.5" strokeDasharray="15 5" className="spin-fast" />

        {/* Core Energy Center */}
        <circle cx="100" cy="100" r="12" fill="var(--accent-primary)" className="core-pulse" />

        {/* Cute Sparkles (Typing State) */}
        <g className="typing-particles" opacity="0">
          <path d="M100 15 L105 25 L115 30 L105 35 L100 45 L95 35 L85 30 L95 25 Z" fill="var(--accent-gold)" className="sparkle s1" />
          <path d="M165 80 L170 85 L180 90 L170 95 L165 105 L160 95 L150 90 L160 85 Z" fill="var(--accent-secondary)" className="sparkle s2" />
          <path d="M30 110 L35 115 L45 120 L35 125 L30 135 L25 125 L15 120 L25 115 Z" fill="var(--accent-primary)" className="sparkle s3" />
          <path d="M130 160 L133 165 L140 168 L133 171 L130 178 L127 171 L120 168 L127 165 Z" fill="var(--accent-gold)" className="sparkle s4" />
        </g>
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        .ai-core {
          display: block;
          margin: 0 auto;
        }

        .spin-slow {
          transform-origin: 100px 100px;
          animation: spin 25s linear infinite;
        }

        .spin-reverse {
          transform-origin: 100px 100px;
          animation: spin 20s linear infinite reverse;
        }

        .spin-fast {
          transform-origin: 100px 100px;
          animation: spin 6s linear infinite;
        }

        .ambient-pulse {
          animation: pulseAmbient 4s ease-in-out infinite;
        }

        .core-sphere {
          transition: all 0.5s ease;
        }

        .core-pulse {
          animation: pulseCore 2s ease-in-out infinite;
        }

        /* Status: Typing */
        .ai-core.typing .spin-fast {
          animation: spin 1.5s linear infinite;
          stroke: var(--accent-gold);
        }
        .ai-core.typing .core-pulse {
          fill: var(--accent-gold);
        }
        .ai-core.typing .typing-particles {
          opacity: 1;
        }
        
        .sparkle {
          transform-origin: center;
          animation: popSparkle 1.5s ease-in-out infinite;
        }
        .s1 { animation-delay: 0s; transform-origin: 100px 30px; }
        .s2 { animation-delay: 0.3s; transform-origin: 165px 90px; }
        .s3 { animation-delay: 0.6s; transform-origin: 30px 120px; }
        .s4 { animation-delay: 0.9s; transform-origin: 130px 168px; }

        /* Status: Success */
        .ai-core.success .core-sphere {
          stroke: #10b981; 
        }
        .ai-core.success .core-pulse {
          fill: #10b981;
        }

        /* Status: Error */
        .ai-core.error .core-sphere {
          stroke: #ef4444; 
        }
        .ai-core.error .core-pulse {
          fill: #ef4444;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        @keyframes pulseAmbient {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }

        @keyframes pulseCore {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }

        @keyframes popSparkle {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(45deg); opacity: 1; }
          100% { transform: scale(0) rotate(90deg); opacity: 0; }
        }
      `}} />
    </div>
  );
}
