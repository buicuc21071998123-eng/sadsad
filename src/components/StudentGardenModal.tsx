import React, { useState } from 'react';
import { Student, ClassConfig } from '../types';
import { 
  getTreeEvolutionInfo, 
  DREAM_TREE_STAGES, 
  GARDEN_COLLECTION_FLOWERS,
  MILESTONE_REWARDS 
} from '../data/dreamTreeData';
import { getAvatarColor, getStudentInitials, getGroupName, getGroupTheme, fireConfetti } from '../utils/helpers';
import { sound } from '../utils/soundEffects';
import { 
  X, 
  Trophy, 
  Sparkles, 
  Shield, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Award, 
  Calendar, 
  HeartHandshake,
  Star,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StudentGardenModalProps {
  student: Student | null;
  config: ClassConfig;
  isOpen: boolean;
  onClose: () => void;
  onGrantShield?: (studentId: string) => void;
}

export const StudentGardenModal: React.FC<StudentGardenModalProps> = ({
  student,
  config,
  isOpen,
  onClose,
  onGrantShield,
}) => {
  const [activeTab, setActiveTab] = useState<'garden' | 'roadmap' | 'shields'>('garden');

  if (!isOpen || !student) return null;

  const info = getTreeEvolutionInfo(student.flowerPoints);
  const groupTheme = getGroupTheme(student.group);
  const initials = getStudentInitials(student.name);
  const avatarGradient = getAvatarColor(student.name, student.gender);
  const currentShields = student.shields || 0;

  const handleShieldAdd = () => {
    if (currentShields >= 2) return;
    sound.playShieldProtect();
    fireConfetti();
    if (onGrantShield) {
      onGrantShield(student.id);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/40 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl shadow-2xl border-2 border-[#FCE7F3] w-full max-w-2xl overflow-hidden my-auto"
        >
          {/* Header with Student Profile & Dream Tree Status */}
          <div className="relative bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FB923C] text-white p-5 sm:p-6 overflow-hidden">
            {/* Ambient background patterns */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 rounded-full bg-white/15 blur-xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-1/3 -mb-10 w-32 h-32 rounded-full bg-yellow-300/20 blur-lg pointer-events-none"></div>

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${avatarGradient} flex items-center justify-center font-black text-xl text-white shadow-md border-2 border-white/50 shrink-0`}>
                  {initials}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                      {student.name}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/25 text-white border border-white/30 backdrop-blur-xs">
                      STT #{student.stt}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/25 text-white border border-white/30 backdrop-blur-xs">
                      {config.groupNames[student.group as 1 | 2 | 3 | 4]?.split(':')[0] || `Tổ ${student.group}`}
                    </span>
                  </div>

                  <p className="text-xs text-pink-100 font-medium mt-1 flex items-center gap-1.5 flex-wrap">
                    <span>🌳 Cây Ước Mơ: <b className="text-amber-200 font-black">{info.currentStage.name} ({info.currentStage.icon})</b></span>
                    <span>• Tổng điểm: <b className="text-white font-black">{student.flowerPoints} ✨</b></span>
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Tabs */}
            <div className="flex items-center gap-2 mt-5 bg-white/20 p-1.5 rounded-2xl backdrop-blur-xs border border-white/30">
              <button
                onClick={() => setActiveTab('garden')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'garden'
                    ? 'bg-white text-[#7E22CE] shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Vườn Thành Tích ({info.bloomedFlowersCount})
              </button>

              <button
                onClick={() => setActiveTab('roadmap')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'roadmap'
                    ? 'bg-white text-[#7E22CE] shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                20 Cấp Tiến Hóa
              </button>

              <button
                onClick={() => setActiveTab('shields')}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'shields'
                    ? 'bg-white text-[#7E22CE] shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                Lá Chắn ({currentShields}/2)
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 max-h-[60vh] overflow-y-auto bg-[#FFFDFE]">
            {/* TAB 1: VƯỜN THÀNH TÍCH (Flower Collections) */}
            {activeTab === 'garden' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-[#7E22CE] flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      Bộ Sưu Tập Hoa Ước Mơ (Mỗi 100 điểm = 1 Đóa Hoa)
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Khi đạt đủ 100 điểm, hoa sẽ tự động nở và được lưu giữ mãi mãi trong Vườn Thành Tích của em.
                    </p>
                  </div>

                  <span className="text-xs font-black px-3 py-1 rounded-full bg-[#FAF5FF] text-[#7E22CE] border-2 border-[#E9D5FF] shrink-0">
                    Đã nở: {info.bloomedFlowersCount} đóa
                  </span>
                </div>

                {/* Flower Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {GARDEN_COLLECTION_FLOWERS.map((fl) => {
                    const isUnlocked = student.flowerPoints >= fl.targetPoints;
                    const isCurrentGoal = !isUnlocked && student.flowerPoints >= fl.targetPoints - 100;
                    const progressInGoal = isCurrentGoal
                      ? Math.min(100, student.flowerPoints % 100)
                      : isUnlocked
                      ? 100
                      : 0;

                    return (
                      <div
                        key={fl.cycle}
                        className={`p-3.5 rounded-3xl border-2 transition relative overflow-hidden ${
                          isUnlocked
                            ? 'bg-gradient-to-br from-white to-[#FFF7ED] border-[#FDBA74] shadow-xs'
                            : isCurrentGoal
                            ? 'bg-gradient-to-br from-[#FAF5FF] to-[#FDF2F8] border-[#F9A8D4] shadow-xs ring-2 ring-[#EC4899]/20'
                            : 'bg-[#FAF5FF]/50 border-slate-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs shrink-0 ${
                            isUnlocked
                              ? `bg-gradient-to-br ${fl.bgGradient} text-white shadow-amber-400/30`
                              : isCurrentGoal
                              ? 'bg-[#FCE7F3] text-[#DB2777] animate-pulse'
                              : 'bg-slate-200 text-slate-400'
                          }`}>
                            {isUnlocked ? fl.icon : isCurrentGoal ? fl.icon : <Lock className="w-5 h-5 text-slate-400" />}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h5 className="font-black text-xs sm:text-sm text-slate-800 truncate">
                                {fl.name}
                              </h5>
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                                isUnlocked
                                  ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                                  : isCurrentGoal
                                  ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                                  : 'bg-slate-200 text-slate-500'
                              }`}>
                                {fl.targetPoints}đ
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-2">
                              {fl.meaning}
                            </p>

                            {/* Progress bar if current goal */}
                            {isCurrentGoal && (
                              <div className="mt-2 space-y-0.5">
                                <div className="flex justify-between text-[10px] text-[#BE185D] font-bold">
                                  <span>Đang tiến độ: {student.flowerPoints % 100}/100đ</span>
                                  <span>{100 - (student.flowerPoints % 100)}đ nữa nở</span>
                                </div>
                                <div className="w-full bg-[#FCE7F3] rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${progressInGoal}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {isUnlocked && (
                              <div className="mt-1.5 flex items-center gap-1 text-[11px] font-black text-[#059669]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Đã hoàn thành xuất sắc!</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: 20 CẤP TIẾN HÓA (Evolution Roadmap) & MỐC PHẦN THƯỞNG */}
            {activeTab === 'roadmap' && (
              <div className="space-y-4">
                {/* Milestone Rewards Section */}
                <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FFF7ED] via-[#FEF3C7] to-[#FFFBEB] border-2 border-[#FDE68A] space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-600" />
                      Mốc Phần Thưởng Đặc Quyền (Không Trừ Điểm)
                    </h4>
                    <span className="text-[11px] font-bold text-amber-700">Tự động mở khóa</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {MILESTONE_REWARDS.map((ms) => {
                      const isUnlocked = info.currentCyclePoints >= ms.points;
                      return (
                        <div
                          key={ms.points}
                          className={`p-2.5 rounded-2xl border-2 flex items-center gap-2.5 transition ${
                            isUnlocked
                              ? 'bg-white border-[#FACC15] shadow-xs'
                              : 'bg-white/60 border-amber-100/80 opacity-75'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${
                            isUnlocked ? 'bg-[#FEF3C7] text-amber-900' : 'bg-slate-100 text-slate-400'
                          }`}>
                            {ms.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-black text-slate-800 truncate">{ms.title}</span>
                              <span className={`text-[10px] font-black px-2 py-0.2 rounded-full ${
                                isUnlocked ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-slate-200 text-slate-600'
                              }`}>
                                {ms.points}đ
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium truncate">{ms.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <h4 className="text-sm font-black text-[#7E22CE] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#EC4899]" />
                    Lộ Trình 20 Bước Tiến Hóa (0 ➔ 100 điểm)
                  </h4>
                  <span className="text-xs font-bold text-slate-500">
                    Cứ +5 điểm = 1 lần tiến hóa
                  </span>
                </div>

                <div className="divide-y divide-[#FCE7F3] border-2 border-[#FCE7F3] rounded-3xl overflow-hidden bg-white">
                  {DREAM_TREE_STAGES.map((stg) => {
                    const isPassed = info.currentCyclePoints >= stg.points;
                    const isCurrent = info.step === stg.step;

                    return (
                      <div
                        key={stg.step}
                        className={`p-2.5 sm:p-3 flex items-center justify-between gap-3 transition ${
                          isCurrent
                            ? 'bg-[#FEF3C7]/90 font-bold border-l-4 border-l-[#F59E0B]'
                            : isPassed
                            ? 'bg-[#FAF5FF]'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 ${
                            isCurrent
                              ? 'candy-btn-gold text-amber-950 shadow-xs'
                              : isPassed
                              ? 'bg-[#F3E8FF] text-[#7E22CE]'
                              : 'bg-slate-100 text-slate-400'
                          }`}>
                            {stg.icon}
                          </div>

                          <div className="truncate">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-slate-800">
                                Cấp {stg.step}: {stg.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] font-black px-2 py-0.2 rounded-full bg-[#FACC15] text-[#78350F]">
                                  HIỆN TẠI
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium truncate">
                              {stg.description}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                            isPassed
                              ? 'bg-[#F3E8FF] text-[#7E22CE] border border-[#D8B4FE]'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {stg.points}đ
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: LÁ CHẮN BẢO VỆ (Guardian Shield) */}
            {activeTab === 'shields' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-gradient-to-r from-[#FAF5FF] via-[#FDF2F8] to-[#FFF7ED] border-2 border-[#F9A8D4]">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#EC4899] text-white flex items-center justify-center shrink-0 shadow-md">
                      <ShieldCheck className="w-7 h-7" />
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-[#7E22CE]">
                        Cơ Chế Lá Chắn Bảo Vệ (Tối đa 2 Lá chắn)
                      </h4>
                      <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                        🛡️ <b>Lá Chắn Bảo Vệ</b> giúp học sinh được bảo toàn điểm số khi lỡ vi phạm lần đầu hoặc đi học muộn một buổi (Tự động kích hoạt để không bị trừ điểm).
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-3xl bg-white border-2 border-[#FCE7F3] flex items-center justify-between shadow-xs">
                  <div>
                    <div className="text-xs text-slate-500 font-bold">Lá chắn hiện có:</div>
                    <div className="text-2xl font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <span>{currentShields}/2</span>
                      <div className="flex items-center gap-1">
                        {[1, 2].map((num) => (
                          <Shield
                            key={num}
                            className={`w-5 h-5 ${
                              num <= currentShields
                                ? 'text-[#EC4899] fill-[#F9A8D4]'
                                : 'text-slate-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleShieldAdd}
                    disabled={currentShields >= 2}
                    className={`candy-btn-purple px-4 py-2.5 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shadow-md ${
                      currentShields >= 2 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    + Thưởng 1 Lá Chắn (5 ngày đúng giờ / Việc tốt)
                  </button>
                </div>

                {/* How to earn shields list */}
                <div className="space-y-2">
                  <h5 className="text-xs font-black text-[#7E22CE] uppercase tracking-wider">
                    Cách Nhận Thêm Lá Chắn Bảo Vệ:
                  </h5>
                  <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                    <li className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#FAF5FF] border border-[#F3E8FF]">
                      <span className="text-[#A855F7] font-black">✓</span>
                      <span>Đi học đúng giờ <b>5 ngày liên tiếp</b></span>
                    </li>
                    <li className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#FAF5FF] border border-[#F3E8FF]">
                      <span className="text-[#A855F7] font-black">✓</span>
                      <span>Giúp đỡ bạn tiến bộ vượt bậc hoặc đạt điểm 10 kiểm tra</span>
                    </li>
                    <li className="flex items-center gap-2 p-2.5 rounded-2xl bg-[#FAF5FF] border border-[#F3E8FF]">
                      <span className="text-[#A855F7] font-black">✓</span>
                      <span>Cô giáo khen thưởng trực tiếp trong các dịp sinh hoạt lớp</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-[#FFF7ED] border-t-2 border-[#FED7AA] flex items-center justify-between">
            <div className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              Mọi thành tích đều được lưu trữ vĩnh viễn
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-black bg-white hover:bg-slate-100 text-slate-700 rounded-2xl transition border border-slate-300 shadow-xs"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
