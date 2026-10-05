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
  Lock,
  Edit3,
  AlertTriangle,
  Mail,
  ShieldAlert,
  Database
} from 'lucide-react';
import { UserProfile, UserRole, DepartmentId } from '../types/nursing';
import { DEPARTMENTS } from '../data/mockNursingData';

interface UserManagementViewProps {
  users: UserProfile[];
  currentUser: UserProfile;
  onAddUser: (newUser: UserProfile) => void;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  // Check Admin permission: director (level 1), admin, or explicit isAdmin flag
  const isAdmin = Boolean(
    currentUser && (
      currentUser.role === 'admin' ||
      currentUser.role === 'director' ||
      currentUser.roleLevel === 1 ||
      currentUser.isAdmin
    )
  );

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserProfile | null>(null);

  // Form State for Add / Edit
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [roleLevel, setRoleLevel] = useState<1 | 2 | 3 | 4>(3);
  const [roleTitle, setRoleTitle] = useState('พยาบาลวิชาชีพปฏิบัติการ (Staff Nurse RN)');
  const [departmentId, setDepartmentId] = useState<DepartmentId | 'all'>('er');
  const [licenseNo, setLicenseNo] = useState('');
  const [pin, setPin] = useState('1234');
  const [formError, setFormError] = useState('');

  const handleRoleLevelChange = (lvl: 1 | 2 | 3 | 4) => {
    setRoleLevel(lvl);
    if (lvl === 1) {
      setRoleTitle('ผู้บริหาร / หัวหน้ากลุ่มงานการพยาบาล (Admin/CNO)');
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

  const handleOpenAddModal = () => {
    setFormError('');
    setFullName('');
    setUsername('');
    setEmail('');
    setRoleLevel(3);
    setRoleTitle('พยาบาลวิชาชีพปฏิบัติการ (Staff Nurse RN)');
    setDepartmentId('er');
    setLicenseNo('');
    setPin('1234');
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (user: UserProfile) => {
    setFormError('');
    setEditingUser(user);
    setFullName(user.name);
    setUsername(user.username);
    setEmail(user.email || '');
    setRoleLevel(user.roleLevel || 3);
    setRoleTitle(user.roleTitle);
    setDepartmentId(user.departmentId || 'er');
    setLicenseNo(user.licenseNo);
    setPin(user.pin || '1234');
  };

  const handleSaveNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isAdmin) {
      setFormError('ขออภัย คุณไม่มีสิทธิ์ในการเพิ่มผู้ใช้งาน (สงวนสิทธิ์เฉพาะ Admin เท่านั้น)');
      return;
    }

    if (!fullName.trim() || !username.trim() || !licenseNo.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุล, ชื่อผู้ใช้ (Username) และเลขที่ใบอนุญาตให้ครบถ้วน');
      return;
    }

    // Check duplicate username
    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      setFormError('ชื่อผู้ใช้นี้ (Username) ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น');
      return;
    }

    let role: UserRole = 'staff_nurse';
    if (roleLevel === 1) role = 'director';
    else if (roleLevel === 2) role = 'head_nurse';
    else if (roleLevel === 3) role = 'staff_nurse';
    else if (roleLevel === 4) role = 'auditor_hr';

    const deptName =
      departmentId === 'all'
        ? 'กลุ่มงานการพยาบาล (ทุกแผนก)'
        : DEPARTMENTS.find((d) => d.id === departmentId)?.name || 'หอผู้ป่วย';

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username: username.trim().toLowerCase(),
      name: fullName.trim(),
      email: email.trim() || `${username.trim().toLowerCase()}@sangkhla.go.th`,
      role,
      roleTitle,
      roleLevel,
      departmentId,
      departmentName: deptName,
      licenseNo: licenseNo.trim(),
      pin: pin.trim() || '1234',
      isAdmin: roleLevel === 1,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddUser(newUser);
    setIsAddModalOpen(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!isAdmin) {
      setFormError('ขออภัย คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลผู้ใช้งาน (สงวนสิทธิ์เฉพาะ Admin เท่านั้น)');
      return;
    }

    if (!editingUser) return;

    if (!fullName.trim() || !username.trim() || !licenseNo.trim()) {
      setFormError('กรุณากรอกชื่อ-นามสกุล, ชื่อผู้ใช้ และเลขที่ใบอนุญาตให้ครบถ้วน');
      return;
    }

    // Check duplicate username with other users
    if (
      users.some(
        (u) =>
          u.id !== editingUser.id &&
          u.username.toLowerCase() === username.trim().toLowerCase()
      )
    ) {
      setFormError('ชื่อผู้ใช้นี้ (Username) ถูกใช้งานแล้วโดยบัญชีอื่น');
      return;
    }

    let role: UserRole = editingUser.role;
    if (roleLevel === 1) role = 'director';
    else if (roleLevel === 2) role = 'head_nurse';
    else if (roleLevel === 3) role = 'staff_nurse';
    else if (roleLevel === 4) role = 'auditor_hr';

    const deptName =
      departmentId === 'all'
        ? 'กลุ่มงานการพยาบาล (ทุกแผนก)'
        : DEPARTMENTS.find((d) => d.id === departmentId)?.name || 'หอผู้ป่วย';

    const updated: UserProfile = {
      ...editingUser,
      username: username.trim().toLowerCase(),
      name: fullName.trim(),
      email: email.trim() || editingUser.email,
      role,
      roleTitle,
      roleLevel,
      departmentId,
      departmentName: deptName,
      licenseNo: licenseNo.trim(),
      pin: pin.trim() || editingUser.pin || '1234',
      isAdmin: roleLevel === 1,
    };

    onUpdateUser(updated);
    setEditingUser(null);
  };

  const handleConfirmDelete = () => {
    if (!isAdmin) return;
    if (deletingUser) {
      onDeleteUser(deletingUser.id);
      setDeletingUser(null);
    }
  };

  const getRoleBadge = (level: number) => {
    switch (level) {
      case 1:
        return { label: 'ระดับ 1: CNO / Admin', color: 'text-purple-700 bg-purple-50 border-purple-200' };
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
      {/* Title Header with Live Firebase Sync Badge */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              การบริหารจัดการผู้ใช้งานในระบบ (Nursing Staff & User Management)
            </h2>
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 font-semibold px-2 py-0.5 rounded-sm flex items-center gap-1">
              <Database className="w-3 h-3 text-teal-600" />
              <span>{users.length} บัญชี (Firebase Realtime & Firestore)</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            กำหนดสิทธิ์การเข้าใช้งาน 4 ระดับชั้น จัดสรรแผนก และควบคุมความปลอดภัยของระบบ
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ เพิ่มผู้ใช้งานใหม่</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-medium">
            <Lock className="w-3.5 h-3.5 text-slate-400" />
            <span>เฉพาะ Admin เท่านั้นที่มีสิทธิ์แก้ไข</span>
          </div>
        )}
      </div>

      {/* Admin Privilege Status Banner */}
      {!isAdmin && (
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-3 shadow-2xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-amber-900">
              คุณกำลังเข้าสู่ระบบในฐานะ: {currentUser?.name} ({currentUser?.roleTitle}) — โหมดดูข้อมูลเท่านั้น (Read-Only)
            </div>
            <p className="text-amber-700 leading-relaxed">
              สิทธิ์ในการ <strong>เพิ่ม แก้ไข และลบ</strong> ข้อมูลผู้ใช้งานในระบบนี้ ถูกจำกัดไว้เฉพาะผู้ดูแลระบบระดับสูง (Admin / CNO หัวหน้ากลุ่มงานการพยาบาล) เท่านั้น หากต้องการแก้ไขข้อมูล กรุณาติดต่อผู้ดูแลระบบ
            </p>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="p-3.5 bg-teal-50/80 border border-teal-200 rounded-xl text-xs text-teal-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-700 shrink-0" />
            <span>
              สิทธิ์ผู้ดูแลระบบ (Admin Role): <strong>{currentUser?.name}</strong> มีสิทธิ์เพิ่ม แก้ไข และลบข้อมูลผู้ใช้งานได้เต็มรูปแบบ ทุกการเปลี่ยนแปลงจะเชื่อมต่อไปยัง <strong>Firebase Realtime Database & Firestore</strong> ทันที
            </span>
          </div>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-teal-700 text-white rounded">
            Admin Verified
          </span>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th scope="col" className="py-3 px-4 text-left">ชื่อ-นามสกุล / ตำแหน่ง</th>
                <th scope="col" className="py-3 px-4 text-left">ชื่อผู้ใช้ / อีเมล</th>
                <th scope="col" className="py-3 px-4 text-center">ระดับสิทธิ์ (Role Level)</th>
                <th scope="col" className="py-3 px-4 text-left">แผนกที่สังกัด</th>
                <th scope="col" className="py-3 px-4 text-center">เลขที่ใบอนุญาต</th>
                <th scope="col" className="py-3 px-4 text-center">รหัส PIN</th>
                <th scope="col" className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 bg-slate-50/50">
                    <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Users className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">ยังไม่มีรายชื่อผู้ใช้งานในฐานข้อมูล (ฐานข้อมูลว่างเปล่า)</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      คลิกปุ่ม "+ เพิ่มผู้ใช้งานใหม่" เพื่อลงทะเบียนพยาบาลจริงเข้าสู่ระบบ หรือใช้เมนูเข้าสู่ระบบด้วย Firebase
                    </p>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={handleOpenAddModal}
                        className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 border border-teal-300 hover:bg-teal-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>ลงทะเบียนผู้ใช้คนแรก</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const badge = getRoleBadge(user.roleLevel);
                  const isCurrent = currentUser?.id === user.id;

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
                      <td className="py-3 px-4">
                        <div className="font-mono font-medium text-slate-700">@{user.username}</div>
                        {user.email && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {user.email}
                          </div>
                        )}
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
                        {isAdmin ? (
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(user)}
                              className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-md transition-colors cursor-pointer"
                              title="แก้ไขข้อมูลผู้ใช้ (Admin)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            {!isCurrent ? (
                              <button
                                type="button"
                                onClick={() => setDeletingUser(user)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                title="ลบผู้ใช้งานนี้ออกจากฐานข้อมูล"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400 px-1 font-medium">คุณ</span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                            <Lock className="w-3 h-3" />
                            <span>ดูอย่างเดียว</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal (Admin Only) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-teal-700" />
                <span>เพิ่มผู้ใช้งานใหม่ (บันทึกลง Firebase อัตโนมัติ)</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveNewUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ชื่อ-นามสกุล (พร้อมคำนำหน้า พว.)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น พว. สุดาพร ใจสว่าง"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น sudaporn_rn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  อีเมล (สำหรับเข้าสู่ระบบ Firebase)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    placeholder="sudaporn@sangkhla.go.th"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ระดับชั้นการเข้าใช้งาน (Role Level)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { lvl: 1 as const, label: 'ระดับ 1: CNO / Admin' },
                    { lvl: 2 as const, label: 'ระดับ 2: หัวหน้าหอผู้ป่วย' },
                    { lvl: 3 as const, label: 'ระดับ 3: พยาบาลประจำการ' },
                    { lvl: 4 as const, label: 'ระดับ 4: ผู้ตรวจสอบ / HR' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => handleRoleLevelChange(item.lvl)}
                      className={`p-2 text-left rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                        roleLevel === item.lvl
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
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
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">แผนกประจำการ</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value as DepartmentId | 'all')}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
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
                    required
                    placeholder="เช่น RN-49201944"
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  รหัส PIN ด่วนเข้าใช้งาน (4-6 หลัก)
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    placeholder="1234"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>บันทึกผู้ใช้ลงฐานข้อมูล</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal (Admin Only) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-700" />
                <span>แก้ไขข้อมูลผู้ใช้งาน: {editingUser.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEditUser} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ชื่อผู้ใช้งาน (Username)
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  อีเมล (Firebase Account)
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  ระดับชั้นการเข้าใช้งาน (Role Level)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { lvl: 1 as const, label: 'ระดับ 1: CNO / Admin' },
                    { lvl: 2 as const, label: 'ระดับ 2: หัวหน้าหอผู้ป่วย' },
                    { lvl: 3 as const, label: 'ระดับ 3: พยาบาลประจำการ' },
                    { lvl: 4 as const, label: 'ระดับ 4: ผู้ตรวจสอบ / HR' },
                  ].map((item) => (
                    <button
                      key={item.lvl}
                      type="button"
                      onClick={() => handleRoleLevelChange(item.lvl)}
                      className={`p-2 text-left rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                        roleLevel === item.lvl
                          ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-2xs'
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
                  required
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">แผนกประจำการ</label>
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value as DepartmentId | 'all')}
                    className="w-full p-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
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
                    required
                    value={licenseNo}
                    onChange={(e) => setLicenseNo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  รหัส PIN ด่วนเข้าใช้งาน (4-6 หลัก)
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>บันทึกการแก้ไข (Sync Firebase)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal (Admin Only) */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                ยืนยันการลบผู้ใช้งาน
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้งาน <strong>"{deletingUser.name}"</strong> (@{deletingUser.username}) ออกจากระบบ?
              </p>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>ข้อมูลจะถูกลบออกจาก Firebase Realtime Database & Firestore ทันที</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ยืนยันลบผู้ใช้</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
