import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Student, DailyAttendance, PointCategory } from '../types';
import { sound } from '../utils/soundEffects';
import { fireSuperConfetti, getAvatarColor, getStudentInitials } from '../utils/helpers';
import { 
  Sparkles, 
  Crown, 
  RotateCcw, 
  Play, 
  Award, 
  Volume2, 
  VolumeX, 
  Palette, 
  Compass, 
  Zap, 
  Flame, 
  Waves, 
  Orbit, 
  Layers, 
  Infinity as InfinityIcon,
  CheckCircle2,
  Users
} from 'lucide-react';

export type FlightMotionMode = 'chaos' | 'spiral' | 'planet' | 'wave' | 'bubbles' | 'figure8';
export type StageBackgroundTheme = 'aurora' | 'purple_vortex' | 'night_fire' | 'purple_wave' | 'ocean_deep';

interface RandomPickerViewProps {
  students: Student[];
  attendance: DailyAttendance;
  onAwardPoints: (studentIds: string[], delta: number, reason: string, category: PointCategory) => void;
  onNavigateToStudent?: (studentId: string) => void;
}

interface DynamicCard {
  id: string;
  student: Student;
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  scale: number;
  targetScale: number;
  opacity: number;
  color: string;
  initials: string;
  phase: number;
  size: number;
}

export const RandomPickerView: React.FC<RandomPickerViewProps> = ({
  students,
  attendance,
  onAwardPoints,
  onNavigateToStudent,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // States
  const [motionMode, setMotionMode] = useState<FlightMotionMode>('spiral');
  const [stageTheme, setStageTheme] = useState<StageBackgroundTheme>('aurora');
  const [onlyPresent, setOnlyPresent] = useState(true);
  const [isPicking, setIsPicking] = useState(false);
  const [winnerStudent, setWinnerStudent] = useState<Student | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.0);

  // Filter eligible students
  const eligibleStudents = useMemo(() => {
    return students.filter((s) => {
      if (!onlyPresent) return true;
      const rec = attendance.records?.[s.id];
      return !rec || rec.status === 'present' || rec.status === 'late';
    });
  }, [students, attendance, onlyPresent]);

  // Motion cards pool ref
  const cardsRef = useRef<DynamicCard[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const pickingPhaseRef = useRef<{
    startTime: number;
    duration: number;
    winnerId: string | null;
    tickTimer: number;
    tickInterval: number;
  }>({
    startTime: 0,
    duration: 4000,
    winnerId: null,
    tickTimer: 0,
    tickInterval: 300,
  });

  // Color palette for cards
  const colorPalette = useMemo(() => [
    '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', 
    '#06B6D4', '#F97316', '#14B8A6', '#6366F1', '#E11D48'
  ], []);

  // Initialize cards
  const initCards = useCallback((width: number, height: number) => {
    const list = eligibleStudents.length > 0 ? eligibleStudents : students;
    cardsRef.current = list.map((student, idx) => {
      const angle = (idx / list.length) * Math.PI * 2;
      const radius = Math.min(width, height) * 0.35;
      return {
        id: student.id,
        student,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.05,
        scale: 1,
        targetScale: 1,
        opacity: 1,
        color: colorPalette[idx % colorPalette.length],
        initials: getStudentInitials(student.name),
        phase: Math.random() * Math.PI * 2,
        size: 72,
      };
    });
  }, [eligibleStudents, students, colorPalette]);

  // Render dynamic background according to selected theme
  const drawBackground = (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (stageTheme === 'aurora') {
      // 1. Cực quang (Aurora Borealis)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#061727');
      grad.addColorStop(0.5, '#0b3536');
      grad.addColorStop(1, '#051b11');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Aurora glow ribbon
      ctx.save();
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        const waveY = height * 0.4 + Math.sin(time * 0.001 + i) * 60;
        ctx.moveTo(0, waveY);
        for (let x = 0; x <= width; x += 40) {
          const y = waveY + Math.sin((x * 0.005) + time * 0.002 + i) * 40;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = i === 0 ? 'rgba(16, 185, 129, 0.12)' : i === 1 ? 'rgba(6, 182, 212, 0.10)' : 'rgba(139, 92, 246, 0.08)';
        ctx.fill();
      }
      ctx.restore();
    } else if (stageTheme === 'purple_vortex') {
      // 2. Xoáy tím (Purple Vortex)
      const grad = ctx.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, Math.max(width, height) * 0.7);
      grad.addColorStop(0, '#3b0764');
      grad.addColorStop(0.5, '#1e1035');
      grad.addColorStop(1, '#090514');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Vortex spiral lines
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(time * 0.0008);
      for (let j = 0; j < 8; j++) {
        ctx.rotate((Math.PI * 2) / 8);
        ctx.beginPath();
        ctx.arc(0, 0, 180 + Math.sin(time * 0.002 + j) * 30, 0, Math.PI * 0.8);
        ctx.strokeStyle = 'rgba(216, 180, 254, 0.12)';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      ctx.restore();
    } else if (stageTheme === 'night_fire') {
      // 3. Lửa đêm (Night Fire)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#1c0505');
      grad.addColorStop(0.6, '#310d0d');
      grad.addColorStop(1, '#661400');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Embers rising
      ctx.save();
      for (let k = 0; k < 25; k++) {
        const emberX = (Math.sin(k * 99 + time * 0.0005) * 0.5 + 0.5) * width;
        const emberY = (1 - ((time * 0.08 + k * 30) % height) / height) * height;
        const size = (k % 4) + 1.5;
        ctx.beginPath();
        ctx.arc(emberX, emberY, size, 0, Math.PI * 2);
        ctx.fillStyle = k % 2 === 0 ? 'rgba(251, 146, 60, 0.4)' : 'rgba(239, 68, 68, 0.5)';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 8;
        ctx.fill();
      }
      ctx.restore();
    } else if (stageTheme === 'purple_wave') {
      // 4. Sóng tím (Purple Wave)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#110c2a');
      grad.addColorStop(0.5, '#241442');
      grad.addColorStop(1, '#0f0728');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Harmonic sine waves
      ctx.save();
      for (let w = 0; w < 4; w++) {
        ctx.beginPath();
        ctx.moveTo(0, height * 0.5);
        for (let x = 0; x <= width; x += 20) {
          const y = height * 0.5 + Math.sin(x * 0.008 + time * 0.0015 * (w + 1)) * (35 + w * 12);
          ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 - w * 0.02})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      }
      ctx.restore();
    } else {
      // 5. Đại dương (Ocean Deep)
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#031b2e');
      grad.addColorStop(0.5, '#022c43');
      grad.addColorStop(1, '#054752');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Ambient light rays
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(width * 0.2, 0);
      ctx.lineTo(width * 0.6, height);
      ctx.lineTo(width * 0.8, height);
      ctx.lineTo(width * 0.4, 0);
      ctx.closePath();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.07)';
      ctx.fill();
      ctx.restore();
    }
  };

  // Main Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const container = containerRef.current;
      if (container && canvas) {
        canvas.width = container.clientWidth || 800;
        canvas.height = 520;
        initCards(canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const loop = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 1. Draw dynamic canvas stage background
      drawBackground(ctx, width, height, timestamp);

      // 2. Handle Picking Dramatic Phase
      const phase = pickingPhaseRef.current;
      let pickingProgress = 0;
      if (isPicking) {
        const timeSincePickStart = timestamp - phase.startTime;
        pickingProgress = Math.min(1, timeSincePickStart / phase.duration);

        // Sound Tick Ticking with accelerating tempo
        if (!isMuted && timestamp - phase.tickTimer >= phase.tickInterval) {
          phase.tickTimer = timestamp;
          // As picking progresses, interval gets shorter (faster ticks) and pitch goes up
          phase.tickInterval = Math.max(45, 260 * (1 - pickingProgress * 0.85));
          const pitchFactor = 0.9 + pickingProgress * 0.8;
          sound.playToneDramaticTick(pitchFactor);
        }

        // Picking finished
        if (pickingProgress >= 1) {
          setIsPicking(false);
          if (phase.winnerId) {
            const found = students.find((s) => s.id === phase.winnerId);
            if (found) {
              setWinnerStudent(found);
              fireSuperConfetti();
              if (!isMuted) {
                sound.playPolySynthTriumph();
              }
            }
          }
        }
      }

      // 3. Update & Draw Cards according to Motion Mode
      const cards = cardsRef.current;
      const count = cards.length || 1;

      cards.forEach((card, idx) => {
        const isWinnerTarget = isPicking && card.id === phase.winnerId;

        // Apply dynamic motion kinetics
        if (motionMode === 'chaos') {
          // 1. Chaos: va đập tự do nảy vào các cạnh sân khấu
          card.x += card.vx * speedMultiplier * (isPicking ? 1.8 : 1);
          card.y += card.vy * speedMultiplier * (isPicking ? 1.8 : 1);
          card.angle += card.vAngle;

          const padding = card.size / 2;
          if (card.x <= padding) {
            card.x = padding;
            card.vx *= -1;
          }
          if (card.x >= width - padding) {
            card.x = width - padding;
            card.vx *= -1;
          }
          if (card.y <= padding) {
            card.y = padding;
            card.vy *= -1;
          }
          if (card.y >= height - padding) {
            card.y = height - padding;
            card.vy *= -1;
          }
        } else if (motionMode === 'spiral') {
          // 2. Spiral: hội tụ xoáy tròn mở rộng và thu hẹp bán kính
          const baseAngle = (idx / count) * Math.PI * 2 + (elapsed * 0.0012 * speedMultiplier);
          const rBase = Math.min(width, height) * 0.36;
          const r = rBase + Math.sin(elapsed * 0.002 + idx) * (rBase * 0.35);
          card.x = centerX + Math.cos(baseAngle) * r;
          card.y = centerY + Math.sin(baseAngle) * r;
          card.angle = baseAngle + Math.PI / 2;
        } else if (motionMode === 'planet') {
          // 3. Planet: thẻ trung tâm làm mặt trời, các thẻ bay quỹ đạo tròn
          if (idx === 0) {
            card.x = centerX;
            card.y = centerY;
            card.angle = elapsed * 0.001;
            card.targetScale = 1.3;
          } else {
            const orbitIdx = (idx % 3) + 1;
            const orbitRadius = (Math.min(width, height) * 0.14) * orbitIdx;
            const orbitAngle = ((idx / (count - 1)) * Math.PI * 2) + (elapsed * (0.0015 / orbitIdx) * speedMultiplier);
            card.x = centerX + Math.cos(orbitAngle) * orbitRadius;
            card.y = centerY + Math.sin(orbitAngle) * orbitRadius;
            card.angle = orbitAngle;
          }
        } else if (motionMode === 'wave') {
          // 4. Wave: uốn lượn nhịp nhàng theo chu kỳ hình sin
          const spacing = width / (count + 1);
          const targetX = spacing * (idx + 1);
          const wavePhase = (elapsed * 0.003 * speedMultiplier) + (idx * 0.4);
          const targetY = centerY + Math.sin(wavePhase) * (height * 0.28);
          card.x += (targetX - card.x) * 0.1;
          card.y += (targetY - card.y) * 0.1;
          card.angle = Math.cos(wavePhase) * 0.25;
        } else if (motionMode === 'bubbles') {
          // 5. Bubbles: trôi nổi từ dưới lên trên
          card.y -= (1.5 + (idx % 3) * 0.5) * speedMultiplier;
          card.x += Math.sin(elapsed * 0.002 + idx) * 1.2;
          if (card.y < -card.size) {
            card.y = height + card.size;
            card.x = Math.random() * width;
          }
          card.angle = Math.sin(elapsed * 0.001 + idx) * 0.15;
        } else if (motionMode === 'figure8') {
          // 6. Figure8: Thẻ bài bay đan chéo theo hình số 8 vô cực (Lemniscate)
          const t = (elapsed * 0.001 * speedMultiplier) + (idx / count) * Math.PI * 2;
          const a = width * 0.38;
          const b = height * 0.28;
          const denom = 1 + Math.sin(t) * Math.sin(t);
          card.x = centerX + (a * Math.cos(t)) / denom;
          card.y = centerY + (b * Math.sin(t) * Math.cos(t)) / denom;
          card.angle = t;
        }

        // If in picking phase, smooth interpolate candidate towards center or zoom winner
        if (isPicking) {
          if (isWinnerTarget) {
            // Target winner moves toward center stage and expands
            card.x += (centerX - card.x) * (0.04 + pickingProgress * 0.1);
            card.y += (centerY - card.y) * (0.04 + pickingProgress * 0.1);
            card.scale = 1 + pickingProgress * 0.9;
            card.opacity = 1;
          } else {
            // Other cards fade slightly and shrink
            card.opacity = 1 - pickingProgress * 0.65;
            card.scale = Math.max(0.6, 1 - pickingProgress * 0.4);
          }
        } else if (winnerStudent) {
          // Post pick winner stage
          if (card.id === winnerStudent.id) {
            card.x = centerX;
            card.y = centerY;
            card.scale = 1.6 + Math.sin(elapsed * 0.004) * 0.08;
            card.opacity = 1;
          } else {
            card.opacity = 0.25;
            card.scale = 0.7;
          }
        } else {
          card.opacity = 1;
          card.scale = 1;
        }

        // DRAW THE CARD
        ctx.save();
        ctx.translate(card.x, card.y);
        ctx.rotate(card.angle);
        ctx.scale(card.scale, card.scale);
        ctx.globalAlpha = Math.max(0.1, Math.min(1, card.opacity));

        const w = 96;
        const h = 56;
        const r = 16;

        // Card Drop Shadow
        ctx.shadowColor = isWinnerTarget ? '#fbbf24' : 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = isWinnerTarget ? 25 : 10;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 4;

        // Card Gradient Body
        ctx.beginPath();
        ctx.roundRect(-w / 2, -h / 2, w, h, r);
        const cardGrad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
        cardGrad.addColorStop(0, '#ffffff');
        cardGrad.addColorStop(1, '#f1f5f9');
        ctx.fillStyle = cardGrad;
        ctx.fill();

        // Card Border Accent
        ctx.strokeStyle = isWinnerTarget ? '#f59e0b' : card.color;
        ctx.lineWidth = isWinnerTarget ? 3.5 : 2;
        ctx.stroke();

        // Reset shadow for inner text/avatars
        ctx.shadowColor = 'transparent';

        // Avatar Circle inside Card
        const avRadius = 16;
        ctx.beginPath();
        ctx.arc(-w / 2 + 22, 0, avRadius, 0, Math.PI * 2);
        ctx.fillStyle = card.color;
        ctx.fill();

        // Initials inside circle
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(card.initials, -w / 2 + 22, 0);

        // Student Name
        const nameParts = card.student.name.split(' ');
        const shortName = nameParts.length > 1 ? nameParts.slice(-2).join(' ') : card.student.name;
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 12.5px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(shortName, -w / 2 + 42, -4);

        // Subtext (STT & Role/Group)
        ctx.fillStyle = '#64748b';
        ctx.font = 'bold 10px sans-serif';
        ctx.fillText(`#${card.student.stt} • T${card.student.group}`, -w / 2 + 42, 11);

        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [stageTheme, motionMode, isPicking, speedMultiplier, isMuted, eligibleStudents, students, winnerStudent, drawBackground, initCards]);

  // Handle Start Random Pick
  const handleStartPicking = () => {
    if (isPicking || eligibleStudents.length === 0) return;
    setWinnerStudent(null);
    setIsPicking(true);

    // Pick random winner from eligible pool
    const randomIdx = Math.floor(Math.random() * eligibleStudents.length);
    const chosen = eligibleStudents[randomIdx];

    const duration = 4200; // 4.2 seconds dramatic suspense
    pickingPhaseRef.current = {
      startTime: performance.now(),
      duration,
      winnerId: chosen.id,
      tickTimer: performance.now(),
      tickInterval: 280,
    };
  };

  // Reset stage
  const handleResetStage = () => {
    setWinnerStudent(null);
    setIsPicking(false);
    sound.playClick();
    if (canvasRef.current) {
      initCards(canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div id="random-picker-section" className="space-y-6">
      {/* Top Header & Mode Configuration Toolbar */}
      <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-5 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-pink-500 text-white flex items-center justify-center shadow-md shadow-pink-200">
            <Sparkles className="w-6 h-6 animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <span>Sân Khấu Gọi Tên May Mắn</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-black border border-pink-200">
                🎲 Vòng Quay Kỳ Diệu
              </span>
            </h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Khung đồ họa Canvas 6 chế độ bay động học & hiệu ứng âm thanh kịch tính
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-pink-50/80 border-2 border-pink-200 text-xs font-black text-purple-900 cursor-pointer shadow-2xs">
            <input
              type="checkbox"
              checked={onlyPresent}
              onChange={(e) => {
                setOnlyPresent(e.target.checked);
                sound.playClick();
              }}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-400 cursor-pointer accent-pink-500"
            />
            <span>Chỉ quay bạn có mặt ({eligibleStudents.length})</span>
          </label>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`px-3.5 py-2 rounded-2xl border-2 text-xs font-black transition flex items-center gap-1.5 shadow-2xs ${
              isMuted
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
            }`}
            title={isMuted ? 'Bật âm thanh kịch tính' : 'Tắt âm thanh'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isMuted ? 'Tắt âm' : 'Âm thanh'}</span>
          </button>

          <button
            id="btn-reset-picker-stage"
            onClick={handleResetStage}
            className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-purple-900 text-xs font-black transition flex items-center gap-1.5 shadow-2xs border border-slate-200"
            title="Đặt lại vị trí thẻ bài"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại</span>
          </button>
        </div>
      </div>

      {/* Main Stage & Canvas Container */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-pink-300/80 bg-slate-950">
        <div ref={containerRef} className="w-full h-[520px] relative">
          <canvas
            ref={canvasRef}
            className="w-full h-full block cursor-pointer select-none"
            onClick={handleStartPicking}
          />
        </div>

        {/* Floating Top Controls Overlay inside Canvas */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none z-20">
          {/* 6 Motion Modes Switcher */}
          <div className="flex items-center gap-1 bg-purple-950/70 backdrop-blur-md p-1.5 rounded-2xl border border-pink-300/30 pointer-events-auto shadow-lg">
            {[
              { id: 'spiral' as FlightMotionMode, label: 'Trôn ốc', icon: Orbit },
              { id: 'chaos' as FlightMotionMode, label: 'Hỗn loạn', icon: Zap },
              { id: 'planet' as FlightMotionMode, label: 'Hành tinh', icon: Compass },
              { id: 'wave' as FlightMotionMode, label: 'Sóng', icon: Waves },
              { id: 'bubbles' as FlightMotionMode, label: 'Bong bóng', icon: Layers },
              { id: 'figure8' as FlightMotionMode, label: 'Vô cực', icon: InfinityIcon },
            ].map((m) => {
              const Icon = m.icon;
              const isActive = motionMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMotionMode(m.id);
                    sound.playClick();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'candy-btn-gold text-purple-950 shadow-md scale-105'
                      : 'text-pink-100/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* 5 Background Themes Switcher */}
          <div className="flex items-center gap-1 bg-purple-950/70 backdrop-blur-md p-1.5 rounded-2xl border border-pink-300/30 pointer-events-auto shadow-lg">
            {[
              { id: 'aurora' as StageBackgroundTheme, label: 'Cực quang' },
              { id: 'purple_vortex' as StageBackgroundTheme, label: 'Xoáy tím' },
              { id: 'night_fire' as StageBackgroundTheme, label: 'Lửa đêm' },
              { id: 'purple_wave' as StageBackgroundTheme, label: 'Sóng tím' },
              { id: 'ocean_deep' as StageBackgroundTheme, label: 'Đại dương' },
            ].map((th) => (
              <button
                key={th.id}
                onClick={() => {
                  setStageTheme(th.id);
                  sound.playClick();
                }}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                  stageTheme === th.id
                    ? 'candy-btn-purple text-white shadow-sm'
                    : 'text-pink-100/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>

        {/* Center Bottom Floating Pick Button (When not picking and no winner) */}
        {!isPicking && !winnerStudent && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <button
              id="btn-spin-random-picker"
              onClick={handleStartPicking}
              className="candy-btn-gold px-8 py-3.5 text-purple-950 font-black text-base rounded-3xl shadow-2xl active:scale-95 transition-transform hover:scale-105 flex items-center gap-2.5 border-2 border-amber-300"
            >
              <Sparkles className="w-5 h-5 text-purple-950 animate-spin-slow" />
              <span>BẮT ĐẦU GỌI TÊN!</span>
            </button>
          </div>
        )}

        {/* Floating Picking Indicator */}
        {isPicking && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="px-6 py-2.5 bg-purple-950/90 backdrop-blur-md rounded-2xl border-2 border-amber-300 text-amber-300 font-black text-sm flex items-center gap-2 animate-pulse shadow-2xl">
              <Zap className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>Đang quay hồi hộp... Tiếng tíc-tắc tăng tốc!</span>
            </div>
          </div>
        )}
      </div>

      {/* Winner Spotlight Card & Direct Actions */}
      {winnerStudent && (
        <div className="bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 rounded-3xl p-6 sm:p-8 border-3 border-amber-300 shadow-2xl text-center animate-in zoom-in-95 duration-200 space-y-5">
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-200 to-pink-200 text-purple-950 font-black text-xs uppercase tracking-wider shadow-sm border border-amber-300">
            <Crown className="w-4 h-4 text-amber-700" />
            CHÚC MỪNG BẠN HỌC SINH MAY MẮN
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-tr ${getAvatarColor(
                winnerStudent.name,
                winnerStudent.gender
              )} text-white flex items-center justify-center font-black text-3xl shadow-xl border-4 border-white`}
            >
              {getStudentInitials(winnerStudent.name)}
            </div>

            <div className="text-center sm:text-left">
              <h3 className="text-2xl sm:text-3xl font-black text-slate-800">
                {winnerStudent.name}
              </h3>
              <div className="text-sm font-bold text-purple-700 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="px-2 py-0.5 rounded-lg bg-pink-100 text-pink-800 font-extrabold text-xs">STT #{winnerStudent.stt}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800 font-extrabold text-xs">Tổ {winnerStudent.group}</span>
                <span>•</span>
                <span className="text-xs font-extrabold text-slate-600">Chức vụ: {winnerStudent.role}</span>
              </div>
              <p className="text-xs font-semibold text-slate-600 mt-1.5 max-w-md">
                Em đã được hệ thống gọi tên may mắn! Hãy tự tin phát biểu hoặc hoàn thành thử thách nhé 🌟
              </p>
            </div>
          </div>

          {/* Quick Actions for Winner */}
          <div className="pt-5 border-t-2 border-pink-200/80 flex flex-wrap items-center justify-center gap-3">
            {/* Direct Award Points */}
            <button
              onClick={() => {
                sound.playReward();
                fireSuperConfetti();
                onAwardPoints(
                  [winnerStudent.id],
                  2,
                  'Trả lời xuất sắc khi gọi tên ngẫu nhiên',
                  'academic'
                );
              }}
              className="candy-btn-purple px-4.5 py-2.5 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>+2 Hoa (Trả lời tốt)</span>
            </button>

            <button
              onClick={() => {
                sound.playReward();
                fireSuperConfetti();
                onAwardPoints(
                  [winnerStudent.id],
                  5,
                  'Đạt điểm 10 xuất sắc khi gọi tên ngẫu nhiên',
                  'academic'
                );
              }}
              className="candy-btn-gold px-4.5 py-2.5 text-purple-950 font-black text-xs sm:text-sm rounded-2xl shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-950" />
              <span>⭐ +5 Hoa (Điểm 10)</span>
            </button>

            {/* Jump directly to Student Profile / Scoring */}
            {onNavigateToStudent && (
              <button
                onClick={() => {
                  sound.playClick();
                  onNavigateToStudent(winnerStudent.id);
                }}
                className="candy-btn-pink px-4.5 py-2.5 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm flex items-center gap-2"
              >
                <Users className="w-4 h-4" />
                <span>Khen thưởng chi tiết</span>
              </button>
            )}

            <button
              onClick={handleStartPicking}
              className="px-4.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-purple-900 font-black text-xs sm:text-sm rounded-2xl transition flex items-center gap-2 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Gọi bạn tiếp theo</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
