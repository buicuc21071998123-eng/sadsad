import React, { useState, useRef } from 'react';
import { Student, StudentRole, Gender, ClassConfig, DailyAttendance } from '../types';
import { getAvatarColor, getStudentInitials, getGroupName } from '../utils/helpers';
import { sound } from '../utils/soundEffects';
import { exportClassToExcel, importStudentsFromExcel, exportElementToPdf } from '../utils/exportUtils';
import { getStudentAvatarUrl, compressImage, generateUnique5DigitCode } from '../utils/imageUtils';
import { getTreeEvolutionInfo } from '../data/dreamTreeData';
import { BatchImportModal } from './BatchImportModal';
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw, 
  Search, 
  Users, 
  Check, 
  X,
  Phone,
  Cake,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Target,
  Sparkles,
  LayoutGrid,
  List,
  Star,
  Award,
  Camera,
  ClipboardPaste,
  HelpCircle
} from 'lucide-react';

interface StudentManagerViewProps {
  students: Student[];
  config: ClassConfig;
  attendance: DailyAttendance;
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onResetAllPoints: () => void;
  onImportFullData: (data: any) => void;
  onExportFullData: () => void;
  onBatchUpdateStudents?: (students: Student[]) => void;
}

const ROLE_SUGGESTIONS: StudentRole[] = [
  'Học sinh',
  'Lớp trưởng',
  'Lớp phó học tập',
  'Lớp phó văn thể mỹ',
  'Lớp phó lao động',
  'Tổ trưởng Tổ 1',
  'Tổ trưởng Tổ 2',
  'Tổ trưởng Tổ 3',
  'Tổ trưởng Tổ 4',
  'Bí thư chi đội',
  'Ủy viên ban chỉ huy chi đội',
  'Quản ca'
];

const TARGET_SUGGESTIONS = [
  'Đạt danh hiệu Học sinh Xuất sắc',
  'Đạt giải Nhất Vở sạch chữ đẹp',
  'Lọt Top 3 Vườn hoa thi đua',
  'Đi học đúng giờ 100% các buổi',
  'Đạt 10 điểm bài kiểm tra Toán & Tiếng Việt',
  'Tích lũy đủ 100 hoa để đổi quà bí mật',
  'Tự giác giúp đỡ các bạn trong lớp',
  'Dẫn dắt Tổ đạt danh hiệu Tổ xuất sắc',
];

const TALENT_SUGGESTIONS = [
  'Toán học logic',
  'Hội họa & Vẽ màu nước',
  'Ca hát & Múa dân gian',
  'Cờ vua & Cờ tướng',
  'Bóng đá & Thể thao',
  'Kể chuyện & Thuyết trình',
  'Chữ viết nắn nót',
  'Lắp ráp Lego & Sáng tạo',
  'Giao tiếp Tiếng Anh',
  'Khéo tay làm đồ Handmade',
];

export const StudentManagerView: React.FC<StudentManagerViewProps> = ({
  students,
  config,
  attendance,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onResetAllPoints,
  onImportFullData,
  onExportFullData,
  onBatchUpdateStudents,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<number | 'all'>('all');
  
  // Modal states
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showBatchImportModal, setShowBatchImportModal] = useState(false);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formGender, setFormGender] = useState<Gender>('nam');
  const [formGroup, setFormGroup] = useState<1 | 2 | 3 | 4>(1);
  const [formRole, setFormRole] = useState<StudentRole>('Học sinh');
  const [formBirthday, setFormBirthday] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formPoints, setFormPoints] = useState<number>(0);
  const [formSecurityCode, setFormSecurityCode] = useState('');
  const [formPersonalTarget, setFormPersonalTarget] = useState('');
  const [formTalents, setFormTalents] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState<string | undefined>(undefined);
  const [isCompressingAvatar, setIsCompressingAvatar] = useState(false);

  // Filtering
  const filteredStudents = students.filter((s) => {
    const matchQuery = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.stt.toString() === searchQuery ||
      (s.securityCode && s.securityCode.includes(searchQuery)) ||
      (s.personalTarget && s.personalTarget.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.talents && s.talents.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchGroup = groupFilter === 'all' || s.group === groupFilter;
    return matchQuery && matchGroup;
  });

  // Open Create Form
  const handleOpenCreateModal = () => {
    const nextStt = students.length > 0 ? Math.max(...students.map((s) => s.stt)) + 1 : 1;
    const existingCodes = students.map((s) => s.securityCode || '');
    const newCode = generateUnique5DigitCode(existingCodes);

    setFormName('');
    setFormGender('nam');
    setFormGroup(1);
    setFormRole('Học sinh');
    setFormBirthday('2015-01-01');
    setFormPhone('');
    setFormPoints(0);
    setFormSecurityCode(newCode);
    setFormPersonalTarget('');
    setFormTalents('');
    setFormAvatarUrl(undefined);
    setIsCreatingNew(true);
  };

  // Open Edit Form
  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setFormName(student.name);
    setFormGender(student.gender);
    setFormGroup(student.group);
    setFormRole(student.role);
    setFormBirthday(student.birthday || '');
    setFormPhone(student.parentPhone || '');
    setFormPoints(student.flowerPoints);
    setFormSecurityCode(student.securityCode || generateUnique5DigitCode(students.map(s => s.securityCode)));
    setFormPersonalTarget(student.personalTarget || '');
    setFormTalents(student.talents || '');
    setFormAvatarUrl(student.avatarUrl);
  };

  // Handle Avatar Image Upload with Canvas 300px Compression
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressingAvatar(true);
      const compressedBase64 = await compressImage(file, 300, 300, 0.85);
      setFormAvatarUrl(compressedBase64);
      sound.playClick();
    } catch (err) {
      console.error('Error compressing avatar image:', err);
      alert('Không thể tải ảnh đại diện, vui lòng chọn file ảnh khác');
    } finally {
      setIsCompressingAvatar(false);
    }
  };

  // Handle Save Form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    // Ensure security code is valid 5 digits
    let finalCode = formSecurityCode.trim();
    if (!finalCode || finalCode.length !== 5 || isNaN(Number(finalCode))) {
      finalCode = generateUnique5DigitCode(students.map(s => s.securityCode));
    }

    if (isCreatingNew) {
      const newStt = students.length > 0 ? Math.max(...students.map((s) => s.stt)) + 1 : 1;
      const newSt: Student = {
        id: `hs-${Date.now()}`,
        stt: newStt,
        name: formName.trim(),
        gender: formGender,
        group: formGroup,
        role: formRole,
        flowerPoints: Number(formPoints) || 0,
        lifetimePoints: Number(formPoints) || 0,
        avatarSeed: formName.trim(),
        securityCode: finalCode,
        personalTarget: formPersonalTarget.trim(),
        talents: formTalents.trim(),
        birthday: formBirthday.trim(),
        parentPhone: formPhone.trim(),
        shields: 0,
        consecutiveOnTimeDays: 0,
        bloomedGardens: [],
        badges: ['🌱 Thành viên mới'],
      };
      if (formAvatarUrl) {
        newSt.avatarUrl = formAvatarUrl;
      }
      onAddStudent(newSt);
      sound.playReward();
      setIsCreatingNew(false);
    } else if (editingStudent) {
      const updated: Student = {
        ...editingStudent,
        name: formName.trim(),
        gender: formGender,
        group: formGroup,
        role: formRole,
        flowerPoints: Number(formPoints) || 0,
        securityCode: finalCode,
        personalTarget: formPersonalTarget.trim(),
        talents: formTalents.trim(),
        birthday: formBirthday.trim(),
        parentPhone: formPhone.trim(),
      };
      if (formAvatarUrl) {
        updated.avatarUrl = formAvatarUrl;
      } else {
        delete updated.avatarUrl;
      }
      onUpdateStudent(updated);
      sound.playClick();
      setEditingStudent(null);
    }
  };

  // Handle Batch Import from Flexible Text / Excel / Zalo
  const handleConfirmBatchImport = (newStudents: Student[], mode: 'append' | 'replace') => {
    let finalizedList: Student[] = [];

    if (mode === 'append') {
      const startStt = students.length > 0 ? Math.max(...students.map((s) => s.stt)) + 1 : 1;
      const renumberedNew = newStudents.map((s, idx) => ({
        ...s,
        stt: startStt + idx,
      }));
      finalizedList = [...students, ...renumberedNew];
    } else {
      finalizedList = newStudents.map((s, idx) => ({
        ...s,
        stt: idx + 1,
      }));
    }

    if (onBatchUpdateStudents) {
      onBatchUpdateStudents(finalizedList);
    } else {
      if (mode === 'replace') {
        students.forEach((s) => onDeleteStudent(s.id));
      }
      newStudents.forEach((s) => onAddStudent(s));
    }

    sound.playReward();
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="student-manager-view-container">
      {/* 1. Header Toolbar */}
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 shadow-md shadow-pink-100/50 border-2 border-[#FCE7F3] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#EC4899] text-white flex items-center justify-center font-black shadow-md shadow-pink-300/40 shrink-0 border-2 border-white">
            <Users className="w-6 h-6 text-yellow-200" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              Quản Lý Hồ Sơ & Mã Tra Cứu Học Sinh 🎒
            </h2>
            <p className="text-xs text-purple-900/70 font-semibold mt-0.5">
              Sĩ số: <strong>{students.length}</strong> học sinh • Mã bảo mật 5 chữ số • Cột mốc vinh danh
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-pink-50/80 rounded-2xl border-2 border-pink-200 shadow-2xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards' ? 'candy-btn-purple text-white shadow-xs' : 'text-purple-900 hover:text-purple-950'
              }`}
              title="Xem dạng thẻ hồ sơ"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Dạng Thẻ</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl text-xs sm:text-sm font-black transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'table' ? 'candy-btn-purple text-white shadow-xs' : 'text-purple-900 hover:text-purple-950'
              }`}
              title="Xem dạng bảng chi tiết"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Dạng Bảng</span>
            </button>
          </div>

          {/* Add Student Button */}
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl candy-btn-purple text-white text-xs sm:text-sm font-black shadow-md shadow-purple-300/40 transition active:scale-95 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Thêm Học Sinh</span>
          </button>

          {/* Batch Import Button */}
          <button
            onClick={() => setShowBatchImportModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl candy-btn-pink text-white text-xs sm:text-sm font-black shadow-md shadow-pink-300/40 transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập Hàng Loạt</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={() => exportClassToExcel(students, config, attendance)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl candy-btn-gold text-purple-950 text-xs sm:text-sm font-black shadow-md shadow-amber-300/40 transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 backdrop-blur-xs p-3.5 rounded-2xl border-2 border-[#FCE7F3] shadow-xs">
        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-pink-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên, STT, mã 5 số, mục tiêu..."
            className="w-full pl-9 pr-8 py-2.5 bg-pink-50/50 border-2 border-pink-100 rounded-xl text-xs sm:text-sm font-bold text-slate-800 placeholder-pink-300 focus:outline-none focus:border-pink-400 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto no-scrollbar">
          <button
            onClick={() => setGroupFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition shrink-0 cursor-pointer ${
              groupFilter === 'all'
                ? 'candy-btn-purple text-white shadow-xs'
                : 'bg-pink-50 text-purple-900 hover:bg-pink-100 border border-pink-200'
            }`}
          >
            Tất cả ({students.length})
          </button>
          {[1, 2, 3, 4].map((g) => {
            const count = students.filter((s) => s.group === g).length;
            return (
              <button
                key={g}
                onClick={() => setGroupFilter(g as 1 | 2 | 3 | 4)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition shrink-0 cursor-pointer ${
                  groupFilter === g
                    ? 'candy-btn-purple text-white shadow-xs'
                    : 'bg-pink-50 text-purple-900 hover:bg-pink-100 border border-pink-200'
                }`}
              >
                Tổ {g} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. DẠNG THẺ HỒ SƠ HỌC SINH (CARDS VIEW) */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((s) => {
            const treeInfo = getTreeEvolutionInfo(s.flowerPoints);
            const nextMilestone = s.flowerPoints < 100 ? 100 : s.flowerPoints < 300 ? 300 : 500;
            const milestoneProgress = Math.min(100, Math.round((s.flowerPoints / nextMilestone) * 100));

            return (
              <div
                key={s.id}
                id={`student-profile-card-${s.id}`}
                className="bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-6 shadow-md shadow-pink-100/50 border-2 border-[#FCE7F3] hover:border-pink-300 hover:shadow-lg transition-all flex flex-col justify-between relative group"
              >
                <div>
                  {/* Top Bar: STT, Group, Role, Actions */}
                  <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b-2 border-pink-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-pink-100 text-pink-700 font-black text-xs sm:text-sm flex items-center justify-center border border-pink-200">
                        #{s.stt}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black border border-purple-200">
                        Tổ {s.group}
                      </span>
                      {s.role !== 'Học sinh' && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-black border border-amber-200">
                          {s.role}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        title="Chỉnh sửa hồ sơ"
                        className="p-1.5 rounded-xl hover:bg-pink-100 text-purple-600 transition cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setStudentToDelete(s);
                        }}
                        title="Xóa học sinh"
                        className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Student Main Info: Avatar + Name + 5-digit security code */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="relative shrink-0">
                      <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-white border-2 border-pink-300 shadow-sm p-0.5">
                        <img
                          src={getStudentAvatarUrl(s)}
                          alt={s.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-lg">
                        {treeInfo.currentStage.icon}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-black text-base sm:text-lg text-slate-800 truncate">
                        {s.name}
                      </h3>
                      
                      {/* 5-digit Security Code Badge */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-purple-800 to-pink-700 text-yellow-300 text-xs font-mono font-black mt-1.5 border border-purple-900 shadow-2xs">
                        <KeyRound className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Mã tra cứu: #{s.securityCode || '00000'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Personal Target & Talents */}
                  <div className="space-y-2 mb-4 bg-pink-50/50 p-3 rounded-2xl border border-pink-100 text-xs sm:text-[13px]">
                    {s.personalTarget && (
                      <div className="flex items-start gap-2">
                        <Target className="w-4 h-4 text-pink-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-semibold line-clamp-2">
                          <strong className="text-purple-950 font-black">Mục tiêu:</strong> {s.personalTarget}
                        </span>
                      </div>
                    )}

                    {s.talents && (
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-semibold line-clamp-2">
                          <strong className="text-purple-950 font-black">Năng khiếu:</strong> {s.talents}
                        </span>
                      </div>
                    )}

                    {s.parentPhone && (
                      <div className="flex items-center gap-2 text-purple-700 text-xs font-semibold">
                        <Phone className="w-3.5 h-3.5 text-pink-500" />
                        <span>Phụ huynh: {s.parentPhone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom: Milestone Star Roadmap (100đ Sơ cấp - 300đ Trung cấp - 500đ Cao cấp) */}
                <div className="pt-3 border-t-2 border-pink-100 space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm font-black">
                    <span className="text-purple-950 flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-300" />
                      Điểm hoa: <strong className="text-pink-600 text-sm sm:text-base">{s.flowerPoints} ⭐</strong>
                    </span>
                    <span className="text-xs text-purple-700 font-bold">
                      Mốc tiếp: {nextMilestone}đ ({milestoneProgress}%)
                    </span>
                  </div>

                  {/* Progress bar with milestone dots */}
                  <div className="relative w-full bg-pink-100/70 rounded-full h-3 overflow-hidden border border-pink-200">
                    <div
                      className="bg-gradient-to-r from-[#A855F7] to-[#EC4899] h-full rounded-full transition-all duration-300 shadow-xs"
                      style={{ width: `${milestoneProgress}%` }}
                    />
                  </div>

                  {/* Milestone Labels */}
                  <div className="flex justify-between text-xs font-black text-purple-400 pt-0.5">
                    <span className={s.flowerPoints >= 100 ? 'text-purple-900 font-black' : ''}>🌱 100đ Sơ cấp</span>
                    <span className={s.flowerPoints >= 300 ? 'text-purple-900 font-black' : ''}>🌿 300đ Trung cấp</span>
                    <span className={s.flowerPoints >= 500 ? 'text-purple-900 font-black' : ''}>👑 500đ Cao cấp</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. DẠNG BẢNG CHI TIẾT (TABLE VIEW) */}
      {viewMode === 'table' && (
        <div className="bg-white/95 backdrop-blur-xs rounded-3xl shadow-md shadow-pink-100/50 border-2 border-[#FCE7F3] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-pink-50/80 border-b-2 border-pink-100 text-purple-950 font-black uppercase text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">STT</th>
                  <th className="py-3.5 px-4">Ảnh & Họ Tên</th>
                  <th className="py-3.5 px-4">Mã Tra Cứu (5 Số)</th>
                  <th className="py-3.5 px-4">Tổ</th>
                  <th className="py-3.5 px-4">Chức Vụ</th>
                  <th className="py-3.5 px-4">Mục Tiêu Cá Nhân</th>
                  <th className="py-3.5 px-4">Năng Khiếu</th>
                  <th className="py-3.5 px-4">Điểm Hoa</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-pink-50 font-medium">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-pink-50/50 transition">
                    <td className="py-3 px-4 font-black text-pink-600">#{s.stt}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={getStudentAvatarUrl(s)}
                          alt={s.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-xl object-cover border-2 border-white shadow-2xs"
                        />
                        <span className="font-black text-slate-900">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-purple-800 to-pink-700 text-yellow-300 font-mono font-black text-[11px] border border-purple-900 shadow-2xs">
                        #{s.securityCode || '00000'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-purple-700">Tổ {s.group}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${
                        s.role !== 'Học sinh' ? 'bg-amber-100 text-amber-900 border-amber-200' : 'bg-pink-50 text-purple-900 border-pink-200'
                      }`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 font-semibold">{s.personalTarget || '—'}</td>
                    <td className="py-3 px-4 max-w-xs truncate text-slate-600 font-semibold">{s.talents || '—'}</td>
                    <td className="py-3 px-4 font-black text-pink-600">{s.flowerPoints} 🌸</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(s)}
                          className="p-1.5 rounded-xl hover:bg-pink-100 text-purple-600 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setStudentToDelete(s);
                          }}
                          className="p-1.5 rounded-xl hover:bg-rose-100 text-rose-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: THÊM MỚI / CHỈNH SỬA HỌC SINH */}
      {(isCreatingNew || editingStudent) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-xs rounded-3xl max-w-xl w-full p-6 shadow-2xl border-2 border-[#FCE7F3] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-pink-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-pink-600" />
                <span>{isCreatingNew ? 'Thêm Học Sinh Mới' : `Chỉnh Sửa: ${editingStudent?.name}`}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingStudent(null);
                }}
                className="p-1.5 rounded-xl hover:bg-pink-100 text-purple-400 hover:text-purple-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Avatar Upload with 300px Canvas Compression */}
              <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-pink-50/50 border-2 border-pink-100">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border-2 border-pink-300 p-0.5 shrink-0 relative shadow-xs">
                  <img
                    src={formAvatarUrl || getStudentAvatarUrl({ avatarUrl: formAvatarUrl, avatarSeed: formName || 'New', name: formName || 'New' })}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  {isCompressingAvatar && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-bold">
                      Nén...
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="font-black text-slate-900 mb-1">Ảnh đại diện thẻ học sinh</div>
                  <p className="text-[11px] text-purple-700/80 mb-2">
                    Tự động dùng HTML5 Canvas nén ảnh về chuẩn 300px Base64
                  </p>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl candy-btn-purple text-white font-black transition flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ máy</span>
                    </button>
                    {formAvatarUrl && (
                      <button
                        type="button"
                        onClick={() => setFormAvatarUrl(undefined)}
                        className="px-2.5 py-1.5 rounded-xl bg-pink-100 hover:bg-pink-200 text-purple-900 font-bold transition border border-pink-200"
                      >
                        Dùng Dicebear SVG
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Họ và tên */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">
                  Họ và tên học sinh *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Hoàng Minh Khang"
                  className="w-full px-3.5 py-2.5 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400 focus:bg-white transition"
                />
              </div>

              {/* Giới tính, Tổ, Điểm hoa */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">Giới tính</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as Gender)}
                    className="w-full px-3 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400"
                  >
                    <option value="nam">Nam</option>
                    <option value="nu">Nữ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">Tổ thi đua</label>
                  <select
                    value={formGroup}
                    onChange={(e) => setFormGroup(Number(e.target.value) as 1 | 2 | 3 | 4)}
                    className="w-full px-3 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">Điểm hoa khởi tạo</label>
                  <input
                    type="number"
                    min={0}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              {/* Mã tra cứu bảo mật 5 chữ số */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mã tra cứu bảo mật (5 chữ số ngẫu nhiên không trùng lặp) *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = generateUnique5DigitCode(students.map(s => s.securityCode));
                      setFormSecurityCode(newCode);
                    }}
                    className="text-[11px] font-black text-pink-600 hover:underline"
                  >
                    Tạo mã mới ngẫu nhiên
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={5}
                  required
                  value={formSecurityCode}
                  onChange={(e) => setFormSecurityCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="5 chữ số, ví dụ 48201"
                  className="w-full px-3.5 py-2.5 bg-purple-950 text-yellow-300 font-mono font-black text-sm tracking-widest rounded-2xl border-2 border-purple-800 focus:outline-none focus:border-pink-400"
                />
              </div>

              {/* Vai trò + Gợi ý nhanh */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1">
                  Vai trò / Chức vụ trong lớp
                </label>
                <input
                  type="text"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as StudentRole)}
                  className="w-full px-3.5 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400 mb-1.5"
                />
                <div className="flex flex-wrap gap-1.5">
                  {ROLE_SUGGESTIONS.slice(0, 7).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setFormRole(r)}
                      className={`px-2 py-0.5 rounded-xl text-[10px] font-black border transition ${
                        formRole === r ? 'candy-btn-purple text-white' : 'bg-pink-50 text-purple-900 border-pink-200 hover:bg-pink-100'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mục tiêu cá nhân + Gợi ý nhanh */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-pink-600" />
                  <span>Mục tiêu cá nhân phấn đấu</span>
                </label>
                <input
                  type="text"
                  value={formPersonalTarget}
                  onChange={(e) => setFormPersonalTarget(e.target.value)}
                  placeholder="Ví dụ: Đạt giải Nhất Vở sạch chữ đẹp"
                  className="w-full px-3.5 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400 mb-1.5"
                />
                <div className="flex flex-wrap gap-1.5">
                  {TARGET_SUGGESTIONS.slice(0, 4).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormPersonalTarget(t)}
                      className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition truncate max-w-[240px]"
                      title={t}
                    >
                      + {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Năng khiếu cá nhân + Gợi ý nhanh */}
              <div>
                <label className="block text-xs font-black text-purple-950 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Năng khiếu cá nhân</span>
                </label>
                <input
                  type="text"
                  value={formTalents}
                  onChange={(e) => setFormTalents(e.target.value)}
                  placeholder="Ví dụ: Toán học, Hội họa, Cờ vua"
                  className="w-full px-3.5 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400 mb-1.5"
                />
                <div className="flex flex-wrap gap-1.5">
                  {TALENT_SUGGESTIONS.slice(0, 6).map((talent) => (
                    <button
                      key={talent}
                      type="button"
                      onClick={() => {
                        const current = formTalents ? formTalents.split(', ').map(x => x.trim()) : [];
                        if (!current.includes(talent)) {
                          setFormTalents([...current, talent].join(', '));
                        }
                      }}
                      className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition"
                    >
                      + {talent}
                    </button>
                  ))}
                </div>
              </div>

              {/* SĐT Phụ huynh & Ngày sinh */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">SĐT Phụ huynh</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-purple-950 mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={formBirthday}
                    onChange={(e) => setFormBirthday(e.target.value)}
                    className="w-full px-3 py-2 bg-pink-50/50 border-2 border-pink-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-pink-400"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-between gap-2 pt-4 border-t-2 border-pink-100">
                {editingStudent ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStudentToDelete(editingStudent);
                    }}
                    className="px-3.5 py-2 rounded-2xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Xóa học sinh này</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setEditingStudent(null);
                    }}
                    className="px-4 py-2.5 rounded-2xl text-purple-900 hover:bg-pink-100 font-black transition cursor-pointer"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl candy-btn-purple text-white font-black shadow-md shadow-purple-300/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isCreatingNew ? 'Thêm Vào Lớp' : 'Lưu Thay Đổi'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. MODAL: NHẬP DANH SÁCH HÀNG LOẠT (FLEXIBLE TEXT, ZALO, EXCEL/CSV & PREVIEW) */}
      <BatchImportModal
        isOpen={showBatchImportModal}
        onClose={() => setShowBatchImportModal(false)}
        existingStudents={students}
        onConfirmImport={handleConfirmBatchImport}
      />

      {/* 7. MODAL: XÁC NHẬN XÓA TỪNG HỌC SINH */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-rose-200 animate-fadeIn space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-black text-slate-900 leading-snug">
                  Bạn có chắc chắn muốn xóa học sinh <span className="text-rose-600 font-black underline decoration-rose-300">{studentToDelete.name}</span> không?
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Hành động này sẽ chỉ xóa học sinh đã chọn. Các học sinh khác và cấu hình lớp học vẫn được bảo toàn nguyên vẹn.
                </p>
              </div>
            </div>

            {/* Thông tin học sinh đang chọn xóa */}
            <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center gap-3 text-xs">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-pink-200 shrink-0">
                <img
                  src={getStudentAvatarUrl(studentToDelete)}
                  alt={studentToDelete.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-black text-slate-800 truncate text-sm">
                  {studentToDelete.name}
                </div>
                <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5 font-medium">
                  <span>STT #{studentToDelete.stt}</span>
                  <span>•</span>
                  <span>Tổ {studentToDelete.group}</span>
                  <span>•</span>
                  <span className="font-bold text-pink-600">{studentToDelete.flowerPoints} ⭐ hoa</span>
                </div>
              </div>
            </div>

            {/* Hộp thoại có 2 nút theo đúng yêu cầu: HỦY và XÓA HỌC SINH */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                className="px-5 py-2.5 rounded-2xl text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-black transition cursor-pointer"
              >
                HỦY
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetId = studentToDelete.id;
                  onDeleteStudent(targetId);
                  setStudentToDelete(null);
                  if (editingStudent && editingStudent.id === targetId) {
                    setEditingStudent(null);
                  }
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white text-xs font-black shadow-md shadow-rose-300/40 transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>XÓA HỌC SINH</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
