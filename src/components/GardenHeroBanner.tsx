import React from 'react';
import { Sparkles, Sun, Star, Award, Heart, BookOpen, GraduationCap, Palette, Image as ImageIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { TeacherStudentsIllustration } from './TeacherStudentsIllustration';

interface GardenHeroBannerProps {
  className?: string;
  customImage?: string;
  teacherAvatarUrl?: string;
  onEditBanner?: () => void;
  onTeacherClick?: () => void;
  showEditButton?: boolean;
  bannerTitle?: string;
  bannerSubtitle?: string;
  teacherName?: string;
  classNameName?: string;
  smallMessage?: string;
}

const BUBBLE_COLOR_PALETTES = [
  { text: 'text-[#27AE60]', shadow: 'drop-shadow-[0_4px_0_#1B5E20]' },
  { text: 'text-[#FF477E]', shadow: 'drop-shadow-[0_4px_0_#A01A4A]' },
  { text: 'text-[#0096C7]', shadow: 'drop-shadow-[0_4px_0_#023E8A]' },
  { text: 'text-[#F77F00]', shadow: 'drop-shadow-[0_4px_0_#B7410E]' },
  { text: 'text-[#8B5CF6]', shadow: 'drop-shadow-[0_4px_0_#6D28D9]' },
  { text: 'text-[#E11D48]', shadow: 'drop-shadow-[0_4px_0_#9F1239]' },
  { text: 'text-[#059669]', shadow: 'drop-shadow-[0_4px_0_#065F46]' },
  { text: 'text-[#D97706]', shadow: 'drop-shadow-[0_4px_0_#92400E]' },
];

export const GardenHeroBanner: React.FC<GardenHeroBannerProps> = ({
  className = '',
  customImage,
  teacherAvatarUrl,
  onEditBanner,
  onTeacherClick,
  showEditButton = false,
  bannerTitle,
  bannerSubtitle,
  teacherName,
  classNameName,
  smallMessage,
}) => {
  const displayTitle = bannerTitle?.trim() || 'VƯỜN ƯƠM TRI THỨC';
  const displaySubtitle = bannerSubtitle?.trim() || 'Gieo điều tốt – Tích điểm hay – Hoa thành tích nở mỗi ngày!';
  
  console.log("[BANNER RENDER TITLE]", displayTitle);

  const titleWords = displayTitle.split(/\s+/);
  const subtitleParts = displaySubtitle.split(/\s*[–—\-]\s*/).filter(Boolean);

  if (customImage) {
    return (
      <div className={`relative overflow-hidden rounded-3xl shadow-lg border-2 border-white/80 ${className}`}>
        <img
          src={customImage}
          alt={displayTitle}
          referrerPolicy="no-referrer"
          className="w-full h-auto object-cover max-h-[380px] rounded-3xl"
        />
        {showEditButton && onEditBanner && (
          <button
            onClick={onEditBanner}
            className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-xs font-bold text-sky-800 shadow-md backdrop-blur-xs transition"
          >
            Đổi ảnh banner
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      id="garden-hero-banner"
      className={`relative overflow-hidden rounded-3xl shadow-xl border-3 border-white/90 select-none bg-gradient-to-b from-[#42A5F5] via-[#64B5F6] to-[#90CAF9] p-3 sm:p-5 lg:p-6 text-slate-900 ${className}`}
    >
      {/* 1. SKY & SUNSHINE BACKGROUND DECORATIONS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft Sun Ray Glow */}
        <div className="absolute -top-20 left-1/3 w-96 h-96 bg-white/30 rounded-full blur-3xl" />

        {/* Rainbow top right */}
        <div className="absolute -top-6 right-2 sm:right-12 w-32 sm:w-48 h-32 sm:h-48 border-[10px] sm:border-[14px] border-t-rose-400 border-r-amber-400 border-b-emerald-400 border-l-sky-400 rounded-full opacity-80 blur-[0.5px] rotate-45" />

        {/* Tree on Left */}
        <div className="absolute -top-12 -left-8 w-36 sm:w-52 h-44 sm:h-64 bg-gradient-to-br from-emerald-500 via-green-600 to-green-700 rounded-full opacity-95 shadow-lg" />
        <div className="absolute -bottom-4 -left-6 w-16 h-36 bg-[#8D6E63] rounded-r-xl border-r-4 border-[#5D4037]" />

        {/* Wooden Sign hanging from tree on left: HỌC TỐT - CHĂM NGOAN - TÍCH CỰC */}
        <div className="absolute top-12 left-2 sm:left-4 z-20 hidden sm:flex flex-col items-center">
          {/* Hanging Ropes */}
          <div className="flex justify-between w-16 mb-0.5">
            <div className="w-1 h-5 bg-[#D7CCC8] border border-[#8D6E63]" />
            <div className="w-1 h-5 bg-[#D7CCC8] border border-[#8D6E63]" />
          </div>
          {/* Wooden Board */}
          <div className="bg-[#FFF8E1] border-2 border-[#8D6E63] rounded-xl px-2.5 py-1.5 shadow-md text-center max-w-[105px]">
            <div className="text-[10px] font-black text-[#2E7D32] leading-tight">HỌC TỐT</div>
            <div className="text-[10px] font-black text-[#0288D1] leading-tight">CHĂM NGOAN</div>
            <div className="text-[10px] font-black text-[#E65100] leading-tight">TÍCH CỰC</div>
            <div className="text-[9px] text-rose-500 font-bold mt-0.5">❤️</div>
          </div>
        </div>

        {/* Floating Cartoon Clouds */}
        <div className="absolute top-2 left-32 sm:left-48 text-white/90 text-2xl sm:text-3xl filter drop-shadow-xs animate-bounce" style={{ animationDuration: '4.5s' }}>
          ☁️
        </div>
        <div className="absolute top-4 right-36 sm:right-64 text-white/85 text-xl sm:text-2xl filter drop-shadow-xs animate-pulse" style={{ animationDuration: '3.5s' }}>
          ☁️
        </div>

        {/* Smiling Star in sky */}
        <motion.div
          animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute top-2 left-24 sm:left-36 text-2xl sm:text-3xl filter drop-shadow-sm"
        >
          ⭐
        </motion.div>

        {/* Flying Butterfly */}
        <motion.div
          animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 3.5 }}
          className="absolute top-3 right-1/4 text-2xl sm:text-3xl filter drop-shadow-xs"
        >
          🦋
        </motion.div>
      </div>

      {/* 2. TOP BANNER CONTENT: 3D BUBBLE TITLE & RIBBONS */}
      <div className="relative z-10 text-center space-y-2 sm:space-y-3">
        {/* 3D Bubble Letters: Dynamic Title */}
        <div className="flex items-center justify-center gap-1 sm:gap-2.5 flex-wrap">
          {titleWords.map((word, index) => {
            if (word === '–' || word === '-' || word === '—') {
              return (
                <span key={index} className="font-black text-2xl sm:text-4xl text-[#FF477E] px-1 drop-shadow-sm">
                  —
                </span>
              );
            }

            const palette = BUBBLE_COLOR_PALETTES[index % BUBBLE_COLOR_PALETTES.length];
            return (
              <div key={index} className="relative group">
                <span
                  className={`inline-block font-black text-2xl sm:text-4xl lg:text-5xl tracking-wide ${palette.text} ${palette.shadow} px-2.5 sm:px-3.5 py-0.5 rounded-2xl bg-white/90 border-2 sm:border-3 border-white shadow-lg`}
                >
                  {word}
                </span>
                {index === 0 && <span className="absolute -top-1.5 -left-1.5 text-base sm:text-lg">🌿</span>}
                {index === titleWords.length - 1 && (
                  <span className="absolute -top-1 -right-1 text-sm sm:text-base">✨</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Slogan Ribbon */}
        <div className="inline-flex items-center justify-center max-w-3xl mx-auto px-4 sm:px-8 py-1.5 sm:py-2.5 rounded-full bg-gradient-to-r from-[#FFF0F5] via-[#FFFFFF] to-[#FFF0F5] border-2 sm:border-3 border-[#FF85A1] shadow-lg shadow-pink-300/40 relative">
          <div className="flex items-center gap-1.5 sm:gap-2.5 text-xs sm:text-base lg:text-lg font-black text-center flex-wrap justify-center">
            {subtitleParts.length > 1 ? (
              subtitleParts.map((part, pIdx) => {
                const colors = ['text-[#2E7D32]', 'text-[#0288D1]', 'text-[#E65100]', 'text-[#7E22CE]', 'text-[#DB2777]'];
                const color = colors[pIdx % colors.length];
                return (
                  <React.Fragment key={pIdx}>
                    {pIdx > 0 && <span className="text-[#E91E63] font-bold">—</span>}
                    <span className={color}>{part}</span>
                  </React.Fragment>
                );
              })
            ) : (
              <span className="text-[#2E7D32]">{displaySubtitle}</span>
            )}
            <span className="text-sm sm:text-base">🌸</span>
          </div>
        </div>

        {/* Sub-Ribbon on Left: Custom Small Message if set */}
        {smallMessage ? (
          <div className="flex justify-center sm:justify-start sm:pl-8">
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-[#FFE4E6] to-[#FED7AA] border-2 border-[#FDA4AF] shadow-md text-xs sm:text-sm font-black text-[#9F1239]">
              <span>🌸</span>
              <span>{smallMessage}</span>
              <span>⭐</span>
            </div>
          </div>
        ) : null}
      </div>

      {/* 3. FOREGROUND MEADOW WITH CÔ CÚC, STUDENTS & CHARACTERS */}
      <div className="relative z-10 mt-4 sm:mt-6 pt-3 bg-gradient-to-t from-[#43A047] via-[#66BB6A] to-transparent rounded-b-2xl -mx-3 -mb-3 sm:-mx-5 sm:-mb-5 p-3 sm:p-4 flex items-end justify-between gap-2 overflow-x-auto no-scrollbar">
        {/* Left Side: Smiling Book, Cute Pencil & Blue Watering Can */}
        <div className="flex items-end gap-2 shrink-0">
          {/* Cute Book Character */}
          <div className="w-10 h-11 sm:w-13 sm:h-14 bg-[#42A5F5] rounded-xl border-2 border-white shadow-md flex flex-col items-center justify-center p-1 text-white relative">
            <span className="text-base sm:text-lg">📘</span>
            <div className="flex gap-1 text-[8px] font-bold">
              <span>👀</span>
            </div>
            <div className="w-2 h-1 bg-rose-500 rounded-b-full mt-0.5" />
          </div>

          {/* Cute Pencil Character */}
          <div className="w-5 h-12 sm:w-6 sm:h-14 bg-[#F48FB1] rounded-t-full border-2 border-white shadow-md flex flex-col items-center justify-end pb-1 text-white">
            <span className="text-[9px]">✏️</span>
          </div>

          {/* Blue Watering Can */}
          <div className="flex items-center gap-1 bg-white/40 backdrop-blur-xs px-2 py-1 rounded-2xl border border-white/60 shadow-xs">
            <span className="text-2xl sm:text-3xl animate-pulse">🪣</span>
            <span className="text-[10px] sm:text-xs font-black text-white drop-shadow">Tưới mầm</span>
          </div>
        </div>

        {/* Center: Teacher (Cô Cúc) & Happy Students Illustration */}
        <div className="shrink-0 flex flex-col items-center">
          <TeacherStudentsIllustration 
            teacherAvatarUrl={teacherAvatarUrl}
            onTeacherClick={onTeacherClick}
          />
          {/* Soil & Sprouts */}
          <div className="flex items-center gap-1.5 mt-1 bg-[#5D4037]/70 px-3 py-0.5 rounded-full border border-amber-300/40">
            <span className="text-sm sm:text-base">🌱</span>
            <span className="text-xs sm:text-sm font-black text-amber-200">Vườn ươm 4A2</span>
            <span className="text-sm sm:text-base">🌿</span>
          </div>
        </div>

        {/* Right Side: Wooden Sign "Mỗi ngày một tiến bộ", Books, Graduation Cap & Giant Pink Flower */}
        <div className="flex items-end gap-2 shrink-0">
          {/* Wooden Sign: Mỗi ngày một tiến bộ */}
          <div className="hidden lg:flex flex-col items-center">
            <div className="bg-[#FFF8E1] border-2 border-[#8D6E63] rounded-xl px-2 py-1 shadow-md text-center max-w-[95px]">
              <div className="text-[9px] font-black text-[#5D4037] leading-tight">MỖI NGÀY</div>
              <div className="text-[9px] font-black text-[#2E7D32] leading-tight">MỘT TIẾN BỘ</div>
              <div className="text-[8px] text-rose-500 font-bold">❤️</div>
            </div>
            <div className="w-1.5 h-3 bg-[#8D6E63]" />
          </div>

          {/* Stack of Graduation Books & Pencils */}
          <div className="flex flex-col items-center">
            <span className="text-xl sm:text-2xl -mb-1">🎓</span>
            <div className="w-10 sm:w-12 h-3 bg-[#E53935] rounded-xs border border-white shadow-xs" />
            <div className="w-11 sm:w-13 h-3 bg-[#1E88E5] rounded-xs border border-white shadow-xs" />
            <div className="w-12 sm:w-14 h-3.5 bg-[#FDD835] rounded-xs border border-white shadow-xs" />
          </div>

          {/* Giant Smiling Pink Flower with Point Reward Medals (+10, +5, +1) */}
          <div className="flex items-center gap-1 bg-white/50 backdrop-blur-xs p-1.5 sm:p-2 rounded-2xl border-2 border-white shadow-md">
            <div className="relative">
              <span className="text-2xl sm:text-3xl animate-bounce" style={{ animationDuration: '3s' }}>
                🌸
              </span>
              <span className="absolute -bottom-1 -right-1 text-[10px]">😊</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="px-1.5 py-0.2 rounded-md bg-[#FFD95A] text-amber-950 font-black text-[9px] border border-white shadow-xs">
                +10 ⭐
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-[#58D6C7] text-teal-950 font-black text-[9px] border border-white shadow-xs">
                +5 🙋
              </span>
              <span className="px-1.5 py-0.2 rounded-md bg-[#76C7FF] text-blue-950 font-black text-[9px] border border-white shadow-xs">
                +1 🌱
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
