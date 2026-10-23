import React, { useState } from 'react';
import { Student, ScoringCriterion, PointCategory, PointLog, ClassConfig } from '../types';
import { 
  getAvatarColor, 
  getStudentInitials, 
  getGroupName,
  getGroupTheme,
  fireConfetti 
} from '../utils/helpers';
import { getStudentAvatarUrl } from '../utils/imageUtils';
import { getTreeEvolutionInfo, DREAM_TREE_STAGES } from '../data/dreamTreeData';
import { DreamTreeVisualizer } from './DreamTreeVisualizer';
import { StudentGardenModal } from './StudentGardenModal';
import { sound } from '../utils/soundEffects';
import { 
  Plus, 
  Minus, 
  Search, 
  Sparkles, 
  Award, 
  CheckSquare, 
  Square, 
  History, 
  Filter, 
  Users, 
  ChevronRight,
  TrendingUp,
  X,
  Star,
  Zap,
  Shield,
  Trophy,
  Flame,
  Crown,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Clock,
  Heart,
  Smile,
  AlertTriangle
} from 'lucide-react';

interface FlowerGardenViewProps {
  students: Student[];
  criteria: ScoringCriterion[];
  pointLogs: PointLog[];
  config: ClassConfig;
  onAwardPoints: (studentIds: string[], delta: number, reason: string, category: PointCategory) => void;
  onUpdateStudent: (updatedStudent: Student) => void;
  onGrantShield?: (studentId: string) => void;
  onUpdateCriteria?: (criteria: ScoringCriterion[]) => void;
  onDeletePointLog?: (logId: string) => void;
}

type GardenSubTab = 'individual' | 'group' | 'leaderboard';

export const FlowerGardenView: React.FC<FlowerGardenViewProps> = ({
  students,
  criteria,
  pointLogs,
  config,
  onAwardPoints,
  onUpdateStudent,
  onGrantShield,
  onUpdateCriteria,
  onDeletePointLog,
}) => {
  // Main Sub-Tab Mode
  const [activeSubTab, setActiveSubTab] = useState<GardenSubTab>('individual');

  // Filter & Search States
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Modals
  const [scoringModalTarget, setScoringModalTarget] = useState<{
    type: 'individual' | 'group' | 'batch';
    student?: Student;
    groupNum?: number;
    title: string;
  } | null>(null);

  const [scoringTab, setScoringTab] = useState<'praise' | 'reminder'>('praise');
  const [gardenModalStudent, setGardenModalStudent] = useState<Student | null>(null);
  const [historyModalTarget, setHistoryModalTarget] = useState<{
    type: 'individual' | 'group';
    student?: Student;
    groupNum?: number;
  } | null>(null);

  // Criterion Editing Modal State
  const [editingCriterion, setEditingCriterion] = useState<ScoringCriterion | null>(null);
  const [isAddingNewCriterion, setIsAddingNewCriterion] = useState(false);
  const [criterionLabel, setCriterionLabel] = useState('');
  const [criterionPoints, setCriterionPoints] = useState<number>(1);
  const [criterionIcon, setCriterionIcon] = useState('⭐');
  const [criterionCategory, setCriterionCategory] = useState<PointCategory>('academic');
  const [criterionType, setCriterionType] = useState<'praise' | 'reminder'>('praise');
  const [criterionTargetType, setCriterionTargetType] = useState<'individual' | 'group' | 'both'>('both');

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const matchSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.stt.toString() === searchQuery;
    return matchGroup && matchSearch;
  });

  // Group computations
  const groupNumbers = [1, 2, 3, 4];
  const groupData = groupNumbers.map((gNum) => {
    const groupStudents = students.filter((s) => s.group === gNum);
    const totalPoints = groupStudents.reduce((acc, s) => acc + s.flowerPoints, 0);
    const avgPoints = groupStudents.length > 0 ? Math.round((totalPoints / groupStudents.length) * 10) / 10 : 0;
    return {
      group: gNum,
      name: `Tổ ${gNum}`,
      students: groupStudents,
      totalPoints,
      avgPoints,
    };
  });

  const sortedGroups = [...groupData].sort((a, b) => b.totalPoints - a.totalPoints);

  // Student Leaderboard (Sorted)
  const sortedStudents = [...students].sort((a, b) => b.flowerPoints - a.flowerPoints);

  // Selection toggle
  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((sid) => sid !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const selectAllFiltered = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map((s) => s.id));
    }
  };

  // Open Award Modal
  const openAwardModalForStudent = (student: Student, defaultType: 'praise' | 'reminder' = 'praise') => {
    setScoringModalTarget({
      type: 'individual',
      student,
      title: `${defaultType === 'praise' ? 'Khen Thưởng' : 'Nhắc Nhở'}: ${student.name} (Tổ ${student.group})`,
    });
    setScoringTab(defaultType);
    sound.playClick();
  };

  const openAwardModalForGroup = (groupNum: number, defaultType: 'praise' | 'reminder' = 'praise') => {
    setScoringModalTarget({
      type: 'group',
      groupNum,
      title: `${defaultType === 'praise' ? 'Khen Thưởng' : 'Nhắc Nhở'}: Tổ ${groupNum}`,
    });
    setScoringTab(defaultType);
    sound.playClick();
  };

  const openBatchAwardModal = (defaultType: 'praise' | 'reminder' = 'praise') => {
    if (selectedStudentIds.length === 0) return;
    setScoringModalTarget({
      type: 'batch',
      title: `${defaultType === 'praise' ? 'Khen Thưởng' : 'Nhắc Nhở'} ${selectedStudentIds.length} Học Sinh Đã Chọn`,
    });
    setScoringTab(defaultType);
    sound.playClick();
  };

  // Apply Criterion
  const handleApplyCriterion = (crit: ScoringCriterion) => {
    if (!scoringModalTarget) return;

    let targetIds: string[] = [];
    if (scoringModalTarget.type === 'individual' && scoringModalTarget.student) {
      targetIds = [scoringModalTarget.student.id];
    } else if (scoringModalTarget.type === 'group' && scoringModalTarget.groupNum) {
      targetIds = students.filter((s) => s.group === scoringModalTarget.groupNum).map((s) => s.id);
    } else if (scoringModalTarget.type === 'batch') {
      targetIds = selectedStudentIds;
    }

    if (targetIds.length === 0) return;

    const delta = crit.type === 'reminder' ? -Math.abs(crit.points) : Math.abs(crit.points);
    onAwardPoints(targetIds, delta, crit.label, crit.category);
    
    if (delta > 0) {
      sound.playReward();
      fireConfetti();
    } else {
      sound.playClick();
    }

    setScoringModalTarget(null);
    if (scoringModalTarget.type === 'batch') {
      setSelectedStudentIds([]);
    }
  };

  // Criterion Editor Handlers
  const handleOpenEditCriterion = (crit: ScoringCriterion, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCriterion(crit);
    setCriterionLabel(crit.label);
    setCriterionPoints(Math.abs(crit.points));
    setCriterionIcon(crit.icon || '⭐');
    setCriterionCategory(crit.category || 'academic');
    setCriterionType(crit.type || (crit.points >= 0 ? 'praise' : 'reminder'));
    setCriterionTargetType(crit.targetType || 'both');
    setIsAddingNewCriterion(false);
  };

  const handleOpenAddCriterion = (defaultType: 'praise' | 'reminder') => {
    setEditingCriterion(null);
    setCriterionLabel('');
    setCriterionPoints(defaultType === 'praise' ? 2 : 1);
    setCriterionIcon(defaultType === 'praise' ? '⭐' : '⚠️');
    setCriterionCategory('academic');
    setCriterionType(defaultType);
    setCriterionTargetType('both');
    setIsAddingNewCriterion(true);
  };

  const handleSaveCriterion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!criterionLabel.trim() || !onUpdateCriteria) return;

    const signedPoints = criterionType === 'reminder' ? -Math.abs(criterionPoints) : Math.abs(criterionPoints);

    if (isAddingNewCriterion) {
      const newCrit: ScoringCriterion = {
        id: `crit-${Date.now()}`,
        label: criterionLabel.trim(),
        points: signedPoints,
        category: criterionCategory,
        icon: criterionIcon || '⭐',
        type: criterionType,
        targetType: criterionTargetType,
        isActive: true,
      };
      onUpdateCriteria([...criteria, newCrit]);
    } else if (editingCriterion) {
      const updated = criteria.map((c) => {
        if (c.id === editingCriterion.id) {
          return {
            ...c,
            label: criterionLabel.trim(),
            points: signedPoints,
            category: criterionCategory,
            icon: criterionIcon || '⭐',
            type: criterionType,
            targetType: criterionTargetType,
          };
        }
        return c;
      });
      onUpdateCriteria(updated);
    }

    sound.playReward();
    setEditingCriterion(null);
    setIsAddingNewCriterion(false);
  };

  const handleDeleteCriterion = (id: string) => {
    if (!onUpdateCriteria) return;
    if (window.confirm('Thầy cô có chắc muốn xóa tiêu chí này?')) {
      const updated = criteria.filter((c) => c.id !== id);
      onUpdateCriteria(updated);
      sound.playClick();
      setEditingCriterion(null);
      setIsAddingNewCriterion(false);
    }
  };

  // Filter criteria for scoring modal
  const activeCriteria = criteria.filter((c) => {
    if (c.isActive === false) return false;
    const matchesType = scoringTab === 'praise' 
      ? (c.type === 'praise' || c.points >= 0) 
      : (c.type === 'reminder' || c.points < 0);

    const isGroupTarget = scoringModalTarget?.type === 'group';
    const matchesTarget = !c.targetType || c.targetType === 'both' || (isGroupTarget ? c.targetType === 'group' : c.targetType === 'individual');

    return matchesType && matchesTarget;
  });

  return (
    <div id="flower-garden-main-view" className="space-y-6 animate-fadeIn max-w-7xl mx-auto">
      {/* 1. HEADER VƯỜN THÀNH TÍCH */}
      <div className="bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F472B6] rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-pink-200/40 relative overflow-hidden border-2 border-white/60">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-40 h-40 bg-yellow-300/30 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/25 text-xs font-black backdrop-blur-xs text-white">
              <span>🌱</span>
              <span>KHÔNG GIAN TIẾN BỘ TỪNG NGÀY</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>🌱 VƯỜN THÀNH TÍCH LỚP HỌC</span>
            </h1>
            <p className="text-xs sm:text-sm text-pink-100 max-w-xl font-medium">
              Ghi nhận điểm thi đua cá nhân & tổ, nuôi dưỡng Cây Ước Mơ và vinh danh những bông hoa rực rỡ nhất!
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-white/25 backdrop-blur-xs border border-white/40 rounded-2xl px-4 py-2.5 text-center min-w-[100px] shadow-sm">
              <div className="text-xs text-pink-100 font-bold">Tổng Điểm Sao</div>
              <div className="text-xl sm:text-2xl font-black text-amber-200">
                {students.reduce((acc, s) => acc + s.flowerPoints, 0)} ⭐
              </div>
            </div>

            <div className="bg-white/25 backdrop-blur-xs border border-white/40 rounded-2xl px-4 py-2.5 text-center min-w-[100px] shadow-sm">
              <div className="text-xs text-pink-100 font-bold">Sĩ Số Học Sinh</div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {students.length} em
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THREE MAJOR SUB-TABS: 👤 THI ĐUA CÁ NHÂN | 👥 THI ĐUA THEO TỔ | 🏆 BẢNG XẾP HẠNG */}
      <div className="bg-white rounded-3xl p-2 border-2 border-pink-100 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Sub-tab 1 */}
          <button
            type="button"
            id="tab-garden-individual"
            onClick={() => {
              setActiveSubTab('individual');
              sound.playClick();
            }}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'individual'
                ? 'candy-btn-purple text-white shadow-md'
                : 'text-slate-700 hover:bg-pink-50 hover:text-purple-900'
            }`}
          >
            <span>👤</span>
            <span>THI ĐUA CÁ NHÂN</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeSubTab === 'individual' ? 'bg-white/30 text-white' : 'bg-pink-100 text-pink-700'
            }`}>
              {students.length}
            </span>
          </button>

          {/* Sub-tab 2 */}
          <button
            type="button"
            id="tab-garden-group"
            onClick={() => {
              setActiveSubTab('group');
              sound.playClick();
            }}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'group'
                ? 'candy-btn-purple text-white shadow-md'
                : 'text-slate-700 hover:bg-pink-50 hover:text-purple-900'
            }`}
          >
            <span>👥</span>
            <span>THI ĐUA THEO TỔ</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeSubTab === 'group' ? 'bg-white/30 text-white' : 'bg-pink-100 text-pink-700'
            }`}>
              4 Tổ
            </span>
          </button>

          {/* Sub-tab 3 */}
          <button
            type="button"
            id="tab-garden-leaderboard"
            onClick={() => {
              setActiveSubTab('leaderboard');
              sound.playClick();
            }}
            className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeSubTab === 'leaderboard'
                ? 'candy-btn-purple text-white shadow-md'
                : 'text-slate-700 hover:bg-pink-50 hover:text-purple-900'
            }`}
          >
            <span>🏆</span>
            <span>BẢNG XẾP HẠNG</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeSubTab === 'leaderboard' ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              Podium Top 3
            </span>
          </button>
        </div>

        {/* Quick batch action if students selected */}
        {activeSubTab === 'individual' && selectedStudentIds.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-pink-50 rounded-2xl border border-pink-200 animate-fadeIn">
            <span className="text-xs font-black text-pink-700">
              Đã chọn: {selectedStudentIds.length} em
            </span>
            <button
              type="button"
              onClick={() => openBatchAwardModal('praise')}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Khen thưởng hàng loạt</span>
            </button>
            <button
              type="button"
              onClick={() => openBatchAwardModal('reminder')}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Nhắc nhở hàng loạt</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedStudentIds([])}
              className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODE 1: 👤 THI ĐUA CÁ NHÂN                                */}
      {/* ========================================================= */}
      {activeSubTab === 'individual' && (
        <div className="space-y-5">
          {/* Controls Bar: Group Filter & Search */}
          <div className="candy-card p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedGroup('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  selectedGroup === 'all'
                    ? 'candy-btn-purple text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                Tất Cả ({students.length})
              </button>

              {groupNumbers.map((gNum) => {
                const count = students.filter((s) => s.group === gNum).length;
                return (
                  <button
                    key={gNum}
                    type="button"
                    onClick={() => setSelectedGroup(gNum)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                      selectedGroup === gNum
                        ? 'candy-btn-pink text-white shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Tổ {gNum} ({count})
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={selectAllFiltered}
                className="px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-black transition cursor-pointer flex items-center gap-1.5"
              >
                {selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                ) : (
                  <Square className="w-4 h-4 text-purple-400" />
                )}
                <span>{selectedStudentIds.length === filteredStudents.length ? 'Bỏ chọn' : 'Chọn tất cả'}</span>
              </button>

              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm học sinh theo tên, STT..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-slate-50 border-2 border-pink-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-300 w-48 sm:w-64"
                />
              </div>
            </div>
          </div>

          {/* Student Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredStudents.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold bg-white rounded-3xl border-2 border-dashed border-pink-200">
                Không tìm thấy học sinh nào phù hợp.
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                const treeInfo = getTreeEvolutionInfo(student.flowerPoints);

                return (
                  <div
                    key={student.id}
                    className={`bg-white rounded-3xl p-4 border-2 transition-all duration-200 shadow-sm hover:shadow-md flex flex-col justify-between space-y-3 relative group ${
                      isSelected 
                        ? 'border-purple-500 ring-2 ring-purple-300 bg-purple-50/20' 
                        : 'border-[#FCE7F3] hover:border-pink-300'
                    }`}
                  >
                    {/* Top Row: STT, Selection Checkbox & Group */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleSelectStudent(student.id)}
                          className="text-slate-400 hover:text-purple-600 cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-purple-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-300" />
                          )}
                        </button>
                        <span className="text-[11px] font-black text-slate-500">#{student.stt}</span>
                      </div>

                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                        Tổ {student.group}
                      </span>
                    </div>

                    {/* Student Info: Avatar & Name */}
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setGardenModalStudent(student)}
                        className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border-2 border-pink-200 shrink-0 shadow-xs cursor-pointer group-hover:scale-105 transition"
                        title="Nhấp để xem Vườn cây ước mơ"
                      >
                        <img
                          src={getStudentAvatarUrl(student)}
                          alt={student.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div 
                          onClick={() => setGardenModalStudent(student)}
                          className="font-black text-base sm:text-lg text-slate-800 truncate hover:text-purple-700 cursor-pointer"
                        >
                          {student.name}
                        </div>
                        <div className="text-xs sm:text-[13px] text-purple-700 font-bold flex items-center gap-1">
                          <span>{treeInfo.currentStage.icon}</span>
                          <span className="truncate">{treeInfo.currentStage.name}</span>
                        </div>
                        <div className="text-lg sm:text-xl font-black text-pink-600 flex items-center gap-1 mt-0.5">
                          <span>{student.flowerPoints}</span>
                          <span className="text-sm">⭐</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: Khen thưởng | Nhắc nhở | Lịch sử */}
                    <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-pink-100">
                      {/* 1. Khen thưởng */}
                      <button
                        type="button"
                        onClick={() => openAwardModalForStudent(student, 'praise')}
                        className="px-2 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                        title="Khen thưởng học sinh"
                      >
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-black">Khen</span>
                      </button>

                      {/* 2. Nhắc nhở */}
                      <button
                        type="button"
                        onClick={() => openAwardModalForStudent(student, 'reminder')}
                        className="px-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs sm:text-sm font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                        title="Nhắc nhở học sinh"
                      >
                        <Minus className="w-4 h-4 text-rose-600" />
                        <span className="text-xs font-black">Nhắc</span>
                      </button>

                      {/* 3. Lịch sử */}
                      <button
                        type="button"
                        onClick={() => setHistoryModalTarget({ type: 'individual', student })}
                        className="px-2 py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200 text-xs sm:text-sm font-black transition flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-95"
                        title="Lịch sử tích điểm"
                      >
                        <History className="w-4 h-4 text-purple-600" />
                        <span className="text-xs font-black">Lịch sử</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 2: 👥 THI ĐUA THEO TỔ                                */}
      {/* ========================================================= */}
      {activeSubTab === 'group' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {sortedGroups.map((g, idx) => {
              const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '4️⃣';
              const isFirst = idx === 0;

              return (
                <div
                  key={g.group}
                  className={`bg-white rounded-3xl p-5 border-2 transition shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 relative ${
                    isFirst ? 'border-amber-400 ring-2 ring-amber-200' : 'border-[#FCE7F3]'
                  }`}
                >
                  {/* Header Tổ & Rank */}
                  <div className="flex items-center justify-between pb-3 border-b border-pink-100">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{rankMedal}</span>
                      <div>
                        <h3 className="font-black text-base text-slate-900">{g.name}</h3>
                        <div className="text-[11px] text-slate-500 font-bold">{g.students.length} thành viên</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-pink-600">{g.totalPoints} ⭐</div>
                      <div className="text-[10px] text-slate-400 font-semibold">TB: {g.avgPoints} ⭐/em</div>
                    </div>
                  </div>

                  {/* Student Avatars in Group */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-600">Thành viên:</div>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {g.students.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-pink-50/60 border border-pink-100 text-[11px] font-bold text-slate-800"
                        >
                          <img
                            src={getStudentAvatarUrl(st)}
                            alt={st.name}
                            className="w-4 h-4 rounded-full object-cover"
                          />
                          <span className="truncate max-w-[80px]">{st.name}</span>
                          <span className="text-pink-600 font-black text-[10px]">{st.flowerPoints}⭐</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Group Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-pink-100">
                    <button
                      type="button"
                      onClick={() => openAwardModalForGroup(g.group, 'praise')}
                      className="px-2 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Khen Tổ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openAwardModalForGroup(g.group, 'reminder')}
                      className="px-2 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Minus className="w-4 h-4 text-rose-600" />
                      <span>Nhắc Tổ</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHistoryModalTarget({ type: 'group', groupNum: g.group })}
                      className="px-2 py-2.5 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-black transition flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <History className="w-4 h-4 text-purple-600" />
                      <span>Lịch Sử</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODE 3: 🏆 BẢNG XẾP HẠNG                                  */}
      {/* ========================================================= */}
      {activeSubTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top 3 Podium Display */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#FCE7F3] shadow-sm">
            <div className="text-center space-y-1 mb-6">
              <h2 className="text-xl font-black text-slate-800 flex items-center justify-center gap-2">
                <span>🏆</span>
                <span>BẢNG VÀNG DANH DỰ CỦA LỚP</span>
              </h2>
              <p className="text-xs text-pink-600 font-bold">
                Tuyên dương các cá nhân xuất sắc nhất trong vườn hoa thi đua
              </p>
            </div>

            {/* Podium */}
            {sortedStudents.length >= 3 && (
              <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end max-w-2xl mx-auto pt-6">
                {/* Top 2 - Silver */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-slate-300 overflow-hidden shadow-md mb-2 p-0.5 bg-slate-100">
                    <img
                      src={getStudentAvatarUrl(sortedStudents[1])}
                      alt={sortedStudents[1].name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="font-black text-xs sm:text-sm text-slate-800 truncate max-w-[120px]">
                    {sortedStudents[1].name}
                  </div>
                  <div className="text-xs font-extrabold text-purple-700">
                    {sortedStudents[1].flowerPoints} ⭐
                  </div>
                  <div className="w-full mt-2 h-24 sm:h-28 rounded-t-3xl bg-gradient-to-b from-slate-200 to-slate-300 border-t-4 border-slate-400 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-700">🥈</span>
                    <span className="text-xs font-black text-slate-600">Top 2 • Tổ {sortedStudents[1].group}</span>
                  </div>
                </div>

                {/* Top 1 - Gold */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-2">
                    <Crown className="w-7 h-7 text-amber-500 fill-amber-400 absolute -top-6 left-1/2 -translate-x-1/2 animate-bounce-subtle" />
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 overflow-hidden shadow-xl p-0.5 bg-amber-50 ring-4 ring-amber-300/40">
                      <img
                        src={getStudentAvatarUrl(sortedStudents[0])}
                        alt={sortedStudents[0].name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <div className="font-black text-sm sm:text-base text-slate-900 truncate max-w-[140px]">
                    {sortedStudents[0].name}
                  </div>
                  <div className="text-sm font-black text-amber-700">
                    {sortedStudents[0].flowerPoints} ⭐
                  </div>
                  <div className="w-full mt-2 h-32 sm:h-36 rounded-t-3xl bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400 border-t-4 border-amber-500 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-3xl font-black text-amber-900">🥇</span>
                    <span className="text-xs font-black text-amber-900">Quán quân • Tổ {sortedStudents[0].group}</span>
                  </div>
                </div>

                {/* Top 3 - Bronze */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-amber-600 overflow-hidden shadow-md mb-2 p-0.5 bg-amber-50">
                    <img
                      src={getStudentAvatarUrl(sortedStudents[2])}
                      alt={sortedStudents[2].name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div className="font-black text-xs sm:text-sm text-slate-800 truncate max-w-[120px]">
                    {sortedStudents[2].name}
                  </div>
                  <div className="text-xs font-extrabold text-amber-800">
                    {sortedStudents[2].flowerPoints} ⭐
                  </div>
                  <div className="w-full mt-2 h-20 sm:h-24 rounded-t-3xl bg-gradient-to-b from-orange-200 to-orange-300 border-t-4 border-orange-400 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-orange-800">🥉</span>
                    <span className="text-xs font-black text-orange-800">Top 3 • Tổ {sortedStudents[2].group}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Full Ranked Table */}
          <div className="bg-white rounded-3xl p-5 border-2 border-[#FCE7F3] shadow-sm">
            <h3 className="font-black text-sm text-slate-800 mb-4 flex items-center gap-2">
              <span>📊</span>
              <span>Bảng Thứ Hạng Chi Tiết Cả Lớp ({students.length} học sinh)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-pink-100 text-slate-500 font-bold">
                    <th className="p-3">Hạng</th>
                    <th className="p-3">Học sinh</th>
                    <th className="p-3">Tổ</th>
                    <th className="p-3">Cấp độ Cây</th>
                    <th className="p-3 text-right">Tổng điểm Sao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50">
                  {sortedStudents.map((s, index) => {
                    const treeInfo = getTreeEvolutionInfo(s.flowerPoints);
                    return (
                      <tr key={s.id} className="hover:bg-pink-50/40 transition">
                        <td className="p-3 font-black">
                          {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2.5 font-black text-slate-800">
                            <img
                              src={getStudentAvatarUrl(s)}
                              alt={s.name}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                            <span>{s.name}</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-slate-600">Tổ {s.group}</td>
                        <td className="p-3 font-semibold text-purple-700">
                          {treeInfo.currentStage.icon} {treeInfo.currentStage.name}
                        </td>
                        <td className="p-3 text-right font-black text-pink-600 text-sm">
                          {s.flowerPoints} ⭐
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: KHEN THƯỞNG / NHẮC NHỞ & ✏️ BÚT CHỈNH SỬA TIÊU CHÍ */}
      {/* ========================================================= */}
      {scoringModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-2 border-pink-200 animate-fadeIn space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b-2 border-pink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#EC4899] text-white flex items-center justify-center font-black">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">{scoringModalTarget.title}</h3>
                  <p className="text-xs text-pink-600 font-bold">Chọn tiêu chí để ghi nhận điểm thi đua</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScoringModalTarget(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Praise vs Reminder Toggle */}
            <div className="flex items-center gap-2 p-1 bg-pink-50 rounded-2xl border border-pink-200">
              <button
                type="button"
                onClick={() => setScoringTab('praise')}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                  scoringTab === 'praise'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <Smile className="w-4 h-4" />
                <span>⭐ KHEN THƯỞNG (CỘNG ĐIỂM)</span>
              </button>

              <button
                type="button"
                onClick={() => setScoringTab('reminder')}
                className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer ${
                  scoringTab === 'reminder'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-rose-800 hover:bg-rose-100'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>⚠️ NHẮC NHỞ (TRỪ/GHI NHẬN)</span>
              </button>
            </div>

            {/* Criteria Grid with ✏️ Edit Pen */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[220px]">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                  Danh sách tiêu chí {scoringTab === 'praise' ? 'khen thưởng' : 'nhắc nhở'}:
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenAddCriterion(scoringTab)}
                  className="text-xs font-black text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-3 py-1 rounded-xl border border-purple-200 transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ THÊM TIÊU CHÍ</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeCriteria.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-400 text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Chưa có tiêu chí nào. Nhấp "+ THÊM TIÊU CHÍ" để tạo mới!
                  </div>
                ) : (
                  activeCriteria.map((crit) => {
                    const isPraise = crit.type === 'praise' || crit.points >= 0;
                    const pts = Math.abs(crit.points);

                    return (
                      <div
                        key={crit.id}
                        onClick={() => handleApplyCriterion(crit)}
                        className={`p-3 rounded-2xl border-2 transition flex items-center justify-between gap-2 cursor-pointer group hover:scale-[1.01] ${
                          isPraise
                            ? 'bg-emerald-50/50 hover:bg-emerald-100/70 border-emerald-200 text-slate-800'
                            : 'bg-rose-50/50 hover:bg-rose-100/70 border-rose-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <span className="text-2xl shrink-0">{crit.icon || (isPraise ? '⭐' : '⚠️')}</span>
                          <div className="min-w-0">
                            <div className="font-black text-xs truncate group-hover:text-purple-900">
                              {crit.label}
                            </div>
                            <div className={`text-[10px] font-black ${isPraise ? 'text-emerald-700' : 'text-rose-700'}`}>
                              {isPraise ? `+${pts} sao` : `-${pts} sao`}
                            </div>
                          </div>
                        </div>

                        {/* ✏️ Edit Pen Button */}
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditCriterion(crit, e)}
                          className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-purple-700 border border-slate-200 shadow-2xs transition shrink-0 cursor-pointer"
                          title="Chỉnh sửa tiêu chí này"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t-2 border-pink-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setScoringModalTarget(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ✏️ THÊM / SỬA TIÊU CHÍ KHEN THƯỞNG & NHẮC NHỞ     */}
      {/* ========================================================= */}
      {(editingCriterion || isAddingNewCriterion) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-purple-200 animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-pink-100">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-base text-slate-900">
                  {isAddingNewCriterion ? 'Thêm Tiêu Chí Mới' : 'Chỉnh Sửa Tiêu Chí'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingCriterion(null);
                  setIsAddingNewCriterion(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCriterion} className="space-y-3.5">
              {/* Tên tiêu chí */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">
                  Tên tiêu chí <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={criterionLabel}
                  onChange={(e) => setCriterionLabel(e.target.value)}
                  placeholder="Ví dụ: Hăng hái phát biểu, Giúp đỡ bạn..."
                  className="w-full px-3.5 py-2 bg-slate-50 border-2 border-pink-100 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-purple-400"
                />
              </div>

              {/* Loại tiêu chí & Điểm số */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Loại tiêu chí</label>
                  <select
                    value={criterionType}
                    onChange={(e) => setCriterionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-pink-100 rounded-2xl text-xs font-bold text-slate-900"
                  >
                    <option value="praise">⭐ Khen thưởng (+)</option>
                    <option value="reminder">⚠️ Nhắc nhở (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">Số điểm (sao)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={criterionPoints}
                    onChange={(e) => setCriterionPoints(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-pink-100 rounded-2xl text-xs font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Icon Emoji */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Biểu tượng Icon (Emoji)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={criterionIcon}
                    onChange={(e) => setCriterionIcon(e.target.value)}
                    className="w-16 text-center text-xl px-2 py-1.5 bg-slate-50 border-2 border-pink-100 rounded-2xl font-bold"
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {['⭐', '🌸', '✨', '📚', '💡', '🏆', '🎯', '🤝', '⚠️', '💤', '💬', '🧹'].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setCriterionIcon(em)}
                        className="px-2 py-1 rounded-xl bg-slate-100 hover:bg-purple-100 text-sm cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Áp dụng cho Cá nhân / Tổ / Cả hai */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Đối tượng áp dụng</label>
                <select
                  value={criterionTargetType}
                  onChange={(e) => setCriterionTargetType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-pink-100 rounded-2xl text-xs font-bold text-slate-900"
                >
                  <option value="both">Cả cá nhân và tổ</option>
                  <option value="individual">Chỉ cá nhân</option>
                  <option value="group">Chỉ tổ / nhóm</option>
                </select>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-3 border-t-2 border-pink-100">
                {editingCriterion ? (
                  <button
                    type="button"
                    onClick={() => handleDeleteCriterion(editingCriterion.id)}
                    className="px-3.5 py-2 rounded-2xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCriterion(null);
                      setIsAddingNewCriterion(false);
                    }}
                    className="px-4 py-2 rounded-2xl text-slate-600 hover:bg-slate-100 text-xs font-black cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-2xl candy-btn-purple text-white text-xs font-black shadow-md cursor-pointer"
                  >
                    {isAddingNewCriterion ? 'Tạo Tiêu Chí' : 'Lưu Thay Đổi'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: LỊCH SỬ TÍCH ĐIỂM (CÁ NHÂN HOẶC TỔ)               */}
      {/* ========================================================= */}
      {historyModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-pink-200 animate-fadeIn space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b-2 border-pink-100">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-purple-600" />
                <h3 className="font-black text-base text-slate-900">
                  {historyModalTarget.type === 'individual' && historyModalTarget.student
                    ? `Lịch Sử: ${historyModalTarget.student.name}`
                    : `Lịch Sử: Tổ ${historyModalTarget.groupNum}`}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHistoryModalTarget(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[200px]">
              {(() => {
                const targetStudentIds = historyModalTarget.type === 'individual' && historyModalTarget.student
                  ? [historyModalTarget.student.id]
                  : students.filter((s) => s.group === historyModalTarget.groupNum).map((s) => s.id);

                const logs = pointLogs.filter((l) => targetStudentIds.includes(l.studentId));

                if (logs.length === 0) {
                  return (
                    <div className="py-8 text-center text-slate-400 text-xs font-bold">
                      Chưa có lịch sử tích điểm nào.
                    </div>
                  );
                }

                return logs.map((log) => {
                  const isPositive = log.delta > 0;
                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-lg">{isPositive ? '⭐' : '⚠️'}</span>
                        <div className="min-w-0">
                          <div className="font-black text-slate-800 truncate">{log.reason || 'Khen thưởng'}</div>
                          <div className="text-[10px] text-slate-400">{log.studentName} • {new Date(log.timestamp).toLocaleDateString('vi-VN')}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-2.5 py-0.5 rounded-full font-black ${
                          isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isPositive ? `+${log.delta}` : log.delta} ⭐
                        </span>
                        {onDeletePointLog && (
                          <button
                            type="button"
                            onClick={() => onDeletePointLog(log.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                            title="Xóa nhật ký này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            <div className="pt-3 border-t-2 border-pink-100 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryModalTarget(null)}
                className="px-5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: VƯỜN CÂY ƯỚC MƠ CÁ NHÂN (STUDENT GARDEN MODAL)    */}
      {/* ========================================================= */}
      {gardenModalStudent && (
        <StudentGardenModal
          student={gardenModalStudent}
          onClose={() => setGardenModalStudent(null)}
        />
      )}
    </div>
  );
};
