import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Shield,
  Trash2,
  CheckCircle2,
  X,
  KeyRound,
  Building,
  Stethoscope,
  Lock
} from 'lucide-react';
import { UserProfile, UserRole, DepartmentId } from '../types/nursing';
import { DEPARTMENTS } from '../data/mockNursingData';

interface UserManagementViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onAddUser: (newUser: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onDeleteUser,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [roleLevel, setRoleLevel] = useState<1 | 2 | 3 | 4>(3);
  const [roleTitle, setRoleTitle] = useState('พยาบาลวิชาชีพปฏิบัติการ (Staff Nurse RN)');
  const [departmentId, setDepartmentId] = useState<DepartmentId | 'all'>('ipd1');
  const [licenseNo, setLicenseNo] = useState('');
  const [pin, setPin] = useState('1234');
  const [formError, setFormError] = useState('');

  const handleRoleLevelChange = (lvl: 1 | 2 | 3 | 4) => {
    setRoleLevel(lvl);
    if (lvl === 1) {
      setRoleTitle('ผู้บริหาร / รอง ผอ. ฝ่ายการพยาบาล (CNO)');
      setDepartmentId('all');
    } else if (lvl === 2) {
      setRoleTitle('หัวหน้าหอผู้ป่วย (In-Charge Nurse)');
    } else if (lvl === 3) {
      setRoleTitle('พยาบาลวิชาชีพปฏิบัติการ (Staff Nurse RN)');
    } else if (lvl === 4) {
      setRoleTitle('ผู้ตรวจสอบค่างานและมาตรฐานบุคคล (HR Auditor)');
      setDepartmentId('all');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim() || !username.trim() || !licenseNo.trim()) {
      setFormError('กรุณากรอกข้อมูลชื่อ, ชื่อผู้ใช้ และเลขที่ใบอนุญาตให้ครบถ้วน');
      return;
    }

    let role: UserRole = 'staff_nurse';
    if (roleLevel === 1) role = 'director';
    else if (roleLevel === 2) role = 'head_nurse';
    else if (roleLevel === 3) role = 'staff_nurse';
    else if (roleLevel === 4) role = 'auditor_hr';

    const deptName =
      departmentId === 'all'
        ? 'กลุ่มงานการพยาบาล (องค์กรพยาบาล)'
        : DEPARTMENTS.find((d) => d.id === departmentId)?.name || 'หอผู้ป่วย';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username: username.trim().toLowerCase(),
      name: fullName.trim(),
      role,
      roleTitle,
      roleLevel,
      departmentId,
      departmentName: deptName,
      licenseNo: licenseNo.trim(),
      pin: pin.trim() || '1234',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddUser(newUser);
    setIsModalOpen(false);

    // Reset Form
    setFullName('');
    setUsername('');
    setLicenseNo('');
    setPin('1234');
  };

  const getRoleBadge = (level: number) => {
    switch (level) {
      case 1:
        return { label: 'ระดับ 1: CNO / ผู้บริหาร', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 2:
        return { label: 'ระดับ 2: หัวหน้าหอผู้ป่วย', color: 'text-sky-700 bg-sky-50 border-sky-200' };
      case 3:
        return { label: 'ระดับ 3: พยาบาลประจำการ', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 4:
        return { label: 'ระดับ 4: ผู้ตรวจสอบ / HR', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      default:
        return { label: 'พยาบาล', color: 'text-slate-700 bg-slate-50 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              การบริหารจัดการผู้ใช้งานในระบบ (Nursing Staff & User Management)
            </h2>
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 font-semibold px-2 py-0.5 rounded-sm">
              {users.length} บัญชีผู้ใช้
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดสิทธิ์การเข้าใช้งาน 4 ระดับชั้น บันทึกข้อมูลและจัดสรรแผนกประจำการพยาบาล
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>เพิ่มผู้ใช้งานใหม่</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4 text-left">ชื่อ-นามสกุล / ตำแหน่ง</th>
                <th scope="col" className="py-3 px-4 text-left">ชื่อผู้ใช้ (Username)</th>
                <th scope="col" className="py-3 px-4 text-center">ระดับสิทธิ์ (Role Level)</th>
                <th scope="col" className="py-3 px-4 text-left">แผนกที่สังกัด</th>
                <th scope="col" className="py-3 px-4 text-center">เลขที่ใบอนุญาต</th>
                <th scope="col" className="py-3 px-4 text-center">รหัส PIN</th>
                <th scope="col" className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((user) => {
                const badge = getRoleBadge(user.roleLevel);
                const isCurrent = currentUser.id === user.id;

                return (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            กำลังใช้งาน
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{user.roleTitle}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-700">
                      @{user.username}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {user.departmentName}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {user.licenseNo}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-500">
                      ••••
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {users.length > 1 && !isCurrent ? (
                        <button
                          onClick={() => onDeleteUser(user.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="ลบผู้ใช้งานนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">ค่าเริ่มต้น</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-700" />
                <span>เพิ่มผู้ใช้งานใหม่เข้าสู่ระบบ</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ชื่อ-นามสกุล (พร้อมคำนำหน้า พว.)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น พว. สุดาพร ใจสว่าง"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น sudaporn_rn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ระดับชั้นการเข้าใช้งาน (Role Level)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { lvl: 1 as const, label: 'ระดับ 1: CNO / ผู้บริหาร' },
                    { lvl: 2 as const, label: 'ระดับ 2: หัวหน้าหอผู้ป่วย' },
                    { lvl: 3 as const, label: 'ระดับ 3: พยาบาลประจำการ' },
                    { lvl: 4 as const, label: 'ระดับ 4: ผู้ตรวจสอบ / HR' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => handleRoleLevelChange(item.lvl)}
                      className={`p-2 text-left rounded-md border text-[11px] font-medium transition-colors ${
                        roleLevel === item.lvl
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ตำแหน่งงานที่แสดง</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">แผนกประจำการ</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value as DepartmentId | 'all')}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="all">กลุ่มงานการพยาบาล (ทุกแผนก)</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    เลขที่ใบประกอบวิชาชีพ (License)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น RN-49201944"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full p-2 border rounded-md font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  รหัส PIN เข้าใช้งาน (4 หลัก)
                </label>
                <input
                  type="password"
                  placeholder="เช่น 1234"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full p-2 border rounded-md font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-md shadow-xs"
                >
                  บันทึกผู้ใช้ใหม่
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
