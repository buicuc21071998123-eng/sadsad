import React, { useState, useRef } from 'react';
import { Student, StudentRole, Gender } from '../types';
import { 
  ParsedStudentDraft, 
  VALID_ROLES, 
  parseFlexibleStudentText, 
  parseExcelOrCsvFile, 
  convertDraftsToStudents,
  cleanStudentName,
  enrichDuplicateFlags 
} from '../utils/studentParser';
import { sound } from '../utils/soundEffects';
import { 
  Upload, 
  FileSpreadsheet, 
  ClipboardPaste, 
  Check, 
  X, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  RotateCcw, 
  Sparkles, 
  Users, 
  HelpCircle, 
  ArrowLeft, 
  Search,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface BatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingStudents: Student[];
  onConfirmImport: (newStudents: Student[], mode: 'append' | 'replace') => void;
}

export const BatchImportModal: React.FC<BatchImportModalProps> = ({
  isOpen,
  onClose,
  existingStudents,
  onConfirmImport,
}) => {
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [inputTab, setInputTab] = useState<'paste' | 'excel'>('paste');
  const [pastedText, setPastedText] = useState('');
  const [draftStudents, setDraftStudents] = useState<ParsedStudentDraft[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [previewSearch, setPreviewSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle parsing pasted text
  const handleParsePastedText = () => {
    setErrorMessage(null);
    if (!pastedText.trim()) {
      setErrorMessage('Vui lòng dán danh sách học sinh vào khung trước khi tiếp tục.');
      return;
    }

    try {
      const parsed = parseFlexibleStudentText(pastedText, existingStudents);
      if (parsed.length === 0) {
        setErrorMessage('Không nhận diện được học sinh nào. Vui lòng kiểm tra lại nội dung dán.');
        return;
      }
      setDraftStudents(parsed);
      setStep('preview');
      sound.playTing();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi phân tích danh sách.');
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsProcessingFile(true);
    try {
      const parsed = await parseExcelOrCsvFile(file, existingStudents);
      if (parsed.length === 0) {
        setErrorMessage('Không nhận diện được học sinh nào từ tệp Excel/CSV.');
        return;
      }
      setDraftStudents(parsed);
      setStep('preview');
      sound.playTing();
    } catch (err: any) {
      console.error('File parsing error:', err);
      setErrorMessage(err?.message || 'Lỗi khi đọc tệp Excel/CSV. Vui lòng kiểm tra lại định dạng.');
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Inline draft edit handlers
  const handleUpdateDraft = (id: string, field: keyof ParsedStudentDraft, value: any) => {
    setDraftStudents((prev) => {
      const updated = prev.map((d) => {
        if (d.id === id) {
          return { ...d, [field]: value };
        }
        return d;
      });
      // Re-evaluate duplicates if name changed
      if (field === 'name') {
        return enrichDuplicateFlags(updated, existingStudents);
      }
      return updated;
    });
  };

  // Remove one row in preview
  const handleRemoveDraftRow = (id: string) => {
    setDraftStudents((prev) => {
      const filtered = prev.filter((d) => d.id !== id);
      const renumbered = filtered.map((d, idx) => ({ ...d, stt: idx + 1 }));
      return enrichDuplicateFlags(renumbered, existingStudents);
    });
    sound.playClick();
  };

  // Add one manual row in preview
  const handleAddDraftRow = () => {
    const nextStt = draftStudents.length + 1;
    const defaultGroup = ((draftStudents.length % 4) + 1) as 1 | 2 | 3 | 4;
    const newDraft: ParsedStudentDraft = {
      id: `draft-manual-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      stt: nextStt,
      name: `Học sinh mới ${nextStt}`,
      gender: 'nam',
      group: defaultGroup,
      role: 'Học sinh',
      flowerPoints: 0,
    };

    setDraftStudents((prev) => {
      const appended = [...prev, newDraft];
      return enrichDuplicateFlags(appended, existingStudents);
    });
    sound.playClick();
  };

  // Evenly balance groups across all preview rows (1..4)
  const handleEvenlyBalanceGroups = () => {
    setDraftStudents((prev) =>
      prev.map((d, idx) => ({
        ...d,
        group: ((idx % 4) + 1) as 1 | 2 | 3 | 4,
      }))
    );
    sound.playReward();
  };

  // Confirm final import
  const handleConfirmSave = () => {
    if (draftStudents.length === 0) {
      alert('Danh sách xem trước đang rỗng.');
      return;
    }

    // Check for empty names
    const hasEmptyName = draftStudents.some((d) => !d.name.trim());
    if (hasEmptyName) {
      alert('Vui lòng điền đầy đủ họ tên cho tất cả học sinh hoặc xóa dòng trống.');
      return;
    }

    const converted = convertDraftsToStudents(draftStudents, importMode === 'append' ? existingStudents : []);
    onConfirmImport(converted, importMode);
    sound.playReward();
    onClose();
  };

  // Reset modal state
  const handleResetModal = () => {
    setStep('input');
    setPastedText('');
    setDraftStudents([]);
    setErrorMessage(null);
  };

  // Stats calculation
  const totalBoys = draftStudents.filter((d) => d.gender === 'nam').length;
  const totalGirls = draftStudents.filter((d) => d.gender === 'nu').length;
  const duplicateCount = draftStudents.filter((d) => d.isDuplicateInImport || d.isDuplicateInClass).length;

  const filteredPreviewList = draftStudents.filter((d) => {
    if (!previewSearch) return true;
    const q = previewSearch.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.stt.toString() === q || (d.parentPhone && d.parentPhone.includes(q));
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border-2 border-[#FCE7F3] max-h-[92vh] flex flex-col">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-pink-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white flex items-center justify-center font-black shadow-md shadow-pink-300/40">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Nhập Danh Sách Học Sinh Thông Minh</span>
                {step === 'preview' && (
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
                    Xem trước ({draftStudents.length} học sinh)
                  </span>
                )}
              </h3>
              <p className="text-xs text-purple-800/80 font-medium mt-0.5">
                {step === 'input' 
                  ? 'Hỗ trợ dán tự do từ Word, Excel, Zalo hoặc tải tệp Excel/CSV với nhận diện tên tự động' 
                  : 'Kiểm tra, sửa thông tin, phát hiện trùng tên trước khi lưu vào lớp học'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-batch-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-pink-100 text-purple-400 hover:text-purple-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ERROR NOTIFICATION */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-rose-50 rounded-2xl border-2 border-rose-200 text-xs text-rose-900 font-bold flex items-center gap-2.5 animate-shake">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: INPUT SCREEN (Paste text or Upload Excel/CSV) */}
        {/* ======================================================== */}
        {step === 'input' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Input Method Switcher */}
            <div className="flex items-center gap-2 p-1 bg-pink-50/80 rounded-2xl border-2 border-pink-200">
              <button
                type="button"
                onClick={() => {
                  setInputTab('paste');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  inputTab === 'paste' ? 'candy-btn-purple text-white shadow-xs' : 'text-purple-900 hover:text-purple-950'
                }`}
              >
                <ClipboardPaste className="w-4 h-4 text-pink-300" />
                <span>Dán Danh Sách Tự Do (Word, Excel, Zalo)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputTab('excel');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
                  inputTab === 'excel' ? 'candy-btn-purple text-white shadow-xs' : 'text-purple-900 hover:text-purple-950'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
                <span>Tải Tệp Excel / CSV (.xlsx, .csv)</span>
              </button>
            </div>

            {/* TAB 1: PASTE FREELY */}
            {inputTab === 'paste' && (
              <div className="space-y-3.5">
                <div className="p-3.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-pink-200 text-xs space-y-2">
                  <div className="font-black text-purple-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-500" />
                    <span>Hệ thống tự động thông minh:</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-purple-950 font-medium">
                    <li className="flex items-center gap-1.5">
                      <span className="text-pink-500 font-bold">✓</span> Tự bỏ số thứ tự: <code className="bg-white/80 px-1 rounded text-purple-700">1.</code>, <code className="bg-white/80 px-1 rounded text-purple-700">01/</code>, <code className="bg-white/80 px-1 rounded text-purple-700">[1]</code>, <code className="bg-white/80 px-1 rounded text-purple-700">- </code>
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-pink-500 font-bold">✓</span> Tự loại bỏ khoảng trắng thừa
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-pink-500 font-bold">✓</span> Nhận diện Giới tính, Tổ, SĐT, Chức vụ
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-pink-500 font-bold">✓</span> Hỗ trợ copy nguyên bảng từ Excel/Sheets
                    </li>
                  </ul>
                </div>

                {/* Textarea */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    Dán nội dung danh sách học sinh vào đây:
                  </label>
                  <textarea
                    rows={9}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={`Ví dụ có thể dán theo bất kỳ kiểu nào:\n1. Nguyễn Hoàng Minh Khang (Nam - Tổ 1 - Lớp trưởng)\n2/ Trần Ngọc Bảo An - Nữ - Tổ 1 - 0912345678\n- Lê Tuấn Kiệt\n• Phạm Quỳnh Chi (Nữ)\n05. Vũ Đức Duy, Nam, Tổ 2`}
                    className="w-full p-4 bg-pink-50/40 border-2 border-pink-200 rounded-2xl text-xs font-mono text-slate-800 placeholder-purple-300 focus:outline-none focus:border-pink-400 focus:bg-white transition"
                  />
                </div>

                {/* Quick Paste Format Samples */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-500 font-bold text-[11px]">Mẫu gợi ý:</span>
                  <button
                    type="button"
                    onClick={() =>
                      setPastedText(
                        `1. Nguyễn Hoàng Minh Khang (Nam - Tổ 1 - Lớp trưởng)\n2. Trần Ngọc Bảo An (Nữ - Tổ 1 - 0912345678)\n3. Lê Tuấn Kiệt (Nam - Tổ 2)\n4. Phạm Quỳnh Chi (Nữ - Tổ 2)\n5. Vũ Đức Duy (Nam - Tổ 3)\n6. Đỗ Mai Phương (Nữ - Tổ 3 - Tổ trưởng Tổ 3)\n7. Hoàng Gia Huy (Nam - Tổ 4)\n8. Bùi Yến Nhi (Nữ - Tổ 4)`
                      )
                    }
                    className="px-2.5 py-1 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-bold border border-purple-200 transition"
                  >
                    Mẫu danh sách có STT & Tổ
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPastedText(
                        `Nguyễn Hoàng Minh Khang\nTrần Ngọc Bảo An\nLê Tuấn Kiệt\nPhạm Quỳnh Chi\nVũ Đức Duy\nĐỗ Mai Phương\nHoàng Gia Huy\nBùi Yến Nhi`
                      )
                    }
                    className="px-2.5 py-1 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 text-[11px] font-bold border border-pink-200 transition"
                  >
                    Mẫu chỉ có Họ và Tên
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: EXCEL / CSV UPLOAD */}
            {inputTab === 'excel' && (
              <div className="space-y-4 py-3">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-3 border-dashed border-pink-300 hover:border-pink-500 bg-pink-50/40 hover:bg-pink-50/70 rounded-3xl text-center space-y-3 transition cursor-pointer group"
                >
                  <div className="w-16 h-16 mx-auto rounded-3xl bg-white text-emerald-600 flex items-center justify-center font-black shadow-md border-2 border-emerald-100 group-hover:scale-105 transition">
                    <FileSpreadsheet className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800 group-hover:text-pink-600 transition">
                      Kéo thả hoặc bấm vào đây để chọn tệp Excel / CSV
                    </h4>
                    <p className="text-xs text-purple-700/80 font-medium mt-1">
                      Hỗ trợ tệp <strong>.xlsx, .xls, .csv</strong> từ VnEdu, SMAS, Google Sheets hoặc bảng tính tự tạo
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tự động nhận diện cột Họ & Tên hoặc ghép 2 cột (Họ đệm + Tên)</span>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                  <div className="font-bold text-slate-700">Các cột được hỗ trợ tự động:</div>
                  <p className="text-[11px]">
                    STT, Họ và tên (hoặc tách 2 cột Họ lót + Tên), Giới tính (Nam/Nữ), Tổ, Chức vụ, Số điện thoại phụ huynh, Ngày sinh, Điểm hoa ban đầu.
                  </p>
                </div>
              </div>
            )}

            {/* Input Action Bottom */}
            <div className="flex items-center justify-between pt-4 border-t-2 border-pink-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-2xl text-purple-900 hover:bg-pink-100 text-xs font-black transition cursor-pointer"
              >
                Hủy bỏ
              </button>

              {inputTab === 'paste' ? (
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-6 py-2.5 rounded-2xl candy-btn-purple text-white text-xs font-black shadow-md shadow-purple-300/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>Phân Tích & Xem Trước Danh Sách 🔍</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isProcessingFile}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 rounded-2xl candy-btn-purple text-white text-xs font-black shadow-md shadow-purple-300/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>{isProcessingFile ? 'Đang đọc tệp...' : 'Chọn Tệp Từ Máy 📂'}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: PREVIEW & INLINE EDITING SCREEN */}
        {/* ======================================================== */}
        {step === 'preview' && (
          <div className="flex-1 overflow-hidden flex flex-col space-y-3.5">
            {/* 1. Summary Bar & Controls */}
            <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 p-3.5 rounded-2xl border-2 border-pink-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-xl bg-purple-600 text-white font-black shadow-xs flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Tổng: {draftStudents.length} học sinh</span>
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 font-bold border border-blue-200">
                  👦 {totalBoys} Nam
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-pink-50 text-pink-700 font-bold border border-pink-200">
                  👧 {totalGirls} Nữ
                </span>

                {duplicateCount > 0 && (
                  <span className="px-2.5 py-1 rounded-xl bg-amber-100 text-amber-900 font-black border border-amber-300 flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Phát hiện {duplicateCount} trường hợp trùng tên</span>
                  </span>
                )}
              </div>

              {/* Quick Actions in Preview */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleEvenlyBalanceGroups}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-pink-100 text-purple-900 text-xs font-black border border-pink-200 shadow-2xs transition flex items-center gap-1 cursor-pointer"
                  title="Tự động chia đều các học sinh vào 4 Tổ (1, 2, 3, 4)"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-pink-500" />
                  <span className="hidden sm:inline">Chia đều 4 Tổ</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddDraftRow}
                  className="px-3 py-1.5 rounded-xl candy-btn-purple text-white text-xs font-black shadow-xs transition flex items-center gap-1 cursor-pointer"
                  title="Thêm một dòng học sinh mới vào bảng xem trước"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm dòng</span>
                </button>
              </div>
            </div>

            {/* 2. Search in Preview */}
            <div className="flex items-center justify-between gap-3 shrink-0">
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" />
                <input
                  type="text"
                  value={previewSearch}
                  onChange={(e) => setPreviewSearch(e.target.value)}
                  placeholder="Lọc nhanh trong bảng xem trước..."
                  className="w-full pl-8 pr-3 py-1.5 bg-pink-50/50 border border-pink-200 rounded-xl text-xs font-bold text-slate-800 placeholder-pink-300 focus:outline-none focus:border-pink-400"
                />
              </div>

              {/* Import Mode Selector */}
              <div className="flex items-center gap-3 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-xl border border-pink-200">
                <span className="text-purple-900 font-black">Cách thức lưu:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importMode"
                    value="append"
                    checked={importMode === 'append'}
                    onChange={() => setImportMode('append')}
                    className="text-purple-600 focus:ring-purple-400"
                  />
                  <span>Thêm vào lớp ({existingStudents.length} hs cũ)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-rose-700">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="text-rose-600 focus:ring-rose-400"
                  />
                  <span>Thay thế toàn bộ lớp</span>
                </label>
              </div>
            </div>

            {/* 3. Interactive Preview Table */}
            <div className="flex-1 overflow-y-auto border-2 border-pink-200 rounded-2xl bg-white shadow-inner">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-pink-100/90 backdrop-blur-xs text-purple-950 font-black z-10 border-b-2 border-pink-200">
                  <tr>
                    <th className="p-2.5 text-center w-12">STT</th>
                    <th className="p-2.5 min-w-[200px]">Họ và Tên Học Sinh (Có thể sửa)</th>
                    <th className="p-2.5 w-24 text-center">Giới tính</th>
                    <th className="p-2.5 w-24 text-center">Tổ</th>
                    <th className="p-2.5 min-w-[140px]">Chức vụ</th>
                    <th className="p-2.5 min-w-[120px]">SĐT Phụ huynh</th>
                    <th className="p-2.5 w-12 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-pink-100">
                  {filteredPreviewList.map((draft) => {
                    const isDup = draft.isDuplicateInImport || draft.isDuplicateInClass;
                    return (
                      <tr 
                        key={draft.id} 
                        className={`hover:bg-pink-50/50 transition ${isDup ? 'bg-amber-50/40' : ''}`}
                      >
                        {/* STT */}
                        <td className="p-2 text-center font-bold text-slate-500">
                          {draft.stt}
                        </td>

                        {/* Tên học sinh + Cảnh báo trùng */}
                        <td className="p-2">
                          <div className="space-y-1">
                            <input
                              type="text"
                              value={draft.name}
                              onChange={(e) => handleUpdateDraft(draft.id, 'name', e.target.value)}
                              className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-black text-slate-800 transition focus:outline-none ${
                                isDup
                                  ? 'border-amber-400 bg-amber-50 focus:border-amber-600'
                                  : 'border-pink-200 bg-pink-50/30 focus:border-pink-400 focus:bg-white'
                              }`}
                            />
                            {draft.isDuplicateInImport && (
                              <div className="text-[10px] text-amber-800 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>Trùng tên với học sinh khác trong danh sách nhập ({draft.duplicateCount} bạn)</span>
                              </div>
                            )}
                            {draft.isDuplicateInClass && !draft.isDuplicateInImport && (
                              <div className="text-[10px] text-rose-700 font-bold flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                                <span>Trùng tên với học sinh đã có sẵn trong lớp</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Giới tính */}
                        <td className="p-2 text-center">
                          <select
                            value={draft.gender}
                            onChange={(e) => handleUpdateDraft(draft.id, 'gender', e.target.value as Gender)}
                            className="px-2 py-1 bg-white border border-pink-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-400"
                          >
                            <option value="nam">👦 Nam</option>
                            <option value="nu">👧 Nữ</option>
                          </select>
                        </td>

                        {/* Tổ */}
                        <td className="p-2 text-center">
                          <select
                            value={draft.group}
                            onChange={(e) => handleUpdateDraft(draft.id, 'group', parseInt(e.target.value, 10) as 1 | 2 | 3 | 4)}
                            className="px-2 py-1 bg-white border border-pink-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-400"
                          >
                            <option value={1}>Tổ 1</option>
                            <option value={2}>Tổ 2</option>
                            <option value={3}>Tổ 3</option>
                            <option value={4}>Tổ 4</option>
                          </select>
                        </td>

                        {/* Chức vụ */}
                        <td className="p-2">
                          <select
                            value={draft.role}
                            onChange={(e) => handleUpdateDraft(draft.id, 'role', e.target.value as StudentRole)}
                            className="w-full px-2 py-1 bg-white border border-pink-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-pink-400"
                          >
                            {VALID_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* SĐT */}
                        <td className="p-2">
                          <input
                            type="text"
                            value={draft.parentPhone || ''}
                            onChange={(e) => handleUpdateDraft(draft.id, 'parentPhone', e.target.value)}
                            placeholder="SĐT phụ huynh"
                            className="w-full px-2 py-1 bg-pink-50/30 border border-pink-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-pink-400 focus:bg-white"
                          />
                        </td>

                        {/* Nút Xóa dòng */}
                        <td className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftRow(draft.id)}
                            className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                            title="Xóa bỏ học sinh này khỏi danh sách"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 4. Preview Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t-2 border-pink-100 shrink-0">
              <button
                type="button"
                onClick={handleResetModal}
                className="px-4 py-2.5 rounded-2xl text-purple-900 hover:bg-pink-100 text-xs font-black transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Nhập lại / Chọn tệp khác</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-2xl text-slate-600 hover:bg-slate-100 text-xs font-black transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  className="px-6 py-2.5 rounded-2xl candy-btn-purple text-white text-xs font-black shadow-md shadow-purple-300/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác Nhận Lưu Vào Lớp ({draftStudents.length} học sinh) ✨</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
