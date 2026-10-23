import React, { useState, useMemo } from 'react';
import { 
  Student, 
  ClassConfig, 
  Assignment, 
  AssignmentSubject, 
  AssignmentPriority, 
  AssignmentSubmission,
  SubmissionStatus, 
  PointCategory 
} from '../types';
import { sound } from '../utils/soundEffects';
import { fireSuperConfetti } from '../utils/helpers';
import { getStudentAvatarUrl } from '../utils/imageUtils';
import { getTodayDateString, getFutureDateString } from '../data/initialData';
import { 
  BookOpen, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Send, 
  Copy, 
  Printer, 
  Trash2, 
  Edit3, 
  Search, 
  Filter, 
  Sparkles, 
  Star, 
  Award, 
  Trophy, 
  Users, 
  FileText, 
  ExternalLink, 
  Check, 
  X, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  GraduationCap, 
  Share2, 
  MessageCircle, 
  UserCheck, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';

interface HomeworkManagerViewProps {
  assignments: Assignment[];
  students: Student[];
  config: ClassConfig;
  onAddAssignment: (assignment: Omit<Assignment, 'id' | 'createdAt'>) => void;
  onUpdateAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (assignmentId: string) => void;
  onAwardPoints?: (studentIds: string[], delta: number, reason: string, category: PointCategory) => void;
}

// 🎨 Subject Theme Styling Map
const SUBJECT_CONFIG: Record<AssignmentSubject, { icon: string; bg: string; text: string; border: string; badge: string }> = {
  'Toán': { icon: '📐', bg: 'from-blue-50 to-sky-100', text: 'text-blue-700', border: 'border-blue-300', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  'Tiếng Việt': { icon: '📖', bg: 'from-pink-50 to-rose-100', text: 'text-rose-700', border: 'border-rose-300', badge: 'bg-rose-100 text-rose-800 border-rose-200' },
  'Tiếng Anh': { icon: '🌍', bg: 'from-purple-50 to-indigo-100', text: 'text-purple-700', border: 'border-purple-300', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
  'Khoa học': { icon: '🔬', bg: 'from-emerald-50 to-teal-100', text: 'text-emerald-700', border: 'border-emerald-300', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  'Lịch sử & Địa lí': { icon: '🗺️', bg: 'from-amber-50 to-yellow-100', text: 'text-amber-700', border: 'border-amber-300', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
  'Đạo đức': { icon: '🌸', bg: 'from-fuchsia-50 to-pink-100', text: 'text-fuchsia-700', border: 'border-fuchsia-300', badge: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' },
  'Tin học': { icon: '💻', bg: 'from-cyan-50 to-blue-100', text: 'text-cyan-700', border: 'border-cyan-300', badge: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  'Mĩ thuật': { icon: '🎨', bg: 'from-orange-50 to-amber-100', text: 'text-orange-700', border: 'border-orange-300', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
  'Âm nhạc': { icon: '🎵', bg: 'from-violet-50 to-purple-100', text: 'text-violet-700', border: 'border-violet-300', badge: 'bg-violet-100 text-violet-800 border-violet-200' },
  'Hoạt động trải nghiệm': { icon: '🌟', bg: 'from-teal-50 to-emerald-100', text: 'text-teal-700', border: 'border-teal-300', badge: 'bg-teal-100 text-teal-800 border-teal-200' },
  'Khác': { icon: '📝', bg: 'from-slate-50 to-gray-100', text: 'text-slate-700', border: 'border-slate-300', badge: 'bg-slate-100 text-slate-800 border-slate-200' },
};

// 💡 Quick Homework Templates for Teachers
const HOMEWORK_TEMPLATES = [
  {
    subject: 'Toán' as AssignmentSubject,
    title: '📐 Ôn tập phép tính & Giải toán có lời văn',
    description: '1. Làm bài tập 1, 2, 3 trong Vở bài tập Toán trang 50.\n2. Giải bài toán có lời văn vào vở ô ly, trình bày cẩn thận.\n3. Nhờ phụ huynh kiểm tra và ký xác nhận sau khi làm xong.',
    rewardPoints: 2,
    priority: 'important' as AssignmentPriority,
  },
  {
    subject: 'Tiếng Việt' as AssignmentSubject,
    title: '📖 Luyện viết đoạn văn miêu tả',
    description: '1. Dựa vào dàn ý đã học, viết đoạn văn (7 - 9 câu) miêu tả một loài cây hoặc con vật mà em yêu thích.\n2. Chú ý sử dụng hình ảnh so sánh hoặc nhân hóa.\n3. Soát lỗi chính tả và chữ viết trước khi nộp.',
    rewardPoints: 3,
    priority: 'normal' as AssignmentPriority,
  },
  {
    subject: 'Tiếng Anh' as AssignmentSubject,
    title: '🌍 Luyện đọc từ vựng & Quay video phát âm',
    description: '1. Luyện phát âm 8 từ vựng mới trong Unit vừa học.\n2. Ghi âm hoặc quay video 30 giây đọc 4 câu mẫu giao tiếp gửi lên nhóm lớp.',
    rewardPoints: 2,
    priority: 'review' as AssignmentPriority,
  },
  {
    subject: 'Khoa học' as AssignmentSubject,
    title: '🔬 Vẽ sơ đồ tư duy tóm tắt bài học',
    description: '1. Vẽ sơ đồ tư duy tóm tắt nội dung bài học Khoa học tuần này vào khổ giấy A4.\n2. Tô màu các nhánh phân cấp rõ ràng và sáng tạo.',
    rewardPoints: 3,
    priority: 'advanced' as AssignmentPriority,
  },
];

export const HomeworkManagerView: React.FC<HomeworkManagerViewProps> = ({
  assignments,
  students,
  config,
  onAddAssignment,
  onUpdateAssignment,
  onDeleteAssignment,
  onAwardPoints,
}) => {
  // Navigation / Tabs inside Homework section
  const [activeSubTab, setActiveSubTab] = useState<'list' | 'groups_ranking' | 'student_lookup'>('list');

  // Filter & Search
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'overdue' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [trackingAssignment, setTrackingAssignment] = useState<Assignment | null>(null);
  const [copiedZaloMessage, setCopiedZaloMessage] = useState(false);
  const [printAssignment, setPrintAssignment] = useState<Assignment | null>(null);

  // Student Lookup Portal State
  const [lookupStudentId, setLookupStudentId] = useState<string>(students[0]?.id || '');
  const [lookupSecurityCode, setLookupSecurityCode] = useState<string>('');

  // New / Edit Assignment Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubject, setFormSubject] = useState<AssignmentSubject>('Toán');
  const [formDescription, setFormDescription] = useState('');
  const [formAssignedDate, setFormAssignedDate] = useState(getTodayDateString());
  const [formDueDate, setFormDueDate] = useState(getFutureDateString(1));
  const [formDueTime, setFormDueTime] = useState('20:00');
  const [formTargetType, setFormTargetType] = useState<'all' | 'group' | 'custom'>('all');
  const [formTargetGroup, setFormTargetGroup] = useState<1 | 2 | 3 | 4>(1);
  const [formTargetStudentIds, setFormTargetStudentIds] = useState<string[]>(students.map((s) => s.id));
  const [formRewardPoints, setFormRewardPoints] = useState<number>(2);
  const [formPriority, setFormPriority] = useState<AssignmentPriority>('normal');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // ---------------------------------------------------------------------------
  // COMPUTED METRICS & STATS
  // ---------------------------------------------------------------------------
  const totalAssignments = assignments.length;
  
  const todayStr = getTodayDateString();

  const activeAssignmentsCount = useMemo(() => {
    return assignments.filter((a) => a.dueDate >= todayStr).length;
  }, [assignments, todayStr]);

  const overallSubmissionRate = useMemo(() => {
    if (assignments.length === 0) return 0;
    let totalTargeted = 0;
    let totalSubmitted = 0;

    assignments.forEach((a) => {
      const targetCount = a.targetStudentIds.length;
      totalTargeted += targetCount;
      const submittedCount = (Object.values(a.submissions || {}) as AssignmentSubmission[]).filter(
        (sub) => sub.status === 'submitted' || sub.status === 'graded'
      ).length;
      totalSubmitted += submittedCount;
    });

    if (totalTargeted === 0) return 0;
    return Math.round((totalSubmitted / totalTargeted) * 100);
  }, [assignments]);

  const totalRewardsGiven = useMemo(() => {
    let count = 0;
    assignments.forEach((a) => {
      (Object.values(a.submissions || {}) as AssignmentSubmission[]).forEach((sub) => {
        if (sub.rewardAwarded) {
          count += a.rewardPoints;
        }
      });
    });
    return count;
  }, [assignments]);

  // Filtered Assignments List
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      // 1. Subject filter
      if (selectedSubject !== 'all' && a.subject !== selectedSubject) {
        return false;
      }

      // 2. Status filter
      const isOverdue = a.dueDate < todayStr;
      const allSubmitted = a.targetStudentIds.every((id) => {
        const sub = a.submissions?.[id];
        return sub && (sub.status === 'submitted' || sub.status === 'graded');
      });

      if (selectedStatusFilter === 'active' && isOverdue) return false;
      if (selectedStatusFilter === 'overdue' && (!isOverdue || allSubmitted)) return false;
      if (selectedStatusFilter === 'completed' && !allSubmitted) return false;

      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchDesc = a.description.toLowerCase().includes(q);
        const matchSubject = a.subject.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchSubject) return false;
      }

      return true;
    });
  }, [assignments, selectedSubject, selectedStatusFilter, searchQuery, todayStr]);

  // ---------------------------------------------------------------------------
  // HANDLERS: CREATE / EDIT ASSIGNMENT
  // ---------------------------------------------------------------------------
  const handleOpenCreateModal = () => {
    sound.playClick();
    setEditingAssignment(null);
    setFormTitle('');
    setFormSubject('Toán');
    setFormDescription('');
    setFormAssignedDate(getTodayDateString());
    setFormDueDate(getFutureDateString(1));
    setFormDueTime('20:00');
    setFormTargetType('all');
    setFormTargetGroup(1);
    setFormTargetStudentIds(students.map((s) => s.id));
    setFormRewardPoints(2);
    setFormPriority('normal');
    setFormAttachmentUrl('');
    setFormNotes('');
    setIsCreateModalOpen(true);
  };

  const handleOpenEditModal = (assignment: Assignment) => {
    sound.playClick();
    setEditingAssignment(assignment);
    setFormTitle(assignment.title);
    setFormSubject(assignment.subject);
    setFormDescription(assignment.description);
    setFormAssignedDate(assignment.assignedDate);
    setFormDueDate(assignment.dueDate);
    setFormDueTime(assignment.dueTime || '20:00');
    setFormTargetType(assignment.targetType);
    setFormTargetGroup(assignment.targetGroup || 1);
    setFormTargetStudentIds(assignment.targetStudentIds);
    setFormRewardPoints(assignment.rewardPoints);
    setFormPriority(assignment.priority);
    setFormAttachmentUrl(assignment.attachmentUrl || '');
    setFormNotes(assignment.notes || '');
    setIsCreateModalOpen(true);
  };

  const handleApplyTemplate = (tmpl: typeof HOMEWORK_TEMPLATES[0]) => {
    sound.playClick();
    setFormSubject(tmpl.subject);
    setFormTitle(tmpl.title);
    setFormDescription(tmpl.description);
    setFormRewardPoints(tmpl.rewardPoints);
    setFormPriority(tmpl.priority);
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    let targetIds: string[] = [];
    if (formTargetType === 'all') {
      targetIds = students.map((s) => s.id);
    } else if (formTargetType === 'group') {
      targetIds = students.filter((s) => s.group === formTargetGroup).map((s) => s.id);
    } else {
      targetIds = formTargetStudentIds;
    }

    if (editingAssignment) {
      // Update existing
      const updated: Assignment = {
        ...editingAssignment,
        title: formTitle,
        subject: formSubject,
        description: formDescription,
        assignedDate: formAssignedDate,
        dueDate: formDueDate,
        dueTime: formDueTime,
        targetType: formTargetType,
        targetGroup: formTargetType === 'group' ? formTargetGroup : undefined,
        targetStudentIds: targetIds,
        rewardPoints: formRewardPoints,
        priority: formPriority,
        attachmentUrl: formAttachmentUrl,
        notes: formNotes,
      };
      onUpdateAssignment(updated);
      sound.playReward();
    } else {
      // Create new
      const initialSubs: Record<string, any> = {};
      targetIds.forEach((id) => {
        initialSubs[id] = { studentId: id, status: 'not_submitted' };
      });

      onAddAssignment({
        title: formTitle,
        subject: formSubject,
        description: formDescription,
        assignedDate: formAssignedDate,
        dueDate: formDueDate,
        dueTime: formDueTime,
        targetType: formTargetType,
        targetGroup: formTargetType === 'group' ? formTargetGroup : undefined,
        targetStudentIds: targetIds,
        rewardPoints: formRewardPoints,
        priority: formPriority,
        attachmentUrl: formAttachmentUrl,
        notes: formNotes,
        submissions: initialSubs,
      });
      sound.playReward();
      fireSuperConfetti();
    }

    setIsCreateModalOpen(false);
  };

  // ---------------------------------------------------------------------------
  // HANDLERS: SUBMISSION TRACKING & 1-CLICK GRADING
  // ---------------------------------------------------------------------------
  const handleUpdateStudentSubmission = (
    assignmentId: string,
    studentId: string,
    newStatus: SubmissionStatus,
    score?: string,
    feedback?: string
  ) => {
    sound.playClick();
    const assignment = assignments.find((a) => a.id === assignmentId);
    if (!assignment) return;

    const currentSub = assignment.submissions[studentId] || { studentId, status: 'not_submitted' };
    const updatedSub = {
      ...currentSub,
      status: newStatus,
      submittedAt: newStatus === 'submitted' || newStatus === 'graded' ? (currentSub.submittedAt || Date.now()) : undefined,
      score: score !== undefined ? score : currentSub.score,
      teacherFeedback: feedback !== undefined ? feedback : currentSub.teacherFeedback,
    };

    const updatedAssignment: Assignment = {
      ...assignment,
      submissions: {
        ...assignment.submissions,
        [studentId]: updatedSub,
      },
    };

    onUpdateAssignment(updatedAssignment);
    if (trackingAssignment && trackingAssignment.id === assignmentId) {
      setTrackingAssignment(updatedAssignment);
    }
  };

  // 1-Click: Mark ALL targeted students as Submitted
  const handleMarkAllSubmitted = (assignment: Assignment) => {
    sound.playClick();
    const nextSubs = { ...assignment.submissions };
    assignment.targetStudentIds.forEach((sId) => {
      const current = nextSubs[sId] || { studentId: sId, status: 'not_submitted' };
      nextSubs[sId] = {
        ...current,
        status: 'submitted',
        submittedAt: current.submittedAt || Date.now(),
      };
    });

    const updated: Assignment = { ...assignment, submissions: nextSubs };
    onUpdateAssignment(updated);
    if (trackingAssignment) setTrackingAssignment(updated);
  };

  // 1-Click: Reward Flower points to ALL completed/submitted students
  const handleAwardRewardToAllSubmitted = (assignment: Assignment) => {
    if (!onAwardPoints) return;
    sound.playReward();

    const eligibleStudentIds: string[] = [];
    const nextSubs = { ...assignment.submissions };

    assignment.targetStudentIds.forEach((sId) => {
      const sub = nextSubs[sId];
      if (sub && (sub.status === 'submitted' || sub.status === 'graded') && !sub.rewardAwarded) {
        eligibleStudentIds.push(sId);
        nextSubs[sId] = { ...sub, rewardAwarded: true, status: 'graded' };
      }
    });

    if (eligibleStudentIds.length > 0) {
      onAwardPoints(
        eligibleStudentIds,
        assignment.rewardPoints,
        `Hoàn thành bài tập: ${assignment.title}`,
        'academic'
      );
      fireSuperConfetti();
    }

    const updated: Assignment = { ...assignment, submissions: nextSubs };
    onUpdateAssignment(updated);
    if (trackingAssignment) setTrackingAssignment(updated);
  };

  // Generate and Copy Zalo Broadcast Announcement Message
  const handleCopyZaloMessage = (assignment: Assignment) => {
    sound.playClick();
    const notSubmittedList = assignment.targetStudentIds
      .filter((sId) => {
        const sub = assignment.submissions?.[sId];
        return !sub || sub.status === 'not_submitted';
      })
      .map((sId) => {
        const s = students.find((item) => item.id === sId);
        return s ? `${s.stt}. ${s.name} (${config.groupNames[s.group] || `Tổ ${s.group}`})` : '';
      })
      .filter(Boolean);

    const message = `📢 THÔNG BÁO BÀI TẬP VỀ NHÀ - LỚP ${config.className || '4A2'}
------------------------------------
📌 Môn: ${assignment.subject}
📝 Tiêu đề: ${assignment.title}
⏳ Hạn nộp: ${assignment.dueDate} (Trước ${assignment.dueTime || '20:00'})
🌸 Thưởng thi đua: +${assignment.rewardPoints} Hoa Sao khi hoàn thành tốt!

📖 NỘI DUNG CHI TIẾT:
${assignment.description}

${assignment.attachmentUrl ? `🔗 Link tài liệu/đề bài: ${assignment.attachmentUrl}\n` : ''}${assignment.notes ? `💡 Lời dặn của cô: ${assignment.notes}\n` : ''}
${notSubmittedList.length > 0 ? `⚠️ Danh sách các bạn chưa nộp bài (${notSubmittedList.length} em):\n${notSubmittedList.join('\n')}\n\n👉 Kính nhờ quý phụ huynh nhắc nhở các con hoàn thành đúng hạn ạ. Cô cảm ơn quý phụ huynh và các con! ❤️` : '🎉 Rất khen ngợi cả lớp đã hoàn thành nộp bài đầy đủ! ❤️'}`;

    navigator.clipboard.writeText(message).then(() => {
      setCopiedZaloMessage(true);
      setTimeout(() => setCopiedZaloMessage(false), 3000);
    });
  };

  return (
    <div id="homework-manager-view" className="space-y-6">
      {/* ===================================================================== */}
      {/* 1. TOP HEADER & METRICS BANNER                                        */}
      {/* ===================================================================== */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-2 border-pink-200 shadow-xl shadow-pink-100/50 space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3B82F6] via-[#8B5CF6] to-[#EC4899] text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-purple-300/40 border-2 border-white">
              📚
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Giao Bài Tập & Theo Dõi Học Tập
                </h2>
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[11px] font-black shadow-xs">
                  {config.className || 'Lớp 4A2'} ✨
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Soạn bài tập tiện lợi • Điểm danh nộp bài • Tự động thưởng hoa thi đua • Mẫu tin nhắn Zalo gửi phụ huynh
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto">
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="candy-btn-purple text-white px-5 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 shadow-lg cursor-pointer transition active:scale-95 flex-1 sm:flex-initial justify-center"
            >
              <Plus className="w-4 h-4" />
              <span>GIAO BÀI TẬP MỚI</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveSubTab(activeSubTab === 'student_lookup' ? 'list' : 'student_lookup');
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95 border-2 shadow-xs ${
                activeSubTab === 'student_lookup'
                  ? 'bg-pink-100 text-pink-800 border-pink-400'
                  : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50'
              }`}
            >
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span>Cổng Tra Cứu HS</span>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setActiveSubTab(activeSubTab === 'groups_ranking' ? 'list' : 'groups_ranking');
              }}
              className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition active:scale-95 border-2 shadow-xs ${
                activeSubTab === 'groups_ranking'
                  ? 'bg-amber-100 text-amber-900 border-amber-400'
                  : 'bg-white text-slate-700 border-pink-200 hover:bg-amber-50'
              }`}
            >
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Thi Đua 4 Tổ</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/60 border-2 border-blue-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center text-lg font-black shadow-xs">
              📝
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đã Giao</div>
              <div className="text-xl font-black text-blue-700">{totalAssignments} <span className="text-xs text-slate-500 font-bold">bài</span></div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50/60 border-2 border-purple-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center text-lg font-black shadow-xs">
              ⏳
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Đang Mở</div>
              <div className="text-xl font-black text-purple-700">{activeAssignmentsCount} <span className="text-xs text-slate-500 font-bold">bài</span></div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/60 border-2 border-emerald-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-lg font-black shadow-xs">
              📈
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tỉ Lệ Nộp</div>
              <div className="text-xl font-black text-emerald-700">{overallSubmissionRate}%</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border-2 border-amber-200/80 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center text-lg font-black shadow-xs">
              🌸
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hoa Đã Thưởng</div>
              <div className="text-xl font-black text-amber-700">+{totalRewardsGiven} <span className="text-xs text-slate-500 font-bold">sao</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SUB-TAB 1: CỔNG TRA CỨU HỌC SINH & PHỤ HUYNH                        */}
      {/* ===================================================================== */}
      {activeSubTab === 'student_lookup' && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-2 border-purple-200 shadow-xl shadow-purple-100/40 space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-purple-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <h3 className="font-black text-lg text-slate-800">
                  Cổng Tra Cứu Bài Tập Dành Cho Học Sinh & Phụ Huynh
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Chọn tên học sinh hoặc nhập mã bảo mật 5 số để kiểm tra bài tập được giao, trạng thái nộp bài và nhận xét của cô giáo.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setActiveSubTab('list')}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-black self-start sm:self-auto cursor-pointer"
            >
              ← Về danh sách bài tập
            </button>
          </div>

          {/* Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">Chọn học sinh:</label>
              <select
                value={lookupStudentId}
                onChange={(e) => setLookupStudentId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm font-bold bg-white"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.stt}. {s.name} ({config.groupNames[s.group] || `Tổ ${s.group}`})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700">Hoặc nhập Mã bảo mật 5 số:</label>
              <input
                type="text"
                maxLength={5}
                placeholder="Ví dụ: 48201"
                value={lookupSecurityCode}
                onChange={(e) => {
                  const val = e.target.value;
                  setLookupSecurityCode(val);
                  const matched = students.find((s) => s.securityCode === val);
                  if (matched) setLookupStudentId(matched.id);
                }}
                className="w-full px-4 py-2.5 rounded-2xl border-2 border-purple-200 focus:border-purple-500 outline-none text-sm font-bold bg-white"
              />
            </div>
          </div>

          {/* Student Homework Details Card */}
          {(() => {
            const currentStudent = students.find((s) => s.id === lookupStudentId);
            if (!currentStudent) return null;

            const studentAssignments = assignments.filter((a) => a.targetStudentIds.includes(currentStudent.id));
            const completedCount = studentAssignments.filter((a) => {
              const sub = a.submissions?.[currentStudent.id];
              return sub && (sub.status === 'submitted' || sub.status === 'graded');
            }).length;

            return (
              <div className="bg-gradient-to-br from-purple-50/60 to-pink-50/60 rounded-3xl p-5 border-2 border-purple-200 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-purple-200">
                  <div className="flex items-center gap-3">
                    <img
                      src={getStudentAvatarUrl(currentStudent)}
                      alt={currentStudent.name}
                      className="w-12 h-12 rounded-2xl border-2 border-white shadow-md object-cover"
                    />
                    <div>
                      <h4 className="font-black text-base text-slate-800">
                        {currentStudent.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <span>STT: #{currentStudent.stt}</span>
                        <span>•</span>
                        <span>{config.groupNames[currentStudent.group] || `Tổ ${currentStudent.group}`}</span>
                        <span>•</span>
                        <span className="text-pink-600 font-black">🌸 {currentStudent.flowerPoints} hoa sao</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200">
                      Đã hoàn thành {completedCount} / {studentAssignments.length} bài
                    </span>
                  </div>
                </div>

                {/* List of assignments for this student */}
                <div className="space-y-3">
                  {studentAssignments.map((a) => {
                    const sub = a.submissions?.[currentStudent.id] || { status: 'not_submitted' };
                    const isSubmitted = sub.status === 'submitted' || sub.status === 'graded';
                    const subj = SUBJECT_CONFIG[a.subject] || SUBJECT_CONFIG['Khác'];

                    return (
                      <div
                        key={a.id}
                        className="bg-white rounded-2xl p-4 border-2 border-purple-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${subj.badge}`}>
                              {subj.icon} {a.subject}
                            </span>
                            <span className="text-xs font-black text-slate-800">{a.title}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2">{a.description}</p>
                          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-400 pt-0.5">
                            <span>⏳ Hạn nộp: {a.dueDate} ({a.dueTime || '20:00'})</span>
                            <span>•</span>
                            <span className="text-amber-600 font-black">+{a.rewardPoints} 🌸 khi nộp</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-1.5 shrink-0">
                          {sub.status === 'graded' && (
                            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>{sub.score ? `Điểm ${sub.score}` : 'Đã chấm (Đạt)'}</span>
                            </span>
                          )}
                          {sub.status === 'submitted' && (
                            <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-800 text-xs font-black border border-blue-300 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" />
                              <span>Đã nộp bài</span>
                            </span>
                          )}
                          {sub.status === 'needs_revision' && (
                            <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-800 text-xs font-black border border-amber-300 flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Cần làm lại</span>
                            </span>
                          )}
                          {sub.status === 'not_submitted' && (
                            <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 text-xs font-black border border-rose-300 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Chưa nộp</span>
                            </span>
                          )}

                          {sub.teacherFeedback && (
                            <span className="text-[11px] font-bold text-purple-700 italic max-w-xs text-right">
                              💬 "{sub.teacherFeedback}"
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ===================================================================== */}
      {/* 3. SUB-TAB 2: THI ĐUA NỘP BÀI CỦA 4 TỔ                                */}
      {/* ===================================================================== */}
      {activeSubTab === 'groups_ranking' && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-200 shadow-xl shadow-amber-100/40 space-y-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b-2 border-amber-100 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🏆</span>
              <div>
                <h3 className="font-black text-lg text-slate-800">
                  Bảng Xếp Hạng Thi Đua Nộp Bài Tập – 4 Tổ
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Thúc đẩy tinh thần học tập tự giác và hỗ trợ lẫn nhau giữa các thành viên trong tổ.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveSubTab('list')}
              className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-black cursor-pointer"
            >
              ← Về danh sách bài tập
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((groupNum) => {
              const groupStudents = students.filter((s) => s.group === groupNum);
              let totalTargetedInGroup = 0;
              let totalSubmittedInGroup = 0;

              assignments.forEach((a) => {
                groupStudents.forEach((s) => {
                  if (a.targetStudentIds.includes(s.id)) {
                    totalTargetedInGroup++;
                    const sub = a.submissions?.[s.id];
                    if (sub && (sub.status === 'submitted' || sub.status === 'graded')) {
                      totalSubmittedInGroup++;
                    }
                  }
                });
              });

              const rate = totalTargetedInGroup > 0 ? Math.round((totalSubmittedInGroup / totalTargetedInGroup) * 100) : 100;

              return (
                <div
                  key={groupNum}
                  className="bg-gradient-to-b from-white to-pink-50/40 rounded-3xl p-5 border-3 border-amber-200 shadow-md space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                      #{groupNum}
                    </div>
                    <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                      {rate}% Hoàn Thành
                    </span>
                  </div>

                  <div>
                    <h4 className="font-black text-sm text-slate-800">
                      {config.groupNames[groupNum as 1 | 2 | 3 | 4] || `Tổ ${groupNum}`}
                    </h4>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      {groupStudents.length} thành viên • {totalSubmittedInGroup}/{totalTargetedInGroup} lượt nộp
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4. MAIN ASSIGNMENT LIST & FILTER CONTROLS                             */}
      {/* ===================================================================== */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-pink-200 shadow-lg shadow-pink-100/40 space-y-4">
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-pink-100">
          {/* Subject Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedSubject('all');
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer whitespace-nowrap ${
                selectedSubject === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-pink-50 text-slate-600 hover:bg-pink-100 border border-pink-200'
              }`}
            >
              Tất Cả Môn ({assignments.length})
            </button>

            {['Toán', 'Tiếng Việt', 'Tiếng Anh', 'Khoa học', 'Lịch sử & Địa lí'].map((subj) => (
              <button
                key={subj}
                type="button"
                onClick={() => {
                  sound.playClick();
                  setSelectedSubject(subj);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer whitespace-nowrap ${
                  selectedSubject === subj
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-pink-50 text-slate-600 hover:bg-pink-100 border border-pink-200'
                }`}
              >
                {SUBJECT_CONFIG[subj as AssignmentSubject]?.icon} {subj}
              </button>
            ))}
          </div>

          {/* Search Input & Status Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-pink-200 text-xs font-bold focus:border-purple-500 outline-none bg-pink-50/40"
              />
            </div>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-pink-200 text-xs font-bold bg-white text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang mở (chưa hết hạn)</option>
              <option value="overdue">Đã quá hạn</option>
              <option value="completed">Đã nộp đủ 100%</option>
            </select>
          </div>
        </div>

        {/* Assignments Cards Grid */}
        {filteredAssignments.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="text-5xl">📖</div>
            <h4 className="font-black text-slate-700 text-base">Chưa có bài tập nào</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
              Bấm nút "GIAO BÀI TẬP MỚI" ở trên để soạn bài tập đầu tiên cho học sinh của mình nhé!
            </p>
            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="candy-btn-purple text-white px-6 py-2.5 rounded-2xl font-black text-xs inline-flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Giao bài tập ngay</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAssignments.map((assignment) => {
              const subj = SUBJECT_CONFIG[assignment.subject] || SUBJECT_CONFIG['Khác'];
              const isOverdue = assignment.dueDate < todayStr;
              const targetCount = assignment.targetStudentIds.length;
              
              const submittedCount = (Object.values(assignment.submissions || {}) as AssignmentSubmission[]).filter(
                (sub) => sub.status === 'submitted' || sub.status === 'graded'
              ).length;
              const gradedCount = (Object.values(assignment.submissions || {}) as AssignmentSubmission[]).filter(
                (sub) => sub.status === 'graded'
              ).length;

              const percent = targetCount > 0 ? Math.round((submittedCount / targetCount) * 100) : 0;

              return (
                <div
                  key={assignment.id}
                  className={`bg-white rounded-3xl p-5 border-2 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4 ${
                    isOverdue ? 'border-amber-200' : 'border-pink-200'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-black px-3 py-1 rounded-full border ${subj.badge}`}>
                          {subj.icon} {assignment.subject}
                        </span>

                        {assignment.priority === 'important' && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                            ⭐ Quan trọng
                          </span>
                        )}
                        {assignment.priority === 'advanced' && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                            🚀 Nâng cao
                          </span>
                        )}
                        {assignment.priority === 'review' && (
                          <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            🔄 Ôn tập
                          </span>
                        )}

                        <span className="text-[11px] font-black text-pink-700 bg-pink-50 px-2.5 py-0.5 rounded-full border border-pink-200">
                          +{assignment.rewardPoints} 🌸 Hoa
                        </span>
                      </div>

                      {/* Dropdown / Action buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(assignment)}
                          title="Chỉnh sửa bài tập"
                          className="p-1.5 text-slate-400 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc chắn muốn xóa bài tập "${assignment.title}"?`)) {
                              sound.playClick();
                              onDeleteAssignment(assignment.id);
                            }
                          }}
                          title="Xóa bài tập"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-black text-slate-800 text-base leading-snug">
                        {assignment.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed whitespace-pre-line font-medium line-clamp-3">
                        {assignment.description}
                      </p>
                    </div>

                    {/* Meta info pills */}
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 flex-wrap pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span>Hạn nộp: <strong>{assignment.dueDate}</strong> ({assignment.dueTime || '20:00'})</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>Giao: {assignment.targetType === 'all' ? 'Cả lớp' : assignment.targetType === 'group' ? `Tổ ${assignment.targetGroup}` : `${targetCount} em`}</span>
                      </span>
                    </div>

                    {/* Submission Progress Bar */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-black">
                        <span className="text-slate-700">
                          Tiến độ nộp bài: <strong>{submittedCount}</strong> / {targetCount} em ({percent}%)
                        </span>
                        <span className="text-emerald-700 text-[11px]">
                          {gradedCount} em đã chấm
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-pink-100 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setTrackingAssignment(assignment);
                      }}
                      className="candy-btn-purple text-white px-4 py-2 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 flex-1 shadow-sm cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Chấm bài ({submittedCount}/{targetCount})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyZaloMessage(assignment)}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                      title="Tạo tin nhắn Zalo gửi phụ huynh"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>{copiedZaloMessage ? 'Đã sao chép!' : 'Gửi Zalo'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setPrintAssignment(assignment);
                      }}
                      className="px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 rounded-xl font-black text-xs flex items-center gap-1.5 cursor-pointer transition shadow-xs"
                      title="In phiếu bài tập phát cho học sinh"
                    >
                      <Printer className="w-3.5 h-3.5 text-pink-600" />
                      <span>In phiếu</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* 5. MODAL: GIAO BÀI TẬP MỚI / CHỈNH SỬA                                */}
      {/* ===================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-3 border-pink-300 shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-black text-lg">
                    {editingAssignment ? 'Chỉnh Sửa Bài Tập' : 'Giao Bài Tập Mới Cho Học Sinh'}
                  </h3>
                  <p className="text-xs text-purple-100 font-bold">
                    {config.className || 'Lớp 4A2'} • Giao bài tập nhanh chóng & phân phối thông minh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveAssignment} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Quick Templates Picker */}
              {!editingAssignment && (
                <div className="space-y-1.5 pb-2 border-b border-pink-100">
                  <span className="text-xs font-black text-purple-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                    <span>Mẫu bài tập soạn sẵn (1-chạm điền nhanh):</span>
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {HOMEWORK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyTemplate(tmpl)}
                        className="p-2 bg-pink-50 hover:bg-purple-100 text-left rounded-xl border border-pink-200 transition text-[11px] font-bold text-slate-700 cursor-pointer"
                      >
                        <div className="font-black text-purple-900">{tmpl.subject}</div>
                        <div className="truncate text-slate-500">{tmpl.title}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subject Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Môn học:</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {(Object.keys(SUBJECT_CONFIG) as AssignmentSubject[]).map((subj) => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setFormSubject(subj)}
                      className={`p-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition cursor-pointer border ${
                        formSubject === subj
                          ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                          : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50'
                      }`}
                    >
                      <span>{SUBJECT_CONFIG[subj].icon}</span>
                      <span className="truncate">{subj}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Tiêu đề bài tập *:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: 📐 Toán: Phiếu ôn tập phép nhân và chia số có nhiều chữ số"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-200 focus:border-purple-500 outline-none text-sm font-bold bg-white"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Nội dung chi tiết & hướng dẫn làm bài *:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="1. Làm bài tập 1, 2, 3 trong Vở bài tập trang 45&#10;2. Trình bày cẩn thận vào vở ô ly&#10;3. Nhờ phụ huynh kiểm tra và ký xác nhận..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl border-2 border-pink-200 focus:border-purple-500 outline-none text-xs font-medium leading-relaxed bg-white"
                />
              </div>

              {/* Due Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Ngày hạn nộp:</label>
                  <input
                    type="date"
                    required
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-purple-500 outline-none text-xs font-bold bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Giờ hạn nộp:</label>
                  <input
                    type="time"
                    value={formDueTime}
                    onChange={(e) => setFormDueTime(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-purple-500 outline-none text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* Target Type & Reward Points */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Giao cho:</label>
                  <select
                    value={formTargetType}
                    onChange={(e) => setFormTargetType(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-purple-500 outline-none text-xs font-bold bg-white"
                  >
                    <option value="all">Cả lớp ({students.length} em)</option>
                    <option value="group">Theo Tổ (1, 2, 3, 4)</option>
                    <option value="custom">Chọn nhóm học sinh tùy chọn</option>
                  </select>

                  {formTargetType === 'group' && (
                    <div className="flex items-center gap-1.5 pt-1.5">
                      {[1, 2, 3, 4].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setFormTargetGroup(g as any)}
                          className={`px-3 py-1 rounded-xl text-xs font-black cursor-pointer border ${
                            formTargetGroup === g
                              ? 'bg-purple-600 text-white border-purple-700 shadow-xs'
                              : 'bg-pink-50 text-purple-900 border-pink-200'
                          }`}
                        >
                          {config.groupNames[g as 1 | 2 | 3 | 4] || `Tổ ${g}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Thưởng hoa khi hoàn thành:</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 5].map((pts) => (
                      <button
                        key={pts}
                        type="button"
                        onClick={() => setFormRewardPoints(pts)}
                        className={`flex-1 py-2 rounded-xl text-xs font-black cursor-pointer border transition ${
                          formRewardPoints === pts
                            ? 'candy-btn-gold text-purple-950 shadow-md scale-105'
                            : 'bg-white text-slate-700 border-pink-200 hover:bg-pink-50'
                        }`}
                      >
                        +{pts} 🌸
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Priority & Attachment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Mức độ ưu tiên:</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-purple-500 outline-none text-xs font-bold bg-white"
                  >
                    <option value="normal">Bình thường</option>
                    <option value="important">⭐ Quan trọng</option>
                    <option value="advanced">🚀 Nâng cao (học sinh khá giỏi)</option>
                    <option value="review">🔄 Ôn tập củng cố</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">Link tài liệu / Đề bài đính kèm (nếu có):</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formAttachmentUrl}
                    onChange={(e) => setFormAttachmentUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-purple-500 outline-none text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* Lời dặn dò phụ huynh */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-slate-700">Lời dặn dò của giáo viên (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nhắc phụ huynh ký xác nhận sau khi các con làm xong..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border-2 border-pink-200 focus:border-purple-500 outline-none text-xs font-medium bg-white"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-pink-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Hủy bỏ
                </button>

                <button
                  type="submit"
                  className="candy-btn-purple text-white px-7 py-2.5 rounded-2xl font-black text-xs shadow-lg cursor-pointer transition active:scale-95 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingAssignment ? 'LƯU THAY ĐỔI' : 'GIAO BÀI TẬP NGAY'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL: BẢNG CHẤM BÀI & THEO DÕI HỌC SINH                            */}
      {/* ===================================================================== */}
      {trackingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-4xl w-full border-3 border-pink-300 shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 text-white p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl">📝</span>
                <div>
                  <h3 className="font-black text-base sm:text-lg">
                    Chấm Bài & Điểm Danh Nộp: {trackingAssignment.title}
                  </h3>
                  <div className="flex items-center gap-2.5 text-xs text-purple-100 font-bold mt-0.5 flex-wrap">
                    <span>Môn: {trackingAssignment.subject}</span>
                    <span>•</span>
                    <span>Hạn nộp: {trackingAssignment.dueDate} ({trackingAssignment.dueTime || '20:00'})</span>
                    <span>•</span>
                    <span className="bg-white/20 px-2.5 py-0.5 rounded-full">Thưởng +{trackingAssignment.rewardPoints} 🌸</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTrackingAssignment(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/20 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Bulk Action Buttons Bar */}
            <div className="bg-pink-50/80 p-3.5 border-b border-pink-200 flex items-center justify-between gap-3 flex-wrap shrink-0">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleMarkAllSubmitted(trackingAssignment)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Đánh dấu tất cả đã nộp</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAwardRewardToAllSubmitted(trackingAssignment)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-purple-950 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-900" />
                  <span>Thưởng hoa cho tất cả bạn đã nộp (+{trackingAssignment.rewardPoints} 🌸)</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => handleCopyZaloMessage(trackingAssignment)}
                className="px-3 py-1.5 bg-white hover:bg-pink-100 text-purple-900 border border-purple-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Sao chép danh sách nhắc Zalo</span>
              </button>
            </div>

            {/* Student Table */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {trackingAssignment.targetStudentIds.map((studentId) => {
                  const student = students.find((s) => s.id === studentId);
                  if (!student) return null;

                  const sub = trackingAssignment.submissions?.[studentId] || { studentId, status: 'not_submitted' };

                  return (
                    <div
                      key={student.id}
                      className={`p-3 rounded-2xl border-2 transition flex items-center justify-between gap-3 ${
                        sub.status === 'graded'
                          ? 'bg-emerald-50/70 border-emerald-300'
                          : sub.status === 'submitted'
                          ? 'bg-blue-50/70 border-blue-300'
                          : sub.status === 'needs_revision'
                          ? 'bg-amber-50/70 border-amber-300'
                          : 'bg-white border-pink-100'
                      }`}
                    >
                      {/* Student Info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={getStudentAvatarUrl(student)}
                          alt={student.name}
                          className="w-10 h-10 rounded-xl border border-white shadow-xs object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-black text-xs text-slate-800 truncate">
                            {student.stt}. {student.name}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400">
                            {config.groupNames[student.group] || `Tổ ${student.group}`}
                          </div>
                        </div>
                      </div>

                      {/* Status Toggle Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* 1. Chưa nộp */}
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentSubmission(trackingAssignment.id, student.id, 'not_submitted')}
                          title="Chưa nộp bài"
                          className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer border ${
                            sub.status === 'not_submitted'
                              ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-rose-50'
                          }`}
                        >
                          Chưa nộp
                        </button>

                        {/* 2. Đã nộp */}
                        <button
                          type="button"
                          onClick={() => handleUpdateStudentSubmission(trackingAssignment.id, student.id, 'submitted')}
                          title="Đã nộp bài"
                          className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer border ${
                            sub.status === 'submitted'
                              ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-blue-50'
                          }`}
                        >
                          Đã nộp
                        </button>

                        {/* 3. Đã chấm / Đạt */}
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateStudentSubmission(trackingAssignment.id, student.id, 'graded', '10');
                            if (!sub.rewardAwarded && onAwardPoints) {
                              onAwardPoints([student.id], trackingAssignment.rewardPoints, `Hoàn thành bài tập: ${trackingAssignment.title}`, 'academic');
                              // Mark rewardAwarded
                              const updatedSub = {
                                ...sub,
                                status: 'graded' as SubmissionStatus,
                                rewardAwarded: true,
                                score: '10',
                              };
                              const nextAssign: Assignment = {
                                ...trackingAssignment,
                                submissions: { ...trackingAssignment.submissions, [student.id]: updatedSub },
                              };
                              onUpdateAssignment(nextAssign);
                              setTrackingAssignment(nextAssign);
                            }
                          }}
                          title="Chấm đạt & Tặng hoa thưởng"
                          className={`px-2 py-1 rounded-lg text-[10px] font-black cursor-pointer border flex items-center gap-1 ${
                            sub.status === 'graded'
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                              : 'bg-white text-slate-500 border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          <Check className="w-3 h-3" />
                          <span>Đạt 🌸</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-pink-100 flex items-center justify-between shrink-0">
              <span className="text-xs font-bold text-slate-500">
                Lớp {config.className || '4A2'} • Ghi nhận kết quả trực tiếp vào hệ sinh thái thi đua
              </span>
              <button
                type="button"
                onClick={() => setTrackingAssignment(null)}
                className="candy-btn-purple text-white px-6 py-2 rounded-xl text-xs font-black shadow-md cursor-pointer"
              >
                Đóng Bảng Chấm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. MODAL: IN PHIẾU BÀI TẬP (Print Preview Modal)                      */}
      {/* ===================================================================== */}
      {printAssignment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border-4 border-purple-200 shadow-2xl p-6 sm:p-8 space-y-6 text-slate-800">
            {/* Header School info */}
            <div className="border-b-2 border-slate-300 pb-4 text-center space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {config.schoolName || 'Trường Tiểu Học Vườn Ươm Tri Thức'}
              </div>
              <h2 className="text-xl font-black text-purple-950">
                PHIẾU BÀI TẬP VỀ NHÀ – {printAssignment.subject.toUpperCase()}
              </h2>
              <div className="text-xs font-bold text-slate-600">
                Lớp: {config.className || '4A2'} • Giáo viên: {config.teacherName || 'Cô Bùi Thị Cúc'} • Năm học: {config.schoolYear || '2024 - 2025'}
              </div>
            </div>

            {/* Student info lines */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold border-b border-slate-200 pb-3">
              <div>Họ và tên học sinh: ................................................................</div>
              <div>Tổ: .................... STT: ....................</div>
            </div>

            {/* Assignment Content */}
            <div className="space-y-3">
              <div className="font-black text-sm text-purple-900 flex items-center gap-2">
                <span>📌</span>
                <span>{printAssignment.title}</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs leading-relaxed whitespace-pre-line font-medium">
                {printAssignment.description}
              </div>

              {printAssignment.notes && (
                <div className="text-xs italic text-slate-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
                  💡 <strong>Lời dặn của cô:</strong> {printAssignment.notes}
                </div>
              )}
            </div>

            {/* Sign & Deadline */}
            <div className="grid grid-cols-2 gap-4 text-xs font-bold pt-4 border-t border-slate-200">
              <div className="text-center space-y-8">
                <div>Ý KIẾN PHỤ HUYNH</div>
                <div className="text-slate-400 italic font-normal">(Ký và ghi rõ họ tên)</div>
              </div>
              <div className="text-center space-y-8">
                <div>HẠN NỘP: {printAssignment.dueDate} ({printAssignment.dueTime || '20:00'})</div>
                <div className="text-purple-700">Thưởng +{printAssignment.rewardPoints} 🌸 khi hoàn thành tốt!</div>
              </div>
            </div>

            {/* Print Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 print:hidden">
              <button
                type="button"
                onClick={() => setPrintAssignment(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Đóng lại
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="candy-btn-purple text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-md cursor-pointer flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>IN PHIẾU NGAY</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
