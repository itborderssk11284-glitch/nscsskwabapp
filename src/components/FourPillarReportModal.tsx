import React from 'react';
import {
  X,
  Printer,
  Download,
  Building2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  AlertTriangle,
  Award,
  Calendar
} from 'lucide-react';
import { FourPillarReport, NursingActivity, ReportTimeframe } from '../types/nursing';
import { SANGKHLABURI_HOSPITAL_META } from '../data/mockNursingData';
import { HospitalLogo } from './HospitalLogo';

interface FourPillarReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: FourPillarReport;
  activities: NursingActivity[];
  timeframe: ReportTimeframe;
  onSelectTimeframe: (tf: ReportTimeframe) => void;
}

export const FourPillarReportModal: React.FC<FourPillarReportModalProps> = ({
  isOpen,
  onClose,
  report,
  activities,
  timeframe,
  onSelectTimeframe,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const getTimeframeBadge = (tf: ReportTimeframe) => {
    switch (tf) {
      case 'daily':
        return 'รายงานประจำวัน (Daily)';
      case 'monthly':
        return 'รายงานประจำเดือน (Monthly)';
      case 'yearly':
        return 'รายงานประจำปี (Yearly)';
    }
  };

  const handleExportText = () => {
    const textContent = `
================================================================================
${SANGKHLABURI_HOSPITAL_META.nameTh} (${SANGKHLABURI_HOSPITAL_META.province})
กลุ่มงานการพยาบาล
${SANGKHLABURI_HOSPITAL_META.systemName}
${report.reportTitle}
รอบเวลา: ${getTimeframeBadge(timeframe)}
วันที่ออกรายงาน: ${report.generatedAt}
ผู้จัดทำ: ${report.authorName} (${report.authorRole})
================================================================================

[สรุปผู้บริหาร (Executive Summary)]
${report.executiveSummary}

--------------------------------------------------------------------------------
[ตารางจำแนกค่างานและเวลามาตรฐาน (Job Valuation Table)]
กิจกรรมทั้งหมดในสารบบ: ${activities.length} รายการ
- Direct Care: ${report.jobValuationSummary.directSharePercent}% ของภาระงาน
- Indirect Care: ${report.jobValuationSummary.indirectSharePercent}% ของภาระงาน
- Unit-Related: ${report.jobValuationSummary.unitRelatedSharePercent}% ของภาระงาน

รายการหลัก (ตัวอย่างมาตรฐาน):
${activities
  .slice(0, 10)
  .map(
    (a) =>
      `• [${a.code}] ${a.titleTh} | เวลามาตรฐาน: ${a.standardMinutes} นาที | ความเสี่ยง: ${a.complexity} | ผู้ปฏิบัติ: ${a.skillReq}`
  )
  .join('\n')}

--------------------------------------------------------------------------------
[การคำนวณอัตรากำลังและ Productivity]
- แผนกเป้าหมาย: ${report.targetDepartment}
- รอบเวลา: ${report.periodLabel}
- จำนวนผู้ป่วย: ${report.productivityMetrics.totalCensus} ราย
- ชั่วโมงค่างานมาตรฐานรวม (Earned Workload): ${report.productivityMetrics.totalWorkloadHours} ชม.
- ชั่วโมงพยาบาลจ่ายจริง (Paid Hours): ${report.productivityMetrics.totalPaidStaffHours} ชม.
- ผลิตภาพ (Productivity Rate): ${report.productivityMetrics.productivityPercent}% (สถานะ: ${report.productivityMetrics.status})
- NHPPD จริง: ${report.productivityMetrics.nhppdActual} ชม./คน/วัน (เป้าหมาย: ${report.productivityMetrics.nhppdTarget})
- อัตรากำลังพยาบาลจริง (Actual FTE): ${report.productivityMetrics.fteActual} อัตรา
- อัตรากำลังพยาบาลที่ต้องการคำนวณ (Required FTE): ${report.productivityMetrics.fteRequired} FTE
- ส่วนต่างกำลังคน (FTE Gap): ${report.productivityMetrics.fteGap}
- อัตรากำลังพยาบาลวิชาชีพปฏิบัติการจริง (RN): 100% (RN ${report.productivityMetrics.staffOnDutySummary.rn} อัตรา)

--------------------------------------------------------------------------------
[ข้อเสนอแนะเชิงกลยุทธ์ตามมาตรฐานสากล]

1. แนวทางการลด LEAN (ลดขั้นตอนที่ไม่สร้างคุณค่า):
${report.strategicRecommendations.leanOpportunities.map((o) => `   - ${o}`).join('\n')}

2. การปรับปรุงสวัสดิภาพพยาบาล (Burnout Prevention):
${report.strategicRecommendations.burnoutPreventionActions.map((b) => `   - ${b}`).join('\n')}

3. การรักษามาตรฐานความปลอดภัยของผู้ป่วย (Patient Safety):
${report.strategicRecommendations.patientSafetyControls.map((s) => `   - ${s}`).join('\n')}

================================================================================
ลงชื่อ: ....................................................
      (${report.authorName})
      ${report.authorRole}
================================================================================
    `;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `รายงานค่างานพยาบาล_${report.targetDepartment}_${timeframe}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[94vh] flex flex-col border border-slate-200 overflow-hidden">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="px-6 py-3 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-400" />
            <div>
              <span className="text-sm font-bold tracking-tight block">
                เอกสารรายงาน 4 เสาหลัก (4-Pillar Official Report)
              </span>
              <span className="text-[11px] text-teal-300">
                {SANGKHLABURI_HOSPITAL_META.nameTh} · {report.targetDepartment}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto">
            {/* Timeframe switchers in modal */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-md border border-slate-700">
              <button
                onClick={() => onSelectTimeframe('daily')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  timeframe === 'daily' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                รายวัน
              </button>
              <button
                onClick={() => onSelectTimeframe('monthly')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  timeframe === 'monthly' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                รายเดือน
              </button>
              <button
                onClick={() => onSelectTimeframe('yearly')}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  timeframe === 'yearly' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                รายปี
              </button>
            </div>

            <button
              onClick={handleExportText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลด</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 rounded-md transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-md transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-slate-800 bg-white" id="printable-report">
          {/* Official Document Header with Hospital Logo */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full border border-slate-200 p-0.5 shadow-xs flex items-center justify-center shrink-0">
                  <HospitalLogo size="lg" />
                </div>

                <div>
                  <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {SANGKHLABURI_HOSPITAL_META.nameTh}
                  </h1>
                  <p className="text-xs font-medium text-slate-600">
                    กลุ่มงานการพยาบาล · {SANGKHLABURI_HOSPITAL_META.systemName}
                  </p>
                  <h2 className="text-base font-bold text-teal-900 mt-1">
                    {report.reportTitle}
                  </h2>
                </div>
              </div>

              <div className="text-right text-xs text-slate-500 font-mono space-y-0.5">
                <div>รหัสเอกสาร: SKL-NUR-2026</div>
                <div>รอบการวิเคราะห์: <strong className="text-slate-800">{getTimeframeBadge(timeframe)}</strong></div>
                <div>วันที่ออกรายงาน: {report.generatedAt}</div>
                <div>ผู้รับผิดชอบ: {report.authorName}</div>
              </div>
            </div>
          </div>

          {/* Section 1: สรุปผู้บริหาร (Executive Summary) */}
          <section className="space-y-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-800 inline-block" />
              [สรุปผู้บริหาร (Executive Summary)]
            </h3>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed font-normal">
              {report.executiveSummary}
            </div>
          </section>

          {/* Section 2: ตารางจำแนกค่างานและเวลามาตรฐาน (Job Valuation Table) */}
          <section className="space-y-2">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-800 inline-block" />
              [ตารางจำแนกค่างานและเวลามาตรฐาน (Job Valuation Table)]
            </h3>
            <p className="text-xs text-slate-500">
              จำแนกตามมาตรฐาน 3 เสากิจกรรม (Direct Care, Indirect Care, Unit-Related) อิงเกณฑ์ Time & Motion Study
            </p>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2.5 px-3 text-left">รหัส</th>
                    <th className="py-2.5 px-3 text-left">กิจกรรมการพยาบาล</th>
                    <th className="py-2.5 px-3 text-center">หมวดหมู่</th>
                    <th className="py-2.5 px-3 text-center">เวลามาตรฐาน (นาที)</th>
                    <th className="py-2.5 px-3 text-center">ระดับความเสี่ยง</th>
                    <th className="py-2.5 px-3 text-center">คุณสมบัติผู้ปฏิบัติ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {activities.slice(0, 10).map((act) => (
                    <tr key={act.id}>
                      <td className="py-2 px-3 font-mono font-bold text-slate-800">{act.code}</td>
                      <td className="py-2 px-3 font-medium text-slate-900">{act.titleTh}</td>
                      <td className="py-2 px-3 text-center">
                        <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          {act.category === 'direct'
                            ? 'Direct'
                            : act.category === 'indirect'
                            ? 'Indirect'
                            : 'Unit'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-teal-800">
                        {act.standardMinutes}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                            act.complexity === 'Critical'
                              ? 'text-red-700 bg-red-50'
                              : act.complexity === 'High'
                              ? 'text-amber-800 bg-amber-50'
                              : 'text-slate-700 bg-slate-100'
                          }`}
                        >
                          {act.complexity}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center text-slate-600 text-[11px] font-semibold">
                        {act.skillReq === 'RN_ONLY' ? 'RN เฉพาะทาง' : 'RN ทั่วไป'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-[11px] text-slate-500 text-right">
              * แสดงรายการสำคัญ 10 ลำดับแรกจากฐานข้อมูลมาตรฐาน {activities.length} รายการ
            </div>
          </section>

          {/* Section 3: การคำนวณอัตรากำลังและ Productivity */}
          <section className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-800 inline-block" />
              [การคำนวณอัตรากำลังและ Productivity] - {getTimeframeBadge(timeframe)}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">จำนวนผู้ป่วย (Census)</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {report.productivityMetrics.totalCensus} ราย
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">ผลิตภาพ (Productivity)</span>
                <span className="text-lg font-bold font-mono text-teal-800">
                  {report.productivityMetrics.productivityPercent}%
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">NHPPD จริง</span>
                <span className="text-lg font-bold font-mono text-slate-900">
                  {report.productivityMetrics.nhppdActual} ชม.
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block">ส่วนต่างอัตรากำลัง (FTE Gap)</span>
                <span
                  className={`text-lg font-bold font-mono ${
                    report.productivityMetrics.fteGap < 0 ? 'text-red-700' : 'text-emerald-700'
                  }`}
                >
                  {report.productivityMetrics.fteGap > 0
                    ? `+${report.productivityMetrics.fteGap}`
                    : report.productivityMetrics.fteGap}{' '}
                  FTE
                </span>
              </div>
            </div>

            {/* Formula Details */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-700 font-mono">
              <div>• ชั่วโมงภาระงานมาตรฐาน ({getTimeframeBadge(timeframe)}) = {report.productivityMetrics.totalWorkloadHours} ชม.</div>
              <div>• ชั่วโมงพยาบาลจ่ายจริง = {report.productivityMetrics.totalPaidStaffHours} ชม.</div>
              <div>• อัตรากำลังปฏิบัติการจริง (RN Staffing) = พยาบาลวิชาชีพ RN 100% ({report.productivityMetrics.staffOnDutySummary.rn} อัตรา)</div>
            </div>
          </section>

          {/* Section 4: ข้อเสนอแนะเชิงกลยุทธ์ตามมาตรฐานสากล */}
          <section className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-4 bg-teal-800 inline-block" />
              [ข้อเสนอแนะเชิงกลยุทธ์ตามมาตรฐานสากล]
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* LEAN Column */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-teal-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700" />
                  1. การลด LEAN (ลดความสูญเปล่า)
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  {report.strategicRecommendations.leanOpportunities.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-teal-700">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Burnout Prevention Column */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                  2. การปรับปรุงสวัสดิภาพพยาบาล (Burnout)
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  {report.strategicRecommendations.burnoutPreventionActions.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-purple-700">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Patient Safety Column */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-red-900 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
                  3. ความปลอดภัยของผู้ป่วย (Patient Safety)
                </h4>
                <ul className="text-xs text-slate-600 space-y-1.5 leading-relaxed">
                  {report.strategicRecommendations.patientSafetyControls.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-red-700">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Official Sign-off Footer */}
          <div className="pt-8 border-t border-slate-300 mt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-600">
            <div>
              <div className="h-12 flex items-end justify-center">
                <span className="border-b border-dotted border-slate-400 w-48 block" />
              </div>
              <div className="mt-2 font-bold text-slate-900">{report.authorName}</div>
              <div className="text-[11px] text-slate-500">{report.authorRole}</div>
              <div className="text-[10px] text-slate-400">ผู้จัดทำรายงานค่างาน</div>
            </div>

            <div>
              <div className="h-12 flex items-end justify-center">
                <span className="border-b border-dotted border-slate-400 w-48 block" />
              </div>
              <div className="mt-2 font-bold text-slate-900">พว. นงลักษณ์ สิทธิวัฒน์</div>
              <div className="text-[11px] text-slate-500">หัวหน้ากลุ่มงานการพยาบาล (CNO)</div>
              <div className="text-[10px] text-slate-400">ผู้อนุมัติกรอบอัตรากำลังและผลิตภาพ</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
