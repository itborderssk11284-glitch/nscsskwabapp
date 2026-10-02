/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  UserPlus,
  LogIn,
  CheckCircle2,
  AlertCircle,
  Database,
  Users,
  Shield,
  Building,
  Stethoscope
} from 'lucide-react';
import { UserProfile, UserRole, DepartmentId } from '../types/nursing';
import { SANGKHLABURI_HOSPITAL_META } from '../data/mockNursingData';
import { HospitalLogo } from './HospitalLogo';
import {
  loginWithEmailPassword,
  registerWithEmailPassword,
  realtimeDb
} from '../services/firebaseService';

interface LoginScreenProps {
  users: UserProfile[];
  onLoginSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLoginSuccess, onCancel }) => {
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Sign In inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Register inputs
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('staff_nurse');
  const [regDept, setRegDept] = useState<DepartmentId | 'all'>('er');

  // Feedback states
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const translateAuthError = (err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบความถูกต้องอีกครั้ง';
    }
    if (msg.includes('auth/email-already-in-use')) {
      return 'อีเมลนี้ถูกลงทะเบียนไว้ใน Firebase แล้ว กรุณาสลับไปแท็บ "เข้าสู่ระบบ"';
    }
    if (msg.includes('auth/weak-password')) {
      return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษรเพื่อความปลอดภัย';
    }
    if (msg.includes('auth/invalid-email')) {
      return 'รูปแบบอีเมลไม่ถูกต้อง กรุณาระบุ เช่น name@hospital.go.th';
    }
    if (msg.includes('auth/network-request-failed')) {
      return 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ Firebase ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต';
    }
    return `ข้อผิดพลาดในการตรวจสอบสิทธิ์: ${msg}`;
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!emailInput.trim() || !passwordInput.trim()) {
      setErrorMessage('กรุณาระบุทั้งอีเมลและรหัสผ่าน');
      return;
    }

    setLoading(true);
    try {
      const profile = await loginWithEmailPassword(emailInput.trim(), passwordInput.trim());
      setSuccessMessage('เข้าสู่ระบบ Firebase สำเร็จ กำลังเข้าสู่ระบบ...');
      setTimeout(() => {
        onLoginSuccess(profile);
      }, 500);
    } catch (err: unknown) {
      console.warn('Firebase login attempt:', err);

      const localMatch = users.find(
        (u) =>
          (u.email && u.email.toLowerCase() === emailInput.trim().toLowerCase()) ||
          u.username.toLowerCase() === emailInput.trim().toLowerCase()
      );

      if (localMatch && localMatch.pin === passwordInput.trim()) {
        onLoginSuccess(localMatch);
        return;
      }

      setErrorMessage(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!regName.trim()) {
      setErrorMessage('กรุณาระบุชื่อ-นามสกุลพยาบาล');
      return;
    }
    if (!regEmail.trim()) {
      setErrorMessage('กรุณาระบุอีเมล');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    setLoading(true);
    try {
      const roleTitles: Record<UserRole, string> = {
        director: 'หัวหน้ากลุ่มงานการพยาบาล (Chief Nurse)',
        head_nurse: 'หัวหน้าหอผู้ป่วย / หัวหน้าเวร',
        staff_nurse: 'พยาบาลวิชาชีพปฏิบัติการ (RN)',
        auditor_hr: 'พยาบาลวิชาชีพผู้ตรวจสอบคุณภาพ (RN Auditor)',
      };

      const newProfile = await registerWithEmailPassword(
        regEmail.trim(),
        regPassword,
        regName.trim(),
        regRole,
        roleTitles[regRole],
        regDept
      );

      setSuccessMessage('สมัครสมาชิกและบันทึกโปรไฟล์ใน Firebase เรียบร้อยแล้ว กำลังเข้าสู่ระบบ...');
      setTimeout(() => {
        onLoginSuccess(newProfile);
      }, 700);
    } catch (err: unknown) {
      console.error('Firebase register error:', err);
      setErrorMessage(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-teal-700 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex p-1.5 bg-white rounded-full shadow-2xl border border-slate-700 mb-4">
          <HospitalLogo size="xl" />
        </div>

        <h1 className="text-xl font-black text-white tracking-tight leading-snug px-4">
          {SANGKHLABURI_HOSPITAL_META.systemName}
        </h1>
        <p className="mt-1 text-[20px] text-teal-300 font-medium">
          {SANGKHLABURI_HOSPITAL_META.nameTh} · {SANGKHLABURI_HOSPITAL_META.province}
        </p>
        <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-center gap-1.5">
          <Database className="w-3.5 h-3.5 text-emerald-400" />
          <span>เชื่อมต่อ Firebase Realtime Database & Email/Password Authentication</span>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-200 space-y-6">
          {/* Mode Switch Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAuthMode('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                authMode === 'signin'
                  ? 'border-teal-700 text-teal-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>เข้าสู่ระบบ (Sign In)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`flex-1 pb-3 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                authMode === 'register'
                  ? 'border-teal-700 text-teal-800'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>สมัครสมาชิกใหม่ (Register)</span>
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมลผู้ใช้งาน (Email)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="nurse.er@sangkhla.go.th"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-700 text-white font-bold text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>กำลังตรวจสอบสิทธิ์ Firebase...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>เข้าสู่ระบบปฏิบัติงาน</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล (Full Name)
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="พว. นริศรา ใจดี"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  อีเมล (Email สำหรับเข้าสู่ระบบ)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="narisara@sangkhla.go.th"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่าน (Password ขั้นต่ำ 6 ตัวอักษร)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ตำแหน่ง / บทบาท
                  </label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="staff_nurse">พยาบาลวิชาชีพปฏิบัติการ (RN)</option>
                    <option value="auditor_hr">พยาบาลวิชาชีพผู้ตรวจสอบ (RN Auditor)</option>
                    <option value="head_nurse">หัวหน้าหอผู้ป่วย (Head Nurse)</option>
                    <option value="director">หัวหน้ากลุ่มงาน (CNO)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    แผนกที่สังกัด
                  </label>
                  <select
                    value={regDept}
                    onChange={(e) => setRegDept(e.target.value as DepartmentId | 'all')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-600 bg-white"
                  >
                    <option value="er">ER (อุบัติเหตุและฉุกเฉิน)</option>
                    <option value="ipd1">IPD 1 (หอผู้ป่วยใน 1)</option>
                    <option value="ipd2">IPD 2 (หอผู้ป่วยใน 2)</option>
                    <option value="opd">OPD (ผู้ป่วยนอก)</option>
                    <option value="lr">LR (ห้องคลอด)</option>
                    <option value="all">ทุกแผนก (ผู้บริหาร)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-teal-800 hover:bg-teal-700 text-white font-bold text-sm rounded-lg transition-colors shadow-xs flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <span>กำลังลงทะเบียนใน Firebase...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>สร้างบัญชีและเริ่มใช้งาน</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
