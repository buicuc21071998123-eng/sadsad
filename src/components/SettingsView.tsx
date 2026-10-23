import React, { useState, useEffect, useRef } from 'react';
import { ClassConfig, Student, RewardItem, ScoringCriterion, PointCategory } from '../types';
import { initialClassConfig, initialCriteria, initialRewards } from '../data/initialData';
import { compressImage } from '../utils/imageUtils';
import { sound } from '../utils/soundEffects';
import { TeacherAvatar } from './TeacherAvatar';
import { TeacherAvatarModal } from './TeacherAvatarModal';
import { 
  Settings, 
  Save, 
  Upload, 
  Download, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Sparkles, 
  User, 
  School, 
  Image as ImageIcon, 
  CheckCircle2, 
  X, 
  Plus, 
  Lock,
  Camera,
  RotateCcw,
  Edit2,
  Sliders,
  Users,
  Award,
  Check,
  ShieldAlert,
  ArrowRight,
  Flame,
  Volume2,
  Clock,
  Gamepad2,
  Calendar,
  Layers,
  HelpCircle
} from 'lucide-react';

interface SettingsViewProps {
  config: ClassConfig;
  students: Student[];
  rewards?: RewardItem[];
  criteria: ScoringCriterion[];
  onSaveConfig: (newConfig: ClassConfig) => void;
  onUpdateCriteria?: (newCriteria: ScoringCriterion[]) => void;
  onUpdateRewards?: (newRewards: RewardItem[]) => void;
  onResetStudents?: () => void;
  onResetGarden?: () => void;
  onResetAttendance?: () => void;
  onResetGames?: () => void;
  onResetTimer?: () => void;
  onResetNoiseMeter?: () => void;
  onResetCriteria?: () => void;
  onResetAllPoints?: () => void;
  onResetAllData?: () => void;
  onExportFullData?: () => void;
  onImportFullData?: (data: any) => void;
  onNavigateToDashboard?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  students,
  rewards = initialRewards,
  criteria,
  onSaveConfig,
  onUpdateCriteria,
  onUpdateRewards,
  onResetStudents,
  onResetGarden,
  onResetAttendance,
  onResetGames,
  onResetTimer,
  onResetNoiseMeter,
  onResetCriteria,
  onResetAllPoints,
  onResetAllData,
  onExportFullData,
  onImportFullData,
  onNavigateToDashboard,
}) => {
  const [formData, setFormData] = useState<ClassConfig>(config);
  const [criteriaList, setCriteriaList] = useState<ScoringCriterion[]>(criteria);
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  // Criteria active tab: 'praise' | 'reminder'
  const [criteriaTab, setCriteriaTab] = useState<'praise' | 'reminder'>('praise');
  const [criteriaTargetFilter, setCriteriaTargetFilter] = useState<'all' | 'individual' | 'group'>('all');

  // Edit / Add Criteria Modal
  const [editingCriterion, setEditingCriterion] = useState<ScoringCriterion | null>(null);
  const [isAddingCriterion, setIsAddingCriterion] = useState(false);
  const [criterionFormLabel, setCriterionFormLabel] = useState('');
  const [criterionFormPoints, setCriterionFormPoints] = useState<number>(2);
  const [criterionFormIcon, setCriterionFormIcon] = useState('⭐');
  const [criterionFormCategory, setCriterionFormCategory] = useState<PointCategory>('academic');
  const [criterionFormType, setCriterionFormType] = useState<'praise' | 'reminder'>('praise');
  const [criterionFormTargetType, setCriterionFormTargetType] = useState<'individual' | 'group' | 'both'>('individual');

  // Single Section Reset Modal
  const [singleResetTarget, setSingleResetTarget] = useState<{
    id: 'students' | 'garden' | 'attendance' | 'games' | 'timer' | 'noise' | 'criteria';
    title: string;
    description: string;
    icon: string;
  } | null>(null);

  // Advanced Factory Reset Modal (2-Step)
  const [showFactoryResetModal, setShowFactoryResetModal] = useState(false);
  const [factoryResetStep, setFactoryResetStep] = useState<1 | 2>(1);
  const [factoryResetConfirmText, setFactoryResetConfirmText] = useState('');

  // Delete Criterion Confirm Modal
  const [deletingCriterionId, setDeletingCriterionId] = useState<string | null>(null);

  // Teacher Avatar Modal
  const [showTeacherAvatarModal, setShowTeacherAvatarModal] = useState(false);

  // Sync props
  useEffect(() => {
    setFormData(config);
  }, [config]);

  useEffect(() => {
    setCriteriaList(criteria);
  }, [criteria]);

  // Handle Form Submit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onSaveConfig(formData);
    sound.playReward();
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Preset Emoji Palette for Criteria
  const PRAISE_EMOJIS = ['⭐', '🙋', '✅', '🤝', '🧹', '🧽', '❤️', '💪', '💡', '🎯', '📚', '📝', '🌟', '😊', '🤫', '🏆', '💎', '🎨', '🚀', '👑'];
  const REMINDER_EMOJIS = ['🥱', '🗣️', '⏳', '🎒', '🧻', '⚠️', '📢', '🚶', '❌', '👀', '📱', '🛑', '😴', '🐢', '🗯️'];

  // Handle Open Add Criterion Modal
  const handleOpenAddCriterion = (type: 'praise' | 'reminder') => {
    setIsAddingCriterion(true);
    setEditingCriterion(null);
    setCriterionFormType(type);
    setCriterionFormLabel('');
    setCriterionFormPoints(type === 'praise' ? 2 : -1);
    setCriterionFormIcon(type === 'praise' ? '⭐' : '⚠️');
    setCriterionFormCategory('academic');
    setCriterionFormTargetType('individual');
    sound.playClick();
  };

  // Handle Open Edit Criterion Modal
  const handleOpenEditCriterion = (criterion: ScoringCriterion) => {
    setEditingCriterion(criterion);
    setIsAddingCriterion(false);
    setCriterionFormType(criterion.type || (criterion.points >= 0 ? 'praise' : 'reminder'));
    setCriterionFormLabel(criterion.label);
    setCriterionFormPoints(criterion.points);
    setCriterionFormIcon(criterion.icon || '⭐');
    setCriterionFormCategory(criterion.category || 'academic');
    setCriterionFormTargetType(criterion.targetType || 'individual');
    sound.playClick();
  };

  // Save Criterion (Add or Edit)
  const handleSaveCriterion = () => {
    if (!criterionFormLabel.trim()) {
      alert('Vui lòng nhập tên tiêu chí!');
      return;
    }

    const pointsNum = Number(criterionFormPoints);
    let finalPoints = pointsNum;
    if (criterionFormType === 'praise' && finalPoints <= 0) finalPoints = Math.abs(pointsNum) || 1;
    if (criterionFormType === 'reminder' && finalPoints >= 0) finalPoints = -Math.abs(pointsNum) || -1;

    let updatedList: ScoringCriterion[];

    if (editingCriterion) {
      updatedList = criteriaList.map((c) =>
        c.id === editingCriterion.id
          ? {
              ...c,
              label: criterionFormLabel.trim(),
              points: finalPoints,
              icon: criterionFormIcon || '⭐',
              category: criterionFormCategory,
              type: criterionFormType,
              targetType: criterionFormTargetType,
              categoryTag: criterionFormTargetType === 'group' ? '[Tổ]' : (criterionFormType === 'reminder' ? '[Nhắc nhở]' : `[${criterionFormCategory}]`),
            }
          : c
      );
    } else {
      const newCrit: ScoringCriterion = {
        id: `crit-${Date.now()}`,
        label: criterionFormLabel.trim(),
        points: finalPoints,
        icon: criterionFormIcon || (criterionFormType === 'praise' ? '⭐' : '⚠️'),
        category: criterionFormCategory,
        type: criterionFormType,
        targetType: criterionFormTargetType,
        isActive: true,
        categoryTag: criterionFormTargetType === 'group' ? '[Tổ]' : (criterionFormType === 'reminder' ? '[Nhắc nhở]' : `[${criterionFormCategory}]`),
      };
      updatedList = [...criteriaList, newCrit];
    }

    setCriteriaList(updatedList);
    if (onUpdateCriteria) onUpdateCriteria(updatedList);
    setEditingCriterion(null);
    setIsAddingCriterion(false);
    sound.playReward();
  };

  // Toggle Criterion Active State
  const handleToggleCriterionActive = (id: string) => {
    const updated = criteriaList.map((c) => (c.id === id ? { ...c, isActive: c.isActive === false ? true : false } : c));
    setCriteriaList(updated);
    if (onUpdateCriteria) onUpdateCriteria(updated);
    sound.playClick();
  };

  // Delete Criterion
  const handleConfirmDeleteCriterion = () => {
    if (!deletingCriterionId) return;
    const updated = criteriaList.filter((c) => c.id !== deletingCriterionId);
    setCriteriaList(updated);
    if (onUpdateCriteria) onUpdateCriteria(updated);
    setDeletingCriterionId(null);
    sound.playClick();
  };

  // Handle Single Reset Confirmation
  const handleExecuteSingleReset = () => {
    if (!singleResetTarget) return;

    switch (singleResetTarget.id) {
      case 'students':
        if (onResetStudents) onResetStudents();
        break;
      case 'garden':
        if (onResetGarden) onResetGarden();
        else if (onResetAllPoints) onResetAllPoints();
        break;
      case 'attendance':
        if (onResetAttendance) onResetAttendance();
        break;
      case 'games':
        if (onResetGames) onResetGames();
        break;
      case 'timer':
        if (onResetTimer) onResetTimer();
        break;
      case 'noise':
        if (onResetNoiseMeter) onResetNoiseMeter();
        break;
      case 'criteria':
        if (onResetCriteria) onResetCriteria();
        else {
          setCriteriaList(initialCriteria);
          if (onUpdateCriteria) onUpdateCriteria(initialCriteria);
        }
        break;
    }

    setSingleResetTarget(null);
    sound.playClick();
  };

  // Handle Full App Factory Reset
  const handleExecuteFactoryReset = () => {
    if (factoryResetConfirmText.trim().toUpperCase() !== 'RESET') {
      alert('Vui lòng nhập đúng từ RESET để xác nhận!');
      return;
    }

    setShowFactoryResetModal(false);
    setFactoryResetStep(1);
    setFactoryResetConfirmText('');

    if (onResetAllData) {
      onResetAllData();
    } else {
      setFormData(initialClassConfig);
      onSaveConfig(initialClassConfig);
      if (onResetGarden) onResetGarden();
      if (onResetStudents) onResetStudents();
      if (onResetAttendance) onResetAttendance();
      if (onResetCriteria) onResetCriteria();
      if (onResetGames) onResetGames();
      if (onResetTimer) onResetTimer();
      if (onResetNoiseMeter) onResetNoiseMeter();
    }

    sound.playLevelUp();
    if (onNavigateToDashboard) {
      onNavigateToDashboard();
    }
  };

  // Filtered Criteria List
  const filteredCriteria = criteriaList.filter((c) => {
    const isPraise = c.type === 'praise' || (c.points >= 0 && c.type !== 'reminder');
    const matchesTab = criteriaTab === 'praise' ? isPraise : !isPraise;
    if (!matchesTab) return false;

    if (criteriaTargetFilter === 'individual') return c.targetType !== 'group';
    if (criteriaTargetFilter === 'group') return c.targetType === 'group' || c.targetType === 'both';
    return true;
  });

  // JSON File Import Handler
  const handleJsonFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && (parsed.students || parsed.config)) {
          if (onImportFullData) onImportFullData(parsed);
          sound.playReward();
          alert('Đã phục hồi dữ liệu lớp học thành công từ tệp sao lưu JSON!');
        } else {
          alert('Tệp JSON không đúng định dạng sao lưu của hệ thống.');
        }
      } catch (err) {
        alert('Lỗi đọc tệp JSON: Dữ liệu không hợp lệ.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div id="settings-view-container" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#EC4899] text-white flex items-center justify-center font-black shadow-md shadow-pink-300/40">
            <Settings className="w-6 h-6 text-yellow-200" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>8. CÀI ĐẶT HỆ THỐNG</span>
              {isSavedAlert && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-black animate-bounce shadow-sm">
                  ✓ ĐÃ LƯU THÀNH CÔNG!
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Thông tin lớp học, tùy chỉnh tiêu chí thi đua, sao lưu và làm mới dữ liệu an toàn
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => handleSubmit()}
          className="candy-btn-purple text-white px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 self-stretch sm:self-auto justify-center shadow-md active:scale-95 cursor-pointer"
        >
          <Save className="w-4 h-4 text-yellow-200" />
          <span>Lưu Thay Đổi 💾</span>
        </button>
      </div>

      {/* Teacher Avatar Modal */}
      <TeacherAvatarModal
        isOpen={showTeacherAvatarModal}
        currentAvatarUrl={formData.teacherAvatarUrl}
        teacherName={formData.teacherName || 'Cô Bùi Thị Cúc'}
        teacherRole={formData.teacherRole || 'Giáo viên chủ nhiệm'}
        onClose={() => setShowTeacherAvatarModal(false)}
        onSaveAvatar={(newAvatarUrl) => {
          setFormData((prev) => ({ ...prev, teacherAvatarUrl: newAvatarUrl }));
        }}
      />

      {/* ========================================================================= */}
      {/* SECTION A: THÔNG TIN LỚP HỌC */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#FCE7F3]">
          <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
            <span>A. THÔNG TIN LỚP HỌC</span>
          </h3>
          <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            {formData.className || 'Lớp 4A2'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tên lớp */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>🏫 Tên Lớp</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                placeholder="VD: Lớp 4A2"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm font-bold text-slate-800 bg-slate-50/50"
                required
              />
            </div>

            {/* Tên giáo viên */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>👩‍🏫 Tên Giáo Viên Chủ Nhiệm</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.teacherName}
                onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                placeholder="VD: Cô Bùi Thị Cúc"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm font-bold text-slate-800 bg-slate-50/50"
                required
              />
            </div>

            {/* Năm học */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>📅 Năm Học</span>
              </label>
              <input
                type="text"
                value={formData.schoolYear || ''}
                onChange={(e) => setFormData({ ...formData, schoolYear: e.target.value })}
                placeholder="VD: 2026 - 2027"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm font-bold text-slate-800 bg-slate-50/50"
              />
            </div>

            {/* Tên trường học */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>🏛️ Tên Trường Học</span>
              </label>
              <input
                type="text"
                value={formData.schoolName || ''}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="VD: Trường Tiểu Học Vườn Ươm"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm font-bold text-slate-800 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Slogan & Banner Message */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">
                ✨ Tiêu Đề Banner Lớp Học
              </label>
              <input
                type="text"
                value={formData.bannerTitle || ''}
                onChange={(e) => setFormData({ ...formData, bannerTitle: e.target.value })}
                placeholder="VD: VƯỜN ƯƠM TRI THỨC"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm font-bold text-slate-800 bg-slate-50/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">
                💬 Thông Điệp / Khẩu Hiệu Lớp
              </label>
              <input
                type="text"
                value={formData.smallMessage || ''}
                onChange={(e) => setFormData({ ...formData, smallMessage: e.target.value })}
                placeholder="VD: Mỗi ngày đến trường là một ngày vui ❤️"
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none text-sm font-bold text-slate-800 bg-slate-50/50"
              />
            </div>
          </div>

          {/* Tên các tổ / nhóm (4 Tổ mặc định) */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-3">
            <div className="text-xs font-black text-purple-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              <span>Tùy chỉnh tên 4 Tổ / Nhóm thi đua:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((groupNum) => (
                <div key={groupNum} className="space-y-1">
                  <label className="text-[11px] font-bold text-purple-700">
                    Tổ {groupNum}:
                  </label>
                  <input
                    type="text"
                    value={formData.groupNames?.[groupNum as 1 | 2 | 3 | 4] || `Tổ ${groupNum}`}
                    onChange={(e) => {
                      const updatedGroupNames = {
                        ...(formData.groupNames || { 1: 'Tổ 1', 2: 'Tổ 2', 3: 'Tổ 3', 4: 'Tổ 4' }),
                        [groupNum]: e.target.value,
                      };
                      setFormData({ ...formData, groupNames: updatedGroupNames as any });
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-purple-200 bg-white text-xs font-bold text-slate-800 focus:border-purple-500 outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Teacher Avatar Quick Control */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-gradient-to-r from-pink-50/60 via-purple-50/40 to-pink-50/60 rounded-2xl border border-pink-200 gap-4">
            <div className="flex items-center gap-3.5">
              <TeacherAvatar
                avatarUrl={formData.teacherAvatarUrl}
                teacherName={formData.teacherName || 'Cô Bùi Thị Cúc'}
                teacherRole={formData.teacherRole || 'Giáo viên chủ nhiệm'}
                size="md"
                shape="circle"
                showBadge={true}
                showCameraBtn={true}
                onClick={() => setShowTeacherAvatarModal(true)}
              />
              <div>
                <h4 className="text-xs font-black text-purple-950 uppercase tracking-wide">
                  Ảnh Chân Dung Giáo Viên
                </h4>
                <p className="text-[11px] text-slate-500 font-medium">
                  {formData.teacherAvatarUrl ? 'Đã cài đặt ảnh chân dung' : 'Đang dùng avatar mặc định'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTeacherAvatarModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Đổi Ảnh Giáo Viên</span>
              </button>
              <button
                type="submit"
                className="candy-btn-purple text-white px-5 py-2 rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 cursor-pointer transition"
              >
                <Save className="w-3.5 h-3.5" />
                <span>LƯU THAY ĐỔI 💾</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* SECTION B: QUẢN LÝ TIÊU CHÍ KHEN THƯỞNG & NHẮC NHỞ */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b-2 border-[#FCE7F3] gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-sm sm:text-base">
                B. QUẢN LÝ TIÊU CHÍ THI ĐUA
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Tự do chỉnh sửa tên, số điểm, biểu tượng, bật/tắt hoặc thêm mới tiêu chí
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleOpenAddCriterion(criteriaTab)}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ THÊM TIÊU CHÍ</span>
            </button>
            <button
              type="button"
              onClick={() => setSingleResetTarget({
                id: 'criteria',
                title: 'Khôi phục tiêu chí ban đầu',
                description: 'Đưa toàn bộ tiêu chí khen thưởng và nhắc nhở về bộ tiêu chí tiêu chuẩn ban đầu của ứng dụng.',
                icon: '⭐'
              })}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition"
              title="Khôi phục tiêu chuẩn"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mặc định</span>
            </button>
          </div>
        </div>

        {/* Tabs: Praise vs Reminder */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setCriteriaTab('praise');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                criteriaTab === 'praise'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⭐</span>
              <span>TIÊU CHÍ KHEN THƯỞNG ({criteriaList.filter(c => c.type === 'praise' || (c.points >= 0 && c.type !== 'reminder')).length})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setCriteriaTab('reminder');
                sound.playClick();
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                criteriaTab === 'reminder'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>⚠️</span>
              <span>TIÊU CHÍ NHẮC NHỞ ({criteriaList.filter(c => c.type === 'reminder' || c.points < 0).length})</span>
            </button>
          </div>

          {/* Scope Filters */}
          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-slate-400 text-[11px]">Phạm vi:</span>
            {[
              { id: 'all' as const, label: 'Tất cả' },
              { id: 'individual' as const, label: '👤 Cá nhân' },
              { id: 'group' as const, label: '👥 Theo tổ' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setCriteriaTargetFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  criteriaTargetFilter === f.id
                    ? 'bg-purple-100 text-purple-900 font-black border border-purple-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Criteria Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCriteria.map((criterion) => {
            const isPraise = criterion.type === 'praise' || (criterion.points >= 0 && criterion.type !== 'reminder');
            const isActive = criterion.isActive !== false;

            return (
              <div
                key={criterion.id}
                className={`p-3.5 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                  !isActive
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : isPraise
                    ? 'bg-white border-pink-200 hover:border-pink-300 shadow-xs'
                    : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-2xl w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    {criterion.icon || '⭐'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs sm:text-sm font-black text-slate-800 truncate">
                        {criterion.label}
                      </span>
                      {criterion.targetType === 'group' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200 shrink-0">
                          Tổ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-xs sm:text-sm font-black ${
                          isPraise ? 'text-pink-600' : 'text-amber-700'
                        }`}
                      >
                        {criterion.points > 0 ? `+${criterion.points}` : criterion.points} ⭐
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">
                        {criterion.categoryTag || '[Chung]'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {/* Toggle Active Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleCriterionActive(criterion.id)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                    }`}
                    title={isActive ? 'Đang bật (Nhấp để tắt)' : 'Đang tắt (Nhấp để bật)'}
                  >
                    <Check className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-30'}`} />
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditCriterion(criterion)}
                    className="w-7 h-7 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 flex items-center justify-center transition cursor-pointer"
                    title="Sửa tiêu chí"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeletingCriterionId(criterion.id)}
                    className="w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer"
                    title="Xóa tiêu chí"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredCriteria.length === 0 && (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-xs font-bold">
            Chưa có tiêu chí nào trong danh mục này. Bấm <span className="text-purple-600 font-black">+ THÊM TIÊU CHÍ</span> để tạo mới.
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION C: 🔄 LÀM MỚI DỮ LIỆU TỪNG PHẦN */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#FCE7F3]">
          <div>
            <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <span>C. LÀM MỚI DỮ LIỆU (RESET TỪNG PHẦN)</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Chủ động làm mới từng chức năng riêng biệt khi bắt đầu học kỳ hoặc tuần mới
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {/* 1. Reset Học sinh */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border-2 border-purple-100 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-purple-900">
                <span className="text-lg">👩‍🎓</span>
                <span>Làm Mới Danh Sách Học Sinh</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Xóa toàn bộ học sinh hiện tại, đưa sĩ số về 0 để nhập danh sách mới.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSingleResetTarget({
                id: 'students',
                title: 'Làm mới danh sách học sinh',
                description: 'Bạn có chắc muốn làm mới danh sách học sinh? Thao tác này sẽ xóa toàn bộ học sinh hiện tại.',
                icon: '👩‍🎓'
              })}
              className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              Làm Mới Học Sinh 👩‍🎓
            </button>
          </div>

          {/* 2. Reset Vườn thành tích */}
          <div className="p-4 rounded-2xl bg-pink-50/50 border-2 border-pink-100 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-pink-900">
                <span className="text-lg">🌱</span>
                <span>Làm Mới Vườn Thành Tích</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Đưa toàn bộ điểm thi đua cá nhân, điểm tổ về 0 ⭐ và xóa lịch sử thành tích.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSingleResetTarget({
                id: 'garden',
                title: 'Làm mới Vườn thành tích',
                description: 'Bạn có chắc muốn làm mới dữ liệu Vườn thành tích? Thao tác này sẽ xóa điểm và lịch sử thành tích hiện tại.',
                icon: '🌱'
              })}
              className="w-full py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              Làm Mới Vườn Điểm 🌱
            </button>
          </div>

          {/* 3. Reset Điểm danh */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border-2 border-emerald-100 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-emerald-900">
                <span className="text-lg">✅</span>
                <span>Làm Mới Điểm Danh</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Xóa toàn bộ lịch sử điểm danh chuyên cần và trạng thái điểm danh hôm nay.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSingleResetTarget({
                id: 'attendance',
                title: 'Làm mới dữ liệu điểm danh',
                description: 'Bạn có chắc muốn làm mới dữ liệu Điểm danh? Thao tác này sẽ xóa toàn bộ lịch sử điểm danh đã lưu.',
                icon: '✅'
              })}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              Làm Mới Điểm Danh ✅
            </button>
          </div>

          {/* 4. Reset Trò chơi */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-100 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-amber-900">
                <span className="text-lg">🎮</span>
                <span>Làm Mới Trò Chơi Lớp Học</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Xóa danh sách học sinh đã gọi, kết quả trò chơi và đưa vòng quay về ban đầu.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSingleResetTarget({
                id: 'games',
                title: 'Làm mới dữ liệu trò chơi',
                description: 'Bạn có chắc muốn làm mới dữ liệu Trò chơi? Thao tác này sẽ xóa lịch sử học sinh đã được gọi trong vòng quay và các game.',
                icon: '🎮'
              })}
              className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              Làm Mới Trò Chơi 🎮
            </button>
          </div>

          {/* 5. Reset Đồng hồ */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border-2 border-blue-100 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-blue-900">
                <span className="text-lg">⏱️</span>
                <span>Làm Mới Đồng Hồ</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Đưa cấu hình đếm ngược, bấm giờ và chuông báo về trạng thái mặc định.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSingleResetTarget({
                id: 'timer',
                title: 'Làm mới Đồng hồ',
                description: 'Bạn có chắc muốn đưa Đồng hồ về cấu hình mặc định ban đầu?',
                icon: '⏱️'
              })}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              Làm Mới Đồng Hồ ⏱️
            </button>
          </div>

          {/* 6. Reset Đo tiếng ồn */}
          <div className="p-4 rounded-2xl bg-sky-50/50 border-2 border-sky-100 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black text-sky-900">
                <span className="text-lg">🔊</span>
                <span>Làm Mới Đo Tiếng Ồn</span>
              </div>
              <p className="text-[11px] text-slate-600 mt-1">
                Đưa độ nhạy microphone và thiết lập cảnh báo trật tự về mặc định.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSingleResetTarget({
                id: 'noise',
                title: 'Làm mới Đo tiếng ồn',
                description: 'Bạn có chắc muốn đưa thiết lập độ nhạy và cảnh báo đo tiếng ồn về mặc định?',
                icon: '🔊'
              })}
              className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-xs transition active:scale-95 cursor-pointer"
            >
              Làm Mới Đo Tiếng Ồn 🔊
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION D: 📥 SAO LƯU & PHỤC HỒI DỮ LIỆU */}
      {/* ========================================================================= */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#FCE7F3]">
          <div>
            <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <span>D. SAO LƯU & PHỤC HỒI DỮ LIỆU</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Tải file sao lưu (.json) lưu trữ về máy tính để phòng ngừa hoặc chuyển đổi máy dạy
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-teal-950 flex items-center gap-2">
                <Download className="w-4 h-4 text-teal-600" />
                <span>1. Sao Lưu Dữ Liệu Lớp Học (Tải Về JSON)</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Xuất trọn vẹn thông tin học sinh, điểm hoa, tiêu chí, lịch sử điểm danh thành tệp tin an toàn.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (onExportFullData) onExportFullData();
                sound.playReward();
              }}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>📥 TẢI FILE SAO LƯU (.JSON)</span>
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 flex flex-col justify-between gap-3">
            <div>
              <h4 className="text-xs font-black text-indigo-950 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>2. Phục Hồi Dữ Liệu Từ File Sao Lưu</span>
              </h4>
              <p className="text-[11px] text-slate-600 mt-1">
                Nạp lại dữ liệu lớp học đã sao lưu trước đó để tiếp tục sử dụng liền mạch.
              </p>
            </div>
            <label className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm flex items-center justify-center gap-2 cursor-pointer transition active:scale-95">
              <Upload className="w-4 h-4" />
              <span>📤 NẠP FILE SAO LƯU (.JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleJsonFileInput}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION E: ⚠️ VÙNG CÀI ĐẶT NÂNG CAO - LÀM MỚI TOÀN BỘ ỨNG DỤNG */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-rose-50/80 via-white to-pink-50/80 rounded-3xl p-5 sm:p-6 border-2 border-rose-300 shadow-md shadow-rose-100/50 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-sm">
            <AlertTriangle className="w-5 h-5 text-yellow-200" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-rose-800 tracking-tight flex items-center gap-2">
              <span>E. VÙNG CÀI ĐẶT NÂNG CAO</span>
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              Thiết lập lại hoàn toàn ứng dụng cho một lớp học mới hoặc một giáo viên mới sử dụng
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border-2 border-rose-200 space-y-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed font-medium">
              <strong className="text-rose-700">Lưu ý quan trọng:</strong> Thao tác này sẽ xóa toàn bộ dữ liệu người dùng (danh sách học sinh, điểm thành tích, điểm danh, lịch sử trò chơi) để đưa ứng dụng về trạng thái bản trắng sạch sẽ. <br />
              <span className="text-emerald-700 font-bold">✨ Toàn bộ chức năng, mã nguồn, game và giao diện của ứng dụng sẽ được giữ nguyên vẹn 100%.</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 italic">
              Yêu cầu xác thực 2 bước an toàn trước khi thực hiện.
            </span>
            <button
              type="button"
              onClick={() => {
                setShowFactoryResetModal(true);
                setFactoryResetStep(1);
                setFactoryResetConfirmText('');
                sound.playClick();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-300/40 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>🔄 LÀM MỚI TOÀN BỘ ỨNG DỤNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: THÊM / SỬA TIÊU CHÍ */}
      {/* ========================================================================= */}
      {(isAddingCriterion || editingCriterion) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-purple-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b-2 border-purple-100">
              <h4 className="text-base font-black text-purple-950 flex items-center gap-2">
                <span>{editingCriterion ? '✏️ Chỉnh Sửa Tiêu Chí' : '+ Thêm Tiêu Chí Mới'}</span>
              </h4>
              <button
                type="button"
                onClick={() => {
                  setIsAddingCriterion(false);
                  setEditingCriterion(null);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Type: Praise vs Reminder */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Loại tiêu chí:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCriterionFormType('praise');
                      if (criterionFormPoints < 0) setCriterionFormPoints(Math.abs(criterionFormPoints) || 2);
                      setCriterionFormIcon('⭐');
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      criterionFormType === 'praise'
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    ⭐ Khen Thưởng (Cộng)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCriterionFormType('reminder');
                      if (criterionFormPoints > 0) setCriterionFormPoints(-Math.abs(criterionFormPoints) || -1);
                      setCriterionFormIcon('⚠️');
                    }}
                    className={`py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                      criterionFormType === 'reminder'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    ⚠️ Nhắc Nhở (Trừ)
                  </button>
                </div>
              </div>

              {/* Label */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">
                  Tên tiêu chí <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  value={criterionFormLabel}
                  onChange={(e) => setCriterionFormLabel(e.target.value)}
                  placeholder="VD: Tích cực phát biểu, Giúp đỡ bạn..."
                  className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-200 focus:border-purple-500 outline-none text-sm font-bold text-slate-800"
                  autoFocus
                />
              </div>

              {/* Points */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Số điểm:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={criterionFormPoints}
                    onChange={(e) => setCriterionFormPoints(Number(e.target.value))}
                    className="w-24 px-3 py-2 rounded-xl border-2 border-slate-200 text-center font-black text-sm outline-none focus:border-purple-500"
                  />
                  <div className="flex items-center gap-1.5 flex-1">
                    {criterionFormType === 'praise' ? (
                      [1, 2, 3, 5].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setCriterionFormPoints(pts)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            criterionFormPoints === pts
                              ? 'bg-pink-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          +{pts}
                        </button>
                      ))
                    ) : (
                      [-1, -2, -3, -5].map((pts) => (
                        <button
                          key={pts}
                          type="button"
                          onClick={() => setCriterionFormPoints(pts)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                            criterionFormPoints === pts
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {pts}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Scope Target: Individual vs Group */}
              <div className="space-y-1">
                <label className="text-xs font-black text-slate-700">Áp dụng cho:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCriterionFormTargetType('individual')}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      criterionFormTargetType === 'individual'
                        ? 'bg-purple-100 text-purple-900 border-2 border-purple-300 font-black'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    👤 Cá nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => setCriterionFormTargetType('group')}
                    className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      criterionFormTargetType === 'group'
                        ? 'bg-purple-100 text-purple-900 border-2 border-purple-300 font-black'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    👥 Theo tổ/nhóm
                  </button>
                </div>
              </div>

              {/* Icon Emoji Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700 flex items-center justify-between">
                  <span>Biểu tượng (Emoji):</span>
                  <span className="text-xl">{criterionFormIcon}</span>
                </label>
                <div className="grid grid-cols-10 gap-1 p-2 bg-slate-50 rounded-xl border border-slate-200 max-h-24 overflow-y-auto">
                  {(criterionFormType === 'praise' ? PRAISE_EMOJIS : REMINDER_EMOJIS).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setCriterionFormIcon(emoji)}
                      className={`text-lg p-1 rounded-lg hover:bg-white transition cursor-pointer flex items-center justify-center ${
                        criterionFormIcon === emoji ? 'bg-purple-200 ring-2 ring-purple-400' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsAddingCriterion(false);
                  setEditingCriterion(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleSaveCriterion}
                className="flex-1 py-2.5 rounded-xl candy-btn-purple text-white font-black text-xs shadow-md cursor-pointer transition active:scale-95"
              >
                LƯU TIÊU CHÍ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: XÓA TIÊU CHÍ CONFIRM */}
      {/* ========================================================================= */}
      {deletingCriterionId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border-2 border-rose-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-base font-black text-slate-800">Xóa tiêu chí này?</h4>
              <p className="text-xs text-slate-500 font-medium">
                Thao tác này sẽ gỡ bỏ tiêu chí khỏi danh sách lựa chọn tích điểm.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCriterionId(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteCriterion}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md cursor-pointer transition active:scale-95"
              >
                XÁC NHẬN XÓA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: RESET TỪNG PHẦN CONFIRM */}
      {/* ========================================================================= */}
      {singleResetTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-purple-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mx-auto shadow-sm">
              {singleResetTarget.icon}
            </div>
            <div className="text-center space-y-2">
              <h4 className="text-base font-black text-slate-800">
                {singleResetTarget.title}?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {singleResetTarget.description}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSingleResetTarget(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={handleExecuteSingleReset}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-md cursor-pointer transition active:scale-95"
              >
                XÁC NHẬN LÀM MỚI
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FACTORY RESET (LÀM MỚI TOÀN BỘ APP - 2 BƯỚC AN TOÀN) */}
      {/* ========================================================================= */}
      {showFactoryResetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border-2 border-rose-300 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>

            {factoryResetStep === 1 ? (
              <>
                <div className="text-center space-y-2">
                  <h4 className="text-base sm:text-lg font-black text-rose-700 tracking-tight">
                    ⚠️ LÀM MỚI TOÀN BỘ ỨNG DỤNG?
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium px-2">
                    Thao tác này sẽ xóa toàn bộ dữ liệu lớp hiện tại, bao gồm học sinh, điểm thi đua, lịch sử điểm danh và dữ liệu trò chơi. <br /><br />
                    <strong className="text-slate-800">Các chức năng, trò chơi và giao diện của ứng dụng sẽ không bị xóa.</strong> <br />
                    Bạn có chắc chắn muốn tiếp tục?
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowFactoryResetModal(false)}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                  >
                    HỦY
                  </button>
                  <button
                    type="button"
                    onClick={() => setFactoryResetStep(2)}
                    className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-300/40 cursor-pointer transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>TIẾP TỤC</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center space-y-2">
                  <h4 className="text-base sm:text-lg font-black text-rose-700 tracking-tight">
                    🔒 BƯỚC 2: XÁC NHẬN BẢO MẬT
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Vui lòng nhập chính xác từ <strong className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 font-black">RESET</strong> vào ô bên dưới để xác nhận:
                  </p>
                </div>

                <div className="space-y-2 py-1">
                  <input
                    type="text"
                    value={factoryResetConfirmText}
                    onChange={(e) => setFactoryResetConfirmText(e.target.value)}
                    placeholder="Nhập RESET để xác nhận"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-rose-300 text-center font-black text-base text-rose-700 outline-none focus:ring-4 focus:ring-rose-100 bg-rose-50/40"
                    autoFocus
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFactoryResetStep(1);
                      setFactoryResetConfirmText('');
                    }}
                    className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition"
                  >
                    QUAY LẠI
                  </button>
                  <button
                    type="button"
                    disabled={factoryResetConfirmText.trim().toUpperCase() !== 'RESET'}
                    onClick={handleExecuteFactoryReset}
                    className={`flex-1 py-3 rounded-2xl text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 ${
                      factoryResetConfirmText.trim().toUpperCase() === 'RESET'
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-300/50 cursor-pointer active:scale-95'
                        : 'bg-slate-300 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <span>🔴 XÁC NHẬN LÀM MỚI TOÀN BỘ</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
