import React from 'react';

type RobotStatus = 'idle' | 'typing' | 'error' | 'success';

export default function CyberRobot({ status }: { status: RobotStatus }) {
  return (
    <div className={`cyber-robot-container ${status}`}>
      <svg width="180" height="180" viewBox="0 0 100 100" overflow="visible">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <g className="robot-body">
          {/* Antenna */}
          <line x1="50" y1="15" x2="50" y2="5" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
          <circle className="antenna-ball" cx="50" cy="5" r="4" fill="#38bdf8" />

          {/* Head */}
          <rect x="25" y="15" width="50" height="35" rx="15" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          
          {/* Ears */}
          <rect x="18" y="25" width="7" height="15" rx="3" fill="#94a3b8" />
          <rect x="75" y="25" width="7" height="15" rx="3" fill="#94a3b8" />

          {/* Visor Screen */}
          <rect x="32" y="22" width="36" height="18" rx="6" fill="#0f172a" />
          
          {/* Dynamic Eye/Visor Content */}
          <rect 
            className="visor-eye" 
            x="35" 
            y="25" 
            width={status === 'success' ? '30' : '10'} 
            height={status === 'success' ? '6' : '12'} 
            rx="3" 
            fill={status === 'error' ? '#ef4444' : '#10b981'} 
            filter="url(#glow)"
          />
          {status === 'success' && (
            <path d="M 35 35 Q 50 42 65 35" stroke="#10b981" strokeWidth="3" strokeLinecap="round" fill="none" filter="url(#glow)" />
          )}
          {status === 'error' && (
             <path d="M 38 27 L 46 35 M 46 27 L 38 35 M 54 27 L 62 35 M 62 27 L 54 35" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" filter="url(#glow)" />
          )}

          {/* Torso */}
          <rect x="35" y="50" width="30" height="25" rx="8" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
          
          {/* Arms */}
          <path className="arm-l" d="M 35 55 Q 15 55, 20 75" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path className="arm-r" d="M 65 55 Q 85 55, 80 75" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" fill="none" />

          {/* Thruster Base */}
          <path d="M 40 75 L 45 85 L 55 85 L 60 75 Z" fill="#94a3b8" />
          
          {/* Flame */}
          <path className="flame" d="M 45 85 Q 50 110, 55 85 Z" fill="#38bdf8" filter="url(#glow)" />
        </g>
      </svg>

      <style dangerouslySetInnerHTML={{__html: `
        .cyber-robot-container {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        /* Hover Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .robot-body {
          animation: float 3s ease-in-out infinite;
          transform-origin: center;
        }

        /* Flame Thruster Animation */
        @keyframes flicker {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.3); }
        }
        .flame {
          transform-origin: 50px 85px;
          animation: flicker 0.1s infinite alternate;
        }

        /* Visor Eye Animation */
        @keyframes scan {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
        @keyframes panic-scan {
          0% { transform: translateX(0); }
          100% { transform: translateX(20px); }
        }
        .idle .visor-eye {
          animation: scan 2s ease-in-out infinite alternate;
        }
        .typing .visor-eye {
          animation: scan 0.5s ease-in-out infinite alternate;
        }
        .error .visor-eye {
          display: none; /* Replaced by X eyes */
        }
        .success .visor-eye {
          animation: none;
          transform: translateY(2px);
        }

        /* Antenna Animation */
        .typing .antenna-ball {
          fill: #f59e0b;
          animation: flicker 0.2s infinite;
        }
        .error .antenna-ball {
          fill: #ef4444;
        }
        .success .antenna-ball {
          fill: #10b981;
        }

        /* Arms Animation */
        @keyframes type-left {
          0%, 100% { d: path("M 35 55 Q 15 55, 20 75"); }
          50% { d: path("M 35 55 Q 25 50, 30 65"); }
        }
        @keyframes type-right {
          0%, 100% { d: path("M 65 55 Q 85 55, 80 75"); }
          50% { d: path("M 65 55 Q 75 50, 70 65"); }
        }
        .typing .arm-l { animation: type-left 0.2s infinite alternate; }
        .typing .arm-r { animation: type-right 0.25s infinite alternate; }

        /* Error Shake Animation */
        @keyframes robot-shake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          75% { transform: translateX(5px) rotate(5deg); }
        }
        .error .robot-body {
          animation: robot-shake 0.3s infinite;
        }

        /* Success Spin/Jump Animation */
        @keyframes robot-cheer {
          0% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0); }
        }
        .success .robot-body {
          animation: robot-cheer 0.6s ease-out;
        }
        .success .arm-l {
          d: path("M 35 55 Q 10 30, 20 20"); /* Arms raised */
        }
        .success .arm-r {
          d: path("M 65 55 Q 90 30, 80 20"); /* Arms raised */
        }
      `}} />
    </div>
  );
}
