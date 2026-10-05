/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import {
  DepartmentId,
  ShiftType,
  ShiftRosterData,
  ProductivityCalculationResult,
  PatientAcuityType,
  UserProfile,
  IndirectCalculationMethod,
  IndirectWorkloadConfig,
  NursingActivity
} from '../types/nursing';
import {
  ACUITY_STANDARDS,
  DEPARTMENTS,
  MASTER_NURSING_ACTIVITIES
} from '../data/mockNursingData';
import {
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  Bed,
  Activity,
  Layers,
  Calendar,
  Save,
  Check,
  RefreshCw,
  Database,
  Percent,
  Sliders,
  CheckSquare,
  Square,
  Calculator,
  ArrowRight,
  Info,
  Search,
  FileSpreadsheet,
  ListFilter,
  CheckCheck,
  RotateCcw,
  X
} from 'lucide-react';
import {
  saveDailyWorkloadRecord,
  fetchDailyWorkloadRecord
} from '../services/firebaseService';

interface WorkloadCalculatorViewProps {
  selectedDeptId: DepartmentId;
  onSelectDept: (deptId: DepartmentId) => void;
  roster: ShiftRosterData;
  onUpdateRoster: (deptId: DepartmentId, newRoster: ShiftRosterData) => void;
  result: ProductivityCalculationResult;
  currentUser: UserProfile;
  activities?: NursingActivity[];
}

export const WorkloadCalculatorView: React.FC<WorkloadCalculatorViewProps> = ({
  selectedDeptId,
  onSelectDept,
  roster,
  onUpdateRoster,
  result,
  currentUser,
  activities = MASTER_NURSING_ACTIVITIES,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentDept = DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];
  const activeShiftKey = roster.activeShift || 'morning';
  const activeShiftData = roster.shifts[activeShiftKey] || roster.shifts.morning;

  // Calendar & Date Management
  const [selectedDate, setSelectedDate] = useState<string>(roster.date || new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [isLoadingDate, setIsLoadingDate] = useState<boolean>(false);

  // Indirect Workload Config (ขั้นตอนที่ 2)
  const indirectConfig: IndirectWorkloadConfig = roster.indirectConfig || {
    method: 'allowance_percentage',
    fixedHours: 0,
    allowancePercent: 20,
    selectedActivityCounts: {},
    fixedItems: [
      { id: 'fx-1', title: 'การรับ-ส่งเวรและสรุปยอดผู้ป่วย (Shift Handover)', minutes: 45, enabled: false },
      { id: 'fx-2', title: 'การตรวจนับยาควบคุม ยาเสพติด และตู้ยาฉุกเฉิน (Medication Check)', minutes: 25, enabled: false },
      { id: 'fx-3', title: 'ประชุม Morning Brief / มอบหมายงานประจำเวร', minutes: 20, enabled: false },
      { id: 'fx-4', title: 'ตรวจเช็คอุปกรณ์ช่วยชีวิต & เครื่อง Defibrillator', minutes: 30, enabled: false },
    ],
  };

  // Job Valuation Selection State for Step 2
  const [fixedMode, setFixedMode] = useState<'job_table' | 'presets'>('job_table');
  const [activityCategoryFilter, setActivityCategoryFilter] = useState<'all' | 'indirect' | 'unit_related'>('all');
  const [activitySearchQuery, setActivitySearchQuery] = useState<string>('');

  // Sync date when department or roster date changes
  useEffect(() => {
    if (roster.date && roster.date !== selectedDate) {
      setSelectedDate(roster.date);
    }
  }, [roster.date, selectedDeptId]);

  // Horizontal Scroll handlers for department slider
  const handleScrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  // Format date to Thai Buddhist calendar
  const formatThaiDate = (dateStr: string): string => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('th-TH', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Date selection (including past historical dates)
  const handleDateChange = async (newDate: string) => {
    if (!newDate) return;
    setSelectedDate(newDate);
    setIsLoadingDate(true);
    setSaveNotice(null);

    try {
      const savedRecord = await fetchDailyWorkloadRecord(selectedDeptId, newDate);
      if (savedRecord) {
        onUpdateRoster(selectedDeptId, {
          ...savedRecord,
          date: newDate,
        });
        setSaveNotice(`โหลดข้อมูลวันที่ ${formatThaiDate(newDate)} จาก Realtime Database สำเร็จ`);
      } else {
        onUpdateRoster(selectedDeptId, {
          ...roster,
          date: newDate,
        });
      }
    } catch (err) {
      console.warn('Fetch record notice:', err);
    } finally {
      setIsLoadingDate(false);
    }
  };

  // Quick preset dates
  const handleQuickDateSelect = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dateStr = d.toISOString().split('T')[0];
    handleDateChange(dateStr);
  };

  // Save current roster to Firebase Realtime Database and app state
  const handleSaveRecord = async () => {
    setIsSaving(true);
    setSaveNotice(null);

    try {
      const updatedRoster: ShiftRosterData = {
        ...roster,
        date: selectedDate,
        shifts: {
          morning: {
            ...roster.shifts.morning,
            onDutyStaff: { rn: roster.shifts.morning.onDutyStaff.rn, na: 0 },
          },
          afternoon: {
            ...roster.shifts.afternoon,
            onDutyStaff: { rn: roster.shifts.afternoon.onDutyStaff.rn, na: 0 },
          },
          night: {
            ...roster.shifts.night,
            onDutyStaff: { rn: roster.shifts.night.onDutyStaff.rn, na: 0 },
          },
        },
        indirectConfig,
      };

      onUpdateRoster(selectedDeptId, updatedRoster);
      await saveDailyWorkloadRecord(selectedDeptId, selectedDate, updatedRoster, currentUser.name);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(timeStr);
      setSaveNotice(
        `บันทึกข้อมูลค่างานและเวรประจำวันที่ ${formatThaiDate(selectedDate)} แผนก ${currentDept.name} เรียบร้อยแล้ว (ซิงค์ Realtime Database สำเร็จ)`
      );
    } catch (e) {
      console.error('Save daily workload error:', e);
      setSaveNotice('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  // Shift Change
  const handleActiveShiftChange = (shift: ShiftType) => {
    onUpdateRoster(selectedDeptId, {
      ...roster,
      activeShift: shift,
    });
  };

  // Census change for a specific shift
  const handleShiftTotalCensusChange = (shift: ShiftType, newTotal: number) => {
    const validTotal = Math.max(0, newTotal);
    const targetShift = roster.shifts[shift];
    const prevTotal = targetShift.census || 1;

    const updatedAcuity: Record<PatientAcuityType, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const ratio = validTotal / (prevTotal || 1);

    let assigned = 0;
    ([1, 2, 3, 4] as PatientAcuityType[]).forEach((ac) => {
      const distributed = Math.round((targetShift.censusByAcuity[ac] || 0) * ratio);
      updatedAcuity[ac] = distributed;
      assigned += distributed;
    });
    updatedAcuity[5] = Math.max(0, validTotal - assigned);

    onUpdateRoster(selectedDeptId, {
      ...roster,
      shifts: {
        ...roster.shifts,
        [shift]: {
          ...targetShift,
          census: validTotal,
          censusByAcuity: updatedAcuity,
        },
      },
    });
  };

  // Granular acuity change for active shift
  const handleAcuityChange = (acuity: PatientAcuityType, delta: number) => {
    const currentVal = activeShiftData.censusByAcuity[acuity] || 0;
    const nextVal = Math.max(0, currentVal + delta);
    const updatedAcuity = {
      ...activeShiftData.censusByAcuity,
      [acuity]: nextVal,
    };
    const newTotalCensus = Object.values(updatedAcuity).reduce((s, c) => s + c, 0);

    onUpdateRoster(selectedDeptId, {
      ...roster,
      shifts: {
        ...roster.shifts,
        [activeShiftKey]: {
          ...activeShiftData,
          census: newTotalCensus,
          censusByAcuity: updatedAcuity,
        },
      },
    });
  };

  // Staffing change: ONLY RN (เฉพาะพยาบาลวิชาชีพ RN เท่านั้น)
  const handleStaffChange = (delta: number) => {
    const currentVal = activeShiftData.onDutyStaff.rn || 0;
    const nextVal = Math.max(0, currentVal + delta);

    onUpdateRoster(selectedDeptId, {
      ...roster,
      shifts: {
        ...roster.shifts,
        [activeShiftKey]: {
          ...activeShiftData,
          onDutyStaff: {
            ...activeShiftData.onDutyStaff,
            rn: nextVal,
            na: 0,
          },
        },
      },
    });
  };

  // Handlers for Step 2: Indirect Care & Unit-Related calculation methods
  const handleIndirectMethodChange = (method: IndirectCalculationMethod) => {
    const updated: IndirectWorkloadConfig = {
      ...indirectConfig,
      method,
    };
    onUpdateRoster(selectedDeptId, {
      ...roster,
      indirectConfig: updated,
    });
  };

  const handleFixedHoursChange = (hours: number) => {
    const updated: IndirectWorkloadConfig = {
      ...indirectConfig,
      fixedHours: Math.max(0, Number(hours.toFixed(1))),
    };
    onUpdateRoster(selectedDeptId, {
      ...roster,
      indirectConfig: updated,
    });
  };

  const handleAllowancePercentChange = (percent: number) => {
    const updated: IndirectWorkloadConfig = {
      ...indirectConfig,
      allowancePercent: Math.max(5, Math.min(50, percent)),
    };
    onUpdateRoster(selectedDeptId, {
      ...roster,
      indirectConfig: updated,
    });
  };

  const handleToggleFixedItem = (itemId: string) => {
    const items = (indirectConfig.fixedItems || []).map((it) =>
      it.id === itemId ? { ...it, enabled: !it.enabled } : it
    );
    const activeMinutes = items.filter((it) => it.enabled).reduce((sum, it) => sum + it.minutes, 0);
    const updated: IndirectWorkloadConfig = {
      ...indirectConfig,
      fixedItems: items,
      fixedHours: Number((activeMinutes / 60).toFixed(2)),
    };
    onUpdateRoster(selectedDeptId, {
      ...roster,
      indirectConfig: updated,
    });
  };

  // Handlers for Job Valuation Table Activity Selection (Step 2)
  const handleActivityCountChange = (activityId: string, delta: number) => {
    const currentCounts = { ...(indirectConfig.selectedActivityCounts || {}) };
    const currentVal = currentCounts[activityId] || 0;
    const nextVal = Math.max(0, currentVal + delta);

    if (nextVal === 0) {
      delete currentCounts[activityId];
    } else {
      currentCounts[activityId] = nextVal;
    }

    // Calculate sum of minutes from chosen activities
    let sumMinutes = 0;
    for (const [id, count] of Object.entries(currentCounts)) {
      const act = activities.find((a) => a.id === id);
      if (act && count > 0) {
        sumMinutes += act.standardMinutes * count;
      }
    }

    const calculatedHours = sumMinutes > 0 ? Number((sumMinutes / 60).toFixed(2)) : 2.0;

    const updated: IndirectWorkloadConfig = {
      ...indirectConfig,
      method: 'fixed_hours',
      selectedActivityCounts: currentCounts,
      fixedHours: calculatedHours,
    };

    onUpdateRoster(selectedDeptId, {
      ...roster,
      indirectConfig: updated,
    });
  };

  const handleSelectPresetRoutine = () => {
    // Routine activities standard for the ward shift:
    const presetCounts: Record<string, number> = {
      'act-ind-01': 3, // บันทึกเวชระเบียน Focus Charting
      'act-ind-02': 4, // ส่งเวรข้างเตียง SBAR
      'act-ind-03': 2, // จัดเตรียมยา Unit-Dose
      'act-unt-01': 1, // ตรวจนับยาเสพติดและยาความเสี่ยงสูง
      'act-unt-03': 1, // Morning Safety Huddle
    };

    let sumMinutes = 0;
    for (const [id, count] of Object.entries(presetCounts)) {
      const act = activities.find((a) => a.id === id);
      if (act) {
        sumMinutes += act.standardMinutes * count;
      }
    }

    const calculatedHours = Number((sumMinutes / 60).toFixed(2));

    const updated: IndirectWorkloadConfig = {
      ...indirectConfig,
      method: 'fixed_hours',
      selectedActivityCounts: presetCounts,
      fixedHours: calculatedHours,
    };

    onUpdateRoster(selectedDeptId, {
      ...roster,
      indirectConfig: updated,
    });
  };

  const handleClearActivitySelections = () => {
    const updated: IndirectWorkloadConfig = {
      ...indirectConfig,
      selectedActivityCounts: {},
      fixedHours: 2.0,
    };

    onUpdateRoster(selectedDeptId, {
      ...roster,
      indirectConfig: updated,
    });
  };

  // Activity counts and filtered lists
  const selectedActivityCounts = indirectConfig.selectedActivityCounts || {};
  const totalSelectedActivitiesCount = Object.keys(selectedActivityCounts).filter(
    (k) => (selectedActivityCounts[k] || 0) > 0
  ).length;

  const totalSelectedMinutes = Object.entries(selectedActivityCounts).reduce((sum, [id, count]) => {
    const act = activities.find((a) => a.id === id);
    return sum + (act ? act.standardMinutes * count : 0);
  }, 0);

  const filteredActivities = activities
    .filter((a) => {
      if (activityCategoryFilter === 'indirect') return a.category === 'indirect';
      if (activityCategoryFilter === 'unit_related') return a.category === 'unit_related';
      return a.category === 'indirect' || a.category === 'unit_related';
    })
    .filter((a) => {
      if (!activitySearchQuery.trim()) return true;
      const q = activitySearchQuery.toLowerCase().trim();
      return (
        a.code.toLowerCase().includes(q) ||
        a.titleTh.toLowerCase().includes(q) ||
        a.titleEn.toLowerCase().includes(q) ||
        a.descriptionTh.toLowerCase().includes(q)
      );
    });

  // Calculated indirect hours for the active shift
  const calculatedIndirectHours = Number(
    (result.indirectCareHours + result.unitRelatedHours).toFixed(1)
  );

  return (
    <div className="space-y-6">
      {/* 1. Horizontal Carousel / Slider for Department Selection */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>เลื่อนเพื่อเลือกแผนกคำนวณ (Department Carousel)</span>
            </h2>
            <p className="text-xs text-slate-500">
              คลิกหรือเลื่อนแถบการ์ดแนวนอนเพื่อเลือกแผนกที่ต้องการคำนวณค่างานและอัตรากำลัง
            </p>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handleScrollLeft}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs"
              title="เลื่อนซ้าย"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleScrollRight}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors shadow-2xs"
              title="เลื่อนขวา"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className="flex space-x-3 overflow-x-auto pb-2 pt-1 scroll-smooth no-scrollbar"
        >
          {DEPARTMENTS.map((dept) => {
            const isSelected = dept.id === selectedDeptId;
            return (
              <div
                key={dept.id}
                onClick={() => onSelectDept(dept.id)}
                className={`shrink-0 w-64 p-4 rounded-xl border transition-all cursor-pointer shadow-2xs select-none ${
                  isSelected
                    ? 'border-teal-700 bg-teal-50/70 ring-2 ring-teal-700/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-slate-900 text-sm">{dept.name}</div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      dept.complexityLevel === 'Critical'
                        ? 'bg-red-100 text-red-700'
                        : dept.complexityLevel === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {dept.complexityLevel}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1 truncate">{dept.nameEn}</div>

                <div className="mt-3 pt-2.5 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Bed className="w-3.5 h-3.5 text-teal-700" />
                    <span>{dept.bedCapacity > 0 ? `${dept.bedCapacity} เตียง` : 'บริการตรวจ'}</span>
                  </span>
                  <span className="font-mono font-bold text-slate-800">
                    เป้าหมาย {dept.targetNHPPD} ชม.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. CALENDAR DATE SELECTOR & SAVE WORKLOAD ACTION BAR (บันทึกข้อมูลย้อนหลัง & ปุ่มบันทึก) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>เลือกวันที่ในปฏิทินเพื่อบันทึกข้อมูล (สามารถบันทึกย้อนหลังได้)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              แผนก: <strong className="text-teal-900">{currentDept.name}</strong> ·
              เลือกวันที่ต้องการบันทึกหรือตรวจสอบข้อมูลย้อนหลัง และกดปุ่มบันทึกเพื่อซิงค์ข้อมูล
            </p>
          </div>

          {/* Prominent Save Button */}
          <div className="flex items-center space-x-2 self-start lg:self-auto">
            <button
              onClick={handleSaveRecord}
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-800 hover:bg-teal-700 active:bg-teal-900 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึกลง Realtime Database...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>บันทึกข้อมูลค่างาน & เวร</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Date Controls & Quick Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 border border-slate-300 rounded-lg shadow-2xs">
              <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
              />
            </div>

            <span className="text-xs font-semibold text-slate-700">
              {formatThaiDate(selectedDate)}
            </span>

            {isLoadingDate && (
              <span className="text-[11px] text-teal-700 flex items-center gap-1 font-semibold animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" />
                กำลังค้นหาข้อมูลย้อนหลัง...
              </span>
            )}
          </div>

          {/* Quick preset buttons */}
          <div className="flex items-center space-x-1.5 text-xs">
            <span className="text-[11px] text-slate-500 hidden md:inline">เลือกเร็ว:</span>
            <button
              onClick={() => handleQuickDateSelect(0)}
              className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-teal-50 hover:text-teal-800 border border-slate-200 rounded-md transition-colors"
            >
              วันนี้
            </button>
            <button
              onClick={() => handleQuickDateSelect(1)}
              className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-teal-50 hover:text-teal-800 border border-slate-200 rounded-md transition-colors"
            >
              เมื่อวาน
            </button>
            <button
              onClick={() => handleQuickDateSelect(2)}
              className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-teal-50 hover:text-teal-800 border border-slate-200 rounded-md transition-colors"
            >
              ย้อนหลัง 2 วัน
            </button>
            <button
              onClick={() => handleQuickDateSelect(7)}
              className="px-2.5 py-1 text-[11px] font-bold bg-white hover:bg-teal-50 hover:text-teal-800 border border-slate-200 rounded-md transition-colors"
            >
              ย้อนหลัง 7 วัน
            </button>
          </div>
        </div>

        {/* Save Confirmation Notification */}
        {saveNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-900 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveNotice}</span>
            </div>
            {lastSavedTime && (
              <span className="text-[11px] text-emerald-700 font-mono">
                บันทึกล่าสุด: {lastSavedTime} น.
              </span>
            )}
          </div>
        )}
      </div>

      {/* 3. Patient Census for Each of the 3 Shifts (เช้า · บ่าย · ดึก) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-700" />
              <span>ใส่จำนวนผู้ป่วยในแต่ละเวรเพื่อคำนวณ (Shift-by-Shift Patient Census)</span>
            </h3>
            <p className="text-xs text-slate-500">
              แผนก: <strong className="text-slate-900">{currentDept.name}</strong> · ระบุจำนวนผู้ป่วยในเวรเช้า, เวรบ่าย, และเวรดึก
            </p>
          </div>

          {/* Active Shift Selector Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            {(['morning', 'afternoon', 'night'] as ShiftType[]).map((st) => (
              <button
                key={st}
                onClick={() => handleActiveShiftChange(st)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  activeShiftKey === st
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st === 'morning' ? 'เวรเช้า' : st === 'afternoon' ? 'เวรบ่าย' : 'เวรดึก'}
              </button>
            ))}
          </div>
        </div>

        {/* 3 Shifts Input Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Shift Morning Card */}
          <div
            onClick={() => handleActiveShiftChange('morning')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeShiftKey === 'morning'
                ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">1. เวรเช้า (08:00 - 16:00)</span>
              <span className="text-[10px] text-teal-800 font-bold bg-teal-100 px-1.5 py-0.5 rounded">
                น้ำหนักงาน 45%
              </span>
            </div>
            <label className="text-[11px] text-slate-500 block mb-1">
              จำนวนผู้ป่วยในเวร (คน):
            </label>
            <input
              type="number"
              min="0"
              value={roster.shifts.morning.census}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleShiftTotalCensusChange('morning', Number(e.target.value))}
              className="w-full text-lg font-bold font-mono p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
            <div className="mt-2 text-[11px] text-slate-600 flex justify-between">
              <span>พยาบาลวิชาชีพขึ้นเวร:</span>
              <span className="font-mono font-bold text-teal-800">
                RN {roster.shifts.morning.onDutyStaff.rn} คน
              </span>
            </div>
          </div>

          {/* Shift Afternoon Card */}
          <div
            onClick={() => handleActiveShiftChange('afternoon')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeShiftKey === 'afternoon'
                ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">2. เวรบ่าย (16:00 - 24:00)</span>
              <span className="text-[10px] text-sky-800 font-bold bg-sky-100 px-1.5 py-0.5 rounded">
                น้ำหนักงาน 35%
              </span>
            </div>
            <label className="text-[11px] text-slate-500 block mb-1">
              จำนวนผู้ป่วยในเวร (คน):
            </label>
            <input
              type="number"
              min="0"
              value={roster.shifts.afternoon.census}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleShiftTotalCensusChange('afternoon', Number(e.target.value))}
              className="w-full text-lg font-bold font-mono p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
            <div className="mt-2 text-[11px] text-slate-600 flex justify-between">
              <span>พยาบาลวิชาชีพขึ้นเวร:</span>
              <span className="font-mono font-bold text-teal-800">
                RN {roster.shifts.afternoon.onDutyStaff.rn} คน
              </span>
            </div>
          </div>

          {/* Shift Night Card */}
          <div
            onClick={() => handleActiveShiftChange('night')}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              activeShiftKey === 'night'
                ? 'border-teal-500 bg-teal-50/40 ring-1 ring-teal-500'
                : 'border-slate-200 bg-slate-50 hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900">3. เวรดึก (24:00 - 08:00)</span>
              <span className="text-[10px] text-purple-800 font-bold bg-purple-100 px-1.5 py-0.5 rounded">
                น้ำหนักงาน 20%
              </span>
            </div>
            <label className="text-[11px] text-slate-500 block mb-1">
              จำนวนผู้ป่วยในเวร (คน):
            </label>
            <input
              type="number"
              min="0"
              value={roster.shifts.night.census}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => handleShiftTotalCensusChange('night', Number(e.target.value))}
              className="w-full text-lg font-bold font-mono p-2 border border-slate-300 rounded-lg bg-white text-slate-900"
            />
            <div className="mt-2 text-[11px] text-slate-600 flex justify-between">
              <span>พยาบาลวิชาชีพขึ้นเวร:</span>
              <span className="font-mono font-bold text-teal-800">
                RN {roster.shifts.night.onDutyStaff.rn} คน
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. WORKLOAD CALCULATION WORKFLOW (ขั้นตอนที่ 1, ขั้นตอนที่ 2 & อัตรากำลัง RN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Step 1, Step 2 & Staffing */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: คำนวณค่างานการพยาบาลโดยตรง (Direct Care) */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-bold">
                    ขั้นตอนที่ 1
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    คำนวณค่างานการพยาบาลโดยตรง (Direct Care)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  จำแนกประเภทผู้ป่วยตามความต้องการการพยาบาลใน <strong className="text-teal-800">เวร{activeShiftKey === 'morning' ? 'เช้า' : activeShiftKey === 'afternoon' ? 'บ่าย' : 'ดึก'}</strong>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">ค่างาน Direct Care</span>
                <span className="text-lg font-bold text-teal-800 font-mono">
                  {result.directCareHours} ชม.
                </span>
              </div>
            </div>

            <div className="space-y-2.5">
              {([1, 2, 3, 4, 5] as PatientAcuityType[]).map((acuity) => {
                const info = ACUITY_STANDARDS[acuity];
                const count = activeShiftData.censusByAcuity[acuity] || 0;

                return (
                  <div
                    key={acuity}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: info.colorCode }}
                          />
                          <span className="text-xs font-bold text-slate-900">{info.label}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            ({info.standardHoursPerDay} ชม./วัน)
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug line-clamp-1">
                          {info.description}
                        </p>
                      </div>

                      {/* Stepper Controls */}
                      <div className="flex items-center space-x-2 self-end sm:self-auto shrink-0">
                        <button
                          onClick={() => handleAcuityChange(acuity, -1)}
                          disabled={count <= 0}
                          className="w-7 h-7 rounded-md bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-30 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono font-bold text-sm text-slate-900">
                          {count}
                        </span>
                        <button
                          onClick={() => handleAcuityChange(acuity, 1)}
                          className="w-7 h-7 rounded-md bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: คำนวณค่างานภารกิจอื่น (Indirect Care & Unit-Related) - 2 selectable methods */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border-2 border-teal-600/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-teal-800 text-white rounded text-[10px] font-bold tracking-wide">
                    ขั้นตอนที่ 2
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    คำนวณค่างานภารกิจอื่น (Indirect Care & Unit-Related)
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  เลือกวิธีคำนวณค่างานภารกิจอื่นตามลักษณะงาน (2 วิธีมาตรฐาน):
                </p>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">เวลาภารกิจอื่นในเวร</span>
                <span className="text-base font-black text-teal-800 font-mono">
                  +{calculatedIndirectHours} ชม.
                </span>
              </div>
            </div>

            {/* 2 Method Switcher Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Method 1 Option */}
              <div
                onClick={() => handleIndirectMethodChange('fixed_hours')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  indirectConfig.method === 'fixed_hours'
                    ? 'border-teal-700 bg-teal-50/70 ring-2 ring-teal-700/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-700" />
                    <span>วิธีที่ 1: คิดเป็นเวลาคงที่ (Fixed Hours)</span>
                  </span>
                  {indirectConfig.method === 'fixed_hours' ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  เหมาะกับงานที่รู้เวลาแน่นอน เช่น การรับ-ส่งเวร, ตรวจนับยา, Morning Brief และตรวจเช็คอุปกรณ์
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-semibold">เวลาคงที่กำหนด:</span>
                  <span className="font-mono font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                    {indirectConfig.fixedHours} ชม./เวร
                  </span>
                </div>
              </div>

              {/* Method 2 Option */}
              <div
                onClick={() => handleIndirectMethodChange('allowance_percentage')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  indirectConfig.method === 'allowance_percentage'
                    ? 'border-teal-700 bg-teal-50/70 ring-2 ring-teal-700/20 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5 text-teal-700" />
                    <span>วิธีที่ 2: คิดเป็นเปอร์เซ็นต์บวกเพิ่ม (Allowance %)</span>
                  </span>
                  {indirectConfig.method === 'allowance_percentage' ? (
                    <CheckCircle2 className="w-4 h-4 text-teal-700" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-slate-300 inline-block" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  เหมาะกับงานธุรการทั่วไปที่ผันแปรตามจำนวนผู้ป่วย โดยมาตรฐานบวกเพิ่ม 15% - 25% ของเวลา Direct Care
                </p>
                <div className="mt-2.5 flex items-center justify-between text-[11px]">
                  <span className="text-slate-600 font-semibold">สัดส่วนบวกเพิ่ม:</span>
                  <span className="font-mono font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                    +{indirectConfig.allowancePercent}% (+{((result.directCareHours * indirectConfig.allowancePercent) / 100).toFixed(1)} ชม.)
                  </span>
                </div>
              </div>
            </div>

            {/* METHOD 1 DETAILED CONTROLS: JOB VALUATION TABLE SELECTION & PRESETS */}
            {indirectConfig.method === 'fixed_hours' && (
              <div className="p-4 sm:p-5 bg-teal-50/40 rounded-xl border border-teal-200 space-y-4">
                {/* Mode Selector Tabs inside Method 1 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-teal-200/60 gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                      <FileSpreadsheet className="w-4 h-4 text-teal-700" />
                      <span>วิธีที่ 1: คิดเป็นเวลาคงที่ (Fixed Hours) & เลือกกิจกรรมตามตารางค่างาน</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      เลือกกิจกรรมจากตารางจำแนกค่างานและเวลามาตรฐาน (Job Valuation Table) หรือกำหนดเวลาคงที่รวดเร็ว
                    </p>
                  </div>

                  {/* Mode Buttons */}
                  <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-teal-200 self-start sm:self-auto shrink-0 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setFixedMode('job_table')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                        fixedMode === 'job_table'
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>เลือกจากตารางค่างานมาตรฐาน</span>
                      {totalSelectedActivitiesCount > 0 && (
                        <span className="ml-1 px-1.5 py-0.2 bg-teal-900 text-white text-[10px] rounded-full font-mono">
                          {totalSelectedActivitiesCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setFixedMode('presets')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                        fixedMode === 'presets'
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Preset เวลาคงที่ด่วน</span>
                    </button>
                  </div>
                </div>

                {/* Sub-View A: Job Valuation Table Selection (ตารางจำแนกค่างานและเวลามาตรฐาน) */}
                {fixedMode === 'job_table' && (
                  <div className="space-y-3.5">
                    {/* Filter bar, search & actions */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                      {/* Category Pill Filters */}
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[11px] font-semibold text-slate-500 mr-1 hidden sm:inline">หมวด:</span>
                        <button
                          type="button"
                          onClick={() => setActivityCategoryFilter('all')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            activityCategoryFilter === 'all'
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          ทั้งหมด ({activities.filter((a) => a.category === 'indirect' || a.category === 'unit_related').length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityCategoryFilter('indirect')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            activityCategoryFilter === 'indirect'
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          การพยาบาลโดยอ้อม (IND)
                        </button>
                        <button
                          type="button"
                          onClick={() => setActivityCategoryFilter('unit_related')}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-colors cursor-pointer ${
                            activityCategoryFilter === 'unit_related'
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          บริหารหน่วยงาน (UNT)
                        </button>
                      </div>

                      {/* Search box & Preset helper buttons */}
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:w-48">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="ค้นหากิจกรรม / รหัส..."
                            value={activitySearchQuery}
                            onChange={(e) => setActivitySearchQuery(e.target.value)}
                            className="w-full pl-8 pr-7 py-1 text-xs border border-slate-300 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-teal-600"
                          />
                          {activitySearchQuery && (
                            <button
                              type="button"
                              onClick={() => setActivitySearchQuery('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleSelectPresetRoutine}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-white text-teal-800 border border-teal-300 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="เลือกกิจกรรมหลักประจำเวรให้อัตโนมัติ"
                        >
                          <Sparkles className="w-3 h-3 text-teal-700" />
                          <span>รูทีนประจำเวร</span>
                        </button>

                        {totalSelectedActivitiesCount > 0 && (
                          <button
                            type="button"
                            onClick={handleClearActivitySelections}
                            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="ล้างที่เลือกทั้งหมด"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>ล้าง</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Activity Cards List from Job Valuation Table */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                      {filteredActivities.map((act) => {
                        const count = selectedActivityCounts[act.id] || 0;
                        const isSelected = count > 0;
                        const subtotalMins = count * act.standardMinutes;

                        return (
                          <div
                            key={act.id}
                            className={`p-3 rounded-xl border text-xs transition-all ${
                              isSelected
                                ? 'bg-white border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                                : 'bg-white/80 border-slate-200 hover:border-teal-300 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                                      act.category === 'indirect'
                                        ? 'bg-sky-100 text-sky-800'
                                        : 'bg-purple-100 text-purple-800'
                                    }`}
                                  >
                                    {act.code}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-semibold">
                                    {act.category === 'indirect' ? 'ภารกิจโดยอ้อม' : 'บริหารหน่วยงาน'}
                                  </span>
                                  <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                                    {act.standardMinutes} นาที/{act.frequencyUnit || 'ครั้ง'}
                                  </span>
                                </div>
                                <h5 className="font-bold text-slate-900 text-xs leading-snug line-clamp-2">
                                  {act.titleTh}
                                </h5>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                  {act.descriptionTh}
                                </p>
                              </div>

                              {/* Stepper Controls */}
                              <div className="flex flex-col items-end shrink-0 pl-1">
                                <div className="flex items-center space-x-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                                  <button
                                    type="button"
                                    onClick={() => handleActivityCountChange(act.id, -1)}
                                    disabled={count <= 0}
                                    className="w-6 h-6 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-30 cursor-pointer shadow-2xs"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span
                                    className={`w-7 text-center font-mono font-bold text-xs ${
                                      count > 0 ? 'text-teal-900' : 'text-slate-400'
                                    }`}
                                  >
                                    {count}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleActivityCountChange(act.id, 1)}
                                    className="w-6 h-6 rounded bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 cursor-pointer shadow-2xs"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                {count > 0 && (
                                  <span className="text-[10px] font-mono font-bold text-teal-800 mt-1">
                                    ={subtotalMins} นาที
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {filteredActivities.length === 0 && (
                      <div className="p-6 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300 text-xs">
                        ไม่พบกิจกรรมที่ตรงกับคำค้นหา "{activitySearchQuery}"
                      </div>
                    )}

                    {/* Summary Bar for Selected Activities */}
                    <div className="p-3 bg-white rounded-xl border border-teal-300 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-900">
                            กิจกรรมที่เลือกจากตารางค่างานมาตรฐาน:
                          </span>{' '}
                          <span className="text-teal-900 font-bold">
                            {totalSelectedActivitiesCount} รายการ ({totalSelectedMinutes} นาที)
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 mr-2">เวลาค่างานรวม:</span>
                        <span className="text-sm font-black font-mono text-teal-900 bg-teal-100/70 px-2 py-0.5 rounded border border-teal-200">
                          {indirectConfig.fixedHours} ชม./เวร
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-View B: Quick Fixed Hours Presets */}
                {fixedMode === 'presets' && (
                  <div className="space-y-3.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white p-3 rounded-xl border border-teal-200">
                      <div>
                        <span className="text-xs font-bold text-slate-800 block">
                          เลือกหรือพิมพ์เวลาคงที่ประจำเวร (Quick Preset):
                        </span>
                        <span className="text-[11px] text-slate-500">
                          กำหนดเวลาเฉลี่ยตายตัวสำหรับภารกิจอื่นโดยรวม
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        {[1.5, 2.0, 2.5, 3.0].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => handleFixedHoursChange(h)}
                            className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                              indirectConfig.fixedHours === h
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                            }`}
                          >
                            {h} ชม.
                          </button>
                        ))}
                        <div className="flex items-center pl-1">
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="8"
                            value={indirectConfig.fixedHours}
                            onChange={(e) => handleFixedHoursChange(Number(e.target.value))}
                            className="w-16 px-2 py-1 text-xs font-bold font-mono border border-slate-300 rounded-lg bg-white text-right"
                          />
                          <span className="text-xs text-slate-500 ml-1">ชม.</span>
                        </div>
                      </div>
                    </div>

                    {/* Checklist of Fixed Tasks */}
                    <div className="space-y-2 pt-1">
                      <span className="text-[11px] font-bold text-slate-700 block">
                        รายการงานประจำเวรที่มีเวลาแน่นอน (คลิกเพื่อเปิด/ปิด):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(indirectConfig.fixedItems || []).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleToggleFixedItem(item.id)}
                            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                              item.enabled
                                ? 'bg-white border-teal-400 text-teal-950 shadow-2xs'
                                : 'bg-slate-100/60 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              {item.enabled ? (
                                <CheckSquare className="w-4 h-4 text-teal-700 shrink-0" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                              )}
                              <span
                                className={`truncate text-[11px] font-semibold ${
                                  item.enabled ? 'text-slate-800' : 'text-slate-400'
                                }`}
                              >
                                {item.title}
                              </span>
                            </div>
                            <span className="font-mono text-[11px] font-bold shrink-0">
                              {item.minutes} นาที
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Summary bar for Method 1 */}
                    <div className="p-2.5 bg-white rounded-lg border border-teal-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-semibold">
                        รวมเวลาภารกิจอื่นคงที่ในเวรนี้:
                      </span>
                      <span className="font-mono font-black text-teal-800">
                        {indirectConfig.fixedHours} ชม. ({(indirectConfig.fixedHours * 60).toFixed(0)} นาที)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* METHOD 2 DETAILED CONTROLS */}
            {indirectConfig.method === 'allowance_percentage' && (
              <div className="p-4 bg-teal-50/30 rounded-xl border border-teal-200 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                      <span>กำหนดเปอร์เซ็นต์บวกเพิ่ม (Allowance Percentage)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ตามมาตรฐานกองการพยาบาล สธ. กำหนดบวกเพิ่ม 15% - 25% ของเวลา Direct Care
                    </p>
                  </div>

                  {/* Standard Presets */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    {[15, 20, 25].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => handleAllowancePercentChange(pct)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                          indirectConfig.allowancePercent === pct
                            ? 'bg-teal-700 text-white border-teal-700'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {pct}% {pct === 20 && '(มาตรฐาน)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slider and input */}
                <div className="space-y-2 pt-2 border-t border-teal-200/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-semibold">ปรับเปอร์เซ็นต์บวกเพิ่ม:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={indirectConfig.allowancePercent}
                        onChange={(e) => handleAllowancePercentChange(Number(e.target.value))}
                        className="w-16 px-2 py-1 text-xs font-bold font-mono border border-slate-300 rounded-lg bg-white text-right"
                      />
                      <span className="font-bold text-slate-700">%</span>
                    </div>
                  </div>

                  <input
                    type="range"
                    min="10"
                    max="35"
                    step="1"
                    value={indirectConfig.allowancePercent}
                    onChange={(e) => handleAllowancePercentChange(Number(e.target.value))}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>10% (ขั้นต่ำ)</span>
                    <span className="text-teal-800 font-bold">15% - 25% (ช่วงมาตรฐาน สธ.)</span>
                    <span>35% (สูงสุด)</span>
                  </div>
                </div>

                {/* Live Formula Display */}
                <div className="p-3 bg-white rounded-lg border border-teal-200 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>สูตรคำนวณค่างานภารกิจอื่น:</span>
                    <span className="font-mono text-slate-500">
                      เวลา Direct Care × {indirectConfig.allowancePercent}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono font-bold text-teal-900 pt-1 border-t border-slate-100">
                    <span>การคำนวณสด:</span>
                    <span>
                      {result.directCareHours} ชม. × {indirectConfig.allowancePercent}% = +{((result.directCareHours * indirectConfig.allowancePercent) / 100).toFixed(2)} ชม.
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 3: อัตรากำลังพยาบาลวิชาชีพที่ขึ้นปฏิบัติการจริง (RN Staffing) */}
          <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-[10px] font-bold">
                    ขั้นตอนที่ 3
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">
                    อัตรากำลังพยาบาลวิชาชีพที่ขึ้นปฏิบัติการจริง (RN Staffing)
                  </h3>
                </div>
                <span className="text-xs text-slate-500 mt-0.5 block">
                  พยาบาลวิชาชีพ (RN) ที่ขึ้นปฏิบัติการจริงในเวร{activeShiftKey === 'morning' ? 'เช้า' : activeShiftKey === 'afternoon' ? 'บ่าย' : 'ดึก'} (คิดภาระงาน 8 ชม./คน)
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">รวมพยาบาลวิชาชีพในเวร</span>
                <span className="text-lg font-bold text-teal-800 font-mono">
                  {activeShiftData.onDutyStaff.rn} อัตรา
                </span>
              </div>
            </div>

            {/* RN Stepper Card Only */}
            <div className="p-4 rounded-xl border border-teal-300 bg-teal-50/40">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-teal-950">
                    พยาบาลวิชาชีพ (RN: Registered Nurse)
                  </span>
                  <span className="text-[10px] text-teal-800 font-bold bg-teal-100 border border-teal-200 px-2 py-0.5 rounded-full">
                    วิชาชีพหลักขึ้นปฏิบัติการจริง
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-teal-800">
                  รวม {activeShiftData.onDutyStaff.rn * 8} ชม. ปฏิบัติการ
                </span>
              </div>

              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                การให้ยาฉีดและสารน้ำ, หัตถการวิกฤต, ประเมิน Early Warning Score (EWS), บันทึก Focus Charting, และการรับ-ส่งเวร
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-teal-200/60">
                <span className="text-xs font-bold text-slate-700">
                  จำนวนพยาบาลวิชาชีพที่ขึ้นเวร{activeShiftKey === 'morning' ? 'เช้า' : activeShiftKey === 'afternoon' ? 'บ่าย' : 'ดึก'}:
                </span>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleStaffChange(-1)}
                    disabled={activeShiftData.onDutyStaff.rn <= 0}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 disabled:opacity-30 shadow-2xs cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-black text-xl text-teal-950 w-12 text-center">
                    {activeShiftData.onDutyStaff.rn}
                  </span>
                  <button
                    onClick={() => handleStaffChange(1)}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold text-slate-600">คน</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Productivity Calculations & Workload Structure Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Productivity Result Card */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                ผลลัพธ์ผลิตภาพ (Productivity)
              </span>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  result.status === 'Optimal'
                    ? 'bg-emerald-100 text-emerald-800'
                    : result.status === 'Strained'
                    ? 'bg-amber-100 text-amber-800'
                    : result.status === 'Critical_Overwork'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {result.status === 'Optimal'
                  ? 'สมดุลเหมาะสม (80-100%)'
                  : result.status === 'Strained'
                  ? 'ภาระงานตึงตัว (101-109%)'
                  : result.status === 'Critical_Overwork'
                  ? 'เกินกำลังวิกฤต (>110%)'
                  : 'ภาระงานต่ำ (<80%)'}
              </span>
            </div>

            <div className="text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-4xl font-black font-mono text-slate-900 tracking-tight">
                {result.productivityPercent}%
              </div>
              <p className="text-xs text-slate-500 mt-1">
                เปรียบเทียบภาระงานสุทธิ ({result.totalWorkloadHours} ชม.) กับกำลัง RN ที่ปฏิบัติการ ({result.totalPaidStaffHours} ชม.)
              </p>
            </div>

            {/* Workload Structure Breakdown (ขั้นตอนที่ 1 + ขั้นตอนที่ 2) */}
            <div className="p-3.5 bg-teal-50/40 rounded-xl border border-teal-200 space-y-2 text-xs">
              <span className="text-xs font-bold text-teal-950 block">
                โครงสร้างค่างานรวม (Workload Composition):
              </span>

              <div className="flex justify-between py-1 border-b border-teal-200/50">
                <span className="text-slate-600">1. การพยาบาลโดยตรง (Direct Care):</span>
                <span className="font-mono font-bold text-slate-900">
                  {result.directCareHours} ชม.
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-teal-200/50">
                <span className="text-slate-600 flex flex-col">
                  <span>2. ภารกิจอื่น (Indirect & Unit Care):</span>
                  <span className="text-[10px] text-teal-700 font-normal">
                    {result.indirectCalculationSummary?.methodLabel}
                  </span>
                </span>
                <span className="font-mono font-bold text-teal-800 self-end">
                  +{calculatedIndirectHours} ชม.
                </span>
              </div>

              <div className="flex justify-between py-1.5 pt-2 border-t border-teal-300 font-bold">
                <span className="text-teal-950">รวมภาระงานที่ต้องปฏิบัติ:</span>
                <span className="font-mono font-black text-teal-950 text-sm">
                  {result.totalWorkloadHours} ชม.
                </span>
              </div>
            </div>

            {/* Metrics Checklist */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">NHPPD จริง (ชม./คน/24ชม.):</span>
                <span className="font-mono font-bold text-teal-800">
                  {result.nhppdActual} <span className="text-slate-400">(เป้าหมาย {result.nhppdTarget})</span>
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">อัตราส่วนพยาบาล : ผู้ป่วย:</span>
                <span className="font-mono font-bold">
                  1 :{' '}
                  {result.totalCensus > 0 && result.staffOnDutySummary.rn > 0
                    ? (result.totalCensus / result.staffOnDutySummary.rn).toFixed(1)
                    : 0}{' '}
                  ราย (ต่อ RN)
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">อัตรากำลังพยาบาลวิชาชีพปฏิบัติการจริง (RN):</span>
                <span className="font-mono font-bold text-teal-900">
                  RN {result.staffOnDutySummary.rn} คน (100% พยาบาลวิชาชีพ)
                </span>
              </div>
            </div>

            {/* Immediate Actionable Advice */}
            <div
              className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                result.productivityPercent > 105
                  ? 'border-red-200 bg-red-50 text-red-900'
                  : result.productivityPercent >= 85
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-sky-200 bg-sky-50 text-sky-900'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {result.productivityPercent > 105 ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                )}
                <span>ข้อเสนอแนะในการจัดสรรอัตรากำลังทันที:</span>
              </div>
              <p>
                {result.productivityPercent > 105
                  ? 'ภาระงานเกินเกณฑ์มาตรฐาน แนะนำพิจารณาเรียกพยาบาลเสริม (On-call) หรือกระจายเคสประเภท 1-2 เพื่อความปลอดภัยของผู้ป่วย'
                  : result.productivityPercent >= 85
                  ? 'อัตรากำลังพยาบาลวิชาชีพสอดคล้องกับภาระงานตามเกณฑ์มาตรฐานสากล NHPPD ของโรงพยาบาลสังขละบุรี'
                  : 'ภาระงานอยู่ในเกณฑ์ต่ำ สามารถจัดสรรเวลาสำหรับการพัฒนาคุณภาพบริการพยาบาล งานวิจัย หรือการส่งต่อผู้ป่วย'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
