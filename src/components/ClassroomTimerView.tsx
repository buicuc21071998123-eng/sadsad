import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../utils/soundEffects';
import { fireConfetti, fireSuperConfetti } from '../utils/helpers';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus, 
  Minus, 
  Volume2, 
  VolumeX, 
  Bell, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Clock, 
  Maximize2, 
  Minimize2,
  Zap,
  AlarmClock,
  Timer,
  Calendar,
  Flag,
  Sun,
  Moon
} from 'lucide-react';

interface ClassroomTimerViewProps {
  onNotifyTimeUp?: () => void;
}

type TimerTab = 'countdown' | 'stopwatch' | 'clock';

export const ClassroomTimerView: React.FC<ClassroomTimerViewProps> = ({ onNotifyTimeUp }) => {
  // Main Tab State
  const [activeTab, setActiveTab] = useState<TimerTab>('countdown');

  // ---------------------------------------------------------------------------
  // TAB 1: COUNTDOWN STATE
  // ---------------------------------------------------------------------------
  const [totalSeconds, setTotalSeconds] = useState<number>(180);
  const [initialDuration, setInitialDuration] = useState<number>(180);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [isUrgentWarning, setIsUrgentWarning] = useState<boolean>(false);
  const [isBigScreenMode, setIsBigScreenMode] = useState<boolean>(false);

  // Custom Input State
  const [customMinutes, setCustomMinutes] = useState<number>(3);
  const [customSeconds, setCustomSeconds] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Preset Options (1p, 2p, 3p, 5p, 10p, 15p + others)
  const presets = [
    { label: '1 Phút', seconds: 60, desc: 'Suy nghĩ nhanh' },
    { label: '2 Phút', seconds: 120, desc: 'Thảo luận đôi' },
    { label: '3 Phút', seconds: 180, desc: 'Thảo luận nhóm' },
    { label: '5 Phút', seconds: 300, desc: 'Luyện tập cá nhân' },
    { label: '10 Phút', seconds: 600, desc: 'Kiểm tra 10 phút' },
    { label: '15 Phút', seconds: 900, desc: 'Thuyết trình' },
  ];

  // Timer Tick Engine
  useEffect(() => {
    if (isRunning && totalSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            setIsTimeUp(true);
            setIsUrgentWarning(false);
            if (!isMuted) {
              sound.playTimerAlarm();
            }
            fireSuperConfetti();
            if (onNotifyTimeUp) onNotifyTimeUp();
            return 0;
          }

          const nextSecs = prev - 1;

          // Sound effects & Urgent countdown
          if (!isMuted) {
            if (nextSecs <= 10 && nextSecs > 0) {
              setIsUrgentWarning(true);
              sound.playTimerTickUrgent(nextSecs);
            } else {
              setIsUrgentWarning(false);
              sound.playTimerTickRegular();
            }
          } else {
            setIsUrgentWarning(nextSecs <= 10 && nextSecs > 0);
          }

          return nextSecs;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, totalSeconds, isMuted, onNotifyTimeUp]);

  // Handle Preset Click
  const handleSelectPreset = (secs: number) => {
    setIsRunning(false);
    setIsTimeUp(false);
    setIsUrgentWarning(false);
    setInitialDuration(secs);
    setTotalSeconds(secs);
    setCustomMinutes(Math.floor(secs / 60));
    setCustomSeconds(secs % 60);
    sound.playClick();
  };

  // Toggle Start / Pause
  const handleToggleTimer = () => {
    if (totalSeconds === 0) {
      setTotalSeconds(initialDuration || 180);
      setIsTimeUp(false);
    }
    setIsRunning(!isRunning);
    sound.playClick();
  };

  // Reset Timer
  const handleResetTimer = () => {
    setIsRunning(false);
    setIsTimeUp(false);
    setIsUrgentWarning(false);
    setTotalSeconds(initialDuration || 180);
    sound.playClick();
  };

  // Add / Subtract Delta Seconds (+60s, -60s, +30s)
  const handleAdjustTime = (deltaSecs: number) => {
    const nextVal = Math.max(0, totalSeconds + deltaSecs);
    setTotalSeconds(nextVal);
    if (nextVal > initialDuration) {
      setInitialDuration(nextVal);
    }
    sound.playClick();
  };

  // Apply Custom Minutes & Seconds
  const handleApplyCustomTime = (e: React.FormEvent) => {
    e.preventDefault();
    const calculatedSecs = Math.max(1, customMinutes * 60 + customSeconds);
    setIsRunning(false);
    setIsTimeUp(false);
    setIsUrgentWarning(false);
    setInitialDuration(calculatedSecs);
    setTotalSeconds(calculatedSecs);
    sound.playReward();
  };

  // ---------------------------------------------------------------------------
  // TAB 2: STOPWATCH (BẤM GIỜ) STATE
  // ---------------------------------------------------------------------------
  const [swTimeMs, setSwTimeMs] = useState<number>(0);
  const [swRunning, setSwRunning] = useState<boolean>(false);
  const [swLaps, setSwLaps] = useState<number[]>([]);
  const swIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (swRunning) {
      const startTime = Date.now() - swTimeMs;
      swIntervalRef.current = setInterval(() => {
        setSwTimeMs(Date.now() - startTime);
      }, 10);
    } else {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    }
    return () => {
      if (swIntervalRef.current) clearInterval(swIntervalRef.current);
    };
  }, [swRunning]);

  const handleToggleStopwatch = () => {
    setSwRunning(!swRunning);
    sound.playClick();
  };

  const handleResetStopwatch = () => {
    setSwRunning(false);
    setSwTimeMs(0);
    setSwLaps([]);
    sound.playClick();
  };

  const handleLapStopwatch = () => {
    if (swRunning && swTimeMs > 0) {
      setSwLaps((prev) => [swTimeMs, ...prev]);
      sound.playClick();
    }
  };

  // Format Stopwatch Time
  const swMinutes = Math.floor(swTimeMs / 60000);
  const swSeconds = Math.floor((swTimeMs % 60000) / 1000);
  const swCentis = Math.floor((swTimeMs % 1000) / 10);
  const formatSw = (ms: number) => {
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const c = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(c).padStart(2, '0')}`;
  };

  // ---------------------------------------------------------------------------
  // TAB 3: CURRENT CLOCK (GIỜ HIỆN TẠI) STATE
  // ---------------------------------------------------------------------------
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const daysOfWeek = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = daysOfWeek[currentTime.getDay()];
  const dateNum = currentTime.getDate();
  const monthNum = currentTime.getMonth() + 1;
  const yearNum = currentTime.getFullYear();
  const hoursStr = String(currentTime.getHours()).padStart(2, '0');
  const minutesStr = String(currentTime.getMinutes()).padStart(2, '0');
  const secondsStr = String(currentTime.getSeconds()).padStart(2, '0');

  // Format MM:SS for countdown
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  const formattedMinutes = String(mins).padStart(2, '0');
  const formattedSeconds = String(secs).padStart(2, '0');

  return (
    <div id="classroom-timer-container" className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* 3 Main Function Mode Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-3xl border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="tab-timer-countdown"
            onClick={() => {
              setActiveTab('countdown');
              sound.playClick();
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'countdown'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md shadow-pink-300'
                : 'bg-slate-50 hover:bg-pink-50 text-slate-700 border border-slate-200'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>1. ĐẾM NGƯỢC</span>
          </button>

          <button
            type="button"
            id="tab-timer-stopwatch"
            onClick={() => {
              setActiveTab('stopwatch');
              sound.playClick();
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'stopwatch'
                ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-blue-300'
                : 'bg-slate-50 hover:bg-indigo-50 text-slate-700 border border-slate-200'
            }`}
          >
            <AlarmClock className="w-4 h-4" />
            <span>2. BẤM GIỜ</span>
          </button>

          <button
            type="button"
            id="tab-timer-clock"
            onClick={() => {
              setActiveTab('clock');
              sound.playClick();
            }}
            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'clock'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-300'
                : 'bg-slate-50 hover:bg-emerald-50 text-slate-700 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>3. GIỜ HIỆN TẠI</span>
          </button>
        </div>

        {/* Quick Sound Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => sound.playQuietBell()}
            title="Phát tiếng chuông nhắc trật tự"
            className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-amber-200 rounded-2xl text-xs font-black transition flex items-center gap-1 shadow-2xs"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>🔔 Chuông</span>
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playApplause();
              fireConfetti();
            }}
            title="Vỗ tay hoan hô"
            className="px-3 py-2 bg-pink-50 hover:bg-pink-100 text-pink-900 border-2 border-pink-200 rounded-2xl text-xs font-black transition flex items-center gap-1 shadow-2xs"
          >
            <span>👏 Vỗ tay</span>
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 1. TAB ĐẾM NGƯỢC (COUNTDOWN) */}
      {/* ======================================================================= */}
      {activeTab === 'countdown' && (
        <div className="space-y-6">
          {/* Main Display Stage */}
          <div
            className={`relative rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
              isBigScreenMode ? 'p-8 sm:p-14 min-h-[480px]' : 'p-6 sm:p-10 min-h-[380px]'
            } flex flex-col items-center justify-center text-center ${
              isTimeUp
                ? 'bg-gradient-to-b from-[#3b0818] via-[#1a050d] to-[#0d0206] border-4 border-rose-400 shadow-rose-500/30'
                : isUrgentWarning
                ? 'bg-gradient-to-b from-[#2e0c15] via-[#1b0818] to-[#0a0514] border-4 border-amber-400 shadow-amber-500/20'
                : 'bg-gradient-to-b from-[#1c1236] via-[#120a24] to-[#0a0518] border-4 border-purple-400/50 shadow-purple-950/50'
            }`}
          >
            {/* Mystic Glow */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* State Banner */}
            <div className="mb-4 relative z-10">
              {isTimeUp ? (
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-rose-500/40 animate-bounce uppercase border-2 border-rose-300">
                  <Flame className="w-4 h-4 text-amber-300" />
                  ĐÃ HẾT GIỜ LÀM BÀI / THẢO LUẬN!
                </div>
              ) : isUrgentWarning ? (
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-purple-950 font-black text-xs tracking-wide shadow-lg shadow-rose-600/30 animate-pulse uppercase border-2 border-amber-200">
                  <Zap className="w-4 h-4 text-purple-950" />
                  ⚡ 10S NƯỚC RÚT – CHUẨN BỊ DỪNG BÚT
                </div>
              ) : isRunning ? (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-900/80 text-pink-300 font-black text-xs tracking-wide border border-pink-400/30">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  ĐANG ĐẾM NGƯỢC THỜI GIAN
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-pink-200 font-bold text-xs tracking-wide border border-white/20">
                  <span>⏱️ BẤM NÚT BẮT ĐẦU ĐỂ CHẠY</span>
                </div>
              )}
            </div>

            {/* GIANT DIGITS MM : SS */}
            <div className="relative z-10 select-none my-2 sm:my-4 flex items-baseline justify-center gap-2 sm:gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`font-mono font-black tracking-tight leading-none text-6xl sm:text-8xl md:text-9xl filter drop-shadow-2xl ${
                    isTimeUp
                      ? 'text-rose-400 animate-pulse'
                      : isUrgentWarning
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {formattedMinutes}
                </span>
                <span className="text-[11px] sm:text-xs font-black tracking-widest text-pink-300/70 mt-1 uppercase">
                  PHÚT
                </span>
              </div>

              <span
                className={`font-mono font-black text-5xl sm:text-7xl md:text-8xl self-start ${
                  isRunning ? 'animate-pulse text-pink-400' : 'text-pink-400/50'
                }`}
              >
                :
              </span>

              <div className="flex flex-col items-center">
                <span
                  className={`font-mono font-black tracking-tight leading-none text-6xl sm:text-8xl md:text-9xl filter drop-shadow-2xl ${
                    isTimeUp
                      ? 'text-rose-400 animate-pulse'
                      : isUrgentWarning
                      ? 'text-amber-300 animate-wiggle'
                      : 'text-white'
                  }`}
                >
                  {formattedSeconds}
                </span>
                <span className="text-[11px] sm:text-xs font-black tracking-widest text-pink-300/70 mt-1 uppercase">
                  GIÂY
                </span>
              </div>
            </div>

            {/* Main Action Controls Bar */}
            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
              {/* START / PAUSE BUTTON */}
              <button
                id="btn-timer-toggle"
                type="button"
                onClick={handleToggleTimer}
                className={`px-8 sm:px-12 py-4 rounded-3xl font-black text-base sm:text-lg flex items-center gap-3 transition shadow-xl active:scale-95 cursor-pointer ${
                  isRunning
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/30'
                    : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white shadow-pink-500/40'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-6 h-6 fill-white" />
                    <span>TẠM DỪNG</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-white" />
                    <span>{totalSeconds === 0 ? 'BẮT ĐẦU LẠI' : 'BẮT ĐẦU'}</span>
                  </>
                )}
              </button>

              {/* RESET BUTTON */}
              <button
                id="btn-timer-reset"
                type="button"
                onClick={handleResetTimer}
                className="px-5 py-4 rounded-3xl bg-white/10 hover:bg-white/20 text-pink-100 hover:text-white border-2 border-pink-300/30 transition active:scale-95 font-black text-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Đặt lại</span>
              </button>

              {/* +1 Minute */}
              <button
                type="button"
                onClick={() => handleAdjustTime(60)}
                className="px-4 py-4 rounded-3xl bg-white/10 hover:bg-white/20 text-pink-100 hover:text-white border-2 border-pink-300/30 transition active:scale-95 font-black text-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>1 Phút</span>
              </button>

              {/* Audio toggle */}
              <button
                type="button"
                onClick={() => {
                  setIsMuted(!isMuted);
                  sound.playClick();
                }}
                className={`p-4 rounded-3xl border-2 font-black transition cursor-pointer ${
                  isMuted
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-white/10 text-pink-200 border-pink-300/30'
                }`}
                title={isMuted ? 'Bật âm' : 'Tắt âm'}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Preset Buttons & Custom Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left: 6 Standard Presets (1p, 2p, 3p, 5p, 10p, 15p) */}
            <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Chọn Nhanh Mốc Thời Gian</span>
                </h3>
                <span className="text-xs font-black text-pink-600 bg-pink-50 px-3 py-1 rounded-full border border-pink-200">
                  Mức phổ biến
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {presets.map((p) => {
                  const isSelected = initialDuration === p.seconds;
                  return (
                    <button
                      key={p.seconds}
                      type="button"
                      onClick={() => handleSelectPreset(p.seconds)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 cursor-pointer ${
                        isSelected
                          ? 'bg-gradient-to-br from-pink-50 to-purple-50 border-pink-400 text-purple-950 shadow-sm ring-2 ring-pink-400/30 font-black'
                          : 'bg-slate-50/70 hover:bg-pink-50 border-slate-200 text-slate-700 hover:border-pink-300'
                      }`}
                    >
                      <div className="font-black text-sm sm:text-base text-slate-900">{p.label}</div>
                      <div className="text-xs text-pink-600 font-bold mt-0.5">{p.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Custom Minutes Form */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/40 space-y-4">
              <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-pink-600" />
                <span>Nhập Thời Gian Tùy Chỉnh</span>
              </h3>

              <form onSubmit={handleApplyCustomTime} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Số phút:</label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-700 mb-1">Số giây:</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 text-center text-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black text-xs shadow-md shadow-pink-200 flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-95 active:scale-95 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ÁP DỤNG THỜI GIAN</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 2. TAB BẤM GIỜ (STOPWATCH) */}
      {/* ======================================================================= */}
      {activeTab === 'stopwatch' && (
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-14 min-h-[380px] flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#0a1936] via-[#051124] to-[#020914] border-4 border-sky-400/50 shadow-sky-950/50">
            {/* Glow */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

            <div className="mb-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-900/80 text-sky-300 font-black text-xs tracking-wide border border-sky-400/30">
                <span>⏱️ ĐỒNG HỒ BẤM GIỜ THI ĐẤU</span>
              </div>
            </div>

            {/* Giant Stopwatch Digits MM : SS . CC */}
            <div className="relative z-10 select-none my-4 flex items-baseline justify-center gap-2 sm:gap-4 font-mono">
              <div className="flex flex-col items-center">
                <span className="font-black leading-none text-6xl sm:text-8xl md:text-9xl text-white">
                  {String(swMinutes).padStart(2, '0')}
                </span>
                <span className="text-xs font-black text-sky-300/70 mt-1 uppercase">PHÚT</span>
              </div>

              <span className="font-black text-5xl sm:text-7xl md:text-8xl text-sky-400">:</span>

              <div className="flex flex-col items-center">
                <span className="font-black leading-none text-6xl sm:text-8xl md:text-9xl text-white">
                  {String(swSeconds).padStart(2, '0')}
                </span>
                <span className="text-xs font-black text-sky-300/70 mt-1 uppercase">GIÂY</span>
              </div>

              <span className="font-black text-4xl sm:text-6xl text-sky-400/70">.</span>

              <div className="flex flex-col items-center">
                <span className="font-black leading-none text-4xl sm:text-6xl md:text-7xl text-sky-300">
                  {String(swCentis).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-black text-sky-300/70 mt-1 uppercase">TÍCH TẮC</span>
              </div>
            </div>

            {/* Stopwatch Controls */}
            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                id="btn-sw-toggle"
                onClick={handleToggleStopwatch}
                className={`px-8 sm:px-12 py-4 rounded-3xl font-black text-base sm:text-lg flex items-center gap-3 transition shadow-xl active:scale-95 cursor-pointer ${
                  swRunning
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30'
                    : 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sky-500/40'
                }`}
              >
                {swRunning ? (
                  <>
                    <Pause className="w-6 h-6 fill-white" />
                    <span>TẠM DỪNG</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-white" />
                    <span>BẮT ĐẦU BẤM</span>
                  </>
                )}
              </button>

              <button
                type="button"
                id="btn-sw-lap"
                onClick={handleLapStopwatch}
                disabled={!swRunning}
                className="px-5 py-4 rounded-3xl bg-white/10 hover:bg-white/20 text-sky-100 hover:text-white border-2 border-sky-300/30 transition active:scale-95 font-black text-sm flex items-center gap-2 cursor-pointer disabled:opacity-40"
              >
                <Flag className="w-5 h-5" />
                <span>Ghi mốc (Lap)</span>
              </button>

              <button
                type="button"
                id="btn-sw-reset"
                onClick={handleResetStopwatch}
                className="px-5 py-4 rounded-3xl bg-white/10 hover:bg-white/20 text-sky-100 hover:text-white border-2 border-sky-300/30 transition active:scale-95 font-black text-sm flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Đặt lại</span>
              </button>
            </div>
          </div>

          {/* Lap History List */}
          {swLaps.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border-2 border-sky-200 shadow-md shadow-sky-100/50 space-y-3">
              <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
                <Flag className="w-4 h-4 text-sky-600" />
                <span>Danh Sách Mốc Thời Gian Đã Ghi ({swLaps.length})</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto pr-1">
                {swLaps.map((lapMs, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between"
                  >
                    <span className="text-xs font-black text-slate-500">Mốc #{swLaps.length - idx}</span>
                    <span className="font-mono font-black text-sm text-sky-900">{formatSw(lapMs)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================================= */}
      {/* 3. TAB GIỜ HIỆN TẠI (CURRENT CLOCK) */}
      {/* ======================================================================= */}
      {activeTab === 'clock' && (
        <div className="space-y-6">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl p-8 sm:p-14 min-h-[380px] flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#06241a] via-[#03140e] to-[#010805] border-4 border-emerald-400/50 shadow-emerald-950/50">
            {/* Ambient Glow */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Date Tag */}
            <div className="mb-4 relative z-10">
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-900/80 text-emerald-300 font-black text-sm tracking-wide border border-emerald-400/30 shadow-sm">
                <Calendar className="w-4 h-4 text-emerald-300" />
                <span>{dayName}, ngày {dateNum} tháng {monthNum} năm {yearNum}</span>
              </div>
            </div>

            {/* Giant Clock Digits HH : MM : SS */}
            <div className="relative z-10 select-none my-4 flex items-baseline justify-center gap-2 sm:gap-4 font-mono">
              <div className="flex flex-col items-center">
                <span className="font-black leading-none text-6xl sm:text-8xl md:text-9xl text-white">
                  {hoursStr}
                </span>
                <span className="text-xs font-black text-emerald-300/70 mt-1 uppercase">GIỜ</span>
              </div>

              <span className="font-black text-5xl sm:text-7xl md:text-8xl text-emerald-400 animate-pulse">:</span>

              <div className="flex flex-col items-center">
                <span className="font-black leading-none text-6xl sm:text-8xl md:text-9xl text-white">
                  {minutesStr}
                </span>
                <span className="text-xs font-black text-emerald-300/70 mt-1 uppercase">PHÚT</span>
              </div>

              <span className="font-black text-5xl sm:text-7xl md:text-8xl text-emerald-400 animate-pulse">:</span>

              <div className="flex flex-col items-center">
                <span className="font-black leading-none text-6xl sm:text-8xl md:text-9xl text-emerald-300">
                  {secondsStr}
                </span>
                <span className="text-xs font-black text-emerald-300/70 mt-1 uppercase">GIÂY</span>
              </div>
            </div>

            {/* Vietnamese Greeting / Shift */}
            <div className="relative z-10 mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 text-emerald-200 text-xs font-black border border-white/10">
              {currentTime.getHours() < 12 ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Buổi sáng rạng rỡ – Chúc cô trò một ngày học tập nhiều niềm vui!</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-sky-400" />
                  <span>Buổi chiều năng lượng – Chăm chỉ rèn luyện và hoàn thành tốt bài học!</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
