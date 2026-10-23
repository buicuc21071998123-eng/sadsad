import React, { useState, useRef } from 'react';
import { Student, ClassConfig, DailyAttendance, PointLog, RewardItem, ActiveTab } from '../types';
import { 
  Trophy, 
  Sparkles, 
  Crown, 
  TrendingUp, 
  Users, 
  UserCheck,
  UserX, 
  Gift, 
  Timer, 
  Image as ImageIcon, 
  Palette, 
  ArrowRight,
  Flame,
  Star,
  Award,
  ChevronRight,
  Clock,
  Mic,
  Camera,
  Trash2,
  Calendar,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getStudentAvatarUrl, compressImage } from '../utils/imageUtils';
import { sound } from '../utils/soundEffects';
import { GardenHeroBanner } from './GardenHeroBanner';
import { TeacherAvatar } from './TeacherAvatar';
import { TeacherAvatarModal } from './TeacherAvatarModal';

interface DashboardViewProps {
  students: Student[];
  config: ClassConfig;
  attendance: DailyAttendance;
  pointLogs: PointLog[];
  rewards?: RewardItem[];
  onUpdateConfig: (config: ClassConfig) => void;
  onNavigateTab?: (tab: ActiveTab) => void;
  onChangeTab?: (tab: ActiveTab) => void;
  onSelectStudent?: (student: Student) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  config,
  attendance,
  pointLogs,
  onUpdateConfig,
  onNavigateTab,
  onChangeTab,
  onSelectStudent,
}) => {
  const [showBannerEditor, setShowBannerEditor] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [showTeacherAvatarModal, setShowTeacherAvatarModal] = useState(false);
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleNavigate = (tab: ActiveTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else if (onChangeTab) {
      onChangeTab(tab);
    }
  };

  // 1. Sĩ số & Điểm danh
  const totalStudents = students.length;
  
  // Calculate attendance counts from records
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;

  students.forEach((s) => {
    const rec = attendance.records?.[s.id];
    const status = rec?.status || 'present';
    if (status === 'present') presentCount++;
    else if (status === 'absent_unexcused' || status === 'unexcused') absentCount++;
    else if (status === 'absent_excused' || status === 'excused') excusedCount++;
    else if (status === 'late') lateCount++;
    else presentCount++; // default present
  });

  // 2. Leaderboard Top 1 & Top 3 Students
  const sortedStudents = [...students].sort((a, b) => b.flowerPoints - a.flowerPoints);
  const top1 = sortedStudents[0];
  const top2 = sortedStudents[1];
  const top3 = sortedStudents[2];

  // 3. Top Tổ Thi Đua
  // Aggregate points by group
  const groupScores: Record<number, { name: string; totalPoints: number; count: number }> = {
    1: { name: 'Tổ 1', totalPoints: 0, count: 0 },
    2: { name: 'Tổ 2', totalPoints: 0, count: 0 },
    3: { name: 'Tổ 3', totalPoints: 0, count: 0 },
    4: { name: 'Tổ 4', totalPoints: 0, count: 0 },
  };

  students.forEach((s) => {
    const g = s.group || 1;
    if (!groupScores[g]) {
      groupScores[g] = { name: `Tổ ${g}`, totalPoints: 0, count: 0 };
    }
    groupScores[g].totalPoints += s.flowerPoints;
    groupScores[g].count += 1;
  });

  const sortedGroups = Object.entries(groupScores)
    .map(([groupNum, data]) => ({
      group: parseInt(groupNum),
      name: data.name,
      totalPoints: data.totalPoints,
      count: data.count,
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const leadingGroup = sortedGroups[0];

  // 4. Hoạt động điểm gần đây (Recent 5 logs)
  const recentLogs = pointLogs.slice(0, 6);

  // Handle Banner Upload
  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      const compressedBase64 = await compressImage(file, 1200, 450, 0.85);
      onUpdateConfig({
        ...config,
        bannerBgImage: compressedBase64,
      });
      sound.playReward();
      setShowBannerEditor(false);
    } catch (err) {
      console.error('Error compressing banner:', err);
      alert('Không thể tải ảnh banner, vui lòng thử ảnh khác');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* Teacher Avatar Modal */}
      <TeacherAvatarModal
        isOpen={showTeacherAvatarModal}
        currentAvatarUrl={config.teacherAvatarUrl}
        teacherName={config.teacherName || 'Cô Bùi Thị Cúc'}
        teacherRole={config.teacherRole || 'Giáo viên chủ nhiệm'}
        onClose={() => setShowTeacherAvatarModal(false)}
        onSaveAvatar={(newAvatarUrl) => {
          onUpdateConfig({
            ...config,
            teacherAvatarUrl: newAvatarUrl,
          });
        }}
      />

      {/* 1. HEADER CHÍNH: # LỚP HỌC HẠNH PHÚC */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-left">
          <TeacherAvatar
            avatarUrl={config.teacherAvatarUrl}
            teacherName={config.teacherName || 'Cô Bùi Thị Cúc'}
            teacherRole={config.teacherRole || 'Giáo viên chủ nhiệm'}
            size="responsive"
            shape="circle"
          />

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-100/80 text-pink-700 text-xs font-black border border-pink-200">
              <span>💖</span>
              <span># LỚP HỌC HẠNH PHÚC</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              {config.className || 'Lớp 4A2'} • {config.teacherName || 'Cô Bùi Thị Cúc'}
            </h1>
            <p className="text-xs sm:text-sm text-purple-900 font-semibold max-w-lg">
              {config.smallMessage || 'Mỗi ngày đến trường là một ngày vui, cùng nhau tích lũy kiến thức và gieo mầm yêu thương!'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowTeacherAvatarModal(true)}
            className="px-4 py-2.5 rounded-2xl candy-btn-purple text-white text-xs font-black shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-yellow-200" />
            <span>{config.teacherAvatarUrl ? '📷 ĐỔI ẢNH GV' : '📷 TẢI ẢNH GV'}</span>
          </button>

          {config.teacherAvatarUrl && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Thầy cô có chắc muốn xóa ảnh đại diện giáo viên?')) {
                  onUpdateConfig({ ...config, teacherAvatarUrl: undefined });
                  sound.playClick();
                }
              }}
              className="p-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition active:scale-95 cursor-pointer"
              title="Xóa ảnh đại diện"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 2. HERO BANNER HOẠT HÌNH & TÙY BIẾN */}
      <div className="space-y-3">
        <div className="relative">
          <GardenHeroBanner
            bannerTitle={config.bannerTitle}
            bannerSubtitle={config.bannerSubtitle}
            teacherName={config.teacherName}
            classNameName={config.className}
            smallMessage={config.smallMessage}
            customImage={config.bannerBgImage}
            teacherAvatarUrl={config.teacherAvatarUrl}
            onTeacherClick={() => setShowTeacherAvatarModal(true)}
            showEditButton={true}
            onEditBanner={() => setShowBannerEditor(!showBannerEditor)}
          />

          <button
            onClick={() => setShowBannerEditor(!showBannerEditor)}
            className="absolute top-3 right-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/90 hover:bg-white border border-[#76C7FF] text-xs font-black text-[#0284C7] shadow-md backdrop-blur-sm transition active:scale-95 z-20 cursor-pointer"
          >
            <Palette className="w-4 h-4 text-amber-500" />
            <span>Tùy chỉnh Banner</span>
          </button>
        </div>

        {showBannerEditor && (
          <div className="bg-white rounded-3xl p-5 border-2 border-[#D9F0FF] shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#0D579B] mb-2">
                  Tải ảnh banner tùy chỉnh:
                </h4>
                <input
                  ref={bannerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => bannerFileInputRef.current?.click()}
                    disabled={isUploadingBanner}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#4DA8FF] hover:bg-[#3b93e6] text-white text-xs font-black shadow-sm transition cursor-pointer"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>{isUploadingBanner ? 'Đang tải...' : 'Chọn ảnh banner từ máy'}</span>
                  </button>
                  {config.bannerBgImage && (
                    <button
                      onClick={() => {
                        onUpdateConfig({ ...config, bannerBgImage: undefined });
                        sound.playClick();
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                    >
                      Dùng lại Banner Hoạt Hình
                    </button>
                  )}
                </div>
              </div>

              <div className="text-xs text-slate-500 max-w-xs">
                💡 Giáo viên có thể tải lên ảnh trang trí lớp học tùy thích để hiển thị đầu trang chủ.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. THỐNG KÊ TỔNG QUAN (QUICK STATS CARDS) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* 1. Tổng số học sinh */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#F3E8FF] shadow-sm shadow-purple-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#EC4899] text-white flex items-center justify-center font-black shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-[#7E22CE] truncate">Tổng Sĩ Số</div>
            <div className="text-xl sm:text-2xl font-black text-slate-800">{totalStudents} <span className="text-xs font-bold text-slate-400">em</span></div>
          </div>
        </div>

        {/* 2. Có mặt hôm nay */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-emerald-100 shadow-sm shadow-emerald-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
            <UserCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-emerald-700 truncate">🟢 Có Mặt</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-800">{presentCount} <span className="text-xs font-bold text-slate-400">em</span></div>
          </div>
        </div>

        {/* 3. Vắng hôm nay */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#FCE7F3] shadow-sm shadow-pink-100 flex items-center gap-3.5">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black shrink-0 shadow-sm ${
            absentCount + excusedCount > 0 
              ? 'bg-gradient-to-br from-rose-400 to-pink-600 text-white' 
              : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'
          }`}>
            <UserX className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-rose-700 truncate">🔴 Vắng Hôm Nay</div>
            <div className={`text-xl sm:text-2xl font-black ${absentCount + excusedCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
              {absentCount + excusedCount} <span className="text-xs font-bold text-slate-400">{absentCount + excusedCount > 0 ? 'em' : 'Đủ'}</span>
            </div>
          </div>
        </div>

        {/* 4. Top 1 Cá nhân */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-[#FEF3C7] shadow-sm shadow-amber-100 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#FACC15] to-[#FB923C] text-amber-950 flex items-center justify-center font-black shrink-0 shadow-sm">
            <Crown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-amber-800 truncate">⭐ Dẫn Đầu Cá Nhân</div>
            <div className="text-sm sm:text-base font-black text-slate-800 truncate">
              {top1 ? top1.name : 'Chưa có'}
            </div>
            {top1 && (
              <div className="text-[11px] font-extrabold text-pink-600">{top1.flowerPoints} ⭐ điểm</div>
            )}
          </div>
        </div>

        {/* 5. Tổ dẫn đầu */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-sky-100 shadow-sm shadow-sky-100 flex items-center gap-3.5 col-span-2 lg:col-span-1">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white flex items-center justify-center font-black shrink-0 shadow-sm">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-sky-800 truncate">🏆 Tổ Dẫn Đầu</div>
            <div className="text-sm sm:text-base font-black text-slate-800 truncate">
              {leadingGroup ? leadingGroup.name : 'Tổ 1'}
            </div>
            {leadingGroup && (
              <div className="text-[11px] font-extrabold text-indigo-600">{leadingGroup.totalPoints} ⭐ tổng</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. PODIUM TOP 3 & HOẠT ĐỘNG GẦN ĐÂY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Podium Top 3 (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border-2 border-[#FCE7F3] flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#FCE7F3]">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FACC15] to-[#FB923C] text-[#581C87] flex items-center justify-center font-black shadow-sm">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Bảng Vàng Vinh Danh
                </h3>
                <p className="text-xs text-[#DB2777] font-bold">
                  Top 3 học sinh xuất sắc dẫn đầu vườn hoa thi đua
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleNavigate('garden')}
              className="flex items-center gap-1 text-xs font-black text-[#A855F7] hover:text-[#7E22CE] bg-[#FAF5FF] px-3 py-1 rounded-full border border-[#E9D5FF] transition cursor-pointer"
            >
              <span>Vào Vườn</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Podium 3 Steps */}
          {students.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs font-bold">
              Chưa có học sinh trong danh sách.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:gap-3 items-end pt-4">
              {/* Top 2 - Silver */}
              {top2 && (
                <div 
                  onClick={() => onSelectStudent?.(top2)}
                  className="cursor-pointer group flex flex-col items-center text-center transition transform hover:-translate-y-1"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-slate-300 bg-slate-100 overflow-hidden shadow-md p-0.5">
                      <img
                        src={getStudentAvatarUrl(top2)}
                        alt={top2.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-slate-600 text-white text-[10px] font-black shadow">
                      Top 2
                    </div>
                  </div>
                  <div className="font-black text-xs text-slate-800 truncate max-w-[90px] sm:max-w-[110px] mt-1 group-hover:text-purple-700">
                    {top2.name}
                  </div>
                  <div className="text-[11px] font-extrabold text-purple-700">
                    {top2.flowerPoints} ⭐
                  </div>
                  <div className="w-full mt-2 h-20 sm:h-24 rounded-t-2xl bg-gradient-to-b from-slate-200 to-slate-300 border-t-4 border-slate-400 flex flex-col items-center justify-center p-1">
                    <span className="text-xl font-black text-slate-700">🥈</span>
                    <span className="text-[10px] font-bold text-slate-600">Tổ {top2.group}</span>
                  </div>
                </div>
              )}

              {/* Top 1 - Gold (Center) */}
              {top1 && (
                <div 
                  onClick={() => onSelectStudent?.(top1)}
                  className="cursor-pointer group flex flex-col items-center text-center transition transform hover:-translate-y-1.5"
                >
                  <div className="relative mb-2">
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-500">
                      <Crown className="w-6 h-6 fill-amber-400 animate-bounce-subtle" />
                    </div>
                    <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-amber-400 bg-amber-50 overflow-hidden shadow-xl p-0.5 ring-4 ring-amber-300/40">
                      <img
                        src={getStudentAvatarUrl(top1)}
                        alt={top1.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-black shadow-md">
                      Quán quân 👑
                    </div>
                  </div>
                  <div className="font-black text-xs sm:text-sm text-slate-900 truncate max-w-[100px] sm:max-w-[130px] mt-1 group-hover:text-amber-700">
                    {top1.name}
                  </div>
                  <div className="text-xs font-black text-amber-700">
                    {top1.flowerPoints} ⭐
                  </div>
                  <div className="w-full mt-2 h-28 sm:h-32 rounded-t-2xl bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 border-t-4 border-amber-500 flex flex-col items-center justify-center p-1 shadow-inner">
                    <span className="text-2xl font-black text-amber-900">🥇</span>
                    <span className="text-[10px] font-black text-amber-900">Tổ {top1.group}</span>
                  </div>
                </div>
              )}

              {/* Top 3 - Bronze */}
              {top3 && (
                <div 
                  onClick={() => onSelectStudent?.(top3)}
                  className="cursor-pointer group flex flex-col items-center text-center transition transform hover:-translate-y-1"
                >
                  <div className="relative mb-2">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-amber-600 bg-amber-50 overflow-hidden shadow-md p-0.5">
                      <img
                        src={getStudentAvatarUrl(top3)}
                        alt={top3.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-800 text-white text-[10px] font-black shadow">
                      Top 3
                    </div>
                  </div>
                  <div className="font-black text-xs text-slate-800 truncate max-w-[90px] sm:max-w-[110px] mt-1 group-hover:text-amber-800">
                    {top3.name}
                  </div>
                  <div className="text-[11px] font-extrabold text-amber-800">
                    {top3.flowerPoints} ⭐
                  </div>
                  <div className="w-full mt-2 h-16 sm:h-20 rounded-t-2xl bg-gradient-to-b from-orange-200 to-orange-300 border-t-4 border-orange-400 flex flex-col items-center justify-center p-1">
                    <span className="text-xl font-black text-orange-800">🥉</span>
                    <span className="text-[10px] font-bold text-orange-800">Tổ {top3.group}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Hoạt động điểm gần đây (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border-2 border-[#FCE7F3] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2.5 pb-4 mb-3 border-b-2 border-[#FCE7F3]">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 text-white flex items-center justify-center font-black shadow-sm">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800">
                  Hoạt Động Gần Đây
                </h3>
                <p className="text-xs text-[#DB2777] font-bold">
                  Nhật ký khen thưởng và ghi nhận mới nhất
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs font-semibold text-slate-400">
                  Chưa có hoạt động điểm gần đây
                </div>
              ) : (
                recentLogs.map((log) => {
                  const student = students.find((s) => s.id === log.studentId);
                  const isPositive = log.delta > 0;
                  return (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg shrink-0">
                          {isPositive ? '⭐' : '⚠️'}
                        </span>
                        <div className="min-w-0">
                          <div className="font-black text-xs text-slate-800 truncate">
                            {student?.name || log.studentName || 'Học sinh'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {log.reason || 'Khen thưởng'}
                          </div>
                        </div>
                      </div>

                      <div className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                        isPositive 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}>
                        {isPositive ? `+${log.delta}` : log.delta} ⭐
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => handleNavigate('garden')}
            className="w-full py-2.5 rounded-2xl candy-btn-purple text-white font-black text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Xem chi tiết Vườn thành tích</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
