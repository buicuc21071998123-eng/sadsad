import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Student, ClassConfig, PointCategory } from '../types';
import { sound } from '../utils/soundEffects';
import { fireSuperConfetti, getStudentInitials } from '../utils/helpers';
import {
  Trophy,
  Sparkles,
  RefreshCw,
  Zap,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Users,
  Award,
  Crown,
  Medal,
  CheckCircle2,
  X,
  Shuffle,
  Maximize2,
  Minimize2,
  Check,
  History,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export type FilterMode = 'all' | 'custom' | 'uncalled_only' | 'random_5' | 'random_10' | 'random_15';

interface WheelOfFortuneGameProps {
  students: Student[]; // Filtered active pool
  allClassStudents: Student[];
  config?: ClassConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectWinner: (student: Student, title: string, subtitle: string, icon: string) => void;
  onAwardBonusPoints?: (student: Student, points: number) => void;
  onExcludeStudent?: (studentId: string) => void;
  sessionCalledIds: string[];
  onResetCalledList: () => void;
  onMarkCalled: (studentId: string) => void;
}

// Cheerful distinct colors for adjacent slices
const WHEEL_COLORS = [
  { bg: '#F472B6', text: '#FFFFFF', darkText: '#831843' }, // Pink
  { bg: '#FBBF24', text: '#451A03', darkText: '#78350F' }, // Amber/Yellow
  { bg: '#38BDF8', text: '#FFFFFF', darkText: '#0C4A6E' }, // Sky Blue
  { bg: '#4ADE80', text: '#064E3B', darkText: '#064E3B' }, // Emerald
  { bg: '#C084FC', text: '#FFFFFF', darkText: '#581C87' }, // Purple
  { bg: '#FB923C', text: '#FFFFFF', darkText: '#7C2D12' }, // Orange
  { bg: '#2DD4BF', text: '#042F2E', darkText: '#134E4A' }, // Teal
  { bg: '#FB7185', text: '#FFFFFF', darkText: '#881337' }, // Rose
  { bg: '#A78BFA', text: '#FFFFFF', darkText: '#3B0764' }, // Lavender
  { bg: '#FACC15', text: '#422006', darkText: '#713F12' }, // Gold
  { bg: '#34D399', text: '#064E3B', darkText: '#064E3B' }, // Mint
  { bg: '#818CF8', text: '#FFFFFF', darkText: '#1E1B4B' }, // Indigo
  { bg: '#F43F5E', text: '#FFFFFF', darkText: '#881337' }, // Crimson
  { bg: '#60A5FA', text: '#FFFFFF', darkText: '#172554' }, // Blue
];

export const WheelOfFortuneGame: React.FC<WheelOfFortuneGameProps> = ({
  students,
  allClassStudents,
  config,
  soundEnabled,
  onToggleSound,
  onSelectWinner,
  onAwardBonusPoints,
  onExcludeStudent,
  sessionCalledIds,
  onResetCalledList,
  onMarkCalled,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  // Rotation and Animation State
  const [currentRotation, setCurrentRotation] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winner, setWinner] = useState<Student | null>(null);
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Animation frame reference
  const animFrameRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const pointerRecoilRef = useRef<number>(0); // Visual peg deflection for the pointer
  const rotationRef = useRef<number>(0); // Sync ref for animation loop

  // Keep rotation in sync
  useEffect(() => {
    rotationRef.current = currentRotation;
  }, [currentRotation]);

  // Handle Fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {
        setIsFullscreen(!isFullscreen);
      });
    } else {
      document.exitFullscreen?.().catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  // Compute colors for all students ensuring no two adjacent slices share same color
  const sliceColors = useMemo(() => {
    const total = students.length;
    if (total === 0) return [];
    return students.map((_, idx) => {
      let colorIndex = idx % WHEEL_COLORS.length;
      // If last slice has same color as first slice (when total is odd)
      if (idx === total - 1 && colorIndex === 0 && total > 1) {
        colorIndex = (colorIndex + 1) % WHEEL_COLORS.length;
      }
      return WHEEL_COLORS[colorIndex];
    });
  }, [students]);

  // Format student name to be crisp and easily readable on wheel slice
  const getSliceDisplayName = (name: string, total: number) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0];
    
    // For many students, show first initial + last 2 words or last 2 words
    if (total > 28) {
      if (parts.length >= 3) {
        return `${parts.slice(-2).join(' ')}`;
      }
      return name;
    }
    
    if (total > 16) {
      if (parts.length > 2) {
        return `${parts.slice(-2).join(' ')}`;
      }
    }
    return name;
  };

  // Draw the entire wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const logicalWidth = canvas.width / dpr;
    const logicalHeight = canvas.height / dpr;
    const size = Math.min(logicalWidth, logicalHeight);
    const center = size / 2;
    // Generous outer padding ensures golden rim, pegs, drop shadows and pointer NEVER crop
    const outerRadius = Math.max(80, center - 34);
    const innerRadius = Math.max(30, outerRadius * 0.18);
    const total = students.length;

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    // If no students
    if (total === 0) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(center, center, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#F1F5F9';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#CBD5E1';
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 15px Nunito, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Chưa có học sinh trong danh sách', center, center);
      ctx.restore();
      ctx.restore();
      return;
    }

    const arc = (Math.PI * 2) / total;
    const rotation = rotationRef.current;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotation);

    // 1. Draw Outer Golden Ring with Drop Shadow
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius + 8, 0, Math.PI * 2);
    ctx.fillStyle = '#F59E0B';
    ctx.fill();

    const ringGrad = ctx.createLinearGradient(-outerRadius, -outerRadius, outerRadius, outerRadius);
    ringGrad.addColorStop(0, '#FDE047');
    ringGrad.addColorStop(0.3, '#F59E0B');
    ringGrad.addColorStop(0.7, '#D97706');
    ringGrad.addColorStop(1, '#FEF08A');
    ctx.strokeStyle = ringGrad;
    ctx.lineWidth = 10;
    ctx.stroke();
    ctx.restore();

    // 2. Draw Slices
    for (let i = 0; i < total; i++) {
      const student = students[i];
      const startAngle = i * arc;
      const endAngle = (i + 1) * arc;
      const theme = sliceColors[i] || WHEEL_COLORS[i % WHEEL_COLORS.length];

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, outerRadius, startAngle, endAngle);
      ctx.closePath();

      // Slice background
      ctx.fillStyle = theme.bg;
      ctx.fill();

      // Subtle slice bevel/border
      ctx.lineWidth = total > 30 ? 1 : 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.stroke();

      // Draw Slice Text
      ctx.save();
      ctx.rotate(startAngle + arc / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Dynamic Font Scaling based on number of students & radius
      let fontSize = 17;
      if (total <= 6) fontSize = 20;
      else if (total <= 12) fontSize = 17;
      else if (total <= 20) fontSize = 14;
      else if (total <= 30) fontSize = 13;
      else if (total <= 42) fontSize = 12;
      else fontSize = 11;

      ctx.font = `bold ${fontSize}px Nunito, Inter, sans-serif`;

      // Text Shadow for high contrast
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 3;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;

      ctx.fillStyle = theme.text;

      const displayName = getSliceDisplayName(student.name, total);
      const textX = outerRadius - 12;

      // Draw STT + Name
      const labelText = total <= 24 ? `#${student.stt} ${displayName}` : `${student.stt}. ${displayName}`;
      ctx.fillText(labelText, textX, 0);

      ctx.restore();
      ctx.restore();
    }

    // 3. Draw Perimeter Light Bulbs / Golden Pegs
    for (let i = 0; i < total; i++) {
      const pegAngle = i * arc;
      const pegX = Math.cos(pegAngle) * (outerRadius + 3);
      const pegY = Math.sin(pegAngle) * (outerRadius + 3);

      ctx.save();
      ctx.beginPath();
      ctx.arc(pegX, pegY, total > 25 ? 2.5 : 4, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#FFFFFF' : '#FEF08A';
      ctx.shadowColor = '#FBBF24';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#B45309';
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Center Golden Hub Ring
    ctx.beginPath();
    ctx.arc(0, 0, innerRadius + 4, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();

    ctx.restore(); // Restore center translate & wheel rotation

    // 5. Draw Top Static Arrow Pointer (Kim Chỉ) pointing at 12 o'clock
    ctx.save();
    ctx.translate(center, center);

    const pointerDist = outerRadius + 6;
    const recoil = pointerRecoilRef.current;

    ctx.save();
    ctx.translate(0, -pointerDist);
    ctx.rotate(recoil); // Slight deflection as pegs pass

    ctx.beginPath();
    ctx.moveTo(0, 16); // Tip points down into the wheel slice
    ctx.lineTo(-12, -12);
    ctx.lineTo(12, -12);
    ctx.closePath();

    // Red-Crimson gradient pointer
    const ptrGrad = ctx.createLinearGradient(-12, -12, 12, 16);
    ptrGrad.addColorStop(0, '#FB7185');
    ptrGrad.addColorStop(0.5, '#E11D48');
    ptrGrad.addColorStop(1, '#BE123C');
    ctx.fillStyle = ptrGrad;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 2;
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Pointer Center Golden Pin
    ctx.beginPath();
    ctx.arc(0, -6, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FDE047';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#991B1B';
    ctx.stroke();

    ctx.restore();
    ctx.restore();

    ctx.restore(); // Restore canvas scaling and initial state
  }, [students, sliceColors]);

  // Adjust canvas resolution for retina displays and redraw automatically on resize
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const handleResize = () => {
      if (!stage || !canvas) return;
      const rect = stage.getBoundingClientRect();
      const rawSize = Math.min(rect.width, rect.height);
      const displaySize = Math.max(220, Math.floor(rawSize));
      const dpr = window.devicePixelRatio || 1;

      const targetW = Math.floor(displaySize * dpr);
      const targetH = Math.floor(displaySize * dpr);

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
      drawWheel();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    resizeObserver.observe(stage);
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [students, isFullscreen, drawWheel]);

  // Redraw when rotation changes
  useEffect(() => {
    drawWheel();
  }, [currentRotation, drawWheel]);

  // SPIN THE WHEEL HANDLER
  const handleSpin = () => {
    if (isSpinning || students.length === 0) return;

    setIsSpinning(true);
    setShowWinnerModal(false);
    setWinner(null);

    if (soundEnabled) {
      sound.playClick();
    }

    const total = students.length;
    const arc = (Math.PI * 2) / total;

    // Pick uniform random winner from available pool
    const chosenIndex = Math.floor(Math.random() * total);
    const chosenStudent = students[chosenIndex];

    // Pointer is located at top (12 o'clock = angle 3*PI/2 or -PI/2 in canvas radians).
    // Slices are drawn starting from angle 0 rotated by `rotation`.
    // Center of slice `i` is at `rotation + (i + 0.5) * arc`.
    // We want `(rotation + (chosenIndex + 0.5) * arc) % (2 * PI) = 3 * PI / 2`
    // => `targetAngle % (2 * PI) = 3 * PI / 2 - (chosenIndex + 0.5) * arc`
    const targetSliceCenter = 1.5 * Math.PI - (chosenIndex + 0.5) * arc;

    // Add a tiny random offset within the center 50% of the slice for organic feel
    const randomJitter = (Math.random() - 0.5) * arc * 0.45;
    const targetRemainder = ((targetSliceCenter + randomJitter) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);

    const startRot = rotationRef.current;
    const currentRemainder = ((startRot % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);

    // Spin 6 to 9 full revolutions + remainder adjustment
    const fullSpins = 6 + Math.floor(Math.random() * 3);
    let delta = targetRemainder - currentRemainder;
    if (delta < 0) delta += Math.PI * 2;
    const totalRotationDelta = fullSpins * Math.PI * 2 + delta;

    const startTime = performance.now();
    const duration = 4600 + Math.random() * 800; // 4.6s - 5.4s duration

    let lastPegIndex = -1;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);

      // Smooth Quintic / Quartic ease-out deceleration
      // Easing: fast start -> suspenseful slowdown -> smooth natural stop
      const easeOut = 1 - Math.pow(1 - progress, 3.8);
      const newRotation = startRot + totalRotationDelta * easeOut;

      rotationRef.current = newRotation;
      setCurrentRotation(newRotation);

      // Calculate which peg is currently crossing the top pointer
      // Top pointer is at 1.5 * Math.PI
      const normalizedAngle = ((1.5 * Math.PI - newRotation) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
      const currentPeg = Math.floor(normalizedAngle / arc);

      if (currentPeg !== lastPegIndex) {
        lastPegIndex = currentPeg;

        // Pointer recoil effect
        pointerRecoilRef.current = -0.22;

        // Sound tick
        if (soundEnabled && now - lastTickTimeRef.current > 40) {
          lastTickTimeRef.current = now;
          const speedRatio = 1 - progress;
          sound.playWheelTick(0.8 + speedRatio * 0.4);
        }
      } else {
        // Spring recoil back to 0
        pointerRecoilRef.current *= 0.82;
      }

      // Near end of spin (progress > 0.8), trigger subtle suspense tone once
      if (progress > 0.82 && progress < 0.86 && soundEnabled) {
        sound.playWheelSuspense();
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animateSpin);
      } else {
        // FINISHED SPINNING
        pointerRecoilRef.current = 0;
        setIsSpinning(false);
        setWinner(chosenStudent);

        // Fire Celebration Effects
        fireSuperConfetti();
        if (soundEnabled) {
          sound.playWheelWin();
        }

        setTimeout(() => {
          setShowWinnerModal(true);
        }, 350);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateSpin);
  };

  // Called statistics
  const totalCount = allClassStudents.length;
  const activeCount = students.length;
  const calledCount = sessionCalledIds.length;
  const remainingCount = Math.max(0, totalCount - calledCount);

  // Check if student is in called list
  const isStudentCalled = (id: string) => sessionCalledIds.includes(id);

  return (
    <div
      ref={containerRef}
      id="wheel-of-fortune-root"
      className={`rounded-3xl transition-all duration-300 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-gradient-to-br from-pink-50 via-purple-50 to-sky-50 p-4 sm:p-8 overflow-y-auto flex flex-col justify-between'
          : 'bg-white/95 backdrop-blur-md p-5 sm:p-7 border-2 border-pink-200 shadow-xl shadow-pink-100/50 space-y-6'
      }`}
    >
      {/* 1. HEADER BAR & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-pink-100">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-400 via-rose-400 to-amber-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-pink-300/40 border-2 border-white animate-spin-slow">
            🎡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl text-slate-800 tracking-tight">
                Vòng Quay Gọi Tên
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[11px] font-black border border-pink-300 shadow-xs">
                {activeCount} ô quay
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Quay một vòng – Chọn một bạn – Cả lớp cùng hồi hộp! 🌟🎯
            </p>
          </div>
        </div>

        {/* Action Controls: Sound, Fullscreen, Reset */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Stats Badges */}
          <div className="flex items-center gap-1.5 bg-pink-50/80 px-3 py-1.5 rounded-2xl border border-pink-200 text-xs font-black text-pink-950">
            <Users className="w-3.5 h-3.5 text-pink-600" />
            <span>Tham gia: <strong className="text-pink-700">{activeCount}</strong></span>
            <span className="text-pink-300">|</span>
            <span className="text-emerald-700">Đã gọi: <strong>{calledCount}</strong></span>
            <span className="text-pink-300">|</span>
            <span className="text-amber-700">Còn lại: <strong>{remainingCount}</strong></span>
          </div>

          {/* Sound Toggle Button */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2.5 text-slate-600 hover:text-pink-700 hover:bg-pink-100 rounded-2xl transition cursor-pointer border border-pink-200 shadow-xs bg-white"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-pink-600 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình trình chiếu'}
            className="px-3.5 py-2 text-slate-700 hover:text-purple-900 hover:bg-purple-100 rounded-2xl transition cursor-pointer border border-purple-200 shadow-xs bg-white text-xs font-black flex items-center gap-1.5"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-purple-700" />
                <span>Thu nhỏ</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-purple-700" />
                <span>⛶ Toàn màn hình</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. MAIN ARENA & WHEEL CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
        {/* Left / Center: The Big Interactive Wheel (60-65% width on desktop) */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-center justify-center relative py-1 px-1 sm:px-2 w-full">
          {/* Decorative Magic Star Accents */}
          <div className="absolute top-1 left-4 text-xl sm:text-2xl animate-bounce opacity-60 pointer-events-none select-none">⭐</div>
          <div className="absolute bottom-2 right-6 text-xl sm:text-2xl animate-pulse opacity-60 pointer-events-none select-none">✨</div>
          <div className="absolute top-1/3 left-1 text-lg sm:text-xl opacity-40 pointer-events-none select-none">💖</div>
          <div className="absolute top-8 right-2 text-xl opacity-50 pointer-events-none select-none">🎈</div>

          {/* Wheel Stage Wrapper - uses aspect-square & min(...) constraints so it is NEVER cropped or oversized */}
          <div
            ref={stageRef}
            className="relative w-full max-w-[min(100%,460px,52vh)] aspect-square flex items-center justify-center p-1"
          >
            {/* Ambient Background Radial Glow */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-pink-300/30 via-yellow-200/30 to-purple-300/30 blur-2xl pointer-events-none" />

            {/* Canvas Wheel Rendering */}
            <canvas
              ref={canvasRef}
              className="w-full h-full drop-shadow-xl transition-transform duration-100 cursor-pointer select-none block"
              onClick={handleSpin}
              title="Nhấn vào vòng quay hoặc nút QUAY ở giữa để quay!"
            />

            {/* Center Golden Spin Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
              <button
                type="button"
                disabled={isSpinning || students.length === 0}
                onClick={handleSpin}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer select-none ${
                  isSpinning
                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-purple-950 scale-95 shadow-inner'
                    : students.length === 0
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'candy-btn-gold text-purple-950 shadow-2xl hover:scale-105 active:scale-95 border-3 sm:border-4 border-white'
                }`}
                style={{
                  boxShadow: isSpinning
                    ? '0 0 20px rgba(251, 191, 36, 0.8)'
                    : '0 6px 20px rgba(217, 119, 6, 0.45)',
                }}
              >
                <span className="text-lg sm:text-xl animate-spin-slow">🎡</span>
                <span className="font-black text-[11px] sm:text-xs tracking-tight leading-none mt-0.5">
                  {isSpinning ? 'ĐANG QUAY' : 'QUAY'}
                </span>
                <span className="text-[8px] sm:text-[9px] font-bold opacity-80 uppercase tracking-tighter">
                  {isSpinning ? '...' : 'NGAY'}
                </span>
              </button>
            </div>
          </div>

          {/* Quick Spin Trigger Bar underneath - always fully visible, never clipped */}
          <div className="mt-3 flex items-center justify-center w-full">
            <button
              type="button"
              disabled={isSpinning || students.length === 0}
              onClick={handleSpin}
              className="candy-btn-pink text-white px-7 sm:px-9 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm md:text-base flex items-center gap-2 shadow-lg shadow-pink-300/40 cursor-pointer active:scale-95 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
              <span>🎡 QUAY GỌI TÊN NGAY!</span>
            </button>
          </div>

          {/* If 0 students available (e.g. all called) */}
          {students.length === 0 && (
            <div className="mt-3 bg-amber-50 border-2 border-amber-300 text-amber-900 p-3.5 rounded-2xl text-center space-y-2 max-w-md animate-in zoom-in-95">
              <div className="text-2xl">🎉</div>
              <h4 className="font-black text-sm">Tất cả học sinh đã được gọi!</h4>
              <p className="text-xs text-slate-600 font-bold">
                Bạn đã hoàn thành vòng quay cho toàn bộ học sinh. Nhấn nút bên dưới để bắt đầu vòng mới.
              </p>
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onResetCalledList();
                }}
                className="candy-btn-gold text-purple-950 px-4 py-2 rounded-xl text-xs font-black cursor-pointer shadow-xs inline-flex items-center gap-1.5 mt-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bắt đầu vòng mới</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Realtime Active Student List & Called History Drawer (35-40% width on desktop) */}
        <div className="lg:col-span-5 xl:col-span-5 space-y-3.5 w-full">
          {/* Box 1: Danh sách học sinh trên vòng quay */}
          <div className="bg-gradient-to-b from-pink-50/90 via-purple-50/60 to-white rounded-3xl p-3.5 sm:p-4 border-2 border-pink-200 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-base">🎯</span>
                <h4 className="font-black text-xs sm:text-sm text-slate-800 uppercase tracking-wide">
                  HỌC SINH TRÊN VÒNG ({students.length})
                </h4>
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-pink-700 bg-white px-2.5 py-0.5 rounded-full border border-pink-200">
                100% ngẫu nhiên
              </span>
            </div>

            {/* Scrollable list of students currently on wheel */}
            <div className="max-h-44 sm:max-h-52 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-pink-200">
              {students.map((st, idx) => {
                const colorTheme = sliceColors[idx] || WHEEL_COLORS[idx % WHEEL_COLORS.length];
                return (
                  <div
                    key={st.id}
                    className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-white border border-pink-100 hover:border-pink-300 transition shadow-2xs text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 border border-black/10"
                        style={{ backgroundColor: colorTheme.bg }}
                      />
                      <span className="font-black text-slate-700 shrink-0">#{st.stt}</span>
                      <span className="font-bold text-slate-800 truncate">{st.name}</span>
                    </div>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-bold shrink-0">
                      Tổ {st.group}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Box 2: Danh sách học sinh đã được gọi */}
          <div className="bg-white rounded-3xl p-3.5 sm:p-4 border-2 border-slate-200 shadow-md space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-emerald-600" />
                <h4 className="font-black text-xs sm:text-sm text-slate-800 uppercase tracking-wide">
                  ĐÃ ĐƯỢC GỌI ({calledCount})
                </h4>
              </div>

              {calledCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onResetCalledList();
                  }}
                  className="text-[11px] font-black text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-xl border border-rose-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Đặt lại</span>
                </button>
              )}
            </div>

            {calledCount === 0 ? (
              <div className="text-center py-5 text-slate-400 space-y-1">
                <div className="text-2xl">⏳</div>
                <p className="text-xs font-bold">Chưa có bạn nào được gọi</p>
                <p className="text-[11px] text-slate-400">Hãy nhấn "QUAY" để bắt đầu lượt đầu tiên!</p>
              </div>
            ) : (
              <div className="max-h-36 sm:max-h-44 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-emerald-200">
                {sessionCalledIds.map((calledId, idx) => {
                  const st = allClassStudents.find((s) => s.id === calledId);
                  if (!st) return null;
                  return (
                    <div
                      key={calledId}
                      className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center font-black text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-black text-slate-800 truncate">
                          #{st.stt} {st.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold shrink-0">
                        Đã gọi ✓
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. CELEBRATION POPUP / WINNER ANNOUNCEMENT MODAL                          */}
      {/* ========================================================================= */}
      {showWinnerModal && winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/65 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-pink-300 text-center space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -left-16 w-44 h-44 bg-pink-300/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-44 h-44 bg-yellow-300/30 rounded-full blur-2xl pointer-events-none" />

            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 text-slate-500 flex items-center justify-center cursor-pointer transition shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Banner Pill */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white px-6 py-2 rounded-full text-xs sm:text-sm font-black shadow-lg uppercase tracking-wider animate-bounce">
              <Sparkles className="w-4 h-4" />
              <span>🎉 CHÚC MỪNG BẠN ĐƯỢC CHỌN!</span>
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Student Avatar Visual Card */}
            <div className="space-y-3">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl z-20 animate-bounce">
                  👑
                </div>
                <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-pink-400 via-rose-400 to-amber-400 p-1.5 shadow-2xl shadow-pink-400/40">
                  <div className="w-full h-full rounded-[20px] bg-white overflow-hidden flex items-center justify-center">
                    {winner.avatarUrl ? (
                      <img
                        src={winner.avatarUrl}
                        alt={winner.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-black text-pink-700">
                        {getStudentInitials(winner.name)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-black text-pink-600 uppercase tracking-widest">
                  NGƯỜI MAY MẮN:
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  #{winner.stt} {winner.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                    Tổ {winner.group}
                  </span>
                  <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                    {winner.role}
                  </span>
                  <span className="text-xs font-black text-pink-700 bg-pink-100 px-3 py-1 rounded-full border border-pink-200">
                    🌸 {winner.flowerPoints} hoa
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Reward Buttons (+1, +2, +3 Hoa) */}
            {onAwardBonusPoints && (
              <div className="bg-pink-50/80 p-3 rounded-2xl border border-pink-200 space-y-2">
                <span className="text-[11px] font-black text-pink-900 block">
                  🎁 Thưởng hoa khuyến khích phát biểu:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((pts) => (
                    <button
                      key={pts}
                      type="button"
                      onClick={() => {
                        onAwardBonusPoints(winner, pts);
                        sound.playReward();
                      }}
                      className="py-1.5 bg-white hover:bg-pink-100 text-pink-700 font-black rounded-xl text-xs border border-pink-300 shadow-2xs cursor-pointer transition active:scale-95"
                    >
                      +{pts} 🌸
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Action Buttons: Quay tiếp, Xác nhận, Quay lại */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-3">
                {/* 1. Confirm / Mark Called Button */}
                <button
                  type="button"
                  onClick={() => {
                    onMarkCalled(winner.id);
                    onSelectWinner(
                      winner,
                      'VÒNG QUAY MAY MẮN!',
                      'Chúc mừng bạn nhỏ đã được vòng quay gọi tên! 🎡✨',
                      '🎡'
                    );
                    setShowWinnerModal(false);
                  }}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Xác nhận</span>
                </button>

                {/* 2. Spin Next Button */}
                <button
                  type="button"
                  onClick={() => {
                    onMarkCalled(winner.id);
                    setShowWinnerModal(false);
                    setTimeout(() => {
                      handleSpin();
                    }, 400);
                  }}
                  className="candy-btn-gold text-purple-950 py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition active:scale-95"
                >
                  <Play className="w-4 h-4 fill-purple-950" />
                  <span>Quay tiếp</span>
                </button>
              </div>

              {/* 3. Close Button */}
              <button
                type="button"
                onClick={() => setShowWinnerModal(false)}
                className="w-full py-2 text-slate-500 hover:text-slate-700 font-bold text-xs cursor-pointer"
              >
                ↩ Đóng & Quay lại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
