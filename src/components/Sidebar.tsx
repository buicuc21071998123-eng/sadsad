import React from 'react';
import { ActiveTab, ClassConfig } from '../types';
import { sound } from '../utils/soundEffects';

interface SidebarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  config: ClassConfig;
  onUpdateConfig?: (config: ClassConfig) => void;
  studentCount: number;
  totalFlowers: number;
  absentCount?: number;
  onOpenSettingsModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onChangeTab,
  config,
  studentCount,
  totalFlowers,
  absentCount = 0,
}) => {
  const displayClassName = config?.className || 'Lớp 4A2';

  // 8 Main Menu Items
  const menuItems: { id: ActiveTab; label: string; icon: string; desc: string; badge: string }[] = [
    {
      id: 'dashboard',
      label: 'TRANG CHỦ',
      icon: '🏠',
      desc: `Tổng quan ${displayClassName}`,
      badge: 'Tổng quan',
    },
    {
      id: 'students',
      label: 'HỌC SINH',
      icon: '👩‍🎓',
      desc: 'Quản lý & Hồ sơ học sinh',
      badge: `${studentCount} em`,
    },
    {
      id: 'garden',
      label: 'VƯỜN THÀNH TÍCH',
      icon: '🌱',
      desc: 'Tích điểm & Khen thưởng',
      badge: `${totalFlowers} ⭐`,
    },
    {
      id: 'attendance',
      label: 'ĐIỂM DANH',
      icon: '✅',
      desc: 'Điểm danh chuyên cần',
      badge: absentCount > 0 ? `${absentCount} vắng` : 'Đầy đủ',
    },
    {
      id: 'classroom_games',
      label: 'TRÒ CHƠI',
      icon: '🎮',
      desc: 'Vòng quay, đua vịt, bóng bay...',
      badge: 'Game vui',
    },
    {
      id: 'timer',
      label: 'ĐỒNG HỒ',
      icon: '⏱️',
      desc: 'Đếm ngược & Bấm giờ',
      badge: 'Đồng hồ',
    },
    {
      id: 'noise_meter',
      label: 'ĐO TIẾNG ỒN',
      icon: '🔊',
      desc: 'Quản lý trật tự lớp học',
      badge: 'Microphone',
    },
    {
      id: 'settings',
      label: 'CÀI ĐẶT',
      icon: '⚙️',
      desc: 'Thông tin lớp, tiêu chí & làm mới',
      badge: 'Cấu hình',
    },
  ];

  const handleSelectTab = (tabId: ActiveTab) => {
    sound.playClick();
    onChangeTab(tabId);
  };

  return (
    <aside id="main-navigation-sidebar" className="w-full lg:w-76 space-y-4 shrink-0">
      {/* EXACT 8-ITEM MAIN MENU */}
      <div className="candy-card p-4 sm:p-5 shadow-lg shadow-pink-200/30">
        <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b-2 border-[#FCE7F3]">
          <span className="text-sm font-black text-[#7E22CE] uppercase tracking-wider flex items-center gap-1.5">
            <span>✨</span>
            <span>Menu Chính</span>
          </span>
          <span className="text-xs font-black text-[#DB2777] bg-[#FCE7F3] px-3 py-1 rounded-full border border-[#F9A8D4]">
            {displayClassName}
          </span>
        </div>

        <nav className="space-y-2.5">
          {menuItems.map((item, index) => {
            const isSelected = activeTab === item.id;

            return (
              <button
                key={item.id}
                id={`menu-item-${item.id}`}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all duration-200 text-left font-bold cursor-pointer ${
                  isSelected
                    ? 'candy-btn-purple ring-2 ring-white/80 scale-[1.02] shadow-md'
                    : 'text-slate-700 hover:bg-[#FDF2F8] hover:text-[#701A75] border-2 border-transparent hover:border-[#F9A8D4]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`text-2xl sm:text-3xl filter drop-shadow-xs transition ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {item.icon}
                  </span>
                  <div>
                    <div className={`font-black text-sm sm:text-base ${isSelected ? 'text-white' : 'text-[#701A75]'}`}>
                      {index + 1}. {item.label}
                    </div>
                    <div className={`text-xs sm:text-[13px] font-semibold leading-tight ${isSelected ? 'text-purple-100' : 'text-slate-500'}`}>
                      {item.desc}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-xs font-black px-3 py-1 rounded-full shrink-0 ${
                    isSelected
                      ? 'bg-white/25 text-white border border-white/40'
                      : 'bg-[#FCE7F3] text-[#DB2777] border border-[#F9A8D4]'
                  }`}
                >
                  {item.badge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TEACHER MOTIVATIONAL CARD */}
      <div className="hidden lg:block bg-gradient-to-br from-[#FFF7ED] via-[#FDF2F8] to-[#FAF5FF] rounded-3xl p-4 sm:p-5 border-2 border-[#F9A8D4] shadow-sm text-center space-y-2">
        <div className="text-2xl sm:text-3xl">🌱 ⭐ 🌸</div>
        <h4 className="text-xs sm:text-sm font-black text-[#7E22CE] uppercase tracking-wide">
          {config?.bannerTitle || 'Vườn Ươm Tri Thức'} • {displayClassName}
        </h4>
        <p className="text-xs sm:text-sm text-[#DB2777] font-bold italic">
          "{config?.smallMessage || 'Mỗi việc tốt gieo xuống hôm nay là một đóa hoa rực rỡ ngày mai.'}"
        </p>
      </div>
    </aside>
  );
};
