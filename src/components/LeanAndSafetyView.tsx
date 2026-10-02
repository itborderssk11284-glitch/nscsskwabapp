import React, { useState } from 'react';
import {
  ShieldCheck,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Heart,
  FileCheck,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';

export const LeanAndSafetyView: React.FC = () => {
  const [activeStrategyTab, setActiveStrategyTab] = useState<'lean' | 'burnout' | 'safety'>('lean');

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              [ข้อเสนอแนะเชิงกลยุทธ์ตามมาตรฐานสากล (Strategic Recommendations)]
            </h2>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-sm">
              LEAN · Burnout · Safety
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ยุทธศาสตร์ 3 มิติเพื่อเพิ่มประสิทธิภาพการทำงาน (Productivity) ควบคู่กับสวัสดิภาพพยาบาลและความปลอดภัยของผู้ป่วยในพื้นที่ชายแดนสังขละบุรี
          </p>
        </div>

        {/* Strategy Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setActiveStrategyTab('lean')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeStrategyTab === 'lean'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1. LEAN Healthcare
          </button>
          <button
            onClick={() => setActiveStrategyTab('burnout')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeStrategyTab === 'burnout'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            2. Burnout Prevention
          </button>
          <button
            onClick={() => setActiveStrategyTab('safety')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeStrategyTab === 'safety'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            3. Patient Safety
          </button>
        </div>
      </div>

      {/* Tab 1: LEAN Healthcare */}
      {activeStrategyTab === 'lean' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-600" />
                  การลดความสูญเปล่าในงานการพยาบาล (Eliminating Healthcare Muda)
                </h3>
                <span className="text-xs text-slate-500">
                  ปรับกระบวนการเพื่อคืนเวลาข้างเตียง (Bedside Care Time) ให้แก่พยาบาล
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                คาดการณ์ประหยัดเวลา: 45 - 60 นาที/พยาบาล/เวร
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* LEAN Initiative 1 */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    A. ยกเลิกการบันทึกกระดาษซ้ำซ้อน (Paperless Nursing Shift)
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">-20 นาที/คน</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>ปัญหาเดิม:</strong> พยาบาลจดข้อมูลสัญญาณชีพและบันทึกเวรลงสมุดรายงานเวรกระดาษ แล้วพิมพ์ซ้ำลงคอมพิวเตอร์ EMR อีกครั้ง (Double Charting)
                </p>
                <div className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-md border border-teal-100">
                  <strong>มาตรการ LEAN:</strong> บันทึกตรงผ่าน Tablet ข้างเตียง หรือใช้ระบบ Voice-to-Text ใน EMR ยกเลิกสมุดกระดาษ 100%
                </div>
              </div>

              {/* LEAN Initiative 2 */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    B. ระบบ 5S และ Visual Kanban ป้องกันเครื่องมือสูญหาย
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">-15 นาที/คน</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>ปัญหาเดิม:</strong> เสียเวลาเดินตามหาเครื่อง Infusion Pump, เครื่องวัดความดัน และสายต่อออกซิเจนที่ถูกยืมข้ามแผนก
                </p>
                <div className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-md border border-teal-100">
                  <strong>มาตรการ LEAN:</strong> กำหนดจุดจอดอุปกรณ์ (Equipment Parking Bay) พร้อมแท็กสีประจำหอผู้ป่วยและตรวจนับทุกต้นเวร
                </div>
              </div>

              {/* LEAN Initiative 3 */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    C. คู่มือสื่อสาร 3 ภาษา (ไทย-มอญ-กะเหรี่ยง) ในรูปแบบภาพ
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">-12 นาที/คน</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>ปัญหาเดิม:</strong> อุปสรรคทางภาษาทำให้ต้องตามหาล่ามและอธิบายคำแนะนำการใช้ยาหลายรอบ
                </p>
                <div className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-md border border-teal-100">
                  <strong>มาตรการ LEAN:</strong> จัดทำแผ่นสื่อสารข้างเตียง (Bedside Pictogram Card) มีภาพการกินยา การงดน้ำ-อาหาร และระดับความปวด
                </div>
              </div>

              {/* LEAN Initiative 4 */}
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    D. Pre-referral Checklist รถพยาบาลส่งต่อ 220 กม.
                  </span>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">-15 นาที/เคส</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>ปัญหาเดิม:</strong> การเตรียมส่งต่อผู้ป่วยฉุกเฉินไป รพ.พหลพลพยุหเสนา ผ่านเส้นทางภูเขา ใช้เวลาเตรียมเอกสารและยาฉุกเฉินกระจัดกระจาย
                </p>
                <div className="text-xs text-teal-800 bg-teal-50 p-2.5 rounded-md border border-teal-100">
                  <strong>มาตรการ LEAN:</strong> จัดทำ "กระเป๋ายาส่งต่อสำเร็จรูป (Referral Go-Bag)" บรรจุยา HAD และอุปกรณ์ช่วยหายใจพร้อมออกเดินทางทันที
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Burnout Prevention */}
      {activeStrategyTab === 'burnout' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-red-600" />
                  การป้องกันภาวะหมดไฟและบริหารความเสี่ยงความล้า (Fatigue Risk Management)
                </h3>
                <span className="text-xs text-slate-500">
                  ปกป้องสุขภาพจิตและสุขภาวะของทีมพยาบาลด่านหน้าชายแดน
                </span>
              </div>
              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                Wellbeing & Retention
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  กฎเหล็ก 16 ชั่วโมง (Max Consecutive Work Hours)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  ห้ามขึ้นเวรต่อเนื่องเกิน 16 ชั่วโมงติดต่อกัน (ห้ามเวรดึกต่อเวรเช้าโดยเด็ดขาด)
                  ต้องมีระยะเวลาพักผ่อนระหว่างเวรอย่างน้อย 16 ชั่วโมง เพื่อคืนความพร้อมของระบบประสาทและสมาธิ
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  การจัดเวรตามวงจรชีวภาพ (Forward-Rotating Roster)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  หมุนเวรไปข้างหน้าตามลำดับ: <strong>เวรเช้า → เวรบ่าย → เวรดึก → วันพัก (Off)</strong>{' '}
                  เพื่อลดการแปรปรวนของนาฬิกาชีวภาพ (Circadian Rhythm Disruption) ซึ่งเป็นสาเหตุหลักของอาการนอนไม่หลับเรื้อรัง
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  กลไก Float Pool Activation Threshold
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  หากหอผู้ป่วยใดมี Productivity เกิน <strong>105%</strong> ติดต่อกันเกิน 2 วัน
                  หัวหน้าพยาบาล (CNO) ต้องส่งพยาบาลกองกลางเข้าช่วยแบ่งเบาทันที ไม่ปล่อยให้หอผู้ป่วยแบกรับจนเกิดภาวะพังทลาย
                </p>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mindful Pause & Debriefing หลังเหตุวิกฤต
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  หลังการทำ CPR หรือการเสียชีวิตของผู้ป่วย ให้พักทีม 5 นาทีเพื่อคลายความเครียดสะสม (Psychological First Aid)
                  และทบทวนความรู้สึกก่อนกลับเข้าสู่การปฏิบัติหน้าที่ตามปกติ
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Patient Safety Standards */}
      {activeStrategyTab === 'safety' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700" />
                  การรักษามาตรฐานความปลอดภัยของผู้ป่วย (Patient Safety Controls)
                </h3>
                <span className="text-xs text-slate-500">
                  ยึดมั่นมาตรฐานสากล WHO Safe Care, JCI และ สถาบันรับรองคุณภาพสถานพยาบาล (สรพ. / HA Thailand)
                </span>
              </div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                Zero Harm Mandate
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1:2
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    เพดานอัตราส่วนพยาบาลต่อผู้ป่วยวิกฤต (Safe Nurse-to-Patient Ratio)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    ในหอผู้ป่วยวิกฤต (Sub-ICU) ห้ามอัตราส่วนเกิน 1:2 ต่อพยาบาลวิชาชีพ 1 คนโดยเด็ดขาด
                    และหากมีผู้ป่วยใส่ท่อช่วยหายใจ (Ventilator) หรือมีภาวะ Shock ต้องเป็น 1:1 เท่านั้นเพื่อป้องกัน VAP และสายหลุด
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2 RN
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    Independent Double-Check ก่อนบริหารยาเสี่ยงสูง (High Alert Drugs - HAD)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    ยากลุ่ม Insulin, Heparin, Inotropic agents, Potassium chloride ต้องผ่านการตรวจคำนวณและยืนยันตัวตนคนไข้
                    โดยพยาบาลวิชาชีพ 2 คนแยกตรวจอิสระพร้อมลงลายมือชื่อก่อนฉีดเข้าตัวผู้ป่วยทุกครั้ง
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  SBAR
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    การส่งเวรข้างเตียงด้วยโครงสร้าง SBAR (Bedside Handover Standard)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    ส่งมอบข้อมูลเคสข้างเตียงตามลำดับ Situation, Background, Assessment, Recommendation
                    พร้อมเปิดผ้าตรวจดูสายสวน IV, สายระบาย, และแผลร่วมกันต่อหน้าผู้ป่วย เพื่อให้ผู้ป่วยมีส่วนร่วมในการรักษา
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  NEWS
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    เกณฑ์เตือนภัยสัญญาณชีพทรุดตัวล่วงหน้า (Early Warning Score - NEWS/MEWS)
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    หากคะแนนเตือนภัย $\ge 4$ คะแนน หรือมีพารามิเตอร์ใดพุ่งขึ้นขีดแดง พยาบาลมีอำนาจตามแพทย์เวรทันที
                    และเตรียมอุปกรณ์กู้ชีพ Defibrillator / Suction ไว้ข้างเตียงล่วงหน้าภายใน 10 นาที
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
