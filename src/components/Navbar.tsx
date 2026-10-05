import React from 'react';
import {
  Building2,
  Users,
  Clock,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
  ChevronDown,
  RotateCcw,
  LogOut,
  UserCog,
  Calendar
} from 'lucide-react';
import { UserProfile, DepartmentId, ReportTimeframe } from '../types/nursing';
import { DEPARTMENTS, SANGKHLABURI_HOSPITAL_META } from '../data/mockNursingData';

interface NavbarProps {
  currentUser: UserProfile;
  onOpenRoleModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  selectedDeptId: DepartmentId;
  onSelectDept: (deptId: DepartmentId) => void;
  timeframe: ReportTimeframe;
  onSelectTimeframe: (tf: ReportTimeframe) => void;
  onOpenReportModal: () => void;
  onResetData: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onOpenRoleModal,
  activeTab,
  onSelectTab,
  selectedDeptId,
  onSelectDept,
  timeframe,
  onSelectTimeframe,
  onOpenReportModal,
  onResetData,
  onLogout,
}) => {
  const currentDept = DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];

  const navItems = [
    { id: 'executive', label: 'ภาพรวมผู้บริหาร', icon: Building2 },
    { id: 'calculator', label: 'คำนวณค่างาน & เวร', icon: Clock },
    { id: 'job_valuation', label: 'จำแนกค่างานมาตรฐาน', icon: FileSpreadsheet },
    { id: 'optimizer', label: 'จัดสรรอัตรากำลัง & Skill Mix', icon: Users },
    { id: 'lean_safety', label: 'กลยุทธ์ LEAN & ความปลอดภัย', icon: ShieldCheck },
    { id: 'users', label: 'จัดการผู้ใช้งาน', icon: UserCog },
  ];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'director':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'head_nurse':
        return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'staff_nurse':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'auditor_hr':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Official Logo + Hospital & System Name */}
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-lg bg-white border border-slate-200 p-0.5 shadow-xs flex items-center justify-center shrink-0">
              <img
                src={SANGKHLABURI_HOSPITAL_META.logoUrl}
                alt="ตราสัญลักษณ์โรงพยาบาลสังขละบุรี"
                className="w-full h-full object-contain rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-tight">
                  ระบบวิเคราะห์ค่างานพยาบาล โรงพยาบาลสังขละบุรี Productivity
                </span>
              </div>
              <p className="text-xs text-teal-800 font-medium hidden sm:block">
                {SANGKHLABURI_HOSPITAL_META.nameTh} · {SANGKHLABURI_HOSPITAL_META.province}
              </p>
            </div>
          </div>

          {/* Zone 2: Department Context & Timeframe (Daily/Monthly/Yearly) */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Department Select */}
            <div className="flex items-center space-x-1.5">
              <label htmlFor="nav-dept-select" className="text-xs font-semibold text-slate-500">
                แผนก:
              </label>
              <select
                id="nav-dept-select"
                value={selectedDeptId}
                onChange={(e) => onSelectDept(e.target.value as DepartmentId)}
                aria-label="เลือกแผนกคำนวณ"
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-md py-1.5 pl-2.5 pr-7 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Selector (Daily / Monthly / Yearly) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onSelectTimeframe('daily')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  timeframe === 'daily'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายวัน
              </button>
              <button
                type="button"
                onClick={() => onSelectTimeframe('monthly')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  timeframe === 'monthly'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายเดือน
              </button>
              <button
                type="button"
                onClick={() => onSelectTimeframe('yearly')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                  timeframe === 'yearly'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายปี
              </button>
            </div>
          </div>

          {/* Zone 3: Action Buttons & Active Profile */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onResetData}
              title="รีเซ็ตข้อมูลจำลอง"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenReportModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-md hover:bg-teal-100 transition-colors shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 text-teal-700" />
              <span>พิมพ์รายงาน 4 เสาหลัก</span>
            </button>

            {/* User Info & Logout Button */}
            <button
              onClick={onOpenRoleModal}
              className={`flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium border rounded-md transition-all hover:shadow-xs ${getRoleBadgeColor(
                currentUser.role
              )}`}
              title="ข้อมูลผู้ใช้งานและออกจากระบบ (User Profile & Log Out)"
            >
              <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <div className="text-left">
                <span className="font-bold block leading-tight">{currentUser.name}</span>
                <span className="text-[10px] opacity-80 block truncate max-w-[130px]">
                  {currentUser.roleTitle}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              title="ออกจากระบบ (Logout)"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs & Mobile Timeframe Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 py-1.5 gap-2">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-200' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Mobile Timeframe Indicator */}
          <div className="flex lg:hidden items-center justify-between pt-1 border-t border-slate-100 sm:border-0 sm:pt-0">
            <span className="text-[11px] text-slate-500 font-medium">รอบการวิเคราะห์:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-md">
              <button
                onClick={() => onSelectTimeframe('daily')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  timeframe === 'daily' ? 'bg-teal-700 text-white' : 'text-slate-600'
                }`}
              >
                รายวัน
              </button>
              <button
                onClick={() => onSelectTimeframe('monthly')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  timeframe === 'monthly' ? 'bg-teal-700 text-white' : 'text-slate-600'
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => onSelectTimeframe('yearly')}
                className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                  timeframe === 'yearly' ? 'bg-teal-700 text-white' : 'text-slate-600'
                }`}
              >
                รายปี
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
