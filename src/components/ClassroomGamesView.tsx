import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Student, DailyAttendance, PointCategory, ClassConfig } from '../types';
import { sound } from '../utils/soundEffects';
import { fireSuperConfetti, getStudentInitials } from '../utils/helpers';
import { 
  Sparkles, 
  Crown, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  Users, 
  Check, 
  Trophy, 
  Filter, 
  X, 
  ChevronRight,
  Fish,
  Egg,
  Gift,
  Waves,
  Zap,
  Star,
  Heart,
  Smile,
  Compass,
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { DuckRaceGame } from './DuckRaceGame';
import { WheelOfFortuneGame } from './WheelOfFortuneGame';

export type GameViewMode = 'hub' | 'wheel' | 'duck_race' | 'balloons' | 'fishing' | 'magic_eggs';
export type FilterMode = 'all' | 'custom' | 'uncalled_only' | 'random_5' | 'random_10' | 'random_15';

interface ClassroomGamesViewProps {
  students: Student[];
  attendance: DailyAttendance;
  config?: ClassConfig;
  onAwardPoints?: (studentIds: string[], delta: number, reason: string, category: PointCategory) => void;
}

// 🎨 10 Vibrant & Glossy Balloon Themes with Highlights & Ropes
const BALLOON_THEMES = [
  { bg: 'from-pink-400 via-rose-500 to-rose-600', border: '#F43F5E', glow: 'rgba(244,63,94,0.4)', string: '#BE123C', icon: '💖', label: 'Hồng Kẹo Ngọt' },
  { bg: 'from-purple-400 via-indigo-500 to-purple-600', border: '#8B5CF6', glow: 'rgba(139,92,246,0.4)', string: '#6D28D9', icon: '⭐', label: 'Tím Ngân Hà' },
  { bg: 'from-sky-400 via-cyan-500 to-blue-600', border: '#0EA5E9', glow: 'rgba(14,165,233,0.4)', string: '#0369A1', icon: '💎', label: 'Xanh Biển Biếc' },
  { bg: 'from-emerald-400 via-teal-500 to-teal-600', border: '#10B981', glow: 'rgba(16,185,129,0.4)', string: '#047857', icon: '🍀', label: 'Xanh May Mắn' },
  { bg: 'from-amber-400 via-orange-500 to-orange-600', border: '#F59E0B', glow: 'rgba(245,158,11,0.4)', string: '#B45309', icon: '🌟', label: 'Cam Năng Lượng' },
  { bg: 'from-fuchsia-400 via-pink-500 to-fuchsia-600', border: '#D946EF', glow: 'rgba(217,70,239,0.4)', string: '#A21CAF', icon: '🎀', label: 'Hồng Phấn Điệu' },
  { bg: 'from-lime-400 via-green-500 to-emerald-600', border: '#84CC16', glow: 'rgba(132,204,22,0.4)', string: '#4D7C0F', icon: '🌿', label: 'Xanh Tươi Mới' },
  { bg: 'from-violet-400 via-purple-600 to-indigo-700', border: '#7C3AED', glow: 'rgba(124,58,237,0.4)', string: '#4C1D95', icon: '🔮', label: 'Tím Huyền Bí' },
  { bg: 'from-red-400 via-rose-500 to-pink-600', border: '#E11D48', glow: 'rgba(225,29,72,0.4)', string: '#9F1239', icon: '🍒', label: 'Đỏ Nhiệt Huyết' },
  { bg: 'from-yellow-300 via-amber-400 to-amber-500', border: '#EAB308', glow: 'rgba(234,179,8,0.4)', string: '#A16207', icon: '👑', label: 'Vàng Hoàng Kim' },
];

// 🎨 8 Unique Detailed Surprise Egg Patterns
const EGG_THEMES = [
  { bg: 'from-pink-300 via-rose-300 to-pink-400', pattern: 'hearts', accent: '#BE185D', shell: '#FFF1F2', icon: '💖', name: 'Trứng Trái Tim' },
  { bg: 'from-purple-300 via-indigo-300 to-purple-400', pattern: 'stars', accent: '#6D28D9', shell: '#FAF5FF', icon: '⭐', name: 'Trứng Ngôi Sao' },
  { bg: 'from-sky-300 via-cyan-300 to-sky-400', pattern: 'waves', accent: '#0369A1', shell: '#F0F9FF', icon: '🌊', name: 'Trứng Sóng Biển' },
  { bg: 'from-amber-300 via-yellow-300 to-amber-400', pattern: 'crowns', accent: '#B45309', shell: '#FEFCE8', icon: '👑', name: 'Trứng Hoàng Gia' },
  { bg: 'from-emerald-300 via-teal-300 to-emerald-400', pattern: 'dots', accent: '#047857', shell: '#ECFDF5', icon: '🍀', name: 'Trứng Cỏ May Mắn' },
  { bg: 'from-fuchsia-300 via-pink-300 to-fuchsia-400', pattern: 'rainbow', accent: '#A21CAF', shell: '#FDF4FF', icon: '🌈', name: 'Trứng Cầu Vồng' },
  { bg: 'from-orange-300 via-amber-300 to-orange-400', pattern: 'sun', accent: '#C2410C', shell: '#FFF7ED', icon: '☀️', name: 'Trứng Mặt Trời' },
  { bg: 'from-lime-300 via-green-300 to-emerald-400', pattern: 'flowers', accent: '#15803D', shell: '#F7FEE7', icon: '🌸', name: 'Trứng Hoa Cúc' },
];

// 🎨 8 Cute Ocean Fish Species
const FISH_SPECIES = [
  { name: 'Cá Hề Cam', color1: '#FB923C', color2: '#EA580C', stripe: '#FFFFFF', eye: '#0F172A', fin: '#FDBA74', type: 'clownfish' },
  { name: 'Cá Tiên Tím', color1: '#C084FC', color2: '#9333EA', stripe: '#FDF4FF', eye: '#0F172A', fin: '#E9D5FF', type: 'angelfish' },
  { name: 'Cá Vàng Lấp Lánh', color1: '#FACC15', color2: '#CA8A04', stripe: '#FEF08A', eye: '#0F172A', fin: '#FEF08A', type: 'goldfish' },
  { name: 'Cá Ngọc Lam', color1: '#38BDF8', color2: '#0284C7', stripe: '#E0F2FE', eye: '#0F172A', fin: '#BAE6FD', type: 'tang' },
  { name: 'Cá Hồng Phấn', color1: '#F472B6', color2: '#DB2777', stripe: '#FFF1F2', eye: '#0F172A', fin: '#FBCFE8', type: 'guppy' },
  { name: 'Cá Bạc Hà', color1: '#34D399', color2: '#059669', stripe: '#ECFDF5', eye: '#0F172A', fin: '#A7F3D0', type: 'tetra' },
  { name: 'Cá Hoàng Yến', color1: '#FDE047', color2: '#EAB308', stripe: '#FEF9C3', eye: '#0F172A', fin: '#FEF08A', type: 'canary' },
  { name: 'Cá Cầu Vồng', color1: '#E879F9', color2: '#A855F7', stripe: '#FAE8FF', eye: '#0F172A', fin: '#F0ABFC', type: 'rainbow' },
];

export const ClassroomGamesView: React.FC<ClassroomGamesViewProps> = ({
  students,
  attendance,
  config,
  onAwardPoints,
}) => {
  // Navigation: 'hub' (selector) or specific game
  const [activeGame, setActiveGame] = useState<GameViewMode>('hub');

  // Teacher Filter Settings
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [onlyPresent, setOnlyPresent] = useState<boolean>(true);
  const [noRepeatMode, setNoRepeatMode] = useState<boolean>(true); // "Không lặp lại học sinh"
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [customSelectedIds, setCustomSelectedIds] = useState<string[]>([]);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [calledHistory, setCalledHistory] = useState<{ student: Student; game: GameViewMode; timestamp: number }[]>([]);

  // Sound toggle
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Common Winner Popup State
  const [winnerStudent, setWinnerStudent] = useState<Student | null>(null);
  const [winnerTitle, setWinnerTitle] = useState<string>('XIN MỜI');
  const [winnerSub, setWinnerSub] = useState<string>('Chúc mừng bạn!');
  const [winnerIcon, setWinnerIcon] = useState<string>('🎉');
  const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

  // -------------------------------------------------------------------------
  // GAME 1: 🎈 BÓNG BAY MAY MẮN STATE
  // -------------------------------------------------------------------------
  const [poppedBalloonIds, setPoppedBalloonIds] = useState<string[]>([]);
  const [shakingBalloonId, setShakingBalloonId] = useState<string | null>(null);
  const [burstingBalloonId, setBurstingBalloonId] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // GAME 2: 🐠 CÁ NÀO CẮN CÂU STATE
  // -------------------------------------------------------------------------
  const [isFishing, setIsFishing] = useState<boolean>(false);
  const [hookDepth, setHookDepth] = useState<number>(10); // percent from top
  const [hookedStudentId, setHookedStudentId] = useState<string | null>(null);
  const [caughtStudentIds, setCaughtStudentIds] = useState<string[]>([]);
  const [fishSwimData, setFishSwimData] = useState<Record<string, { x: number; y: number; speed: number; dir: number }>>({});
  const fishAnimIdRef = useRef<number | null>(null);

  // -------------------------------------------------------------------------
  // GAME 3: 🥚 TRỨNG KỲ DIỆU STATE
  // -------------------------------------------------------------------------
  const [openedEggIds, setOpenedEggIds] = useState<string[]>([]);
  const [crackingEggId, setCrackingEggId] = useState<string | null>(null);
  const [eggCrackProgress, setEggCrackProgress] = useState<number>(0); // 0 -> 1 -> 2 -> 3 (open)

  // -------------------------------------------------------------------------
  // FILTER ACTIVE POOL OF PARTICIPANTS
  // -------------------------------------------------------------------------
  const activePool = useMemo(() => {
    return students.filter((s) => {
      // 1. Attendance check
      if (onlyPresent) {
        const att = attendance.records?.[s.id];
        if (att && (att.status === 'excused' || att.status === 'unexcused')) {
          return false;
        }
      }

      // 2. Excluded list
      if (excludedIds.includes(s.id)) {
        return false;
      }

      // 3. Filter mode
      if (filterMode === 'uncalled_only') {
        const alreadyCalled = calledHistory.some((h) => h.student.id === s.id);
        if (alreadyCalled) return false;
      }

      if (filterMode === 'custom') {
        if (customSelectedIds.length > 0 && !customSelectedIds.includes(s.id)) {
          return false;
        }
      }

      // 4. Group check
      if (selectedGroup !== 'all' && s.group !== selectedGroup) {
        return false;
      }

      return true;
    });
  }, [students, attendance, onlyPresent, excludedIds, filterMode, customSelectedIds, selectedGroup, calledHistory]);

  // Handle Quick Sample selection (5, 10, 15 students)
  const handleApplyQuickSample = (count: number) => {
    sound.playClick();
    const available = students.filter((s) => {
      if (onlyPresent) {
        const att = attendance.records?.[s.id];
        if (att && (att.status === 'excused' || att.status === 'unexcused')) return false;
      }
      if (excludedIds.includes(s.id)) return false;
      return true;
    });

    const shuffled = [...available].sort(() => 0.5 - Math.random());
    const picked = shuffled.slice(0, Math.min(count, shuffled.length)).map((s) => s.id);
    setCustomSelectedIds(picked);
    setFilterMode('custom');
  };

  // Reset/Restore all students to pool & games
  const handleRestoreAll = () => {
    sound.playClick();
    setExcludedIds([]);
    setCustomSelectedIds([]);
    setFilterMode('all');
    setSelectedGroup('all');
    setPoppedBalloonIds([]);
    setCaughtStudentIds([]);
    setOpenedEggIds([]);
    setHookedStudentId(null);
    setIsFishing(false);
    setHookDepth(10);
  };

  // Exclude chosen student temporarily
  const handleExcludeStudent = (studentId: string) => {
    sound.playClick();
    setExcludedIds((prev) => (prev.includes(studentId) ? prev : [...prev, studentId]));
    setShowWinnerModal(false);
  };

  // Award Bonus Points to student
  const handleAwardBonus = (student: Student, points: number) => {
    if (!onAwardPoints) return;
    sound.playReward();
    let gameTitle = 'Trò chơi lớp học';
    if (activeGame === 'wheel') gameTitle = 'Vòng quay gọi tên';
    else if (activeGame === 'balloons') gameTitle = 'Bóng bay may mắn';
    else if (activeGame === 'fishing') gameTitle = 'Cá nào cắn câu';
    else if (activeGame === 'magic_eggs') gameTitle = 'Trứng kỳ diệu';
    else if (activeGame === 'duck_race') gameTitle = 'Đua vịt may mắn';
    
    onAwardPoints([student.id], points, `Thưởng trò chơi: ${gameTitle}`, 'academic');
  };

  // Trigger Winner Pop-up Celebration
  const triggerWinner = (student: Student, title: string, sub: string, icon: string, gameKey: GameViewMode) => {
    setWinnerStudent(student);
    setWinnerTitle(title);
    setWinnerSub(sub);
    setWinnerIcon(icon);
    setShowWinnerModal(true);
    setCalledHistory((prev) => [{ student, game: gameKey, timestamp: Date.now() }, ...prev]);

    // If "Không lặp lại học sinh" is toggled ON, auto-exclude for subsequent rounds
    if (noRepeatMode) {
      setExcludedIds((prev) => (prev.includes(student.id) ? prev : [...prev, student.id]));
    }

    if (soundEnabled) {
      sound.playTing();
      setTimeout(() => sound.playPolySynthTriumph(), 150);
    }
    fireSuperConfetti();
  };

  // =========================================================================
  // 1. 🎈 BÓNG BAY MAY MẮN (Lucky Balloons Engine)
  // =========================================================================
  const availableBalloons = useMemo(() => {
    return activePool.filter((s) => !poppedBalloonIds.includes(s.id));
  }, [activePool, poppedBalloonIds]);

  const handlePopBalloon = (student: Student) => {
    if (shakingBalloonId || burstingBalloonId || poppedBalloonIds.includes(student.id)) return;

    setShakingBalloonId(student.id);
    if (soundEnabled) sound.playClick();

    // 1. Shake for 350ms, then trigger burst particles and POP sound
    setTimeout(() => {
      setShakingBalloonId(null);
      setBurstingBalloonId(student.id);
      if (soundEnabled) sound.playBalloonPop();

      setTimeout(() => {
        setPoppedBalloonIds((prev) => [...prev, student.id]);
        setBurstingBalloonId(null);

        // 2. Reveal Winner
        triggerWinner(student, 'XIN MỜI BẠN', 'Bóng bay nổ tung ngôi sao! 🎉', '🎈', 'balloons');
      }, 300);
    }, 350);
  };

  const handleRandomPopBalloon = () => {
    if (availableBalloons.length === 0 || shakingBalloonId || burstingBalloonId) return;
    const randomBalloon = availableBalloons[Math.floor(Math.random() * availableBalloons.length)];
    handlePopBalloon(randomBalloon);
  };

  // =========================================================================
  // 2. 🐠 CÁ NÀO CẮN CÂU (Cute Aquarium Fishing Engine)
  // =========================================================================
  const availableFish = useMemo(() => {
    return activePool.filter((s) => !caughtStudentIds.includes(s.id));
  }, [activePool, caughtStudentIds]);

  // Initialize and animate fish swimming positions
  useEffect(() => {
    if (activeGame !== 'fishing') return;

    const initialSwim: Record<string, { x: number; y: number; speed: number; dir: number }> = {};
    availableFish.forEach((s, idx) => {
      initialSwim[s.id] = {
        x: 8 + (idx * 16) % 78,
        y: 25 + (idx * 21) % 60,
        speed: 0.18 + (idx % 4) * 0.07,
        dir: idx % 2 === 0 ? 1 : -1,
      };
    });
    setFishSwimData(initialSwim);

    const animateFish = () => {
      setFishSwimData((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((id) => {
          const f = next[id];
          if (!f) return;
          let newX = f.x + f.speed * f.dir * 0.28;
          let newDir = f.dir;
          if (newX > 88) {
            newX = 88;
            newDir = -1;
          } else if (newX < 4) {
            newX = 4;
            newDir = 1;
          }
          next[id] = { ...f, x: newX, dir: newDir };
        });
        return next;
      });
      fishAnimIdRef.current = requestAnimationFrame(animateFish);
    };

    fishAnimIdRef.current = requestAnimationFrame(animateFish);
    return () => {
      if (fishAnimIdRef.current) cancelAnimationFrame(fishAnimIdRef.current);
    };
  }, [activeGame, availableFish.length]);

  // Action: Thả câu bắt cá ngẫu nhiên
  const handleCastFishingRod = () => {
    if (isFishing || availableFish.length === 0) return;

    setIsFishing(true);
    setHookedStudentId(null);
    setHookDepth(15);
    if (soundEnabled) sound.playClick();

    // 1. Lower fishing hook down (1.2s)
    let depth = 15;
    const targetDepth = 55 + Math.random() * 22;

    const lowerInterval = setInterval(() => {
      depth += 3;
      setHookDepth(depth);
      if (depth >= targetDepth) {
        clearInterval(lowerInterval);

        // 2. Pick a random lucky fish
        const luckyStudent = availableFish[Math.floor(Math.random() * availableFish.length)];
        setHookedStudentId(luckyStudent.id);

        if (soundEnabled) {
          sound.playFishBite();
        }

        // 3. Reel the fish back up gently
        setTimeout(() => {
          const reelInterval = setInterval(() => {
            depth -= 4;
            setHookDepth(depth);
            if (depth <= 18) {
              clearInterval(reelInterval);
              setIsFishing(false);
              setCaughtStudentIds((prev) => [...prev, luckyStudent.id]);

              // 4. Trigger Celebration Popup
              triggerWinner(
                luckyStudent,
                'CÁ ĐÃ CẮN CÂU!',
                'Xin chúc mừng chú cá may mắn đớp mồi! 🐠',
                '🎣',
                'fishing'
              );
            }
          }, 35);
        }, 600);
      }
    }, 30);
  };

  // =========================================================================
  // 3. 🥚 TRỨNG KỲ DIỆU (Magic Eggs Cracking & Hatching Engine)
  // =========================================================================
  const availableEggs = useMemo(() => {
    return activePool.filter((s) => !openedEggIds.includes(s.id));
  }, [activePool, openedEggIds]);

  const handleCrackEgg = (student: Student) => {
    if (crackingEggId || openedEggIds.includes(student.id)) return;

    setCrackingEggId(student.id);
    setEggCrackProgress(1);
    if (soundEnabled) sound.playEggCrack();

    // Step 2: Cracks expand with light
    setTimeout(() => {
      setEggCrackProgress(2);
      if (soundEnabled) sound.playEggCrack();

      // Step 3: Egg bursts open with magic sparkles
      setTimeout(() => {
        setEggCrackProgress(3);
        if (soundEnabled) sound.playEggHatch();
        setOpenedEggIds((prev) => [...prev, student.id]);

        // Step 4: Show Winner
        setTimeout(() => {
          setCrackingEggId(null);
          setEggCrackProgress(0);
          triggerWinner(
            student,
            'TRỨNG KỲ DIỆU ĐÃ MỞ!',
            'Bé yêu đã nở ra từ quả trứng bí ẩn! ✨🐣',
            '🥚',
            'magic_eggs'
          );
        }, 550);
      }, 500);
    }, 450);
  };

  const handleRandomCrackEgg = () => {
    if (availableEggs.length === 0 || crackingEggId) return;
    const randomEgg = availableEggs[Math.floor(Math.random() * availableEggs.length)];
    handleCrackEgg(randomEgg);
  };

  return (
    <div id="classroom-games-container" className="space-y-6">
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border-2 border-pink-200 shadow-xl shadow-pink-100/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('hub');
            }}
            title="Về menu chọn trò chơi"
            className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#A855F7] via-[#EC4899] to-[#F59E0B] text-white flex items-center justify-center font-black shadow-lg shadow-pink-300/40 text-2xl hover:scale-105 transition cursor-pointer border-2 border-white"
          >
            🎮
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              {activeGame === 'hub' && 'Trung Tâm Trò Chơi Lớp Học'}
              {activeGame === 'wheel' && '🎡 Vòng Quay Gọi Tên'}
              {activeGame === 'duck_race' && '🦆 Đua Vịt May Mắn'}
              {activeGame === 'balloons' && '🎈 Bóng Bay May Mắn'}
              {activeGame === 'fishing' && '🐠 Cá Nào Cắn Câu?'}
              {activeGame === 'magic_eggs' && '🥚 Trứng Kỳ Diệu'}
            </h2>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Tự động kết nối {students.length} học sinh • Hoạt hình sống động & âm thanh vui nhộn
            </p>
          </div>
        </div>

        {/* Game Navigation Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 p-1.5 rounded-2xl border-2 border-pink-200 flex-wrap">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('hub');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
              activeGame === 'hub'
                ? 'candy-btn-purple text-white shadow-md'
                : 'text-slate-600 hover:text-purple-700 hover:bg-white/80'
            }`}
          >
            <span>🎮 Menu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('wheel');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
              activeGame === 'wheel'
                ? 'candy-btn-pink text-white shadow-md'
                : 'text-slate-600 hover:text-pink-700 hover:bg-white/80'
            }`}
          >
            <span>🎡 Vòng quay</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('duck_race');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
              activeGame === 'duck_race'
                ? 'candy-btn-gold text-purple-950 shadow-md'
                : 'text-slate-600 hover:text-amber-700 hover:bg-white/80'
            }`}
          >
            <span>🦆 Đua vịt</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('balloons');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
              activeGame === 'balloons'
                ? 'candy-btn-pink text-white shadow-md'
                : 'text-slate-600 hover:text-pink-700 hover:bg-white/80'
            }`}
          >
            <span>🎈 Bóng bay</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('fishing');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
              activeGame === 'fishing'
                ? 'candy-btn-purple text-white shadow-md'
                : 'text-slate-600 hover:text-sky-700 hover:bg-white/80'
            }`}
          >
            <span>🐠 Thả câu</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveGame('magic_eggs');
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer ${
              activeGame === 'magic_eggs'
                ? 'candy-btn-gold text-purple-950 shadow-md'
                : 'text-slate-600 hover:text-amber-700 hover:bg-white/80'
            }`}
          >
            <span>🥚 Đập trứng</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sound.setEnabled(next);
            }}
            title={soundEnabled ? 'Tắt âm thanh trò chơi' : 'Bật âm thanh trò chơi'}
            className="p-2 text-slate-500 hover:text-purple-700 hover:bg-white rounded-xl transition cursor-pointer border border-pink-200 ml-auto md:ml-1 shadow-xs"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-600 animate-pulse" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </div>

      {/* 2. TÙY CHỌN CHUNG CHO CẢ 3 TRÒ CHƠI (Shared Teacher Controls) */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-pink-200 shadow-lg shadow-pink-100/40 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-pink-100">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-sm shadow-xs">
              ⚙️
            </span>
            <span className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
              Bộ Lọc Gọi Tên Học Sinh
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-black text-pink-700 bg-pink-100/80 px-3.5 py-1.5 rounded-full border border-pink-200 shadow-xs">
              👥 Sẵn sàng: <strong>{activePool.length}</strong> / {students.length} em
            </span>

            {/* Toggle: Không lặp lại học sinh */}
            <label className="flex items-center gap-2 text-xs font-black text-slate-700 bg-amber-50 hover:bg-amber-100 px-3.5 py-1.5 rounded-full border border-amber-200 cursor-pointer select-none transition shadow-xs">
              <input
                type="checkbox"
                checked={noRepeatMode}
                onChange={(e) => setNoRepeatMode(e.target.checked)}
                className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-400 cursor-pointer"
              />
              <span>Không lặp lại học sinh</span>
            </label>

            {(excludedIds.length > 0 || filterMode !== 'all' || selectedGroup !== 'all' || poppedBalloonIds.length > 0 || caughtStudentIds.length > 0 || openedEggIds.length > 0) && (
              <button
                type="button"
                onClick={handleRestoreAll}
                className="px-3.5 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-md"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Làm mới tất cả ({students.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Filter Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setFilterMode('all');
              setSelectedGroup('all');
            }}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer border-2 shadow-xs ${
              filterMode === 'all' && selectedGroup === 'all'
                ? 'bg-purple-100 text-purple-800 border-purple-400 scale-[1.02]'
                : 'bg-white text-slate-600 border-pink-100 hover:bg-pink-50'
            }`}
          >
            <span>🏫 Cả lớp ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setFilterMode('uncalled_only');
            }}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer border-2 shadow-xs ${
              filterMode === 'uncalled_only'
                ? 'bg-purple-100 text-purple-800 border-purple-400 scale-[1.02]'
                : 'bg-white text-slate-600 border-pink-100 hover:bg-pink-50'
            }`}
          >
            <span>🎯 Chưa được gọi</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyQuickSample(5)}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer border-2 shadow-xs ${
              filterMode === 'custom' && customSelectedIds.length === 5
                ? 'bg-pink-100 text-pink-800 border-pink-400 scale-[1.02]'
                : 'bg-white text-slate-600 border-pink-100 hover:bg-pink-50'
            }`}
          >
            <span>🎲 Ngẫu nhiên 5 em</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyQuickSample(10)}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer border-2 shadow-xs ${
              filterMode === 'custom' && customSelectedIds.length === 10
                ? 'bg-pink-100 text-pink-800 border-pink-400 scale-[1.02]'
                : 'bg-white text-slate-600 border-pink-100 hover:bg-pink-50'
            }`}
          >
            <span>🎲 Ngẫu nhiên 10 em</span>
          </button>

          <button
            type="button"
            onClick={() => handleApplyQuickSample(15)}
            className={`px-3 py-2.5 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer border-2 shadow-xs ${
              filterMode === 'custom' && customSelectedIds.length === 15
                ? 'bg-pink-100 text-pink-800 border-pink-400 scale-[1.02]'
                : 'bg-white text-slate-600 border-pink-100 hover:bg-pink-50'
            }`}
          >
            <span>🎲 Ngẫu nhiên 15 em</span>
          </button>

          <label className="px-3 py-2.5 bg-white hover:bg-pink-50 text-slate-700 border-2 border-pink-100 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer select-none shadow-xs">
            <input
              type="checkbox"
              checked={onlyPresent}
              onChange={(e) => setOnlyPresent(e.target.checked)}
              className="text-purple-600 rounded-md cursor-pointer"
            />
            <span>Bỏ qua vắng mặt</span>
          </label>
        </div>

        {/* Group Tabs */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-[11px] font-black text-slate-500">Lọc theo tổ:</span>
          {[1, 2, 3, 4].map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => {
                sound.playClick();
                setSelectedGroup(selectedGroup === g ? 'all' : g);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedGroup === g
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md font-black'
                  : 'bg-pink-50 text-purple-900 hover:bg-pink-100 border border-pink-200'
              }`}
            >
              {config?.groupNames?.[g as 1 | 2 | 3 | 4] || `Tổ ${g}`}
            </button>
          ))}

          {excludedIds.length > 0 && (
            <span className="text-[11px] font-bold text-rose-600 ml-auto bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              Đang tạm ẩn {excludedIds.length} em
            </span>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. MAIN GAME SCREEN SWITCHER                                          */}
      {/* ===================================================================== */}

      {/* VIEW A: TRANG CHỌN TRÒ CHƠI (HUB / 5 RICH GAME CARDS) */}
      {activeGame === 'hub' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {/* Card 1: 🎡 Vòng Quay Gọi Tên */}
            <div className="bg-gradient-to-b from-pink-50/95 via-purple-50/40 to-white rounded-3xl p-5 sm:p-6 border-3 border-pink-300 shadow-xl shadow-pink-200/50 hover:shadow-2xl hover:-translate-y-2 transition duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group">
              {/* Decorative background glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-pink-300/40 via-amber-200/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 text-7xl opacity-10 pointer-events-none select-none">🎡</div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-400 via-rose-400 to-amber-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-pink-400/40 group-hover:scale-110 group-hover:rotate-12 transition duration-300 border-2 border-white">
                    🎡
                  </div>
                  <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-800 text-xs font-black border border-pink-300 shadow-xs animate-pulse">
                    MỚI NHẤT ⭐
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 group-hover:text-pink-600 transition">
                    Vòng Quay Gọi Tên
                  </h3>
                  <p className="text-xs font-bold text-pink-600 mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Quay một vòng – Chọn một bạn – Cả lớp cùng hồi hộp!
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">
                    Vòng quay rực rỡ sắc màu, âm thanh quay kịch tính và kim chỉ chuyển động hồi hộp để chọn bạn nhỏ phát biểu và kiểm tra bài!
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-pink-800 bg-pink-50/90 p-2.5 rounded-2xl border border-pink-200">
                  <span>✨ {activePool.length} ô quay sẵn sàng</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveGame('wheel');
                }}
                className="candy-btn-pink text-white w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95 z-10"
              >
                <span>CHƠI VÒNG QUAY</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: 🦆 Đua Vịt May Mắn */}
            <div className="bg-gradient-to-b from-yellow-50/90 to-white rounded-3xl p-5 sm:p-6 border-3 border-amber-300 shadow-xl shadow-amber-200/50 hover:shadow-2xl hover:-translate-y-2 transition duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group">
              {/* Decorative water pond glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-yellow-300/40 via-orange-200/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 text-7xl opacity-10 pointer-events-none select-none">🦆</div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-yellow-400 via-amber-400 to-orange-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-400/40 group-hover:scale-110 group-hover:-rotate-6 transition duration-300 border-2 border-white">
                    🦆
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-300">
                    Sôi Động 🌊
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 group-hover:text-amber-600 transition">
                    Đua Vịt May Mắn
                  </h3>
                  <p className="text-xs font-bold text-amber-600 mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Rẽ sóng đường đua – Tìm vịt vô địch!
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">
                    Cùng những chú vịt siêu đáng yêu bơi đua kịch tính trên làn nước để tìm ra bạn nhỏ may mắn chiến thắng và vinh danh Top 3!
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-800 bg-amber-50/80 p-2.5 rounded-2xl border border-amber-200">
                  <span>✨ {activePool.length} chú vịt sẵn sàng đua</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveGame('duck_race');
                }}
                className="candy-btn-gold text-purple-950 w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95 z-10"
              >
                <span>CHƠI ĐUA VỊT</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 3: 🎈 Bóng Bay May Mắn */}
            <div className="bg-gradient-to-b from-pink-50/90 to-white rounded-3xl p-5 sm:p-6 border-3 border-pink-300 shadow-xl shadow-pink-200/50 hover:shadow-2xl hover:-translate-y-2 transition duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group">
              {/* Decorative background glow & clouds */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-pink-300/40 via-rose-200/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 text-7xl opacity-10 pointer-events-none select-none">🎈</div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-pink-400 via-rose-500 to-purple-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-pink-400/40 group-hover:scale-110 group-hover:rotate-6 transition duration-300 border-2 border-white">
                    🎈
                  </div>
                  <span className="px-3 py-1 rounded-full bg-pink-100 text-pink-700 text-xs font-black border border-pink-200">
                    Phổ Biến ⭐
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 group-hover:text-pink-600 transition">
                    Bóng Bay May Mắn
                  </h3>
                  <p className="text-xs font-bold text-pink-600 mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Chạm bóng – Nổ tung ngôi sao!
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">
                    Bầu trời kẹo ngọt với những chùm bóng bay bồng bềnh 3D rực rỡ. Chạm bóng để tạo tiếng nổ vui tai và hé lộ tên bạn nhỏ may mắn!
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-purple-700 bg-purple-50/80 p-2.5 rounded-2xl border border-purple-100">
                  <span>✨ {availableBalloons.length} quả bóng đang bay</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveGame('balloons');
                }}
                className="candy-btn-pink text-white w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95 z-10"
              >
                <span>CHƠI BÓNG BAY</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 4: 🐠 Cá Nào Cắn Câu? */}
            <div className="bg-gradient-to-b from-sky-50/90 to-white rounded-3xl p-5 sm:p-6 border-3 border-sky-300 shadow-xl shadow-sky-200/50 hover:shadow-2xl hover:-translate-y-2 transition duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group">
              {/* Decorative ocean glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-sky-300/40 via-blue-200/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 text-7xl opacity-10 pointer-events-none select-none">🐠</div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-sky-400/40 group-hover:scale-110 group-hover:-rotate-6 transition duration-300 border-2 border-white">
                    🐠
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-black border border-sky-200">
                    Thủy Cung 🌊
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 group-hover:text-sky-600 transition">
                    Cá Nào Cắn Câu?
                  </h3>
                  <p className="text-xs font-bold text-sky-600 mt-0.5 flex items-center gap-1">
                    <Waves className="w-3.5 h-3.5" /> Thả mồi – Kéo chú cá xinh xắn!
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">
                    Thủy cung đại dương hoạt hình với san hô, bọt nước nổi và đàn cá tung tăng bơi lội. Thả dây câu để câu cá lên bờ!
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-sky-700 bg-sky-50/80 p-2.5 rounded-2xl border border-sky-100">
                  <span>✨ {availableFish.length} chú cá đang bơi</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveGame('fishing');
                }}
                className="candy-btn-purple text-white w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95 z-10"
              >
                <span>CHƠI THẢ CÂU</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 5: 🥚 Trứng Kỳ Diệu */}
            <div className="bg-gradient-to-b from-amber-50/90 to-white rounded-3xl p-5 sm:p-6 border-3 border-amber-300 shadow-xl shadow-amber-200/50 hover:shadow-2xl hover:-translate-y-2 transition duration-300 flex flex-col justify-between space-y-5 relative overflow-hidden group">
              {/* Decorative garden glow */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-amber-300/40 via-yellow-200/20 to-transparent rounded-bl-full pointer-events-none" />
              <div className="absolute -bottom-6 -right-6 text-7xl opacity-10 pointer-events-none select-none">🥚</div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-orange-500 text-white flex items-center justify-center text-3xl shadow-lg shadow-amber-400/40 group-hover:scale-110 group-hover:rotate-6 transition duration-300 border-2 border-white">
                    🥚
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-black border border-amber-200">
                    Bất Ngờ 🐣
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-800 group-hover:text-amber-600 transition">
                    Trứng Kỳ Diệu
                  </h3>
                  <p className="text-xs font-bold text-amber-600 mt-0.5 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Đập trứng – Gà con nở ra!
                  </p>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed font-medium">
                    Vườn hoa cỏ mùa xuân với những quả trứng thần kỳ rực rỡ họa tiết. Chạm để vỏ trứng nứt rạn và bé yêu xuất hiện!
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-bold text-amber-800 bg-amber-50/80 p-2.5 rounded-2xl border border-amber-100">
                  <span>✨ {availableEggs.length} quả trứng bí ẩn</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setActiveGame('magic_eggs');
                }}
                className="candy-btn-gold text-purple-950 w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition active:scale-95 z-10"
              >
                <span>CHƠI ĐẬP TRỨNG</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 1: 🎈 BÓNG BAY MAY MẮN (Enhanced Sky Stage)                      */}
      {/* ===================================================================== */}
      {activeGame === 'balloons' && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border-2 border-pink-200 shadow-xl shadow-pink-100/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-pink-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🎈</span>
              <div>
                <h3 className="font-black text-lg text-slate-800 flex items-center gap-2">
                  Bầu Trời Bóng Bay May Mắn
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Còn lại <strong>{availableBalloons.length}</strong> quả bóng đang bay • Nhấp bóng bất kỳ hoặc bấm nút bên dưới!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setPoppedBalloonIds([]);
                }}
                className="px-4 py-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border-2 border-pink-200 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thả Lại Bóng</span>
              </button>

              <button
                type="button"
                onClick={handleRandomPopBalloon}
                disabled={availableBalloons.length === 0}
                className="candy-btn-purple text-white px-5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-md disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>BẮN NỔ NGẪU NHIÊN</span>
              </button>
            </div>
          </div>

          {/* Sky Canvas / Floating Balloons Grid */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#BAE6FD] via-[#FCE7F3] to-[#FEF3C7] border-4 border-pink-300 p-6 sm:p-8 min-h-[420px] flex items-center justify-center overflow-hidden shadow-inner select-none">
            {/* Drifting Clouds & Sky Decor */}
            <div className="absolute top-4 left-6 text-4xl opacity-70 pointer-events-none anim-cloud-drift select-none">☁️</div>
            <div className="absolute top-12 right-12 text-5xl opacity-60 pointer-events-none anim-cloud-drift select-none" style={{ animationDelay: '-10s' }}>☁️</div>
            <div className="absolute top-2 right-1/3 text-2xl opacity-40 pointer-events-none">🕊️</div>
            <div className="absolute bottom-6 left-10 text-3xl opacity-50 pointer-events-none">🌈</div>
            <div className="absolute top-6 left-1/4 text-2xl text-yellow-300 opacity-60 pointer-events-none">✨</div>
            <div className="absolute bottom-8 right-16 text-3xl text-pink-300 opacity-60 pointer-events-none">✨</div>

            {availableBalloons.length === 0 ? (
              <div className="text-center space-y-4 py-12 z-10 animate-in zoom-in-95 duration-200">
                <div className="text-6xl animate-bounce">🎉</div>
                <h4 className="text-2xl font-black text-purple-900 tracking-tight">
                  TẤT CẢ CÁC BẠN ĐÃ ĐƯỢC GỌI!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-md mx-auto">
                  Tuyệt vời! Toàn bộ học sinh trong danh sách đã được gọi tên tham gia đầy đủ.
                </p>
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  className="candy-btn-purple text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl cursor-pointer transition active:scale-95"
                >
                  🔄 BẮT ĐẦU LƯỢT MỚI
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5 sm:gap-6 z-10 w-full">
                {availableBalloons.map((student, idx) => {
                  const theme = BALLOON_THEMES[idx % BALLOON_THEMES.length];
                  const isShaking = shakingBalloonId === student.id;
                  const isBursting = burstingBalloonId === student.id;

                  return (
                    <div
                      key={student.id}
                      onClick={() => handlePopBalloon(student)}
                      className={`flex flex-col items-center justify-center cursor-pointer transition-all duration-300 select-none group relative ${
                        isShaking ? 'animate-wiggle scale-125 z-20' : 'hover:scale-115 hover:-translate-y-2'
                      }`}
                    >
                      {/* Bursting Star Explosion Effect */}
                      {isBursting && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-ping text-3xl">
                          💥✨
                        </div>
                      )}

                      {/* Floating Balloon SVG & 3D Shading */}
                      <div 
                        className="relative anim-float-balloon"
                        style={{
                          animationDelay: `${(idx * 0.25) % 3}s`,
                          animationDuration: `${2.8 + (idx % 3) * 0.4}s`,
                        }}
                      >
                        {/* Balloon Body */}
                        <div
                          className={`w-14 h-18 sm:w-16 sm:h-20 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-tr ${theme.bg} border-2 border-white shadow-xl flex items-center justify-center relative overflow-hidden transition group-hover:brightness-110`}
                          style={{
                            boxShadow: `0 10px 25px -4px ${theme.glow}, 0 4px 6px -2px rgba(0,0,0,0.05)`,
                          }}
                        >
                          {/* Inner Gloss Highlight (Crescent) */}
                          <div className="absolute top-2 left-2 w-4 h-7 bg-white/50 rounded-full rotate-[-30deg] blur-[0.3px]" />
                          <div className="absolute top-1.5 left-4 w-1.5 h-2 bg-white/80 rounded-full" />

                          {/* Subtle Icon on Balloon */}
                          <span className="text-sm opacity-80 group-hover:scale-125 transition">
                            {theme.icon}
                          </span>
                        </div>

                        {/* Balloon Knot & Ribbon String */}
                        <div className="flex flex-col items-center">
                          <div
                            className="w-3 h-2 rounded-b-sm border-t border-black/10 shadow-xs"
                            style={{ backgroundColor: theme.border }}
                          />
                          {/* Wavy string */}
                          <svg width="12" height="24" viewBox="0 0 12 24" fill="none" className="-mt-0.5 opacity-80">
                            <path
                              d="M6 0 Q1 6 6 12 T6 24"
                              stroke={theme.string}
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Tooltip Badge */}
                      <span className="text-[10px] font-black text-slate-600 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-pink-200 mt-0.5 opacity-0 group-hover:opacity-100 transition shadow-xs">
                        Bóng #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 2: 🐠 CÁ NÀO CẮN CÂU? (Enhanced Aquarium Ocean Stage)             */}
      {/* ===================================================================== */}
      {activeGame === 'fishing' && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border-2 border-sky-200 shadow-xl shadow-sky-100/50 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b-2 border-sky-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🐠</span>
              <div>
                <h3 className="font-black text-lg text-slate-800">
                  Thủy Cung Lớp Học
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Đang có <strong>{availableFish.length}</strong> chú cá bơi lội • Bấm "THẢ CÂU NGAY" hoặc nhấp vào chú cá yêu thích!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setCaughtStudentIds([]);
                  setHookedStudentId(null);
                  setIsFishing(false);
                }}
                disabled={isFishing}
                className="px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border-2 border-sky-200 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 disabled:opacity-50 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Thả Cá Về Lại</span>
              </button>

              <button
                type="button"
                disabled={isFishing || availableFish.length === 0}
                onClick={handleCastFishingRod}
                className={`candy-btn-purple text-white px-7 py-2.5 rounded-2xl font-black text-sm flex items-center gap-2 shadow-lg cursor-pointer transition transform active:scale-95 ${
                  isFishing ? 'opacity-80 animate-pulse pointer-events-none' : 'hover:scale-105'
                }`}
              >
                <span className="text-xl">🎣</span>
                <span>{isFishing ? 'ĐANG THẢ CÂU...' : 'THẢ CÂU NGAY!'}</span>
              </button>
            </div>
          </div>

          {/* Aquarium Stage */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#38BDF8] via-[#0284C7] to-[#0B1E36] border-4 border-[#0284C7] p-4 sm:p-6 min-h-[440px] overflow-hidden shadow-2xl select-none">
            {/* Water Caustics Sunlight Beams */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-cyan-300 to-transparent" />

            {/* Rising Animated Bubbles */}
            <div className="absolute bottom-4 left-[10%] text-sm opacity-70" style={{ animation: 'bubble-rise 4s ease-in infinite' }}>🫧</div>
            <div className="absolute bottom-8 left-[35%] text-lg opacity-60" style={{ animation: 'bubble-rise 5s ease-in infinite 1.5s' }}>🫧</div>
            <div className="absolute bottom-6 left-[65%] text-xs opacity-80" style={{ animation: 'bubble-rise 3.5s ease-in infinite 0.8s' }}>🫧</div>
            <div className="absolute bottom-10 right-[15%] text-base opacity-75" style={{ animation: 'bubble-rise 4.5s ease-in infinite 2.2s' }}>🫧</div>

            {/* Ocean Floor (Swaying Kelp, Corals, Starfish, Sandy seabed) */}
            <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end px-4 pointer-events-none select-none z-10">
              <div className="text-4xl sm:text-5xl anim-seaweed-1">🌿</div>
              <div className="text-3xl sm:text-4xl">🪸</div>
              <div className="text-4xl sm:text-5xl anim-seaweed-2">🌾</div>
              <div className="text-2xl sm:text-3xl">⭐</div>
              <div className="text-4xl sm:text-5xl anim-seaweed-1">🌿</div>
              <div className="text-3xl sm:text-4xl">🪸</div>
              <div className="text-4xl sm:text-5xl anim-seaweed-2">🌾</div>
            </div>

            {/* Fishing Dock & Line from Top */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none transition-all duration-75 ease-linear"
              style={{
                height: `${hookDepth}%`,
              }}
            >
              {/* Fishing Bobber */}
              <div className="w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-md -mb-1" />
              {/* Fishing Line */}
              <div className="w-0.5 flex-1 bg-white/90 shadow-sm" />
              {/* Fishing Hook with Bait */}
              <div className="w-6 h-6 -mb-2 border-b-3 border-r-3 border-amber-300 rounded-br-full transform rotate-45 shadow-lg flex items-center justify-center">
                <span className="text-[12px] transform -rotate-45 animate-pulse">🪱</span>
              </div>
            </div>

            {/* Swimming Fish Group */}
            {availableFish.length === 0 ? (
              <div className="text-center space-y-4 py-20 z-10 relative animate-in zoom-in-95 duration-200">
                <div className="text-6xl animate-bounce">🐠✨</div>
                <h4 className="text-2xl font-black text-white tracking-tight">
                  ĐÃ CÂU HẾT TẤT CẢ CÁ!
                </h4>
                <p className="text-xs sm:text-sm text-sky-100 font-bold max-w-md mx-auto">
                  Tất cả các bạn nhỏ đã được câu lên vui vẻ. Bấm nút dưới để thả cá về lại đại dương nhé!
                </p>
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  className="candy-btn-pink text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl cursor-pointer transition active:scale-95"
                >
                  🔄 THẢ TẤT CẢ CÁ VỀ LẠI
                </button>
              </div>
            ) : (
              <div className="relative w-full h-full min-h-[380px]">
                {availableFish.map((student, idx) => {
                  const swim = fishSwimData[student.id] || { x: 15 + idx * 6, y: 30 + idx * 5, dir: 1 };
                  const fishSpec = FISH_SPECIES[idx % FISH_SPECIES.length];
                  const isHooked = hookedStudentId === student.id;

                  return (
                    <div
                      key={student.id}
                      onClick={() => !isFishing && handleCastFishingRod()}
                      className={`absolute flex items-center gap-1.5 transition-all duration-150 select-none cursor-pointer group ${
                        isHooked ? 'scale-130 z-30 animate-wiggle' : 'hover:scale-120'
                      }`}
                      style={{
                        left: isHooked ? 'calc(50% - 30px)' : `${swim.x}%`,
                        top: isHooked ? `${hookDepth + 2}%` : `${swim.y}%`,
                        transform: `scaleX(${swim.dir === 1 ? -1 : 1})`,
                      }}
                    >
                      {/* Water Splash Bubbles when hooked */}
                      {isHooked && (
                        <div className="absolute -top-3 -right-3 text-lg animate-ping">
                          💦
                        </div>
                      )}

                      {/* Realistic SVG Cartoon Fish */}
                      <div className="relative filter drop-shadow-lg">
                        <svg
                          viewBox="0 0 72 52"
                          className="w-13 h-10 sm:w-16 sm:h-12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <defs>
                            <linearGradient id={`fishGrad-${student.id}`} x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor={fishSpec.color1} />
                              <stop offset="100%" stopColor={fishSpec.color2} />
                            </linearGradient>
                          </defs>

                          {/* Tail Fin with wave animation */}
                          <path
                            d="M52 26 L68 12 C64 22 64 30 68 40 L52 26 Z"
                            fill={fishSpec.fin}
                            className="transition-transform duration-200 group-hover:scale-105"
                          />

                          {/* Top Dorsal Fin */}
                          <path
                            d="M26 14 C34 6 42 8 48 16 C38 14 30 16 26 14 Z"
                            fill={fishSpec.fin}
                          />

                          {/* Main Body */}
                          <path
                            d="M8 26 C8 12 28 6 44 12 C54 16 56 26 56 26 C56 26 54 36 44 40 C28 46 8 40 8 26 Z"
                            fill={`url(#fishGrad-${student.id})`}
                            stroke="rgba(255,255,255,0.4)"
                            strokeWidth="1.5"
                          />

                          {/* Curved Body Stripes */}
                          <path
                            d="M26 10 C29 20 29 32 26 42"
                            stroke={fishSpec.stripe}
                            strokeWidth="4"
                            strokeLinecap="round"
                          />
                          <path
                            d="M40 14 C43 22 43 30 40 38"
                            stroke={fishSpec.stripe}
                            strokeWidth="3"
                            strokeLinecap="round"
                          />

                          {/* Pectoral Fin */}
                          <path
                            d="M30 26 C38 28 40 34 35 38 C30 36 28 30 30 26 Z"
                            fill={fishSpec.fin}
                          />

                          {/* Cute Big Eye */}
                          <circle cx="18" cy="20" r="4.5" fill="#FFFFFF" />
                          <circle cx="17" cy="20" r="2.8" fill={fishSpec.eye} />
                          <circle cx="16" cy="19" r="1.2" fill="#FFFFFF" />

                          {/* Smiling mouth */}
                          <path
                            d="M8 28 Q12 30 14 26"
                            stroke="#0F172A"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 3: 🥚 TRỨNG KỲ DIỆU (Enhanced Meadow Garden Stage)                */}
      {/* ===================================================================== */}
      {activeGame === 'magic_eggs' && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-7 border-2 border-amber-200 shadow-xl shadow-amber-100/50 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-amber-100">
            <div className="flex items-center gap-3">
              <span className="text-3xl animate-bounce">🥚</span>
              <div>
                <h3 className="font-black text-lg text-slate-800">
                  Vườn Trứng Kỳ Diệu Mùa Xuân
                </h3>
                <p className="text-xs text-slate-500 font-bold">
                  Còn <strong>{availableEggs.length}</strong> quả trứng bí ẩn • Nhấp vào quả trứng để đập nứt vỏ!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setOpenedEggIds([]);
                  setCrackingEggId(null);
                }}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border-2 border-amber-200 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tạo Lại Tất Cả Trứng</span>
              </button>

              <button
                type="button"
                onClick={handleRandomCrackEgg}
                disabled={availableEggs.length === 0 || crackingEggId !== null}
                className="candy-btn-gold text-purple-950 px-5 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-md disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                <span>ĐẬP TRỨNG NGẪU NHIÊN</span>
              </button>
            </div>
          </div>

          {/* Grass Meadow Stage */}
          <div className="relative rounded-3xl bg-gradient-to-b from-[#FEF08A] via-[#BBF7D0] to-[#86EFAC] border-4 border-[#86EFAC] p-6 sm:p-8 min-h-[420px] flex items-center justify-center overflow-hidden shadow-inner select-none">
            {/* Garden Flowers & Butterflies Decor */}
            <div className="absolute top-4 left-6 text-2xl opacity-70 pointer-events-none select-none anim-float-slow">🌸</div>
            <div className="absolute top-8 right-12 text-3xl opacity-70 pointer-events-none select-none anim-float-slow" style={{ animationDelay: '1s' }}>🦋</div>
            <div className="absolute bottom-6 right-8 text-2xl opacity-60 pointer-events-none select-none">🌼</div>
            <div className="absolute bottom-4 left-12 text-2xl opacity-60 pointer-events-none select-none">🌷</div>
            <div className="absolute top-1/2 left-4 text-xl opacity-40 pointer-events-none">✨</div>
            <div className="absolute top-1/3 right-6 text-xl opacity-40 pointer-events-none">✨</div>

            {availableEggs.length === 0 ? (
              <div className="text-center space-y-4 py-12 z-10 animate-in zoom-in-95 duration-200">
                <div className="text-6xl animate-bounce">🐣✨</div>
                <h4 className="text-2xl font-black text-emerald-900 tracking-tight">
                  TẤT CẢ TRỨNG ĐÃ ĐƯỢC MỞ!
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 font-bold max-w-md mx-auto">
                  Tất cả các bạn học sinh đã xuất hiện vui tươi từ vườn trứng kỳ diệu!
                </p>
                <button
                  type="button"
                  onClick={handleRestoreAll}
                  className="candy-btn-pink text-white px-8 py-3 rounded-2xl font-black text-sm shadow-xl cursor-pointer transition active:scale-95"
                >
                  🔄 TẠO LẠI VƯỜN TRỨNG
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-5 sm:gap-6 z-10 w-full">
                {activePool.map((student, idx) => {
                  const isOpened = openedEggIds.includes(student.id);
                  const isCracking = crackingEggId === student.id;
                  const theme = EGG_THEMES[idx % EGG_THEMES.length];

                  return (
                    <div
                      key={student.id}
                      onClick={() => !isOpened && handleCrackEgg(student)}
                      className={`flex flex-col items-center justify-center select-none transition-all duration-300 ${
                        isOpened
                          ? 'opacity-40 cursor-not-allowed scale-90'
                          : isCracking
                          ? 'scale-125 z-20 cursor-pointer anim-egg-wobble'
                          : 'cursor-pointer hover:scale-115 hover:-translate-y-2'
                      }`}
                    >
                      {/* Surprise Egg in Grass Nest */}
                      <div className="relative">
                        {isOpened ? (
                          /* Hatched Chick from Broken Egg Shell */
                          <div className="w-14 h-18 sm:w-16 sm:h-20 flex flex-col items-center justify-center text-3xl animate-bounce">
                            <span>🐣</span>
                            <span className="text-[10px] font-black text-emerald-800 -mt-1">✨</span>
                          </div>
                        ) : (
                          /* 3D Glossy Decorated Egg */
                          <div className="relative">
                            {/* Grass Nest Bottom */}
                            <div className="absolute -bottom-1.5 inset-x-0 h-4 bg-emerald-600/30 rounded-full blur-[1px] pointer-events-none" />

                            <div
                              className={`w-14 h-18 sm:w-16 sm:h-20 rounded-[50%_50%_50%_50%_/_65%_65%_35%_35%] bg-gradient-to-tr ${theme.bg} border-2 border-white shadow-xl flex items-center justify-center relative overflow-hidden transition group-hover:brightness-105`}
                              style={{
                                boxShadow: `0 8px 20px -4px rgba(0,0,0,0.15), inset 0 -4px 8px rgba(0,0,0,0.1)`,
                              }}
                            >
                              {/* Pattern Overlays */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-40">
                                <span className="text-xs">{theme.icon} {theme.icon}</span>
                              </div>

                              {/* Glowing crack lightning bolts when cracking */}
                              {isCracking && eggCrackProgress >= 1 && (
                                <div className="absolute inset-0 flex items-center justify-center text-amber-900 font-black text-2xl animate-ping z-20">
                                  ⚡
                                </div>
                              )}

                              {/* Shell crack lines */}
                              {isCracking && eggCrackProgress >= 2 && (
                                <svg viewBox="0 0 40 50" className="absolute inset-0 w-full h-full stroke-amber-900 stroke-2 fill-none z-10">
                                  <path d="M 20 5 L 18 18 L 24 28 L 16 38 L 20 48" />
                                </svg>
                              )}

                              {/* Glossy Reflection Arc */}
                              <div className="absolute top-2 left-2.5 w-3.5 h-7 bg-white/50 rounded-full rotate-[-25deg] blur-[0.3px]" />
                            </div>
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] font-black text-emerald-900 bg-white/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-emerald-200 mt-1 shadow-xs">
                        {isOpened ? 'Đã nở 🐣' : `Trứng #${idx + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VIEW 0: 🎡 VÒNG QUAY GỌI TÊN (Wheel of Fortune Arena)                */}
      {/* ===================================================================== */}
      {activeGame === 'wheel' && (
        <WheelOfFortuneGame
          students={activePool}
          allClassStudents={students}
          config={config}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sound.setEnabled(next);
          }}
          onSelectWinner={(st, title, sub, icon) => triggerWinner(st, title, sub, icon, 'wheel')}
          onAwardBonusPoints={(st, pts) => handleAwardBonus(st, pts)}
          onExcludeStudent={handleExcludeStudent}
          sessionCalledIds={calledHistory.map((h) => h.student.id)}
          onResetCalledList={() => {
            setCalledHistory([]);
            setExcludedIds([]);
          }}
          onMarkCalled={(studentId) => {
            const st = students.find((s) => s.id === studentId);
            if (st) {
              setCalledHistory((prev) => [{ student: st, game: 'wheel', timestamp: Date.now() }, ...prev]);
              if (noRepeatMode) {
                setExcludedIds((prev) => (prev.includes(studentId) ? prev : [...prev, studentId]));
              }
            }
          }}
        />
      )}

      {/* ===================================================================== */}
      {/* VIEW 4: 🦆 ĐUA VỊT MAY MẮN (Lucky Duck Race Arena)                   */}
      {/* ===================================================================== */}
      {activeGame === 'duck_race' && (
        <DuckRaceGame
          students={activePool}
          allClassStudents={students}
          config={config}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sound.setEnabled(next);
          }}
          onSelectWinner={(st, title, sub, icon) => triggerWinner(st, title, sub, icon, 'duck_race')}
          onAwardBonusPoints={(st, pts) => handleAwardBonus(st, pts)}
          onExcludeStudent={handleExcludeStudent}
        />
      )}

      {/* 4. RECENTLY CALLED STUDENTS HISTORY (Nhật ký gọi tên) */}
      {calledHistory.length > 0 && (
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 border-2 border-pink-200 shadow-md shadow-pink-100/40 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-xs sm:text-sm text-slate-800 flex items-center gap-2">
              <span>📋 Nhật Ký Học Sinh Vừa Được Gọi ({calledHistory.length})</span>
            </h4>
            <button
              type="button"
              onClick={() => setCalledHistory([])}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-600 transition cursor-pointer"
            >
              Xóa lịch sử
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {calledHistory.map((item, idx) => (
              <div
                key={idx}
                className="bg-pink-50 hover:bg-pink-100 text-slate-800 px-3.5 py-1.5 rounded-2xl border border-pink-200 flex items-center gap-2 text-xs font-bold transition shadow-xs"
              >
                <span>
                  {item.game === 'wheel' && '🎡'}
                  {item.game === 'duck_race' && '🦆'}
                  {item.game === 'balloons' && '🎈'}
                  {item.game === 'fishing' && '🐠'}
                  {item.game === 'magic_eggs' && '🥚'}
                </span>
                <span className="text-pink-900 font-black">#{item.student.stt} {item.student.name}</span>
                <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-0.5 rounded-md font-bold">
                  Tổ {item.student.group}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. CELEBRATION WINNER MODAL (SHARED FOR ALL 3 GAMES)                       */}
      {/* ========================================================================= */}
      {showWinnerModal && winnerStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-4 border-pink-300 text-center space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute -top-16 -left-16 w-40 h-40 bg-pink-300/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-purple-300/40 rounded-full blur-2xl pointer-events-none" />

            <button
              type="button"
              onClick={() => setShowWinnerModal(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-pink-50 hover:bg-pink-100 text-slate-500 flex items-center justify-center cursor-pointer transition shadow-xs"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Winner Top Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400 via-pink-500 to-purple-500 text-white px-5 py-2 rounded-full text-xs font-black shadow-lg uppercase tracking-wider animate-bounce">
              <span className="text-base">{winnerIcon}</span>
              <span>{winnerTitle}</span>
              <Sparkles className="w-4 h-4 text-yellow-200" />
            </div>

            {/* Big Avatar Card with Golden Crown */}
            <div className="space-y-3">
              <div className="relative w-26 h-26 sm:w-30 sm:h-30 mx-auto">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-2xl z-20 animate-bounce">
                  👑
                </div>
                <div className="w-full h-full rounded-3xl bg-gradient-to-tr from-[#A855F7] via-[#EC4899] to-[#F59E0B] p-1.5 shadow-2xl shadow-pink-400/40">
                  <div className="w-full h-full rounded-[20px] bg-white overflow-hidden flex items-center justify-center">
                    {winnerStudent.avatarUrl ? (
                      <img
                        src={winnerStudent.avatarUrl}
                        alt={winnerStudent.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl sm:text-4xl font-black text-purple-700">
                        {getStudentInitials(winnerStudent.name)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-black text-pink-600 uppercase tracking-widest">
                  🎉 XIN MỜI BẠN:
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                  {winnerStudent.stt}. {winnerStudent.name}
                </h3>
                <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                  <span className="text-xs font-black text-purple-700 bg-purple-100 px-3 py-1 rounded-full border border-purple-200 shadow-xs">
                    Tổ {winnerStudent.group}
                  </span>
                  <span className="text-xs font-black text-pink-700 bg-pink-100 px-3 py-1 rounded-full border border-pink-200 shadow-xs">
                    {winnerStudent.role}
                  </span>
                  <span className="text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 shadow-xs">
                    🌸 {winnerStudent.flowerPoints} hoa
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Award Bonus Points */}
            {onAwardPoints && (
              <div className="p-3.5 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 rounded-2xl border-2 border-pink-200 space-y-2">
                <div className="text-xs font-black text-slate-700">Tặng hoa thưởng phát biểu / câu trả lời hay:</div>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleAwardBonus(winnerStudent, 1)}
                    className="px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 shadow-xs"
                  >
                    +1 🌸 Hoa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAwardBonus(winnerStudent, 2)}
                    className="px-3.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-300 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 shadow-xs"
                  >
                    +2 🌸 Hoa
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAwardBonus(winnerStudent, 5)}
                    className="px-3.5 py-1.5 bg-white hover:bg-amber-50 text-amber-700 border border-amber-300 rounded-xl text-xs font-black transition cursor-pointer active:scale-95 shadow-xs"
                  >
                    +5 ⭐ Siêu Sao
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  handleExcludeStudent(winnerStudent.id);
                  setShowWinnerModal(false);
                }}
                className="px-4 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 rounded-2xl text-xs font-black transition cursor-pointer active:scale-95 flex items-center justify-center gap-1 shadow-xs"
              >
                <span>🚫 Không gọi lại</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowWinnerModal(false);
                  if (activeGame === 'fishing') {
                    setTimeout(() => handleCastFishingRod(), 300);
                  }
                }}
                className="candy-btn-purple text-white px-5 py-3 rounded-2xl text-xs font-black transition cursor-pointer active:scale-95 shadow-lg flex items-center justify-center gap-1"
              >
                {activeGame === 'balloons' && '🎈 Chọn tiếp'}
                {activeGame === 'fishing' && '🎣 Câu tiếp'}
                {activeGame === 'magic_eggs' && '🥚 Mở trứng tiếp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
