export interface DreamTreeStage {
  step: number; // 0 to 20
  points: number; // 0, 5, 10, 15, ..., 100
  name: string;
  icon: string;
  badge: string;
  visualType: 
    | 'seed' 
    | 'sprout' 
    | 'sprout_big'
    | 'leaf_single' 
    | 'leaf_multi' 
    | 'sapling' 
    | 'sapling_tall' 
    | 'canopy' 
    | 'ladybug' 
    | 'dew' 
    | 'mature_tree' 
    | 'butterfly' 
    | 'glowing_tree' 
    | 'bud_small' 
    | 'bud_big' 
    | 'bees' 
    | 'bloom_opening' 
    | 'bloom_full' 
    | 'bloom_glowing' 
    | 'rainbow' 
    | 'super_bloom';
  description: string;
  perks: string;
}

export const DREAM_TREE_STAGES: DreamTreeStage[] = [
  { 
    step: 0, 
    points: 0, 
    name: 'Hạt giống', 
    icon: '🫘', 
    badge: 'Hạt Giống Tri Thức', 
    visualType: 'seed', 
    description: 'Hạt mầm đang yên giấc, sẵn sàng vươn mình sau mỗi điểm tốt', 
    perks: 'Khởi đầu hành trình ước mơ (0đ)' 
  },
  { 
    step: 1, 
    points: 5, 
    name: 'Nảy mầm', 
    icon: '🌱', 
    badge: 'Mầm Non Đầu Tiên', 
    visualType: 'sprout', 
    description: 'Chồi non nhú lên khỏi mặt đất, đón ánh sáng ban mai', 
    perks: 'Tích lũy 5 năng lượng đầu tiên' 
  },
  { 
    step: 2, 
    points: 10, 
    name: 'Mầm lớn', 
    icon: '🌱', 
    badge: 'Mầm Xanh Vững Vàng', 
    visualType: 'sprout_big', 
    description: 'Thân mầm cứng cáp hơn, rễ bám chắc vào lòng đất', 
    perks: 'Hấp thụ năng lượng chuyên cần' 
  },
  { 
    step: 3, 
    points: 15, 
    name: 'Lá đầu tiên', 
    icon: '🍃', 
    badge: 'Lá Non Xanh Mướt', 
    visualType: 'leaf_single', 
    description: 'Chiếc lá xanh đầu tiên xòe rộng đón nắng gió', 
    perks: 'Mở khóa hiệu ứng ánh sáng nhẹ' 
  },
  { 
    step: 4, 
    points: 20, 
    name: 'Thêm lá', 
    icon: '🍃', 
    badge: 'Vươn Cành Đón Nắng', 
    visualType: 'leaf_multi', 
    description: 'Nhiều cành lá đâm chồi, tỏa bóng xanh mát', 
    perks: 'Tăng tốc hấp thụ năng lượng' 
  },
  { 
    step: 5, 
    points: 25, 
    name: 'Cây non', 
    icon: '🌿', 
    badge: 'Cây Non Chăm Ngoan', 
    visualType: 'sapling', 
    description: 'Thân cây non nớt nhưng thẳng tắp đầy kiên cường', 
    perks: 'Khung viền sinh thái xanh tươi' 
  },
  { 
    step: 6, 
    points: 30, 
    name: 'Cây cao hơn', 
    icon: '🌿', 
    badge: 'Vươn Mình Tỏa Sáng', 
    visualType: 'sapling_tall', 
    description: 'Cây lớn nhanh nhờ sự chuyên cần và hăng say mỗi ngày', 
    perks: 'Tích lũy năng lượng ổn định' 
  },
  { 
    step: 7, 
    points: 35, 
    name: 'Tán cây xuất hiện', 
    icon: '🍀', 
    badge: 'Tán Lá Xanh Tươi', 
    visualType: 'canopy', 
    description: 'Vòm tán xum xuê bắt đầu định hình rõ nét', 
    perks: 'Tán lá râm mát bạn bè' 
  },
  { 
    step: 8, 
    points: 40, 
    name: 'Có bọ rùa', 
    icon: '🐞', 
    badge: 'Bạn Bọ Rùa May Mắn', 
    visualType: 'ladybug', 
    description: 'Chú bọ rùa đỏ dễ thương bay đến làm bạn cùng cây', 
    perks: 'Sinh vật đồng hành xuất hiện' 
  },
  { 
    step: 9, 
    points: 45, 
    name: 'Có giọt sương', 
    icon: '💧', 
    badge: 'Giọt Sương Ban Mai', 
    visualType: 'dew', 
    description: 'Những giọt sương mai lấp lánh long lanh trên kẽ lá', 
    perks: 'Hiệu ứng giọt sương mát lành' 
  },
  { 
    step: 10, 
    points: 50, 
    name: 'Cây trưởng thành', 
    icon: '🌳', 
    badge: 'Cây Lớn Kiên Cố', 
    visualType: 'mature_tree', 
    description: 'Cây đã đạt độ cao vững chắc, thân gỗ kiên cố', 
    perks: 'Hoàn thành 50% chặng đường nở hoa' 
  },
  { 
    step: 11, 
    points: 55, 
    name: 'Bướm xuất hiện', 
    icon: '🦋', 
    badge: 'Cánh Bướm Rực Rỡ', 
    visualType: 'butterfly', 
    description: 'Cánh bướm ngũ sắc bay lượn dập dờn quanh vòm lá', 
    perks: 'Hiệu ứng bướm bay sinh động' 
  },
  { 
    step: 12, 
    points: 60, 
    name: 'Cây phát sáng', 
    icon: '✨', 
    badge: 'Hào Quang Kỳ Diệu', 
    visualType: 'glowing_tree', 
    description: 'Toàn thân cây tỏa ánh hào quang vàng ấm áp lung linh', 
    perks: 'Hào quang năng lượng tỏa sáng' 
  },
  { 
    step: 13, 
    points: 65, 
    name: 'Xuất hiện nụ', 
    icon: '🌷', 
    badge: 'Nụ Hoa E Ấp', 
    visualType: 'bud_small', 
    description: 'Một búp nụ chúm chím hé lộ trên đỉnh cành cây', 
    perks: 'Bắt đầu giai đoạn ươm hoa' 
  },
  { 
    step: 14, 
    points: 70, 
    name: 'Nụ lớn', 
    icon: '🌷', 
    badge: 'Nụ Hoa Căng Tràn', 
    visualType: 'bud_big', 
    description: 'Búp hoa căng tròn, chuẩn bị hé nở những cánh đầu tiên', 
    perks: 'Hương thơm lan tỏa lớp học' 
  },
  { 
    step: 15, 
    points: 75, 
    name: 'Ong bay quanh', 
    icon: '🐝', 
    badge: 'Ong Chăm Chỉ Ghé Thăm', 
    visualType: 'bees', 
    description: 'Chú ong vàng cần mẫn bay quanh tìm mật và thụ phấn', 
    perks: 'Sinh vật đồng hành tìm mật' 
  },
  { 
    step: 16, 
    points: 80, 
    name: 'Hoa hé nở', 
    icon: '🌸', 
    badge: 'Hoa Hé Nụ Cười', 
    visualType: 'bloom_opening', 
    description: 'Cánh hoa đầu tiên bắt đầu xòe mở rạng rỡ đón nắng', 
    perks: 'Mở khóa âm thanh hoa hé nở' 
  },
  { 
    step: 17, 
    points: 85, 
    name: 'Hoa nở', 
    icon: '🌸', 
    badge: 'Đóa Hoa Rực Rỡ', 
    visualType: 'bloom_full', 
    description: 'Bông hoa ngát hương, rực rỡ sắc màu thành tích', 
    perks: 'Mở khóa sắc hoa cá nhân' 
  },
  { 
    step: 18, 
    points: 90, 
    name: 'Hoa phát sáng', 
    icon: '✨', 
    badge: 'Tinh Hoa Tỏa Sáng', 
    visualType: 'bloom_glowing', 
    description: 'Đóa hoa tỏa luồng năng lượng lấp lánh khắp khu vườn', 
    perks: 'Hào quang lung linh' 
  },
  { 
    step: 19, 
    points: 95, 
    name: 'Cầu vồng xuất hiện', 
    icon: '🌈', 
    badge: 'Cầu Vồng Hy Vọng', 
    visualType: 'rainbow', 
    description: 'Dải cầu vồng 7 màu rực rỡ bắc ngang qua vòm cây', 
    perks: 'Hiệu ứng cầu vồng diệu kỳ' 
  },
  { 
    step: 20, 
    points: 100, 
    name: 'SIÊU HOA NỞ – NHẬN HUY HIỆU', 
    icon: '🌺', 
    badge: 'Hoa Ước Mơ Hoàn Mỹ', 
    visualType: 'super_bloom', 
    description: 'SIÊU HOA NỞ RỰC RỠ! Hoàn thành 100 điểm, lưu vào VƯỜN THÀNH TÍCH CỦA EM!', 
    perks: 'Lưu vào Vườn Thành Tích & Bắt đầu Cây Mới' 
  },
];

export interface GardenFlowerModel {
  cycle: number; // 1 = 100pts, 2 = 200pts, ...
  targetPoints: number;
  name: string;
  shortName: string;
  icon: string;
  badgeTitle: string;
  themeColor: string;
  bgGradient: string;
  description: string;
  meaning: string;
}

export const GARDEN_COLLECTION_FLOWERS: GardenFlowerModel[] = [
  { 
    cycle: 1, 
    targetPoints: 100, 
    name: 'Hoa Hướng Dương', 
    shortName: 'Hướng dương',
    icon: '🌻', 
    badgeTitle: 'Hướng Dương Tỏa Nắng', 
    themeColor: 'text-amber-500', 
    bgGradient: 'from-amber-400 to-yellow-500', 
    description: '100 điểm ➔ 🌻 Hướng dương rực rỡ', 
    meaning: 'Nhiệt huyết, tự tin, luôn hướng về chân trời tri thức' 
  },
  { 
    cycle: 2, 
    targetPoints: 200, 
    name: 'Hoa Tulip', 
    shortName: 'Tulip',
    icon: '🌷', 
    badgeTitle: 'Tulip Kiêu Hãnh', 
    themeColor: 'text-rose-500', 
    bgGradient: 'from-rose-400 to-pink-500', 
    description: '200 điểm ➔ 🌷 Tulip kiêu hãnh', 
    meaning: 'Hòa đồng, lễ phép, biết quan tâm và chia sẻ cùng bạn bè' 
  },
  { 
    cycle: 3, 
    targetPoints: 300, 
    name: 'Hoa Anh Đào', 
    shortName: 'Anh đào',
    icon: '🌸', 
    badgeTitle: 'Anh Đào Tinh Khôi', 
    themeColor: 'text-pink-500', 
    bgGradient: 'from-pink-300 to-rose-400', 
    description: '300 điểm ➔ 🌸 Anh đào tinh khôi', 
    meaning: 'Chăm chỉ, bền bỉ, vượt qua mọi bài toán khó' 
  },
  { 
    cycle: 4, 
    targetPoints: 400, 
    name: 'Hoa Hồng', 
    shortName: 'Hoa hồng',
    icon: '🌹', 
    badgeTitle: 'Hoa Hồng Bản Lĩnh', 
    themeColor: 'text-red-600', 
    bgGradient: 'from-red-500 to-rose-700', 
    description: '400 điểm ➔ 🌹 Hoa hồng rực cháy', 
    meaning: 'Bản lĩnh vững vàng, luôn đạt điểm 9-10 xuất sắc' 
  },
  { 
    cycle: 5, 
    targetPoints: 500, 
    name: 'Hoa Sen', 
    shortName: 'Hoa sen',
    icon: '🪷', 
    badgeTitle: 'Sen Hồng Thanh Khiết', 
    themeColor: 'text-emerald-500', 
    bgGradient: 'from-emerald-400 to-teal-500', 
    description: '500 điểm ➔ 🪷 Hoa sen thanh khiết', 
    meaning: 'Tâm hồn trong sáng, nề nếp kỷ luật mẫu mực' 
  },
  { 
    cycle: 6, 
    targetPoints: 600, 
    name: 'Hoa Kỳ Diệu', 
    shortName: 'Hoa kỳ diệu',
    icon: '🌺', 
    badgeTitle: 'Hoa Kỳ Diệu Đột Phá', 
    themeColor: 'text-fuchsia-500', 
    bgGradient: 'from-fuchsia-400 to-purple-600', 
    description: '600 điểm ➔ 🌺 Hoa kỳ diệu', 
    meaning: 'Sáng tạo vượt bậc, tài năng nghệ thuật và tư duy nhạy bén' 
  },
  { 
    cycle: 7, 
    targetPoints: 700, 
    name: 'Hoa Cầu Vồng', 
    shortName: 'Hoa cầu vồng',
    icon: '🌈', 
    badgeTitle: 'Cầu Vồng Toàn Diện', 
    themeColor: 'text-sky-500', 
    bgGradient: 'from-sky-400 via-pink-400 to-amber-400', 
    description: '700 điểm ➔ 🌈 Hoa cầu vồng', 
    meaning: 'Toàn diện: Giỏi văn hóa, khỏe thể thao, hăng say phong trào' 
  },
  { 
    cycle: 8, 
    targetPoints: 800, 
    name: 'Hoa Pha Lê', 
    shortName: 'Hoa pha lê',
    icon: '💎', 
    badgeTitle: 'Pha Lê Trí Tuệ', 
    themeColor: 'text-cyan-400', 
    bgGradient: 'from-cyan-400 to-blue-600', 
    description: '800 điểm ➔ 💎 Hoa pha lê', 
    meaning: 'Trí tuệ kim cương, sự kiên định và phong độ đỉnh cao' 
  },
  { 
    cycle: 9, 
    targetPoints: 900, 
    name: 'Hoa Hoàng Gia', 
    shortName: 'Hoa hoàng gia',
    icon: '👑', 
    badgeTitle: 'Vương Miện Hoàng Gia', 
    themeColor: 'text-amber-400', 
    bgGradient: 'from-amber-300 via-yellow-400 to-amber-600', 
    description: '900 điểm ➔ 👑 Hoa hoàng gia', 
    meaning: 'Thủ lĩnh gương mẫu, truyền cảm hứng cho toàn thể lớp' 
  },
  { 
    cycle: 10, 
    targetPoints: 1000, 
    name: 'Cây Huyền Thoại', 
    shortName: 'Cây Huyền Thoại',
    icon: '🌟', 
    badgeTitle: 'Cổ Thụ Huyền Thoại', 
    themeColor: 'text-yellow-400', 
    bgGradient: 'from-yellow-300 via-amber-400 to-orange-500', 
    description: '1000 điểm ➔ 🌟 Cây Huyền Thoại', 
    meaning: 'Huyền thoại học đường xuất sắc nhất Vườn Ươm Tri Thức' 
  },
];

export interface DreamTreeCoreStage {
  minPoints: number;
  maxPoints: number;
  name: string;
  icon: string;
  nextThreshold: number;
  nextStageName: string;
  encouragementSuffix: string;
}

export const DREAM_TREE_CORE_STAGES: DreamTreeCoreStage[] = [
  { minPoints: 0, maxPoints: 19, name: 'Hạt giống', icon: '🫘', nextThreshold: 20, nextStageName: 'Nảy mầm', encouragementSuffix: 'để nảy mầm!' },
  { minPoints: 20, maxPoints: 39, name: 'Nảy mầm', icon: '🌱', nextThreshold: 40, nextStageName: 'Cây non', encouragementSuffix: 'để thành cây non!' },
  { minPoints: 40, maxPoints: 59, name: 'Cây non', icon: '🌿', nextThreshold: 60, nextStageName: 'Cây trưởng thành', encouragementSuffix: 'để cây trưởng thành!' },
  { minPoints: 60, maxPoints: 79, name: 'Cây trưởng thành', icon: '🌳', nextThreshold: 80, nextStageName: 'Có nụ hoa', encouragementSuffix: 'để có nụ hoa!' },
  { minPoints: 80, maxPoints: 99, name: 'Có nụ hoa', icon: '🌷', nextThreshold: 100, nextStageName: 'Hoa nở', encouragementSuffix: 'để hoa nở rực rỡ!' },
  { minPoints: 100, maxPoints: 100, name: 'Hoa nở', icon: '🌸', nextThreshold: 100, nextStageName: 'Hoa nở hoàn mỹ', encouragementSuffix: 'đã nở hoa hoàn mỹ!' },
];

export interface MilestoneReward {
  points: number;
  icon: string;
  title: string;
  description: string;
  perkBadge: string;
}

export const MILESTONE_REWARDS: MilestoneReward[] = [
  { points: 20, icon: '🎵', title: 'Quyền chọn bài hát', description: 'Quyền chọn một bài hát giờ ra chơi', perkBadge: 'Chọn nhạc giờ ra chơi' },
  { points: 40, icon: '💺', title: 'Quyền chọn chỗ ngồi', description: 'Quyền chọn chỗ ngồi yêu thích trong 1 ngày', perkBadge: 'Chọn chỗ 1 ngày' },
  { points: 60, icon: '⭐', title: 'Huy hiệu Học sinh tích cực', description: 'Huy hiệu Học sinh tích cực vinh danh', perkBadge: 'Huy hiệu Tích cực' },
  { points: 80, icon: '🎁', title: 'Quyền lợi trong lớp', description: 'Một quyền lợi nhỏ đặc biệt trong lớp', perkBadge: 'Quyền lợi nhỏ' },
  { points: 100, icon: '🌸', title: 'Hoa nở & Quà bí mật', description: 'Hoa nở + Quà bí mật từ giáo viên', perkBadge: 'Quà bí mật từ GV' },
];

export interface TreeEvolutionInfo {
  totalPoints: number;
  cycle: number; // completed 100-pt cycles (e.g. 0, 1, 2...)
  currentCyclePoints: number; // points in current 100-pt tree (0 to 100)
  percent: number; // 0 to 100 %
  step: number; // 0 to 20 micro-steps
  currentStage: DreamTreeStage;
  nextStage: DreamTreeStage;
  coreStage: DreamTreeCoreStage;
  coreStageName: string;
  coreStageIcon: string;
  nextCoreStageName: string;
  pointsToNextCore: number;
  progressMessage: string;
  energyInCurrentStep: number; // 0, 1, 2, 3, 4 (out of 5)
  energyNeededForNextStep: number; // 5 - energyInCurrentStep (or 0 if at 100)
  isMaxBloom: boolean; // reached 100 in current cycle
  bloomedFlowersCount: number;
  currentFlowerModel: GardenFlowerModel;
}

export function getTreeEvolutionInfo(points: number): TreeEvolutionInfo {
  const safePoints = Math.max(0, points);
  const cycle = Math.floor(safePoints / 100);
  const currentCyclePoints = safePoints % 100;
  const percent = currentCyclePoints;

  // Step is 0..20 based on current cycle points (5 pts per step)
  const step = Math.min(20, Math.floor(currentCyclePoints / 5));
  const currentStage = DREAM_TREE_STAGES[step] || DREAM_TREE_STAGES[0];
  const nextStage = DREAM_TREE_STAGES[Math.min(20, step + 1)] || DREAM_TREE_STAGES[20];

  // Core Stage calculation (0-19: 🫘 Hạt giống, 20-39: 🌱 Nảy mầm, 40-59: 🌿 Cây non, 60-79: 🌳 Cây trưởng thành, 80-99: 🌷 Có nụ hoa, 100: 🌸 Hoa nở)
  let coreStage = DREAM_TREE_CORE_STAGES[0];
  if (currentCyclePoints >= 80) coreStage = DREAM_TREE_CORE_STAGES[4];
  else if (currentCyclePoints >= 60) coreStage = DREAM_TREE_CORE_STAGES[3];
  else if (currentCyclePoints >= 40) coreStage = DREAM_TREE_CORE_STAGES[2];
  else if (currentCyclePoints >= 20) coreStage = DREAM_TREE_CORE_STAGES[1];
  else coreStage = DREAM_TREE_CORE_STAGES[0];

  const pointsToNextCore = Math.max(0, coreStage.nextThreshold - currentCyclePoints);
  const progressMessage = pointsToNextCore > 0
    ? `Còn ${pointsToNextCore} điểm ${coreStage.encouragementSuffix}`
    : '🎉 Hoa đã nở rực rỡ!';

  const energyInCurrentStep = currentCyclePoints % 5;
  const energyNeededForNextStep = 5 - energyInCurrentStep;
  const isMaxBloom = currentCyclePoints === 0 && safePoints > 0;

  const flowerModelIndex = Math.min(GARDEN_COLLECTION_FLOWERS.length - 1, cycle);
  const currentFlowerModel = GARDEN_COLLECTION_FLOWERS[flowerModelIndex] || GARDEN_COLLECTION_FLOWERS[0];

  return {
    totalPoints: safePoints,
    cycle,
    currentCyclePoints,
    percent,
    step,
    currentStage,
    nextStage,
    coreStage,
    coreStageName: coreStage.name,
    coreStageIcon: coreStage.icon,
    nextCoreStageName: coreStage.nextStageName,
    pointsToNextCore,
    progressMessage,
    energyInCurrentStep,
    energyNeededForNextStep,
    isMaxBloom,
    bloomedFlowersCount: cycle,
    currentFlowerModel,
  };
}

export function getFlowerForCycle(cycleIndex: number): GardenFlowerModel {
  const idx = Math.min(GARDEN_COLLECTION_FLOWERS.length - 1, Math.max(0, cycleIndex - 1));
  return GARDEN_COLLECTION_FLOWERS[idx];
}
