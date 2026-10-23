import React, { useState, useMemo, useRef, useEffect } from 'react';
import { RewardItem, Student, RedemptionLog, ClassConfig } from '../types';
import { fireConfetti, fireSuperConfetti, getAvatarColor, getStudentInitials } from '../utils/helpers';
import { sound } from '../utils/soundEffects';
import { RewardIllustration } from './RewardIllustration';
import { 
  Gift, 
  Sparkles, 
  History, 
  Plus, 
  Check, 
  X, 
  Search, 
  PackageCheck,
  Star,
  Lock,
  UserCheck,
  ShieldCheck,
  Info,
  ChevronDown,
  ArrowRight,
  HelpCircle,
  Clock,
  Sparkle
} from 'lucide-react';

interface RewardShopViewProps {
  rewards: RewardItem[];
  students: Student[];
  redemptionLogs: RedemptionLog[];
  config: ClassConfig;
  onRedeemReward: (studentId: string, rewardId: string) => void;
  onAddNewReward: (reward: RewardItem) => void;
  onUpdateRewardStock: (rewardId: string, newStock: number) => void;
}

export const RewardShopView: React.FC<RewardShopViewProps> = ({
  rewards,
  students,
  redemptionLogs,
  config,
  onRedeemReward,
  onAddNewReward,
  onUpdateRewardStock,
}) => {
  // Main state
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState<boolean>(false);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'privilege' | 'gift' | 'honor'>('all');
  const [confirmRedemptionReward, setConfirmRedemptionReward] = useState<RewardItem | null>(null);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New reward form state
  const [newTitle, setNewTitle] = useState('');
  const [newCost, setNewCost] = useState<number>(10);
  const [newIcon, setNewIcon] = useState('🎁');
  const [newDesc, setNewDesc] = useState('');
  const [newStock, setNewStock] = useState<number>(15);
  const [newCategory, setNewCategory] = useState<'privilege' | 'gift' | 'honor'>('privilege');
  const [newThemeColor, setNewThemeColor] = useState<'purple' | 'blue' | 'teal' | 'orange' | 'amber' | 'emerald' | 'rose'>('purple');
  const [newIllustration, setNewIllustration] = useState<string>('custom');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStudentDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Currently selected student object
  const selectedStudent = useMemo(() => {
    return students.find((s) => s.id === selectedStudentId) || null;
  }, [students, selectedStudentId]);

  // Filter students for search in dropdown
  const filteredStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return students;
    const term = studentSearchTerm.toLowerCase();
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.stt.toString().includes(term) ||
        (s.securityCode && s.securityCode.includes(term)) ||
        s.role.toLowerCase().includes(term)
    );
  }, [students, studentSearchTerm]);

  // Filtered rewards
  const filteredRewards = useMemo(() => {
    if (activeCategoryFilter === 'all') return rewards;
    return rewards.filter((r) => r.category === activeCategoryFilter);
  }, [rewards, activeCategoryFilter]);

  // Execute redemption
  const handleConfirmRedeem = () => {
    if (!confirmRedemptionReward || !selectedStudent) return;

    if (selectedStudent.flowerPoints < confirmRedemptionReward.cost) {
      sound.playPenalty();
      alert(`Em ${selectedStudent.name} hiện có ${selectedStudent.flowerPoints} Sao, chưa đủ ${confirmRedemptionReward.cost} Sao để đổi món quà này.`);
      return;
    }

    if (confirmRedemptionReward.stock !== -1 && confirmRedemptionReward.stock <= 0) {
      sound.playPenalty();
      alert('Phần quà này hiện đã hết trong kho quà của lớp.');
      return;
    }

    sound.playApplause();
    fireSuperConfetti();
    onRedeemReward(selectedStudent.id, confirmRedemptionReward.id);
    setConfirmRedemptionReward(null);
  };

  // Quick click from card
  const handleCardRedeemClick = (reward: RewardItem) => {
    if (!selectedStudent) {
      sound.playClick();
      setIsStudentDropdownOpen(true);
      setTimeout(() => {
        dropdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchInputRef.current?.focus();
      }, 100);
      return;
    }

    if (selectedStudent.flowerPoints >= reward.cost && (reward.stock === -1 || reward.stock > 0)) {
      setConfirmRedemptionReward(reward);
      sound.playReward();
    }
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newReward: RewardItem = {
      id: `rew-${Date.now()}`,
      title: newTitle.trim(),
      cost: Number(newCost) || 10,
      icon: newIcon || '🎁',
      description: newDesc.trim() || 'Món quà đặc biệt dành cho các bạn chăm ngoan',
      stock: Number(newStock) || 10,
      claimedCount: 0,
      category: newCategory,
      themeColor: newThemeColor,
      illustrationType: (newIllustration as any) || 'custom',
    };

    onAddNewReward(newReward);
    sound.playReward();
    setShowAddModal(false);

    // Reset form
    setNewTitle('');
    setNewCost(10);
    setNewIcon('🎁');
    setNewDesc('');
    setNewStock(15);
    setNewThemeColor('purple');
    setNewIllustration('custom');
  };

  // Helper for color styles based on themeColor
  const getThemeStyles = (theme?: string) => {
    switch (theme) {
      case 'purple':
        return {
          cardBg: 'bg-gradient-to-b from-[#FAF5FF] via-white to-[#FDF4FF]',
          border: 'border-[#E9D5FF] hover:border-[#C084FC]',
          shadowHover: 'hover:shadow-purple-400/20',
          tagBg: 'bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]',
          costBadge: 'bg-[#FAF5FF] text-[#7E22CE] border-[#E9D5FF]',
          costNumber: 'text-[#7E22CE]',
          button: 'candy-btn-purple text-white shadow-md',
          bannerBg: 'bg-gradient-to-r from-[#A855F7] to-[#EC4899]',
          accentColor: 'text-[#6B21A8]',
          starColor: 'text-[#FACC15]',
        };
      case 'blue':
        return {
          cardBg: 'bg-gradient-to-b from-[#F0F9FF] via-white to-[#F0FDFA]',
          border: 'border-[#BAE6FD] hover:border-[#38BDF8]',
          shadowHover: 'hover:shadow-sky-400/20',
          tagBg: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]',
          costBadge: 'bg-[#F0F9FF] text-[#0284C7] border-[#BAE6FD]',
          costNumber: 'text-[#0284C7]',
          button: 'candy-btn-purple text-white shadow-md',
          bannerBg: 'bg-gradient-to-r from-[#0284C7] to-[#0D9488]',
          accentColor: 'text-[#0369A1]',
          starColor: 'text-[#FACC15]',
        };
      case 'teal':
        return {
          cardBg: 'bg-gradient-to-b from-[#F0FDFA] via-white to-[#ECFDF5]',
          border: 'border-[#99F6E4] hover:border-[#2DD4BF]',
          shadowHover: 'hover:shadow-teal-400/20',
          tagBg: 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]',
          costBadge: 'bg-[#F0FDFA] text-[#0D9488] border-[#99F6E4]',
          costNumber: 'text-[#0D9488]',
          button: 'candy-btn-gold text-[#581C87] shadow-md',
          bannerBg: 'bg-gradient-to-r from-[#0D9488] to-[#10B981]',
          accentColor: 'text-[#0F766E]',
          starColor: 'text-[#FACC15]',
        };
      case 'orange':
        return {
          cardBg: 'bg-gradient-to-b from-[#FFF7ED] via-white to-[#FFFBEB]',
          border: 'border-[#FED7AA] hover:border-[#FB923C]',
          shadowHover: 'hover:shadow-orange-400/20',
          tagBg: 'bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]',
          costBadge: 'bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA]',
          costNumber: 'text-[#EA580C]',
          button: 'candy-btn-peach text-white shadow-md',
          bannerBg: 'bg-gradient-to-r from-[#EA580C] to-[#F59E0B]',
          accentColor: 'text-[#C2410C]',
          starColor: 'text-[#FACC15]',
        };
      case 'emerald':
        return {
          cardBg: 'bg-gradient-to-b from-[#ECFDF5] via-white to-[#F0FDF4]',
          border: 'border-[#A7F3D0] hover:border-[#34D399]',
          shadowHover: 'hover:shadow-emerald-400/20',
          tagBg: 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0]',
          costBadge: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
          costNumber: 'text-[#059669]',
          button: 'candy-btn-gold text-[#581C87] shadow-md',
          bannerBg: 'bg-gradient-to-r from-[#059669] to-[#10B981]',
          accentColor: 'text-[#047857]',
          starColor: 'text-[#FACC15]',
        };
      default:
        return {
          cardBg: 'bg-gradient-to-b from-[#FFFDF5] via-white to-[#FFF7ED]',
          border: 'border-[#FDE68A] hover:border-[#FACC15]',
          shadowHover: 'hover:shadow-amber-400/20',
          tagBg: 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]',
          costBadge: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
          costNumber: 'text-[#D97706]',
          button: 'candy-btn-gold text-[#581C87] shadow-md',
          bannerBg: 'bg-gradient-to-r from-[#F59E0B] to-[#EA580C]',
          accentColor: 'text-[#92400E]',
          starColor: 'text-[#FACC15]',
        };
    }
  };

  return (
    <div id="reward-shop-section" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FB923C] rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border-2 border-white/20">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-white/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-10 w-64 h-64 bg-amber-300/30 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-200 text-xs font-black mb-2.5 border border-white/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Cửa Hàng Quà Tặng & Đặc Quyền Lớp {config.className}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Đổi Sao Thành Tích – Nhận Đặc Quyền Hấp Dẫn 🎁
            </h2>
            <p className="text-purple-100 text-xs sm:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Chọn học sinh từ danh sách xổ xuống để kiểm tra số Sao hiện có. Khi đổi quà, số Sao chi tiêu sẽ được trừ nhưng <strong className="text-amber-200 underline decoration-amber-300/60 underline-offset-2">Tổng điểm thi đua trọn đời luôn được bảo toàn</strong>!
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => setShowAddModal(true)}
              className="candy-btn-gold px-4 py-2.5 text-[#581C87] font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Thêm quà mới</span>
            </button>
          </div>
        </div>
      </div>

      {/* CORE STEP 1: STUDENT SELECTION DROPDOWN SECTION */}
      <div 
        ref={dropdownRef}
        id="student-reward-selector" 
        className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md relative transition-all"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#FCE7F3]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full candy-btn-purple text-white font-black text-xs flex items-center justify-center shadow-xs">
                1
              </span>
              <h3 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                Chọn học sinh cần đổi quà từ danh sách:
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 ml-9 font-medium">
              Hệ thống sẽ tự động đối chiếu số Sao hiện có của học sinh với từng món quà
            </p>
          </div>

          {/* Quick Clear or Quick Selection indicator */}
          {selectedStudent && (
            <button
              onClick={() => {
                setSelectedStudentId('');
                sound.playClick();
              }}
              className="self-start md:self-auto text-xs font-bold text-slate-500 hover:text-rose-600 bg-[#FFF1F2] hover:bg-rose-100 border border-[#FECDD3] px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Bỏ chọn học sinh</span>
            </button>
          )}
        </div>

        {/* Dropdown Toggle Button */}
        <div className="mt-4 relative">
          <button
            type="button"
            onClick={() => {
              setIsStudentDropdownOpen(!isStudentDropdownOpen);
              sound.playClick();
            }}
            className={`w-full p-3.5 sm:p-4 rounded-3xl border-2 text-left flex items-center justify-between transition-all duration-200 ${
              selectedStudent
                ? 'bg-gradient-to-r from-[#FAF5FF] via-white to-[#FFF7ED] border-[#F9A8D4] shadow-md ring-4 ring-[#FCE7F3]'
                : 'bg-[#FAF5FF]/70 hover:bg-[#FAF5FF] border-[#FCE7F3] hover:border-[#F9A8D4]'
            }`}
          >
            {selectedStudent ? (
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  {selectedStudent.avatarUrl ? (
                    <img
                      src={selectedStudent.avatarUrl}
                      alt={selectedStudent.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-[#F9A8D4] shadow-sm"
                    />
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarColor(
                        selectedStudent.name,
                        selectedStudent.gender
                      )} text-white flex items-center justify-center font-black text-base shadow-sm border-2 border-white`}
                    >
                      {getStudentInitials(selectedStudent.name)}
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 candy-btn-purple text-white font-black text-[9px] px-1.5 py-0.2 rounded-md shadow-xs">
                    #{selectedStudent.stt}
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {selectedStudent.name}
                    </span>
                    <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-[#FAF5FF] text-[#7E22CE] border border-[#E9D5FF]">
                      Tổ {selectedStudent.group} • {selectedStudent.role}
                    </span>
                    {selectedStudent.securityCode && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        #{selectedStudent.securityCode}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate font-medium">
                    Mục tiêu: {selectedStudent.personalTarget || 'Phấn đấu trở thành học sinh tiêu biểu'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-11 h-11 rounded-2xl bg-[#FAF5FF] text-[#A855F7] border border-[#FCE7F3] flex items-center justify-center font-bold text-lg shrink-0">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-black text-sm sm:text-base text-slate-700">
                    -- Nhấn vào đây để chọn học sinh cần đổi quà --
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Danh sách hiển thị đầy đủ {students.length} học sinh kèm số Sao khả dụng
                  </div>
                </div>
              </div>
            )}

            {/* Right side balance badge */}
            <div className="flex items-center gap-3 shrink-0 ml-2">
              {selectedStudent ? (
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
                  <div className="candy-btn-gold text-[#581C87] px-3.5 py-1.5 rounded-xl font-black text-sm shadow-md flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{selectedStudent.flowerPoints} Sao hiện có</span>
                  </div>
                  <div className="bg-[#FAF5FF] text-[#7E22CE] px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 border border-[#E9D5FF] hidden sm:flex">
                    <span>🌸 Trọn đời: {selectedStudent.lifetimePoints ?? selectedStudent.flowerPoints}đ</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-black text-[#A855F7] bg-[#FAF5FF] px-3.5 py-1.5 rounded-xl border border-[#FCE7F3]">
                  Chọn học sinh ▾
                </span>
              )}
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isStudentDropdownOpen ? 'rotate-180 text-[#A855F7]' : ''}`} />
            </div>
          </button>

          {/* Expanded Dropdown Panel */}
          {isStudentDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-40 bg-white rounded-3xl shadow-2xl border-2 border-[#F9A8D4] p-4 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  placeholder="Tìm nhanh theo tên, số thứ tự, mã 5 số hoặc tổ..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium"
                  autoFocus
                />
                {studentSearchTerm && (
                  <button
                    onClick={() => setStudentSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold p-1"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Student grid inside dropdown */}
              <div className="max-h-72 overflow-y-auto divide-y divide-[#FCE7F3] pr-1">
                {filteredStudents.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic font-medium">
                    Không tìm thấy học sinh nào phù hợp với từ khóa "{studentSearchTerm}"
                  </div>
                ) : (
                  filteredStudents.map((st) => {
                    const isSelected = selectedStudentId === st.id;
                    const canAffordAtLeastOne = rewards.some((r) => st.flowerPoints >= r.cost);

                    return (
                      <div
                        key={st.id}
                        onClick={() => {
                          setSelectedStudentId(st.id);
                          setIsStudentDropdownOpen(false);
                          sound.playClick();
                        }}
                        className={`p-3 rounded-2xl text-xs sm:text-sm flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-[#FAF5FF] text-[#581C87] font-black border-2 border-[#D8B4FE]'
                            : 'hover:bg-[#FFF7ED] text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            {st.avatarUrl ? (
                              <img
                                src={st.avatarUrl}
                                alt={st.name}
                                referrerPolicy="no-referrer"
                                className="w-9 h-9 rounded-xl object-cover border border-[#FCE7F3]"
                              />
                            ) : (
                              <div
                                className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${getAvatarColor(
                                  st.name,
                                  st.gender
                                )} text-white flex items-center justify-center font-bold text-xs`}
                              >
                                {getStudentInitials(st.name)}
                              </div>
                            )}
                            <span className="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[8px] font-black px-1 rounded">
                              {st.stt}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-black text-slate-900 truncate">{st.name}</span>
                              <span className="text-[10px] text-slate-500 font-normal">
                                (Tổ {st.group} • {st.role})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-normal">
                              Mã tra cứu: #{st.securityCode}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-2">
                          <div className="text-right">
                            <div className="font-black text-amber-700 bg-[#FEF3C7] px-2.5 py-1 rounded-xl border border-[#FDE68A] flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                              <span>{st.flowerPoints} Sao</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                              Trọn đời: {st.lifetimePoints ?? st.flowerPoints}đ
                            </div>
                          </div>

                          {isSelected && (
                            <div className="w-7 h-7 rounded-full candy-btn-purple text-white flex items-center justify-center shadow-xs">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Protection & Lifetime Points Explanation Notice */}
        <div className="mt-3.5 pt-3 border-t border-[#FCE7F3] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2 text-[#7E22CE] font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Quy tắc bảo toàn thành tích:</strong> Số Sao đổi quà sẽ trừ vào số dư khả dụng, nhưng <strong>Tổng điểm thi đua trọn đời không bị giảm</strong>, đảm bảo quyền lợi xét khen thưởng cuối năm!
            </span>
          </div>
          {selectedStudent && (
            <span className="text-slate-400 text-[11px] shrink-0 font-medium">
              Đang chọn: <strong className="text-slate-800">{selectedStudent.name}</strong> ({selectedStudent.flowerPoints} ⭐)
            </span>
          )}
        </div>
      </div>

      {/* CORE STEP 2: CATEGORY FILTERS & STATUS SUMMARY */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-3xl border-2 border-[#FCE7F3] shadow-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeCategoryFilter === 'all'
                ? 'candy-btn-purple text-white shadow-sm'
                : 'bg-[#FAF5FF] text-slate-600 hover:text-[#7E22CE] border border-[#FCE7F3]'
            }`}
          >
            <span>Tất cả quà ({rewards.length})</span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('privilege')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeCategoryFilter === 'privilege'
                ? 'candy-btn-purple text-white shadow-sm'
                : 'bg-[#FAF5FF] text-[#7E22CE] hover:bg-[#F3E8FF] border border-[#FCE7F3]'
            }`}
          >
            <span>👑 Đặc quyền lớp</span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('gift')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeCategoryFilter === 'gift'
                ? 'candy-btn-peach text-white shadow-sm'
                : 'bg-[#FFF7ED] text-[#EA580C] hover:bg-[#FFEDD5] border border-[#FED7AA]'
            }`}
          >
            <span>🎁 Quà hiện vật</span>
          </button>
          <button
            onClick={() => setActiveCategoryFilter('honor')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              activeCategoryFilter === 'honor'
                ? 'candy-btn-gold text-[#581C87] shadow-sm'
                : 'bg-[#FFFBEB] text-[#D97706] hover:bg-[#FEF3C7] border border-[#FDE68A]'
            }`}
          >
            <span>🏆 Vinh danh</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
          {selectedStudent ? (
            <span className="text-[#059669] font-black bg-[#ECFDF5] px-3.5 py-1 rounded-xl border border-[#A7F3D0]">
              ✅ Đang kiểm tra điều kiện cho: {selectedStudent.name} ({selectedStudent.flowerPoints} ⭐)
            </span>
          ) : (
            <span className="text-[#D97706] font-black bg-[#FFFBEB] px-3.5 py-1 rounded-xl border border-[#FDE68A]">
              💡 Hãy chọn học sinh ở bước 1 để kích hoạt nút đổi quà
            </span>
          )}
        </div>
      </div>

      {/* CORE STEP 3: REWARDS CATALOG GRID (WITH DYNAMIC AFFORDABILITY EVALUATION) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {filteredRewards.map((reward) => {
          const theme = getThemeStyles(reward.themeColor);
          const isCoreTier = ['rew-seat-10', 'rew-music-20', 'rew-homework-50', 'rew-secret-100'].includes(reward.id);
          const isOutOfStock = reward.stock !== -1 && reward.stock <= 0;

          // Evaluation for selected student
          const hasStudent = !!selectedStudent;
          const studentPoints = selectedStudent ? selectedStudent.flowerPoints : 0;
          const isAffordable = hasStudent && studentPoints >= reward.cost;
          const missingPoints = hasStudent && !isAffordable ? reward.cost - studentPoints : 0;

          return (
            <div
              key={reward.id}
              id={`reward-card-${reward.id}`}
              className={`rounded-3xl p-5 border-2 shadow-xs transition-all duration-200 flex flex-col justify-between group ${
                isAffordable
                  ? `${theme.cardBg} ${theme.border} ring-2 ring-emerald-400/40 shadow-emerald-500/10`
                  : hasStudent && !isAffordable
                  ? 'bg-slate-50/80 border-slate-200 opacity-90'
                  : `${theme.cardBg} ${theme.border} ${theme.shadowHover}`
              }`}
            >
              <div>
                {/* Header Tag & Stock Pill */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${theme.tagBg}`}>
                      {reward.category === 'privilege'
                        ? 'Đặc quyền'
                        : reward.category === 'honor'
                        ? 'Vinh danh'
                        : 'Quà hiện vật'}
                    </span>
                    {isCoreTier && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full candy-btn-gold text-[#581C87] flex items-center gap-0.5 shadow-xs">
                        ⭐ HOT
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      !isOutOfStock
                        ? 'bg-white/80 text-slate-600 border border-slate-200'
                        : 'bg-rose-100 text-rose-700 font-black border border-rose-200'
                    }`}
                  >
                    {reward.stock === -1 ? 'Không giới hạn' : reward.stock > 0 ? `Còn: ${reward.stock}` : 'Hết quà'}
                  </span>
                </div>

                {/* Rich Illustrative Artwork */}
                <div className="my-2 group-hover:scale-102 transition-transform duration-200 relative">
                  <RewardIllustration
                    type={reward.illustrationType}
                    themeColor={reward.themeColor}
                    icon={reward.icon}
                    className="w-full h-36 rounded-2xl shadow-xs"
                  />
                  
                  {/* Status Overlay Badge */}
                  {hasStudent && (
                    <div className="absolute bottom-2 left-2 right-2">
                      {isAffordable ? (
                        <div className="bg-emerald-600/95 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md flex items-center justify-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Đủ điều kiện đổi ({studentPoints}/{reward.cost} ⭐)</span>
                        </div>
                      ) : (
                        <div className="bg-rose-600/95 backdrop-blur-xs text-white text-[11px] font-black px-2.5 py-1 rounded-xl shadow-md flex items-center justify-center gap-1">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Thiếu {missingPoints} sao ({studentPoints}/{reward.cost} ⭐)</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div className="mt-3">
                  <h3 className={`font-black text-base sm:text-lg transition ${theme.accentColor}`}>
                    {reward.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 font-medium leading-relaxed line-clamp-2">
                    {reward.description}
                  </p>
                </div>
              </div>

              {/* Bottom Section: Cost & Action Button */}
              <div className="mt-4 pt-3 border-t border-[#FCE7F3]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-slate-500 font-bold">Trị giá quy đổi:</span>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-sm border ${theme.costBadge}`}>
                    <Star className={`w-4 h-4 ${theme.starColor} fill-current`} />
                    <span className={theme.costNumber}>{reward.cost} Sao</span>
                  </div>
                </div>

                {/* DYNAMIC REDEEM BUTTON AS REQUIRED */}
                {!hasStudent ? (
                  <button
                    type="button"
                    onClick={() => handleCardRedeemClick(reward)}
                    className="w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black bg-white hover:bg-[#FAF5FF] text-[#7E22CE] border-2 border-[#FCE7F3] transition flex items-center justify-center gap-2 shadow-xs active:scale-95"
                  >
                    <UserCheck className="w-4 h-4 text-[#EC4899]" />
                    <span>Chọn học sinh để đổi quà</span>
                  </button>
                ) : isOutOfStock ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Hết số lượng quà</span>
                  </button>
                ) : isAffordable ? (
                  <button
                    type="button"
                    onClick={() => handleCardRedeemClick(reward)}
                    className={`w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-2 ${theme.button}`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>Đổi quà ngay (-{reward.cost} ⭐)</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] cursor-not-allowed flex items-center justify-center gap-2 opacity-80"
                  >
                    <Lock className="w-4 h-4 text-[#BE123C]" />
                    <span>Thiếu {missingPoints} sao</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Redemption History Log */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FCE7F3]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl candy-btn-purple text-white flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-base">
                Lịch sử học sinh đổi quà & đặc quyền
              </h3>
              <p className="text-xs text-slate-400 font-medium">Các giao dịch đổi Sao thành công trong năm học</p>
            </div>
          </div>
          <span className="text-xs font-black text-[#7E22CE] bg-[#FAF5FF] px-3.5 py-1 rounded-full border border-[#E9D5FF]">
            Tổng lượt đổi: {redemptionLogs.length}
          </span>
        </div>

        {redemptionLogs.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs italic font-medium">
            <Gift className="w-10 h-10 mx-auto text-pink-300 mb-2" />
            Chưa có học sinh nào thực hiện đổi quà. Hãy cộng Sao và thưởng quà cho các em nhé!
          </div>
        ) : (
          <div className="divide-y divide-[#FCE7F3]">
            {redemptionLogs.slice(0, 15).map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs hover:bg-[#FAF5FF] rounded-2xl px-2.5 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl candy-btn-peach text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
                    🎁
                  </div>
                  <div>
                    <div className="font-black text-slate-800 text-sm">
                      {log.studentName}
                    </div>
                    <div className="text-slate-500 text-xs font-medium">
                      Đã đổi thành công: <strong className="text-[#7E22CE] font-bold">{log.rewardTitle}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="font-black text-amber-800 bg-[#FEF3C7] px-3 py-1 rounded-xl border border-[#FDE68A] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    -{log.cost} Sao
                  </span>
                  <span className="text-slate-400 text-[11px] font-medium">
                    {new Date(log.timestamp).toLocaleDateString('vi-VN')} {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-black bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5" /> Đã trao
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL: CONFIRMATION OF REDEMPTION */}
      {confirmRedemptionReward && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-2 border-[#FCE7F3] animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className={`text-white p-5 flex items-center justify-between ${getThemeStyles(confirmRedemptionReward.themeColor).bannerBg}`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30">
                  {confirmRedemptionReward.icon}
                </div>
                <div>
                  <h3 className="font-black text-base">{confirmRedemptionReward.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/90 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Trị giá quy đổi: {confirmRedemptionReward.cost} Sao</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setConfirmRedemptionReward(null)}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Student info */}
              <div className="p-3.5 rounded-2xl bg-[#FAF5FF] border border-[#E9D5FF] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl candy-btn-purple text-white flex items-center justify-center font-black text-sm">
                    {getStudentInitials(selectedStudent.name)}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 text-sm">{selectedStudent.name}</div>
                    <div className="text-xs text-[#7E22CE] font-bold">Tổ {selectedStudent.group} • #{selectedStudent.securityCode}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 font-medium">Số dư hiện tại</div>
                  <div className="text-sm font-black text-amber-600">{selectedStudent.flowerPoints} ⭐</div>
                </div>
              </div>

              {/* Point math preview */}
              <div className="p-4 rounded-2xl bg-[#FAF5FF] border border-[#FCE7F3] text-xs space-y-2 font-medium">
                <div className="flex justify-between text-slate-600">
                  <span>Số Sao hiện có:</span>
                  <strong className="text-slate-900 font-bold">{selectedStudent.flowerPoints} ⭐</strong>
                </div>
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Số Sao bị trừ khi đổi:</span>
                  <span>-{confirmRedemptionReward.cost} ⭐</span>
                </div>
                <div className="flex justify-between border-t border-[#FCE7F3] pt-2 font-bold">
                  <span>Số Sao khả dụng còn lại:</span>
                  <span className="text-[#059669] font-black text-sm">
                    {selectedStudent.flowerPoints - confirmRedemptionReward.cost} ⭐
                  </span>
                </div>
                <div className="flex justify-between border-t border-dashed border-[#FCE7F3] pt-2 text-[11px] text-[#7E22CE] bg-white p-2 rounded-xl">
                  <span className="flex items-center gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Tổng điểm thi đua trọn đời:
                  </span>
                  <strong className="font-black text-[#581C87]">
                    {selectedStudent.lifetimePoints ?? selectedStudent.flowerPoints}đ (Bảo toàn)
                  </strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmRedemptionReward(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmRedeem}
                  className="candy-btn-purple px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md transition active:scale-95 flex items-center gap-2"
                >
                  <Gift className="w-4 h-4" />
                  <span>Xác nhận trao quà</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Reward */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border-2 border-[#FCE7F3] animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-500 stroke-[3]" />
                Thêm phần quà / đặc quyền mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateReward} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tên phần quà / đặc quyền:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Đổi chỗ ngồi 1 ngày, Nhạc theo yêu cầu..."
                  className="w-full px-3.5 py-2 bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số Sao quy đổi:</label>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    required
                    value={newCost}
                    onChange={(e) => setNewCost(parseInt(e.target.value) || 1)}
                    className="w-full px-3.5 py-2 bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-black text-amber-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số lượng trong kho:</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newStock}
                    onChange={(e) => setNewStock(parseInt(e.target.value) || 10)}
                    className="w-full px-3.5 py-2 bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phân loại:</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium"
                  >
                    <option value="privilege">👑 Đặc quyền lớp</option>
                    <option value="gift">🎁 Quà hiện vật</option>
                    <option value="honor">🏆 Vinh danh</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Màu sắc chủ đạo:</label>
                  <select
                    value={newThemeColor}
                    onChange={(e: any) => setNewThemeColor(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium"
                  >
                    <option value="purple">Tím mộng mơ</option>
                    <option value="blue">Xanh dương</option>
                    <option value="teal">Xanh ngọc</option>
                    <option value="orange">Cam năng động</option>
                    <option value="amber">Vàng rực rỡ</option>
                    <option value="emerald">Xanh lục</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Biểu tượng & Tranh minh họa:</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                    placeholder="Emoji (🎁, 🪑, 🎵...)"
                    className="w-full px-3.5 py-2 bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] text-center text-base"
                  />
                  <select
                    value={newIllustration}
                    onChange={(e) => setNewIllustration(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium"
                  >
                    <option value="seat_change">Đổi chỗ ngồi VIP</option>
                    <option value="music_request">Nhạc theo yêu cầu</option>
                    <option value="homework_pass">Phiếu miễn bài tập</option>
                    <option value="secret_gift">Hộp quà bí mật</option>
                    <option value="custom">Minh họa tổng hợp</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mô tả chi tiết:</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Mô tả quyền lợi hoặc thể lệ nhận quà..."
                  className="w-full px-3.5 py-2 bg-[#FAF5FF] border-2 border-[#FCE7F3] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A855F7] font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="candy-btn-purple px-5 py-2 font-black text-white rounded-xl shadow-md transition active:scale-95"
                >
                  Lưu quà mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
