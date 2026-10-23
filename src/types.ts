export type Gender = 'nam' | 'nu';

export type StudentRole = 
  | 'Học sinh'
  | 'Lớp trưởng'
  | 'Lớp phó học tập'
  | 'Lớp phó văn thể mỹ'
  | 'Lớp phó lao động'
  | 'Tổ trưởng Tổ 1'
  | 'Tổ trưởng Tổ 2'
  | 'Tổ trưởng Tổ 3'
  | 'Tổ trưởng Tổ 4'
  | 'Tổ phó Tổ 1'
  | 'Tổ phó Tổ 2'
  | 'Tổ phó Tổ 3'
  | 'Tổ phó Tổ 4'
  | 'Bí thư chi đội'
  | 'Ủy viên ban chỉ huy chi đội'
  | 'Quản ca';

export interface BloomedFlower {
  id: string;
  cycle: number; // 1 = 100pts (Sunflower), 2 = 200pts (Tulip), etc.
  flowerType: string;
  name: string;
  icon: string;
  bloomedAt: number;
}

export interface Student {
  id: string;
  stt: number;
  name: string;
  gender: Gender;
  group: 1 | 2 | 3 | 4;
  role: StudentRole;
  flowerPoints: number;
  lifetimePoints?: number; // Tổng điểm thi đua trọn đời (giữ nguyên khi đổi quà)
  avatarSeed: string;
  avatarUrl?: string; // Base64 compressed 300px image or fallback URL
  securityCode: string; // Mã tra cứu bảo mật gồm 5 chữ số ngẫu nhiên không trùng lặp
  personalTarget?: string; // Mục tiêu cá nhân của học sinh
  talents?: string; // Năng khiếu cá nhân
  notes?: string;
  birthday?: string;
  parentPhone?: string;
  badges?: string[];
  shields?: number; // 0 to 2 (Lá chắn bảo vệ)
  consecutiveOnTimeDays?: number;
  bloomedGardens?: BloomedFlower[];
}

export interface ClassConfig {
  className: string;
  teacherName: string;
  teacherRole: string;
  bannerTitle: string;
  bannerSubtitle: string;
  monthlyTheme: string;
  smallMessage: string;
  schoolName: string;
  schoolYear: string;
  bannerBgImage?: string; // Base64 compressed banner image (1200px)
  bannerGradient?: string; // Gradient preset identifier
  teacherAvatarUrl?: string; // Base64 compressed teacher avatar
  classAvatarUrl?: string; // Base64 compressed class avatar
  deductPointsOnRedeem?: boolean; // Cho phép trừ sao khi đổi quà hay giữ nguyên điểm
  studentMonthlyRemarks?: Record<string, Record<string, string>>; // Month key -> Student ID -> Remark text
  sidebarPosition: 'left' | 'right'; // Left or Right sidebar positioning
  groupNames: {
    1: string;
    2: string;
    3: string;
    4: string;
  };
}

export type AttendanceStatus = 'present' | 'late' | 'excused' | 'unexcused';

export interface AttendanceRecord {
  status: AttendanceStatus;
  note?: string;
}

export interface DailyAttendance {
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceRecord>;
}

export interface AttendanceHistoryEntry {
  date: string; // YYYY-MM-DD
  records: Record<string, AttendanceRecord>;
}

export type PointCategory = 
  | 'academic'    // Học tập
  | 'movement'    // Phong trào
  | 'discipline'  // Kỷ luật
  | 'attendance'  // Chuyên cần
  | 'manners'     // Nề nếp
  | 'other'       // Khác
  | 'penalty'     // Vi phạm
  | 'ethics'
  | 'helping'
  | 'hygiene';

export interface PointLog {
  id: string;
  studentId: string;
  studentName: string;
  group: number;
  delta: number;
  reason: string;
  category: PointCategory;
  timestamp: number;
}

export interface RewardItem {
  id: string;
  title: string;
  cost: number;
  icon: string;
  description: string;
  stock: number;
  claimedCount: number;
  category: 'privilege' | 'gift' | 'honor';
  themeColor?: 'purple' | 'blue' | 'teal' | 'orange' | 'amber' | 'emerald' | 'rose';
  illustrationType?: 'seat_change' | 'music_request' | 'homework_pass' | 'secret_gift' | 'custom';
}

export interface RedemptionLog {
  id: string;
  studentId: string;
  studentName: string;
  rewardId: string;
  rewardTitle: string;
  cost: number;
  timestamp: number;
  status: 'delivered' | 'pending';
}

export interface TeacherNote {
  id: string;
  title: string;
  content: string;
  category: 'todo' | 'parent' | 'school' | 'lesson';
  isDone: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: number;
  dueDate?: string;
}

export type AssignmentSubject = 
  | 'Toán'
  | 'Tiếng Việt'
  | 'Tiếng Anh'
  | 'Khoa học'
  | 'Lịch sử & Địa lí'
  | 'Đạo đức'
  | 'Tin học'
  | 'Mĩ thuật'
  | 'Âm nhạc'
  | 'Hoạt động trải nghiệm'
  | 'Khác';

export type AssignmentPriority = 'normal' | 'important' | 'advanced' | 'review';

export type SubmissionStatus = 'not_submitted' | 'submitted' | 'graded' | 'needs_revision';

export interface AssignmentSubmission {
  studentId: string;
  status: SubmissionStatus;
  submittedAt?: number;
  score?: string; // e.g. "10", "9.5", "A+", "Đạt", "Xuất sắc"
  teacherFeedback?: string;
  rewardAwarded?: boolean;
}

export interface Assignment {
  id: string;
  title: string;
  subject: AssignmentSubject;
  description: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  targetType: 'all' | 'group' | 'custom';
  targetGroup?: 1 | 2 | 3 | 4;
  targetStudentIds: string[];
  rewardPoints: number; // e.g. +1, +2, +3, +5
  priority: AssignmentPriority;
  attachmentUrl?: string;
  notes?: string;
  createdAt: number;
  submissions: Record<string, AssignmentSubmission>;
}

export interface ScoringCriterion {
  id: string;
  label: string;
  points: number;
  category: PointCategory;
  categoryTag?: string; // '[Học tập]', '[Phong trào]', '[Kỷ luật]', '[Chuyên cần]', '[Nề nếp]', '[Khác]'
  icon: string;
  isActive?: boolean;
  type?: 'praise' | 'reminder';
  targetType?: 'individual' | 'group' | 'both';
}

export type ActiveTab = 
  | 'dashboard'
  | 'students'
  | 'garden'
  | 'attendance'
  | 'classroom_games'
  | 'timer'
  | 'noise_meter'
  | 'scoring'
  | 'homework'
  | 'rewards'
  | 'groups'
  | 'leaderboard'
  | 'random_picker'
  | 'notes'
  | 'reports'
  | 'settings';

export type SyncMode = 'local_only' | 'cloud_synced' | 'cloud_syncing' | 'offline';
