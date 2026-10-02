import React from 'react';
import { Menu, FileText, MapPin } from 'lucide-react';
import { DepartmentId } from '../types/nursing';
import { DEPARTMENTS, SANGKHLABURI_HOSPITAL_META } from '../data/mockNursingData';

interface TopHeaderProps {
  selectedDeptId: DepartmentId;
  onSelectDept: (deptId: DepartmentId) => void;
  onOpenMobileMenu: () => void;
  onOpenReportModal: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  selectedDeptId,
  onSelectDept,
  onOpenMobileMenu,
  onOpenReportModal,
}) => {
  const currentDept = DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3 no-print">
      <div className="flex items-center justify-between">
        {/* Left: Hamburger (mobile) & Department Context */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenMobileMenu}
            className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden transition-colors"
            title="เปิดเมนูหลัก"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-semibold hidden sm:inline">แผนกปัจจุบัน:</span>
              <select
                value={selectedDeptId}
                onChange={(e) => onSelectDept(e.target.value as DepartmentId)}
                aria-label="เลือกแผนกการพยาบาล"
                className="bg-slate-50 border border-slate-300 text-slate-900 text-xs font-bold rounded-lg py-1.5 pl-3 pr-8 focus:outline-hidden focus:ring-2 focus:ring-teal-500 cursor-pointer shadow-2xs"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Right: Realtime DB status, Hospital Region badge & Quick Report */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Realtime DB: Live Sync</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span>{SANGKHLABURI_HOSPITAL_META.province}</span>
            <span>·</span>
            <span className="font-semibold text-slate-700">{SANGKHLABURI_HOSPITAL_META.totalBeds} เตียง</span>
          </div>

          <button
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors shadow-2xs"
          >
            <FileText className="w-3.5 h-3.5 text-teal-700" />
            <span className="hidden sm:inline">พิมพ์รายงาน 4 เสาหลัก</span>
            <span className="sm:hidden">รายงาน</span>
          </button>
        </div>
      </div>
    </header>
  );
};
