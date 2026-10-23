import React, { useState, useRef } from 'react';
import { compressTeacherAvatar } from '../utils/imageUtils';
import { sound } from '../utils/soundEffects';
import { 
  Camera, 
  Upload, 
  Trash2, 
  RotateCcw, 
  Check, 
  X, 
  Sparkles, 
  Image as ImageIcon,
  Heart,
  Flower2,
  AlertCircle
} from 'lucide-react';

interface TeacherAvatarModalProps {
  isOpen: boolean;
  currentAvatarUrl?: string;
  teacherName: string;
  teacherRole: string;
  onClose: () => void;
  onSaveAvatar: (newAvatarUrl?: string) => void;
}

export const TeacherAvatarModal: React.FC<TeacherAvatarModalProps> = ({
  isOpen,
  currentAvatarUrl,
  teacherName,
  teacherRole,
  onClose,
  onSaveAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    setErrorMessage(null);
    // Validate format: JPG, JPEG, PNG, WebP
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpe?g|png|webp)$/i)) {
      setErrorMessage('Định dạng ảnh không hợp lệ. Vui lòng chọn tệp JPG, JPEG, PNG hoặc WebP.');
      return;
    }

    try {
      setIsProcessing(true);
      // Compress and resize image to ~500px, quality 0.88
      const compressed = await compressTeacherAvatar(file);
      setPreviewUrl(compressed);
      sound.playReward();
    } catch (err) {
      console.error('Error compressing teacher image:', err);
      setErrorMessage('Không thể xử lý ảnh này. Vui lòng thử một ảnh khác.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmSave = () => {
    if (previewUrl) {
      onSaveAvatar(previewUrl);
      sound.playReward();
      onClose();
    }
  };

  const handleRemoveAvatar = () => {
    if (window.confirm('Thầy cô có chắc muốn xóa ảnh đại diện này không?')) {
      onSaveAvatar(undefined);
      setPreviewUrl(null);
      sound.playClick();
      onClose();
    }
  };

  const handleResetToDefault = () => {
    onSaveAvatar(undefined);
    setPreviewUrl(null);
    sound.playClick();
    onClose();
  };

  const activeDisplayImage = previewUrl || currentAvatarUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border-2 border-pink-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F472B6] text-white p-4 sm:p-5 flex items-center justify-between border-b-2 border-white/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-xs">
              <Camera className="w-5 h-5 text-yellow-200" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white tracking-wide flex items-center gap-1.5">
                <span>Ảnh Đại Diện Giáo Viên</span>
                <span className="text-xs">🌸</span>
              </h3>
              <p className="text-[11px] text-pink-100 font-medium">
                Tải ảnh chân dung rõ nét, không méo hình, tự động nén nhẹ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95 cursor-pointer"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Main Visual Display Frame (Responsive 120-150px) */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative group">
              {/* Outer Decorative Glow Ring */}
              <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-tr from-[#A855F7] via-[#EC4899] to-[#FACC15] shadow-xl shadow-pink-300/40">
                <div className="w-full h-full rounded-full overflow-hidden bg-white border-3 border-white relative shadow-inner">
                  {activeDisplayImage ? (
                    <img
                      src={activeDisplayImage}
                      alt={teacherName || 'Giáo viên'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-b from-pink-100 via-purple-50 to-pink-50 flex flex-col items-center justify-center p-2 text-center">
                      <span className="text-4xl mb-1">👩‍🏫</span>
                      <span className="text-[10px] font-black text-purple-700 leading-tight">
                        Chưa có ảnh
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Decorative Flower/Star Badges */}
              <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 border-2 border-white shadow-md flex items-center justify-center text-xs animate-bounce" style={{ animationDuration: '3s' }}>
                ⭐
              </div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 rounded-full bg-gradient-to-tr from-pink-400 to-rose-400 border-2 border-white shadow-md flex items-center justify-center text-xs">
                🌸
              </div>
            </div>

            <div>
              <h4 className="text-sm sm:text-base font-black text-slate-800 flex items-center justify-center gap-1.5">
                <span>{teacherName || 'Cô Bùi Thị Cúc'}</span>
              </h4>
              <p className="text-xs text-purple-600 font-bold">
                {teacherRole || 'Giáo viên chủ nhiệm'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop or Select Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
              dragActive
                ? 'border-purple-500 bg-purple-50/80 scale-[1.01]'
                : 'border-pink-200 bg-pink-50/40 hover:bg-pink-50 hover:border-pink-300'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={handleInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-white text-purple-600 flex items-center justify-center shadow-xs border border-pink-200">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-slate-800">
                  {isProcessing ? 'Đang xử lý ảnh...' : 'Nhấp hoặc kéo thả ảnh vào đây'}
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Hỗ trợ định dạng: <strong>JPG, JPEG, PNG, WebP</strong>
                </p>
              </div>
              <button
                type="button"
                className="mt-1 px-4 py-2 rounded-2xl bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-xs font-black shadow-sm hover:shadow-md transition active:scale-95"
              >
                📷 TẢI ẢNH GIÁO VIÊN
              </button>
            </div>
          </div>

          {/* If Preview is available: Show Confirmation Bar */}
          {previewUrl && (
            <div className="p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ảnh xem trước đã sẵn sàng! Thầy cô vui lòng xác nhận để lưu.</span>
              </div>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Xác nhận & Lưu ảnh</span>
              </button>
            </div>
          )}

          {/* Quick Actions & Reset */}
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {currentAvatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa ảnh</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetToDefault}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục mặc định</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
