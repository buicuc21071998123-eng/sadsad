import React, { useState } from 'react';
import { ClassConfig, Student, DailyAttendance, AttendanceRecord } from '../types';
import { 
  Sun, 
  Settings, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  BellRing,
  Database,
  Camera
} from 'lucide-react';
import { sound } from '../utils/soundEffects';
import { TeacherAvatarModal } from './TeacherAvatarModal';

interface ClassHeaderProps {
  config: ClassConfig;
  students: Student[];
  attendance: DailyAttendance;
  onOpenSettings: () => void;
  onUpdateConfig?: (config: ClassConfig) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const ClassHeader: React.FC<ClassHeaderProps> = ({
  config,
  students,
  attendance,
  onOpenSettings,
  onUpdateConfig,
  isFullscreen,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound,
}) => {
  const [showTeacherAvatarModal, setShowTeacherAvatarModal] = useState(false);

  const attendanceList = Object.values(attendance?.records || {}) as (AttendanceRecord | undefined)[];
  const lateCount = attendanceList.filter((r) => r && r.status === 'late').length;
  const absentCount = attendanceList.filter(
    (r) => r && (r.status === 'excused' || r.status === 'unexcused')
  ).length;
  const presentCount = Math.max(0, students.length - absentCount);

  const handleSaveTeacherAvatar = (newAvatarUrl?: string) => {
    if (onUpdateConfig) {
      onUpdateConfig({
        ...config,
        teacherAvatarUrl: newAvatarUrl,
      });
    }
  };

  return (
    <header id="app-class-header" className="space-y-3.5 mb-6">
      {/* Teacher Avatar Modal */}
      <TeacherAvatarModal
        isOpen={showTeacherAvatarModal}
        currentAvatarUrl={config.teacherAvatarUrl}
        teacherName={config.teacherName || 'Giáo viên'}
        teacherRole={config.teacherRole || 'Giáo viên chủ nhiệm'}
        onClose={() => setShowTeacherAvatarModal(false)}
        onSaveAvatar={handleSaveTeacherAvatar}
      />

      {/* 1. HERO GRADIENT BANNER: TÍM HỒNG GRADIENT → HỒNG PASTEL */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F472B6] text-white shadow-xl shadow-pink-300/40 border-3 border-white/80 p-4 sm:p-5">
        {/* Cute Light Cartoon Decorations with isolated overflow-hidden */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none select-none">
          <div className="absolute top-2 left-6 text-xl opacity-95 animate-bounce" style={{ animationDuration: '3s' }}>
            ☁️
          </div>
          <div className="absolute top-3 right-24 text-lg opacity-90">
            ⭐
          </div>
          <div className="absolute -bottom-1 left-28 text-base opacity-90">
            🌈
          </div>
          <div className="absolute top-2 right-44 text-base opacity-90">
            🍬
          </div>
          <div className="absolute bottom-2 right-6 text-xl opacity-95">
            🌸
          </div>
          <div className="absolute bottom-2 left-8 text-base opacity-90">
            ✏️
          </div>
          <div className="absolute top-3 left-1/3 text-sm opacity-85">
            ✨
          </div>
        </div>

        {/* Top Control Action Bar inside Banner */}
        <div className="relative z-30 flex flex-wrap items-center justify-between gap-2.5 pb-3 mb-3 border-b border-white/25">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-white/25 backdrop-blur-md border border-white/40 text-white shadow-xs">
              <Sun className="w-3.5 h-3.5 text-yellow-200 animate-spin-slow" />
              Năm học {config.schoolYear || '2026 - 2027'} • {config.schoolName || 'Trường Tiểu Học'}
            </span>

            {/* Offline-First Storage Status Pill */}
            <span
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/25 border border-white/35 text-white backdrop-blur-md"
              title="Dữ liệu được lưu tự động trên thiết bị (Offline-First)"
            >
              <Database className="w-3.5 h-3.5 text-pink-100" />
              <span>Đã lưu máy</span>
            </span>
          </div>

          {/* Right Action Bar: Quick Utility Buttons */}
          <div className="flex items-center gap-2">
            {/* Attention Bell */}
            <button
              id="btn-attention-bell"
              type="button"
              onClick={() => sound.playChimeBell()}
              title="Gõ chuông trật tự lớp học"
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-black bg-white/25 hover:bg-white/35 active:scale-95 transition rounded-2xl border border-white/40 text-white shadow-xs cursor-pointer"
            >
              <BellRing className="w-3.5 h-3.5 text-yellow-200" />
              <span className="hidden md:inline">Chuông</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              type="button"
              onClick={onToggleSound}
              title={soundEnabled ? 'Tắt âm thanh thông báo' : 'Bật âm thanh'}
              className="p-2 rounded-2xl bg-white/25 hover:bg-white/35 active:scale-95 transition text-white border border-white/40 shadow-xs cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-yellow-200" /> : <VolumeX className="w-4 h-4 text-rose-200" />}
            </button>

            {/* Fullscreen Toggle */}
            <button
              id="btn-toggle-fullscreen"
              type="button"
              onClick={onToggleFullscreen}
              title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình chiếu TV (F11)'}
              className="p-2 rounded-2xl bg-white/25 hover:bg-white/35 active:scale-95 transition text-white border border-white/40 shadow-xs cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Settings Modal Button */}
            <button
              id="btn-open-settings"
              type="button"
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-black candy-btn-gold rounded-2xl border border-white/80 active:scale-95 shadow-md cursor-pointer"
            >
              <Settings className="w-4 h-4 text-[#581C87]" />
              <span>Cấu hình</span>
            </button>
          </div>
        </div>

        {/* Main Title Center Content: 3D Cartoon Bubble Style Banner */}
        <div className="relative z-10 text-center py-2 sm:py-3 space-y-2.5">
          {/* Class Tag & Teacher */}
          <div className="flex items-center justify-center gap-2 flex-wrap text-xs sm:text-sm font-black">
            <span className="px-4 py-1 rounded-full bg-white/30 backdrop-blur-md border border-white/50 text-white shadow-xs">
              🏫 {config.className || 'Lớp học mới'}
            </span>
            <button
              type="button"
              onClick={() => setShowTeacherAvatarModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-white/30 hover:bg-white/40 backdrop-blur-md border border-white/50 text-white shadow-xs transition active:scale-95 cursor-pointer"
              title="Nhấp để tải hoặc đổi ảnh giáo viên"
            >
              <span>👩‍🏫 GVCN: <strong>{config.teacherName || 'Chưa thiết lập'}</strong></span>
              <Camera className="w-3.5 h-3.5 text-yellow-200" />
            </button>
          </div>

          {/* 3D Colorful Bubble Letters: Dynamic Title */}
          {(() => {
            const displayTitle = config.bannerTitle?.trim() || 'VƯỜN ƯƠM TRI THỨC';
            const displaySubtitle = config.bannerSubtitle?.trim() || 'Gieo điều tốt – Tích điểm hay – Hoa thành tích nở mỗi ngày!';
            const titleWords = displayTitle.split(/\s+/);
            const subtitleParts = displaySubtitle.split(/\s*[–—\-]\s*/).filter(Boolean);

            const BUBBLE_PALETTES = [
              { text: 'text-[#16A34A]', shadow: 'drop-shadow-[0_3px_0_#15803D]' },
              { text: 'text-[#EC4899]', shadow: 'drop-shadow-[0_3px_0_#9D174D]' },
              { text: 'text-[#8B5CF6]', shadow: 'drop-shadow-[0_3px_0_#6D28D9]' },
              { text: 'text-[#FB923C]', shadow: 'drop-shadow-[0_3px_0_#C2410C]' },
              { text: 'text-[#0284C7]', shadow: 'drop-shadow-[0_3px_0_#0369A1]' },
              { text: 'text-[#E11D48]', shadow: 'drop-shadow-[0_3px_0_#9F1239]' },
            ];

            return (
              <>
                <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap py-1">
                  {titleWords.map((word, idx) => {
                    if (word === '–' || word === '-' || word === '—') {
                      return (
                        <span key={idx} className="font-black text-2xl sm:text-4xl text-[#EC4899] px-1">
                          —
                        </span>
                      );
                    }
                    const palette = BUBBLE_PALETTES[idx % BUBBLE_PALETTES.length];
                    return (
                      <span
                        key={idx}
                        className={`font-black text-2xl sm:text-4xl lg:text-5xl tracking-wide ${palette.text} ${palette.shadow} px-3.5 py-0.5 rounded-2xl bg-white/95 border-2 border-white shadow-md`}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>

                {/* Slogan Ribbon */}
                <div className="flex flex-col items-center gap-2">
                  <div className="inline-flex items-center justify-center max-w-2xl mx-auto px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-[#FFF0F5] via-[#FFFFFF] to-[#FFF0F5] border-2 border-[#F9A8D4] shadow-md shadow-pink-200/60">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm md:text-base font-black text-center flex-wrap justify-center">
                      {subtitleParts.length > 1 ? (
                        subtitleParts.map((part, pIdx) => {
                          const colors = ['text-[#16A34A]', 'text-[#9333EA]', 'text-[#EA580C]', 'text-[#0284C7]', 'text-[#EC4899]'];
                          const color = colors[pIdx % colors.length];
                          return (
                            <React.Fragment key={pIdx}>
                              <span className={color}>{part.trim()}</span>
                              {pIdx < subtitleParts.length - 1 && (
                                <span className="text-[#F472B6] font-extrabold">•</span>
                              )}
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <span className="text-[#9333EA]">{displaySubtitle}</span>
                      )}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>

        {/* Bottom Attendance & Point Quick Info Bar */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 mt-2 border-t border-white/20 text-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-2 border border-white/30">
            <span className="text-xs text-white/90 font-bold block">Tổng sĩ số</span>
            <span className="text-lg sm:text-xl font-black text-white">{students.length} học sinh</span>
          </div>
          <div className="bg-emerald-500/25 backdrop-blur-sm rounded-2xl p-2 border border-emerald-200/40">
            <span className="text-xs text-emerald-100 font-bold block">Hiện diện</span>
            <span className="text-lg sm:text-xl font-black text-white">{presentCount} bạn</span>
          </div>
          <div className="bg-amber-500/25 backdrop-blur-sm rounded-2xl p-2 border border-amber-200/40">
            <span className="text-xs text-amber-100 font-bold block">Đi muộn</span>
            <span className="text-lg sm:text-xl font-black text-white">{lateCount} bạn</span>
          </div>
          <div className="bg-rose-500/25 backdrop-blur-sm rounded-2xl p-2 border border-rose-200/40">
            <span className="text-xs text-rose-100 font-bold block">Vắng mặt</span>
            <span className="text-lg sm:text-xl font-black text-white">{absentCount} bạn</span>
          </div>
        </div>
      </div>
    </header>
  );
};
