import React from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  Lock,
  Building,
  Users,
  Stethoscope,
  LogOut,
  UserCheck,
  Mail,
  Award,
  AlertTriangle
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/nursing';

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
}) => {
  if (!isOpen) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'director':
        return Building;
      case 'head_nurse':
        return Users;
      case 'staff_nurse':
        return Stethoscope;
      case 'auditor_hr':
        return Shield;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'director':
        return { label: 'ระดับชั้น 1: CNO / ผู้บริหารสูงสุด', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'head_nurse':
        return { label: 'ระดับชั้น 2: หัวหน้าหอผู้ป่วย / In-Charge', color: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 'staff_nurse':
        return { label: 'ระดับชั้น 3: พยาบาลวิชาชีพปฏิบัติการ (RN)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'auditor_hr':
        return { label: 'ระดับชั้น 4: ผู้ตรวจสอบค่างาน / HR Auditor', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
  };

  const getRoleAuthorities = (role: UserRole): string[] => {
    switch (role) {
      case 'director':
        return [
          'กำกับดูแลตัวชี้วัด Productivity รวมทุกแผนกในโรงพยาบาล',
          'อนุมัติกรอบอัตรากำลังพยาบาลประจำปี (FTE Allocation Budget)',
          'ตัดสินใจนโยบายเกลี่ยกำลังคนข้ามหอผู้ป่วยระดับวิกฤต',
          'ส่งออกรายงานทางการพยาบาลต่อผู้อำนวยการโรงพยาบาลและ สสจ.กาญจนบุรี',
        ];
      case 'head_nurse':
        return [
          'จัดสรรเวรพยาบาลประจำวัน (เวรเช้า / เวรบ่าย / เวรดึก)',
          'ประเมินระดับความหนักของผู้ป่วย (Patient Acuity Type 1-5)',
          'คำนวณ Productivity และตรวจสอบความปลอดภัย Safe Nurse-to-Patient Ratio',
          'ร้องขอพยาบาลหมุนเวียน (Float Pool Nurse) เมื่อภาระงานวิกฤต',
        ];
      case 'staff_nurse':
        return [
          'บันทึกกิจกรรมการพยาบาลรายเคส (Direct Care & Indirect Care)',
          'ลงเวลาปฏิบัติหัตถการจริงเทียบกับ Standard Time Study',
          'ประเมินความล้าสะสม (Self Fatigue Score) ตามเวรปฏิบัติงาน',
          'บันทึกรายงานอุบัติการณ์และความปลอดภัยข้างเตียง',
        ];
      case 'auditor_hr':
        return [
          'ปรับปรุงฐานข้อมูลเวลามาตรฐานหัตถการ (Standard Time Calibration)',
          'วิเคราะห์และจัดสรรอัตรากำลังพยาบาลวิชาชีพ (RN Safe Staffing)',
          'ตรวจจับจุดสูญเปล่าทางการพยาบาล (LEAN Healthcare Waste Audit)',
          'คำนวณความต้องการกำลังคนตามสูตรสภาการพยาบาล / กระทรวงสาธารณสุข',
        ];
    }
  };

  const handleConfirmLogout = () => {
    onClose();
    onLogout();
  };

  const Icon = getRoleIcon(currentUser.role);
  const badge = getRoleBadge(currentUser.role);
  const authorities = getRoleAuthorities(currentUser.role);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-teal-700" />
              <span>ข้อมูลผู้ใช้งานและการเข้าสู่ระบบ</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              กลุ่มงานการพยาบาล โรงพยาบาลสังขละบุรี
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Active User Profile Card */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/40 relative">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-slate-900">{currentUser.name}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                    {badge.label}
                  </span>
                </div>
                <div className="text-xs text-teal-800 font-semibold mt-0.5">
                  {currentUser.roleTitle}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-3 border-t border-teal-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>สังกัด: <strong>{currentUser.departmentName}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>ใบอนุญาต: <strong className="font-mono">{currentUser.licenseNo}</strong></span>
                  </div>
                  {currentUser.email && (
                    <div className="flex items-center gap-1.5 truncate sm:col-span-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">อีเมล: <strong className="font-mono">{currentUser.email}</strong></span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Notice: No Direct User Switching */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block">ระบบรักษาความปลอดภัยบัญชีผู้ใช้งาน:</span>
              <span>
                ไม่อนุญาตให้สลับผู้ใช้งานโดยตรง เพื่อรักษาความถูกต้องของข้อมูลเวรและประวัติการลงชื่อปฏิบัติงาน หากต้องการเปลี่ยนผู้ใช้งาน กรุณากดปุ่ม <strong>&quot;ออกจากระบบ (Log Out)&quot;</strong> ด้านล่าง
              </span>
            </div>
          </div>

          {/* User Privileges & Scope */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-700" />
              <span>ขอบเขตอำนาจหน้าที่ของบทบาทนี้ ({currentUser.roleTitle})</span>
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {authorities.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-teal-600 font-bold shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>

          <button
            onClick={handleConfirmLogout}
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ (Log Out)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
