/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ClassConfig, 
  Student, 
  DailyAttendance, 
  PointLog, 
  RewardItem, 
  RedemptionLog, 
  TeacherNote, 
  ScoringCriterion,
  PointCategory,
  ActiveTab,
  Assignment
} from './types';
import { 
  emptyClassConfig, 
  initialCriteria, 
  initialRewards, 
  getTodayDateString 
} from './data/initialData';
import { sound } from './utils/soundEffects';
import { storageService, AppDataBundle } from './services/storageService';
import { ClassHeader } from './components/ClassHeader';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { StudentManagerView } from './components/StudentManagerView';
import { FlowerGardenView } from './components/FlowerGardenView';
import { AttendanceView } from './components/AttendanceView';
import { RewardShopView } from './components/RewardShopView';
import { ClassroomGamesView } from './components/ClassroomGamesView';
import { ClassroomTimerView } from './components/ClassroomTimerView';
import { NoiseMeterView } from './components/NoiseMeterView';
import { TeacherNotesView } from './components/TeacherNotesView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { SettingsModal } from './components/SettingsModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PointAnimationOverlay, PointEventData } from './components/PointAnimationOverlay';
import { getTreeEvolutionInfo, GARDEN_COLLECTION_FLOWERS } from './data/dreamTreeData';

export default function App() {
  // Load initial state directly from LocalStorage (Instant Offline-First startup)
  const [initialData] = useState<AppDataBundle>(() => storageService.loadAppData());

  const [config, setConfig] = useState<ClassConfig>(initialData.config);
  const [students, setStudents] = useState<Student[]>(initialData.students);
  const [attendance, setAttendance] = useState<DailyAttendance>(initialData.attendance);
  const [attendanceHistory, setAttendanceHistory] = useState<DailyAttendance[]>(initialData.attendanceHistory || []);
  const [pointLogs, setPointLogs] = useState<PointLog[]>(initialData.pointLogs);
  const [rewards, setRewards] = useState<RewardItem[]>(initialData.rewards);
  const [redemptions, setRedemptions] = useState<RedemptionLog[]>(initialData.redemptions);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>(initialData.teacherNotes);
  const [criteria, setCriteria] = useState<ScoringCriterion[]>(initialData.criteria);
  const [assignments, setAssignments] = useState<Assignment[]>(initialData.assignments || []);

  // UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentPointEvent, setCurrentPointEvent] = useState<PointEventData | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const toastTimerRef = useRef<any>(null);

  // Check onboarding on initial mount
  useEffect(() => {
    try {
      const onboarded = localStorage.getItem('vuon_uom_onboarded');
      if (onboarded !== 'true' && (!config.teacherName?.trim() || !config.className?.trim())) {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, [config.teacherName, config.className]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    setToastType(type);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleCompleteOnboarding = (updatedConfig: ClassConfig) => {
    try {
      localStorage.setItem('vuon_uom_onboarded', 'true');
    } catch (e) {
      console.warn(e);
    }
    setConfig(updatedConfig);
    storageService.saveConfig(updatedConfig);
    setShowOnboarding(false);
    showToast('Đã lưu thông tin lớp học');
  };

  // Fullscreen listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
  };

  // ===================== CORE POINT & GAMIFICATION =====================
  const handleAwardPoints = (
    studentIds: string[],
    delta: number,
    reason: string,
    category: PointCategory
  ) => {
    const now = Date.now();
    const newLogs: PointLog[] = [];
    let animationTriggered = false;

    const updatedStudents = students.map((s) => {
      if (studentIds.includes(s.id)) {
        // 1. Check Shield Protection when delta < 0
        if (delta < 0 && s.shields && s.shields > 0) {
          const updatedShields = s.shields - 1;
          newLogs.push({
            id: `log-${Date.now()}-${s.id}`,
            studentId: s.id,
            studentName: s.name,
            group: s.group,
            delta: 0,
            reason: `🛡️ Khiên bảo vệ đã đỡ: ${reason}`,
            category,
            timestamp: now,
          });

          if (!animationTriggered) {
            setCurrentPointEvent({
              studentName: studentIds.length === 1 ? s.name : `${studentIds.length} bạn (Có khiên đỡ)`,
              delta: 0,
              reason: `Đã kích hoạt Khiên bảo vệ: ${reason}`,
              wasShielded: true,
            });
            animationTriggered = true;
          }

          return { ...s, shields: updatedShields };
        }

        // 2. Normal Point Deduction (No Shield)
        if (delta < 0) {
          const updatedPoints = Math.max(0, s.flowerPoints + delta);
          newLogs.push({
            id: `log-${Date.now()}-${s.id}`,
            studentId: s.id,
            studentName: s.name,
            group: s.group,
            delta,
            reason,
            category,
            timestamp: now,
          });

          if (!animationTriggered) {
            setCurrentPointEvent({
              studentName: studentIds.length === 1 ? s.name : `${studentIds.length} bạn`,
              delta,
              reason,
            });
            animationTriggered = true;
          }

          return { ...s, flowerPoints: updatedPoints };
        }

        // 3. Point Addition (+) & Garden Bloom Logic (100 pts per bloom)
        const oldPoints = s.flowerPoints;
        const newPoints = oldPoints + delta;
        const oldLifetime = s.lifetimePoints ?? oldPoints;
        const newLifetime = delta > 0 ? oldLifetime + delta : oldLifetime;
        
        const oldEvolution = getTreeEvolutionInfo(oldPoints);
        const newEvolution = getTreeEvolutionInfo(newPoints);
        
        const isEvolutionLevelUp = newEvolution.step > oldEvolution.step;
        const oldBlooms = Math.floor(oldPoints / 100);
        const newBlooms = Math.floor(newPoints / 100);
        const addedBloomsCount = newBlooms - oldBlooms;

        let updatedGardens = [...(s.bloomedGardens || [])];
        let newlyUnlockedFlower: any = null;

        if (addedBloomsCount > 0) {
          for (let i = 0; i < addedBloomsCount; i++) {
            const flowerIndex = (updatedGardens.length + i) % GARDEN_COLLECTION_FLOWERS.length;
            const chosenFlower = GARDEN_COLLECTION_FLOWERS[flowerIndex];
            newlyUnlockedFlower = chosenFlower;
            updatedGardens.push({
              id: `bloom-${Date.now()}-${i}`,
              flowerType: chosenFlower.name,
              color: chosenFlower.themeColor || 'text-amber-500',
              icon: chosenFlower.icon,
              timestamp: now,
              gardenNumber: updatedGardens.length + 1,
            });
          }
        }

        newLogs.push({
          id: `log-${Date.now()}-${s.id}`,
          studentId: s.id,
          studentName: s.name,
          group: s.group,
          delta,
          reason,
          category,
          timestamp: now,
        });

        // Trigger visual overlay
        if (!animationTriggered) {
          setCurrentPointEvent({
            studentName: studentIds.length === 1 ? s.name : `${studentIds.length} bạn`,
            delta,
            reason,
            isEvolutionLevelUp,
            newLevelName: newEvolution.currentStage.name,
            isSuperBloom: addedBloomsCount > 0,
            flowerName: newlyUnlockedFlower ? newlyUnlockedFlower.name : undefined,
            flowerIcon: newlyUnlockedFlower ? newlyUnlockedFlower.icon : undefined,
          });
          animationTriggered = true;
        }

        return {
          ...s,
          flowerPoints: newPoints,
          lifetimePoints: newLifetime,
          bloomedGardens: updatedGardens,
        };
      }
      return s;
    });

    const updatedPointLogs = [...newLogs, ...pointLogs];
    setStudents(updatedStudents);
    setPointLogs(updatedPointLogs);

    // Save to LocalStorage
    storageService.saveAppData({
      students: updatedStudents,
      pointLogs: updatedPointLogs,
    });
  };

  const handleDeletePointLog = (logId: string) => {
    const updated = pointLogs.filter(l => l.id !== logId);
    setPointLogs(updated);
    storageService.saveAppData({ pointLogs: updated });
    showToast('Đã xóa lịch sử điểm');
  };

  const handleUpdateCriteria = (updatedCriteria: ScoringCriterion[]) => {
    setCriteria(updatedCriteria);
    storageService.saveCriteria(updatedCriteria);
    showToast('Đã cập nhật tiêu chí thi đua');
  };

  // Shield Granting (Max 2 shields per student)
  const handleGrantShield = (studentId: string) => {
    const target = students.find((s) => s.id === studentId);
    if (!target) return;
    const updatedStudent: Student = {
      ...target,
      shields: Math.min(2, (target.shields || 0) + 1),
    };
    handleUpdateStudent(updatedStudent);
    sound.playReward();
  };

  // Reward Redemption
  const handleRedeemReward = (studentId: string, rewardId: string) => {
    const student = students.find((s) => s.id === studentId);
    const reward = rewards.find((r) => r.id === rewardId);
    if (!student || !reward) return;

    if (student.flowerPoints < reward.cost) {
      alert(`Học sinh ${student.name} chưa đủ điểm hoa để đổi quà "${reward.title}" (Cần ${reward.cost} hoa, hiện có ${student.flowerPoints} hoa)`);
      return;
    }

    if (reward.stock !== -1 && reward.stock <= 0) {
      alert(`Phần quà "${reward.title}" đã hết trong kho!`);
      return;
    }

    const updatedStudent: Student = {
      ...student,
      flowerPoints: Math.max(0, student.flowerPoints - reward.cost),
      lifetimePoints: student.lifetimePoints ?? student.flowerPoints,
    };

    const updatedRewards = rewards.map((r) =>
      r.id === rewardId ? { ...r, stock: r.stock !== -1 ? Math.max(0, r.stock - 1) : -1 } : r
    );

    const newRedemption: RedemptionLog = {
      id: `redemption-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      rewardId: reward.id,
      rewardTitle: reward.title,
      cost: reward.cost,
      timestamp: Date.now(),
      status: 'delivered',
    };
    const updatedRedemptions = [newRedemption, ...redemptions];

    const newLog: PointLog = {
      id: `log-redeem-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      group: student.group,
      delta: -reward.cost,
      reason: `🎁 Đổi phần thưởng: ${reward.title}`,
      category: 'other',
      timestamp: Date.now(),
    };
    const updatedLogs = [newLog, ...pointLogs];

    const nextStudents = students.map(s => s.id === studentId ? updatedStudent : s);
    setStudents(nextStudents);
    setRewards(updatedRewards);
    setRedemptions(updatedRedemptions);
    setPointLogs(updatedLogs);

    storageService.saveAppData({
      students: nextStudents,
      rewards: updatedRewards,
      redemptions: updatedRedemptions,
      pointLogs: updatedLogs,
    });

    showToast('Đổi quà thành công!');
    sound.playLevelUp();
  };

  const handleAddNewReward = (reward: RewardItem) => {
    const updated = [...rewards, reward];
    setRewards(updated);
    storageService.saveRewards(updated);
    showToast('Đã thêm phần quà mới');
    sound.playReward();
  };

  const handleUpdateRewardStock = (rewardId: string, newStock: number) => {
    const updated = rewards.map((r) => (r.id === rewardId ? { ...r, stock: newStock } : r));
    setRewards(updated);
    storageService.saveRewards(updated);
  };

  // ===================== CRUD FOR STUDENTS =====================
  const handleAddStudent = (newStudent: Student) => {
    const updatedList = [...students, newStudent];
    setStudents(updatedList);
    storageService.saveStudent(newStudent);
    showToast('Đã thêm học sinh mới');
    sound.playReward();
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedList = students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s));
    setStudents(updatedList);
    storageService.saveStudent(updatedStudent);
    showToast('Đã cập nhật thông tin học sinh');
  };

  const handleDeleteStudent = (studentId: string) => {
    const updatedStudents = students.filter((s) => s.id !== studentId);
    setStudents(updatedStudents);

    let updatedAttendance = attendance;
    if (attendance?.records && attendance.records[studentId]) {
      const nextRecords = { ...attendance.records };
      delete nextRecords[studentId];
      updatedAttendance = {
        ...attendance,
        records: nextRecords,
      };
      setAttendance(updatedAttendance);
    }

    const updatedAttendanceHistory = attendanceHistory.map((day) => {
      if (!day.records || !day.records[studentId]) return day;
      const nextRecords = { ...day.records };
      delete nextRecords[studentId];
      return { ...day, records: nextRecords };
    });
    setAttendanceHistory(updatedAttendanceHistory);

    const updatedPointLogs = pointLogs.filter((log) => log.studentId !== studentId);
    setPointLogs(updatedPointLogs);

    const updatedRedemptions = redemptions.filter((r) => r.studentId !== studentId);
    setRedemptions(updatedRedemptions);

    const updatedTeacherNotes = teacherNotes.filter((n) => n.studentId !== studentId);
    setTeacherNotes(updatedTeacherNotes);

    storageService.deleteStudent(studentId);
    showToast('Đã xóa học sinh');
    sound.playClick();
  };

  const handleBatchUpdateStudents = (newStudents: Student[]) => {
    setStudents(newStudents);
    storageService.saveStudents(newStudents);
    showToast('Đã cập nhật danh sách lớp học');
    sound.playReward();
  };

  // ===================== RESETS =====================
  const handleResetGarden = () => {
    const resetList = students.map((s) => ({
      ...s,
      flowerPoints: 0,
      bloomedGardens: [],
      shields: 0,
    }));
    setStudents(resetList);
    setPointLogs([]);
    storageService.saveAppData({
      students: resetList,
      pointLogs: [],
    });
    showToast('Đã làm mới Vườn thành tích về 0 ⭐');
    sound.playClick();
  };

  const handleResetAllPoints = handleResetGarden;

  const handleResetStudents = () => {
    setStudents([]);
    const updatedAttendance = { date: getTodayDateString(), records: {} };
    setAttendance(updatedAttendance);
    setAttendanceHistory([]);
    setPointLogs([]);
    setRedemptions([]);
    setTeacherNotes([]);
    storageService.saveAppData({
      students: [],
      attendance: updatedAttendance,
      attendanceHistory: [],
      pointLogs: [],
      redemptions: [],
      teacherNotes: [],
    });
    showToast('Đã làm mới danh sách học sinh');
    sound.playClick();
  };

  const handleResetAttendance = () => {
    const emptyAtt: DailyAttendance = { date: getTodayDateString(), records: {} };
    setAttendance(emptyAtt);
    setAttendanceHistory([]);
    storageService.saveAttendance(emptyAtt, []);
    showToast('Đã làm mới dữ liệu điểm danh');
    sound.playClick();
  };

  const handleResetGames = () => {
    try {
      localStorage.removeItem('games_called_history');
      localStorage.removeItem('duck_race_history');
      localStorage.removeItem('balloon_popped');
    } catch (e) {}
    sound.playClick();
    showToast('Đã làm mới dữ liệu trò chơi');
  };

  const handleResetTimer = () => {
    try {
      localStorage.removeItem('classroom_timer_config');
      localStorage.removeItem('classroom_timer_state');
    } catch (e) {}
    sound.playClick();
    showToast('Đã đưa đồng hồ về mặc định');
  };

  const handleResetNoiseMeter = () => {
    try {
      localStorage.removeItem('noise_meter_sensitivity');
      localStorage.removeItem('noise_meter_alarm');
    } catch (e) {}
    sound.playClick();
    showToast('Đã đưa đo tiếng ồn về mặc định');
  };

  const handleResetCriteria = () => {
    setCriteria(initialCriteria);
    storageService.saveCriteria(initialCriteria);
    showToast('Đã khôi phục tiêu chí thi đua ban đầu');
    sound.playReward();
  };

  const handleResetAllData = () => {
    const fresh = storageService.resetAllData();
    setConfig(fresh.config);
    setStudents(fresh.students);
    setAttendance(fresh.attendance);
    setAttendanceHistory(fresh.attendanceHistory || []);
    setPointLogs(fresh.pointLogs);
    setRewards(fresh.rewards);
    setRedemptions(fresh.redemptions);
    setTeacherNotes(fresh.teacherNotes);
    setCriteria(fresh.criteria);
    setAssignments(fresh.assignments || []);
    setActiveTab('dashboard');
    sound.playLevelUp();
    showToast('ĐÃ LÀM MỚI ỨNG DỤNG - Sẵn sàng cho lớp học mới!', 'success');
  };

  // ===================== NOTES =====================
  const handleAddTeacherNote = (note: Omit<TeacherNote, 'id' | 'createdAt'>) => {
    const newN: TeacherNote = {
      ...note,
      id: `note-${Date.now()}`,
      createdAt: Date.now(),
    };
    const updated = [newN, ...teacherNotes];
    setTeacherNotes(updated);
    storageService.saveAppData({ teacherNotes: updated });
    sound.playReward();
    showToast('Đã thêm ghi chú mới');
  };

  const handleToggleTeacherNote = (noteId: string) => {
    const updated = teacherNotes.map((n) => (n.id === noteId ? { ...n, isDone: !n.isDone } : n));
    setTeacherNotes(updated);
    storageService.saveAppData({ teacherNotes: updated });
  };

  const handleDeleteTeacherNote = (noteId: string) => {
    const updated = teacherNotes.filter((n) => n.id !== noteId);
    setTeacherNotes(updated);
    storageService.saveAppData({ teacherNotes: updated });
    showToast('Đã xóa ghi chú');
  };

  // ===================== CONFIG =====================
  const handleSaveConfig = (newConfig: ClassConfig) => {
    setConfig(newConfig);
    storageService.saveConfig(newConfig);
    showToast('Đã lưu cấu hình lớp học');
  };

  // ===================== ATTENDANCE =====================
  const handleUpdateAttendance = (newAttendance: DailyAttendance) => {
    setAttendance(newAttendance);
    storageService.saveAttendance(newAttendance, attendanceHistory);
  };

  const handleSaveDailyAttendance = (savedAtt: DailyAttendance) => {
    const nextHistory = [...attendanceHistory];
    const idx = nextHistory.findIndex((item) => item.date === savedAtt.date);
    if (idx >= 0) {
      nextHistory[idx] = savedAtt;
    } else {
      nextHistory.push(savedAtt);
    }
    setAttendanceHistory(nextHistory);
    setAttendance(savedAtt);
    storageService.saveAttendance(savedAtt, nextHistory);
    showToast('Đã lưu điểm danh ngày');
  };

  // ===================== BACKUP EXPORT / IMPORT =====================
  const handleExportFullData = () => {
    const bundle: AppDataBundle = {
      config,
      students,
      attendance,
      attendanceHistory,
      pointLogs,
      rewards,
      redemptions,
      teacherNotes,
      criteria,
      assignments,
      lastUpdated: Date.now(),
      version: '3.0.0-offline',
    };
    const dataStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sotay-lop4A2-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    sound.playReward();
    showToast('Đã tải xuống file sao lưu');
  };

  const handleImportFullData = (data: any) => {
    if (data.config) setConfig(data.config);
    if (data.students) setStudents(data.students);
    if (data.attendance) setAttendance(data.attendance);
    if (data.attendanceHistory) setAttendanceHistory(data.attendanceHistory);
    if (data.pointLogs) setPointLogs(data.pointLogs);
    if (data.rewards) setRewards(data.rewards);
    if (data.redemptions) setRedemptions(data.redemptions);
    if (data.teacherNotes) setTeacherNotes(data.teacherNotes);
    if (data.assignments) setAssignments(data.assignments);

    storageService.saveAppData({
      config: data.config || config,
      students: data.students || students,
      attendance: data.attendance || attendance,
      attendanceHistory: data.attendanceHistory || attendanceHistory,
      pointLogs: data.pointLogs || pointLogs,
      rewards: data.rewards || rewards,
      redemptions: data.redemptions || redemptions,
      teacherNotes: data.teacherNotes || teacherNotes,
      criteria: data.criteria || criteria,
      assignments: data.assignments || assignments,
    });
    showToast('Đã phục hồi dữ liệu thành công!');
    sound.playReward();
  };

  // Stats calculation
  const totalFlowers = students.reduce((acc, s) => acc + s.flowerPoints, 0);
  const absentCount = (Object.values(attendance.records || {}) as any[]).filter(
    (r) => r && (r.status === 'excused' || r.status === 'unexcused')
  ).length;
  const availableRewardsCount = rewards.filter((r) => r.stock === -1 || r.stock > 0).length;

  const sidebarPos = config.sidebarPosition || 'left';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF7ED] via-[#FDF2F8] to-[#FAF5FF] text-slate-900 flex flex-col font-sans selection:bg-[#F9A8D4] selection:text-[#701A75] pb-16 lg:pb-0 relative">
      {/* Decorative Sweet Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[#FCE7F3] blur-3xl" />
        <div className="absolute top-1/3 right-10 w-80 h-80 rounded-full bg-[#E9D5FF] blur-3xl" />
        <div className="absolute bottom-20 left-1/4 w-96 h-96 rounded-full bg-[#FEF3C7] blur-3xl" />
      </div>

      {/* Top Main Class Header */}
      <div className="relative z-10 w-full px-3 sm:px-5 md:px-6 pt-3 sm:pt-4">
        <div className="w-full max-w-[1600px] mx-auto">
          <ClassHeader
            config={config}
            students={students}
            attendance={attendance}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onUpdateConfig={handleSaveConfig}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>
      </div>

      {/* Main Workspace Layout: Responsive Sidebar (Left / Right) + Main View Content */}
      <div className="w-full px-3 sm:px-5 md:px-6 py-4 flex-1">
        <div className={`w-full max-w-[1600px] mx-auto flex flex-col lg:flex-row gap-5 ${
          sidebarPos === 'right' ? 'lg:flex-row-reverse' : 'lg:flex-row'
        }`}>
          {/* Sidebar Navigation */}
          <div className="w-full lg:w-auto shrink-0">
            <Sidebar
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              config={config}
              onUpdateConfig={handleSaveConfig}
              studentCount={students.length}
              totalFlowers={totalFlowers}
              absentCount={absentCount}
              availableRewardsCount={availableRewardsCount}
              onOpenSettingsModal={() => setIsSettingsOpen(true)}
            />
          </div>

          {/* Tab View Display Area */}
          <main className="flex-1 min-w-0 pb-8">
            {/* 1. Dashboard (Tổng quan) */}
            {activeTab === 'dashboard' && (
              <DashboardView
                students={students}
                config={config}
                attendance={attendance}
                pointLogs={pointLogs}
                rewards={rewards}
                onChangeTab={setActiveTab}
                onNavigateTab={setActiveTab}
                onUpdateConfig={handleSaveConfig}
              />
            )}

            {/* 2. Quản lý Học sinh */}
            {activeTab === 'students' && (
              <StudentManagerView
                students={students}
                config={config}
                attendance={attendance}
                onAddStudent={handleAddStudent}
                onUpdateStudent={handleUpdateStudent}
                onDeleteStudent={handleDeleteStudent}
                onResetAllPoints={handleResetAllPoints}
                onImportFullData={handleImportFullData}
                onExportFullData={handleExportFullData}
                onBatchUpdateStudents={handleBatchUpdateStudents}
              />
            )}

            {/* 3. VƯỜN THÀNH TÍCH */}
            {(activeTab === 'garden' || activeTab === 'scoring' || activeTab === 'groups' || activeTab === 'leaderboard') && (
              <FlowerGardenView
                students={students}
                criteria={criteria}
                pointLogs={pointLogs}
                config={config}
                onAwardPoints={handleAwardPoints}
                onUpdateStudent={handleUpdateStudent}
                onGrantShield={handleGrantShield}
                onUpdateCriteria={handleUpdateCriteria}
                onDeletePointLog={handleDeletePointLog}
              />
            )}

            {/* 4. Điểm danh Chuyên cần */}
            {activeTab === 'attendance' && (
              <AttendanceView
                students={students}
                currentAttendance={attendance}
                attendanceHistory={attendanceHistory}
                config={config}
                onUpdateAttendance={handleUpdateAttendance}
                onSaveDailyAttendance={handleSaveDailyAttendance}
              />
            )}

            {/* 5. Cửa hàng Đổi thưởng */}
            {activeTab === 'rewards' && (
              <RewardShopView
                rewards={rewards}
                students={students}
                redemptionLogs={redemptions}
                config={config}
                onRedeemReward={handleRedeemReward}
                onAddNewReward={handleAddNewReward}
                onUpdateRewardStock={handleUpdateRewardStock}
              />
            )}

            {/* 6. TRÒ CHƠI LỚP HỌC */}
            {(activeTab === 'classroom_games' || activeTab === 'random_picker') && (
              <ClassroomGamesView
                students={students}
                attendance={attendance}
                config={config}
                onAwardPoints={handleAwardPoints}
              />
            )}

            {/* 7. Đồng hồ Đếm ngược & Bấm giờ */}
            {activeTab === 'timer' && (
              <ClassroomTimerView />
            )}

            {/* 8. Đo Tiếng Ồn Lớp Học */}
            {activeTab === 'noise_meter' && (
              <NoiseMeterView />
            )}

            {/* 9. Sổ tay & Ghi chú */}
            {activeTab === 'notes' && (
              <TeacherNotesView
                notes={teacherNotes}
                students={students}
                config={config}
                onAddNote={handleAddTeacherNote}
                onToggleNote={handleToggleTeacherNote}
                onDeleteNote={handleDeleteTeacherNote}
              />
            )}

            {/* 10. Báo cáo & Sổ Theo Dõi */}
            {activeTab === 'reports' && (
              <ReportsView
                students={students}
                config={config}
                attendance={attendance}
                attendanceHistory={attendanceHistory}
                pointLogs={pointLogs}
                onUpdateConfig={handleSaveConfig}
              />
            )}

            {/* 11. Cài đặt Hệ thống & Quản trị Dữ liệu */}
            {activeTab === 'settings' && (
              <SettingsView
                config={config}
                students={students}
                rewards={rewards}
                criteria={criteria}
                onSaveConfig={handleSaveConfig}
                onUpdateCriteria={handleUpdateCriteria}
                onUpdateRewards={(newRewards) => {
                  setRewards(newRewards);
                  storageService.saveRewards(newRewards);
                  showToast('Đã lưu danh sách quà tặng');
                }}
                onResetStudents={handleResetStudents}
                onResetGarden={handleResetGarden}
                onResetAttendance={handleResetAttendance}
                onResetGames={handleResetGames}
                onResetTimer={handleResetTimer}
                onResetNoiseMeter={handleResetNoiseMeter}
                onResetCriteria={handleResetCriteria}
                onResetAllPoints={handleResetAllPoints}
                onResetAllData={handleResetAllData}
                onExportFullData={handleExportFullData}
                onImportFullData={handleImportFullData}
                onNavigateToDashboard={() => setActiveTab('dashboard')}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#FCE7F3] px-1 py-1.5 shadow-xl shadow-pink-200/50 flex items-center justify-around">
        {[
          { id: 'dashboard' as ActiveTab, label: 'Trang chủ', icon: '🏠' },
          { id: 'classroom_games' as ActiveTab, label: 'Trò chơi', icon: '🎮' },
          { id: 'students' as ActiveTab, label: 'Học sinh', icon: '👩‍🎓' },
          { id: 'garden' as ActiveTab, label: 'Vườn hoa', icon: '🌸' },
          { id: 'settings' as ActiveTab, label: 'Cài đặt', icon: '⚙️' },
        ].map((tab) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition font-black text-[10px] ${
                isSelected
                  ? 'candy-btn-purple text-white shadow-md scale-105'
                  : 'text-purple-900 hover:bg-[#FDF2F8]'
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="mt-0.5 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Class Settings Modal */}
      <SettingsModal
        config={config}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaveConfig={handleSaveConfig}
      />

      {/* First-time Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        currentConfig={config}
        onComplete={handleCompleteOnboarding}
      />

      {/* Gamified Point & Energy Animation Overlay */}
      <PointAnimationOverlay
        event={currentPointEvent}
        onComplete={() => setCurrentPointEvent(null)}
      />

      {/* Global Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 animate-bounce-in">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border-2 backdrop-blur-md flex items-center gap-3 text-xs font-bold ${
            toastType === 'success' 
              ? 'bg-slate-900/95 text-white border-pink-400/40'
              : 'bg-rose-900/95 text-white border-rose-400'
          }`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
              toastType === 'success' ? 'bg-emerald-500' : 'bg-rose-500'
            }`}>
              {toastType === 'success' ? '✓' : '!'}
            </span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
