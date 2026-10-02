import React from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Users,
  Activity,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ChevronRight,
  FileText,
  Clock,
  Sparkles,
  MapPin,
  Calendar
} from 'lucide-react';
import { DepartmentId, DepartmentInfo, ProductivityCalculationResult, ReportTimeframe } from '../types/nursing';
import { SANGKHLABURI_HOSPITAL_META, DEPARTMENTS } from '../data/mockNursingData';
import { HospitalLogo } from './HospitalLogo';

interface ExecutiveSummaryViewProps {
  deptResults: Record<DepartmentId, ProductivityCalculationResult>;
  onSelectDepartment: (deptId: DepartmentId) => void;
  onNavigateToTab: (tabId: string) => void;
  onOpenReportModal: () => void;
  timeframe: ReportTimeframe;
  onSelectTimeframe: (tf: ReportTimeframe) => void;
}

export const ExecutiveSummaryView: React.FC<ExecutiveSummaryViewProps> = ({
  deptResults,
  onSelectDepartment,
  onNavigateToTab,
  onOpenReportModal,
  timeframe,
  onSelectTimeframe,
}) => {
  const resultsArray = Object.values(deptResults);

  const avgProductivity =
    resultsArray.reduce((acc, r) => acc + r.productivityPercent, 0) / (resultsArray.length || 1);

  const totalCensus = resultsArray.reduce((acc, r) => acc + r.totalCensus, 0);
  const totalFteActual = resultsArray.reduce((acc, r) => acc + r.fteActual, 0);
  const totalFteRequired = resultsArray.reduce((acc, r) => acc + r.fteRequired, 0);
  const netFteGap = totalFteActual - totalFteRequired;

  const criticalWards = resultsArray.filter((r) => r.status === 'Critical_Overwork');
  const strainedWards = resultsArray.filter((r) => r.status === 'Strained');
  const optimalWards = resultsArray.filter((r) => r.status === 'Optimal');
  const underutilizedWards = resultsArray.filter((r) => r.status === 'Underutilized');

  const getTimeframeLabel = (tf: ReportTimeframe) => {
    switch (tf) {
      case 'daily':
        return 'รายงานประจำวัน (Daily)';
      case 'monthly':
        return 'รายงานประจำเดือน (Monthly)';
      case 'yearly':
        return 'รายงานประจำปี (Yearly)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Official Hospital Header with Logo (No building photo as requested) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            {/* Hospital Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white border border-slate-200 p-1 shadow-sm flex items-center justify-center shrink-0">
              <HospitalLogo size="xl" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-teal-800 uppercase tracking-wider mb-1">
                <MapPin className="w-3.5 h-3.5 text-teal-700" />
                <span>{SANGKHLABURI_HOSPITAL_META.province} · {SANGKHLABURI_HOSPITAL_META.region}</span>
                <span>·</span>
                <span className="text-slate-500 font-normal">{SANGKHLABURI_HOSPITAL_META.type}</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {SANGKHLABURI_HOSPITAL_META.systemName}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                ระบบกำกับติดตามและวิเคราะห์ค่างานการพยาบาล 5 แผนกหลัก (ER, IPD 1, IPD 2, OPD, LR)
                ตามมาตรฐานสากล Time & Motion Study, NHPPD และ Skill Mix Optimization เพื่อการจัดสรรอัตรากำลังที่ปลอดภัยและสะท้อนภาระงานจริง
              </p>
            </div>
          </div>

          {/* Timeframe Selector Pill Box */}
          <div className="flex flex-col items-start md:items-end justify-between self-stretch shrink-0 pt-4 md:pt-0 border-t md:border-0 border-slate-100">
            <span className="text-xs text-slate-500 font-bold mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>เลือกรอบระยะเวลารายงาน:</span>
            </span>
            <div className="inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => onSelectTimeframe('daily')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  timeframe === 'daily'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายวัน
              </button>
              <button
                onClick={() => onSelectTimeframe('monthly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  timeframe === 'monthly'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => onSelectTimeframe('yearly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  timeframe === 'yearly'
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                รายปี
              </button>
            </div>
            <span className="text-[11px] text-teal-800 font-semibold mt-2 font-mono">
              {getTimeframeLabel(timeframe)}
            </span>
          </div>
        </div>

        {/* Operational Highlights */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-slate-100">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">เตียงที่เปิดให้บริการจริง</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {SANGKHLABURI_HOSPITAL_META.totalBeds} เตียง (5 แผนก)
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">อัตราครองเตียงเฉลี่ย</span>
            <span className="text-lg font-bold text-teal-700 font-mono tabular-nums">
              {SANGKHLABURI_HOSPITAL_META.averageOccupancyRate}%
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">ระยะทางส่งต่อฉุกเฉิน</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {SANGKHLABURI_HOSPITAL_META.distanceToReferralHubKm} กม. (รพ.พหลฯ)
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <span className="text-xs text-slate-500 block">พยาบาลทั้งหมดในระบบ</span>
            <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
              {totalFteActual} อัตรา
            </span>
          </div>
        </div>
      </div>

      {/* Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Productivity Average */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              ผลิตภาพรวม 5 แผนก ({timeframe === 'yearly' ? 'รายปี' : timeframe === 'monthly' ? 'รายเดือน' : 'รายวัน'})
            </span>
            <Activity className="w-4 h-4 text-teal-600" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {avgProductivity.toFixed(1)}%
            </div>
            <div className="text-xs mt-1 flex items-center gap-1.5">
              {avgProductivity >= 85 && avgProductivity <= 100 ? (
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> อยู่ในเกณฑ์เป้าหมาย (85-100%)
                </span>
              ) : avgProductivity > 100 ? (
                <span className="text-amber-700 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> เกินเพดานความปลอดภัย
                </span>
              ) : (
                <span className="text-sky-700 font-medium flex items-center gap-1">
                  <TrendingDown className="w-3.5 h-3.5" /> ต่ำกว่าเกณฑ์ ควรหมุนเวียนเวร
                </span>
              )}
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full ${
                avgProductivity > 100 ? 'bg-amber-500' : avgProductivity >= 85 ? 'bg-teal-600' : 'bg-sky-500'
              }`}
              style={{ width: `${Math.min(100, avgProductivity)}%` }}
            />
          </div>
        </div>

        {/* Card 2: Safe Staffing Status */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              สถานะอัตรากำลังรวม (FTE Gap)
            </span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {netFteGap >= 0 ? `+${netFteGap.toFixed(1)}` : netFteGap.toFixed(1)} FTE
            </div>
            <p className="text-xs text-slate-500 mt-1">
              จริง {totalFteActual} อัตรา · คำนวณต้องการ {totalFteRequired.toFixed(1)} FTE
            </p>
          </div>
          <div className="text-[11px] text-slate-600 border-t border-slate-100 pt-2 flex items-center justify-between">
            <span>เกณฑ์ทำงานประสิทธิผล:</span>
            <span className="font-mono text-slate-800">1,830 ชม./คน/ปี</span>
          </div>
        </div>

        {/* Card 3: Ward Stress Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              สัดส่วนความตึงตัว (5 แผนก)
            </span>
            <ShieldAlert className="w-4 h-4 text-purple-600" />
          </div>
          <div className="my-2 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">เกินเกณฑ์ (&gt;100%):</span>
              <span className="font-bold text-red-600 font-mono">{criticalWards.length + strainedWards.length} แผนก</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">สมดุลปลอดภัย (85-100%):</span>
              <span className="font-bold text-emerald-600 font-mono">{optimalWards.length} แผนก</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">มีกำลังสำรอง (&lt;80%):</span>
              <span className="font-bold text-sky-600 font-mono">{underutilizedWards.length} แผนก</span>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-2 text-[11px] text-slate-500">
            จับตาเป็นพิเศษ: <span className="font-semibold text-slate-700">ER, IPD 2</span>
          </div>
        </div>

        {/* Card 4: Actionable Quick Report */}
        <div className="bg-teal-900 p-5 rounded-xl border border-teal-800 shadow-xs text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-teal-200 text-xs font-semibold uppercase tracking-wider">
              <span>รายงาน 4 เสาหลัก</span>
              <Sparkles className="w-4 h-4 text-teal-300" />
            </div>
            <div className="mt-2 text-base font-bold text-white">
              พิมพ์รายงานสรุปผู้บริหาร
            </div>
            <p className="text-xs text-teal-100 mt-1 leading-relaxed">
              ออกเอกสารราชการทางการพยาบาล ครอบคลุมรอบ {getTimeframeLabel(timeframe)}
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-teal-800/80">
            <button
              onClick={onOpenReportModal}
              className="w-full py-2 px-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>เปิดดูและพิมพ์รายงาน</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Section 1: สรุปผู้บริหาร (Executive Summary) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-5 bg-teal-700 rounded-xs" />
          <h2 className="text-base font-bold text-slate-900">
            [สรุปผู้บริหาร (Executive Summary)] - {getTimeframeLabel(timeframe)}
          </h2>
        </div>
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm text-slate-800 leading-relaxed space-y-2">
          <p>
            ภาพรวมภาระงานการพยาบาลของ <strong>โรงพยาบาลสังขละบุรี</strong> ใน 5 แผนกหลัก (ER, IPD 1, IPD 2, OPD, LR)
            มีอัตราผลิตภาพเฉลี่ยอยู่ที่ <strong className="text-teal-800 font-mono">{avgProductivity.toFixed(1)}%</strong>{' '}
            ซึ่งอยู่ในเกณฑ์ควบคุมได้ แต่พบภาระงานหนักหน่วงใน <strong>แผนกอุบัติเหตุฉุกเฉิน (ER)</strong> และ{' '}
            <strong>หอผู้ป่วยใน 2 (IPD 2 - ศัลยกรรม/กึ่งวิกฤต)</strong> ที่มี Productivity เกิน{' '}
            <strong className="text-red-700 font-mono">105%</strong> อันเนื่องมาจากภารกิจส่งต่อฉุกเฉิน 220 กม. และการดูแลผู้ป่วยบาดเจ็บกระดูกและผ่าตัด
          </p>
          <p>
            การนำระบบ <strong>Float Pool Team (ทีมพยาบาลหมุนเวียนสนับสนุน)</strong> มาใช้เกลี่ยอัตรากำลังระหว่างแผนกผู้ป่วยนอก (OPD)
            และหอผู้ป่วยใน 1 ในช่วงที่มีภาระงานเบาบาง จะช่วยลดความเสี่ยงต่อภาวะหมดไฟ (Burnout Prevention) ของพยาบาลด่านหน้า
            และรักษาอัตราส่วนการดูแลให้ปลอดภัยตามมาตรฐานสากล
          </p>
        </div>
      </div>

      {/* 5 Departments Grid (ER, IPD1, IPD2, OPD, LR) */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              สถานะผลิตภาพและการใช้ประโยชน์กำลังคนทั้ง 5 แผนก (ER · IPD 1 · IPD 2 · OPD · LR)
            </h3>
            <p className="text-xs text-slate-500">
              วิเคราะห์เปรียบเทียบ NHPPD และอัตรากำลังพยาบาลตามข้อมูลภาระงานจริง
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('calculator')}
            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>ไปที่หน้าคำนวณจำลองเวร</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {DEPARTMENTS.map((dept) => {
            const res = deptResults[dept.id];
            if (!res) return null;

            const isCritical = res.status === 'Critical_Overwork';
            const isStrained = res.status === 'Strained';
            const isOptimal = res.status === 'Optimal';

            return (
              <div
                key={dept.id}
                className={`p-4 rounded-xl border transition-all hover:shadow-xs flex flex-col justify-between ${
                  isCritical
                    ? 'border-red-300 bg-red-50/30'
                    : isStrained
                    ? 'border-amber-300 bg-amber-50/20'
                    : isOptimal
                    ? 'border-slate-200 bg-white'
                    : 'border-sky-200 bg-sky-50/20'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{dept.name}</h4>
                      <span className="text-[11px] text-slate-500 block">{dept.nameEn}</span>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-sm ${
                        isCritical
                          ? 'text-red-700 bg-red-100'
                          : isStrained
                          ? 'text-amber-800 bg-amber-100'
                          : isOptimal
                          ? 'text-emerald-800 bg-emerald-100'
                          : 'text-sky-800 bg-sky-100'
                      }`}
                    >
                      {res.status === 'Critical_Overwork'
                        ? 'วิกฤตภาระงานสูง'
                        : res.status === 'Strained'
                        ? 'ตึงตัว'
                        : res.status === 'Optimal'
                        ? 'สมดุลปลอดภัย'
                        : 'มีกำลังคนสำรอง'}
                    </span>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 my-3 py-2 border-y border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Productivity</span>
                      <span
                        className={`text-base font-bold font-mono ${
                          isCritical
                            ? 'text-red-700'
                            : isStrained
                            ? 'text-amber-700'
                            : isOptimal
                            ? 'text-teal-700'
                            : 'text-sky-700'
                        }`}
                      >
                        {res.productivityPercent}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">NHPPD จริง</span>
                      <span className="text-base font-bold text-slate-800 font-mono">
                        {res.nhppdActual} <span className="text-[10px] font-normal text-slate-400">ชม.</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">ผู้ป่วยในเวร</span>
                      <span className="text-base font-bold text-slate-800 font-mono">
                        {res.totalCensus} <span className="text-[10px] font-normal text-slate-400">ราย</span>
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">พยาบาลประจำแผนก:</span>
                      <span className="font-medium text-slate-800">
                        พยาบาลวิชาชีพ RN {dept.currentStaffCount.rn} อัตรา
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">ดัชนีความเหนื่อยล้า:</span>
                      <span
                        className={`font-mono font-semibold ${
                          res.fatigueRiskScore > 60 ? 'text-red-600' : 'text-slate-700'
                        }`}
                      >
                        {res.fatigueRiskScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    หัวหน้าเวร: {dept.leadNurseName}
                  </span>
                  <button
                    onClick={() => {
                      onSelectDepartment(dept.id);
                      onNavigateToTab('calculator');
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-900 transition-colors"
                  >
                    <span>คำนวณภาระงาน</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
