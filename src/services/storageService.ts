/**
 * Offline-First Local Storage Service
 * - 100% Client-Side Persistence with zero external cloud dependencies.
 * - Stores all classroom data securely in browser LocalStorage.
 * - Supports automatic instant saves, JSON Backup Export & Import, and Data Reset.
 */

import { 
  ClassConfig, 
  Student, 
  DailyAttendance, 
  PointLog, 
  RewardItem, 
  RedemptionLog, 
  TeacherNote, 
  ScoringCriterion,
  Assignment
} from '../types';
import { 
  emptyClassConfig, 
  initialClassConfig,
  initialCriteria, 
  initialRewards, 
  getTodayDateString 
} from '../data/initialData';

export const LOCAL_STORAGE_MAIN_KEY = 'chuyen_tau_data';
const LEGACY_STORAGE_KEYS = [
  'vuon_uom_tri_thuc_data',
  'lop4a2_data',
  'chuyen_tau_data_backup',
];

export interface AppDataBundle {
  config: ClassConfig;
  students: Student[];
  attendance: DailyAttendance;
  attendanceHistory?: DailyAttendance[];
  pointLogs: PointLog[];
  rewards: RewardItem[];
  redemptions: RedemptionLog[];
  teacherNotes: TeacherNote[];
  criteria: ScoringCriterion[];
  assignments?: Assignment[];
  lastUpdated: number;
  version: string;
}

/**
 * Validates and sanitizes student fields for safe local storage
 */
export function sanitizeStudent(student: Student): Student {
  return {
    id: String(student.id || `hs-${Date.now()}`),
    stt: Number(student.stt) || 1,
    name: String(student.name || '').trim(),
    gender: student.gender === 'nu' ? 'nu' : 'nam',
    group: ([1, 2, 3, 4].includes(Number(student.group)) ? Number(student.group) : 1) as 1 | 2 | 3 | 4,
    role: student.role || 'Học sinh',
    flowerPoints: Math.max(0, Number(student.flowerPoints) || 0),
    lifetimePoints: Math.max(0, Number(student.lifetimePoints ?? student.flowerPoints) || 0),
    avatarSeed: String(student.avatarSeed || student.name || ''),
    avatarUrl: student.avatarUrl || undefined,
    securityCode: String(student.securityCode || '00000'),
    birthday: student.birthday ? String(student.birthday) : '',
    parentPhone: student.parentPhone ? String(student.parentPhone) : '',
    personalTarget: student.personalTarget ? String(student.personalTarget) : '',
    talents: student.talents ? String(student.talents) : '',
    notes: student.notes ? String(student.notes) : '',
    badges: Array.isArray(student.badges) ? student.badges : ['🌱 Thành viên mới'],
    shields: Math.min(2, Math.max(0, Number(student.shields) || 0)),
    consecutiveOnTimeDays: Math.max(0, Number(student.consecutiveOnTimeDays) || 0),
    bloomedGardens: Array.isArray(student.bloomedGardens) ? student.bloomedGardens : [],
  };
}

class LocalStorageService {
  private listeners: ((bundle: AppDataBundle) => void)[] = [];

  /**
   * Loads all application data from LocalStorage
   */
  public loadAppData(): AppDataBundle {
    const defaultAttendance: DailyAttendance = { date: getTodayDateString(), records: {} };
    
    // 1. Try reading from main key
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(LOCAL_STORAGE_MAIN_KEY);
      
      // If not found, try reading legacy keys or user keys
      if (!raw) {
        for (const legacyKey of LEGACY_STORAGE_KEYS) {
          const found = localStorage.getItem(legacyKey);
          if (found) {
            raw = found;
            break;
          }
        }
      }

      // Check if any keys with prefix exist
      if (!raw) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('chuyen_tau_data_') || key.startsWith('vuon_uom_'))) {
            const val = localStorage.getItem(key);
            if (val && val.includes('students')) {
              raw = val;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Error reading from localStorage:', err);
    }

    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const bundle: AppDataBundle = {
          config: parsed.config ? { ...emptyClassConfig, ...parsed.config } : initialClassConfig,
          students: Array.isArray(parsed.students) ? parsed.students.map(sanitizeStudent) : [],
          attendance: parsed.attendance || defaultAttendance,
          attendanceHistory: Array.isArray(parsed.attendanceHistory) ? parsed.attendanceHistory : [],
          pointLogs: Array.isArray(parsed.pointLogs) ? parsed.pointLogs : [],
          rewards: Array.isArray(parsed.rewards) && parsed.rewards.length > 0 ? parsed.rewards : initialRewards,
          redemptions: Array.isArray(parsed.redemptions) ? parsed.redemptions : [],
          teacherNotes: Array.isArray(parsed.teacherNotes) ? parsed.teacherNotes : [],
          criteria: Array.isArray(parsed.criteria) && parsed.criteria.length > 0 ? parsed.criteria : initialCriteria,
          assignments: Array.isArray(parsed.assignments) ? parsed.assignments : [],
          lastUpdated: parsed.lastUpdated || Date.now(),
          version: '3.0.0-offline',
        };
        return bundle;
      } catch (e) {
        console.error('Failed to parse cached data:', e);
      }
    }

    // Default Fresh Data
    return {
      config: initialClassConfig,
      students: [],
      attendance: defaultAttendance,
      attendanceHistory: [],
      pointLogs: [],
      rewards: initialRewards,
      redemptions: [],
      teacherNotes: [],
      criteria: initialCriteria,
      assignments: [],
      lastUpdated: Date.now(),
      version: '3.0.0-offline',
    };
  }

  /**
   * Saves partial or full app bundle to LocalStorage
   */
  public saveAppData(partial: Partial<AppDataBundle>): AppDataBundle {
    const current = this.loadAppData();
    const updated: AppDataBundle = {
      ...current,
      ...partial,
      students: partial.students !== undefined ? partial.students.map(sanitizeStudent) : current.students,
      lastUpdated: Date.now(),
      version: '3.0.0-offline',
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_MAIN_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }

    this.notifyListeners(updated);
    return updated;
  }

  /**
   * Save student list
   */
  public saveStudents(students: Student[]): void {
    this.saveAppData({ students });
  }

  /**
   * Save or update a single student
   */
  public saveStudent(student: Student): void {
    const current = this.loadAppData();
    const sanitized = sanitizeStudent(student);
    const existingIndex = current.students.findIndex(s => s.id === sanitized.id);
    let nextStudents: Student[];
    if (existingIndex >= 0) {
      nextStudents = current.students.map(s => s.id === sanitized.id ? sanitized : s);
    } else {
      nextStudents = [...current.students, sanitized];
    }
    this.saveAppData({ students: nextStudents });
  }

  /**
   * Delete a student by ID
   */
  public deleteStudent(studentId: string): void {
    const current = this.loadAppData();
    const nextStudents = current.students.filter(s => s.id !== studentId);
    const nextAttendance = {
      ...current.attendance,
      records: { ...current.attendance.records }
    };
    delete nextAttendance.records[studentId];

    const nextHistory = (current.attendanceHistory || []).map(day => {
      if (!day.records || !day.records[studentId]) return day;
      const records = { ...day.records };
      delete records[studentId];
      return { ...day, records };
    });

    const nextLogs = current.pointLogs.filter(l => l.studentId !== studentId);
    const nextRedemptions = current.redemptions.filter(r => r.studentId !== studentId);

    this.saveAppData({
      students: nextStudents,
      attendance: nextAttendance,
      attendanceHistory: nextHistory,
      pointLogs: nextLogs,
      redemptions: nextRedemptions,
    });
  }

  /**
   * Save class configuration
   */
  public saveConfig(config: ClassConfig): void {
    this.saveAppData({ config });
  }

  /**
   * Save attendance
   */
  public saveAttendance(attendance: DailyAttendance, history?: DailyAttendance[]): void {
    this.saveAppData({ 
      attendance, 
      ...(history ? { attendanceHistory: history } : {}) 
    });
  }

  /**
   * Save criteria
   */
  public saveCriteria(criteria: ScoringCriterion[]): void {
    this.saveAppData({ criteria });
  }

  /**
   * Save rewards
   */
  public saveRewards(rewards: RewardItem[]): void {
    this.saveAppData({ rewards });
  }

  /**
   * Reset everything to factory defaults
   */
  public resetAllData(): AppDataBundle {
    const defaultAttendance: DailyAttendance = { date: getTodayDateString(), records: {} };
    const freshBundle: AppDataBundle = {
      config: emptyClassConfig,
      students: [],
      attendance: defaultAttendance,
      attendanceHistory: [],
      pointLogs: [],
      rewards: initialRewards,
      redemptions: [],
      teacherNotes: [],
      criteria: initialCriteria,
      assignments: [],
      lastUpdated: Date.now(),
      version: '3.0.0-offline',
    };

    try {
      localStorage.setItem(LOCAL_STORAGE_MAIN_KEY, JSON.stringify(freshBundle));
      localStorage.removeItem('vuon_uom_onboarded');
      localStorage.removeItem('lop4a2_teacher_avatar');
    } catch (e) {
      console.warn('Reset local storage error:', e);
    }

    this.notifyListeners(freshBundle);
    return freshBundle;
  }

  /**
   * Subscribe to local storage changes
   */
  public subscribe(listener: (bundle: AppDataBundle) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(bundle: AppDataBundle) {
    this.listeners.forEach(fn => fn(bundle));
  }
}

export const storageService = new LocalStorageService();
export const StorageService = storageService;
export const dualStorage = storageService; // Backwards compatibility alias
