import confetti from 'canvas-confetti';
import { Student } from '../types';
import { getTreeEvolutionInfo, DREAM_TREE_STAGES, GARDEN_COLLECTION_FLOWERS } from '../data/dreamTreeData';

export { getTreeEvolutionInfo, DREAM_TREE_STAGES, GARDEN_COLLECTION_FLOWERS };

export const fireConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6'],
    });
  } catch (e) {
    console.error('Confetti error', e);
  }
};

export const fireSuperConfetti = () => {
  try {
    const end = Date.now() + 2.5 * 1000;
    const colors = ['#10B981', '#F59E0B', '#EC4899', '#3B82F6', '#8B5CF6', '#FBBF24', '#EC4899'];

    (function frame() {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  } catch (e) {
    console.error('Super confetti error', e);
  }
};

export interface GrowthStage {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon: string;
  badge: string;
  color: string;
  description: string;
}

export const GROWTH_STAGES: GrowthStage[] = [
  {
    level: 1,
    name: 'Hạt Mầm Xanh',
    minPoints: 0,
    maxPoints: 19,
    icon: '🌱',
    badge: 'Mầm Non',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description: 'Hạt giống tri thức vừa gieo xuống, đang ươm mầm mỗi ngày',
  },
  {
    level: 2,
    name: 'Cây Con Vươn Chồi',
    minPoints: 20,
    maxPoints: 49,
    icon: '🌿',
    badge: 'Nảy Lộc',
    color: 'text-teal-600 bg-teal-50 border-teal-200',
    description: 'Chồi non xanh mướt, chăm ngoan và tích cực học hỏi',
  },
  {
    level: 3,
    name: 'Nụ Hoa Tỏa Hương',
    minPoints: 50,
    maxPoints: 79,
    icon: '🌷',
    badge: 'Nở Hoa',
    color: 'text-pink-600 bg-pink-50 border-pink-200',
    description: 'Bông hoa thành tích rực rỡ, được thầy cô và bạn bè yêu quý',
  },
  {
    level: 4,
    name: 'Cây Vàng Trĩu Quả',
    minPoints: 80,
    maxPoints: 119,
    icon: '🍎',
    badge: 'Trĩu Quả',
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    description: 'Gặt hái nhiều thành tích tốt, bài tập xuất sắc',
  },
  {
    level: 5,
    name: 'Vườn Ươm Đại Thụ',
    minPoints: 120,
    maxPoints: 9999,
    icon: '🌳',
    badge: 'Đại Thụ Vinh Danh',
    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    description: 'Tấm gương sáng ngời của lớp 4A2, thủ khoa thi đua',
  },
];

export const getStudentStage = (points: number): GrowthStage => {
  const treeInfo = getTreeEvolutionInfo(points);
  return {
    level: treeInfo.step,
    name: treeInfo.currentStage.name,
    minPoints: treeInfo.currentStage.points,
    maxPoints: treeInfo.nextStage.points,
    icon: treeInfo.currentStage.icon,
    badge: treeInfo.currentStage.badge,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    description: treeInfo.currentStage.description,
  };
};

export const getProgressToNextStage = (points: number): { current: number; nextTarget: number; percentage: number } => {
  const treeInfo = getTreeEvolutionInfo(points);
  const percentage = Math.min(100, Math.round((treeInfo.currentCyclePoints / 100) * 100));
  return {
    current: treeInfo.currentCyclePoints,
    nextTarget: 100,
    percentage,
  };
};

export const getAvatarColor = (name: string, gender: string) => {
  if (gender === 'nu') {
    const pinkPalettes = [
      'from-rose-400 to-pink-500',
      'from-fuchsia-400 to-pink-500',
      'from-amber-300 to-rose-400',
      'from-purple-400 to-pink-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return pinkPalettes[hash % pinkPalettes.length];
  } else {
    const bluePalettes = [
      'from-sky-400 to-blue-600',
      'from-emerald-400 to-teal-600',
      'from-indigo-400 to-blue-500',
      'from-cyan-400 to-emerald-500',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
    return bluePalettes[hash % bluePalettes.length];
  }
};

export const getStudentInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[parts.length - 2]?.[0] || '';
  const last = parts[parts.length - 1]?.[0] || '';
  return `${first}${last}`.toUpperCase();
};

export interface GroupTheme {
  name: string;
  colorTheme: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBg: string;
  cardBorder: string;
  activeTabBg: string;
  barColor: string;
  dotColor: string;
  gradient: string;
}

export const GROUP_THEMES: Record<number, GroupTheme> = {
  1: {
    name: 'Tổ 1: Tím hồng mộng mơ',
    colorTheme: 'Tím hồng',
    badgeBg: 'bg-[#F3E8FF]',
    badgeText: 'text-[#7E22CE]',
    badgeBorder: 'border-[#D8B4FE]',
    cardBg: 'bg-[#FAF5FF]',
    cardBorder: 'border-[#E9D5FF]',
    activeTabBg: 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white shadow-md shadow-purple-300/50',
    barColor: 'bg-[#A855F7]',
    dotColor: 'bg-[#A855F7]',
    gradient: 'from-[#A855F7] to-[#EC4899]',
  },
  2: {
    name: 'Tổ 2: Hồng dâu ngọt ngào',
    colorTheme: 'Hồng dâu',
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#DB2777]',
    badgeBorder: 'border-[#F9A8D4]',
    cardBg: 'bg-[#FDF2F8]',
    cardBorder: 'border-[#FBCFE8]',
    activeTabBg: 'bg-gradient-to-r from-[#F472B6] to-[#EC4899] text-white shadow-md shadow-pink-300/50',
    barColor: 'bg-[#EC4899]',
    dotColor: 'bg-[#EC4899]',
    gradient: 'from-[#F472B6] to-[#DB2777]',
  },
  3: {
    name: 'Tổ 3: Vàng kim tỏa sáng',
    colorTheme: 'Vàng kim',
    badgeBg: 'bg-[#FEF3C7]',
    badgeText: 'text-[#854D0E]',
    badgeBorder: 'border-[#FDE047]',
    cardBg: 'bg-[#FFFBEB]',
    cardBorder: 'border-[#FEF08A]',
    activeTabBg: 'bg-gradient-to-r from-[#FACC15] to-[#FB923C] text-[#581C87] font-black shadow-md shadow-amber-300/50',
    barColor: 'bg-[#FACC15]',
    dotColor: 'bg-[#FACC15]',
    gradient: 'from-[#FACC15] to-[#EAB308]',
  },
  4: {
    name: 'Tổ 4: Cam đào năng động',
    colorTheme: 'Cam đào',
    badgeBg: 'bg-[#FED7AA]',
    badgeText: 'text-[#9A3412]',
    badgeBorder: 'border-[#FDBA74]',
    cardBg: 'bg-[#FFF7ED]',
    cardBorder: 'border-[#FFEDD5]',
    activeTabBg: 'bg-gradient-to-r from-[#FB923C] to-[#F43F5E] text-white shadow-md shadow-orange-300/50',
    barColor: 'bg-[#FB923C]',
    dotColor: 'bg-[#FB923C]',
    gradient: 'from-[#FB923C] to-[#EA580C]',
  },
};

export const getGroupTheme = (groupNum: number): GroupTheme => {
  return GROUP_THEMES[groupNum] || GROUP_THEMES[1];
};

export const getGroupName = (groupNum: number, groupNames?: Record<number, string>) => {
  if (groupNames && groupNames[groupNum]) {
    return groupNames[groupNum];
  }
  switch (groupNum) {
    case 1:
      return 'Tổ 1: Tím hồng mộng mơ';
    case 2:
      return 'Tổ 2: Hồng dâu ngọt ngào';
    case 3:
      return 'Tổ 3: Vàng kim tỏa sáng';
    case 4:
      return 'Tổ 4: Cam đào năng động';
    default:
      return `Tổ ${groupNum}`;
  }
};
