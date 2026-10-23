/**
 * Export & Import Utilities using SheetJS (XLSX) and html2pdf.js
 */

import { Student, ClassConfig, DailyAttendance, StudentRole, Gender } from '../types';
import { getTreeEvolutionInfo } from '../data/dreamTreeData';
import { sound } from './soundEffects';
import { generateUnique5DigitCode } from './imageUtils';
import * as XLSX from 'xlsx';
import html2pdf from 'html2pdf.js';

// ==========================================
// 1. EXCEL ENGINE (SheetJS)
// ==========================================

export const exportClassToExcel = (
  students: Student[],
  config: ClassConfig,
  attendance: DailyAttendance
) => {
  try {
    // 1. Student Roster & Flower Points Sheet
    const studentRows = students.map((s) => {
      const treeInfo = getTreeEvolutionInfo(s.flowerPoints);
      const attRecord = attendance.records?.[s.id];
      let attStatus = 'Chưa điểm danh';
      if (attRecord) {
        if (attRecord.status === 'present') attStatus = 'Có mặt đúng giờ';
        else if (attRecord.status === 'late') attStatus = 'Đi muộn';
        else if (attRecord.status === 'excused') attStatus = 'Nghỉ có phép';
        else if (attRecord.status === 'unexcused') attStatus = 'Vắng không phép';
      }

      return {
        'STT': s.stt,
        'Họ và Tên': s.name,
        'Giới Tính': s.gender === 'nu' ? 'Nữ' : 'Nam',
        'Tổ': `Tổ ${s.group}`,
        'Chức Vụ': s.role || 'Học sinh',
        'Điểm Hoa Tích Lũy': s.flowerPoints,
        'Cấp Độ Cây Ước Mơ': treeInfo.currentStage.name,
        'Số Siêu Hoa Đã Nở': s.bloomedGardens?.length || 0,
        'Khiên Bảo Vệ': s.shields || 0,
        'Ngày Sinh': s.birthday || '',
        'SĐT Phụ Huynh': s.parentPhone || '',
        'Điểm Danh Hôm Nay': attStatus,
        'Ghi Chú': s.notes || '',
      };
    });

    const wb = XLSX.utils.book_new();
    const wsStudents = XLSX.utils.json_to_sheet(studentRows);

    // Auto column widths
    const colWidths = [
      { wch: 6 },  // STT
      { wch: 24 }, // Họ và tên
      { wch: 10 }, // Giới tính
      { wch: 10 }, // Tổ
      { wch: 18 }, // Chức vụ
      { wch: 18 }, // Điểm hoa
      { wch: 24 }, // Cấp độ cây
      { wch: 18 }, // Siêu hoa
      { wch: 14 }, // Khiên
      { wch: 14 }, // Ngày sinh
      { wch: 16 }, // SĐT
      { wch: 20 }, // Điểm danh
      { wch: 25 }, // Ghi chú
    ];
    wsStudents['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, wsStudents, 'Danh Sách Học Sinh');

    // 2. Class Summary Sheet
    const totalPoints = students.reduce((sum, s) => sum + s.flowerPoints, 0);
    const avgPoints = students.length > 0 ? (totalPoints / students.length).toFixed(1) : '0';
    const topStudent = [...students].sort((a, b) => b.flowerPoints - a.flowerPoints)[0];

    const summaryRows = [
      { 'Thông Tin': 'Lớp Học', 'Giá Trị': config.className },
      { 'Thông Tin': 'Trường Học', 'Giá Trị': config.schoolName },
      { 'Thông Tin': 'Giáo Viên Chủ Nhiệm', 'Giá Trị': `${config.teacherRole}: ${config.teacherName}` },
      { 'Thông Tin': 'Năm Học', 'Giá Trị': config.schoolYear },
      { 'Thông Tin': 'Chủ Đề Thi Đua Tháng', 'Giá Trị': config.monthlyTheme },
      { 'Thông Tin': 'Sĩ Số Lớp', 'Giá Trị': `${students.length} học sinh` },
      { 'Thông Tin': 'Tổng Số Hoa Tích Lũy', 'Giá Trị': `${totalPoints} hoa 🌸` },
      { 'Thông Tin': 'Điểm Hoa Trung Bình', 'Giá Trị': `${avgPoints} hoa/em` },
      { 'Thông Tin': 'Học Sinh Dẫn Đầu (Top 1)', 'Giá Trị': topStudent ? `${topStudent.name} (${topStudent.flowerPoints} hoa)` : 'Chưa có' },
      { 'Thông Tin': 'Ngày Xuất Dữ Liệu', 'Giá Trị': new Date().toLocaleDateString('vi-VN') },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 28 }, { wch: 36 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng Quan Thi Đua');

    const fileName = `Danh_Sach_Diem_Hoa_${config.className.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
    sound.playReward();
    return true;
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return false;
  }
};

import { parseExcelOrCsvFile, convertDraftsToStudents } from './studentParser';

/**
 * Parses uploaded Excel or CSV file (.xlsx, .xls, .csv) into Student objects
 */
export const importStudentsFromExcel = async (file: File, existingStudents: Student[] = []): Promise<Student[]> => {
  const drafts = await parseExcelOrCsvFile(file, existingStudents);
  return convertDraftsToStudents(drafts, existingStudents);
};

// ==========================================
// 2. PDF ENGINE (html2pdf.js)
// ==========================================

export const exportElementToPdf = (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return;
  }

  const opt = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `${filename}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
  };

  html2pdf().from(element).set(opt).save();
  sound.playReward();
};
