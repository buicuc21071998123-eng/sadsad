import React from 'react';
import { Camera, Sparkles, Star, Flower2, Heart } from 'lucide-react';

interface TeacherAvatarProps {
  avatarUrl?: string;
  teacherName?: string;
  teacherRole?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'responsive';
  shape?: 'circle' | 'rounded';
  showBadge?: boolean;
  showCameraBtn?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TeacherAvatar: React.FC<TeacherAvatarProps> = ({
  avatarUrl,
  teacherName = 'Cô Bùi Thị Cúc',
  teacherRole = 'Giáo viên chủ nhiệm',
  size = 'responsive',
  shape = 'circle',
  showBadge = true,
  showCameraBtn = true,
  onClick,
  className = '',
}) => {
  // Sizing mapping:
  // responsive: mobile ~96px (w-24 h-24), sm ~112px (sm:w-28 sm:h-28), md/lg ~132-144px (md:w-32 md:h-32 lg:w-36 lg:h-36)
  const sizeClasses = {
    xs: 'w-10 h-10',
    sm: 'w-16 h-16',
    md: 'w-24 h-24 sm:w-28 sm:h-28',
    lg: 'w-32 h-32 sm:w-36 sm:h-36',
    responsive: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36',
  }[size];

  const roundedClasses = shape === 'circle' ? 'rounded-full' : 'rounded-3xl';
  const innerRoundedClasses = shape === 'circle' ? 'rounded-full' : 'rounded-[22px]';

  return (
    <div
      onClick={onClick}
      className={`relative inline-block select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
      title={onClick ? 'Nhấp để thay đổi hoặc tải ảnh giáo viên' : teacherName}
    >
      {/* Outer Bright Gradient Border Ring & Soft Shadow */}
      <div
        className={`${sizeClasses} ${roundedClasses} p-1 sm:p-1.5 bg-gradient-to-tr from-[#A855F7] via-[#EC4899] to-[#FACC15] shadow-lg shadow-pink-300/35 group-hover:shadow-xl group-hover:shadow-pink-400/50 transition-all duration-300 group-hover:scale-[1.03]`}
      >
        {/* Inner Container with White Border */}
        <div
          className={`w-full h-full ${innerRoundedClasses} overflow-hidden bg-white border-2 sm:border-3 border-white relative shadow-inner flex items-center justify-center`}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={teacherName}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            /* Default Cute Cartoon Teacher Avatar */
            <div className="w-full h-full bg-gradient-to-br from-purple-100 via-pink-100 to-amber-100 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Soft Background Rays */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/60 via-transparent to-transparent pointer-events-none" />
              
              {/* Cute Teacher Character Graphic */}
              <div className="relative flex flex-col items-center justify-center">
                <div className="text-3xl sm:text-4xl md:text-5xl filter drop-shadow-xs animate-pulse" style={{ animationDuration: '4s' }}>
                  👩‍🏫
                </div>
              </div>
            </div>
          )}

          {/* Hover Camera Overlay if clickable */}
          {onClick && showCameraBtn && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white gap-0.5 z-10">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-200" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white drop-shadow-sm px-1.5 py-0.5 rounded-full bg-black/30">
                Thay ảnh
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Decorative Star / Flower Badge */}
      {showBadge && (
        <>
          <div
            className="absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md flex items-center justify-center text-[10px] sm:text-xs font-black select-none pointer-events-none group-hover:rotate-12 transition-transform"
            title="Giáo viên tâm huyết"
          >
            ⭐
          </div>
          <div
            className="absolute -bottom-1 -left-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 border-2 border-white shadow-md flex items-center justify-center text-[10px] sm:text-xs font-black select-none pointer-events-none group-hover:-rotate-12 transition-transform"
            title="Lớp học hạnh phúc"
          >
            🌸
          </div>
        </>
      )}

      {/* Mini Camera Button Icon on bottom-right */}
      {showCameraBtn && (
        <div
          className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-purple-700 border-2 border-purple-300 shadow-md flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors"
          title="Tải / Đổi ảnh đại diện"
        >
          <Camera className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </div>
      )}
    </div>
  );
};
