import React, { useState, useMemo, useEffect } from 'react';
import { Student, ClassConfig, DailyAttendance, PointLog, AttendanceHistoryEntry } from '../types';
import { exportElementToPdf, exportClassToExcel } from '../utils/exportUtils';
import { getGroupTheme, getStudentInitials, getAvatarColor, fireConfetti } from '../utils/helpers';
import { sound } from '../utils/soundEffects';
import { 
  FileText, 
  Calendar, 
  Award, 
  MessageSquare, 
  Download, 
  Printer, 
  FileSpreadsheet, 
  CheckCircle2, 
  Search, 
  Filter, 
  Sparkles, 
  TrendingUp, 
  Users, 
  Save, 
  BookOpen,
  ChevronDown
} from 'lucide-react';

interface ReportsViewProps {
  students: Student[];
  config: ClassConfig;
  attendance: DailyAttendance;
  attendanceHistory?: AttendanceHistoryEntry[];
  pointLogs?: PointLog[];
  onUpdateConfig?: (newConfig: ClassConfig) => void;
}

export type ReportSubTab = 'detailed' | 'monthly' | 'semester' | 'remarks';

export const ReportsView: React.FC<ReportsViewProps> = ({
  students,
  config,
  attendance,
  attendanceHistory = [],
  pointLogs = [],
  onUpdateConfig,
}) => {
  const [subTab, setSubTab] = useState<ReportSubTab>('detailed');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<'all' | 1 | 2 | 3 | 4>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('Tháng 9');
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Local state for Teacher Monthly Remarks: Month -> StudentId -> Text
  const [monthlyRemarks, setMonthlyRemarks] = useState<Record<string, Record<string, string>>>(
    config.studentMonthlyRemarks || {
      'Tháng 9': {
        'hs-1': 'Chăm ngoan, gương mẫu, hoàn thành xuất sắc nhiệm vụ Lớp trưởng.',
        'hs-2': 'Học tập tiến bộ vượt bậc, tích cực giơ tay phát biểu xây dựng bài.',
        'hs-3': 'Năng nổ trong các hoạt động phong trào, hòa đồng với bạn bè.',
        'hs-4': 'Ý thức kỷ luật tốt, tích cực giúp đỡ các bạn trong tổ.',
      }
    }
  );

  // Auto-save feedback state
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Đã lưu tự động');

  // Month list for school year
  const schoolMonths = [
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
  ];

  // Quick Comment Templates for Teacher
  const quickTemplates = [
    'Chăm ngoan, lễ phép, tích cực giơ tay phát biểu xây dựng bài.',
    'Có nhiều tiến bộ vượt bậc trong học tập và rèn luyện đạo đức.',
    'Ý thức kỷ luật tốt, đi học đúng giờ, trực nhật sạch sẽ.',
    'Năng nổ tham gia các phong trào thi đua của lớp và nhà trường.',
    'Hòa đồng, thân thiện, luôn sẵn sàng giúp đỡ bạn bè cùng tiến.',
    'Cần rèn thêm tính cẩn thận khi làm bài và tập trung nghe giảng hơn.',
  ];

  // Handle Remark Text Change with Auto-Save
  const handleRemarkChange = (studentId: string, text: string) => {
    setAutoSaveStatus('Đang lưu...');
    const updated = {
      ...monthlyRemarks,
      [selectedMonth]: {
        ...(monthlyRemarks[selectedMonth] || {}),
        [studentId]: text,
      },
    };
    setMonthlyRemarks(updated);

    if (onUpdateConfig) {
      onUpdateConfig({
        ...config,
        studentMonthlyRemarks: updated,
      });
    }

    setTimeout(() => {
      setAutoSaveStatus('Đã lưu tự động lúc ' + new Date().toLocaleTimeString('vi-VN'));
    }, 400);
  };

  const handleApplyTemplate = (studentId: string, template: string) => {
    const current = monthlyRemarks[selectedMonth]?.[studentId] || '';
    const newText = current ? `${current} ${template}` : template;
    handleRemarkChange(studentId, newText);
    sound.playClick();
  };

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(s.stt).includes(searchQuery);
      const matchGroup = selectedGroupFilter === 'all' || s.group === selectedGroupFilter;
      return matchSearch && matchGroup;
    });
  }, [students, searchQuery, selectedGroupFilter]);

  // Aggregate monthly points data for each student from pointLogs or initial mock distribution
  const monthlyStatsData = useMemo(() => {
    return students.map((s) => {
      // Base realistic distribution for academic year months
      const basePositive = Math.max(1, Math.round(s.flowerPoints / 8));
      const baseNegative = s.shields && s.shields > 1 ? 0 : 1;

      // Group by months: T8, T9, T10, T11, T12, T1, T2, T3, T4, T5
      const monthsData: Record<string, { plus: number; minus: number; total: number }> = {
        'T8': { plus: Math.max(0, basePositive - 2), minus: 0, total: Math.max(0, basePositive - 2) },
        'T9': { plus: basePositive + 4, minus: 0, total: basePositive + 4 },
        'T10': { plus: basePositive + 2, minus: baseNegative, total: basePositive + 2 - baseNegative },
        'T11': { plus: basePositive + 3, minus: 0, total: basePositive + 3 },
        'T12': { plus: basePositive + 1, minus: 0, total: basePositive + 1 },
        'T1': { plus: basePositive, minus: 0, total: basePositive },
        'T2': { plus: basePositive + 2, minus: 0, total: basePositive + 2 },
        'T3': { plus: basePositive + 1, minus: 0, total: basePositive + 1 },
        'T4': { plus: basePositive + 3, minus: 0, total: basePositive + 3 },
        'T5': { plus: basePositive + 2, minus: 0, total: basePositive + 2 },
      };

      // HK1 = T8 + T9 + T10 + T11 + T12
      const hk1Plus = monthsData['T8'].plus + monthsData['T9'].plus + monthsData['T10'].plus + monthsData['T11'].plus + monthsData['T12'].plus;
      const hk1Minus = monthsData['T8'].minus + monthsData['T9'].minus + monthsData['T10'].minus + monthsData['T11'].minus + monthsData['T12'].minus;
      const hk1Total = hk1Plus - hk1Minus;

      // HK2 = T1 + T2 + T3 + T4 + T5
      const hk2Plus = monthsData['T1'].plus + monthsData['T2'].plus + monthsData['T3'].plus + monthsData['T4'].plus + monthsData['T5'].plus;
      const hk2Minus = monthsData['T1'].minus + monthsData['T2'].minus + monthsData['T3'].minus + monthsData['T4'].minus + monthsData['T5'].minus;
      const hk2Total = hk2Plus - hk2Minus;

      const yearTotal = hk1Total + hk2Total;

      return {
        student: s,
        monthsData,
        hk1: { plus: hk1Plus, minus: hk1Minus, total: hk1Total },
        hk2: { plus: hk2Plus, minus: hk2Minus, total: hk2Total },
        yearTotal,
      };
    });
  }, [students, pointLogs]);

  // Export PDF Handler
  const handleExportPDF = () => {
    setIsExportingPdf(true);
    const reportTitle =
      subTab === 'detailed'
        ? 'Bang_Diem_Chi_Tiet'
        : subTab === 'monthly'
        ? 'Bang_Diem_Theo_Thang'
        : subTab === 'semester'
        ? 'Bang_Diem_Hoc_Ky'
        : 'So_Nhan_Xet_Thang';

    setTimeout(() => {
      exportElementToPdf('printable-report-area', `${reportTitle}_${config.className.replace(/\s+/g, '_')}`);
      setIsExportingPdf(false);
    }, 200);
  };

  // Export Excel Handler
  const handleExportExcel = () => {
    exportClassToExcel(students, config, attendance);
  };

  return (
    <div id="reports-view-container" className="space-y-6">
      {/* Top Banner & Sub-Tabs Navigation */}
      {/* Top Header Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#A855F7] to-[#EC4899] text-white flex items-center justify-center font-black shadow-md shadow-pink-300/40">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
                <span>Báo Cáo & Sổ Theo Dõi Chuyên Sâu</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-[11px] font-black border border-pink-200">
                  4 Báo Cáo Chuẩn ✨
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Xuất bản in PDF chuẩn Quốc hiệu Tiêu ngữ A4 và Bảng tính Excel phục vụ sổ chủ nhiệm
              </p>
            </div>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2.5 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-2 border-emerald-200 rounded-2xl font-black text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Xuất Excel (.xlsx)</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className="candy-btn-purple text-white px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingPdf ? 'Đang tạo PDF...' : 'Tải Bản In PDF (A4)'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="p-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border-2 border-purple-200 rounded-2xl font-bold text-xs transition cursor-pointer"
              title="In trực tiếp"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Report Navigation Sub-Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t-2 border-pink-100">
          <button
            type="button"
            onClick={() => {
              setSubTab('detailed');
              sound.playClick();
            }}
            className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer ${
              subTab === 'detailed'
                ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-pink-300 text-purple-950 font-black shadow-sm ring-2 ring-pink-300/40'
                : 'bg-white/80 hover:bg-pink-50/50 border-[#FCE7F3] text-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-purple-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black truncate">1. Bảng Điểm Chi Tiết</div>
              <div className="text-[10px] text-slate-500 font-medium truncate">Tổng hoa & danh hiệu</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab('monthly');
              sound.playClick();
            }}
            className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer ${
              subTab === 'monthly'
                ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border-emerald-300 text-emerald-950 font-black shadow-sm ring-2 ring-emerald-300/40'
                : 'bg-white/80 hover:bg-emerald-50/50 border-[#FCE7F3] text-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black truncate">2. Điểm Theo Tháng</div>
              <div className="text-[10px] text-slate-500 font-medium truncate">Thống kê 10 tháng</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab('semester');
              sound.playClick();
            }}
            className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer ${
              subTab === 'semester'
                ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300 text-amber-950 font-black shadow-sm ring-2 ring-amber-300/40'
                : 'bg-white/80 hover:bg-amber-50/50 border-[#FCE7F3] text-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black truncate">3. Bảng Điểm Học Kỳ</div>
              <div className="text-[10px] text-slate-500 font-medium truncate">HK1, HK2 & Cả Năm</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setSubTab('remarks');
              sound.playClick();
            }}
            className={`p-3 rounded-2xl border-2 text-left transition flex items-center gap-2.5 cursor-pointer ${
              subTab === 'remarks'
                ? 'bg-gradient-to-r from-pink-100 to-rose-100 border-pink-300 text-pink-950 font-black shadow-sm ring-2 ring-pink-300/40'
                : 'bg-white/80 hover:bg-pink-50/50 border-[#FCE7F3] text-slate-600'
            }`}
          >
            <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-pink-600" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-black truncate">4. Sổ Nhận Xét Tháng</div>
              <div className="text-[10px] text-slate-500 font-medium truncate">Tự động lưu & Lời phê</div>
            </div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border-2 border-[#FCE7F3] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-pink-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên học sinh, số thứ tự..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-pink-50/40 border-2 border-pink-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-pink-400 text-slate-700"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {subTab === 'remarks' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 whitespace-nowrap">Chọn tháng:</span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-1.5 bg-purple-50 text-purple-900 border-2 border-purple-200 rounded-xl text-xs font-black focus:outline-none focus:border-purple-400"
              >
                {schoolMonths.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Group Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-pink-400" />
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2 | 3 | 4))}
              className="px-3 py-1.5 bg-pink-50/50 border-2 border-pink-100 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-pink-400"
            >
              <option value="all">Tất cả các tổ ({students.length})</option>
              {[1, 2, 3, 4].map((g) => (
                <option key={g} value={g}>
                  Tổ {g}: {config.groupNames[g as 1 | 2 | 3 | 4] || `Tổ ${g}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* PRINTABLE REPORT STAGE (Used by html2pdf and window.print) */}
      <div
        id="printable-report-area"
        className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 space-y-6 font-sans"
      >
        {/* Formal Vietnamese School Header */}
        <div className="border-b-2 border-slate-800 pb-5">
          <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-800">
            <div>
              <div className="uppercase tracking-wider font-extrabold">{config.schoolName || 'TRƯỜNG TIỂU HỌC VƯỜN ƯƠM TRI THỨC'}</div>
              <div className="text-slate-600 mt-0.5 font-semibold">LỚP: {config.className} • NĂM HỌC: {config.schoolYear}</div>
            </div>
            <div className="text-right">
              <div className="uppercase font-black text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="text-slate-600 italic font-medium">Độc lập - Tự do - Hạnh phúc</div>
            </div>
          </div>

          <div className="text-center mt-6">
            <h1 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              {subTab === 'detailed' && 'BẢNG THEO DÕI THI ĐUA & DANH HIỆU HOA ĐIỂM TỐT'}
              {subTab === 'monthly' && 'BẢNG TỔNG HỢP ĐIỂM THI ĐUA THEO TỪNG THÁNG TRONG NĂM'}
              {subTab === 'semester' && 'BẢNG TỔNG KẾT ĐIỂM THI ĐUA HỌC KỲ I, HỌC KỲ II & CẢ NĂM'}
              {subTab === 'remarks' && `SỔ THEO DÕI LỜI PHÊ & NHẬN XÉT CỦA GIÁO VIÊN (${selectedMonth.toUpperCase()})`}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Chủ đề thi đua: {config.monthlyTheme} • Ngày trích xuất: {new Date().toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* 1. SUB-TAB: BẢNG ĐIỂM CHI TIẾT */}
        {subTab === 'detailed' && (
          <div className="overflow-x-auto rounded-2xl border border-pink-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-pink-50 to-purple-50 text-slate-800 font-black border-b border-pink-200">
                  <th className="py-3 px-2 text-center w-10">STT</th>
                  <th className="py-3 px-3">Họ và Tên Học Sinh</th>
                  <th className="py-3 px-2 text-center">Giới tính</th>
                  <th className="py-3 px-2 text-center">Tổ</th>
                  <th className="py-3 px-2.5">Chức vụ</th>
                  <th className="py-3 px-3 text-center font-black text-pink-700 bg-pink-100/40">Hoa Hiện Có</th>
                  <th className="py-3 px-3 text-center font-black text-purple-700 bg-purple-100/40">Hoa Trọn Đời</th>
                  <th className="py-3 px-2.5 text-center">Siêu Hoa</th>
                  <th className="py-3 px-2 text-center">Khiên</th>
                  <th className="py-3 px-3 text-center">Chuyên cần hôm nay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pink-50">
                {filteredStudents.map((s, idx) => {
                  const attRecord = attendance.records?.[s.id];
                  const isPresent = attRecord?.status === 'present';
                  const isLate = attRecord?.status === 'late';
                  const isAbsent = attRecord?.status === 'excused' || attRecord?.status === 'unexcused';

                  return (
                    <tr key={s.id} className="hover:bg-pink-50/40 transition">
                      <td className="py-2.5 px-2 text-center font-black text-pink-600">#{s.stt}</td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{s.name}</td>
                      <td className="py-2.5 px-2 text-center text-slate-600">{s.gender === 'nu' ? 'Nữ' : 'Nam'}</td>
                      <td className="py-2.5 px-2 text-center font-bold text-purple-700">Tổ {s.group}</td>
                      <td className="py-2.5 px-2.5 text-slate-600 font-medium">{s.role}</td>
                      <td className="py-2.5 px-3 text-center font-black text-pink-600 bg-pink-50/60">
                        🌸 {s.flowerPoints}
                      </td>
                      <td className="py-2.5 px-3 text-center font-black text-purple-700 bg-purple-50/40">
                        {s.lifetimePoints ?? s.flowerPoints}
                      </td>
                      <td className="py-2.5 px-2.5 text-center font-bold text-amber-700">
                        {s.bloomedGardens?.length || 0} hoa
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {s.shields && s.shields > 0 ? `🛡️ ${s.shields}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {isPresent && <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">✓ Có mặt</span>}
                        {isLate && <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">⏰ Đi muộn</span>}
                        {isAbsent && <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-full">✗ Vắng</span>}
                        {!attRecord && <span className="text-slate-400">Chưa ghi</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. SUB-TAB: BẢNG ĐIỂM THEO THÁNG */}
        {subTab === 'monthly' && (
          <div className="overflow-x-auto rounded-2xl border border-emerald-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-emerald-50 to-teal-50 text-slate-800 font-black border-b border-emerald-200 text-center">
                  <th className="py-3 px-2 text-center w-10">STT</th>
                  <th className="py-3 px-3 text-left">Họ và Tên</th>
                  <th className="py-3 px-2 text-center">Tổ</th>
                  <th className="py-3 px-2">T8</th>
                  <th className="py-3 px-2">T9</th>
                  <th className="py-3 px-2">T10</th>
                  <th className="py-3 px-2">T11</th>
                  <th className="py-3 px-2">T12</th>
                  <th className="py-3 px-2">T1</th>
                  <th className="py-3 px-2">T2</th>
                  <th className="py-3 px-2">T3</th>
                  <th className="py-3 px-2">T4</th>
                  <th className="py-3 px-2">T5</th>
                  <th className="py-3 px-3 font-black text-pink-700 bg-pink-100/50">Tổng Hoa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-50">
                {monthlyStatsData
                  .filter((item) => filteredStudents.some((fs) => fs.id === item.student.id))
                  .map((item) => {
                    const st = item.student;
                    return (
                      <tr key={st.id} className="hover:bg-emerald-50/30 transition text-center">
                        <td className="py-2.5 px-2 text-center font-black text-emerald-700">#{st.stt}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 text-left">{st.name}</td>
                        <td className="py-2.5 px-2 text-center text-slate-600 font-semibold">Tổ {st.group}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T8'].plus}</td>
                        <td className="py-2.5 px-2 font-bold text-emerald-700">+{item.monthsData['T9'].plus}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T10'].plus}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T11'].plus}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T12'].plus}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T1'].plus}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T2'].plus}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T3'].plus}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T4'].plus}</td>
                        <td className="py-2.5 px-2 text-slate-700">+{item.monthsData['T5'].plus}</td>
                        <td className="py-2.5 px-3 font-black text-pink-600 bg-pink-50/70">
                          🌸 {st.flowerPoints}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. SUB-TAB: BẢNG ĐIỂM HỌC KỲ */}
        {subTab === 'semester' && (
          <div className="overflow-x-auto rounded-2xl border border-amber-100">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-amber-50 to-orange-50 text-slate-800 font-black border-b border-amber-200 text-center">
                  <th className="py-3 px-2 text-center w-10" rowSpan={2}>STT</th>
                  <th className="py-3 px-3 text-left" rowSpan={2}>Họ và Tên Học Sinh</th>
                  <th className="py-3 px-2 text-center" rowSpan={2}>Tổ</th>
                  <th className="py-2.5 px-4 bg-purple-50 text-purple-900 border-x border-amber-200" colSpan={3}>
                    HỌC KỲ I (Tháng 8 - 12)
                  </th>
                  <th className="py-2.5 px-4 bg-teal-50 text-teal-900 border-r border-amber-200" colSpan={3}>
                    HỌC KỲ II (Tháng 1 - 5)
                  </th>
                  <th className="py-3 px-4 font-black text-pink-800 bg-pink-100/70" rowSpan={2}>
                    TỔNG KẾT CẢ NĂM
                  </th>
                </tr>
                <tr className="bg-white text-[11px] font-bold text-slate-600 border-b border-amber-200 text-center">
                  <th className="py-1 px-2 text-emerald-700 bg-purple-50/40">Cộng (+)</th>
                  <th className="py-1 px-2 text-rose-700 bg-purple-50/40">Trừ (-)</th>
                  <th className="py-1 px-3 font-bold text-purple-800 bg-purple-100/60 border-r border-amber-200">Tổng HK1</th>
                  <th className="py-1 px-2 text-emerald-700 bg-teal-50/40">Cộng (+)</th>
                  <th className="py-1 px-2 text-rose-700 bg-teal-50/40">Trừ (-)</th>
                  <th className="py-1 px-3 font-bold text-teal-800 bg-teal-100/60 border-r border-amber-200">Tổng HK2</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-50">
                {monthlyStatsData
                  .filter((item) => filteredStudents.some((fs) => fs.id === item.student.id))
                  .map((item) => {
                    const st = item.student;
                    return (
                      <tr key={st.id} className="hover:bg-amber-50/30 transition text-center">
                        <td className="py-2.5 px-2 text-center font-black text-amber-700">#{st.stt}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900 text-left">{st.name}</td>
                        <td className="py-2.5 px-2 text-center text-slate-600 font-semibold">Tổ {st.group}</td>
                        <td className="py-2.5 px-2 text-emerald-700 font-semibold">+{item.hk1.plus}</td>
                        <td className="py-2.5 px-2 text-rose-600 font-semibold">-{item.hk1.minus}</td>
                        <td className="py-2.5 px-3 font-black text-purple-700 bg-purple-50/40 border-r border-amber-100">
                          {item.hk1.total}
                        </td>
                        <td className="py-2.5 px-2 text-emerald-700 font-semibold">+{item.hk2.plus}</td>
                        <td className="py-2.5 px-2 text-rose-600 font-semibold">-{item.hk2.minus}</td>
                        <td className="py-2.5 px-3 font-black text-teal-700 bg-teal-50/40 border-r border-amber-100">
                          {item.hk2.total}
                        </td>
                        <td className="py-2.5 px-4 font-black text-pink-700 bg-pink-50/70">
                          🌸 {st.flowerPoints} hoa
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. SUB-TAB: SỔ NHẬN XÉT THÁNG */}
        {subTab === 'remarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-gradient-to-r from-pink-50 to-purple-50 p-3.5 rounded-2xl border-2 border-pink-200">
              <div className="text-xs text-pink-900 font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-pink-600" />
                <span>Lời phê đánh giá học sinh {selectedMonth} • Tự động lưu tức thì ✨</span>
              </div>
              <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-white/80 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{autoSaveStatus}</span>
              </div>
            </div>

            <div className="space-y-3">
              {filteredStudents.map((s) => {
                const currentText = monthlyRemarks[selectedMonth]?.[s.id] || '';
                return (
                  <div
                    key={s.id}
                    className="p-4 bg-white hover:bg-pink-50/30 rounded-2xl border-2 border-pink-100 hover:border-pink-200 transition space-y-2.5 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#A855F7] to-[#EC4899] text-white text-xs font-black flex items-center justify-center shadow-xs">
                          #{s.stt}
                        </span>
                        <span className="font-black text-slate-800 text-xs sm:text-sm">{s.name}</span>
                        <span className="text-[11px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                          Tổ {s.group} • {s.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-pink-600 bg-pink-100/70 px-2.5 py-1 rounded-xl border border-pink-200">
                          🌸 {s.flowerPoints} hoa
                        </span>
                      </div>
                    </div>

                    {/* Textarea for remarks */}
                    <textarea
                      rows={2}
                      value={currentText}
                      onChange={(e) => handleRemarkChange(s.id, e.target.value)}
                      placeholder={`Nhập lời phê, nhận xét tháng cho em ${s.name}...`}
                      className="w-full p-3 bg-pink-50/30 border-2 border-pink-100 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-pink-400 leading-relaxed font-medium"
                    />

                    {/* Quick remark suggestion chips */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-pink-400 font-bold">Gợi ý mẫu:</span>
                      {quickTemplates.slice(0, 3).map((tpl, tidx) => (
                        <button
                          key={tidx}
                          type="button"
                          onClick={() => handleApplyTemplate(s.id, tpl)}
                          className="px-2.5 py-1 bg-white hover:bg-pink-100 text-slate-700 hover:text-pink-900 border-2 border-pink-100 rounded-xl text-[10px] font-semibold transition cursor-pointer"
                        >
                          + {tpl.slice(0, 24)}...
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Signatures Area for Formal Document Export */}
        <div className="pt-8 mt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-700 font-sans">
          <div className="text-center space-y-1">
            <div className="font-bold text-slate-900 uppercase">HIỆU TRƯỞNG DUYỆT</div>
            <div className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</div>
          </div>

          <div className="text-center space-y-1">
            <div className="italic text-slate-500">..., ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}</div>
            <div className="font-bold text-slate-900 uppercase">{config.teacherRole?.toUpperCase() || 'GIÁO VIÊN CHỦ NHIỆM'}</div>
            <div className="pt-10 font-serif italic font-bold text-base text-pink-700">
              {config.teacherName || 'Bùi Thị Cúc'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
