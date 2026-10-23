import React from 'react';
import { motion } from 'motion/react';

interface TeacherStudentsProps {
  className?: string;
  teacherAvatarUrl?: string;
  onTeacherClick?: () => void;
}

export const TeacherStudentsIllustration: React.FC<TeacherStudentsProps> = ({ 
  className = '',
  teacherAvatarUrl,
  onTeacherClick
}) => {
  return (
    <div className={`relative flex items-end justify-center gap-1 sm:gap-2 select-none ${className}`}>
      {/* 1. Student 1 (Boy on left - waving, backpack, green book) */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="flex flex-col items-center shrink-0 relative z-10"
      >
        <div className="relative">
          {/* Avatar Face with Hair */}
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FFE0BD] border-2 border-[#D4A373] flex items-center justify-center relative overflow-hidden shadow-sm">
            {/* Hair */}
            <div className="absolute top-0 w-full h-4 bg-[#3D2314] rounded-t-full" />
            {/* Eyes & Smile */}
            <div className="flex gap-2 text-[9px] sm:text-[11px] font-bold text-[#3D2314] mt-1">
              <span>👁️</span>
              <span>👁️</span>
            </div>
            {/* Rosy Cheeks & Open Smile */}
            <div className="absolute bottom-2 flex gap-3">
              <span className="w-1.5 h-1 bg-pink-300 rounded-full" />
              <span className="w-1.5 h-1 bg-pink-300 rounded-full" />
            </div>
            <div className="absolute bottom-1 w-2.5 h-1.5 bg-rose-500 rounded-b-full" />
          </div>
          {/* Waving Hand */}
          <span className="absolute -top-1 -left-2 text-xs sm:text-sm animate-pulse">👋</span>
        </div>
        {/* Uniform with Red Scarf */}
        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white rounded-t-xl border-x-2 border-t-2 border-slate-300 flex flex-col items-center pt-0.5 relative shadow-xs">
          {/* Red Scarf (Khăn quàng đỏ) */}
          <div className="w-4 h-3 bg-red-600 rounded-xs shadow-xs" />
          {/* Green Book */}
          <div className="w-5 sm:w-6 h-4 bg-emerald-500 rounded-xs border border-emerald-700 text-[8px] text-white font-bold flex items-center justify-center shadow-xs mt-1">
            📗
          </div>
        </div>
        {/* Blue Pants */}
        <div className="w-9 sm:w-11 h-4 bg-blue-900 rounded-b-md" />
      </motion.div>

      {/* 2. Student 2 (Girl with pigtails, holding pink bunny book) */}
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 3.2, delay: 0.2, ease: 'easeInOut' }}
        className="flex flex-col items-center shrink-0 relative z-10 -ml-1 sm:ml-0"
      >
        <div className="relative">
          {/* Pigtails */}
          <div className="absolute -left-2 top-2 w-3 h-3 bg-[#4A2810] rounded-full border border-pink-400" />
          <div className="absolute -right-2 top-2 w-3 h-3 bg-[#4A2810] rounded-full border border-pink-400" />
          {/* Face */}
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FFE0BD] border-2 border-[#D4A373] flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 w-full h-4 bg-[#4A2810] rounded-t-full" />
            <div className="flex gap-2 text-[9px] sm:text-[11px] font-bold text-[#4A2810] mt-1">
              <span>👀</span>
            </div>
            <div className="absolute bottom-1.5 w-2 h-1 bg-rose-500 rounded-b-full" />
          </div>
        </div>
        {/* Uniform */}
        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white rounded-t-xl border-x-2 border-t-2 border-slate-300 flex flex-col items-center pt-0.5 relative shadow-xs">
          <div className="w-4 h-3 bg-red-600 rounded-xs shadow-xs" />
          {/* Pink Notebook */}
          <div className="w-5 sm:w-6 h-4 bg-pink-400 rounded-xs border border-pink-600 text-[8px] text-white font-bold flex items-center justify-center shadow-xs mt-1">
            🐰
          </div>
        </div>
        {/* Navy Skirt */}
        <div className="w-9 sm:w-11 h-4 bg-blue-900 rounded-b-md" />
      </motion.div>

      {/* 3. Cô Cúc (Teacher in bright yellow Áo Dài with floral pattern & warm smile) */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        className="flex flex-col items-center shrink-0 relative z-20 -mx-1 sm:mx-0"
      >
        <div 
          onClick={onTeacherClick}
          className={`relative ${onTeacherClick ? 'cursor-pointer group' : ''}`}
          title={onTeacherClick ? 'Nhấp để xem/đổi ảnh giáo viên' : 'Giáo viên'}
        >
          {/* Hair with side flower clip or Actual Photo Avatar */}
          <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-[#FFE0BD] border-2 sm:border-3 border-amber-300 flex items-center justify-center relative overflow-hidden shadow-md group-hover:scale-105 transition-transform">
            {teacherAvatarUrl ? (
              <img
                src={teacherAvatarUrl}
                alt="Cô Cúc"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <>
                {/* Long black lustrous hair */}
                <div className="absolute top-0 w-full h-6 bg-[#1A1A1A] rounded-t-full" />
                <div className="absolute top-1 right-2 text-xs">🌼</div>
                {/* Gentle Eyes & Warm Smile */}
                <div className="flex gap-2.5 text-[11px] sm:text-[13px] font-bold text-[#1A1A1A] mt-2">
                  <span>✨</span>
                  <span>✨</span>
                </div>
                <div className="absolute bottom-2 flex gap-4">
                  <span className="w-2 h-1 bg-rose-300 rounded-full" />
                  <span className="w-2 h-1 bg-rose-300 rounded-full" />
                </div>
                <div className="absolute bottom-1.5 w-3 h-1.5 bg-rose-500 rounded-b-full" />
              </>
            )}
          </div>
          {/* Side flower accessory */}
          <div className="absolute -top-1 -right-1 text-xs sm:text-sm select-none pointer-events-none">
            🌸
          </div>
        </div>

        {/* Yellow Áo Dài with Golden Floral Brocade */}
        <div className="w-14 sm:w-18 h-18 sm:h-22 bg-gradient-to-b from-[#FFD95A] via-[#FFC107] to-[#FFA000] rounded-t-2xl border-x-2 border-t-2 border-amber-300 flex flex-col items-center pt-1 relative shadow-md">
          {/* Áo Dài Collar & Brocade */}
          <div className="w-4 h-2 bg-amber-200 rounded-full mb-1" />
          <span className="text-[10px] text-amber-900 font-bold opacity-80">🌸</span>
          <span className="text-[9px] text-amber-900 font-bold opacity-80">✨</span>
          <div className="absolute bottom-0 w-full h-1 bg-white/40" />
        </div>
        {/* White Áo Dài Silk Trousers */}
        <div className="w-12 sm:w-16 h-4 bg-white border-x border-slate-200 rounded-b-sm" />
      </motion.div>

      {/* 4. Student 3 (Boy in center-right holding blue book) */}
      <motion.div
        animate={{ y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 3.1, delay: 0.1, ease: 'easeInOut' }}
        className="flex flex-col items-center shrink-0 relative z-10 -mr-1 sm:mr-0"
      >
        <div className="relative">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FFE0BD] border-2 border-[#D4A373] flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 w-full h-4 bg-[#2B1700] rounded-t-full" />
            <div className="flex gap-2 text-[9px] sm:text-[11px] font-bold text-[#2B1700] mt-1">
              <span>😊</span>
            </div>
            <div className="absolute bottom-1.5 w-2 h-1 bg-rose-500 rounded-b-full" />
          </div>
        </div>
        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white rounded-t-xl border-x-2 border-t-2 border-slate-300 flex flex-col items-center pt-0.5 relative shadow-xs">
          <div className="w-4 h-3 bg-red-600 rounded-xs shadow-xs" />
          <div className="w-5 sm:w-6 h-4 bg-sky-500 rounded-xs border border-sky-700 text-[8px] text-white font-bold flex items-center justify-center shadow-xs mt-1">
            📘
          </div>
        </div>
        <div className="w-9 sm:w-11 h-4 bg-blue-900 rounded-b-md" />
      </motion.div>

      {/* 5. Student 4 (Girl with cute glasses & yellow book) */}
      <motion.div
        animate={{ y: [0, -2.5, 0] }}
        transition={{ repeat: Infinity, duration: 3.3, delay: 0.3, ease: 'easeInOut' }}
        className="flex flex-col items-center shrink-0 relative z-10"
      >
        <div className="relative">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FFE0BD] border-2 border-[#D4A373] flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 w-full h-4 bg-[#3E2723] rounded-t-full" />
            <div className="absolute top-1 right-1 text-[10px]">🌼</div>
            {/* Glasses */}
            <div className="flex gap-1 text-[10px] sm:text-[12px] font-bold text-amber-900 mt-1">
              <span>👓</span>
            </div>
          </div>
        </div>
        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white rounded-t-xl border-x-2 border-t-2 border-slate-300 flex flex-col items-center pt-0.5 relative shadow-xs">
          <div className="w-4 h-3 bg-red-600 rounded-xs shadow-xs" />
          <div className="w-5 sm:w-6 h-4 bg-amber-400 rounded-xs border border-amber-600 text-[8px] text-amber-950 font-bold flex items-center justify-center shadow-xs mt-1">
            📒
          </div>
        </div>
        <div className="w-9 sm:w-11 h-4 bg-blue-900 rounded-b-md" />
      </motion.div>

      {/* 6. Student 5 (Boy on right raising pencil) */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2.9, delay: 0.15, ease: 'easeInOut' }}
        className="hidden md:flex flex-col items-center shrink-0 relative z-10"
      >
        <div className="relative">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FFE0BD] border-2 border-[#D4A373] flex items-center justify-center relative overflow-hidden shadow-sm">
            <div className="absolute top-0 w-full h-4 bg-[#1B1B1B] rounded-t-full" />
            <div className="flex gap-2 text-[9px] sm:text-[11px] font-bold text-[#1B1B1B] mt-1">
              <span>😃</span>
            </div>
            <div className="absolute bottom-1.5 w-2 h-1 bg-rose-500 rounded-b-full" />
          </div>
          {/* Raising Pencil in hand */}
          <span className="absolute -top-2 -right-2 text-xs sm:text-sm animate-bounce">✏️</span>
        </div>
        <div className="w-10 sm:w-12 h-10 sm:h-12 bg-white rounded-t-xl border-x-2 border-t-2 border-slate-300 flex flex-col items-center pt-0.5 relative shadow-xs">
          <div className="w-4 h-3 bg-red-600 rounded-xs shadow-xs" />
        </div>
        <div className="w-9 sm:w-11 h-4 bg-blue-900 rounded-b-md" />
      </motion.div>
    </div>
  );
};
