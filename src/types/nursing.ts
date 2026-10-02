export type UserRole = 'director' | 'head_nurse' | 'staff_nurse' | 'auditor_hr';

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  roleTitle: string;
  roleLevel: 1 | 2 | 3 | 4;
  departmentId: DepartmentId | 'all';
  departmentName: string;
  licenseNo: string;
  pin: string;
  avatarUrl?: string;
  createdAt?: string;
}

export type DepartmentId = 'er' | 'ipd1' | 'ipd2' | 'opd' | 'lr';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  nameEn: string;
  bedCapacity: number;
  currentCensus: number;
  currentStaffCount: {
    rn: number; // พยาบาลวิชาชีพ
    na: number; // ปรับเป็น 0 (นับเฉพาะ RN)
  };
  targetNHPPD: number;
  description: string;
  leadNurseName: string;
  complexityLevel: 'Moderate' | 'High' | 'Critical';
}

export type PatientAcuityType = 1 | 2 | 3 | 4 | 5;

export interface AcuityClassification {
  type: PatientAcuityType;
  label: string;
  description: string;
  standardHoursPerDay: number;
  recommendedNurseRatio: string;
  colorCode: string;
}

export type ActivityCategory = 'direct' | 'indirect' | 'unit_related';
export type ComplexityLevel = 'Low' | 'Moderate' | 'High' | 'Critical';
export type SkillRequirement = 'RN_ONLY' | 'RN_GENERAL' | 'ALL_STAFF_NA';
export type LeanClassification = 'VALUE_ADDED' | 'REQUIRED_NON_VALUE' | 'WASTE_CANDIDATE';

export interface NursingActivity {
  id: string;
  code: string;
  category: ActivityCategory;
  titleTh: string;
  titleEn: string;
  standardMinutes: number;
  frequencyUnit: string;
  complexity: ComplexityLevel;
  skillReq: SkillRequirement;
  leanClass: LeanClassification;
  departmentApplicable: DepartmentId[] | 'ALL';
  descriptionTh: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'night';
export type ReportTimeframe = 'daily' | 'monthly' | 'yearly';

export interface ShiftEntry {
  census: number;
  censusByAcuity: Record<PatientAcuityType, number>;
  onDutyStaff: {
    rn: number; // พยาบาลวิชาชีพ
    na: number; // ปรับเป็น 0
  };
  notes?: string;
}

export type IndirectCalculationMethod = 'fixed_hours' | 'allowance_percentage';

export interface IndirectWorkloadConfig {
  method: IndirectCalculationMethod;
  fixedHours: number; // e.g. 1.5 - 2.5 hours per shift for known tasks
  allowancePercent: number; // e.g. 20 (standard 15% - 25% of Direct Care)
  selectedActivityCounts?: Record<string, number>; // activityId -> actual count from Job Valuation Table
  fixedItems?: {
    id: string;
    title: string;
    minutes: number;
    enabled: boolean;
  }[];
}

export interface ShiftRosterData {
  shiftId: string;
  departmentId: DepartmentId;
  date: string;
  activeShift: ShiftType;
  shifts: {
    morning: ShiftEntry;
    afternoon: ShiftEntry;
    night: ShiftEntry;
  };
  completedActivities: {
    activityId: string;
    actualCount: number;
  }[];
  indirectConfig?: IndirectWorkloadConfig;
}

export interface ProductivityCalculationResult {
  departmentId: DepartmentId;
  shiftType?: ShiftType | 'combined_24h';
  timeframe: ReportTimeframe;
  totalCensus: number;
  totalWorkloadMinutes: number;
  totalWorkloadHours: number;
  directCareHours: number;
  indirectCareHours: number;
  unitRelatedHours: number;
  totalPaidStaffHours: number;
  productivityPercent: number;
  nhppdActual: number;
  nhppdTarget: number;
  nhppdVariance: number;
  status: 'Underutilized' | 'Optimal' | 'Strained' | 'Critical_Overwork';
  fteRequired: number;
  fteActual: number;
  fteGap: number;
  staffOnDutySummary: {
    rn: number;
    na: number;
    total: number;
  };
  skillMixActual: {
    rnPercent: number; // พยาบาลวิชาชีพ
    naPercent: number;
  };
  skillMixTarget: {
    rnPercent: number;
    naPercent: number;
  };
  fatigueRiskScore: number;
  safeStaffingMet: boolean;
  timeframeData?: {
    totalPatientsPeriod: number;
    totalEarnedHoursPeriod: number;
    avgDailyCensus: number;
    peakShiftProductivity: number;
    lowestShiftProductivity: number;
    periodLabel: string;
  };
  indirectConfigUsed?: IndirectWorkloadConfig;
  indirectCalculationSummary?: {
    method: IndirectCalculationMethod;
    methodLabel: string;
    directCareHours: number;
    indirectAndUnitHours: number;
    allowancePercentUsed?: number;
    fixedHoursUsed?: number;
  };
}

export interface FourPillarReport {
  generatedAt: string;
  reportTitle: string;
  hospitalName: string;
  targetDepartment: string;
  timeframe: ReportTimeframe;
  periodLabel: string;
  authorName: string;
  authorRole: string;
  executiveSummary: string;
  jobValuationSummary: {
    totalActivities: number;
    directSharePercent: number;
    indirectSharePercent: number;
    unitRelatedSharePercent: number;
    highRiskProportionPercent: number;
  };
  productivityMetrics: ProductivityCalculationResult;
  strategicRecommendations: {
    leanOpportunities: string[];
    burnoutPreventionActions: string[];
    patientSafetyControls: string[];
  };
}
