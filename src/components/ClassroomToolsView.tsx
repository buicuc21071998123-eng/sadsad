import React, { useState, useEffect, useRef } from 'react';
import { Student, DailyAttendance } from '../types';
import { sound } from '../utils/soundEffects';
import { fireConfetti, fireSuperConfetti, getAvatarColor, getStudentInitials } from '../utils/helpers';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Users, 
  Sparkles, 
  Volume2, 
  BellRing, 
  Shuffle, 
  Copy, 
  Check, 
  Award,
  Crown,
  Clock,
  Zap,
  Dice5
} from 'lucide-react';

interface ClassroomToolsViewProps {
  students: Student[];
  attendance: DailyAttendance;
  onAwardPoints: (studentIds: string[], delta: number, reason: string, category: any) => void;
  initialTab?: 'wheel' | 'timer' | 'groups' | 'soundboard';
}

export const ClassroomToolsView: React.FC<ClassroomToolsViewProps> = ({
  students,
  attendance,
  onAwardPoints,
  initialTab = 'wheel',
}) => {
  const [activeTab, setActiveTab] = useState<'wheel' | 'timer' | 'groups' | 'soundboard'>(initialTab);

  // Update activeTab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ==================== 1. WHEEL OF FORTUNE STATE ====================
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerStudent, setWinnerStudent] = useState<Student | null>(null);
  const [onlyPresent, setOnlyPresent] = useState(true);
  const [spinRotation, setSpinRotation] = useState(0);

  // Eligible students for picker
  const eligibleStudents = students.filter((s) => {
    if (!onlyPresent) return true;
    const rec = attendance.records[s.id];
    return !rec || rec.status === 'present' || rec.status === 'late';
  });

  // Draw the wheel on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numSlices = eligibleStudents.length || 1;
    const sliceAngle = (2 * Math.PI) / numSlices;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = centerX - 10;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Colors palette for wheel slices
    const colors = [
      '#10B981', '#3B82F6', '#F59E0B', '#EC4899', '#8B5CF6',
      '#06B6D4', '#F97316', '#14B8A6', '#6366F1', '#E11D48',
    ];

    eligibleStudents.forEach((student, idx) => {
      const angle = idx * sliceAngle + spinRotation;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = colors[idx % colors.length];
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text label
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 3;
      
      const shortName = student.name.split(' ').slice(-2).join(' ');
      ctx.fillText(shortName, radius - 15, 4);
      ctx.restore();
    });

    // Center pin
    ctx.beginPath();
    ctx.arc(centerX, centerY, 24, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('4A2', centerX, centerY);
  }, [eligibleStudents, spinRotation]);

  const handleSpinWheel = () => {
    if (isSpinning || eligibleStudents.length === 0) return;
    setIsSpinning(true);
    setWinnerStudent(null);
    sound.playClick();

    const spinTime = 3800; // 3.8s
    const startTime = performance.now();
    const startRot = spinRotation;
    // 5 to 8 full rotations plus random offset
    const totalExtraRotation = 5 * 2 * Math.PI + Math.random() * (3 * 2 * Math.PI);
    const targetRotation = startRot + totalExtraRotation;

    let lastTickAngle = startRot;
    const sliceAngle = (2 * Math.PI) / eligibleStudents.length;

    const animateSpin = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / spinTime);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRot + totalExtraRotation * ease;

      // Tick sound
      if (currentRot - lastTickAngle >= sliceAngle * 0.7) {
        sound.playTick();
        lastTickAngle = currentRot;
      }

      setSpinRotation(currentRot);

      if (progress < 1) {
        requestAnimationFrame(animateSpin);
      } else {
        setIsSpinning(false);
        // Calculate winner
        const normalized = (currentRot % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        // Arrow is at the right (angle 0)
        const pointerAngle = (2 * Math.PI - normalized) % (2 * Math.PI);
        const winningIndex = Math.floor(pointerAngle / sliceAngle) % eligibleStudents.length;
        const winner = eligibleStudents[winningIndex];
        setWinnerStudent(winner);
        sound.playApplause();
        fireSuperConfetti();
      }
    };

    requestAnimationFrame(animateSpin);
  };

  // ==================== 2. COUNTDOWN TIMER STATE ====================
  const [timerSeconds, setTimerSeconds] = useState(180); // Default 3 mins
  const [initialSeconds, setInitialSeconds] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            sound.playTimerAlarm();
            fireConfetti();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  const setTimerPreset = (secs: number) => {
    setIsTimerRunning(false);
    setInitialSeconds(secs);
    setTimerSeconds(secs);
    sound.playClick();
  };

  const toggleTimer = () => {
    if (timerSeconds === 0) {
      setTimerSeconds(initialSeconds);
    }
    setIsTimerRunning(!isTimerRunning);
    sound.playClick();
  };

  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(initialSeconds);
    sound.playClick();
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // ==================== 3. GROUP GENERATOR STATE ====================
  const [numGroups, setNumGroups] = useState<number>(4);
  const [generatedGroups, setGeneratedGroups] = useState<{ id: number; name: string; members: Student[] }[]>([]);
  const [copiedGroupList, setCopiedGroupList] = useState(false);

  const teamNames = [
    '🦁 Biệt Đội Sư Tử Dũng Mãnh',
    '🚀 Đội Phi Thuyền Không Gian',
    '⚡ Biệt Đội Tia Chớp Siêu Tốc',
    '🌟 Đội Ngôi Sao May Mắn',
    '🐬 Đội Cá Heo Thông Thái',
    '🦅 Đội Đại Bàng Tiên Phong',
    '🐼 Đội Gấu Trúc Đáng Yêu',
    '🍀 Đội Cỏ Bốn Lá Kỳ Diệu',
  ];

  const handleGenerateGroups = () => {
    sound.playReward();
    fireConfetti();
    const shuffled = [...students].sort(() => Math.random() - 0.5);
    const groups: { id: number; name: string; members: Student[] }[] = [];

    for (let i = 0; i < numGroups; i++) {
      groups.push({
        id: i + 1,
        name: teamNames[i % teamNames.length] || `Nhóm ${i + 1}`,
        members: [],
      });
    }

    shuffled.forEach((student, index) => {
      groups[index % numGroups].members.push(student);
    });

    setGeneratedGroups(groups);
  };

  const handleCopyGroups = () => {
    if (generatedGroups.length === 0) return;
    let text = `📋 [DANH SÁCH CHIA NHÓM HOẠT ĐỘNG - LỚP 4A2]\n\n`;
    generatedGroups.forEach((g) => {
      text += `${g.name} (${g.members.length} em):\n`;
      g.members.forEach((m, idx) => {
        text += `  ${idx + 1}. ${m.name} (Tổ ${m.group})\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
      sound.playReward();
      setCopiedGroupList(true);
      setTimeout(() => setCopiedGroupList(false), 3000);
    });
  };

  return (
    <div id="classroom-tools-section" className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2.5 pb-2">
        <button
          onClick={() => setActiveTab('wheel')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 select-none shadow-xs ${
            activeTab === 'wheel'
              ? 'candy-btn-purple text-white shadow-md shadow-purple-300/40'
              : 'bg-white/90 text-purple-900 hover:bg-pink-50/80 border-2 border-[#FCE7F3]'
          }`}
        >
          <Shuffle className="w-4 h-4" />
          <span>Vòng Quay May Mắn (Gọi Tên)</span>
        </button>

        <button
          onClick={() => setActiveTab('timer')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 select-none shadow-xs ${
            activeTab === 'timer'
              ? 'candy-btn-purple text-white shadow-md shadow-purple-300/40'
              : 'bg-white/90 text-purple-900 hover:bg-pink-50/80 border-2 border-[#FCE7F3]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Đồng Hồ Đếm Ngược</span>
        </button>

        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 select-none shadow-xs ${
            activeTab === 'groups'
              ? 'candy-btn-purple text-white shadow-md shadow-purple-300/40'
              : 'bg-white/90 text-purple-900 hover:bg-pink-50/80 border-2 border-[#FCE7F3]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Chia Nhóm Tự Động</span>
        </button>

        <button
          onClick={() => setActiveTab('soundboard')}
          className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 select-none shadow-xs ${
            activeTab === 'soundboard'
              ? 'candy-btn-purple text-white shadow-md shadow-purple-300/40'
              : 'bg-white/90 text-purple-900 hover:bg-pink-50/80 border-2 border-[#FCE7F3]'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Hộp Âm Thanh Lớp Học</span>
        </button>
      </div>

      {/* 1. WHEEL OF FORTUNE VIEW */}
      {activeTab === 'wheel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Wheel Canvas Card */}
          <div className="lg:col-span-7 bg-white/90 backdrop-blur-xs rounded-3xl p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 flex flex-col items-center justify-center relative">
            {/* Top Indicator Arrow */}
            <div className="relative">
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 w-0 h-0 border-y-8 border-y-transparent border-r-16 border-r-pink-500 filter drop-shadow-md"></div>
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                className="max-w-full h-auto rounded-full shadow-inner cursor-pointer border-4 border-pink-200"
                onClick={handleSpinWheel}
              />
            </div>

            {/* Controls under wheel */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                id="btn-spin-wheel"
                type="button"
                disabled={isSpinning}
                onClick={handleSpinWheel}
                className="candy-btn-gold px-7 py-3 text-purple-950 font-black text-sm sm:text-base rounded-2xl shadow-lg active:scale-95 transition disabled:opacity-50 flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5 text-purple-950 animate-spin-slow" />
                <span>{isSpinning ? 'Đang quay kịch tính...' : 'Quay Vòng May Mắn!'}</span>
              </button>

              <label className="flex items-center gap-2 text-xs font-black text-purple-900 bg-pink-50 border-2 border-pink-200 px-3.5 py-2.5 rounded-2xl cursor-pointer shadow-2xs">
                <input
                  type="checkbox"
                  checked={onlyPresent}
                  onChange={(e) => setOnlyPresent(e.target.checked)}
                  className="rounded text-pink-600 focus:ring-pink-400 accent-pink-500 cursor-pointer"
                />
                <span>Chỉ quay bạn có mặt ({eligibleStudents.length})</span>
              </label>
            </div>
          </div>

          {/* Winner Display Card */}
          <div className="lg:col-span-5 space-y-4">
            {winnerStudent ? (
              <div className="bg-gradient-to-br from-amber-50 via-pink-50 to-purple-50 rounded-3xl p-6 border-3 border-amber-300 shadow-xl text-center animate-in zoom-in-95 duration-200 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-200 text-purple-950 font-black text-xs uppercase shadow-xs">
                  <Crown className="w-4 h-4 text-amber-700" />
                  CHÚC MỪNG BẠN MAY MẮN!
                </div>

                <div
                  className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${getAvatarColor(
                    winnerStudent.name,
                    winnerStudent.gender
                  )} text-white flex items-center justify-center font-black text-2xl mx-auto shadow-lg border-3 border-white`}
                >
                  {getStudentInitials(winnerStudent.name)}
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-800">
                    {winnerStudent.name}
                  </h3>
                  <div className="text-xs font-bold text-purple-700 mt-0.5">
                    STT #{winnerStudent.stt} • Tổ {winnerStudent.group} ({winnerStudent.role})
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-600">
                  Em đã được thần may mắn gọi tên để trả lời câu hỏi hoặc nhận nhiệm vụ bí mật! 🌟
                </p>

                {/* Quick Points for Winner */}
                <div className="pt-4 border-t-2 border-pink-200 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      sound.playReward();
                      fireConfetti();
                      onAwardPoints([winnerStudent.id], 2, 'Trả lời bài xuất sắc khi quay trúng', 'academic');
                    }}
                    className="candy-btn-purple px-4 py-2 text-white font-black text-xs rounded-xl shadow-xs"
                  >
                    +2 Hoa (Trả lời tốt)
                  </button>
                  <button
                    onClick={() => {
                      sound.playReward();
                      fireConfetti();
                      onAwardPoints([winnerStudent.id], 5, 'Xuất sắc đạt điểm 10 khi quay trúng', 'academic');
                    }}
                    className="candy-btn-gold px-4 py-2 text-purple-950 font-black text-xs rounded-xl shadow-xs"
                  >
                    ⭐ +5 Hoa (Điểm 10)
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-8 border-2 border-[#FCE7F3] text-center shadow-md shadow-pink-100/40">
                <div className="w-16 h-16 rounded-3xl bg-pink-100 text-pink-600 flex items-center justify-center text-3xl mx-auto mb-3 shadow-inner">
                  🎡
                </div>
                <h3 className="font-black text-slate-800 text-base">Sẵn sàng gọi tên</h3>
                <p className="text-xs font-semibold text-slate-500 mt-1 max-w-xs mx-auto">
                  Bấm nút &quot;Quay Vòng May Mắn&quot; để chọn ngẫu nhiên một bạn học sinh lên bảng hoặc phát biểu ý kiến.
                </p>
              </div>
            )}

            {/* Instruction Tip */}
            <div className="bg-pink-50/70 rounded-3xl p-4 border-2 border-pink-200 text-xs text-purple-900">
              <div className="font-black text-purple-950 mb-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Mẹo áp dụng trong giờ dạy:
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] font-medium text-purple-800">
                <li>Dùng để kiểm tra bài cũ vui nhộn, tạo bầu không khí hào hứng.</li>
                <li>Chọn người đại diện nhóm lên thuyết trình sản phẩm học tập.</li>
                <li>Chọn bạn may mắn bốc thăm câu hỏi đố vui đầu giờ sinh hoạt lớp.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 2. CLASSROOM COUNTDOWN TIMER */}
      {activeTab === 'timer' && (
        <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-6 sm:p-10 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-800 text-xs font-black border border-pink-200">
            <Clock className="w-4 h-4 text-pink-600" />
            <span>Đồng Hồ Đếm Ngược Thảo Luận & Làm Bài</span>
          </div>

          {/* Big Digital Display */}
          <div className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight text-purple-950 font-mono select-none drop-shadow-sm">
            {formatTime(timerSeconds)}
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-pink-100 rounded-full h-3.5 max-w-md mx-auto overflow-hidden p-0.5 border border-pink-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                timerSeconds < 30 ? 'bg-rose-500 animate-pulse' : 'bg-gradient-to-r from-pink-500 to-purple-500'
              }`}
              style={{ width: `${(timerSeconds / (initialSeconds || 1)) * 100}%` }}
            ></div>
          </div>

          {/* Play / Pause / Reset Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3.5 rounded-2xl font-black text-sm sm:text-base transition active:scale-95 shadow-md flex items-center gap-2 ${
                isTimerRunning
                  ? 'candy-btn-peach text-white'
                  : 'candy-btn-gold text-purple-950'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-5 h-5" /> Tạm dừng
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" /> Bắt đầu tính giờ
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="p-3.5 bg-slate-100 hover:bg-slate-200 text-purple-900 rounded-2xl transition active:scale-95 font-black border border-slate-200 shadow-2xs"
              title="Đặt lại thời gian"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Preset Buttons */}
          <div className="pt-6 border-t-2 border-pink-100">
            <div className="text-xs font-black text-purple-900 uppercase tracking-wider mb-3">
              Chọn nhanh các mốc thời gian:
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                { label: '1 Phút', secs: 60 },
                { label: '2 Phút', secs: 120 },
                { label: '3 Phút (Nhóm)', secs: 180 },
                { label: '5 Phút (Luyện tập)', secs: 300 },
                { label: '10 Phút (Kiểm tra)', secs: 600 },
                { label: '15 Phút', secs: 900 },
              ].map((preset) => (
                <button
                  key={preset.secs}
                  onClick={() => setTimerPreset(preset.secs)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black border-2 transition ${
                    initialSeconds === preset.secs
                      ? 'candy-btn-purple text-white shadow-xs'
                      : 'bg-pink-50/70 text-purple-900 border-pink-200 hover:bg-pink-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. GROUP GENERATOR */}
      {activeTab === 'groups' && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-6 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-pink-600" />
                <span>Bộ Chia Nhóm Tự Động & Công Bằng</span>
              </h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Tự động chia {students.length} học sinh thành các nhóm ngẫu nhiên cho giờ thảo luận hoặc trò chơi
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-pink-50/80 px-3.5 py-2 rounded-2xl border-2 border-pink-200 text-xs font-black text-purple-900 shadow-2xs">
                <span>Số nhóm:</span>
                <select
                  value={numGroups}
                  onChange={(e) => setNumGroups(parseInt(e.target.value) || 4)}
                  className="bg-transparent font-black text-purple-950 focus:outline-none cursor-pointer"
                >
                  <option value={2}>2 Nhóm</option>
                  <option value={3}>3 Nhóm</option>
                  <option value={4}>4 Nhóm</option>
                  <option value={5}>5 Nhóm</option>
                  <option value={6}>6 Nhóm</option>
                  <option value={8}>8 Nhóm</option>
                </select>
              </div>

              <button
                onClick={handleGenerateGroups}
                className="candy-btn-purple px-4 py-2.5 text-white font-black text-xs sm:text-sm rounded-2xl shadow-sm transition active:scale-95 flex items-center gap-1.5"
              >
                <Shuffle className="w-4 h-4" />
                <span>Chia nhóm ngay</span>
              </button>

              {generatedGroups.length > 0 && (
                <button
                  onClick={handleCopyGroups}
                  className={`px-3.5 py-2.5 text-xs font-black rounded-2xl shadow-2xs transition flex items-center gap-1.5 border ${
                    copiedGroupList
                      ? 'candy-btn-gold text-purple-950'
                      : 'bg-slate-100 hover:bg-slate-200 text-purple-900 border-slate-200'
                  }`}
                >
                  {copiedGroupList ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedGroupList ? 'Đã chép!' : 'Sao chép'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Groups Grid Display */}
          {generatedGroups.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {generatedGroups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white/90 backdrop-blur-xs rounded-3xl p-4.5 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/30 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-2.5 border-b-2 border-pink-100 mb-3">
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm truncate" title={group.name}>
                        {group.name}
                      </h4>
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
                        {group.members.length} em
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {group.members.map((mem, idx) => (
                        <div
                          key={mem.id}
                          className="flex items-center justify-between p-1.5 rounded-xl hover:bg-pink-50/60 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-pink-400 w-4">{idx + 1}.</span>
                            <span className="font-bold text-slate-800">{mem.name}</span>
                          </div>
                          <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">Tổ {mem.group}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-pink-100 text-center">
                    <button
                      onClick={() => {
                        sound.playReward();
                        fireConfetti();
                        onAwardPoints(
                          group.members.map((m) => m.id),
                          2,
                          `Thưởng nhóm ${group.name} hoàn thành tốt bài tập`,
                          'academic'
                        );
                      }}
                      className="w-full py-2 px-2 bg-pink-50 hover:bg-pink-100 text-pink-900 border-2 border-pink-200 rounded-xl text-xs font-black transition flex items-center justify-center gap-1 shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-600" />
                      <span>+2 Hoa cả nhóm</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-12 text-center border-2 border-[#FCE7F3] shadow-md shadow-pink-100/30">
              <Users className="w-12 h-12 text-pink-300 mx-auto mb-3" />
              <h3 className="font-black text-slate-700 text-base">Chưa tạo nhóm</h3>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Chọn số lượng nhóm và bấm &quot;Chia nhóm ngay&quot; để tạo danh sách phân bổ học sinh.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. CLASSROOM SOUNDBOARD */}
      {activeTab === 'soundboard' && (
        <div className="bg-white/90 backdrop-blur-xs rounded-3xl p-6 sm:p-8 border-2 border-[#FCE7F3] shadow-md shadow-pink-100/50 max-w-2xl mx-auto text-center space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center justify-center gap-2">
              <Volume2 className="w-5 h-5 text-pink-600" />
              <span>Hộp Âm Thanh Quản Lý Lớp Học</span>
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Phát tín hiệu âm thanh trực quan giúp học sinh tập trung, vui vẻ và hào hứng
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => sound.playQuietBell()}
              className="p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-2 border-amber-200 text-left transition active:scale-95 group shadow-sm shadow-amber-100"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-2xl shadow-sm group-hover:rotate-12 transition">
                  🔔
                </div>
                <div>
                  <h4 className="font-black text-amber-950 text-sm">Chuông Trật Tự (Gong)</h4>
                  <p className="text-[11px] font-medium text-amber-900/80 mt-0.5">Tiếng chuông thanh tịnh nhắc lớp trật tự</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => {
                sound.playApplause();
                fireConfetti();
              }}
              className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-2 border-emerald-200 text-left transition active:scale-95 group shadow-sm shadow-emerald-100"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-emerald-400 text-white flex items-center justify-center font-bold text-2xl shadow-sm group-hover:scale-110 transition">
                  👏
                </div>
                <div>
                  <h4 className="font-black text-emerald-950 text-sm">Vỗ Tay Chúc Mừng</h4>
                  <p className="text-[11px] font-medium text-emerald-900/80 mt-0.5">Hoan hô bạn trả lời hay hoặc thắng trò chơi</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => sound.playReward()}
              className="p-5 rounded-3xl bg-gradient-to-br from-pink-50 to-purple-50 hover:from-pink-100 hover:to-purple-100 border-2 border-pink-200 text-left transition active:scale-95 group shadow-sm shadow-pink-100"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-pink-400 text-white flex items-center justify-center font-bold text-2xl shadow-sm group-hover:rotate-12 transition">
                  ✨
                </div>
                <div>
                  <h4 className="font-black text-pink-950 text-sm">Ting Ting Tặng Hoa</h4>
                  <p className="text-[11px] font-medium text-pink-900/80 mt-0.5">Âm thanh vui nhộn khi được cộng điểm</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => sound.playTimerAlarm()}
              className="p-5 rounded-3xl bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border-2 border-rose-200 text-left transition active:scale-95 group shadow-sm shadow-rose-100"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 rounded-2xl bg-rose-400 text-white flex items-center justify-center font-bold text-2xl shadow-sm group-hover:scale-110 transition">
                  ⏰
                </div>
                <div>
                  <h4 className="font-black text-rose-950 text-sm">Chuông Hết Giờ</h4>
                  <p className="text-[11px] font-medium text-rose-900/80 mt-0.5">Tín hiệu dừng bút khi hết giờ thảo luận</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
