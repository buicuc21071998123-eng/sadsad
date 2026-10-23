import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Sliders, AlertTriangle, ShieldCheck, Sparkles, Volume1, Bell } from 'lucide-react';
import { sound } from '../utils/soundEffects';

interface NoiseMeterViewProps {
  classNameName?: string;
}

type NoiseLevel = 'quiet' | 'moderate' | 'noisy' | 'too_loud';

export const NoiseMeterView: React.FC<NoiseMeterViewProps> = ({ classNameName = 'Lớp 4A2' }) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0); // 0 to 100
  const [peakVolume, setPeakVolume] = useState<number>(0);
  const [sensitivity, setSensitivity] = useState<number>(1.2); // 0.5 to 3.0
  const [hasPermissionError, setHasPermissionError] = useState<boolean>(false);
  const [permissionErrorMsg, setPermissionErrorMsg] = useState<string>('');
  const [enableWarningAlarm, setEnableWarningAlarm] = useState<boolean>(true);
  const [overLimitCount, setOverLimitCount] = useState<number>(0);

  // Audio Context & Stream Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const lastAlarmTimeRef = useRef<number>(0);

  // Determine current noise level category
  const getNoiseCategory = (vol: number): { level: NoiseLevel; label: string; color: string; bg: string; border: string; icon: string; desc: string } => {
    if (vol < 35) {
      return {
        level: 'quiet',
        label: '🟢 YÊN TĨNH',
        color: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-300',
        icon: '🤫',
        desc: 'Lớp học đang rất yên tĩnh, chăm chú lắng nghe và tự giác làm bài!',
      };
    }
    if (vol < 60) {
      return {
        level: 'moderate',
        label: '🟡 HƠI ỒN',
        color: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-300',
        icon: '💬',
        desc: 'Âm thanh thảo luận cặp đôi/nhóm vừa phải, các con hãy giữ âm lượng này nhé.',
      };
    }
    if (vol < 80) {
      return {
        level: 'noisy',
        label: '🟠 ỒN',
        color: 'text-orange-700',
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        icon: '⚠️',
        desc: 'Âm thanh trong lớp đang hơi lớn, các bạn hãy giảm giọng nói để không ảnh hưởng lớp bên cạnh!',
      };
    }
    return {
      level: 'too_loud',
      label: '🔴 QUÁ ỒN',
      color: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-400',
      icon: '🚨',
      desc: 'Lớp học đang quá ồn! Xin mời cả lớp giữ trật tự và ngồi ngay ngắn lại ngay!',
    };
  };

  const currentCategory = getNoiseCategory(volume);

  // Stop listening and cleanup
  const stopListening = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch {}
      sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    setIsListening(false);
    setVolume(0);
  };

  // Start listening
  const startListening = async () => {
    stopListening();
    setHasPermissionError(false);
    setPermissionErrorMsg('');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Trình duyệt của bạn không hỗ trợ ghi âm trực tiếp từ microphone.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      mediaStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
      source.connect(analyser);

      setIsListening(true);
      sound.playReward();

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const processAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Compute average root mean square
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        // Normalize to 0 - 100 with sensitivity multiplier
        const rawVol = Math.min(100, Math.round((rms / 128) * 100 * sensitivity));

        setVolume(rawVol);
        setPeakVolume((prev) => Math.max(prev, rawVol));

        // Check if exceeded threshold and alarm enabled
        if (rawVol >= 80) {
          const now = Date.now();
          if (now - lastAlarmTimeRef.current > 3000) {
            lastAlarmTimeRef.current = now;
            setOverLimitCount((c) => c + 1);
            if (enableWarningAlarm) {
              sound.playTimerTickUrgent(1);
            }
          }
        }

        animFrameRef.current = requestAnimationFrame(processAudio);
      };

      animFrameRef.current = requestAnimationFrame(processAudio);
    } catch (err: any) {
      console.error('Microphone error in NoiseMeterView:', err);
      setHasPermissionError(true);
      setPermissionErrorMsg(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Vui lòng cấp quyền microphone để sử dụng chức năng Đo tiếng ồn.'
          : 'Không thể kết nối microphone thiết bị: ' + (err.message || 'Vui lòng kiểm tra lại mic.')
      );
      stopListening();
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div id="noise-meter-view" className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-sky-100/50 border-2 border-white/60 relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/20 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 text-xs font-black backdrop-blur-xs text-white">
              <span>🔊</span>
              <span>QUẢN LÝ NỀ NẾP & TRẬT TỰ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>🔊 ĐO TIẾNG ỒN LỚP HỌC</span>
            </h1>
            <p className="text-xs sm:text-sm text-sky-100 font-medium max-w-lg">
              Theo dõi âm thanh thời gian thực trong lớp học bằng microphone. Giúp các con tự giác rèn luyện thói quen giữ trật tự và tập trung!
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!isListening ? (
              <button
                type="button"
                id="btn-start-noise-meter"
                onClick={startListening}
                className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition cursor-pointer border-2 border-emerald-300"
              >
                <Mic className="w-5 h-5 text-white animate-pulse" />
                <span>🎤 BẮT ĐẦU ĐO</span>
              </button>
            ) : (
              <button
                type="button"
                id="btn-stop-noise-meter"
                onClick={stopListening}
                className="px-6 py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-sm sm:text-base shadow-lg shadow-rose-500/30 flex items-center gap-2 transition cursor-pointer border-2 border-rose-300 animate-pulse"
              >
                <MicOff className="w-5 h-5 text-white" />
                <span>⏹ DỪNG ĐO</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Permission Error Alert */}
      {hasPermissionError && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-3xl p-5 shadow-sm text-rose-800 flex items-start gap-3.5 animate-shake">
          <div className="w-10 h-10 rounded-2xl bg-rose-200 text-rose-700 flex items-center justify-center font-black shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-sm text-rose-900">Không thể truy cập Microphone</h4>
            <p className="text-xs font-semibold text-rose-700 leading-relaxed">
              {permissionErrorMsg}
            </p>
            <p className="text-[11px] text-rose-500 font-medium">
              💡 Hướng dẫn: Bấm vào biểu tượng 🔒 hoặc 🎙️ ở thanh địa chỉ trình duyệt, chọn <b>Cho phép (Allow) Microphone</b> rồi bấm nút "Bắt đầu đo" lại.
            </p>
          </div>
        </div>
      )}

      {/* 2. Main Live Noise Visualization Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 space-y-6">
        {/* Status Indicator Big Card */}
        <div className={`p-6 sm:p-8 rounded-3xl border-3 transition-all duration-300 flex flex-col md:flex-row items-center justify-between gap-6 ${currentCategory.bg} ${currentCategory.border}`}>
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="text-6xl sm:text-7xl filter drop-shadow-md animate-bounce-subtle">
              {currentCategory.icon}
            </div>
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 font-black text-xs border border-slate-200">
                <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping"></span>
                <span>{isListening ? 'ĐANG ĐO TRỰC TIẾP' : 'CHƯA BẬT MICRO'}</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black ${currentCategory.color}`}>
                {currentCategory.label}
              </h2>
              <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-md">
                {currentCategory.desc}
              </p>
            </div>
          </div>

          <div className="text-center bg-white/90 backdrop-blur-xs p-4 sm:p-5 rounded-3xl border-2 border-slate-200/80 shadow-sm min-w-[140px]">
            <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider">ÂM LƯỢNG</div>
            <div className={`text-4xl sm:text-5xl font-black mt-1 ${currentCategory.color}`}>
              {isListening ? volume : 0}
              <span className="text-base font-bold text-slate-400"> /100</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 mt-1">
              Đỉnh cao: {peakVolume}
            </div>
          </div>
        </div>

        {/* Dynamic Decibel Meter Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-slate-600">
            <span className="flex items-center gap-1.5">
              <Volume1 className="w-4 h-4 text-purple-600" />
              <span>Thanh cường độ âm thanh lớp học:</span>
            </span>
            <span className="font-extrabold text-slate-500">{volume}%</span>
          </div>

          <div className="h-7 w-full bg-slate-100 rounded-2xl p-1 border-2 border-slate-200 relative overflow-hidden">
            {/* 4 Color Zone Markers */}
            <div className="absolute inset-0 flex pointer-events-none opacity-20">
              <div className="w-[35%] bg-emerald-500 h-full border-r border-slate-300"></div>
              <div className="w-[25%] bg-amber-500 h-full border-r border-slate-300"></div>
              <div className="w-[20%] bg-orange-500 h-full border-r border-slate-300"></div>
              <div className="w-[20%] bg-rose-500 h-full"></div>
            </div>

            {/* Active Volume Level Fill */}
            <div
              className={`h-full rounded-xl transition-all duration-100 ${
                volume < 35
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-sm shadow-emerald-300'
                  : volume < 60
                  ? 'bg-gradient-to-r from-emerald-400 via-yellow-400 to-amber-500 shadow-sm shadow-amber-300'
                  : volume < 80
                  ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-orange-500 shadow-sm shadow-orange-300'
                  : 'bg-gradient-to-r from-orange-400 via-rose-500 to-red-600 shadow-sm shadow-rose-400 animate-pulse'
              }`}
              style={{ width: `${Math.min(100, isListening ? volume : 0)}%` }}
            ></div>
          </div>

          {/* Scale Labels */}
          <div className="grid grid-cols-4 text-center text-[10px] sm:text-xs font-black pt-1">
            <div className="text-emerald-700">0 - 35%<br/><span className="text-[10px] font-bold text-emerald-600">Yên tĩnh</span></div>
            <div className="text-amber-700">35 - 60%<br/><span className="text-[10px] font-bold text-amber-600">Hơi ồn</span></div>
            <div className="text-orange-700">60 - 80%<br/><span className="text-[10px] font-bold text-orange-600">Ồn</span></div>
            <div className="text-rose-700">80 - 100%<br/><span className="text-[10px] font-bold text-rose-600">Quá ồn</span></div>
          </div>
        </div>

        {/* 3. Settings & Sensitivity Controls */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200/80 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Sensitivity Slider */}
          <div className="flex-1 w-full space-y-1.5">
            <div className="flex items-center justify-between text-xs font-black text-slate-700">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-600" />
                <span>⚙️ Độ nhạy microphone:</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs font-black">
                {sensitivity === 0.8 ? 'Thấp (0.8x)' : sensitivity === 1.2 ? 'Chuẩn (1.2x)' : sensitivity === 1.8 ? 'Cao (1.8x)' : `${sensitivity}x`}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.1"
                value={sensitivity}
                onChange={(e) => setSensitivity(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              {[
                { label: 'Thấp', val: 0.8 },
                { label: 'Chuẩn', val: 1.2 },
                { label: 'Nhạy cao', val: 1.8 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setSensitivity(preset.val);
                    sound.playClick();
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    sensitivity === preset.val
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-purple-50 border border-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Alarm switch & Reset Peak */}
          <div className="flex items-center gap-3 flex-wrap justify-end shrink-0">
            <button
              type="button"
              onClick={() => {
                setEnableWarningAlarm(!enableWarningAlarm);
                sound.playClick();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition border ${
                enableWarningAlarm
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>{enableWarningAlarm ? 'Chuông cảnh báo: BẬT' : 'Chuông: TẮT'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setPeakVolume(0);
                setOverLimitCount(0);
                sound.playClick();
              }}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition"
            >
              🔄 Đặt lại đỉnh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
