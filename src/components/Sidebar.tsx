import React from 'react';
import {
  Building2,
  Users,
  Clock,
  FileSpreadsheet,
  ShieldCheck,
  FileText,
  UserCog,
  LogOut,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Calendar,
  UploadCloud
} from 'lucide-react';
import { HospitalLogo } from './HospitalLogo';
import { UserProfile, DepartmentId, ReportTimeframe } from '../types/nursing';
import { SANGKHLABURI_HOSPITAL_META } from '../data/mockNursingData';

interface SidebarProps {
  currentUser: UserProfile;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  timeframe: ReportTimeframe;
  onSelectTimeframe: (tf: ReportTimeframe) => void;
  onOpenRoleModal: () => void;
  onOpenReportModal: () => void;
  onResetData: () => void;
  onLogout: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  timeframe,
  onSelectTimeframe,
  onOpenRoleModal,
  onOpenReportModal,
  onResetData,
  onLogout,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'executive', label: 'ภาพรวมผู้บริหาร', icon: Building2 },
    { id: 'calculator', label: 'คำนวณค่างาน & เวร', icon: Clock },
    { id: 'job_valuation', label: 'จำแนกค่างานมาตรฐาน', icon: FileSpreadsheet },
    { id: 'optimizer', label: 'จัดสรรอัตรากำลังพยาบาลวิชาชีพ', icon: Users },
    { id: 'files', label: 'คลังเอกสาร & ซิงค์ไฟล์', icon: UploadCloud },
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

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-68 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } no-print`}
      >
        {/* Top: Logo & System Brand */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <HospitalLogo size="md" className="shrink-0" />
            <div className="overflow-hidden">
              <span className="text-[11px] font-bold text-teal-800 uppercase tracking-wider block">
                {SANGKHLABURI_HOSPITAL_META.nameTh}
              </span>
              <h1 className="text-xs font-black text-slate-900 tracking-tight leading-tight line-clamp-2 mt-0.5">
                Productivity
              </h1>
              <span className="text-[10px] text-slate-500 block truncate">
                วิเคราะห์ค่างานการพยาบาล
              </span>
            </div>
          </div>
        </div>

        {/* Middle: Navigation Links & Timeframe Switcher */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Timeframe Selector Pill */}
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-teal-700" />
                <span>รอบการวิเคราะห์</span>
              </span>
              <span className="text-[10px] text-teal-800 font-mono font-semibold">
                {timeframe === 'yearly' ? 'รายปี' : timeframe === 'monthly' ? 'รายเดือน' : 'รายวัน'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => onSelectTimeframe('daily')}
                className={`py-1 text-[11px] font-bold rounded transition-colors text-center ${
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
                className={`py-1 text-[11px] font-bold rounded transition-colors text-center ${
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
                className={`py-1 text-[11px] font-bold rounded transition-colors text-center ${
                  timeframe === 'yearly'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายปี
              </button>
            </div>
          </div>

          {/* Primary Navigation Items */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-1">
              เมนูหลัก
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-200' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-200" />}
                </button>
              );
            })}
          </div>

          {/* Printable Report Action */}
          <div className="pt-2">
            <button
              onClick={() => {
                onOpenReportModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-lg text-xs font-bold transition-colors shadow-2xs"
            >
              <FileText className="w-4 h-4 text-teal-700" />
              <span>พิมพ์รายงาน 4 เสาหลัก</span>
            </button>
          </div>
        </div>

        {/* Bottom: Profile & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
          {/* Active User Card: Click to open Session & Logout window */}
          <button
            onClick={() => {
              onOpenRoleModal();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-colors text-left flex items-center justify-between shadow-2xs group cursor-pointer"
            title="คลิกเพื่อดูข้อมูลผู้ใช้งานและออกจากระบบ"
          >
            <div className="overflow-hidden pr-2">
              <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
              <span className={`inline-block text-[10px] font-medium px-1.5 py-0.2 rounded border mt-0.5 ${getRoleBadgeColor(currentUser.role)}`}>
                {currentUser.roleTitle}
              </span>
            </div>
            <span className="text-[10px] text-teal-700 font-bold group-hover:underline shrink-0">
              ข้อมูล
            </span>
          </button>

          {/* Quick Actions Row */}
          <div className="flex items-center justify-between pt-1 text-xs">
            <button
              onClick={onResetData}
              title="รีเซ็ตตารางเวรเป็นค่าเริ่มต้น"
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>รีเซ็ตเวร</span>
            </button>

            <button
              onClick={onLogout}
              title="ออกจากระบบ (Log Out)"
              className="p-1.5 text-red-600 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-600" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
