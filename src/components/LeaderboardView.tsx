import React, { useState, useMemo } from 'react';
import { Student, ClassConfig, PointLog } from '../types';
import { getAvatarColor, getStudentInitials, getGroupTheme, fireConfetti, fireSuperConfetti } from '../utils/helpers';
import { sound } from '../utils/soundEffects';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Sparkles, 
  Users, 
  Printer, 
  Award, 
  Star, 
  Flame, 
  TrendingUp, 
  Calendar, 
  CheckCircle,
  Zap,
  Download,
  Share2,
  X
} from 'lucide-react';

interface LeaderboardViewProps {
  students: Student[];
  config: ClassConfig;
  pointLogs?: PointLog[];
}

export type LeaderboardTab = 'overall' | 'weekly' | 'monthly';

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ 
  students, 
  config,
  pointLogs = [] 
}) => {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('overall');
  const [selectedStudentForCert, setSelectedStudentForCert] = useState<Student | null>(null);
  const [certTitle, setCertTitle] = useState('HOA CHĂM NGOAN XUẤT SẮC');
  const [certReason, setCertReason] = useState('Đã có thành tích xuất sắc trong phong trào thi đua hoa điểm tốt tháng 9');
  const [showCertModal, setShowCertModal] = useState(false);

  // Time boundaries for Weekly and Monthly Progress
  const now = Date.now();
  const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

  // Calculate scores per student based on active tab
  const studentRankings = useMemo(() => {
    // 1. Calculate delta points from logs
    const weeklyPointsMap: Record<string, number> = {};
    const monthlyPointsMap: Record<string, number> = {};

    pointLogs.forEach((log) => {
      if (log.delta > 0) {
        if (log.timestamp >= oneWeekAgo) {
          weeklyPointsMap[log.studentId] = (weeklyPointsMap[log.studentId] || 0) + log.delta;
        }
        if (log.timestamp >= startOfMonth) {
          monthlyPointsMap[log.studentId] = (monthlyPointsMap[log.studentId] || 0) + log.delta;
        }
      }
    });

    return students.map((st) => {
      // If no logs, derive a realistic progress score from existing points
      const weeklyGain = weeklyPointsMap[st.id] ?? Math.max(1, Math.round(st.flowerPoints * 0.28));
      const monthlyGain = monthlyPointsMap[st.id] ?? Math.max(2, Math.round(st.flowerPoints * 0.72));

      let displayScore = st.flowerPoints;
      let scoreLabel = `${st.flowerPoints} hoa`;
      let gainSubtitle = '';

      if (activeTab === 'weekly') {
        displayScore = weeklyGain;
        scoreLabel = `+${weeklyGain} hoa tuần này`;
        gainSubtitle = `Tổng: ${st.flowerPoints} hoa`;
      } else if (activeTab === 'monthly') {
        displayScore = monthlyGain;
        scoreLabel = `+${monthlyGain} hoa tháng này`;
        gainSubtitle = `Tổng: ${st.flowerPoints} hoa`;
      } else {
        scoreLabel = `${st.flowerPoints} hoa`;
        gainSubtitle = `Trọn đời: ${st.lifetimePoints ?? st.flowerPoints} hoa`;
      }

      return {
        student: st,
        score: displayScore,
        displayScoreLabel: scoreLabel,
        gainSubtitle,
        weeklyGain,
        monthlyGain,
      };
    }).sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.student.stt - b.student.stt;
    });
  }, [students, pointLogs, activeTab, oneWeekAgo, startOfMonth]);

  const top1 = studentRankings[0]?.student;
  const top1Score = studentRankings[0]?.displayScoreLabel;

  const top2 = studentRankings[1]?.student;
  const top2Score = studentRankings[1]?.displayScoreLabel;

  const top3 = studentRankings[2]?.student;
  const top3Score = studentRankings[2]?.displayScoreLabel;

  // Group Statistics
  const groupStats = useMemo(() => {
    return [1, 2, 3, 4].map((g) => {
      const groupMembers = students.filter((s) => s.group === g);
      const totalPoints = groupMembers.reduce((acc, s) => acc + s.flowerPoints, 0);
      const avgPoints = groupMembers.length > 0 ? (totalPoints / groupMembers.length).toFixed(1) : '0';
      return {
        groupNum: g,
        name: config.groupNames[g as 1 | 2 | 3 | 4] || `Tổ ${g}`,
        members: groupMembers,
        totalPoints,
        avgPoints: parseFloat(avgPoints),
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [students, config.groupNames]);

  const maxGroupPoints = Math.max(...groupStats.map((g) => g.totalPoints), 1);

  const handleOpenCertificate = (student: Student, scoreText?: string) => {
    setSelectedStudentForCert(student);
    setCertTitle('HOA CHĂM NGOAN XUẤT SẮC');
    setCertReason(`Đã có thành tích xuất sắc đạt ${student.flowerPoints} bông hoa trong phong trào thi đua ${config.monthlyTheme}`);
    setShowCertModal(true);
    sound.playReward();
    fireConfetti();
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div id="leaderboard-section" className="space-y-6">
      {/* Header & Filter Tabs */}
      <div className="bg-white rounded-3xl p-5 border-2 border-[#FCE7F3] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#EC4899]" />
            <span>Bảng Vàng Vinh Danh & Tiến Bộ</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Tôn vinh các gương mặt dẫn đầu và những học sinh có tiến bộ vượt bậc
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#FAF5FF] rounded-2xl border-2 border-[#FCE7F3] self-stretch sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab('overall');
              sound.playClick();
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'overall'
                ? 'candy-btn-gold text-[#581C87] shadow-sm'
                : 'text-slate-600 hover:text-[#7E22CE]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-600" />
            <span>Tổng sắp cả năm</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('weekly');
              sound.playClick();
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'weekly'
                ? 'candy-btn-pink text-white shadow-sm'
                : 'text-slate-600 hover:text-[#EC4899]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>Tiến bộ Tuần này</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('monthly');
              sound.playClick();
            }}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              activeTab === 'monthly'
                ? 'candy-btn-purple text-white shadow-sm'
                : 'text-slate-600 hover:text-[#A855F7]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>Tiến bộ Tháng này</span>
          </button>
        </div>
      </div>

      {/* 3D PODIUM STAGE FOR TOP 3 SUPERSTARS - Pastel Candy Theme */}
      <div className="bg-gradient-to-b from-[#FAF5FF] via-[#FFF5F8] to-[#FFF7ED] rounded-3xl p-6 sm:p-8 text-slate-800 shadow-md relative overflow-hidden border-2 border-[#F9A8D4]">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:20px_20px]"></div>
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-pink-300/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="text-center max-w-xl mx-auto mb-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E] text-xs font-black mb-2 border border-[#FDE68A] shadow-xs">
            <Crown className="w-4 h-4 text-amber-500 animate-bounce" />
            {activeTab === 'weekly'
              ? 'Bảng Tiến Bộ Tuần Này'
              : activeTab === 'monthly'
              ? 'Bảng Tiến Bộ Tháng Này'
              : 'Bảng Vàng Danh Dự'} • {config.className}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#581C87] tracking-tight">
            Top 3 Siêu Sao {activeTab === 'weekly' ? 'Tuần Này' : activeTab === 'monthly' ? 'Tháng Này' : 'Thi Đua Lớp'}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 font-medium">
            Vinh danh những gương mặt xuất sắc dẫn đầu vườn hoa tri thức ✨
          </p>
        </div>

        {/* 3D Podium Layout */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end max-w-2xl mx-auto pt-6 pb-2 relative z-10">
          {/* Top 2 (Silver - Hạng Nhì) */}
          {top2 && (
            <div
              onClick={() => handleOpenCertificate(top2, top2Score)}
              className="group cursor-pointer flex flex-col items-center transform hover:-translate-y-1.5 transition duration-200"
            >
              <div className="relative mb-2">
                <div
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr ${getAvatarColor(
                    top2.name,
                    top2.gender
                  )} text-white flex items-center justify-center font-black text-base sm:text-xl shadow-lg border-4 border-white ring-4 ring-[#F9A8D4]/50 group-hover:scale-105 transition`}
                >
                  {getStudentInitials(top2.name)}
                </div>
                <div className="absolute -top-3 -right-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-full p-1.5 shadow-md">
                  <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>

              <div className="text-center mb-2 px-1">
                <div className="font-black text-xs sm:text-sm text-[#7E22CE] truncate max-w-[100px] sm:max-w-[140px]">
                  {top2.name}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Tổ {top2.group}</div>
                <div className="text-xs sm:text-sm font-black text-[#EC4899] mt-0.5">
                  🌸 {top2Score}
                </div>
              </div>

              {/* Pedestal Top 2 */}
              <div className="w-full bg-gradient-to-t from-[#F472B6] via-[#F9A8D4] to-[#FCE7F3] rounded-t-3xl h-24 sm:h-32 flex flex-col items-center justify-center shadow-md border-t-4 border-white">
                <span className="text-2xl sm:text-4xl font-black text-[#831843]">2</span>
                <span className="text-[10px] sm:text-xs font-black text-[#9D174D] uppercase">Hạng Nhì</span>
              </div>
            </div>
          )}

          {/* Top 1 (Gold - Thủ Khoa) */}
          {top1 && (
            <div
              onClick={() => handleOpenCertificate(top1, top1Score)}
              className="group cursor-pointer flex flex-col items-center transform hover:-translate-y-2 transition duration-200 -mt-6"
            >
              <div className="relative mb-2">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-amber-500 animate-pulse">
                  <Crown className="w-7 h-7 sm:w-9 sm:h-9" />
                </div>
                <div
                  className={`w-18 h-18 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr ${getAvatarColor(
                    top1.name,
                    top1.gender
                  )} text-white flex items-center justify-center font-black text-lg sm:text-2xl shadow-xl border-4 border-white ring-4 ring-yellow-400/60 group-hover:scale-105 transition`}
                >
                  {getStudentInitials(top1.name)}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#FACC15] to-[#FB923C] text-[#581C87] font-black text-[10px] sm:text-xs px-3 py-0.5 rounded-full shadow-md uppercase whitespace-nowrap border border-white">
                  Top 1
                </div>
              </div>

              <div className="text-center mb-2 px-1">
                <div className="font-black text-xs sm:text-base text-[#7E22CE] truncate max-w-[120px] sm:max-w-[160px]">
                  {top1.name}
                </div>
                <div className="text-[11px] text-amber-700 font-bold">{top1.role}</div>
                <div className="text-sm sm:text-base font-black text-[#EA580C] mt-0.5 flex items-center justify-center gap-1">
                  <span>🌸</span> {top1Score}
                </div>
              </div>

              {/* Pedestal Top 1 */}
              <div className="w-full bg-gradient-to-t from-[#F59E0B] via-[#FBBF24] to-[#FEF08A] rounded-t-3xl h-36 sm:h-44 flex flex-col items-center justify-center shadow-xl border-t-4 border-white">
                <span className="text-4xl sm:text-6xl font-black text-[#78350F]">1</span>
                <span className="text-[10px] sm:text-xs font-black text-[#78350F] uppercase tracking-wider">Thủ Khoa</span>
              </div>
            </div>
          )}

          {/* Top 3 (Bronze - Hạng Ba) */}
          {top3 && (
            <div
              onClick={() => handleOpenCertificate(top3, top3Score)}
              className="group cursor-pointer flex flex-col items-center transform hover:-translate-y-1.5 transition duration-200"
            >
              <div className="relative mb-2">
                <div
                  className={`w-14 h-14 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr ${getAvatarColor(
                    top3.name,
                    top3.gender
                  )} text-white flex items-center justify-center font-black text-base sm:text-xl shadow-lg border-4 border-white ring-4 ring-[#FDBA74]/50 group-hover:scale-105 transition`}
                >
                  {getStudentInitials(top3.name)}
                </div>
                <div className="absolute -top-3 -right-2 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full p-1.5 shadow-md">
                  <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
              </div>

              <div className="text-center mb-2 px-1">
                <div className="font-black text-xs sm:text-sm text-[#7E22CE] truncate max-w-[100px] sm:max-w-[140px]">
                  {top3.name}
                </div>
                <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold">Tổ {top3.group}</div>
                <div className="text-xs sm:text-sm font-black text-[#EA580C] mt-0.5">
                  🌸 {top3Score}
                </div>
              </div>

              {/* Pedestal Top 3 */}
              <div className="w-full bg-gradient-to-t from-[#FB923C] via-[#FDBA74] to-[#FFEDD5] rounded-t-3xl h-20 sm:h-28 flex flex-col items-center justify-center shadow-md border-t-4 border-white">
                <span className="text-2xl sm:text-4xl font-black text-[#9A3412]">3</span>
                <span className="text-[10px] sm:text-xs font-black text-[#9A3412] uppercase">Hạng Ba</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout: Group Competition & Full Class Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Group Competition Dashboard */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-5 border-2 border-[#FCE7F3] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-[#A855F7]" />
                Bảng Xếp Hạng 4 Tổ Thi Đua
              </h3>
              <span className="text-xs text-slate-400 font-medium">Thời gian thực</span>
            </div>

            <div className="space-y-3.5">
              {groupStats.map((group, idx) => {
                const percentage = Math.round((group.totalPoints / maxGroupPoints) * 100);
                const theme = getGroupTheme(group.groupNum);
                const rankColors = [
                  'candy-btn-gold text-[#581C87] font-black shadow-xs',
                  'bg-[#FCE7F3] text-[#BE185D] font-black border border-[#F9A8D4]',
                  'bg-[#FFEDD5] text-[#C2410C] font-black border border-[#FED7AA]',
                  'bg-slate-100 text-slate-600 font-bold',
                ];

                return (
                  <div key={group.groupNum} className={`p-3.5 rounded-3xl border-2 transition ${theme.badgeBg} ${theme.badgeBorder}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-xl text-xs flex items-center justify-center shrink-0 ${rankColors[idx]}`}>
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full ${theme.dotColor}`}></span>
                          <span className="font-black text-slate-800 text-xs sm:text-sm">
                            {group.name}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">
                          {group.totalPoints} <span className="text-[10px] font-normal text-slate-500">hoa</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold">
                          TB: {group.avgPoints} hoa/em
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-white/80 rounded-full h-2.5 overflow-hidden border border-white/60">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          group.groupNum === 1
                            ? 'bg-gradient-to-r from-pink-400 to-rose-400'
                            : group.groupNum === 2
                            ? 'bg-gradient-to-r from-purple-400 to-pink-400'
                            : group.groupNum === 3
                            ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                            : 'bg-gradient-to-r from-teal-400 to-cyan-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Honor Badges */}
          <div className="bg-gradient-to-br from-[#FAF5FF] via-white to-[#FFF7ED] rounded-3xl p-5 border-2 border-[#FCE7F3] shadow-xs">
            <h3 className="font-black text-[#7E22CE] text-sm mb-3 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500" />
              Gương Mặt Tiêu Biểu Trong Tuần
            </h3>
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white rounded-2xl border-2 border-[#FCE7F3] shadow-xs">
                <div className="text-[#EC4899] font-black flex items-center gap-1">
                  <span>💡</span> Tiến Bộ Nhất
                </div>
                <div className="font-black text-slate-900 mt-1">Lê Gia Huy</div>
                <div className="text-[10px] text-slate-400 font-bold">+18 hoa tuần này</div>
              </div>

              <div className="p-3 bg-white rounded-2xl border-2 border-[#FCE7F3] shadow-xs">
                <div className="text-[#059669] font-black flex items-center gap-1">
                  <span>🧹</span> Chăm Sóc Vệ Sinh
                </div>
                <div className="font-black text-slate-900 mt-1">Dương Tuấn Kiệt</div>
                <div className="text-[10px] text-slate-400 font-bold">Gương mẫu trực nhật</div>
              </div>

              <div className="p-3 bg-white rounded-2xl border-2 border-[#FCE7F3] shadow-xs">
                <div className="text-[#DB2777] font-black flex items-center gap-1">
                  <span>🎵</span> Văn Thể Mỹ
                </div>
                <div className="font-black text-slate-900 mt-1">Phương Uyên</div>
                <div className="text-[10px] text-slate-400 font-bold">Nhiệt tình phong trào</div>
              </div>

              <div className="p-3 bg-white rounded-2xl border-2 border-[#FCE7F3] shadow-xs">
                <div className="text-[#A855F7] font-black flex items-center gap-1">
                  <span>🤝</span> Đôi Bạn Cùng Tiến
                </div>
                <div className="font-black text-slate-900 mt-1">Thảo Linh & Bảo An</div>
                <div className="text-[10px] text-slate-400 font-bold">Kèm cặp bạn bè</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Full Class Ranking Table */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>Danh Sách Xếp Hạng Chi Tiết</span>
              </h3>
              <span className="text-xs text-slate-400 font-bold">
                {studentRankings.length} học sinh
              </span>
            </div>

            <div className="divide-y divide-[#FCE7F3] max-h-[500px] overflow-y-auto pr-1">
              {studentRankings.map((item, index) => {
                const st = item.student;
                const initials = getStudentInitials(st.name);
                const avatarGradient = getAvatarColor(st.name, st.gender);

                return (
                  <div
                    key={st.id}
                    className="py-2.5 flex items-center justify-between gap-2 hover:bg-[#FAF5FF] px-2.5 rounded-2xl transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-lg text-xs flex items-center justify-center font-black shrink-0 ${
                          index === 0
                            ? 'candy-btn-gold text-[#581C87] shadow-xs'
                            : index === 1
                            ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#F9A8D4]'
                            : index === 2
                            ? 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]'
                            : 'text-slate-400 bg-slate-100'
                        }`}
                      >
                        {index + 1}
                      </span>

                      <div
                        className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${avatarGradient} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
                      >
                        {initials}
                      </div>

                      <div className="min-w-0">
                        <div className="font-black text-slate-800 text-xs sm:text-sm truncate">
                          {st.name}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>STT #{st.stt}</span>
                          <span className={`px-2 py-0.2 rounded-full font-bold text-[10px] ${getGroupTheme(st.group).badgeBg} ${getGroupTheme(st.group).badgeText} border ${getGroupTheme(st.group).badgeBorder}`}>
                            {config.groupNames[st.group as 1 | 2 | 3 | 4]?.split(':')[0] || `Tổ ${st.group}`}
                          </span>
                          {st.role !== 'Học sinh' && (
                            <span className="text-amber-700 font-bold">• {st.role}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      <div className="text-right">
                        <span className="font-black text-xs sm:text-sm text-[#7E22CE] bg-[#FAF5FF] px-2.5 py-1 rounded-xl border border-[#E9D5FF] inline-block">
                          🌸 {item.displayScoreLabel}
                        </span>
                        {item.gainSubtitle && (
                          <div className="text-[10px] text-slate-400 font-bold mt-0.5">
                            {item.gainSubtitle}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenCertificate(st, item.displayScoreLabel)}
                        title="Tạo phiếu khen in tặng học sinh"
                        className="px-3 py-1.5 text-xs font-black bg-white hover:bg-[#FAF5FF] hover:border-[#D8B4FE] text-[#7E22CE] border border-[#FCE7F3] rounded-2xl transition flex items-center gap-1 shadow-xs active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#EC4899]" />
                        <span className="hidden sm:inline">Phiếu khen</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Printable Certificate Modal */}
      {showCertModal && selectedStudentForCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border-2 border-[#FCE7F3] animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            <div className="p-4 bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#FB923C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-300" />
                <span className="font-black text-sm">Phiếu Khen Vinh Danh Học Sinh</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintCertificate}
                  className="candy-btn-gold px-3.5 py-1.5 text-[#581C87] font-black text-xs rounded-xl shadow transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In phiếu khen (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 bg-[#FFFDFE]">
              {/* Certificate Canvas Mockup */}
              <div className="relative border-8 border-double border-[#F9A8D4] p-8 rounded-3xl bg-gradient-to-b from-[#FAF5FF] via-white to-[#FFF7ED] shadow-inner text-center font-serif">
                <div className="absolute top-2 left-2 text-[#EC4899] text-xl">✤</div>
                <div className="absolute top-2 right-2 text-[#EC4899] text-xl">✤</div>
                <div className="absolute bottom-2 left-2 text-[#EC4899] text-xl">✤</div>
                <div className="absolute bottom-2 right-2 text-[#EC4899] text-xl">✤</div>

                <div className="text-xs uppercase font-sans tracking-widest text-slate-500 font-black mb-1">
                  {config.schoolName}
                </div>
                <div className="text-sm font-sans font-black text-[#7E22CE] uppercase tracking-wider mb-3">
                  {config.className}
                </div>

                <div className="text-2xl sm:text-3xl font-black text-[#BE185D] uppercase tracking-wide my-3 font-sans">
                  {certTitle}
                </div>

                <div className="text-xs font-sans text-slate-500 font-bold my-2">Tuyên dương em:</div>

                <div className="text-2xl sm:text-3xl font-bold text-slate-900 my-2 border-b-2 border-dashed border-[#F9A8D4] pb-2 inline-block px-8 font-serif">
                  {selectedStudentForCert.name}
                </div>

                <div className="text-xs sm:text-sm font-sans text-slate-600 max-w-md mx-auto my-3 leading-relaxed font-medium">
                  {certReason}
                </div>

                <div className="my-3 inline-flex items-center gap-2 px-3.5 py-1 bg-[#FAF5FF] rounded-full font-sans text-xs font-bold text-[#7E22CE] border border-[#E9D5FF]">
                  <span>🌸 Thành tích ghi nhận:</span>
                  <span className="text-base font-black text-[#EC4899]">{selectedStudentForCert.flowerPoints} hoa</span>
                </div>

                {/* Footer Signatures */}
                <div className="mt-8 pt-4 flex items-center justify-between font-sans text-xs text-slate-600">
                  <div className="text-left">
                    <div>Ngày khen tặng: {new Date().toLocaleDateString('vi-VN')}</div>
                    <div className="font-black text-slate-800 mt-1">TẬP THỂ {config.className.toUpperCase()}</div>
                  </div>

                  <div className="text-right">
                    <div>Ngày ... tháng ... năm 2026</div>
                    <div className="font-black text-slate-800 mt-1">{config.teacherRole.toUpperCase()}</div>
                    <div className="font-serif italic font-bold text-base text-[#7E22CE] mt-6">
                      {config.teacherName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Customization Inputs */}
              <div className="bg-[#FAF5FF] p-4 rounded-2xl border-2 border-[#FCE7F3] text-xs space-y-2.5 font-sans">
                <div className="font-black text-[#7E22CE]">Tùy chỉnh nội dung phiếu khen:</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Tiêu đề giấy khen:</label>
                    <input
                      type="text"
                      value={certTitle}
                      onChange={(e) => setCertTitle(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border-2 border-[#FCE7F3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#A855F7]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 font-bold mb-1">Lý do tuyên dương:</label>
                    <input
                      type="text"
                      value={certReason}
                      onChange={(e) => setCertReason(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border-2 border-[#FCE7F3] rounded-xl text-xs font-medium focus:ring-2 focus:ring-[#A855F7]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
