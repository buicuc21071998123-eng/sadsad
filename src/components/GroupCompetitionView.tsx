import React, { useState, useMemo, useEffect } from 'react';
import { Student, ClassConfig, PointCategory } from '../types';
import { getGroupTheme, getGroupName, getAvatarColor, getStudentInitials, fireConfetti, fireSuperConfetti } from '../utils/helpers';
import { sound } from '../utils/soundEffects';
import { 
  Trophy, 
  Crown, 
  Sparkles, 
  Users, 
  Dices, 
  Star, 
  Flame, 
  Award, 
  RotateCcw, 
  CheckCircle2, 
  ArrowUpRight, 
  Gift, 
  ShieldCheck, 
  Zap, 
  Layers, 
  PartyPopper,
  Volume2,
  ChevronRight,
  TrendingUp,
  Plus
} from 'lucide-react';

interface GroupCompetitionViewProps {
  students: Student[];
  config: ClassConfig;
  onAwardPoints: (studentIds: string[], delta: number, reason: string, category: PointCategory) => void;
}

export const GroupCompetitionView: React.FC<GroupCompetitionViewProps> = ({
  students,
  config,
  onAwardPoints,
}) => {
  const [selectedGroupTab, setSelectedGroupTab] = useState<number | 'all'>('all');
  
  // Interactive Tool States
  const [activeTool, setActiveTool] = useState<'rep_picker' | 'lucky_wheel' | 'none'>('none');
  
  // Representative Picker State
  const [repPickerTarget, setRepPickerTarget] = useState<1 | 2 | 3 | 4 | 'all_4'>(1);
  const [pickedRepresentatives, setPickedRepresentatives] = useState<{ groupNum: number; student: Student }[]>([]);
  const [isPickingRep, setIsPickingRep] = useState(false);

  // Lucky Group Wheel State
  const [isSpinningWheel, setIsSpinningWheel] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [winningGroup, setWinningGroup] = useState<number | null>(null);

  // Real-time Group Statistics & Ranking
  const groupStats = useMemo(() => {
    return [1, 2, 3, 4].map((g) => {
      const groupNum = g as 1 | 2 | 3 | 4;
      // Members sorted by points high to low
      const members = students
        .filter((s) => s.group === groupNum)
        .sort((a, b) => {
          if (b.flowerPoints !== a.flowerPoints) return b.flowerPoints - a.flowerPoints;
          return a.stt - b.stt;
        });

      const totalPoints = members.reduce((acc, s) => acc + s.flowerPoints, 0);
      const totalLifetime = members.reduce((acc, s) => acc + (s.lifetimePoints ?? s.flowerPoints), 0);
      const avgPoints = members.length > 0 ? parseFloat((totalPoints / members.length).toFixed(1)) : 0;
      const topStudent = members[0] || null;
      const leader = members.find((s) => s.role.toLowerCase().includes('tổ trưởng')) || null;

      return {
        groupNum,
        name: config.groupNames[groupNum] || `Tổ ${groupNum}`,
        members,
        totalPoints,
        totalLifetime,
        avgPoints,
        topStudent,
        leader,
        memberCount: members.length,
      };
    }).sort((a, b) => b.totalPoints - a.totalPoints);
  }, [students, config.groupNames]);

  const maxTotalPoints = Math.max(...groupStats.map((g) => g.totalPoints), 1);
  const top1Group = groupStats[0];

  // Tool 1: Pick Random Representatives
  const handleStartPickRepresentative = () => {
    setIsPickingRep(true);
    setPickedRepresentatives([]);
    sound.playDrumroll();

    let counter = 0;
    const interval = setInterval(() => {
      counter++;
      if (counter < 15) {
        sound.playTick();
        if (repPickerTarget === 'all_4') {
          const tempPicks = [1, 2, 3, 4].map((g) => {
            const grpMembers = students.filter((s) => s.group === g);
            const randomSt = grpMembers[Math.floor(Math.random() * grpMembers.length)];
            return { groupNum: g, student: randomSt };
          }).filter((p) => !!p.student);
          setPickedRepresentatives(tempPicks);
        } else {
          const grpMembers = students.filter((s) => s.group === repPickerTarget);
          if (grpMembers.length > 0) {
            const randomSt = grpMembers[Math.floor(Math.random() * grpMembers.length)];
            setPickedRepresentatives([{ groupNum: repPickerTarget, student: randomSt }]);
          }
        }
      } else {
        clearInterval(interval);
        // Final pick
        if (repPickerTarget === 'all_4') {
          const finalPicks = [1, 2, 3, 4].map((g) => {
            const grpMembers = students.filter((s) => s.group === g);
            const randomSt = grpMembers[Math.floor(Math.random() * grpMembers.length)];
            return { groupNum: g, student: randomSt };
          }).filter((p) => !!p.student);
          setPickedRepresentatives(finalPicks);
        } else {
          const grpMembers = students.filter((s) => s.group === repPickerTarget);
          if (grpMembers.length > 0) {
            const randomSt = grpMembers[Math.floor(Math.random() * grpMembers.length)];
            setPickedRepresentatives([{ groupNum: repPickerTarget, student: randomSt }]);
          }
        }
        setIsPickingRep(false);
        sound.playApplause();
        fireSuperConfetti();
      }
    }, 120);
  };

  // Tool 2: Spin Lucky Group Wheel
  const handleSpinLuckyWheel = () => {
    if (isSpinningWheel) return;
    setIsSpinningWheel(true);
    setWinningGroup(null);
    sound.playDrumroll();

    // Random winner 1, 2, 3, 4
    const chosenGroup = Math.floor(Math.random() * 4) + 1;
    // Calculate rotation: 4 slices = 90 deg each
    // slice 1: 0-90 (center 45), slice 2: 90-180 (center 135), slice 3: 180-270 (center 225), slice 4: 270-360 (center 315)
    const baseSpins = 360 * 5; // 5 full revolutions
    const sliceCenters: Record<number, number> = {
      1: 45,
      2: 135,
      3: 225,
      4: 315,
    };
    const targetAngle = 360 - sliceCenters[chosenGroup];
    const newTotalRot = wheelRotation + baseSpins + targetAngle;
    setWheelRotation(newTotalRot);

    setTimeout(() => {
      setWinningGroup(chosenGroup);
      setIsSpinningWheel(false);
      sound.playApplause();
      fireSuperConfetti();
    }, 3800);
  };

  // Quick award to picked representative
  const handleAwardPickedRep = (student: Student) => {
    onAwardPoints([student.id], 2, `⭐ Trả lời xuất sắc đại diện Tổ ${student.group}`, 'academic');
    sound.playReward();
    fireConfetti();
  };

  // Quick award whole winning group
  const handleAwardLuckyGroup = (groupNum: number) => {
    const grpStudents = students.filter((s) => s.group === groupNum);
    const ids = grpStudents.map((s) => s.id);
    if (ids.length > 0) {
      onAwardPoints(ids, 3, `🎉 Thưởng may mắn cho cả ${config.groupNames[groupNum as 1 | 2 | 3 | 4] || `Tổ ${groupNum}`}`, 'movement');
      sound.playLevelUp();
      fireSuperConfetti();
    }
  };

  return (
    <div id="group-competition-section" className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 -bottom-10 w-64 h-64 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold mb-2.5 border border-amber-400/30">
              <Crown className="w-3.5 h-3.5 text-amber-300 animate-bounce" />
              <span>Thi Đua Đồng Đội 4 Tổ • {config.className}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Bảng Vàng Thi Đua & Xếp Hạng Các Tổ
            </h2>
            <p className="text-indigo-200 text-xs sm:text-sm mt-1.5 max-w-2xl font-medium leading-relaxed">
              Tự động cộng dồn tổng điểm thi đua thời gian thực của tất cả thành viên. Hỗ trợ gọi đại diện ngẫu nhiên và quay số Tổ may mắn nhận thưởng!
            </p>
          </div>

          {/* Quick Group Tools Toggle Buttons */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setActiveTool(activeTool === 'rep_picker' ? 'none' : 'rep_picker');
                sound.playClick();
              }}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition active:scale-95 flex items-center gap-2 ${
                activeTool === 'rep_picker'
                  ? 'bg-amber-400 text-amber-950 ring-2 ring-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Dices className="w-4 h-4 text-amber-300" />
              <span>Gọi đại diện Tổ</span>
            </button>

            <button
              onClick={() => {
                setActiveTool(activeTool === 'lucky_wheel' ? 'none' : 'lucky_wheel');
                sound.playClick();
              }}
              className={`px-4 py-2.5 font-bold text-xs sm:text-sm rounded-2xl shadow-md transition active:scale-95 flex items-center gap-2 ${
                activeTool === 'lucky_wheel'
                  ? 'bg-emerald-400 text-emerald-950 ring-2 ring-emerald-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Quay Tổ may mắn</span>
            </button>
          </div>
        </div>
      </div>

      {/* INTERACTIVE GROUP TOOL 1: REPRESENTATIVE PICKER */}
      {activeTool === 'rep_picker' && (
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-purple-500/10 rounded-3xl p-5 sm:p-6 border-2 border-amber-300 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-amber-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black text-lg shadow-md">
                <Dices className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  Công Cụ: Gọi Ngẫu Nhiên Thành Viên Đại Diện
                </h3>
                <p className="text-xs text-slate-500">
                  Chọn 1 tổ hoặc gọi cùng lúc 4 đại diện 4 Tổ lên bảng thuyết trình, thi đấu
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTool('none')}
              className="self-end sm:self-auto text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
            >
              Đóng công cụ
            </button>
          </div>

          <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Target Selector */}
            <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
              <span className="text-xs font-bold text-slate-700">Mục tiêu:</span>
              {[
                { id: 'all_4', label: '🌟 4 Đại diện (Cả 4 Tổ)' },
                { id: 1, label: 'Tổ 1 (Đỏ)' },
                { id: 2, label: 'Tổ 2 (Xanh lá)' },
                { id: 3, label: 'Tổ 3 (Vàng)' },
                { id: 4, label: 'Tổ 4 (Xanh dương)' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setRepPickerTarget(opt.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    repPickerTarget === opt.id
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartPickRepresentative}
              disabled={isPickingRep}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Dices className={`w-5 h-5 ${isPickingRep ? 'animate-spin' : ''}`} />
              <span>{isPickingRep ? 'Đang quay ngẫu nhiên...' : 'Bắt đầu gọi tên đại diện'}</span>
            </button>
          </div>

          {/* Picked Representatives Display */}
          {pickedRepresentatives.length > 0 && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {pickedRepresentatives.map((item) => {
                const theme = getGroupTheme(item.groupNum);
                return (
                  <div
                    key={item.groupNum}
                    className={`rounded-2xl p-4 border-2 shadow-md flex flex-col justify-between ${theme.badgeBg} ${theme.badgeBorder}`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
                          Đại diện Tổ {item.groupNum}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">#{item.student.securityCode}</span>
                      </div>

                      <div className="flex items-center gap-3 mt-1">
                        <div
                          className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${getAvatarColor(
                            item.student.name,
                            item.student.gender
                          )} text-white flex items-center justify-center font-black text-base shadow-sm border-2 border-white`}
                        >
                          {getStudentInitials(item.student.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 text-sm truncate">{item.student.name}</div>
                          <div className="text-xs text-slate-500 font-medium truncate">{item.student.role}</div>
                          <div className="text-xs font-bold text-amber-600 mt-0.5 flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500" />
                            <span>{item.student.flowerPoints} hoa</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAwardPickedRep(item.student)}
                      className="mt-3 w-full py-1.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center justify-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Thưởng +2 hoa</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* INTERACTIVE GROUP TOOL 2: LUCKY GROUP WHEEL */}
      {activeTool === 'lucky_wheel' && (
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-teal-500/10 rounded-3xl p-5 sm:p-6 border-2 border-emerald-300 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-200">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  Vòng Quay: Tổ May Mắn Nhất Lớp
                </h3>
                <p className="text-xs text-slate-500">
                  Quay ngẫu nhiên 1 trong 4 Tổ để nhận phần thưởng may mắn đồng đội
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveTool('none')}
              className="self-end sm:self-auto text-xs font-bold text-slate-400 hover:text-slate-600 p-1"
            >
              Đóng công cụ
            </button>
          </div>

          <div className="mt-6 flex flex-col md:flex-row items-center justify-center gap-8 py-4">
            {/* Spinning Wheel Graphic */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 shrink-0">
              {/* Pointer Indicator */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[20px] border-t-amber-500 drop-shadow-md"></div>

              {/* Wheel Body */}
              <div
                className="w-full h-full rounded-full border-8 border-slate-900 shadow-2xl overflow-hidden relative transition-transform duration-[3800ms] ease-out"
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  background: 'conic-gradient(#ef4444 0deg 90deg, #10b981 90deg 180deg, #f59e0b 180deg 270deg, #0284c7 270deg 360deg)',
                }}
              >
                {/* Quadrant Labels */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-white font-black text-sm drop-shadow">
                  Tổ 1 🔴
                </div>
                <div className="absolute top-1/2 right-4 -translate-y-1/2 text-white font-black text-sm drop-shadow">
                  Tổ 2 🟢
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white font-black text-sm drop-shadow">
                  Tổ 3 🟡
                </div>
                <div className="absolute top-1/2 left-4 -translate-y-1/2 text-white font-black text-sm drop-shadow">
                  Tổ 4 🔵
                </div>

                {/* Center Hub */}
                <div className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-slate-900 text-amber-300 border-4 border-white flex items-center justify-center font-black text-xs shadow-inner">
                  LỚP 4A2
                </div>
              </div>
            </div>

            {/* Controls & Result Card */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 max-w-sm">
              <button
                onClick={handleSpinLuckyWheel}
                disabled={isSpinningWheel}
                className="px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-base rounded-2xl shadow-xl transition active:scale-95 flex items-center gap-2.5 disabled:opacity-50"
              >
                <Sparkles className={`w-5 h-5 ${isSpinningWheel ? 'animate-spin' : ''}`} />
                <span>{isSpinningWheel ? 'Đang quay vòng quay...' : 'Quay Tổ May Mắn!'}</span>
              </button>

              {winningGroup && (
                <div className="p-5 rounded-2xl bg-white border-2 border-emerald-400 shadow-lg space-y-2 animate-in zoom-in-95 duration-200">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                    <PartyPopper className="w-4 h-4 text-emerald-600" />
                    <span>CHÚC MỪNG CHIẾN THẮNG</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900">
                    {config.groupNames[winningGroup as 1 | 2 | 3 | 4] || `Tổ ${winningGroup}`}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Tổ đã may mắn trúng giải quay thưởng hôm nay!
                  </p>
                  <button
                    onClick={() => handleAwardLuckyGroup(winningGroup)}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2 mt-2"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Thưởng +3 hoa cho tất cả thành viên</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CORE 1: PROMINENT GOLDEN PODIUM FOR LEADING GROUP */}
      {top1Group && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 rounded-3xl p-6 sm:p-7 text-amber-950 shadow-2xl border-4 border-amber-300 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-64 h-64 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-amber-950 text-amber-300 flex flex-col items-center justify-center font-black text-2xl shadow-xl border-4 border-amber-200 shrink-0 relative">
                <Crown className="w-8 h-8 text-amber-300 animate-bounce -mt-1" />
                <span className="text-xs font-extrabold uppercase text-amber-300 tracking-wider">Hạng 1</span>
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950 text-amber-300 text-xs font-black mb-1.5">
                  <Trophy className="w-3.5 h-3.5 fill-amber-300" />
                  <span>TỔ DẪN ĐẦU THI ĐUA LỚP 4A2</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-amber-950">
                  {top1Group.name}
                </h3>
                <p className="text-xs sm:text-sm text-amber-900 font-bold mt-1">
                  Đang xuất sắc dẫn đầu với <span className="text-amber-950 underline decoration-amber-950/40 text-base">{top1Group.totalPoints} hoa thành tích</span> • TB: {top1Group.avgPoints} hoa/em
                </p>

                {/* Member preview badges */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap justify-center sm:justify-start">
                  {top1Group.members.slice(0, 6).map((st) => (
                    <span
                      key={st.id}
                      className="px-2 py-0.5 rounded-lg bg-amber-950/10 text-amber-950 text-[11px] font-bold border border-amber-950/20"
                    >
                      {st.name} ({st.flowerPoints}⭐)
                    </span>
                  ))}
                  {top1Group.members.length > 6 && (
                    <span className="text-[11px] font-bold text-amber-900">
                      +{top1Group.members.length - 6} bạn
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Cheer & Reward Action */}
            <div className="flex flex-row lg:flex-col items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  sound.playApplause();
                  fireSuperConfetti();
                }}
                className="px-5 py-2.5 bg-amber-950 hover:bg-black text-amber-300 font-black text-xs sm:text-sm rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
              >
                <PartyPopper className="w-4 h-4" />
                <span>Bắn pháo hoa vinh danh</span>
              </button>

              <button
                onClick={() => handleAwardLuckyGroup(top1Group.groupNum)}
                className="px-5 py-2.5 bg-white/90 hover:bg-white text-amber-950 font-black text-xs sm:text-sm rounded-2xl shadow-md transition active:scale-95 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Thưởng Tổ dẫn đầu (+3 hoa)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE 2: 4-GROUP STANDINGS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {groupStats.map((group, rankIdx) => {
          const theme = getGroupTheme(group.groupNum);
          const percent = Math.round((group.totalPoints / maxTotalPoints) * 100);
          const rankBadges = [
            'bg-amber-400 text-amber-950 border-amber-300 font-black',
            'bg-slate-200 text-slate-800 border-slate-300 font-bold',
            'bg-amber-700 text-amber-100 border-amber-600 font-bold',
            'bg-slate-100 text-slate-600 border-slate-200 font-medium',
          ];

          return (
            <div
              key={group.groupNum}
              onClick={() => setSelectedGroupTab(selectedGroupTab === group.groupNum ? 'all' : group.groupNum)}
              className={`rounded-3xl p-5 border-2 shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 ${
                selectedGroupTab === group.groupNum
                  ? 'ring-4 ring-purple-400 bg-white border-purple-500 shadow-md'
                  : `${theme.badgeBg} ${theme.badgeBorder}`
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-xl text-xs flex items-center justify-center shadow-xs border ${rankBadges[rankIdx]}`}>
                      #{rankIdx + 1}
                    </span>
                    <span className="font-black text-slate-900 text-sm">
                      {group.name}
                    </span>
                  </div>
                  <span className={`w-3 h-3 rounded-full ${theme.dotColor}`}></span>
                </div>

                <div className="my-2 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">
                      {group.totalPoints} <span className="text-xs font-normal text-slate-500">hoa</span>
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                      Trung bình: <strong>{group.avgPoints}</strong> hoa/em
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    Sĩ số: {group.memberCount} em
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden my-3">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${theme.barColor}`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 text-xs text-slate-600 flex items-center justify-between">
                <span>Thủ khoa tổ: <strong>{group.topStudent ? group.topStudent.name : 'Chưa có'}</strong></span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          );
        })}
      </div>

      {/* CORE 3: DETAILED MEMBER LISTS PER GROUP (SORTED FROM HIGHEST TO LOWEST POINTS) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Danh Sách Thành Viên Từng Tổ (Xếp Hạng Điểm Cao Xuống Thấp)
            </h3>
            <p className="text-xs text-slate-500">
              Nhấn vào tab bên dưới để lọc xem danh sách từng tổ hoặc xem toàn bộ
            </p>
          </div>

          {/* Filter Tab selector */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setSelectedGroupTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedGroupTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả 4 Tổ
            </button>
            {[1, 2, 3, 4].map((g) => {
              const theme = getGroupTheme(g);
              const isSelected = selectedGroupTab === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGroupTab(g)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    isSelected ? theme.activeTabBg : `${theme.badgeBg} ${theme.badgeText} hover:opacity-80`
                  }`}
                >
                  Tổ {g}
                </button>
              );
            })}
          </div>
        </div>

        {/* Groups Display Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {groupStats
            .filter((g) => selectedGroupTab === 'all' || selectedGroupTab === g.groupNum)
            .map((group) => {
              const theme = getGroupTheme(group.groupNum);

              return (
                <div
                  key={group.groupNum}
                  className={`rounded-3xl p-5 border-2 shadow-xs flex flex-col justify-between ${theme.badgeBg} ${theme.badgeBorder}`}
                >
                  <div>
                    {/* Header of the Group Box */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${theme.dotColor}`}></span>
                        <div>
                          <h4 className="font-black text-slate-900 text-base">{group.name}</h4>
                          <span className="text-xs text-slate-500">
                            {group.memberCount} thành viên • Tổng: <strong className="text-slate-900">{group.totalPoints} hoa</strong>
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                        TB: {group.avgPoints} hoa/em
                      </span>
                    </div>

                    {/* Member Rows Sorted Descending by Points */}
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {group.members.map((st, idx) => {
                        const isTop1InGroup = idx === 0;

                        return (
                          <div
                            key={st.id}
                            className={`p-3 rounded-2xl bg-white border flex items-center justify-between gap-3 shadow-2xs transition hover:shadow-sm ${
                              isTop1InGroup
                                ? 'border-amber-300 ring-2 ring-amber-100 bg-gradient-to-r from-amber-50/50 via-white to-white'
                                : 'border-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Internal Rank */}
                              <span
                                className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 ${
                                  idx === 0
                                    ? 'bg-amber-400 text-amber-950'
                                    : idx === 1
                                    ? 'bg-slate-200 text-slate-800'
                                    : idx === 2
                                    ? 'bg-amber-700 text-amber-100'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                #{idx + 1}
                              </span>

                              {/* Avatar */}
                              <div className="relative shrink-0">
                                {st.avatarUrl ? (
                                  <img
                                    src={st.avatarUrl}
                                    alt={st.name}
                                    referrerPolicy="no-referrer"
                                    className="w-9 h-9 rounded-xl object-cover border border-slate-200"
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
                              </div>

                              {/* Name & Role */}
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                    {st.name}
                                  </span>
                                  {isTop1InGroup && (
                                    <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 flex items-center gap-0.5">
                                      <Crown className="w-2.5 h-2.5" /> Thủ khoa
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {st.role} • Mã: #{st.securityCode}
                                </div>
                              </div>
                            </div>

                            {/* Point Score Badges */}
                            <div className="text-right shrink-0">
                              <div className="font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200 flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                                <span>{st.flowerPoints} Sao</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                Trọn đời: {st.lifetimePoints ?? st.flowerPoints}đ
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Group Quick Action */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                      Tổ trưởng: <strong>{group.leader ? group.leader.name : 'Chưa phân công'}</strong>
                    </span>
                    <button
                      onClick={() => handleAwardLuckyGroup(group.groupNum)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200 shadow-2xs transition active:scale-95 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Cộng điểm cả tổ</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
