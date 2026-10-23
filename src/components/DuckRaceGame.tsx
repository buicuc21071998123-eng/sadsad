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
  ChevronRight,
  Flame,
  CheckCircle2,
  X,
  Shuffle,
  Volume1,
  Flag,
  Timer
} from 'lucide-react';

export type DuckRaceMode = 'single' | 'top3' | 'all';
export type DuckRaceSpeed = 'slow' | 'normal' | 'fast';

interface DuckRacer {
  id: string;
  student: Student;
  lane: number;
  progress: number; // 0 to 100%
  baseSpeed: number;
  currentSpeed: number;
  boostActive: boolean;
  boostText: string;
  finished: boolean;
  finishTime: number | null;
  finishPlace: number | null;
  accessory: DuckAccessory;
  colorTheme: DuckColorTheme;
}

interface DuckAccessory {
  id: string;
  icon: string;
  name: string;
  hatStyle?: string;
}

interface DuckColorTheme {
  name: string;
  duckBody: string; // Tail/body gradient
  duckBeak: string;
  laneBg: string;
  laneBorder: string;
  waterColor: string;
  badgeBg: string;
  badgeText: string;
}

const DUCK_ACCESSORIES: DuckAccessory[] = [
  { id: 'crown', icon: '👑', name: 'Vương miện hoàng gia' },
  { id: 'goggles', icon: '🥽', name: 'Kính bơi siêu tốc' },
  { id: 'party', icon: '🥳', name: 'Mũ tiệc tùng' },
  { id: 'flower', icon: '🌸', name: 'Vòng hoa ngọt ngào' },
  { id: 'headband', icon: '⚡', name: 'Băng đô thể thao' },
  { id: 'star', icon: '⭐', name: 'Kẹp tóc ngôi sao' },
  { id: 'sailor', icon: '⚓', name: 'Mũ thủy thủ' },
  { id: 'bow', icon: '🎀', name: 'Nơ hồng xinh xắn' },
  { id: 'cap', icon: '🧢', name: 'Mũ lưỡi trai cá tính' },
  { id: 'glasses', icon: '🕶️', name: 'Kính râm cực ngầu' },
];

const DUCK_COLOR_THEMES: DuckColorTheme[] = [
  {
    name: 'Vàng Hoàng Yến',
    duckBody: '#FACC15',
    duckBeak: '#F97316',
    laneBg: 'bg-amber-50/70',
    laneBorder: 'border-amber-200',
    waterColor: 'from-amber-100/50 to-cyan-50/50',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
  },
  {
    name: 'Hồng Kẹo Ngọt',
    duckBody: '#F472B6',
    duckBeak: '#FB923C',
    laneBg: 'bg-pink-50/70',
    laneBorder: 'border-pink-200',
    waterColor: 'from-pink-100/50 to-cyan-50/50',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-900',
  },
  {
    name: 'Xanh Biển Tươi',
    duckBody: '#38BDF8',
    duckBeak: '#F97316',
    laneBg: 'bg-sky-50/70',
    laneBorder: 'border-sky-200',
    waterColor: 'from-sky-100/50 to-cyan-50/50',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-900',
  },
  {
    name: 'Xanh May Mắn',
    duckBody: '#4ADE80',
    duckBeak: '#F97316',
    laneBg: 'bg-emerald-50/70',
    laneBorder: 'border-emerald-200',
    waterColor: 'from-emerald-100/50 to-cyan-50/50',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
  },
  {
    name: 'Tím Mộng Mơ',
    duckBody: '#C084FC',
    duckBeak: '#FB923C',
    laneBg: 'bg-purple-50/70',
    laneBorder: 'border-purple-200',
    waterColor: 'from-purple-100/50 to-cyan-50/50',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
  },
  {
    name: 'Cam Năng Động',
    duckBody: '#FB923C',
    duckBeak: '#EA580C',
    laneBg: 'bg-orange-50/70',
    laneBorder: 'border-orange-200',
    waterColor: 'from-orange-100/50 to-cyan-50/50',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-900',
  },
  {
    name: 'Xanh Bạc Hà',
    duckBody: '#2DD4BF',
    duckBeak: '#F97316',
    laneBg: 'bg-teal-50/70',
    laneBorder: 'border-teal-200',
    waterColor: 'from-teal-100/50 to-cyan-50/50',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-900',
  },
  {
    name: 'Đỏ Nhiệt Huyết',
    duckBody: '#FB7185',
    duckBeak: '#F97316',
    laneBg: 'bg-rose-50/70',
    laneBorder: 'border-rose-200',
    waterColor: 'from-rose-100/50 to-cyan-50/50',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
  },
];

const BOOST_TEXTS = ['⚡ VÈO!', '💨 TĂNG TỐC!', '🔥 BỨT PHÁ!', '🌊 LƯỚT SÓNG!', '🦆 CỐ LÊN!'];

interface DuckRaceGameProps {
  students: Student[]; // All available from filter
  allClassStudents: Student[];
  config?: ClassConfig;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onSelectWinner: (student: Student, title: string, subtitle: string, icon: string) => void;
  onAwardBonusPoints?: (student: Student, points: number) => void;
  onExcludeStudent?: (studentId: string) => void;
}

export const DuckRaceGame: React.FC<DuckRaceGameProps> = ({
  students,
  allClassStudents,
  config,
  soundEnabled,
  onToggleSound,
  onSelectWinner,
  onAwardBonusPoints,
  onExcludeStudent,
}) => {
  // Game Settings
  const [raceMode, setRaceMode] = useState<DuckRaceMode>('top3');
  const [racerCountOption, setRacerCountOption] = useState<number | 'all'>(6);
  const [raceSpeed, setRaceSpeed] = useState<DuckRaceSpeed>('normal');

  // Race State: 'setup' | 'countdown' | 'racing' | 'finished'
  const [raceState, setRaceState] = useState<'setup' | 'countdown' | 'racing' | 'finished'>('setup');
  const [countdownNum, setCountdownNum] = useState<number | string>(3);

  // Active racers in the race
  const [racers, setRacers] = useState<DuckRacer[]>([]);
  const [finishOrder, setFinishOrder] = useState<DuckRacer[]>([]);
  const [showPodiumModal, setShowPodiumModal] = useState<boolean>(false);

  // Animation frame ref
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const quackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Determine how many racers to pick
  const targetRacerCount = useMemo(() => {
    if (racerCountOption === 'all') return students.length;
    return Math.min(racerCountOption, students.length);
  }, [racerCountOption, students.length]);

  // Setup initial / reshuffled racers
  const setupRacers = useCallback(() => {
    if (students.length === 0) {
      setRacers([]);
      return;
    }

    // Pick shuffled slice
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const count = racerCountOption === 'all' ? shuffled.length : Math.min(racerCountOption, shuffled.length);
    const selectedStudents = shuffled.slice(0, Math.max(2, count));

    const newRacers: DuckRacer[] = selectedStudents.map((student, idx) => {
      const accessory = DUCK_ACCESSORIES[idx % DUCK_ACCESSORIES.length];
      const colorTheme = DUCK_COLOR_THEMES[idx % DUCK_COLOR_THEMES.length];
      return {
        id: `duck-${student.id}-${idx}`,
        student,
        lane: idx + 1,
        progress: 0,
        baseSpeed: 1.0,
        currentSpeed: 1.0,
        boostActive: false,
        boostText: '',
        finished: false,
        finishTime: null,
        finishPlace: null,
        accessory,
        colorTheme,
      };
    });

    setRacers(newRacers);
    setFinishOrder([]);
    setRaceState('setup');
    setShowPodiumModal(false);
  }, [students, racerCountOption]);

  // Re-run setup whenever student pool changes or racer count option changes (in setup state)
  useEffect(() => {
    if (raceState === 'setup') {
      setupRacers();
    }
  }, [students, racerCountOption, setupRacers]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (quackIntervalRef.current) clearInterval(quackIntervalRef.current);
    };
  }, []);

  // Handle Countdown and start race
  const handleStartRace = () => {
    if (racers.length < 2 || raceState === 'countdown' || raceState === 'racing') return;

    // Reset progress
    setRacers((prev) =>
      prev.map((r) => ({
        ...r,
        progress: 0,
        finished: false,
        finishTime: null,
        finishPlace: null,
        boostActive: false,
        boostText: '',
      }))
    );
    setFinishOrder([]);
    setRaceState('countdown');
    setCountdownNum(3);

    if (soundEnabled) sound.playTing();

    setTimeout(() => {
      setCountdownNum(2);
      if (soundEnabled) sound.playTing();

      setTimeout(() => {
        setCountdownNum(1);
        if (soundEnabled) sound.playTing();

        setTimeout(() => {
          setCountdownNum('ĐUA THÔI! 🚀');
          if (soundEnabled) sound.playRaceWhistle();

          setTimeout(() => {
            setRaceState('racing');
            startRaceLoop();
          }, 600);
        }, 800);
      }, 800);
    }, 800);
  };

  // Main Race Animation Loop
  const startRaceLoop = () => {
    lastTimeRef.current = performance.now();

    // Speed multiplier setting
    const speedFactor = raceSpeed === 'fast' ? 1.7 : raceSpeed === 'slow' ? 0.7 : 1.15;

    // Periodic random cheerful duck quacks
    if (quackIntervalRef.current) clearInterval(quackIntervalRef.current);
    quackIntervalRef.current = setInterval(() => {
      if (soundEnabled && Math.random() < 0.6) {
        sound.playDuckQuack();
      }
    }, 2200);

    const raceOrderTracker: DuckRacer[] = [];

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;

      let allFinished = true;

      setRacers((currentRacers) => {
        const updated = currentRacers.map((duck) => {
          if (duck.finished) return duck;

          allFinished = false;

          // 1. Calculate random speed burst / variation
          // Base increment: ~8-12% per second at normal speed
          const baseStep = (7.5 + Math.random() * 6.5) * speedFactor * dt;

          // 2. Random Sudden Speed Boosts
          let isBoosted = duck.boostActive;
          let boostText = duck.boostText;
          let boostMultiplier = 1.0;

          if (!isBoosted && Math.random() < 0.035) {
            isBoosted = true;
            boostText = BOOST_TEXTS[Math.floor(Math.random() * BOOST_TEXTS.length)];
            if (soundEnabled && Math.random() < 0.4) {
              sound.playDuckBoost();
            }
          } else if (isBoosted && Math.random() < 0.12) {
            isBoosted = false;
            boostText = '';
          }

          if (isBoosted) {
            boostMultiplier = 1.85 + Math.random() * 0.4;
          }

          // Dynamic slight rubber-banding / wobble for excitement
          const progressDelta = baseStep * boostMultiplier;
          const nextProgress = Math.min(100, duck.progress + progressDelta);

          // Check if crossed finish line
          if (nextProgress >= 100 && !duck.finished) {
            const place = raceOrderTracker.length + 1;
            const finishedDuck: DuckRacer = {
              ...duck,
              progress: 100,
              finished: true,
              finishTime: performance.now(),
              finishPlace: place,
              boostActive: false,
              boostText: '🏁 VỀ ĐÍCH!',
            };
            raceOrderTracker.push(finishedDuck);
            return finishedDuck;
          }

          return {
            ...duck,
            progress: nextProgress,
            boostActive: isBoosted,
            boostText,
          };
        });

        return updated;
      });

      // Check if race should finish
      // For 'single' mode, finish as soon as 1st place crosses
      // For 'top3' mode, finish when top 3 or all finish
      // For 'all' mode, finish when all finish
      const finishedCount = raceOrderTracker.length;
      const shouldEndRace =
        (raceMode === 'single' && finishedCount >= 1) ||
        (raceMode === 'top3' && (finishedCount >= 3 || finishedCount >= racers.length)) ||
        allFinished;

      if (shouldEndRace && finishedCount > 0) {
        if (quackIntervalRef.current) clearInterval(quackIntervalRef.current);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

        // Finalize finish positions
        setFinishOrder(raceOrderTracker);
        setRaceState('finished');

        // Confetti and Celebration Sound
        fireSuperConfetti();
        if (soundEnabled) {
          sound.playReward();
        }

        setTimeout(() => {
          setShowPodiumModal(true);
        }, 700);

        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  // Reset or Race Again
  const handleResetRace = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (quackIntervalRef.current) clearInterval(quackIntervalRef.current);
    setRacers((prev) =>
      prev.map((r) => ({
        ...r,
        progress: 0,
        finished: false,
        finishTime: null,
        finishPlace: null,
        boostActive: false,
        boostText: '',
      }))
    );
    setFinishOrder([]);
    setRaceState('setup');
    setShowPodiumModal(false);
  };

  // Top 1 / Top 3 winners derived from finishOrder
  const topWinners = useMemo(() => {
    return finishOrder.slice(0, raceMode === 'single' ? 1 : 3);
  }, [finishOrder, raceMode]);

  return (
    <div id="duck-race-game-root" className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border-2 border-amber-200 shadow-xl shadow-amber-100/50 space-y-6">
      {/* 1. HEADER BAR & CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-2 border-amber-100">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-300/40 border-2 border-white animate-bounce">
            🦆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-xl text-slate-800 tracking-tight">
                Đua Vịt May Mắn
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black border border-amber-300 shadow-xs">
                MỚI 🌟
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Cùng những chú vịt siêu đáng yêu tìm ra bạn nhỏ may mắn chiến thắng! 🌊🏆
            </p>
          </div>
        </div>

        {/* Action Controls & Settings */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Racer Count Selector */}
          <div className="flex items-center gap-1 bg-amber-50/80 p-1.5 rounded-2xl border border-amber-200">
            <span className="text-[11px] font-black text-amber-900 px-2 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-600" />
              <span>Vịt đua:</span>
            </span>
            {[4, 6, 8, 10, 'all'].map((opt) => (
              <button
                key={String(opt)}
                type="button"
                disabled={raceState === 'racing' || raceState === 'countdown'}
                onClick={() => {
                  sound.playClick();
                  setRacerCountOption(opt as number | 'all');
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-50 ${
                  racerCountOption === opt
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white'
                }`}
              >
                {opt === 'all' ? `Tất cả (${students.length})` : opt}
              </button>
            ))}
          </div>

          {/* Mode Selector: Single vs Top 3 vs All */}
          <div className="flex items-center gap-1 bg-amber-50/80 p-1.5 rounded-2xl border border-amber-200">
            <button
              type="button"
              disabled={raceState === 'racing' || raceState === 'countdown'}
              onClick={() => {
                sound.playClick();
                setRaceMode('single');
              }}
              title="Chọn 1 người về nhất"
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-50 ${
                raceMode === 'single'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              🥇 Chọn 1 người
            </button>
            <button
              type="button"
              disabled={raceState === 'racing' || raceState === 'countdown'}
              onClick={() => {
                sound.playClick();
                setRaceMode('top3');
              }}
              title="Vinh danh Top 3 về đích đầu tiên"
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-50 ${
                raceMode === 'top3'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-purple-950 shadow-xs'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              🏆 Top 3 May Mắn
            </button>
            <button
              type="button"
              disabled={raceState === 'racing' || raceState === 'countdown'}
              onClick={() => {
                sound.playClick();
                setRaceMode('all');
              }}
              title="Đua vui tính thứ hạng toàn bộ"
              className={`px-2.5 py-1 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-50 ${
                raceMode === 'all'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-white'
              }`}
            >
              🌟 Cả Lớp
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-amber-50/80 p-1.5 rounded-2xl border border-amber-200">
            <span className="text-[11px] font-black text-amber-900 px-1.5 flex items-center gap-1">
              <Timer className="w-3.5 h-3.5 text-amber-600" />
            </span>
            {(['slow', 'normal', 'fast'] as DuckRaceSpeed[]).map((spd) => (
              <button
                key={spd}
                type="button"
                disabled={raceState === 'racing' || raceState === 'countdown'}
                onClick={() => {
                  sound.playClick();
                  setRaceSpeed(spd);
                }}
                className={`px-2 py-1 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-50 ${
                  raceSpeed === spd
                    ? 'bg-white text-purple-900 shadow-xs border border-amber-300 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {spd === 'slow' && 'Chậm'}
                {spd === 'normal' && 'Vừa'}
                {spd === 'fast' && 'Nhanh ⚡'}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2 text-slate-500 hover:text-amber-800 hover:bg-amber-100 rounded-xl transition cursor-pointer border border-amber-200 shadow-xs bg-white"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* 2. RACE CONTROLS BAR & STATUS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-4 rounded-2xl border-2 border-amber-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black text-amber-900 bg-white px-3.5 py-1.5 rounded-full border border-amber-200 shadow-xs flex items-center gap-1.5">
            <span>🏁 Làn đua:</span>
            <strong className="text-amber-600">{racers.length}</strong> chú vịt
          </span>

          <span className="text-xs font-black text-slate-600">
            {raceState === 'setup' && '👉 Nhấn "Bắt Đầu Đua" để xuất phát!'}
            {raceState === 'countdown' && '⏳ Chuẩn bị xuất phát...'}
            {raceState === 'racing' && '🌊 Các chú vịt đang rẽ sóng tăng tốc!'}
            {raceState === 'finished' && '🎉 Cuộc đua đã tìm ra nhà vô địch!'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Reshuffle Racers Button */}
          <button
            type="button"
            disabled={raceState === 'racing' || raceState === 'countdown'}
            onClick={() => {
              sound.playClick();
              setupRacers();
            }}
            title="Đổi nhóm học sinh khác ngẫu nhiên"
            className="px-3.5 py-2 bg-white hover:bg-amber-100 text-amber-800 border-2 border-amber-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs disabled:opacity-50"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-600" />
            <span>Xáo Trộn Vịt</span>
          </button>

          {/* Reset / Replay Button */}
          {raceState === 'finished' && (
            <button
              type="button"
              onClick={handleResetRace}
              className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border-2 border-pink-200 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt Lại Vị Trí</span>
            </button>
          )}

          {/* Start Race Button */}
          {raceState !== 'racing' && raceState !== 'countdown' ? (
            <button
              type="button"
              disabled={racers.length < 2}
              onClick={handleStartRace}
              className="candy-btn-gold text-purple-950 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 cursor-pointer transition active:scale-95 shadow-lg shadow-amber-300/40 disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-purple-950" />
              <span>BẮT ĐẦU ĐUA!</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-black text-amber-700 bg-white px-4 py-2 rounded-xl border border-amber-300 animate-pulse shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ĐANG ĐUA KỊCH TÍNH...</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. WATER RACECOURSE ARENA */}
      <div className="relative rounded-3xl bg-gradient-to-b from-[#7DD3FC] via-[#38BDF8] to-[#0284C7] border-4 border-amber-300 p-4 sm:p-6 min-h-[480px] overflow-hidden shadow-inner select-none space-y-3">
        {/* Background Water Decor: Lotus, Lilies, Bubbles */}
        <div className="absolute top-3 left-10 text-2xl opacity-60 pointer-events-none">🪷</div>
        <div className="absolute bottom-4 left-1/4 text-2xl opacity-50 pointer-events-none">🍀</div>
        <div className="absolute top-1/2 right-16 text-3xl opacity-40 pointer-events-none">🪷</div>
        <div className="absolute bottom-6 right-1/3 text-2xl opacity-50 pointer-events-none">🌿</div>
        <div className="absolute top-12 left-1/2 text-xl opacity-30 pointer-events-none">💧</div>
        <div className="absolute top-2/3 left-16 text-xl opacity-30 pointer-events-none">🫧</div>

        {/* Start & Finish Line Header Markers */}
        <div className="relative z-10 flex items-center justify-between text-xs font-black text-white px-2 sm:px-4 pb-2 border-b border-white/30">
          <div className="flex items-center gap-1.5 bg-black/25 px-3 py-1 rounded-full backdrop-blur-xs">
            <span>🚩 VẠCH XUẤT PHÁT</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-yellow-200 hidden sm:inline-block">
              🌊 Hồ Nước Thần Tiên 🦆
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-rose-500/80 px-3.5 py-1 rounded-full shadow-md text-white border border-white/50 animate-pulse">
            <Flag className="w-3.5 h-3.5" />
            <span>🏁 VẠCH ĐÍCH</span>
          </div>
        </div>

        {/* Countdown Overlay Display */}
        {raceState === 'countdown' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-purple-950/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="text-center space-y-2 animate-in zoom-in-50 duration-200">
              <div className="text-7xl sm:text-9xl font-black text-yellow-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] animate-bounce">
                {countdownNum}
              </div>
              <div className="text-lg sm:text-xl font-black text-white bg-black/30 px-6 py-2 rounded-full border border-white/40 shadow-lg">
                Các chú vịt sẵn sàng xuất phát! 🦆✨
              </div>
            </div>
          </div>
        )}

        {/* Check if no racers available */}
        {racers.length === 0 ? (
          <div className="text-center py-16 space-y-4 z-10 bg-white/90 rounded-3xl p-8 max-w-md mx-auto my-8 border-2 border-amber-200 shadow-xl">
            <div className="text-6xl animate-bounce">🦆</div>
            <h4 className="text-xl font-black text-slate-800">CHƯA CÓ HỌC SINH THAM GIA</h4>
            <p className="text-xs text-slate-500 font-bold leading-relaxed">
              Vui lòng kiểm tra lại bộ lọc phía trên hoặc nhấn nút "Làm mới tất cả" để nạp danh sách học sinh vào đường đua.
            </p>
          </div>
        ) : (
          /* Racing Lanes List */
          <div className="space-y-3 relative z-10">
            {racers.map((duck, idx) => {
              const isFinished = duck.finished;
              const place = duck.finishPlace;

              return (
                <div
                  key={duck.id}
                  className={`relative rounded-2xl p-2.5 sm:p-3 border-2 transition-all duration-150 overflow-hidden shadow-md ${
                    duck.colorTheme.laneBg
                  } ${duck.colorTheme.laneBorder} ${
                    duck.boostActive ? 'ring-2 ring-yellow-400 shadow-yellow-200/50' : ''
                  }`}
                >
                  {/* Water Ripple Texture inside lane */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-white/20 pointer-events-none" />

                  {/* Checkered Finish Gate Line inside each lane */}
                  <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-[repeating-conic-gradient(#000_0_90deg,#fff_0_180deg)] bg-[length:12px_12px] opacity-25 border-l-2 border-dashed border-white pointer-events-none" />

                  {/* Lane Number & Student Name Header in Lane */}
                  <div className="flex items-center justify-between text-xs mb-1.5 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md font-black text-[10px] ${duck.colorTheme.badgeBg} ${duck.colorTheme.badgeText} shadow-2xs`}>
                        Làn #{duck.lane}
                      </span>
                      <span className="font-black text-slate-800 text-xs sm:text-sm truncate max-w-[140px] sm:max-w-[220px]">
                        #{duck.student.stt} {duck.student.name}
                      </span>
                      <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md font-bold hidden sm:inline-block">
                        Tổ {duck.student.group}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Boost indicator message */}
                      {duck.boostActive && (
                        <span className="text-[10px] font-black text-amber-800 bg-yellow-300 px-2.5 py-0.5 rounded-full animate-bounce shadow-xs flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-600 fill-orange-500" />
                          <span>{duck.boostText}</span>
                        </span>
                      )}

                      {/* Finish Rank Trophy Badge */}
                      {isFinished && place && (
                        <span
                          className={`px-3 py-0.5 rounded-full text-xs font-black flex items-center gap-1 shadow-md border animate-in zoom-in-75 ${
                            place === 1
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-purple-950 border-amber-300 font-black scale-105'
                              : place === 2
                              ? 'bg-gradient-to-r from-slate-200 to-slate-300 text-slate-800 border-slate-400'
                              : place === 3
                              ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white border-amber-500'
                              : 'bg-white text-slate-700 border-slate-300'
                          }`}
                        >
                          {place === 1 && '🥇 Hạng 1'}
                          {place === 2 && '🥈 Hạng 2'}
                          {place === 3 && '🥉 Hạng 3'}
                          {place > 3 && `🏅 Top #${place}`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Swimming Track Lane */}
                  <div className="relative h-14 sm:h-16 w-full bg-cyan-100/50 rounded-xl border border-cyan-200/80 overflow-hidden flex items-center shadow-inner">
                    {/* Water Track Waves Effect */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-200 via-sky-300 to-blue-300 pointer-events-none" />

                    {/* Checkered Goal Post in Track */}
                    <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-transparent to-red-500/20 flex items-center justify-center pointer-events-none">
                      <span className="text-lg opacity-80">🏁</span>
                    </div>

                    {/* 🦆 SWIMMING DUCK ELEMENT */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 transition-all duration-75 flex items-center"
                      style={{
                        // Clamp duck position so it doesn't overflow right boundary
                        left: `calc(${duck.progress * 0.85}% + 8px)`,
                      }}
                    >
                      {/* Water Wake Trails behind Duck */}
                      <div className="relative flex items-center">
                        <div
                          className={`w-8 sm:w-12 h-3 sm:h-4 rounded-full bg-white/60 blur-[2px] -mr-3 animate-pulse ${
                            duck.boostActive ? 'w-16 bg-yellow-200/80 blur-xs' : ''
                          }`}
                        />
                        <div className="text-[10px] opacity-75 -mr-1 animate-ping">🫧</div>
                      </div>

                      {/* Duck Sprite Container */}
                      <div
                        className={`relative flex items-center justify-center transition-transform duration-150 ${
                          raceState === 'racing' && !duck.finished ? 'animate-bounce' : ''
                        } ${duck.boostActive ? 'scale-115 rotate-3' : ''}`}
                      >
                        {/* Student Name Float Pill */}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white/95 px-2 py-0.5 rounded-full border border-amber-300 shadow-md text-[10px] font-black text-slate-800 whitespace-nowrap z-20 flex items-center gap-1">
                          <span>{duck.student.name.split(' ').slice(-1)[0]}</span>
                        </div>

                        {/* Duck SVG Character Graphic */}
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 drop-shadow-md">
                          {/* Accessory on Duck Head */}
                          <div className="absolute -top-2 left-1 text-base sm:text-lg z-20 select-none">
                            {duck.accessory.icon}
                          </div>

                          {/* Cute SVG Rubber Duck */}
                          <svg
                            viewBox="0 0 100 100"
                            className="w-full h-full"
                            style={{
                              filter: duck.boostActive
                                ? 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.9))'
                                : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                            }}
                          >
                            {/* Water Ripple Base */}
                            <ellipse cx="50" cy="85" rx="42" ry="10" fill="#E0F2FE" opacity="0.8" />
                            <ellipse cx="48" cy="84" rx="36" ry="7" fill="#BAE6FD" opacity="0.9" />

                            {/* Duck Body */}
                            <path
                              d="M20,68 C15,60 18,48 28,45 C35,43 45,45 52,50 C62,48 78,52 82,62 C85,70 78,78 68,80 C50,83 30,82 20,68 Z"
                              fill={duck.colorTheme.duckBody}
                            />
                            {/* Duck Tail Tip */}
                            <path d="M18,65 Q10,58 12,48 Q20,54 24,62 Z" fill={duck.colorTheme.duckBody} />

                            {/* Duck Wing */}
                            <path
                              d="M32,60 C32,54 42,52 48,56 C52,60 50,68 42,70 C35,71 32,66 32,60 Z"
                              fill="#FEF08A"
                              stroke="#EAB308"
                              strokeWidth="1.5"
                            />

                            {/* Duck Head */}
                            <circle cx="68" cy="40" r="20" fill={duck.colorTheme.duckBody} />

                            {/* Cute Rosy Cheek */}
                            <circle cx="70" cy="46" r="4.5" fill="#FB7185" opacity="0.6" />

                            {/* Big Cartoon Eye */}
                            <circle cx="74" cy="36" r="5" fill="#0F172A" />
                            <circle cx="76" cy="34" r="2" fill="#FFFFFF" />

                            {/* Orange Duck Beak */}
                            <path
                              d="M82,38 Q96,38 98,43 Q92,49 80,48 Z"
                              fill={duck.colorTheme.duckBeak}
                              stroke="#C2410C"
                              strokeWidth="1"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. LEADERBOARD & RECENT FINISHERS BAR */}
      {finishOrder.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600" />
              <h4 className="font-black text-sm text-slate-800 uppercase tracking-wide">
                BẢNG VINH DANH VỀ ĐÍCH
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowPodiumModal(true)}
              className="text-xs font-black text-amber-800 hover:text-amber-900 bg-white px-3 py-1 rounded-xl border border-amber-300 shadow-2xs transition cursor-pointer flex items-center gap-1"
            >
              <span>Xem bục vinh quang 🏆</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {finishOrder.slice(0, 3).map((duck, idx) => (
              <div
                key={duck.id}
                className={`p-3 rounded-2xl border-2 flex items-center gap-3 shadow-sm ${
                  idx === 0
                    ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 text-amber-950 font-black'
                    : idx === 1
                    ? 'bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300 text-slate-900'
                    : 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-950'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-xs border border-amber-200 shrink-0">
                  {idx === 0 && '🥇'}
                  {idx === 1 && '🥈'}
                  {idx === 2 && '🥉'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-black uppercase text-amber-800">
                    {idx === 0 ? 'VÔ ĐỊCH 👑' : `HẠNG ${idx + 1}`}
                  </div>
                  <div className="font-black text-xs sm:text-sm truncate">
                    #{duck.student.stt} {duck.student.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    Tổ {duck.student.group} • {duck.student.role}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectWinner(
                      duck.student,
                      idx === 0 ? 'VÔ ĐỊCH ĐUA VỊT MAY MẮN!' : `HẠNG ${idx + 1} ĐUA VỊT!`,
                      'Chúc mừng bạn nhỏ siêu tốc độ đã về đích rực rỡ! 🦆🏆',
                      '🦆'
                    );
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-amber-100 text-purple-900 rounded-xl border border-amber-300 text-[11px] font-black shadow-2xs cursor-pointer active:scale-95 transition"
                >
                  Gọi Tên
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CELEBRATION PODIUM MODAL                                               */}
      {/* ========================================================================= */}
      {showPodiumModal && topWinners.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border-4 border-amber-300 text-center space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-300/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-yellow-300/30 rounded-full blur-2xl pointer-events-none" />

            <button
              type="button"
              onClick={() => setShowPodiumModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-amber-50 hover:bg-amber-100 text-slate-500 flex items-center justify-center cursor-pointer transition shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Trophy Banner */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 text-purple-950 px-6 py-2 rounded-full text-xs sm:text-sm font-black shadow-lg uppercase tracking-wider animate-bounce">
              <span className="text-lg">🦆</span>
              <span>BỤC VINH QUANG ĐUA VỊT MAY MẮN</span>
              <Sparkles className="w-4 h-4 text-purple-950" />
            </div>

            {/* Visual Podium Stage: 2nd - 1st - 3rd */}
            {raceMode === 'single' || topWinners.length === 1 ? (
              /* Single Winner Grand Display */
              <div className="space-y-4 py-2">
                <div className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl z-20 animate-bounce">
                    👑
                  </div>
                  <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-400 p-1.5 shadow-2xl shadow-amber-400/40">
                    <div className="w-full h-full rounded-[20px] bg-white overflow-hidden flex items-center justify-center">
                      {topWinners[0].student.avatarUrl ? (
                        <img
                          src={topWinners[0].student.avatarUrl}
                          alt={topWinners[0].student.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl sm:text-4xl font-black text-amber-700">
                          {getStudentInitials(topWinners[0].student.name)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-black text-amber-700 uppercase tracking-widest">
                    🎉 NHÀ VÔ ĐỊCH ĐUA VỊT:
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                    #{topWinners[0].student.stt} {topWinners[0].student.name}
                  </h3>
                  <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200">
                      Tổ {topWinners[0].student.group}
                    </span>
                    <span className="text-xs font-black text-amber-900 bg-amber-100 px-3 py-1 rounded-full border border-amber-200">
                      {topWinners[0].student.role}
                    </span>
                    <span className="text-xs font-black text-pink-700 bg-pink-100 px-3 py-1 rounded-full border border-pink-200">
                      🌸 {topWinners[0].student.flowerPoints} hoa
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Top 3 Podium Arrangement */
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2">
                {/* 2nd Place (Silver) */}
                {topWinners[1] && (
                  <div className="space-y-2 order-1">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl z-20">
                        🥈
                      </div>
                      <div className="w-full h-full rounded-2xl bg-slate-300 p-1 shadow-md">
                        <div className="w-full h-full rounded-xl bg-white overflow-hidden flex items-center justify-center">
                          {topWinners[1].student.avatarUrl ? (
                            <img
                              src={topWinners[1].student.avatarUrl}
                              alt={topWinners[1].student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg sm:text-xl font-black text-slate-600">
                              {getStudentInitials(topWinners[1].student.name)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-slate-100 border-2 border-slate-300 rounded-2xl p-2.5 h-28 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-black text-slate-600 uppercase">HẠNG 2</div>
                        <div className="font-black text-xs sm:text-sm text-slate-800 line-clamp-1">
                          {topWinners[1].student.name.split(' ').slice(-1)[0]}
                        </div>
                        <div className="text-[10px] text-slate-500">Tổ {topWinners[1].student.group}</div>
                      </div>
                      {onAwardBonusPoints && (
                        <button
                          type="button"
                          onClick={() => {
                            onAwardBonusPoints(topWinners[1].student, 2);
                            sound.playReward();
                          }}
                          className="w-full py-1 bg-white hover:bg-slate-200 text-purple-900 rounded-lg text-[10px] font-black border border-slate-300 cursor-pointer shadow-2xs"
                        >
                          +2 🌸
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 1st Place (Gold Champion) */}
                {topWinners[0] && (
                  <div className="space-y-2 order-2 -mt-6">
                    <div className="relative w-20 h-20 sm:w-26 sm:h-26 mx-auto">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-2xl z-20 animate-bounce">
                        👑
                      </div>
                      <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-orange-400 p-1.5 shadow-xl shadow-amber-300/50">
                        <div className="w-full h-full rounded-[20px] bg-white overflow-hidden flex items-center justify-center">
                          {topWinners[0].student.avatarUrl ? (
                            <img
                              src={topWinners[0].student.avatarUrl}
                              alt={topWinners[0].student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl sm:text-3xl font-black text-amber-700">
                              {getStudentInitials(topWinners[0].student.name)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-b from-amber-100 to-yellow-100 border-2 border-amber-300 rounded-2xl p-3 h-36 flex flex-col justify-between shadow-md">
                      <div>
                        <div className="text-[11px] font-black text-amber-900 uppercase">🥇 VÔ ĐỊCH</div>
                        <div className="font-black text-xs sm:text-base text-amber-950 line-clamp-1">
                          #{topWinners[0].student.stt} {topWinners[0].student.name}
                        </div>
                        <div className="text-[11px] text-amber-800 font-bold">
                          Tổ {topWinners[0].student.group}
                        </div>
                      </div>
                      {onAwardBonusPoints && (
                        <button
                          type="button"
                          onClick={() => {
                            onAwardBonusPoints(topWinners[0].student, 3);
                            sound.playReward();
                          }}
                          className="w-full py-1.5 bg-gradient-to-r from-amber-400 to-orange-400 text-purple-950 rounded-xl text-xs font-black shadow-xs cursor-pointer active:scale-95 transition"
                        >
                          +3 🌸 Thưởng
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 3rd Place (Bronze) */}
                {topWinners[2] && (
                  <div className="space-y-2 order-3">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xl z-20">
                        🥉
                      </div>
                      <div className="w-full h-full rounded-2xl bg-amber-600 p-1 shadow-md">
                        <div className="w-full h-full rounded-xl bg-white overflow-hidden flex items-center justify-center">
                          {topWinners[2].student.avatarUrl ? (
                            <img
                              src={topWinners[2].student.avatarUrl}
                              alt={topWinners[2].student.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg sm:text-xl font-black text-amber-800">
                              {getStudentInitials(topWinners[2].student.name)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-2.5 h-24 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] font-black text-orange-700 uppercase">HẠNG 3</div>
                        <div className="font-black text-xs sm:text-sm text-slate-800 line-clamp-1">
                          {topWinners[2].student.name.split(' ').slice(-1)[0]}
                        </div>
                        <div className="text-[10px] text-slate-500">Tổ {topWinners[2].student.group}</div>
                      </div>
                      {onAwardBonusPoints && (
                        <button
                          type="button"
                          onClick={() => {
                            onAwardBonusPoints(topWinners[2].student, 1);
                            sound.playReward();
                          }}
                          className="w-full py-1 bg-white hover:bg-orange-100 text-purple-900 rounded-lg text-[10px] font-black border border-orange-300 cursor-pointer shadow-2xs"
                        >
                          +1 🌸
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (topWinners[0] && onExcludeStudent) {
                    onExcludeStudent(topWinners[0].student.id);
                  }
                  setShowPodiumModal(false);
                }}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 rounded-2xl text-xs font-black transition cursor-pointer active:scale-95 shadow-xs"
              >
                🚫 Bỏ qua lượt sau
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPodiumModal(false);
                  setupRacers();
                }}
                className="px-3.5 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-200 rounded-2xl text-xs font-black transition cursor-pointer active:scale-95 shadow-xs"
              >
                🔄 Đổi Vịt Đua Tiếp
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowPodiumModal(false);
                  handleResetRace();
                  setTimeout(() => handleStartRace(), 300);
                }}
                className="candy-btn-gold text-purple-950 px-4 py-2.5 rounded-2xl text-xs font-black transition cursor-pointer active:scale-95 shadow-lg"
              >
                🏁 ĐUA LẦN NỮA!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
