import React from 'react';

interface RewardIllustrationProps {
  type?: 'seat_change' | 'music_request' | 'homework_pass' | 'secret_gift' | 'custom' | string;
  themeColor?: 'purple' | 'blue' | 'teal' | 'orange' | 'amber' | 'emerald' | 'rose';
  icon?: string;
  className?: string;
}

export const RewardIllustration: React.FC<RewardIllustrationProps> = ({
  type,
  themeColor = 'purple',
  icon = '🎁',
  className = 'w-full h-36',
}) => {
  if (type === 'seat_change') {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}>
        <svg viewBox="0 0 200 130" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Background Ambient Glow */}
          <defs>
            <radialGradient id="purpleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="chairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9333ea" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <linearGradient id="deskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="100%" stopColor="#d8b4fe" />
            </linearGradient>
            <linearGradient id="goldStar" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="100%" stopColor="#eab308" />
            </linearGradient>
          </defs>

          {/* Ambient circles */}
          <circle cx="100" cy="65" r="55" fill="url(#purpleGlow)" />
          
          {/* Floor / carpet shadow */}
          <ellipse cx="100" cy="108" rx="65" ry="12" fill="#7e22ce" fillOpacity="0.12" />

          {/* Desk shadow */}
          <ellipse cx="100" cy="98" rx="45" ry="8" fill="#581c87" fillOpacity="0.15" />

          {/* Ergonomic Classroom Chair Back */}
          <rect x="76" y="24" width="48" height="42" rx="12" fill="url(#chairGrad)" />
          <rect x="82" y="30" width="36" height="30" rx="8" fill="#a855f7" />
          
          {/* Chair Seat Cushion */}
          <rect x="70" y="62" width="60" height="14" rx="6" fill="#7e22ce" />

          {/* Chair Spine & Wheels */}
          <path d="M100 76 V96" stroke="#4c1d95" strokeWidth="4" strokeLinecap="round" />
          <path d="M82 98 L100 94 L118 98" stroke="#4c1d95" strokeWidth="4" strokeLinecap="round" />
          <circle cx="82" cy="100" r="3" fill="#3b0764" />
          <circle cx="100" cy="96" r="3" fill="#3b0764" />
          <circle cx="118" cy="100" r="3" fill="#3b0764" />

          {/* Classroom Desk */}
          <path d="M48 68 L152 68 L144 80 L56 80 Z" fill="url(#deskGrad)" stroke="#c084fc" strokeWidth="1.5" />
          {/* Desk legs */}
          <path d="M56 80 L54 104" stroke="#9333ea" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M144 80 L146 104" stroke="#9333ea" strokeWidth="3.5" strokeLinecap="round" />

          {/* Notebook & Pen on desk */}
          <rect x="66" y="65" width="22" height="11" rx="2" fill="#ffffff" stroke="#a855f7" strokeWidth="1" transform="rotate(-5 66 65)" />
          <line x1="70" y1="69" x2="82" y2="68" stroke="#9333ea" strokeWidth="1" />
          <line x1="70" y1="72" x2="80" y2="71" stroke="#9333ea" strokeWidth="1" />
          <line x1="94" y1="66" x2="102" y2="74" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />

          {/* VIP Badge on chair */}
          <g transform="translate(100, 45)">
            <circle cx="0" cy="0" r="13" fill="url(#goldStar)" stroke="#ca8a04" strokeWidth="1.5" />
            <path d="M0 -7 L2 -2 L7 -2 L3 2 L5 7 L0 4 L-5 7 L-3 2 L-7 -2 L-2 -2 Z" fill="#ffffff" />
          </g>

          {/* Floating Stars and Sparkles */}
          <path d="M38 35 L40 40 L45 42 L40 44 L38 49 L36 44 L31 42 L36 40 Z" fill="#facc15" />
          <circle cx="162" cy="38" r="3.5" fill="#e879f9" />
          <path d="M156 50 L158 54 L162 55 L158 56 L156 60 L154 56 L150 55 L154 54 Z" fill="#fbbf24" />
          <circle cx="44" cy="65" r="2.5" fill="#c084fc" />
          <circle cx="148" cy="26" r="2" fill="#fde047" />

          {/* Tag "Vị trí VIP" banner */}
          <g transform="translate(100, 118)">
            <rect x="-38" y="-9" width="76" height="17" rx="8.5" fill="#9333ea" stroke="#ffffff" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              CHỖ NGỒI VIP
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (type === 'music_request') {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}>
        <svg viewBox="0 0 200 130" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="headphoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="speakerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0369a1" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="100" cy="65" r="55" fill="url(#blueGlow)" />
          
          {/* Shadow */}
          <ellipse cx="100" cy="108" rx="60" ry="10" fill="#0369a1" fillOpacity="0.15" />

          {/* Sound waves rings background */}
          <circle cx="100" cy="62" r="42" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />
          <circle cx="100" cy="62" r="54" stroke="#60a5fa" strokeWidth="1.2" strokeDasharray="3 3" strokeOpacity="0.4" />

          {/* DJ Headphone Headband */}
          <path d="M68 64 C68 36 132 36 132 64" stroke="url(#headphoneGrad)" strokeWidth="8" strokeLinecap="round" />
          <path d="M74 60 C74 42 126 42 126 60" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />

          {/* Left Earcup */}
          <rect x="58" y="56" width="16" height="28" rx="8" fill="#1e40af" stroke="#60a5fa" strokeWidth="2" />
          <rect x="62" y="60" width="8" height="20" rx="4" fill="#38bdf8" />

          {/* Right Earcup */}
          <rect x="126" y="56" width="16" height="28" rx="8" fill="#1e40af" stroke="#60a5fa" strokeWidth="2" />
          <rect x="130" y="60" width="8" height="20" rx="4" fill="#38bdf8" />

          {/* Center Equalizer Audio Bars */}
          <g transform="translate(82, 52)">
            <rect x="0" y="14" width="4" height="16" rx="2" fill="#38bdf8" />
            <rect x="7" y="6" width="4" height="24" rx="2" fill="#60a5fa" />
            <rect x="14" y="0" width="4" height="30" rx="2" fill="#3b82f6" />
            <rect x="21" y="8" width="4" height="22" rx="2" fill="#60a5fa" />
            <rect x="28" y="16" width="4" height="14" rx="2" fill="#38bdf8" />
            <rect x="35" y="10" width="4" height="20" rx="2" fill="#93c5fd" />
          </g>

          {/* Floating Musical Notes */}
          {/* Note 1 (Left top) */}
          <g transform="translate(42, 28) scale(0.9)">
            <ellipse cx="6" cy="14" rx="4" ry="3" fill="#0284c7" transform="rotate(-20 6 14)" />
            <path d="M9 13 V3 C9 3 15 1 18 5" stroke="#0284c7" strokeWidth="2.5" strokeLinecap="round" />
          </g>

          {/* Note 2 (Double note right top) */}
          <g transform="translate(144, 22) scale(0.85)">
            <ellipse cx="5" cy="14" rx="3.5" ry="2.5" fill="#2563eb" transform="rotate(-20 5 14)" />
            <ellipse cx="17" cy="11" rx="3.5" ry="2.5" fill="#2563eb" transform="rotate(-20 17 11)" />
            <path d="M8 13 V3 L20 0 V10" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 3 L20 0" stroke="#2563eb" strokeWidth="3" />
          </g>

          {/* Note 3 (Left bottom) */}
          <g transform="translate(36, 75) scale(0.8)">
            <ellipse cx="6" cy="12" rx="4" ry="3" fill="#38bdf8" transform="rotate(-20 6 12)" />
            <path d="M9 11 V2" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Note 4 (Right bottom) */}
          <g transform="translate(156, 70) scale(0.8)">
            <ellipse cx="6" cy="12" rx="4" ry="3" fill="#0284c7" transform="rotate(-20 6 12)" />
            <path d="M9 11 V2 C9 2 13 1 15 4" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Sparkles */}
          <circle cx="50" cy="50" r="2.5" fill="#facc15" />
          <circle cx="150" cy="55" r="2" fill="#38bdf8" />
          <circle cx="100" cy="22" r="3" fill="#facc15" />

          {/* Tag "Giờ Ra Chơi" banner */}
          <g transform="translate(100, 118)">
            <rect x="-42" y="-9" width="84" height="17" rx="8.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              NHẠC THEO YÊU CẦU
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (type === 'homework_pass') {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}>
        <svg viewBox="0 0 200 130" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="tealGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="scrollGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0fdfa" />
            </linearGradient>
            <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="ribbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="100%" stopColor="#115e59" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="100" cy="65" r="55" fill="url(#tealGlow)" />
          
          {/* Shadow */}
          <ellipse cx="100" cy="108" rx="60" ry="10" fill="#0f766e" fillOpacity="0.15" />

          {/* Certificate Scroll Backdrop */}
          <rect x="58" y="20" width="84" height="74" rx="8" fill="url(#scrollGrad)" stroke="#2dd4bf" strokeWidth="2" />
          
          {/* Decorative Corner Ornaments */}
          <path d="M64 26 H72 M64 26 V34" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M136 26 H128 M136 26 V34" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M64 88 H72 M64 88 V80" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M136 88 H128 M136 88 V80" stroke="#0d9488" strokeWidth="1.5" strokeLinecap="round" />

          {/* Text lines on scroll */}
          <rect x="74" y="32" width="52" height="4" rx="2" fill="#0f766e" />
          <rect x="70" y="42" width="60" height="2.5" rx="1.25" fill="#99f6e4" />
          <rect x="70" y="48" width="50" height="2.5" rx="1.25" fill="#99f6e4" />
          <rect x="70" y="54" width="40" height="2.5" rx="1.25" fill="#99f6e4" />

          {/* Golden/Teal Official Ribbon Tail */}
          <path d="M92 78 L86 98 L92 94 L98 98 Z" fill="url(#ribbonGrad)" />
          <path d="M108 78 L102 98 L108 94 L114 98 Z" fill="url(#ribbonGrad)" />

          {/* Official Seal Badge with Checkmark */}
          <g transform="translate(100, 72)">
            <circle cx="0" cy="0" r="16" fill="url(#sealGrad)" stroke="#ffffff" strokeWidth="2" />
            <circle cx="0" cy="0" r="12" fill="#0d9488" />
            {/* Big Checkmark */}
            <path d="M-5 0 L-2 4 L6 -4" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Magic Feather Quill / Pencil with Sparkle Trail */}
          <g transform="translate(140, 32) rotate(35)">
            <path d="M0 0 L6 -20 C7 -26 12 -28 14 -32 C12 -25 10 -20 6 -15 L2 0 Z" fill="#2dd4bf" stroke="#0f766e" strokeWidth="1" />
            <polygon points="0,0 3,12 6,0" fill="#facc15" stroke="#ca8a04" strokeWidth="0.8" />
            <circle cx="3" cy="14" r="1" fill="#0f766e" />
          </g>

          {/* Floating Stars / Sparkles */}
          <path d="M42 38 L44 42 L48 43 L44 44 L42 48 L40 44 L36 43 L40 42 Z" fill="#2dd4bf" />
          <path d="M158 60 L160 63 L164 64 L160 65 L158 68 L156 65 L152 64 L156 63 Z" fill="#facc15" />
          <circle cx="48" cy="74" r="3" fill="#fde047" />
          <circle cx="152" cy="24" r="2" fill="#99f6e4" />

          {/* Tag "Miễn 1 BTVN" banner */}
          <g transform="translate(100, 118)">
            <rect x="-42" y="-9" width="84" height="17" rx="8.5" fill="#0d9488" stroke="#ffffff" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              MIỄN 1 BÀI TẬP
            </text>
          </g>
        </svg>
      </div>
    );
  }

  if (type === 'secret_gift') {
    return (
      <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl ${className}`}>
        <svg viewBox="0 0 200 130" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="orangeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.5" />
              <stop offset="60%" stopColor="#ea580c" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#c2410c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#c2410c" />
            </linearGradient>
            <linearGradient id="lidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#ea580c" />
            </linearGradient>
            <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#facc15" />
              <stop offset="100%" stopColor="#ca8a04" />
            </linearGradient>
          </defs>

          {/* Ambient Glow */}
          <circle cx="100" cy="65" r="58" fill="url(#orangeGlow)" />
          
          {/* Shadow */}
          <ellipse cx="100" cy="108" rx="55" ry="11" fill="#9a3412" fillOpacity="0.2" />

          {/* Bursting Light Rays */}
          <path d="M100 20 L100 8" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
          <path d="M72 30 L60 20" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
          <path d="M128 30 L140 20" stroke="#fde047" strokeWidth="2" strokeLinecap="round" />
          <path d="M55 55 L40 52" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M145 55 L160 52" stroke="#fdba74" strokeWidth="1.8" strokeLinecap="round" />

          {/* Gift Box Base */}
          <rect x="68" y="52" width="64" height="46" rx="8" fill="url(#boxGrad)" stroke="#fdba74" strokeWidth="1.5" />

          {/* Vertical Golden Ribbon on Box */}
          <rect x="94" y="52" width="12" height="46" fill="url(#goldRibbon)" />
          <line x1="94" y1="52" x2="94" y2="98" stroke="#ca8a04" strokeWidth="0.75" />
          <line x1="106" y1="52" x2="106" y2="98" stroke="#ca8a04" strokeWidth="0.75" />

          {/* Gift Box Lid */}
          <rect x="64" y="44" width="72" height="12" rx="4" fill="url(#lidGrad)" stroke="#ffedd5" strokeWidth="1.5" />
          <rect x="94" y="44" width="12" height="12" fill="url(#goldRibbon)" />

          {/* Big Golden Ribbon Bow on Top */}
          {/* Left Loop */}
          <ellipse cx="88" cy="38" rx="10" ry="6" fill="url(#goldRibbon)" stroke="#ca8a04" strokeWidth="1" transform="rotate(-25 88 38)" />
          {/* Right Loop */}
          <ellipse cx="112" cy="38" rx="10" ry="6" fill="url(#goldRibbon)" stroke="#ca8a04" strokeWidth="1" transform="rotate(25 112 38)" />
          {/* Center Ribbon Knot */}
          <circle cx="100" cy="40" r="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />

          {/* Glowing Question Mark Badge "?" */}
          <g transform="translate(100, 75)">
            <circle cx="0" cy="0" r="14" fill="#ffffff" stroke="#f97316" strokeWidth="2" />
            <text x="0" y="5" textAnchor="middle" fill="#ea580c" fontSize="16" fontWeight="900" fontFamily="sans-serif">
              ?
            </text>
          </g>

          {/* Sparkling Floating Gems & Stars */}
          <path d="M42 40 L45 46 L51 47 L46 51 L48 57 L42 53 L36 57 L38 51 L33 47 L39 46 Z" fill="#facc15" />
          <path d="M156 36 L158 41 L163 42 L159 45 L160 50 L156 47 L152 50 L153 45 L149 42 L154 41 Z" fill="#facc15" />
          <circle cx="52" cy="78" r="3" fill="#fdba74" />
          <circle cx="148" cy="76" r="3.5" fill="#fde047" />
          <circle cx="100" cy="16" r="3" fill="#ffffff" />

          {/* Tag "Quà Đặc Biệt" banner */}
          <g transform="translate(100, 118)">
            <rect x="-44" y="-9" width="88" height="17" rx="8.5" fill="#ea580c" stroke="#ffffff" strokeWidth="1.2" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              QUÀ TẶNG BÍ MẬT
            </text>
          </g>
        </svg>
      </div>
    );
  }

  // Fallback / Custom generic illustration
  const colorMap = {
    purple: { bg: 'from-purple-100 to-purple-50', iconBg: 'bg-purple-200 text-purple-700' },
    blue: { bg: 'from-blue-100 to-blue-50', iconBg: 'bg-blue-200 text-blue-700' },
    teal: { bg: 'from-teal-100 to-teal-50', iconBg: 'bg-teal-200 text-teal-700' },
    orange: { bg: 'from-orange-100 to-orange-50', iconBg: 'bg-orange-200 text-orange-700' },
    amber: { bg: 'from-amber-100 to-amber-50', iconBg: 'bg-amber-200 text-amber-700' },
    emerald: { bg: 'from-emerald-100 to-emerald-50', iconBg: 'bg-emerald-200 text-emerald-700' },
    rose: { bg: 'from-rose-100 to-rose-50', iconBg: 'bg-rose-200 text-rose-700' },
  };

  const scheme = colorMap[themeColor] || colorMap.amber;

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-tr ${scheme.bg} p-4 ${className}`}>
      <div className="text-center">
        <div className={`w-16 h-16 mx-auto rounded-2xl ${scheme.iconBg} flex items-center justify-center text-3xl shadow-md transform hover:scale-110 transition duration-200`}>
          {icon}
        </div>
      </div>
    </div>
  );
};
