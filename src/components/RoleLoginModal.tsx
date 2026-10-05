import React, { useState } from 'react';
import {
  X,
  Shield,
  CheckCircle2,
  Lock,
  Building,
  Users,
  Stethoscope,
  KeyRound
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/nursing';
import { DEFAULT_USERS, SYSTEM_DEFAULT_USER } from '../data/mockNursingData';

interface RoleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  users?: UserProfile[];
  onOpenLoginScreen?: () => void;
  onNavigateToUserManagement?: () => void;
}

export const RoleLoginModal: React.FC<RoleLoginModalProps> = ({
  isOpen,
  onClose,
  currentUser = SYSTEM_DEFAULT_USER,
  onSelectUser,
  users = DEFAULT_USERS,
  onOpenLoginScreen,
  onNavigateToUserManagement,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<UserProfile>(
    users.length > 0 ? users[0] : (currentUser || SYSTEM_DEFAULT_USER)
  );
  const [pinError, setPinError] = useState(false);

  // Sync candidate if users list changes
  React.useEffect(() => {
    if (users.length > 0 && (!selectedCandidate || !users.some((u) => u.id === selectedCandidate.id))) {
      setSelectedCandidate(users[0]);
    }
  }, [users]);

  if (!isOpen) return null;

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return Shield;
      case 'director':
        return Building;
      case 'head_nurse':
        return Users;
      case 'staff_nurse':
        return Stethoscope;
      case 'auditor_hr':
      default:
        return Shield;
    }
  };

  const getRoleDetails = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return {
          levelText: 'ผู้ดูแลระบบสูงสุด (System Admin)',
          authorities: [
            'เพิ่ม แก้ไข และลบข้อมูลผู้ใช้งานทุกระดับชั้นในระบบ',
            'ควบคุมสิทธิ์ความปลอดภัยและโครงสร้างระบบงานพยาบาล',
            'เชื่อมโยงและซิงค์ข้อมูลกับ Firebase Realtime Database & Firestore',
            'ดูแลการจัดสรรแผนกและสิทธิ์การเข้าถึงข้อมูลทั้งโรงพยาบาล',
          ],
        };
      case 'director':
        return {
          levelText: 'ระดับชั้น 1: ผู้บริหารสูงสุด / หัวหน้ากลุ่มงานการพยาบาล (CNO/Admin)',
          authorities: [
            'กำกับดูแลตัวชี้วัด Productivity รวมทุกแผนกในโรงพยาบาล',
            'อนุมัติกรอบอัตรากำลังพยาบาลประจำปี (FTE Allocation Budget)',
            'ตัดสินใจนโยบายเกลี่ยกำลังคนข้ามหอผู้ป่วยระดับวิกฤต',
            'บริหารจัดการข้อมูลผู้ใช้งานและส่งออกรายงานทางการพยาบาล',
          ],
        };
      case 'head_nurse':
        return {
          levelText: 'ระดับชั้น 2: หัวหน้าหอผู้ป่วย / In-Charge Nurse',
          authorities: [
            'จัดสรรเวรพยาบาลประจำวัน (เวรเช้า / เวรบ่าย / เวรดึก)',
            'ประเมินระดับความหนักของผู้ป่วย (Patient Acuity Type 1-5)',
            'คำนวณ Productivity และตรวจสอบความปลอดภัย Safe Nurse-to-Patient Ratio',
            'ร้องขอพยาบาลหมุนเวียน (Float Pool Nurse) เมื่อภาระงานวิกฤต',
          ],
        };
      case 'staff_nurse':
        return {
          levelText: 'ระดับชั้น 3: พยาบาลวิชาชีพปฏิบัติการ (Staff Nurse RN)',
          authorities: [
            'บันทึกกิจกรรมการพยาบาลรายเคส (Direct Care & Indirect Care)',
            'ลงเวลาปฏิบัติหัตถการจริงเทียบกับ Standard Time Study',
            'ประเมินความล้าสะสม (Self Fatigue Score) ตามเวรปฏิบัติงาน',
            'บันทึกรายงานอุบัติการณ์และความปลอดภัยข้างเตียง',
          ],
        };
      case 'auditor_hr':
      default:
        return {
          levelText: 'ระดับชั้น 4: ผู้ตรวจสอบค่างานและมาตรฐานวิชาชีพพยาบาล (Auditor/Quality RN)',
          authorities: [
            'ปรับปรุงฐานข้อมูลเวลามาตรฐานหัตถการ (Standard Time Calibration)',
            'วิเคราะห์และจัดสรรอัตรากำลังพยาบาลวิชาชีพ (RN Safe Staffing)',
            'ตรวจจับจุดสูญเปล่าทางการพยาบาล (LEAN Healthcare Waste Audit)',
            'คำนวณความต้องการกำลังคนตามสูตรสภาการพยาบาล / กระทรวงสาธารณสุข',
          ],
        };
    }
  };

  const handleConfirmLogin = (user: UserProfile) => {
    onSelectUser(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-teal-700" />
              เลือกระดับชั้นการเข้าใช้งาน (Role-Based Authentication)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ระบบจัดแบ่งสิทธิ์ตามโครงสร้างการบริหารงานพยาบาล โรงพยาบาลสังขละบุรี
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {users.length === 0 ? (
            <div className="p-8 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mx-auto shadow-xs">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  ยังไม่มีบัญชีผู้ใช้งานในฐานข้อมูล (ฐานข้อมูลว่างเปล่า)
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  ระบบถูกตั้งค่าเป็น Clean Slate เพื่อเตรียมพร้อมสำหรับการลงข้อมูลจริงของโรงพยาบาลสังขละบุรี ท่านสามารถสร้างบัญชีผู้ใช้งานจริง หรือลงทะเบียนผ่าน Firebase Authentication
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onOpenLoginScreen && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenLoginScreen();
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    เข้าสู่ระบบ / ลงทะเบียน (Firebase Auth)
                  </button>
                )}
                {onNavigateToUserManagement && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateToUserManagement();
                    }}
                    className="px-4 py-2 text-xs font-bold text-teal-800 bg-white border border-teal-300 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                  >
                    ไปที่หน้าจัดการผู้ใช้งาน (User Management)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {users.map((user) => {
                  const isSelected = selectedCandidate.id === user.id;
                  const isCurrent = currentUser.id === user.id;
                  const Icon = getRoleIcon(user.role);
                  const details = getRoleDetails(user.role);

                  return (
                    <div
                      key={user.id}
                      onClick={() => setSelectedCandidate(user)}
                      className={`relative p-4 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 ring-1 ring-teal-600 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              isSelected ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{user.name}</div>
                            <div className="text-xs text-teal-700 font-medium">{user.roleTitle}</div>
                          </div>
                        </div>
                        {isCurrent && (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-sm">
                            กำลังใช้งาน
                          </span>
                        )}
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-600">
                        <div className="font-medium text-slate-800 text-[11px] mb-1">
                          {details.levelText}
                        </div>
                        <div className="text-slate-500 text-[11px] truncate">
                          สังกัด: {user.departmentName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Candidate Privileges Summary */}
              {(() => {
                const candidate = selectedCandidate || users[0] || currentUser || SYSTEM_DEFAULT_USER;
                const candidateDetails = getRoleDetails(candidate.role);
                return (
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                      ขอบเขตอำนาจและสิทธิ์ในระบบของ {candidate.name} ({candidate.roleTitle})
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600">
                      {candidateDetails.authorities.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-teal-600 font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            ใบอนุญาตเลขที่: <span className="font-mono">{selectedCandidate.licenseNo}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              onClick={() => handleConfirmLogin(selectedCandidate)}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs transition-colors"
            >
              ยืนยันเข้าสู่ระบบในบทบาทนี้
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
