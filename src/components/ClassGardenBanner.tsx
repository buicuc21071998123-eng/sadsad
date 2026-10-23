import React, { useRef, useState } from 'react';
import { ClassConfig, Student, DailyAttendance } from '../types';
import { compressImage } from '../utils/imageUtils';
import { sound } from '../utils/soundEffects';
import { 
  Sparkles, 
  Upload, 
  Image as ImageIcon, 
  RefreshCw, 
  Sun, 
  Heart, 
  BookOpen, 
  Award, 
  GraduationCap, 
  X,
  Volume2,
  VolumeX,
  BellRing,
  CheckCircle2
} from 'lucide-react';

interface ClassGardenBannerProps {
  config: ClassConfig;
  students?: Student[];
  attendance?: DailyAttendance;
  onUpdateConfig: (newConfig: ClassConfig) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  classNameCustom?: string;
}

export const ClassGardenBanner: React.FC<ClassGardenBannerProps> = ({
  config,
  students = [],
  attendance,
  onUpdateConfig,
  soundEnabled = true,
  onToggleSound,
  classNameCustom = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [bannerMode, setBannerMode] = useState<'custom_image' | 'illustrated_banner'>(
    config.bannerBgImage ? 'custom_image' : 'illustrated_banner'
  );

  // Handle image upload with auto compression (up to 1920x600 for sharp banner)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const base64 = await compressImage(file, 1920, 640, 0.9);
      onUpdateConfig({
        ...config,
        bannerBgImage: base64,
      });
      setBannerMode('custom_image');
      sound.playReward();
      setShowUploadModal(false);
    } catch (err) {
      alert('Không thể tải ảnh banner. Vui lòng chọn tệp hình ảnh hợp lệ (PNG, JPG, WebP).');
    } finally {
      setIsUploading(false);
    }
  };

  const handleResetToDefault = () => {
    onUpdateConfig({
      ...config,
      bannerBgImage: undefined,
    });
    setBannerMode('illustrated_banner');
    sound.playClick();
    setShowUploadModal(false);
  };

  return (
    <div
      id="class-garden-banner-wrapper"
      className={`relative w-full rounded-3xl overflow-hidden shadow-xl border border-emerald-300/40 select-none group transition-all duration-300 ${classNameCustom}`}
    >
      {/* CASE 1: USER HAS UPLOADED A CUSTOM BANNER IMAGE */}
      {config.bannerBgImage && bannerMode === 'custom_image' ? (
        <div className="relative w-full aspect-[3.2/1] min-h-[220px] max-h-[380px] overflow-hidden bg-sky-200">
          <img
            src={config.bannerBgImage}
            alt="Banner Vườn Ươm Tri Thức"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center"
          />

          {/* Quick Overlay Controls on Hover */}
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              title="Thay đổi ảnh Banner"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Đổi ảnh Banner</span>
            </button>

            <button
              type="button"
              onClick={handleResetToDefault}
              className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs transition"
              title="Chuyển về Banner Minh Họa Mặc Định"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* CASE 2: HIGH-FIDELITY FAITHFUL ILLUSTRATED BANNER (Matching the user's uploaded banner art) */
        <div className="relative w-full overflow-hidden bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-200 aspect-[3.2/1] min-h-[240px] max-h-[380px]">
          {/* 1. Sky & Sun & Rainbow */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Sun Glow */}
            <div className="absolute -top-10 left-1/4 w-72 h-72 rounded-full bg-amber-200/50 blur-3xl" />
            
            {/* Cute Fluffy Clouds */}
            <div className="absolute top-3 left-12 w-28 h-10 bg-white/80 rounded-full blur-xs opacity-90" />
            <div className="absolute top-6 left-28 w-20 h-8 bg-white/70 rounded-full blur-xs" />
            <div className="absolute top-4 right-32 w-36 h-12 bg-white/80 rounded-full blur-xs opacity-90" />
            <div className="absolute top-8 right-16 w-24 h-9 bg-white/70 rounded-full blur-xs" />

            {/* Rainbow Arc (Top Right) */}
            <div className="absolute -top-16 -right-10 w-64 h-64 rounded-full border-[14px] border-t-rose-400 border-r-amber-400 border-b-emerald-400 border-l-sky-400 opacity-80 blur-xs rotate-12" />

            {/* Sparkles & Star Accents */}
            <div className="absolute top-8 left-[35%] text-amber-300 animate-pulse text-lg">✨</div>
            <div className="absolute top-12 left-[48%] text-amber-200 animate-pulse text-sm">⭐</div>
            <div className="absolute top-6 right-[40%] text-amber-300 animate-pulse text-base">✨</div>
            <div className="absolute top-10 right-[25%] text-purple-400 animate-bounce text-xl">🦋</div>
          </div>

          {/* 2. Top-Left Tree & Hanging Wooden Board */}
          <div className="absolute top-0 left-0 w-36 sm:w-48 md:w-56 pointer-events-none z-10">
            {/* Tree Branch */}
            <div className="w-24 sm:w-32 h-16 sm:h-20 bg-emerald-600 rounded-br-full shadow-inner opacity-90 relative">
              <div className="absolute top-1 left-2 w-8 h-8 rounded-full bg-emerald-500" />
              <div className="absolute top-4 left-10 w-12 h-10 rounded-full bg-emerald-400/90" />
            </div>

            {/* Hanging Wooden Sign ("HỌC TỐT - CHĂM NGOAN - TÍCH CỰC") */}
            <div className="absolute top-10 left-3 sm:left-5 bg-gradient-to-b from-amber-100 to-amber-200 border-2 border-amber-600/80 rounded-xl p-1.5 sm:p-2 shadow-lg text-center rotate-[-4deg] w-24 sm:w-32">
              <div className="text-[9px] sm:text-[11px] font-black text-emerald-800 tracking-tight leading-tight uppercase">
                HỌC TỐT
              </div>
              <div className="text-[9px] sm:text-[11px] font-black text-sky-800 tracking-tight leading-tight uppercase">
                CHĂM NGOAN
              </div>
              <div className="text-[9px] sm:text-[11px] font-black text-rose-700 tracking-tight leading-tight uppercase">
                TÍCH CỰC
              </div>
              <div className="text-[10px] text-rose-500 mt-0.5">💖</div>
            </div>
          </div>

          {/* 3. Center Hero Title: 3D Bubble Text */}
          {(() => {
            const displayTitle = config.bannerTitle?.trim() || 'VƯỜN ƯƠM TRI THỨC';
            const displaySubtitle = config.bannerSubtitle?.trim() || 'Gieo điều tốt – Tích điểm hay – Hoa thành tích nở mỗi ngày!';
            console.log("[BANNER RENDER TITLE]", displayTitle);
            const titleWords = displayTitle.split(/\s+/);
            const subtitleParts = displaySubtitle.split(/\s*[–—\-]\s*/).filter(Boolean);

            const BUBBLE_STYLES = [
              { color: 'text-emerald-500', stroke: '#15803d' },
              { color: 'text-pink-500', stroke: '#be185d' },
              { color: 'text-sky-500', stroke: '#0369a1' },
              { color: 'text-amber-500', stroke: '#b45309' },
              { color: 'text-purple-500', stroke: '#6d28d9' },
              { color: 'text-rose-500', stroke: '#9f1239' },
            ];

            return (
              <div className="absolute inset-x-0 top-3 sm:top-5 flex flex-col items-center justify-center z-10 px-4">
                <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-wrap drop-shadow-lg">
                  {titleWords.map((word, idx) => {
                    if (word === '–' || word === '-' || word === '—') {
                      return (
                        <span key={idx} className="font-black text-2xl sm:text-4xl text-pink-500 px-1">
                          —
                        </span>
                      );
                    }
                    const style = BUBBLE_STYLES[idx % BUBBLE_STYLES.length];
                    return (
                      <span
                        key={idx}
                        className={`font-black text-2xl sm:text-4xl md:text-5xl lg:text-6xl ${style.color} tracking-wider`}
                        style={{
                          WebkitTextStroke: '2px #ffffff',
                          textShadow: `0 4px 0 ${style.stroke}, 0 6px 12px rgba(0,0,0,0.25)`,
                          fontFamily: '"Baloo 2", "Nunito", "Arial Black", sans-serif',
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </div>

                {/* Pink Banner Ribbon with Slogan */}
                <div className="relative mt-2 sm:mt-3 px-4 sm:px-8 py-1 sm:py-2 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center gap-2 max-w-[90%]">
                  <span className="text-[11px] sm:text-sm md:text-base font-black tracking-wide text-center drop-shadow-sm">
                    {subtitleParts.length > 1 ? (
                      subtitleParts.map((part, pIdx) => {
                        const colors = ['text-emerald-100', 'text-sky-100', 'text-amber-100', 'text-purple-100', 'text-rose-100'];
                        const color = colors[pIdx % colors.length];
                        return (
                          <React.Fragment key={pIdx}>
                            {pIdx > 0 && <span> – </span>}
                            <span className={color}>{part}</span>
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <span>{displaySubtitle}</span>
                    )}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* 4. Bottom Garden Ground with Soil Mounds, Sprouts & Cute Characters */}
          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-3 sm:px-6 pb-2">
            {/* Left: Cute Book Character & Pencil */}
            <div className="flex items-end gap-1 sm:gap-2 mb-1">
              <div className="w-10 h-12 sm:w-14 sm:h-16 bg-sky-500 rounded-lg shadow-md border-2 border-white flex flex-col items-center justify-center text-white relative">
                <div className="flex gap-1 text-[10px]">
                  <span>👀</span>
                </div>
                <div className="text-[8px] sm:text-[10px] font-bold mt-0.5">Tri thức</div>
                <div className="absolute -top-1.5 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-[8px] flex items-center justify-center">⭐</div>
              </div>

              {/* Pink Pencil */}
              <div className="w-3 h-10 sm:w-4 sm:h-14 bg-pink-400 rounded-t-sm border border-white relative shadow-xs" />
            </div>

            {/* Center-Left: Watering Can & Soil Sprouts */}
            <div className="hidden sm:flex items-end gap-3 mb-1">
              <div className="text-2xl sm:text-3xl" title="Bình tưới cây chăm chỉ">
                🫗🌱
              </div>

              {/* Growing Seedlings in Soil */}
              <div className="flex items-end gap-3 bg-amber-900/30 px-3 py-1 rounded-t-2xl border-t border-amber-700/40">
                <div className="text-center">
                  <div className="text-base sm:text-lg animate-bounce">🌱</div>
                  <div className="text-[9px] font-bold text-amber-900">Mầm tốt</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg animate-pulse">🌿</div>
                  <div className="text-[9px] font-bold text-amber-900">Tiến bộ</div>
                </div>
                <div className="text-center">
                  <div className="text-base sm:text-lg animate-bounce">🌻</div>
                  <div className="text-[9px] font-bold text-amber-900">Nở hoa</div>
                </div>
              </div>
            </div>

            {/* Right Sign: "MỖI NGÀY MỘT TIẾN BỘ" */}
            <div className="hidden md:flex flex-col items-center mb-1">
              <div className="bg-amber-100 border border-amber-600 rounded-lg px-2.5 py-1 text-center shadow-md">
                <div className="text-[9px] font-extrabold text-amber-900">MỖI NGÀY</div>
                <div className="text-[9px] font-black text-rose-700">MỘT TIẾN BỘ ❤️</div>
              </div>
              <div className="w-1.5 h-3 bg-amber-800" />
            </div>

            {/* Right: Book Stack with Graduation Cap, Medal Flowers */}
            <div className="flex items-end gap-2 mb-1">
              <div className="flex flex-col items-center">
                <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-900 drop-shadow-md" />
                <div className="w-10 sm:w-14 h-3 bg-rose-500 rounded-sm border border-white" />
                <div className="w-12 sm:w-16 h-3 bg-sky-500 rounded-sm border border-white" />
                <div className="w-14 sm:w-18 h-3.5 bg-amber-500 rounded-sm border border-white" />
              </div>

              {/* Smiling Happy Flower Character with Medals */}
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pink-400 border-3 border-white shadow-lg flex items-center justify-center text-center">
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-amber-300 flex items-center justify-center text-sm sm:text-base">
                    😊
                  </div>
                </div>
                {/* +10 / +5 / +1 Badges */}
                <div className="absolute -top-2 -left-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black shadow-xs border border-white">
                  +10
                </div>
                <div className="absolute -top-1 -right-2 px-1.5 py-0.5 rounded-full bg-sky-500 text-white text-[9px] font-black shadow-xs border border-white">
                  +5
                </div>
              </div>
            </div>
          </div>

          {/* Grass Floor Decor */}
          <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-emerald-600 via-emerald-500 to-transparent pointer-events-none" />

          {/* Top Quick Actions Bar */}
          <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 bg-white/85 hover:bg-white text-indigo-950 rounded-xl text-xs font-bold shadow-md border border-white/40 transition active:scale-95 flex items-center gap-1.5 backdrop-blur-sm"
              title="Đổi hoặc Tải ảnh Banner Lớp học"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Tải ảnh Banner lên</span>
            </button>
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-indigo-600" />
                <span>Cài Đặt Ảnh Banner Lớp Học</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Thầy cô có thể chọn tệp hình ảnh banner đã thiết kế sẵn từ máy tính (như tệp ảnh <em>Vườn Ươm Tri Thức</em>) để hiển thị sắc nét trên đầu trang.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-3">
              <ImageIcon className="w-10 h-10 text-indigo-400 mx-auto" />
              <div className="text-xs font-bold text-slate-700">
                Tải ảnh banner từ máy tính
              </div>
              <p className="text-[11px] text-slate-400">
                Hỗ trợ ảnh PNG, JPG, WebP (Tự động nén tối ưu độ nét 1920px)
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 disabled:opacity-50 inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Đang nén và xử lý...' : 'Chọn tệp hình ảnh'}</span>
              </button>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 underline"
              >
                Dùng banner minh họa mặc định
              </button>

              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
