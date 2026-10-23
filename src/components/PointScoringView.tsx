import React, { useState } from 'react';
import { Student, ClassConfig, ScoringCriterion, PointCategory, PointLog } from '../types';
import { getStudentAvatarUrl } from '../utils/imageUtils';
import { sound } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  PlusCircle, 
  MinusCircle, 
  Users, 
  UserCheck, 
  BookOpen, 
  Trophy, 
  ShieldAlert, 
  Clock, 
  CheckSquare, 
  MoreHorizontal, 
  Search, 
  History, 
  Trash2, 
  Flame, 
  Check, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface PointScoringViewProps {
  students: Student[];
  config: ClassConfig;
  criteria: ScoringCriterion[];
  pointLogs: PointLog[];
  onScoreStudent: (studentId: string, delta: number, reason: string, category: PointCategory) => void;
  onScoreGroup: (groupNumber: 1 | 2 | 3 | 4, delta: number, reason: string, category: PointCategory) => void;
  onScoreWholeClass: (delta: number, reason: string, category: PointCategory) => void;
  onDeleteLog?: (logId: string) => void;
}

export const PointScoringView: React.FC<PointScoringViewProps> = ({
  students,
  config,
  criteria,
  pointLogs,
  onScoreStudent,
  onScoreGroup,
  onScoreWholeClass,
  onDeleteLog,
}) => {
  // Target Scope: 'single' | 'group' | 'class'
  const [targetScope, setTargetScope] = useState<'single' | 'group' | 'class'>('single');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [selectedGroup, setSelectedGroup] = useState<1 | 2 | 3 | 4>(1);
  
  // Category tab filter for criteria
  const [activeCategory, setActiveCategory] = useState<PointCategory | 'all'>('academic');
  
  // Custom score form
  const [pointDelta, setPointDelta] = useState<number>(5);
  const [reason, setReason] = useState<string>('Phát biểu xây dựng bài sôi nổi');
  const [selectedCategory, setSelectedCategory] = useState<PointCategory>('academic');
  const [searchStudent, setSearchStudent] = useState<string>('');

  // Category definitions
  const categories: { id: PointCategory; label: string; icon: any; color: string }[] = [
    { id: 'academic', label: 'Học tập', icon: BookOpen, color: 'text-sky-600 bg-sky-50 border-sky-200' },
    { id: 'movement', label: 'Phong trào', icon: Trophy, color: 'text-amber-600 bg-amber-50 border-amber-200' },
    { id: 'discipline', label: 'Kỷ luật', icon: ShieldAlert, color: 'text-rose-600 bg-rose-50 border-rose-200' },
    { id: 'attendance', label: 'Chuyên cần', icon: Clock, color: 'text-teal-600 bg-teal-50 border-teal-200' },
    { id: 'manners', label: 'Nề nếp', icon: CheckSquare, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
    { id: 'other', label: 'Khác', icon: MoreHorizontal, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  ];

  // Filter criteria based on active category
  const filteredCriteria = criteria.filter((c) => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'discipline') {
      return c.category === 'discipline' || c.category === 'penalty';
    }
    return c.category === activeCategory;
  });

  // Filter students for single student selection
  const filteredStudents = students.filter((s) => 
    s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
    s.stt.toString() === searchStudent ||
    (s.securityCode && s.securityCode.includes(searchStudent))
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Handle Quick Criterion Select
  const handleSelectCriterion = (c: ScoringCriterion) => {
    setPointDelta(c.points);
    setReason(c.label);
    setSelectedCategory(c.category === 'penalty' ? 'discipline' : c.category);
    sound.playClick();
  };

  // Trigger Confetti Animation
  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fbbf24', '#34d399', '#f43f5e', '#a855f7'],
      });
    } catch (e) {
      console.log('Confetti not available:', e);
    }
  };

  // Submit scoring
  const handleConfirmScoring = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    if (targetScope === 'single') {
      if (!selectedStudentId) {
        alert('Vui lòng chọn học sinh cần tích điểm');
        return;
      }
      onScoreStudent(selectedStudentId, pointDelta, reason.trim(), selectedCategory);
    } else if (targetScope === 'group') {
      onScoreGroup(selectedGroup, pointDelta, reason.trim(), selectedCategory);
    } else if (targetScope === 'class') {
      onScoreWholeClass(pointDelta, reason.trim(), selectedCategory);
    }

    if (pointDelta > 0) {
      fireConfetti();
      sound.playReward();
    } else {
      sound.playPenalty();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="point-scoring-view">
      {/* 1. Header Title */}
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 shadow-md shadow-pink-100/50 border-2 border-[#FCE7F3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#EC4899] text-white flex items-center justify-center font-black shadow-md shadow-pink-300/40 shrink-0 border-2 border-white">
            <Sparkles className="w-6 h-6 animate-spin-slow text-yellow-200" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Tích Điểm Thi Đua & Khen Thưởng 🌸
            </h2>
            <p className="text-xs text-purple-900/70 font-semibold mt-0.5">
              Cộng hoa khen ngợi hoặc trừ điểm nhắc nhở • Áp dụng Cá nhân, Tổ hoặc Cả Lớp
            </p>
          </div>
        </div>

        {/* Target Scope Switcher (Cá nhân, Tổ, Cả lớp) */}
        <div className="flex items-center p-1 bg-pink-50/80 rounded-2xl border-2 border-pink-200 shadow-2xs">
          <button
            onClick={() => {
              setTargetScope('single');
              sound.playClick();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              targetScope === 'single'
                ? 'candy-btn-purple text-white shadow-xs'
                : 'text-purple-900 hover:text-purple-950'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1 Học Sinh</span>
          </button>

          <button
            onClick={() => {
              setTargetScope('group');
              sound.playClick();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              targetScope === 'group'
                ? 'candy-btn-purple text-white shadow-xs'
                : 'text-purple-900 hover:text-purple-950'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Cả Tổ</span>
          </button>

          <button
            onClick={() => {
              setTargetScope('class');
              sound.playClick();
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
              targetScope === 'class'
                ? 'candy-btn-purple text-white shadow-xs'
                : 'text-purple-900 hover:text-purple-950'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Cả Lớp ({students.length})</span>
          </button>
        </div>
      </div>

      {/* 2. Main Scoring Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Target Selection */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-xs rounded-3xl p-5 shadow-md shadow-pink-100/50 border-2 border-[#FCE7F3] flex flex-col justify-between space-y-4">
          <div>
            {/* Scope: Single Student */}
            {targetScope === 'single' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-pink-600" />
                    Chọn Học Sinh Nhận Điểm:
                  </h3>
                  <span className="text-[11px] text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full font-black border border-pink-200">{filteredStudents.length} em</span>
                </div>

                {/* Search Student */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
                  <input
                    type="text"
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    placeholder="Tìm theo tên hoặc STT..."
                    className="w-full pl-9 pr-3.5 py-2 bg-pink-50/50 border-2 border-pink-100 rounded-2xl text-xs font-bold text-slate-800 placeholder-pink-300 focus:outline-none focus:border-pink-400"
                  />
                </div>

                {/* Scrollable Student List */}
                <div className="max-h-[360px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
                  {filteredStudents.map((s) => {
                    const isSelected = s.id === selectedStudentId;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedStudentId(s.id);
                          sound.playClick();
                        }}
                        className={`w-full p-2.5 rounded-2xl text-left transition flex items-center justify-between border-2 ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-50 to-purple-50 border-pink-400 text-purple-950 shadow-xs ring-2 ring-pink-200'
                            : 'bg-white hover:bg-pink-50/50 border-pink-100/80 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={getStudentAvatarUrl(s)}
                            alt={s.name}
                            referrerPolicy="no-referrer"
                            className="w-8 h-8 rounded-xl object-cover border-2 border-white shadow-2xs shrink-0"
                          />
                          <div className="truncate">
                            <div className="text-xs font-black truncate text-slate-800">
                              #{s.stt}. {s.name}
                            </div>
                            <div className="text-[10px] text-purple-600 font-bold">
                              Tổ {s.group} • #{s.securityCode || '00000'}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full border border-pink-200">
                            {s.flowerPoints} 🌸
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scope: Group / Tổ */}
            {targetScope === 'group' && (
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-600" />
                  Chọn Tổ Thi Đua Nhận Điểm:
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {([1, 2, 3, 4] as const).map((g) => {
                    const groupStudents = students.filter((s) => s.group === g);
                    const groupTotalPoints = groupStudents.reduce((sum, s) => sum + s.flowerPoints, 0);
                    const isSelected = selectedGroup === g;

                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => {
                          setSelectedGroup(g);
                          sound.playClick();
                        }}
                        className={`p-4 rounded-3xl text-left transition border-2 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-purple-400 text-purple-950 shadow-md ring-2 ring-purple-200'
                            : 'bg-white hover:bg-pink-50/50 border-pink-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-black text-purple-950">Tổ {g}</span>
                          <span className="text-xs font-black text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full border border-pink-200">{groupStudents.length} em</span>
                        </div>
                        <p className="text-[11px] font-semibold text-purple-800/80 line-clamp-1 mb-2">
                          {config.groupNames?.[g] || `Tổ ${g}`}
                        </p>
                        <div className="text-xs font-black text-purple-900 pt-2 border-t-2 border-pink-100">
                          Tổng điểm: {groupTotalPoints} 🌸
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scope: Whole Class */}
            {targetScope === 'class' && (
              <div className="p-6 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 text-center space-y-3 shadow-2xs">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-white text-purple-700 flex items-center justify-center font-black shadow-sm border-2 border-pink-200">
                  <Users className="w-8 h-8 text-pink-600" />
                </div>
                <h3 className="text-base font-black text-purple-950">
                  Tích Điểm Cho Toàn Thể Lớp 4A2
                </h3>
                <p className="text-xs font-semibold text-purple-800/80 max-w-xs mx-auto">
                  Điểm số sẽ được cộng/trừ đồng loạt cho tất cả <strong>{students.length} học sinh</strong> trong lớp.
                </p>
              </div>
            )}
          </div>

          {/* Selected Target Summary Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white flex items-center justify-between text-xs shadow-md shadow-pink-200/50 border-2 border-white">
            <div className="truncate">
              <span className="text-pink-100 font-medium">Đối tượng: </span>
              <strong className="text-yellow-200 font-black">
                {targetScope === 'single'
                  ? selectedStudent ? `${selectedStudent.name} (Tổ ${selectedStudent.group})` : 'Chưa chọn'
                  : targetScope === 'group'
                  ? `Toàn bộ Tổ ${selectedGroup} (${students.filter(s => s.group === selectedGroup).length} em)`
                  : `Cả Lớp (${students.length} em)`}
              </strong>
            </div>
            <div className="font-mono font-black text-yellow-300 text-sm shrink-0 ml-2 bg-purple-900/40 px-2.5 py-1 rounded-xl border border-white/30">
              {pointDelta > 0 ? `+${pointDelta}` : pointDelta} 🌸
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Criteria Selection & Confirmation */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-xs rounded-3xl p-5 shadow-md shadow-pink-100/50 border-2 border-[#FCE7F3] space-y-5">
          {/* Category Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-950">
                Phân Nhóm Tiêu Chí:
              </h3>
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className={`text-[11px] font-black ${activeCategory === 'all' ? 'text-pink-600 underline' : 'text-purple-400 hover:text-purple-600'}`}
              >
                Tất cả tiêu chí
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat.id);
                      sound.playClick();
                    }}
                    className={`p-2.5 rounded-2xl text-center transition border-2 flex flex-col items-center gap-1 ${
                      isActive
                        ? 'candy-btn-purple text-white font-black shadow-xs'
                        : 'bg-pink-50/60 hover:bg-pink-100/80 border-pink-100 text-purple-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-black truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Criteria Grid */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-purple-950">
              Nhấp chọn tiêu chí nhanh:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
              {filteredCriteria.map((c) => {
                const isPositive = c.points > 0;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCriterion(c)}
                    className={`p-2.5 rounded-2xl text-left border-2 transition flex items-center justify-between group ${
                      reason === c.label && pointDelta === c.points
                        ? 'bg-gradient-to-r from-purple-700 to-pink-600 text-white border-purple-800 shadow-md'
                        : isPositive
                        ? 'bg-white hover:bg-pink-50/80 border-pink-200 text-slate-800'
                        : 'bg-rose-50/70 hover:bg-rose-100/80 border-rose-200 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">{c.icon}</span>
                      <span className="text-xs font-black truncate">{c.label}</span>
                    </div>

                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${
                        isPositive ? 'bg-pink-100 text-pink-700 border border-pink-200' : 'bg-rose-100 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {isPositive ? `+${c.points}` : c.points}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Scoring Form: Custom Reason, Points, and Submit */}
          <form onSubmit={handleConfirmScoring} className="pt-4 border-t-2 border-pink-100 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Point Delta Input */}
              <div className="sm:col-span-4">
                <label className="block text-xs font-black text-purple-950 mb-1">
                  Số điểm hoa (+ / -)
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPointDelta((prev) => prev - 1)}
                    className="p-2.5 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-900 font-black border border-pink-200 shadow-2xs"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    required
                    value={pointDelta}
                    onChange={(e) => setPointDelta(Number(e.target.value))}
                    className={`w-full text-center py-2 bg-pink-50/50 border-2 rounded-2xl text-base font-black focus:outline-none ${
                      pointDelta >= 0
                        ? 'text-pink-700 border-pink-300 focus:border-pink-500'
                        : 'text-rose-700 border-rose-300 focus:border-rose-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setPointDelta((prev) => prev + 1)}
                    className="p-2.5 rounded-2xl bg-pink-100 hover:bg-pink-200 text-pink-900 font-black border border-pink-200 shadow-2xs"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Reason Input */}
              <div className="sm:col-span-8">
                <label className="block text-xs font-black text-purple-950 mb-1">
                  Lý do tích điểm / Ghi chú *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ví dụ: Phát biểu xây dựng bài sôi nổi..."
                  className="w-full px-3.5 py-2.5 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-400"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full py-3.5 rounded-2xl text-white font-black text-sm shadow-lg transition active:scale-95 flex items-center justify-center gap-2 ${
                pointDelta >= 0
                  ? 'candy-btn-gold text-purple-950 shadow-amber-200/60'
                  : 'candy-btn-peach text-white shadow-rose-300/60'
              }`}
            >
              <Sparkles className="w-5 h-5" />
              <span>
                {pointDelta >= 0 ? `Cộng ${pointDelta} Hoa & Bắn Pháo Giấy 🎊` : `Trừ ${Math.abs(pointDelta)} Điểm Vi Phạm`}
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. Lịch Sử Tích Điểm Gần Đây (Point Logs) */}
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 shadow-md shadow-pink-100/50 border-2 border-[#FCE7F3] space-y-3">
        <div className="flex items-center justify-between pb-3 border-b-2 border-pink-100">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-pink-600" />
            <h3 className="text-sm font-black text-slate-800">
              Lịch Sử Tích Điểm Gần Đây ({pointLogs.length} lượt)
            </h3>
          </div>
          <span className="text-xs text-purple-800/70 font-bold bg-pink-100 px-3 py-1 rounded-full border border-pink-200">Tự động lưu lịch sử thi đua</span>
        </div>

        {pointLogs.length === 0 ? (
          <div className="text-center py-6 text-xs text-purple-400 font-semibold">
            Chưa có lịch sử tích điểm nào hôm nay.
          </div>
        ) : (
          <div className="divide-y-2 divide-pink-50 max-h-[260px] overflow-y-auto pr-1 no-scrollbar">
            {pointLogs.slice(0, 15).map((log) => {
              const isPositive = log.delta > 0;
              const dateStr = new Date(log.timestamp).toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={log.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 shadow-2xs border ${
                        isPositive ? 'bg-pink-100 text-pink-700 border-pink-200' : 'bg-rose-100 text-rose-700 border-rose-200'
                      }`}
                    >
                      {isPositive ? `+${log.delta}` : log.delta}
                    </span>
                    <div className="truncate">
                      <span className="font-black text-slate-900">{log.studentName}</span>{' '}
                      <span className="text-purple-600 font-semibold">(Tổ {log.group}):</span>{' '}
                      <span className="text-slate-700 font-medium">{log.reason}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-purple-400 font-medium">{dateStr}</span>
                    {onDeleteLog && (
                      <button
                        onClick={() => onDeleteLog(log.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 rounded transition"
                        title="Xóa bản ghi này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
