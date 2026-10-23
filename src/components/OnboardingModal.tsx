import React, { useState, useEffect, useRef } from 'react';
import { ClassConfig } from '../types';
import { emptyClassConfig } from '../data/initialData';
import { compressTeacherAvatar, compressBannerImage } from '../utils/imageUtils';
import { sound } from '../utils/soundEffects';
import { TeacherAvatar } from './TeacherAvatar';
import { 
  Sparkles, 
  Camera, 
  Upload, 
  Trash2, 
  School, 
  User, 
  Calendar, 
  Heart, 
  Award, 
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  currentConfig: ClassConfig;
  onComplete: (updatedConfig: ClassConfig) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  currentConfig,
  onComplete,
}) => {
  const [formData, setFormData] = useState<ClassConfig>(() => ({
    ...emptyClassConfig,
    ...currentConfig,
    className: currentConfig.className || '',
    teacherName: currentConfig.teacherName || '',
    teacherRole: currentConfig.teacherRole || 'Giáo viên chủ nhiệm',
    schoolYear: currentConfig.schoolYear || '',
    monthlyTheme: currentConfig.monthlyTheme || '',
    smallMessage: currentConfig.smallMessage || '',
    schoolName: currentConfig.schoolName || '',
  }));

  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentConfig.teacherAvatarUrl);
  const [bannerPreview, setBannerPreview] = useState<string | undefined>(currentConfig.customBannerUrl);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState(false);
  const [isProcessingBanner, setIsProcessingBanner] = useState(false);

  // Sync state when modal opens or currentConfig changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        ...emptyClassConfig,
        ...currentConfig,
        className: currentConfig.className || '',
        teacherName: currentConfig.teacherName || '',
        teacherRole: currentConfig.teacherRole || 'Giáo viên chủ nhiệm',
        schoolYear: currentConfig.schoolYear || '',
        monthlyTheme: currentConfig.monthlyTheme || '',
        smallMessage: currentConfig.smallMessage || '',
        schoolName: currentConfig.schoolName || '',
      });
      setAvatarPreview(currentConfig.teacherAvatarUrl);
      setBannerPreview(currentConfig.customBannerUrl);
    }
  }, [isOpen, currentConfig]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Avatar Upload
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingAvatar(true);
      const compressed = await compressTeacherAvatar(file);
      setAvatarPreview(compressed);
      setFormData((prev) => ({ ...prev, teacherAvatarUrl: compressed }));
      sound.playReward();
    } catch (err) {
      console.error('Failed to compress avatar:', err);
      alert('Không thể xử lý ảnh này. Thầy/Cô vui lòng chọn ảnh JPG hoặc PNG khác.');
    } finally {
      setIsProcessingAvatar(false);
    }
  };

  // Handle Banner Upload
  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingBanner(true);
      const compressed = await compressBannerImage(file);
      setBannerPreview(compressed);
      setFormData((prev) => ({ ...prev, customBannerUrl: compressed }));
      sound.playReward();
    } catch (err) {
      console.error('Failed to compress banner:', err);
      alert('Không thể xử lý ảnh banner này. Thầy/Cô vui lòng chọn ảnh khác.');
    } finally {
      setIsProcessingBanner(false);
    }
  };

  const handleFinish = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.teacherName.trim() || !formData.className.trim()) {
      alert('Thầy/Cô vui lòng nhập Tên giáo viên và Tên lớp để tiếp tục!');
      return;
    }
    sound.playLevelUp();
    onComplete({
      ...formData,
      teacherAvatarUrl: avatarPreview,
      customBannerUrl: bannerPreview,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-3 border-pink-200 animate-scaleUp flex flex-col max-h-[94vh] my-auto">
        {/* 1. Welcoming Header */}
        <div className="bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F472B6] text-white p-5 sm:p-6 relative overflow-hidden border-b-2 border-white/30">
          {/* Subtle Sparkle Decors */}
          <div className="absolute -top-6 -right-6 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute bottom-0 right-12 text-5xl opacity-20 pointer-events-none select-none">
            🏫
          </div>

          <div className="relative z-10 space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/40 text-xs font-black text-yellow-200">
              <span>🌸 VƯỜN ƯƠM TRI THỨC</span>
              <span>•</span>
              <span>THIẾT LẬP LỚP HỌC</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>👋 CHÀO MỪNG THẦY/CÔ!</span>
            </h2>
            <p className="text-xs sm:text-sm text-pink-100 font-bold">
              Hãy thiết lập lớp học mới để bắt đầu.
            </p>
          </div>
        </div>

        {/* 2. Scrollable Body Content */}
        <form onSubmit={handleFinish} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* A. Teacher Profile & Photo Setup */}
          <div className="bg-gradient-to-r from-purple-50/70 via-pink-50/50 to-purple-50/70 p-4 sm:p-5 rounded-3xl border-2 border-purple-100/80 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-purple-900 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span>1. Thông tin Giáo Viên & Ảnh Đại Diện</span>
              </h3>
              <span className="text-[11px] font-bold text-purple-600 bg-white px-2.5 py-0.5 rounded-full border border-purple-200 shadow-2xs">
                Tùy chỉnh riêng
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
              {/* Teacher Avatar Display & Camera Button */}
              <div className="shrink-0 flex flex-col items-center">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <TeacherAvatar
                  avatarUrl={avatarPreview}
                  teacherName={formData.teacherName || 'Giáo viên'}
                  teacherRole={formData.teacherRole || 'Giáo viên chủ nhiệm'}
                  size="responsive"
                  shape="circle"
                  showBadge={true}
                  showCameraBtn={true}
                  onClick={() => avatarInputRef.current?.click()}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-black shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Camera className="w-3 h-3 text-yellow-200" />
                  <span>{avatarPreview ? 'Đổi ảnh' : '📷 Tải ảnh'}</span>
                </button>
              </div>

              {/* Name & Role Inputs */}
              <div className="flex-1 space-y-3 w-full">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và tên Giáo viên <span className="text-rose-500">*</span>:
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    placeholder="VD: Cô Bùi Thị Cúc, Thầy Nguyễn Văn A..."
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-purple-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-purple-500 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Chức danh:</label>
                    <input
                      type="text"
                      value={formData.teacherRole}
                      onChange={(e) => setFormData({ ...formData, teacherRole: e.target.value })}
                      placeholder="VD: Giáo viên chủ nhiệm"
                      className="w-full px-3.5 py-2 bg-white border-2 border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-400 shadow-2xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên trường:</label>
                    <input
                      type="text"
                      value={formData.schoolName}
                      onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                      placeholder="VD: Trường Tiểu Học..."
                      className="w-full px-3.5 py-2 bg-white border-2 border-purple-100 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-400 shadow-2xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* B. Class & School Year Setup */}
          <div className="bg-gradient-to-r from-pink-50/70 via-amber-50/40 to-pink-50/70 p-4 sm:p-5 rounded-3xl border-2 border-pink-100/80 space-y-4">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-pink-900 flex items-center gap-2">
              <School className="w-4 h-4 text-pink-600" />
              <span>2. Thông tin Lớp Học & Năm Học</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tên lớp <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="VD: Lớp 4A2, Lớp 5B, Lớp 3C..."
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-pink-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-pink-500 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Năm học:
                </label>
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                  placeholder="VD: 2026 - 2027"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-pink-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-pink-500 shadow-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chủ điểm tháng:</label>
                <input
                  type="text"
                  value={formData.monthlyTheme}
                  onChange={(e) => setFormData({ ...formData, monthlyTheme: e.target.value })}
                  placeholder="VD: Học Tốt – Chăm Ngoan – Tích Cực"
                  className="w-full px-3.5 py-2 bg-white border-2 border-pink-100 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-pink-400 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thông điệp lớp:</label>
                <input
                  type="text"
                  value={formData.smallMessage}
                  onChange={(e) => setFormData({ ...formData, smallMessage: e.target.value })}
                  placeholder="VD: Mỗi ngày một tiến bộ ❤️"
                  className="w-full px-3.5 py-2 bg-white border-2 border-pink-100 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-pink-400 shadow-2xs"
                />
              </div>
            </div>
          </div>

          {/* C. Banner Upload / Customization */}
          <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border-2 border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-purple-600" />
                <span>3. Tải Banner Lớp Học (Tùy Chọn)</span>
              </h3>
              {bannerPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setBannerPreview(undefined);
                    setFormData((prev) => ({ ...prev, customBannerUrl: undefined }));
                    sound.playClick();
                  }}
                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Xóa banner ảnh</span>
                </button>
              )}
            </div>

            <input
              ref={bannerInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={handleBannerChange}
              className="hidden"
            />

            {bannerPreview ? (
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-200 h-28 sm:h-32 group shadow-inner">
                <img
                  src={bannerPreview}
                  alt="Banner lớp học"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold shadow-md cursor-pointer"
                  >
                    Thay ảnh khác
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => bannerInputRef.current?.click()}
                className="border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/60 rounded-2xl p-4 text-center cursor-pointer transition flex flex-col items-center justify-center gap-1.5"
              >
                <Upload className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-black text-purple-900">
                  {isProcessingBanner ? 'Đang nén ảnh banner...' : 'Nhấp để tải ảnh banner riêng (tùy chọn)'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  Hoặc để trống để sử dụng Banner Vườn Ươm Tri Thức mặc định
                </span>
              </div>
            )}
          </div>

          {/* D. Privacy Notice */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold">Lưu trữ an toàn trên thiết bị riêng:</span>
              <p className="text-[11px] text-emerald-700">
                Toàn bộ thông tin giáo viên, danh sách học sinh, điểm số và dữ liệu lớp được lưu trên thiết bị của Thầy/Cô. Thầy/Cô có thể chỉnh sửa lại bất kỳ lúc nào trong phần <strong>Cài đặt</strong>.
              </p>
            </div>
          </div>

          {/* 3. Action Footer Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl candy-btn-purple text-white text-sm sm:text-base font-black shadow-lg flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-yellow-200" />
              <span>✨ BẮT ĐẦU SỬ DỤNG</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
