import React from 'react';
import { TreeEvolutionInfo } from '../data/dreamTreeData';
import { motion } from 'motion/react';
import { Sparkles, Shield, Trophy } from 'lucide-react';

interface DreamTreeVisualizerProps {
  info: TreeEvolutionInfo;
  shields?: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  onOpenGarden?: () => void;
}

export const DreamTreeVisualizer: React.FC<DreamTreeVisualizerProps> = ({
  info,
  shields = 0,
  size = 'md',
  showDetails = true,
  onOpenGarden,
}) => {
  const { currentStage, cycle, currentFlowerModel } = info;

  // Visual dimension styling
  const containerHeight = size === 'sm' ? 'h-24' : size === 'md' ? 'h-36' : 'h-48';
  const iconSize = size === 'sm' ? 'text-3xl' : size === 'md' ? 'text-5xl' : 'text-6xl';

  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Cartoon Cute Garden Container */}
      <div 
        onClick={onOpenGarden}
        className={`relative ${containerHeight} w-full flex items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#FAF5FF] via-[#FFF5F8] to-[#FFF7ED] border-2 border-[#FCE7F3] hover:border-[#F9A8D4] shadow-xs cursor-pointer group transition`}
        title="Bấm để xem chi tiết Vườn Cây Ước Mơ"
      >
        {/* Soft Background Clouds */}
        <div className="absolute top-1.5 left-3 text-xs opacity-75 pointer-events-none select-none animate-pulse">
          ☁️
        </div>
        <div className="absolute top-3 right-4 text-xs opacity-75 pointer-events-none select-none">
          ☁️
        </div>

        {/* Small Rainbow for Higher Stages (>= 80 pts / step 16+) */}
        {currentStage.step >= 16 && (
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-28 h-14 pointer-events-none opacity-85">
            <svg viewBox="0 0 100 50" className="w-full h-full">
              <defs>
                <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="25%" stopColor="#f43f5e" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="75%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <path
                d="M 10,48 A 40,40 0 0,1 90,48"
                fill="none"
                stroke="url(#rainbowGrad)"
                strokeWidth="4"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>
          </div>
        )}

        {/* Floating Sparks */}
        {(currentStage.step >= 10 || currentStage.step === 18) && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-2 left-4 w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping"></div>
            <div className="absolute top-4 right-5 w-2 h-2 rounded-full bg-pink-300 animate-pulse"></div>
            <div className="absolute bottom-3 left-6 w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce"></div>
          </div>
        )}

        {/* Cute Companion Creatures */}
        {currentStage.step >= 8 && currentStage.step < 13 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2.5 right-3.5 text-sm filter drop-shadow-xs select-none"
            title="Bạn bọ rùa may mắn 🐞"
          >
            🐞
          </motion.div>
        )}

        {/* Little Butterfly */}
        {currentStage.step >= 11 && (
          <motion.div
            animate={{ y: [0, -4, 0], x: [0, 3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
            className="absolute top-2 left-3.5 text-sm filter drop-shadow-xs select-none"
            title="Cánh bướm rực rỡ 🦋"
          >
            🦋
          </motion.div>
        )}

        {/* Little Honey Bee */}
        {currentStage.step >= 15 && (
          <motion.div
            animate={{ y: [0, -3, 0], x: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="absolute top-3.5 right-3 text-sm filter drop-shadow-xs select-none"
            title="Ong chăm chỉ 🐝"
          >
            🐝
          </motion.div>
        )}

        {/* Rolling Pastel Grass Base with Small Flowers */}
        <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-emerald-100/90 via-pink-100/60 to-transparent flex items-end justify-between px-3 pb-0.5 pointer-events-none">
          <span className="text-[10px]">🌸</span>
          <span className="text-[9px]">🌼</span>
          <span className="text-[10px]">🌱</span>
          <span className="text-[9px]">🌼</span>
          <span className="text-[10px]">🌸</span>
        </div>

        {/* Central Tree Icon & Soft Glow */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          {currentStage.step >= 10 && (
            <div className="absolute -inset-3 bg-gradient-to-tr from-pink-200/50 via-purple-100/40 to-yellow-200/40 rounded-full blur-md animate-pulse"></div>
          )}

          <motion.div
            key={`${currentStage.step}-${info.totalPoints}`}
            initial={{ scale: 0.82, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            className={`relative ${iconSize} filter drop-shadow-sm select-none transform transition group-hover:scale-110`}
          >
            {currentStage.icon}
          </motion.div>

          {/* Plant Ground Soil Mound */}
          <div className="w-14 h-1.5 rounded-full bg-amber-700/20 mt-0.5 blur-[0.3px]"></div>
        </div>

        {/* Active Shield Badge */}
        {shields > 0 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white text-[11px] font-black shadow-xs border border-white/60">
            <Shield className="w-3 h-3 fill-pink-100" />
            <span>x{shields}</span>
          </div>
        )}

        {/* Bloomed Flowers count badge */}
        {cycle > 0 && (
          <div
            className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#FACC15] to-[#FB923C] text-[#581C87] text-[11px] font-black shadow-xs border border-white/60"
            title="Số hoa đã nở"
          >
            <span>{currentFlowerModel.icon}</span>
            <span>x{cycle}</span>
            <Trophy className="w-3 h-3 text-[#581C87]" />
          </div>
        )}
      </div>

      {showDetails && (
        <div className="w-full mt-2.5 space-y-1.5">
          {/* Stage name & Points info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-black text-slate-800 truncate">
              <span className="text-base">{info.coreStageIcon}</span>
              <span className="font-black text-[#7E22CE]">{info.coreStageName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FAF5FF] text-[#A855F7] font-black border border-[#E9D5FF]">
                Cấp {info.step}
              </span>
            </div>

            <div className="text-xs font-black text-[#7E22CE] shrink-0">
              <span className="text-sm font-black text-[#EC4899]">{info.currentCyclePoints}</span>
              <span className="text-slate-400 font-bold"> / 100 điểm</span>
            </div>
          </div>

          {/* Progress Bar: Gradient Tím hồng (#A855F7 → #EC4899) */}
          <div className="space-y-1">
            <div className="w-full h-2.5 bg-[#FAF5FF] rounded-full overflow-hidden p-0.5 border border-[#FCE7F3]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, info.percent)}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#A855F7] via-[#EC4899] to-[#F472B6] shadow-xs"
              />
            </div>

            {/* Next stage encouragement message */}
            <div className="flex items-center justify-between text-[11px] pt-0.5">
              <span className="text-slate-500 font-bold">
                Tiến trình: <strong className="text-[#7E22CE]">{info.percent}%</strong>
              </span>

              <span className="font-black text-[#DB2777] flex items-center gap-1 truncate max-w-[200px]" title={info.progressMessage}>
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>{info.progressMessage}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
