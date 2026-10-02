import React, { useState } from 'react';
import {
  DepartmentId,
  ProductivityCalculationResult,
  DepartmentInfo
} from '../types/nursing';
import {
  DEPARTMENTS,
  SANGKHLABURI_HOSPITAL_META
} from '../data/mockNursingData';
import {
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Scale,
  Shuffle,
  Info
} from 'lucide-react';

interface StaffingOptimizerViewProps {
  deptResults: Record<DepartmentId, ProductivityCalculationResult>;
  selectedDeptId: DepartmentId;
  onSelectDept: (deptId: DepartmentId) => void;
}

export const StaffingOptimizerView: React.FC<StaffingOptimizerViewProps> = ({
  deptResults,
  selectedDeptId,
  onSelectDept,
}) => {
  const currentDept = DEPARTMENTS.find((d) => d.id === selectedDeptId) || DEPARTMENTS[0];
  const currentResult = deptResults[selectedDeptId];

  // Dynamic Shift Rebalance Sandbox state
  const [sourceDept, setSourceDept] = useState<DepartmentId>('opd');
  const [targetDept, setTargetDept] = useState<DepartmentId>('er');
  const [movedStaffCount, setMovedStaffCount] = useState<number>(1);
  const [simulationActive, setSimulationActive] = useState<boolean>(false);

  const sourceRes = deptResults[sourceDept];
  const targetRes = deptResults[targetDept];

  // Simulated metrics
  const simulatedSourceProd = sourceRes
    ? Number(
        (
          (sourceRes.totalWorkloadHours /
            Math.max(1, sourceRes.totalPaidStaffHours - movedStaffCount * 8)) *
          100
        ).toFixed(1)
      )
    : 0;

  const simulatedTargetProd = targetRes
    ? Number(
        (
          (targetRes.totalWorkloadHours /
            (targetRes.totalPaidStaffHours + movedStaffCount * 8)) *
          100
        ).toFixed(1)
      )
    : 0;

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              การจัดสรรและกระจายอัตรากำลังพยาบาลวิชาชีพ (RN Staffing Optimization)
            </h2>
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 font-semibold px-2 py-0.5 rounded-sm">
              พยาบาลวิชาชีพ (RN)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            วิเคราะห์ความต้องการอัตรากำลังเต็มเวลา (FTE) และการกระจายอัตรากำลังพยาบาลวิชาชีพ (RN) ตามภาระงานจริง
          </p>
        </div>

        {/* Selected Department Switcher */}
        <div className="flex items-center gap-2">
          <label htmlFor="dept-focus-select" className="text-xs font-semibold text-slate-600">
            วิเคราะห์แผนก:
          </label>
          <select
            id="dept-focus-select"
            value={selectedDeptId}
            onChange={(e) => onSelectDept(e.target.value as DepartmentId)}
            className="text-xs font-bold py-1.5 px-3 border border-slate-300 rounded-md bg-white text-slate-800"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: FTE Analysis & Safe RN Staffing */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: FTE Requirement & Formula */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-700" />
              การวิเคราะห์กรอบอัตรากำลังพยาบาล (FTE Gap Analysis)
            </h3>
            <span className="text-xs font-mono text-slate-400">MoPH Benchmark</span>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center py-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-500 block">พยาบาลที่มีจริง (Actual)</span>
              <span className="text-xl font-bold text-slate-900 font-mono">
                {currentResult.fteActual} <span className="text-xs font-normal">อัตรา</span>
              </span>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg border border-teal-100">
              <span className="text-xs text-teal-700 block">ความต้องการคำนวณ (Req)</span>
              <span className="text-xl font-bold text-teal-900 font-mono">
                {currentResult.fteRequired} <span className="text-xs font-normal">FTE</span>
              </span>
            </div>
            <div
              className={`p-3 rounded-lg border ${
                currentResult.fteGap < 0
                  ? 'bg-red-50 border-red-100'
                  : 'bg-emerald-50 border-emerald-100'
              }`}
            >
              <span className="text-xs text-slate-500 block">ส่วนต่าง (Gap)</span>
              <span
                className={`text-xl font-bold font-mono ${
                  currentResult.fteGap < 0 ? 'text-red-700' : 'text-emerald-700'
                }`}
              >
                {currentResult.fteGap > 0 ? `+${currentResult.fteGap}` : currentResult.fteGap}
              </span>
            </div>
          </div>

          {/* Mathematical Proof Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2 text-slate-700">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-teal-700" />
              สูตรคำนวณตามมาตรฐานสภาการพยาบาลและกระทรวงสาธารณสุข:
            </div>
            <p className="font-mono bg-white p-2 rounded border border-slate-200 text-teal-900 leading-relaxed text-[11px]">
              FTE Required = [ภาระงานพยาบาลต่อวัน ({((currentResult.totalWorkloadHours / 0.45)).toFixed(1)} ชม.) × 365 วัน] ÷ 1,830 ชม.ทำงานประสิทธิผล/คน/ปี
            </p>
            <p className="text-[11px] text-slate-500 leading-snug">
              * คำนวณจากกรอบอัตรากำลังพยาบาลวิชาชีพ (RN) โดยหักวันหยุดราชการ วันลาพักผ่อน และวันลาป่วยเฉลี่ยตามเกณฑ์กระทรวงสาธารณสุข
            </p>
          </div>

          {/* Shift Allocation Ratio (45:35:20) */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-800">
              การกระจายอัตรากำลังตามช่วงเวรมาตรฐาน (Shift Weight Distribution)
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">เวรเช้า (45%)</span>
                <span className="text-slate-500 font-mono text-[11px]">หัตถการ & ตรวจรักษา</span>
                <div className="mt-1 font-bold text-teal-700 font-mono">
                  {Math.round(currentResult.fteActual * 0.45)} คน/วัน
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">เวรบ่าย (35%)</span>
                <span className="text-slate-500 font-mono text-[11px]">เฝ้าระวัง & ให้ยาเย็น</span>
                <div className="mt-1 font-bold text-teal-700 font-mono">
                  {Math.round(currentResult.fteActual * 0.35)} คน/วัน
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-900 block">เวรดึก (20%)</span>
                <span className="text-slate-500 font-mono text-[11px]">เฝ้าระวังวิกฤต & ฉุกเฉิน</span>
                <div className="mt-1 font-bold text-teal-700 font-mono">
                  {Math.max(2, Math.round(currentResult.fteActual * 0.20))} คน/วัน
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Safe Staffing & RN Allocation */}
        <div className="lg:col-span-6 bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-700" />
              การวิเคราะห์ความปลอดภัยในการจัดเวร (RN Safe Staffing Standards)
            </h3>
            <span className="text-xs font-mono text-slate-400">RN 100% Focus</span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            สงวนหัตถการวิกฤต การให้ยาฉีด สารน้ำทางหลอดเลือดดำ การประเมินสัญญาณเตือนภัย EWS และการช่วยชีวิตฉุกเฉินให้พยาบาลวิชาชีพ (RN) ปฏิบัติงานครอบคลุมตลอด 24 ชั่วโมง
          </p>

          <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-teal-950">สถานะอัตรากำลังพยาบาลวิชาชีพ (RN):</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                พยาบาลวิชาชีพ 100%
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-teal-100">
                <span className="text-[11px] text-slate-500 block">ขึ้นปฏิบัติการจริงในเวร:</span>
                <span className="text-base font-bold font-mono text-teal-900">
                  RN {currentResult.staffOnDutySummary.rn} อัตรา
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-teal-100">
                <span className="text-[11px] text-slate-500 block">ชั่วโมงปฏิบัติการรวม:</span>
                <span className="text-base font-bold font-mono text-teal-900">
                  {currentResult.totalPaidStaffHours} ชม.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-teal-200/60">
              <span className="text-slate-600">อัตราส่วนผู้ป่วยต่อ RN 1 คน:</span>
              <span className="font-mono font-bold text-teal-900">
                1 : {currentResult.totalCensus > 0 && currentResult.staffOnDutySummary.rn > 0
                  ? (currentResult.totalCensus / currentResult.staffOnDutySummary.rn).toFixed(1)
                  : 0} ราย
              </span>
            </div>
          </div>

          {/* Clinical Safety Alert */}
          <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-700 leading-relaxed">
            <span className="font-bold text-slate-900 block mb-1">เกณฑ์ความปลอดภัยวิชาชีพ:</span>
            ในแผนกอุบัติเหตุฉุกเฉิน (ER), ห้องคลอด (LR) และหอผู้ป่วยใน 2 (IPD 2 กึ่งวิกฤต) ต้องจัดพยาบาลวิชาชีพ (RN) ประจำการไม่น้อยกว่า <strong>2 - 4 อัตราต่อเวร</strong>{' '}
            เพื่อความปลอดภัยสูงสุดในการช่วยฟื้นคืนชีพ (CPR) และการเตรียมพร้อมดูแลผู้ป่วยส่งต่อทางไกล 220 กม. สู่โรงพยาบาลศูนย์
          </div>
        </div>
      </div>

      {/* Dynamic Shift Rebalancing Simulator */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-purple-700" />
              เครื่องมือจำลองการเกลี่ยอัตรากำลังฉุกเฉินข้ามแผนก (Shift Rebalancing Simulator)
            </h3>
            <p className="text-xs text-slate-500">
              ทดสอบผลลัพธ์ของการหมุนเวียนพยาบาล (Float Pool) จากแผนกที่มีภาระงานต่ำไปยังแผนกวิกฤต
            </p>
          </div>
          <button
            onClick={() => setSimulationActive(!simulationActive)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
              simulationActive
                ? 'bg-purple-700 text-white border-purple-700 shadow-xs'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {simulationActive ? 'กำลังแสดงผลการจำลอง' : 'เปิดการจำลอง (Run Simulation)'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Source Department */}
          <div className="md:col-span-5 p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
            <label className="text-xs font-bold text-slate-700 block">
              1. แผนกต้นทาง (ส่งพยาบาลไปช่วย):
            </label>
            <select
              value={sourceDept}
              onChange={(e) => setSourceDept(e.target.value as DepartmentId)}
              className="w-full text-xs font-bold p-2 border border-slate-300 rounded-md bg-white"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (ปัจจุบัน {deptResults[d.id]?.productivityPercent}%)
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-600 flex justify-between pt-1">
              <span>Productivity ก่อนเกลี่ย:</span>
              <span className="font-mono font-bold text-slate-800">{sourceRes?.productivityPercent}%</span>
            </div>
            {simulationActive && (
              <div className="text-xs text-purple-900 bg-purple-50 p-2 rounded border border-purple-200 flex justify-between font-bold">
                <span>Productivity หลังเกลี่ย:</span>
                <span className="font-mono">{simulatedSourceProd}%</span>
              </div>
            )}
          </div>

          {/* Transfer Arrow & Count */}
          <div className="md:col-span-2 flex flex-col items-center justify-center space-y-1 py-2">
            <div className="text-xs font-bold text-slate-600">ยืมอัตรากำลัง</div>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="3"
                value={movedStaffCount}
                onChange={(e) => setMovedStaffCount(Math.max(1, Number(e.target.value)))}
                className="w-12 text-center font-bold text-xs p-1 border rounded bg-white font-mono"
              />
              <span className="text-xs text-slate-500">คน</span>
            </div>
            <ArrowRight className="w-5 h-5 text-purple-600 my-1" />
          </div>

          {/* Target Department */}
          <div className="md:col-span-5 p-4 rounded-lg border border-purple-200 bg-purple-50/20 space-y-2">
            <label className="text-xs font-bold text-purple-900 block">
              2. แผนกปลายทาง (รับการสนับสนุน):
            </label>
            <select
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value as DepartmentId)}
              className="w-full text-xs font-bold p-2 border border-purple-300 rounded-md bg-white text-purple-950"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (ปัจจุบัน {deptResults[d.id]?.productivityPercent}%)
                </option>
              ))}
            </select>
            <div className="text-xs text-slate-600 flex justify-between pt-1">
              <span>Productivity ก่อนเกลี่ย:</span>
              <span className="font-mono font-bold text-red-600">{targetRes?.productivityPercent}%</span>
            </div>
            {simulationActive && (
              <div className="text-xs text-emerald-900 bg-emerald-50 p-2 rounded border border-emerald-200 flex justify-between font-bold">
                <span>Productivity หลังเกลี่ย:</span>
                <span className="font-mono">{simulatedTargetProd}% (ลดสู่ Safe Zone)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
