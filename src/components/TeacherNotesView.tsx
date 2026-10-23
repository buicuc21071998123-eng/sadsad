import React, { useState } from 'react';
import { TeacherNote, Student, ClassConfig } from '../types';
import { sound } from '../utils/soundEffects';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  Trash2, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  MessageSquare, 
  Calendar, 
  BookOpen, 
  AlertCircle,
  X
} from 'lucide-react';

interface TeacherNotesViewProps {
  notes: TeacherNote[];
  students: Student[];
  config: ClassConfig;
  onAddNote: (note: TeacherNote) => void;
  onToggleNote: (noteId: string) => void;
  onDeleteNote: (noteId: string) => void;
}

export const TeacherNotesView: React.FC<TeacherNotesViewProps> = ({
  notes,
  students,
  config,
  onAddNote,
  onToggleNote,
  onDeleteNote,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'todo' | 'parent' | 'school' | 'lesson'>('todo');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDueDate, setNewDueDate] = useState('');

  // Zalo Message Generator State
  const [msgType, setMsgType] = useState<'praise' | 'absence' | 'homework' | 'meeting'>('praise');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || '');
  const [customMsgDetails, setCustomMsgDetails] = useState('');
  const [copiedMsg, setCopiedMsg] = useState(false);

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const note: TeacherNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      priority: newPriority,
      isDone: false,
      createdAt: Date.now(),
      dueDate: newDueDate || undefined,
    };

    onAddNote(note);
    sound.playClick();
    setShowAddModal(false);

    setNewTitle('');
    setNewContent('');
    setNewDueDate('');
  };

  // Generate Message Content
  const generateMessageText = () => {
    const studentName = selectedStudent ? selectedStudent.name : 'em học sinh';
    const flowerCount = selectedStudent ? selectedStudent.flowerPoints : 0;
    const parentPhone = selectedStudent?.parentPhone ? ` (${selectedStudent.parentPhone})` : '';

    if (msgType === 'praise') {
      return `🌸 [LỜI KHEN TỪ CÔ CHỦ NHIỆM - ${config.className}]\n\nKính gửi Quý phụ huynh em ${studentName}${parentPhone},\n\nCô Bùi Thị Cúc rất vui mừng thông báo trong tuần qua em ${studentName} đã học tập rất tích cực, đạt được ${flowerCount} bông hoa thành tích xuất sắc trong Vườn Ươm Tri Thức của lớp! 🌟\n\nEm luôn lễ phép, hăng hái phát biểu và giúp đỡ bạn bè xung quanh. Kính mong gia đình tiếp tục động viên để em phát huy tinh thần tuyệt vời này nhé ạ!\n\nTrân trọng,\n${config.teacherRole}: ${config.teacherName}`;
    }

    if (msgType === 'absence') {
      return `📢 [THÔNG BÁO TỪ GIÁO VIÊN CHỦ NHIỆM - ${config.className}]\n\nKính gửi Quý phụ huynh em ${studentName},\n\nHôm nay trong giờ điểm danh đầu giờ, cô giáo thấy em ${studentName} chưa có mặt ở lớp. Kính mong phụ huynh xác nhận lại tình hình của em giúp cô giáo để đảm bảo an toàn cho học sinh nhé ạ.\n\nNếu em bị ốm hoặc có việc gia đình, phụ huynh vui lòng nhắn tin xin phép cô qua Zalo nhé ạ.\n\nTrân trọng,\n${config.teacherRole}: ${config.teacherName}`;
    }

    if (msgType === 'homework') {
      return `📝 [NHẮC NHỞ HỌC TẬP - ${config.className}]\n\nKính gửi Quý phụ huynh em ${studentName},\n\nNhằm giúp em củng cố kiến thức thật tốt, cô giáo gửi lời nhắc phụ huynh nhắc nhở em hoàn thành bài tập về nhà và chuẩn bị đầy đủ sách vở, dụng cụ học tập trước khi đến lớp.\n\n${customMsgDetails ? `Lưu ý thêm từ cô: ${customMsgDetails}\n\n` : ''}Chúc em và gia đình một buổi tối thật vui vẻ và ấm áp!\n\nTrân trọng,\n${config.teacherRole}: ${config.teacherName}`;
    }

    if (msgType === 'meeting') {
      return `🏫 [THƯ MỜI HỌP PHỤ HUYNH - ${config.className}]\n\nKính gửi Quý phụ huynh em ${studentName},\n\nTrân trọng kính mời Quý phụ huynh đến tham dự buổi Họp Phụ Huynh định kỳ của Lớp 4A2 - Vườn Ươm Tri Thức nhằm tổng kết tình hình thi đua, học tập của các em học sinh.\n\n${customMsgDetails ? `Thời gian & địa điểm: ${customMsgDetails}\n\n` : 'Thời gian: 08h00 sáng Chủ Nhật tại Phòng học Lớp 4A2.\n\n'}Sự có mặt đầy đủ của Quý phụ huynh là nguồn động viên to lớn đối với cô trò Lớp 4A2.\n\nTrân trọng,\n${config.teacherRole}: ${config.teacherName}`;
    }

    return '';
  };

  const handleCopyMessage = () => {
    const text = generateMessageText();
    navigator.clipboard.writeText(text).then(() => {
      sound.playReward();
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 3000);
    });
  };

  return (
    <div id="teacher-notes-section" className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Teacher To-Do & Reminders */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Sổ Tay Công Việc Chủ Nhiệm
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lên kế hoạch sinh hoạt lớp, sổ liên lạc và công tác tuần
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Việc mới</span>
                </button>
              </div>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                      note.isDone
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => {
                          onToggleNote(note.id);
                          sound.playClick();
                        }}
                        className="mt-0.5 text-slate-400 hover:text-emerald-600 shrink-0"
                      >
                        {note.isDone ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>

                      <div>
                        <div
                          className={`font-bold text-xs sm:text-sm text-slate-800 ${
                            note.isDone ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {note.title}
                        </div>
                        {note.content && (
                          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                            {note.content}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              note.priority === 'high'
                                ? 'bg-rose-100 text-rose-700'
                                : note.priority === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {note.priority === 'high'
                              ? 'Gấp'
                              : note.priority === 'medium'
                              ? 'Bình thường'
                              : 'Thong thả'}
                          </span>

                          {note.dueDate && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {note.dueDate}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onDeleteNote(note.id);
                        sound.playClick();
                      }}
                      className="p-1 text-slate-300 hover:text-rose-600 rounded-lg transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Parent Zalo Message Generator */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Soạn Tin Nhắn Zalo / SMS Phụ Huynh Nhanh
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mẫu tin nhắn chuẩn mực, thân thiện gửi phụ huynh chỉ với 1 click
                  </p>
                </div>
              </div>

              {/* Message Type Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-4">
                {[
                  { id: 'praise', label: '🌸 Khen ngợi' },
                  { id: 'absence', label: '⏰ Vắng học' },
                  { id: 'homework', label: '📝 Bài tập' },
                  { id: 'meeting', label: '🏫 Họp PH' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setMsgType(t.id as any)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center ${
                      msgType === t.id
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Student Picker for message */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chọn học sinh:</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-xs"
                  >
                    {students.map((st) => (
                      <option key={st.id} value={st.id}>
                        #{st.stt} - {st.name} ({st.flowerPoints} hoa)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú bổ sung (nếu có):</label>
                  <input
                    type="text"
                    value={customMsgDetails}
                    onChange={(e) => setCustomMsgDetails(e.target.value)}
                    placeholder="Ví dụ: Mang theo màu sáp, nộp trước 17h..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              {/* Message Preview Box */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 text-xs">Nội dung tin nhắn xem trước:</label>
                <div className="p-4 rounded-2xl bg-slate-900 text-emerald-300 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto border border-slate-800 shadow-inner">
                  {generateMessageText()}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={handleCopyMessage}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 ${
                  copiedMsg
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                }`}
              >
                {copiedMsg ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Đã sao chép tin nhắn Zalo!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Sao chép gửi Zalo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Add Note */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Thêm việc cần làm mới
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Tiêu đề công việc:</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Kiểm tra bài tập toán 15 phút..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Chi tiết / Ghi chú:</label>
                <textarea
                  rows={3}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Ghi rõ việc cần chuẩn bị..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ ưu tiên:</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="high">Ưu tiên Gấp</option>
                    <option value="medium">Bình thường</option>
                    <option value="low">Thong thả</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hạn hoàn thành:</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  Thêm công việc
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
