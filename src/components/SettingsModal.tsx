import React, { useState, useEffect } from 'react';
import { ClassConfig } from '../types';
import { sound } from '../utils/soundEffects';
import { Settings, Save, X, RotateCcw, Sparkles, Camera, Trash2, User } from 'lucide-react';
import { initialClassConfig } from '../data/initialData';
import { TeacherAvatar } from './TeacherAvatar';
import { TeacherAvatarModal } from './TeacherAvatarModal';

interface SettingsModalProps {
  config: ClassConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveConfig: (newConfig: ClassConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  isOpen,
  onClose,
  onSaveConfig,
}) => {
  const [formData, setFormData] = useState<ClassConfig>(config);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      console.log("[BANNER CONFIG CURRENT]", config.bannerTitle);
      setFormData(config);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[BANNER TITLE SAVE]", formData.bannerTitle);
    onSaveConfig(formData);
    sound.playReward();
    onClose();
  };

  const handleResetToDefault = () => {
    if (window.confirm('Khôi phục cấu hình mặc định ban đầu của Cô Bùi Thị Cúc (Lớp 4A2)?')) {
      setFormData(initialClassConfig);
      sound.playClick();
    }
  };

  return (
    <>
      <TeacherAvatarModal
        isOpen={showAvatarModal}
        currentAvatarUrl={formData.teacherAvatarUrl}
        teacherName={formData.teacherName || 'Cô Bùi Thị Cúc'}
        teacherRole={formData.teacherRole || 'Giáo viên chủ nhiệm'}
        onClose={() => setShowAvatarModal(false)}
        onSaveAvatar={(newAvatarUrl) => {
          setFormData((prev) => ({ ...prev, teacherAvatarUrl: newAvatarUrl }));
        }}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-amber-300" />
              <div>
                <h3 className="font-bold text-base">Cấu Hình Cá Nhân Hóa Lớp Học</h3>
                <p className="text-xs text-emerald-100">
                  Thầy cô chỉnh sửa thông tin lớp, tên giáo viên, ảnh đại diện, tiêu đề banner và chủ điểm
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
            {/* Teacher Avatar Section */}
            <div className="p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-200/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <TeacherAvatar
                  avatarUrl={formData.teacherAvatarUrl}
                  teacherName={formData.teacherName || 'Cô Bùi Thị Cúc'}
                  teacherRole={formData.teacherRole || 'Giáo viên chủ nhiệm'}
                  size="md"
                  shape="circle"
                  showBadge={true}
                  onClick={() => setShowAvatarModal(true)}
                />
                <div>
                  <div className="text-xs font-black text-emerald-950">Ảnh đại diện Giáo viên</div>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    {formData.teacherAvatarUrl ? 'Đang dùng ảnh tự tải' : 'Đang dùng ảnh mặc định'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{formData.teacherAvatarUrl ? 'Đổi ảnh' : 'Tải ảnh'}</span>
                </button>
                {formData.teacherAvatarUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, teacherAvatarUrl: undefined }))}
                    className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition cursor-pointer"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Section 1: Teacher & Class */}
            <div className="space-y-3">
              <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                1. Thông tin Lớp học & Giáo viên chủ nhiệm
              </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên lớp học:</label>
                <input
                  type="text"
                  required
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  placeholder="LỚP 4A2 – VƯỜN ƯƠM TRI THỨC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Giáo viên chủ nhiệm:</label>
                <input
                  type="text"
                  required
                  value={formData.teacherName}
                  onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                  placeholder="CÔ BÙI THỊ CÚC"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chức danh:</label>
                <input
                  type="text"
                  value={formData.teacherRole}
                  onChange={(e) => setFormData({ ...formData, teacherRole: e.target.value })}
                  placeholder="Giáo viên chủ nhiệm"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Năm học:</label>
                <input
                  type="text"
                  value={formData.schoolYear}
                  onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                  placeholder="2024 - 2025"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên trường:</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  placeholder="Trường Tiểu Học Vườn Ươm Tri Thức"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Banner Titles & Themes */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              2. Tiêu đề Banner & Khẩu hiệu thi đua
            </h4>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tiêu đề Banner chính:</label>
              <input
                type="text"
                value={formData.bannerTitle}
                onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
                placeholder="🌱 VƯỜN ƯƠM TRI THỨC"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Tiêu đề phụ:</label>
              <input
                type="text"
                value={formData.bannerSubtitle}
                onChange={(e) => setFormData({ ...formData, bannerSubtitle: e.target.value })}
                placeholder="🌼 MỖI NGÀY MỘT CỐ GẮNG – MỖI THÀNH TÍCH MỘT BÔNG HOA"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chủ điểm tháng:</label>
                <input
                  type="text"
                  value={formData.monthlyTheme}
                  onChange={(e) => setFormData({ ...formData, monthlyTheme: e.target.value })}
                  placeholder="🎒 THÁNG 9 – CÙNG NHAU TỎA SÁNG"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Thông điệp nhỏ:</label>
                <input
                  type="text"
                  value={formData.smallMessage}
                  onChange={(e) => setFormData({ ...formData, smallMessage: e.target.value })}
                  placeholder="✨ Gieo điều tốt – Tích điểm hay – Hoa thành tích nở mỗi ngày!"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Names of the 4 Groups */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              3. Tên gọi 4 Tổ thi đua trong lớp
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((g) => (
                <div key={g}>
                  <label className="block font-bold text-slate-700 mb-1">Tổ {g}:</label>
                  <input
                    type="text"
                    value={formData.groupNames[g as 1 | 2 | 3 | 4]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        groupNames: {
                          ...formData.groupNames,
                          [g]: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Sidebar Position & Layout */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="font-bold text-emerald-800 uppercase tracking-wider text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              4. Giao diện & Vị trí Thanh Menu (Sidebar)
            </h4>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sidebarPos"
                  checked={(formData.sidebarPosition || 'left') === 'left'}
                  onChange={() => setFormData({ ...formData, sidebarPosition: 'left' })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800">Menu Bên Trái (Mặc định)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="sidebarPos"
                  checked={formData.sidebarPosition === 'right'}
                  onChange={() => setFormData({ ...formData, sidebarPosition: 'right' })}
                  className="text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-bold text-slate-800">Menu Bên Phải</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục mặc định ban đầu</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Lưu cấu hình</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};
