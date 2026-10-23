import React from 'react';
import { 
  Flower2, 
  CheckCircle2, 
  Gift, 
  Trophy, 
  Wrench, 
  Users, 
  BookOpen, 
  Sparkles 
} from 'lucide-react';

export type ActiveTab = 'garden' | 'attendance' | 'rewards' | 'leaderboard' | 'tools' | 'students' | 'notes';

interface NavbarProps {
  activeTab: ActiveTab;
  onChangeTab: (tab: ActiveTab) => void;
  studentCount: number;
  totalFlowers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onChangeTab,
  studentCount,
  totalFlowers,
}) => {
  const tabs = [
    {
      id: 'garden' as ActiveTab,
      label: 'Vườn Hoa Thi Đua',
      icon: Flower2,
      badge: `${totalFlowers} 🌸`,
      color: 'hover:text-emerald-700',
    },
    {
      id: 'attendance' as ActiveTab,
      label: 'Điểm Danh Chuyên Cần',
      icon: CheckCircle2,
      color: 'hover:text-blue-700',
    },
    {
      id: 'rewards' as ActiveTab,
      label: 'Cửa Hàng Đổi Sao',
      icon: Gift,
      color: 'hover:text-amber-700',
    },
    {
      id: 'leaderboard' as ActiveTab,
      label: 'Bảng Vinh Danh',
      icon: Trophy,
      color: 'hover:text-purple-700',
    },
    {
      id: 'tools' as ActiveTab,
      label: 'Công Cụ Trợ Giảng',
      icon: Wrench,
      color: 'hover:text-teal-700',
    },
    {
      id: 'students' as ActiveTab,
      label: 'Danh Sách Học Sinh',
      icon: Users,
      badge: `${studentCount} em`,
      color: 'hover:text-indigo-700',
    },
    {
      id: 'notes' as ActiveTab,
      label: 'Sổ Tay & Zalo',
      icon: BookOpen,
      color: 'hover:text-emerald-700',
    },
  ];

  return (
    <nav className="bg-white/90 rounded-3xl p-2 shadow-md shadow-pink-100/50 border-2 border-[#FCE7F3] mb-6 sticky top-2 z-30 backdrop-blur-md">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onChangeTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-200 shrink-0 select-none ${
                isActive
                  ? 'candy-btn-purple text-white shadow-md shadow-purple-300/40 scale-102'
                  : 'text-purple-900/80 hover:text-purple-950 hover:bg-pink-50/80'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-pink-200' : 'text-pink-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-purple-900/50 text-pink-100 border border-purple-400/40'
                      : 'bg-pink-100 text-pink-700 border border-pink-200'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
