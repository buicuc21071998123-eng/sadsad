import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CloudRain, Cloud, Sparkles, Star, Award, Gift, Trophy } from 'lucide-react';
import { fireConfetti, fireSuperConfetti } from '../utils/helpers';
import { sound } from '../utils/soundEffects';

export interface PointEventData {
  studentName: string;
  delta: number;
  reason: string;
  wasShielded?: boolean;
  isEvolutionLevelUp?: boolean;
  newLevelName?: string;
  isSuperBloom?: boolean;
  flowerName?: string;
  flowerIcon?: string;
}

interface PointAnimationOverlayProps {
  event: PointEventData | null;
  onComplete: () => void;
}

export const PointAnimationOverlay: React.FC<PointAnimationOverlayProps> = ({
  event,
  onComplete,
}) => {
  useEffect(() => {
    if (!event) return;

    if (event.isSuperBloom) {
      sound.playSuperBloom();
      fireSuperConfetti();
    } else if (event.wasShielded) {
      sound.playShieldProtect();
    } else if (event.delta > 0) {
      if (event.delta >= 15) {
        sound.playReward();
        fireSuperConfetti();
      } else if (event.isEvolutionLevelUp || event.delta >= 10) {
        sound.playLevelUp();
        fireConfetti();
      } else {
        sound.playEnergyTing();
      }
    } else {
      sound.playGentleWeather();
    }

    const duration = event.isSuperBloom ? 4800 : event.delta >= 15 ? 3500 : 2600;
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [event, onComplete]);

  if (!event) return null;

  const { studentName, delta, reason, wasShielded, isEvolutionLevelUp, newLevelName, isSuperBloom, flowerIcon } = event;

  // Star particle count based on delta
  const starCount = delta === 2 ? 3 : delta === 5 ? 6 : delta === 10 ? 10 : delta >= 15 ? 16 : Math.min(16, Math.max(1, delta));
  const starsArray = Array.from({ length: starCount });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
        {/* Full-screen backdrop tint for Super Bloom & +15 WOW event */}
        {(isSuperBloom || delta >= 15) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0D579B]/40 backdrop-blur-xs"
          />
        )}

        {/* Central Animated Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -30 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220 }}
          className={`relative max-w-md w-full p-6 rounded-3xl shadow-2xl text-center overflow-hidden border-2 ${
            isSuperBloom
              ? 'bg-gradient-to-b from-[#4DA8FF] via-[#76C7FF] to-[#D9F0FF] text-slate-900 border-white shadow-sky-400/50'
              : wasShielded
              ? 'bg-gradient-to-br from-sky-400 via-[#4DA8FF] to-blue-600 text-white border-white shadow-sky-500/40'
              : delta >= 15
              ? 'bg-gradient-to-br from-[#FFD95A] via-[#FFB55A] to-[#4DA8FF] text-slate-900 border-white shadow-amber-500/40'
              : delta >= 10
              ? 'bg-gradient-to-br from-[#4DA8FF] via-[#58D6C7] to-teal-500 text-white border-white shadow-sky-600/30'
              : delta >= 5
              ? 'bg-gradient-to-br from-[#4DA8FF] to-[#76C7FF] text-white border-white shadow-sky-400/30'
              : delta > 0
              ? 'bg-gradient-to-br from-[#76C7FF] to-[#4DA8FF] text-white border-white shadow-sky-300/30'
              : 'bg-gradient-to-b from-sky-50 via-slate-50 to-sky-100 text-slate-800 border-[#76C7FF] shadow-sky-200/50'
          }`}
        >
          {/* 1. BEAM OF LIGHT (LUỒNG SÁNG LỚN) for +10, +15 and 100 points */}
          {(delta >= 10 || isSuperBloom) && (
            <motion.div
              initial={{ opacity: 0, rotate: -45, scale: 0 }}
              animate={{ opacity: [0, 0.9, 0.4], rotate: 180, scale: 2 }}
              transition={{ duration: 2.5, ease: 'easeOut' }}
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-b from-yellow-300/40 via-white/30 to-transparent rounded-full blur-2xl pointer-events-none"
            />
          )}

          {/* 2. FLYING STARS ANIMATION for Point Additions */}
          {delta > 0 && !wasShielded && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {starsArray.map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    x: (Math.random() - 0.5) * 180,
                    y: 70,
                    scale: 0.4,
                  }}
                  animate={{
                    opacity: [0, 1, 0.9, 0],
                    y: -120 - Math.random() * 80,
                    x: (Math.random() - 0.5) * 260,
                    scale: [0.4, 1.4, 0.8],
                  }}
                  transition={{
                    duration: 1.8,
                    delay: i * (delta >= 15 ? 0.05 : 0.08),
                    ease: 'easeOut',
                  }}
                  className="absolute bottom-4 left-1/2 text-yellow-300 text-xl filter drop-shadow-md select-none"
                >
                  ⭐
                </motion.div>
              ))}
            </div>
          )}

          {/* 3. GENTLE CLOUD / RAIN ANIMATION for Point Deductions */}
          {delta < 0 && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex flex-col items-center justify-start pt-2">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.9 }}
                className="text-4xl filter drop-shadow-sm select-none"
              >
                ☁️
              </motion.div>
              <div className="flex gap-4 mt-1">
                {[1, 2, 3].map((drop, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -5, opacity: 0 }}
                    animate={{ y: [0, 100], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 1.1, delay: i * 0.15, repeat: 1 }}
                    className="text-lg filter drop-shadow-xs"
                  >
                    🌧️
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* 4. CENTRAL BADGE ICON */}
          <motion.div
            initial={{ scale: 0 }}
            animate={
              delta === 5
                ? { scale: 1, rotate: [0, -6, 6, -4, 4, 0] }
                : delta >= 15
                ? { scale: [0, 1.25, 1], rotate: [0, -15, 15, 0] }
                : { scale: 1, rotate: [0, -8, 8, 0] }
            }
            transition={{
              delay: 0.1,
              scale: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] },
              rotate: { duration: 0.6, ease: 'easeInOut' },
            }}
            className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-xl mb-3 border-2 backdrop-blur-md ${
              isSuperBloom
                ? 'bg-white/40 border-white text-5xl'
                : wasShielded
                ? 'bg-white/30 border-white text-white'
                : delta >= 15
                ? 'bg-white/50 border-white text-5xl shadow-amber-400/40'
                : delta >= 10
                ? 'bg-white/30 border-white'
                : delta >= 5
                ? 'bg-white/30 border-white'
                : delta > 0
                ? 'bg-white/30 border-white'
                : 'bg-white border-[#76C7FF] text-sky-700'
            }`}
          >
            {isSuperBloom ? (
              flowerIcon || '🌸'
            ) : wasShielded ? (
              <ShieldCheck className="w-11 h-11 text-white animate-pulse" />
            ) : delta === 2 ? (
              '⏰'
            ) : delta === 5 ? (
              '🙋'
            ) : delta === 10 ? (
              '📚'
            ) : delta >= 15 ? (
              '🏆'
            ) : delta === -3 ? (
              '🌧️'
            ) : delta === -5 ? (
              '☁️'
            ) : delta < 0 ? (
              '🌧️'
            ) : (
              '✨'
            )}
          </motion.div>

          {/* 5. TEXT CONTENT & PEDAGOGICAL MESSAGING */}
          <div className="relative z-10 space-y-1">
            <h4 className={`text-xl sm:text-2xl font-black tracking-tight drop-shadow-xs ${isSuperBloom ? 'text-[#0D579B]' : delta < 0 ? 'text-slate-900' : 'text-white'}`}>
              {studentName}
            </h4>

            {/* SUPER BLOOM EVENT (100 PTS) */}
            {isSuperBloom ? (
              <div className="space-y-2 pt-1 text-center">
                <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFD95A] text-amber-950 text-xs font-black tracking-wider uppercase shadow-md animate-pulse border-2 border-white">
                  <span>🎉 CHÚC MỪNG! 🎉</span>
                </div>
                
                <h3 className="text-base sm:text-lg font-black text-[#0D579B]">
                  Cây Ước Mơ của {studentName} đã nở hoa! 🌸
                </h3>

                <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-white/60 rounded-2xl border border-white shadow-xs">
                  <span className="text-xl">🏆</span>
                  <span className="text-sm font-black text-[#0D579B]">100 ĐIỂM</span>
                </div>

                <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-white/70 rounded-2xl border border-white text-xs font-black text-[#0D579B] shadow-xs">
                  <span>🌸</span>
                  <span>THÊM 1 BÔNG HOA VÀO VƯỜN THÀNH TÍCH</span>
                </div>

                <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-[#FFD95A]/80 rounded-2xl border border-amber-300 text-xs font-black text-amber-950 shadow-xs">
                  <span>🎁</span>
                  <span>Nhận quà đặc biệt từ cô giáo</span>
                </div>
              </div>
            ) : wasShielded ? (
              /* SHIELD PROTECTED EVENT */
              <div className="space-y-1 pt-1">
                <div className="inline-block px-3 py-1 rounded-full bg-white text-sky-900 text-xs font-black uppercase shadow-md">
                  🛡️ LÁ CHẮN ĐÃ BẢO VỆ BẠN!
                </div>
                <div className="text-sm font-bold text-white mt-1">
                  {reason} ➔ <b className="text-yellow-200 underline font-black">0 điểm (Không mất điểm)</b>
                </div>
                <p className="text-xs text-sky-100 font-medium">
                  Đã tiêu hao 1 Lá chắn. Hãy tiếp tục giữ vững nề nếp thật tốt nhé!
                </p>
              </div>
            ) : delta > 0 ? (
              /* POSITIVE SCORING (TIERED WOW ANIMATIONS) */
              <div>
                <div className="text-3xl font-black text-yellow-200 flex items-center justify-center gap-1.5 my-1 drop-shadow-xs">
                  <span>+{delta}</span>
                  <span className="text-sm font-bold text-white uppercase tracking-wider">
                    {delta >= 15 ? '⭐ SIÊU SAO WOW! ⭐' : 'Hạt Năng Lượng ✨'}
                  </span>
                </div>

                {/* Specific notifications */}
                <div className="text-xs sm:text-sm font-extrabold text-white/95">
                  {delta === 2 ? (
                    <span>⏰ Đi học đúng giờ! +2 ⭐</span>
                  ) : delta === 5 ? (
                    <span>🙋 Phát biểu xây dựng bài sôi nổi! Mọc thêm lá non 🌿</span>
                  ) : delta === 10 ? (
                    <span>📚 Làm bài tập đầy đủ, sạch đẹp! Luồng sáng lớn 🌟</span>
                  ) : delta >= 15 ? (
                    <span>🏆 Thành tích xuất sắc vượt bậc! Cây tiến hóa nhảy vọt ✨</span>
                  ) : (
                    <span>{reason}</span>
                  )}
                </div>

                {/* Evolution Level Up Notification */}
                {isEvolutionLevelUp && newLevelName && (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mt-2 py-1 px-3.5 rounded-xl bg-[#FFD95A] text-amber-950 text-xs font-black shadow-md inline-flex items-center gap-1.5 border border-white"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-900" />
                    <span>🎉 TING! Cây đã tiến hóa: {newLevelName}!</span>
                  </motion.div>
                )}
              </div>
            ) : (
              /* GENTLE PEDAGOGICAL NEGATIVE POINTS */
              <div>
                <div className="text-2xl font-black text-rose-600 my-0.5">
                  {delta} điểm
                </div>

                <div className="text-xs sm:text-sm font-bold text-slate-700">
                  {reason}
                </div>

                <p className="text-xs font-black text-sky-700 mt-2 bg-white/80 py-1 px-3 rounded-xl border border-[#76C7FF]">
                  🌈 Cố gắng hơn ở lần sau nhé!
                </p>

                <p className="text-[11px] text-slate-500 mt-1 font-medium">
                  💚 Cây không bị héo úa — Mọi bông hoa đã đạt vẫn được giữ nguyên!
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
