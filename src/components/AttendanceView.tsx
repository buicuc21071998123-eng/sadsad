import React, { useState, useMemo } from 'react';
import { Student, DailyAttendance, AttendanceStatus, ClassConfig } from '../types';
import { getAvatarColor, getStudentInitials, getGroupName } from '../utils/helpers';
import { sound } from '../utils/soundEffects';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  XCircle, 
  Copy, 
  Check, 
  Calendar, 
  Users, 
  Edit3, 
  RotateCcw,
  Sparkles,
  Grid3X3,
  ListFilter,
  History,
  ShieldCheck,
  ChevronRight,
  TrendingUp
} from 'lucide-react';

interface AttendanceViewProps {
  students: Student[];
  currentAttendance: DailyAttendance;
  attendanceHistory?: DailyAttendance[];
  config: ClassConfig;
  onUpdateAttendance: (updatedAttendance: DailyAttendance) => void;
  onSaveDailyAttendance?: (attendanceToSave: DailyAttendance) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  currentAttendance,
  attendanceHistory = [],
  config,
  onUpdateAttendance,
  onSaveDailyAttendance,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'matrix'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(currentAttendance.date);
  const [editingNoteStudent, setEditingNoteStudent] = useState<Student | null>(null);
  const [noteText, setNoteText] = useState('');
  const [copiedZalo, setCopiedZalo] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | 'all'>('all');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');

  const records = currentAttendance.records || {};

  // Combine attendanceHistory with current attendance if not yet present
  const allHistoryRecords = useMemo(() => {
    const list = [...attendanceHistory];
    const exists = list.some((item) => item.date === currentAttendance.date);
    if (!exists) {
      list.push(currentAttendance);
    } else {
      // Replace with latest currentAttendance for the matching date
      const idx = list.findIndex((item) => item.date === currentAttendance.date);
      list[idx] = currentAttendance;
    }
    // Sort chronological ascending
    return list.sort((a, b) => a.date.localeCompare(b.date));
  }, [attendanceHistory, currentAttendance]);

  // Compute student violation history badges (Lịch sử vi phạm)
  const studentViolationMap = useMemo(() => {
    const map: Record<string, { lateDates: string[]; excusedDates: string[]; unexcusedDates: string[] }> = {};
    students.forEach((s) => {
      map[s.id] = { lateDates: [], excusedDates: [], unexcusedDates: [] };
    });

    allHistoryRecords.forEach((entry) => {
      const d = entry.date;
      const recs = entry.records || {};
      Object.entries(recs).forEach(([sid, r]) => {
        const recItem = r as { status?: AttendanceStatus; note?: string };
        if (!map[sid]) {
          map[sid] = { lateDates: [], excusedDates: [], unexcusedDates: [] };
        }
        if (recItem && recItem.status === 'late') {
          if (!map[sid].lateDates.includes(d)) map[sid].lateDates.push(d);
        } else if (recItem && recItem.status === 'excused') {
          if (!map[sid].excusedDates.includes(d)) map[sid].excusedDates.push(d);
        } else if (recItem && recItem.status === 'unexcused') {
          if (!map[sid].unexcusedDates.includes(d)) map[sid].unexcusedDates.push(d);
        }
      });
    });

    return map;
  }, [students, allHistoryRecords]);

  // Count statistics
  const total = students.length;
  const presentCount = students.filter((s) => records[s.id]?.status === 'present').length;
  const lateCount = students.filter((s) => records[s.id]?.status === 'late').length;
  const excusedCount = students.filter((s) => records[s.id]?.status === 'excused').length;
  const unexcusedCount = students.filter((s) => records[s.id]?.status === 'unexcused').length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  // Change single status
  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    sound.playClick();
    const updated = {
      ...currentAttendance,
      records: {
        ...records,
        [studentId]: {
          ...records[studentId],
          status,
        },
      },
    };
    onUpdateAttendance(updated);
    if (onSaveDailyAttendance) {
      onSaveDailyAttendance(updated);
    }
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    sound.playReward();
    const newRecords: Record<string, { status: AttendanceStatus; note?: string }> = {};
    students.forEach((s) => {
      newRecords[s.id] = {
        status: 'present',
        note: records[s.id]?.note,
      };
    });
    const updated = {
      ...currentAttendance,
      records: newRecords,
    };
    onUpdateAttendance(updated);
    if (onSaveDailyAttendance) {
      onSaveDailyAttendance(updated);
    }
  };

  // Save note
  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteStudent) return;
    const currentStatus = records[editingNoteStudent.id]?.status || 'present';
    const updated = {
      ...currentAttendance,
      records: {
        ...records,
        [editingNoteStudent.id]: {
          status: currentStatus,
          note: noteText.trim() || undefined,
        },
      },
    };
    onUpdateAttendance(updated);
    if (onSaveDailyAttendance) {
      onSaveDailyAttendance(updated);
    }
    setEditingNoteStudent(null);
    setNoteText('');
  };

  // Generate Zalo copy message
  const handleCopyZaloReport = () => {
    const todayFormatted = new Date(selectedDate).toLocaleDateString('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });

    const absentStudents = students.filter(
      (s) => records[s.id]?.status === 'excused' || records[s.id]?.status === 'unexcused'
    );
    const lateStudents = students.filter((s) => records[s.id]?.status === 'late');

    let reportText = `📢 [BÁO CÁO ĐIỂM DANH CHUYÊN CẦN - ${config.className.toUpperCase()}]\n`;
    reportText += `📅 Thời gian: ${todayFormatted}\n`;
    reportText += `👩‍🏫 Giáo viên chủ nhiệm: ${config.teacherName}\n`;
    reportText += `---------------------------------\n`;
    reportText += `👥 Sĩ số: ${total} học sinh\n`;
    reportText += `✅ Hiện diện đúng giờ: ${presentCount} em\n`;
    reportText += `⏳ Đi muộn: ${lateCount} em ${
      lateCount > 0 ? `(${lateStudents.map((s) => s.name).join(', ')})` : ''
    }\n`;
    reportText += `❌ Vắng mặt: ${absentStudents.length} em\n`;

    if (absentStudents.length > 0) {
      reportText += `\nChi tiết học sinh vắng:\n`;
      absentStudents.forEach((s, idx) => {
        const r = records[s.id];
        const typeStr = r.status === 'excused' ? 'Có phép (P)' : 'Không phép (KP)';
        const noteStr = r.note ? ` - Lý do: ${r.note}` : '';
        reportText += `${idx + 1}. ${s.name} (${typeStr}${noteStr})\n`;
      });
    }

    reportText += `\n🌟 Tỷ lệ chuyên cần đạt: ${attendanceRate}%`;
    reportText += `\n🌟 Kính chúc quý phụ huynh và các em học sinh một ngày học tập thật hiệu quả & vui vẻ!`;

    navigator.clipboard.writeText(reportText).then(() => {
      sound.playReward();
      setCopiedZalo(true);
      setTimeout(() => setCopiedZalo(false), 3000);
    });
  };

  // Filter students by status & group
  const filteredStudents = students.filter((s) => {
    if (selectedGroupFilter !== 'all' && s.group !== selectedGroupFilter) return false;
    if (statusFilter === 'all') return true;
    return records[s.id]?.status === statusFilter;
  });

  // Helper format day for Matrix column headers
  const formatHeaderDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateStr;
  };

  const getWeekdayLabel = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      return days[d.getDay()];
    } catch {
      return '';
    }
  };

  return (
    <div id="attendance-section" className="space-y-6">
      {/* Top Navigation & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-xs p-5 rounded-3xl border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-teal-400 text-white flex items-center justify-center shadow-md shadow-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>Quản Lý Chuyên Cần & Điểm Danh</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200">
                ✨ Lớp {config.className}
              </span>
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Ghi nhận chuyên cần hàng ngày, tích lũy huy hiệu chăm ngoan & ma trận chuyên cần
            </p>
          </div>
        </div>

        {/* View mode toggle button */}
        <div className="flex items-center bg-pink-50/80 p-1.5 rounded-2xl gap-1.5 self-start sm:self-auto border border-pink-200/80 shadow-inner">
          <button
            id="tab-btn-daily-attendance"
            onClick={() => {
              setViewMode('daily');
              sound.playClick();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              viewMode === 'daily'
                ? 'candy-btn-purple text-white shadow-md'
                : 'text-purple-700 hover:bg-white/80 font-bold'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Điểm danh Hôm nay</span>
          </button>

          <button
            id="tab-btn-matrix-attendance"
            onClick={() => {
              setViewMode('matrix');
              sound.playClick();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
              viewMode === 'matrix'
                ? 'candy-btn-gold text-purple-950 shadow-md'
                : 'text-purple-700 hover:bg-white/80 font-bold'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>Ma Trận Lưới ({allHistoryRecords.length} ngày)</span>
          </button>
        </div>
      </div>

      {/* Top Header & Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 p-4 rounded-3xl border-2 border-pink-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-pink-600 uppercase tracking-wide">Sĩ số cả lớp</div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {total} <span className="text-xs font-bold text-slate-400">em</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center font-bold shadow-xs">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 rounded-3xl border-2 border-emerald-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-emerald-700 uppercase tracking-wide">Có mặt đúng giờ</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {presentCount} <span className="text-xs font-bold text-emerald-500">em</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shadow-xs">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 p-4 rounded-3xl border-2 border-amber-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-amber-700 uppercase tracking-wide">Đi muộn</div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {lateCount} <span className="text-xs font-bold text-amber-500">em</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold shadow-xs">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-sky-50 via-white to-blue-50 p-4 rounded-3xl border-2 border-sky-200/90 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-black text-sky-700 uppercase tracking-wide">Vắng có phép (P)</div>
            <div className="text-2xl font-black text-sky-600 mt-1">
              {excusedCount} <span className="text-xs font-bold text-sky-500">em</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold shadow-xs">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-rose-50 via-white to-red-50 p-4 rounded-3xl border-2 border-rose-200/90 shadow-sm flex items-center justify-between col-span-2 sm:col-span-1">
          <div>
            <div className="text-xs font-black text-rose-700 uppercase tracking-wide">Vắng K.Phép (KP)</div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {unexcusedCount} <span className="text-xs font-bold text-rose-500">em</span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold shadow-xs">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ===================== VIEW 1: DAILY ATTENDANCE ===================== */}
      {viewMode === 'daily' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Action Toolbar */}
          <div className="bg-white/95 rounded-3xl p-4.5 shadow-md shadow-pink-100/40 border-2 border-[#FCE7F3] flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Date selector & Quick mark */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-pink-50/70 border-2 border-pink-200 rounded-2xl text-xs sm:text-sm font-bold text-purple-900 shadow-inner">
                <Calendar className="w-4 h-4 text-pink-600" />
                <span>Ngày:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    const updated = { ...currentAttendance, date: e.target.value };
                    onUpdateAttendance(updated);
                    if (onSaveDailyAttendance) onSaveDailyAttendance(updated);
                  }}
                  className="bg-transparent border-0 focus:outline-none font-black text-purple-950 text-xs sm:text-sm cursor-pointer"
                />
              </div>

              <button
                id="btn-mark-all-present"
                onClick={handleMarkAllPresent}
                className="candy-btn-gold px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2"
                title="Đánh dấu tất cả học sinh có mặt hôm nay"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>Cả lớp có mặt</span>
              </button>
            </div>

            {/* Right: Filter tabs & Zalo copy button */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Group Filter */}
              <select
                value={selectedGroupFilter}
                onChange={(e) => setSelectedGroupFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3.5 py-2 bg-pink-50/80 border-2 border-pink-200 rounded-2xl text-xs font-black text-purple-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="all">🌸 Tất cả các Tổ</option>
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>

              {/* Status Filter */}
              <div className="flex items-center bg-pink-50/70 p-1.5 rounded-2xl gap-1 border border-pink-200/80">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    statusFilter === 'all' ? 'bg-white text-purple-900 shadow-sm border border-pink-200' : 'text-purple-700 hover:text-purple-950'
                  }`}
                >
                  Tất cả ({total})
                </button>
                <button
                  onClick={() => setStatusFilter('late')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    statusFilter === 'late' ? 'bg-amber-100 text-amber-900 shadow-sm border border-amber-300' : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  Muộn ({lateCount})
                </button>
                <button
                  onClick={() => setStatusFilter('excused')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    statusFilter === 'excused' ? 'bg-sky-100 text-sky-900 shadow-sm border border-sky-300' : 'text-sky-700 hover:text-sky-900'
                  }`}
                >
                  Phép ({excusedCount})
                </button>
                <button
                  onClick={() => setStatusFilter('unexcused')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                    statusFilter === 'unexcused' ? 'bg-rose-100 text-rose-900 shadow-sm border border-rose-300' : 'text-rose-700 hover:text-rose-900'
                  }`}
                >
                  K.Phép ({unexcusedCount})
                </button>
              </div>

              {/* Copy Zalo report button */}
              <button
                id="btn-copy-zalo-attendance"
                onClick={handleCopyZaloReport}
                className={`candy-btn-purple px-4 py-2.5 text-xs sm:text-sm font-black rounded-2xl flex items-center gap-2 ${
                  copiedZalo ? 'filter brightness-110' : ''
                }`}
              >
                {copiedZalo ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã chép Zalo!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Báo cáo Zalo</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-3xl border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-pink-50/80 via-purple-50/80 to-pink-50/80 border-b-2 border-pink-100 text-purple-900 text-xs font-black uppercase tracking-wider">
                    <th className="py-4 px-4 w-12 text-center">STT</th>
                    <th className="py-4 px-4">Học sinh & Lịch sử vi phạm</th>
                    <th className="py-4 px-4 w-28 text-center">Tổ</th>
                    <th className="py-4 px-4 text-center">Trạng thái điểm danh</th>
                    <th className="py-4 px-4">Ghi chú lý do</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-50 text-sm">
                  {filteredStudents.map((student) => {
                    const record = records[student.id] || { status: 'present' };
                    const avatarGradient = getAvatarColor(student.name, student.gender);
                    const initials = getStudentInitials(student.name);
                    const violations = studentViolationMap[student.id] || { lateDates: [], excusedDates: [], unexcusedDates: [] };
                    const hasViolations = violations.lateDates.length > 0 || violations.excusedDates.length > 0 || violations.unexcusedDates.length > 0;

                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-pink-50/40 transition-colors ${
                          record.status === 'unexcused'
                            ? 'bg-rose-50/30'
                            : record.status === 'excused'
                            ? 'bg-sky-50/30'
                            : record.status === 'late'
                            ? 'bg-amber-50/30'
                            : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center font-black text-purple-300 text-xs">
                          #{student.stt}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${avatarGradient} text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm border border-white mt-0.5`}
                            >
                              {initials}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-slate-800 text-sm sm:text-base">{student.name}</span>
                                <span className="text-xs text-purple-500 font-bold">({student.role})</span>
                              </div>

                              {/* Lịch sử vi phạm (Badges) */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {violations.lateDates.length > 0 && (
                                  <span
                                    title={`Đi muộn các ngày: ${violations.lateDates.join(', ')}`}
                                    className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-50 border border-amber-300 text-xs font-black text-amber-800 shadow-2xs"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Muộn {violations.lateDates.length} lần</span>
                                    <span className="text-amber-600 font-bold">
                                      ({violations.lateDates.map((d) => formatHeaderDate(d)).join(', ')})
                                    </span>
                                  </span>
                                )}

                                {violations.excusedDates.length > 0 && (
                                  <span
                                    title={`Vắng có phép các ngày: ${violations.excusedDates.join(', ')}`}
                                    className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-sky-50 border border-sky-300 text-xs font-black text-sky-800 shadow-2xs"
                                  >
                                    <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
                                    <span>Vắng có phép (P) {violations.excusedDates.length} ngày</span>
                                  </span>
                                )}

                                {violations.unexcusedDates.length > 0 && (
                                  <span
                                    title={`Vắng không phép các ngày: ${violations.unexcusedDates.join(', ')}`}
                                    className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-rose-50 border border-rose-300 text-xs font-black text-rose-800 shadow-2xs animate-pulse"
                                  >
                                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                    <span>Vắng K.Phép (KP) {violations.unexcusedDates.length} ngày</span>
                                  </span>
                                )}

                                {!hasViolations && (
                                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-50 text-xs font-black text-emerald-700 border border-emerald-300 shadow-2xs">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Chuyên cần 100% ⭐</span>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="text-xs sm:text-sm font-black px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                            Tổ {student.group}
                          </span>
                        </td>

                        {/* Interactive 4-Status Pill Selectors */}
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'present')}
                              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                record.status === 'present'
                                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm border-b-2 border-emerald-700 scale-102'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Có mặt</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'late')}
                              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                record.status === 'late'
                                  ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-950 shadow-sm border-b-2 border-amber-600 scale-102'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                              }`}
                            >
                              <Clock className="w-4 h-4" />
                              <span>Đi muộn</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'excused')}
                              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                record.status === 'excused'
                                  ? 'bg-gradient-to-r from-sky-500 to-blue-500 text-white shadow-sm border-b-2 border-blue-700 scale-102'
                                  : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
                              }`}
                            >
                              <AlertCircle className="w-4 h-4" />
                              <span>Phép (P)</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleStatusChange(student.id, 'unexcused')}
                              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                record.status === 'unexcused'
                                  ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-sm border-b-2 border-rose-700 scale-102'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                            >
                              <XCircle className="w-4 h-4" />
                              <span>K.Phép (KP)</span>
                            </button>
                          </div>
                        </td>

                        {/* Note / Reason */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {record.note ? (
                              <span className="text-xs sm:text-sm text-amber-900 bg-amber-50/90 border-2 border-amber-200/80 px-3.5 py-1 rounded-xl max-w-xs truncate font-bold shadow-2xs">
                                {record.note}
                              </span>
                            ) : (
                              <span className="text-xs sm:text-sm text-slate-400 italic">Chưa có ghi chú</span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingNoteStudent(student);
                                setNoteText(record.note || '');
                              }}
                              className="p-1.5 text-pink-400 hover:text-pink-600 rounded-xl hover:bg-pink-50 transition border border-transparent hover:border-pink-200 cursor-pointer"
                              title="Chỉnh sửa ghi chú"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* ===================== VIEW 2: MATRIX ATTENDANCE GRID ===================== */}
      {viewMode === 'matrix' && (
        <div className="bg-white rounded-3xl border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 p-5 space-y-5 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-pink-100">
            <div>
              <h3 className="font-black text-slate-800 text-base flex items-center gap-2">
                <Grid3X3 className="w-5 h-5 text-purple-600" />
                <span>Bảng Ma Trận Chuyên Cần Lớp {config.className}</span>
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">
                Trục dọc là danh sách học sinh, trục ngang là các ngày điểm danh theo thời gian thực
              </p>
            </div>

            {/* Matrix Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-black bg-pink-50/70 px-4 py-2.5 rounded-2xl border-2 border-pink-200/80">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-emerald-400 text-white flex items-center justify-center font-black text-[10px] shadow-2xs">
                  ✓
                </div>
                <span className="text-purple-900">Có mặt</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-black text-[10px] shadow-2xs">
                  M
                </div>
                <span className="text-purple-900">Đi muộn</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-sky-400 text-white flex items-center justify-center font-black text-[10px] shadow-2xs">
                  P
                </div>
                <span className="text-purple-900">Có phép</span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-rose-400 text-white flex items-center justify-center font-black text-[10px] shadow-2xs">
                  KP
                </div>
                <span className="text-purple-900">K.phép</span>
              </div>
            </div>
          </div>

          {/* Matrix Scrollable Table */}
          <div className="overflow-x-auto border-2 border-pink-100 rounded-2xl shadow-inner">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 border-b-2 border-pink-100">
                  <th className="py-3.5 px-3 w-12 text-center text-xs font-black text-purple-900 uppercase sticky left-0 bg-pink-50 z-10">
                    STT
                  </th>
                  <th className="py-3.5 px-3 text-xs font-black text-purple-900 uppercase sticky left-12 bg-pink-50 z-10 min-w-[170px] shadow-r">
                    Học sinh
                  </th>
                  <th className="py-3.5 px-2 text-center text-xs font-black text-purple-900 uppercase w-14">
                    Tổ
                  </th>

                  {/* Date Columns */}
                  {allHistoryRecords.map((item) => {
                    const isToday = item.date === currentAttendance.date;
                    const weekday = getWeekdayLabel(item.date);
                    return (
                      <th
                        key={item.date}
                        className={`py-2 px-2 text-center text-xs font-bold border-l-2 border-pink-100 min-w-[56px] ${
                          isToday ? 'bg-purple-100/70 text-purple-950' : 'text-slate-600'
                        }`}
                      >
                        <div className="text-[10px] text-purple-500 font-bold">{weekday}</div>
                        <div className="font-black text-purple-900">{formatHeaderDate(item.date)}</div>
                        {isToday && (
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xs">
                            H.nay
                          </span>
                        )}
                      </th>
                    );
                  })}

                  {/* Summary Rate Column */}
                  <th className="py-3 px-3 text-center text-xs font-black text-purple-900 uppercase border-l-2 border-pink-100 w-24">
                    Tỷ lệ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50 text-sm">
                {students.map((student) => {
                  const initials = getStudentInitials(student.name);
                  const avatarGradient = getAvatarColor(student.name, student.gender);

                  // Calculate student total attendance rate
                  let attendedCount = 0;
                  allHistoryRecords.forEach((item) => {
                    const st = item.records?.[student.id]?.status || 'present';
                    if (st === 'present' || st === 'late') {
                      attendedCount++;
                    }
                  });
                  const rate = allHistoryRecords.length > 0 
                    ? Math.round((attendedCount / allHistoryRecords.length) * 100) 
                    : 100;

                  return (
                    <tr key={student.id} className="hover:bg-pink-50/40 transition">
                      <td className="py-2.5 px-3 text-center font-black text-purple-300 text-xs sticky left-0 bg-white z-10">
                        #{student.stt}
                      </td>

                      <td className="py-2.5 px-3 sticky left-12 bg-white z-10 shadow-r">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-xl bg-gradient-to-tr ${avatarGradient} text-white flex items-center justify-center font-black text-[10px] shrink-0 shadow-2xs`}
                          >
                            {initials}
                          </div>
                          <div className="font-bold text-slate-800 text-xs truncate max-w-[130px]">
                            {student.name}
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-pink-50 text-pink-700 border border-pink-200">
                          {student.group}
                        </span>
                      </td>

                      {/* Status Dots (Candy Pill/Circle style) */}
                      {allHistoryRecords.map((item) => {
                        const rec = item.records?.[student.id] || { status: 'present' };
                        const isToday = item.date === currentAttendance.date;

                        let dotStyle = '';
                        let dotContent = '✓';
                        let titleText = `${student.name} - ${item.date}: `;

                        if (rec.status === 'present') {
                          dotStyle = 'bg-emerald-400 text-white shadow-2xs font-bold';
                          dotContent = '✓';
                          titleText += 'Có mặt đúng giờ';
                        } else if (rec.status === 'late') {
                          dotStyle = 'bg-amber-400 text-amber-950 shadow-2xs font-black';
                          dotContent = 'M';
                          titleText += `Đi muộn ${rec.note ? `(${rec.note})` : ''}`;
                        } else if (rec.status === 'excused') {
                          dotStyle = 'bg-sky-400 text-white shadow-2xs font-black';
                          dotContent = 'P';
                          titleText += `Vắng có phép ${rec.note ? `(${rec.note})` : ''}`;
                        } else if (rec.status === 'unexcused') {
                          dotStyle = 'bg-rose-500 text-white shadow-2xs font-black animate-pulse';
                          dotContent = 'KP';
                          titleText += `Vắng không phép ${rec.note ? `(${rec.note})` : ''}`;
                        }

                        return (
                          <td
                            key={item.date}
                            className={`py-2 px-2 text-center border-l-2 border-pink-50 ${
                              isToday ? 'bg-purple-50/40' : ''
                            }`}
                          >
                            <div className="flex items-center justify-center">
                              <div
                                title={titleText}
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-transform hover:scale-125 cursor-default ${dotStyle}`}
                              >
                                {dotContent}
                              </div>
                            </div>
                          </td>
                        );
                      })}

                      {/* Percentage */}
                      <td className="py-2.5 px-3 text-center border-l-2 border-pink-100">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                            rate >= 95
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : rate >= 80
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Note Editing Modal */}
      {editingNoteStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-2 border-pink-200 animate-in zoom-in-95 duration-150">
            <h3 className="font-black text-purple-950 text-base mb-1 flex items-center gap-2">
              <span>📝 Ghi chú: {editingNoteStudent.name}</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 mb-4">
              Nhập lý do vắng học, đi muộn hoặc lời nhắn xin phép từ phụ huynh
            </p>

            <form onSubmit={handleSaveNote} className="space-y-4">
              <textarea
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Ví dụ: Phụ huynh xin phép đi khám răng, kẹt xe trời mưa lớn..."
                className="w-full p-3.5 text-xs sm:text-sm bg-pink-50/60 border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-400 font-semibold text-slate-800"
                autoFocus
              />

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingNoteStudent(null)}
                  className="px-4 py-2.5 text-xs font-black text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="candy-btn-purple px-5 py-2.5 text-xs font-black rounded-2xl shadow-sm"
                >
                  Lưu ghi chú
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
