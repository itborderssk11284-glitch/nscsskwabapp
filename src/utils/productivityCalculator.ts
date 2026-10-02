import {
  DepartmentId,
  DepartmentInfo,
  ShiftRosterData,
  ProductivityCalculationResult,
  NursingActivity,
  FourPillarReport,
  PatientAcuityType,
  ReportTimeframe,
  ShiftType
} from '../types/nursing';
import {
  ACUITY_STANDARDS,
  DEPARTMENTS,
  MASTER_NURSING_ACTIVITIES,
  SANGKHLABURI_HOSPITAL_META
} from '../data/mockNursingData';

export function calculateDepartmentProductivity(
  deptId: DepartmentId,
  roster: ShiftRosterData,
  activities: NursingActivity[] = MASTER_NURSING_ACTIVITIES,
  timeframe: ReportTimeframe = 'daily',
  deptInfoMap: Record<DepartmentId, DepartmentInfo> = DEPARTMENTS.reduce(
    (acc, d) => ({ ...acc, [d.id]: d }),
    {} as Record<DepartmentId, DepartmentInfo>
  )
): ProductivityCalculationResult {
  const dept = deptInfoMap[deptId] || DEPARTMENTS[0];
  const activeShift = roster.activeShift || 'morning';
  const shiftData = roster.shifts[activeShift] || roster.shifts.morning;

  // 1. Shift census
  const shiftCensus = Object.values(shiftData.censusByAcuity).reduce((sum, count) => sum + count, 0);

  // 2. Acuity-weighted standard hours for 24 hours
  let earnedAcuityHoursDaily = 0;
  for (const [acuityStr, count] of Object.entries(shiftData.censusByAcuity)) {
    const acuityType = Number(acuityStr) as PatientAcuityType;
    const stdHours = ACUITY_STANDARDS[acuityType]?.standardHoursPerDay || 2.0;
    earnedAcuityHoursDaily += count * stdHours;
  }

  // Shift weight (Morning: 45%, Afternoon: 35%, Night: 20%)
  const shiftWeight = activeShift === 'morning' ? 0.45 : activeShift === 'afternoon' ? 0.35 : 0.2;
  const shiftStandardHours = earnedAcuityHoursDaily * shiftWeight;

  // 3. ขั้นตอนที่ 1: คำนวณค่างานการพยาบาลโดยตรง (Direct Nursing Care)
  let directMinutes = 0;
  let loggedIndirectMins = 0;
  let loggedUnitMins = 0;

  const activityMap = new Map<string, NursingActivity>();
  activities.forEach((a) => activityMap.set(a.id, a));

  if (roster.completedActivities && roster.completedActivities.length > 0) {
    for (const item of roster.completedActivities) {
      const act = activityMap.get(item.activityId);
      if (act) {
        const totalActMins = act.standardMinutes * item.actualCount;
        if (act.category === 'direct') directMinutes += totalActMins;
        else if (act.category === 'indirect') loggedIndirectMins += totalActMins;
        else if (act.category === 'unit_related') loggedUnitMins += totalActMins;
      }
    }
  }

  // Base direct care hours (หากไม่มีการบันทึกกิจกรรมรายตัว ให้ใช้ 75% ของเวลามาตรฐาน Acuity ในเวรนั้น)
  if (directMinutes === 0) {
    directMinutes = shiftStandardHours * 60 * 0.75;
  }
  const baseDirectHours = directMinutes / 60;

  // 4. ขั้นตอนที่ 2: คำนวณค่างานภารกิจอื่น (Indirect Care & Unit-Related)
  // สามารถคำนวณได้ 2 วิธี:
  // • วิธีที่ 1: คิดเป็นเวลาคงที่ (Fixed Hours) เหมาะกับงานที่รู้เวลาแน่นอน
  // • วิธีที่ 2: คิดเป็นเปอร์เซ็นต์บวกเพิ่ม (Allowance Percentage: 15% - 25% ของเวลา Direct Care)
  const indirectConfig = roster.indirectConfig || {
    method: 'allowance_percentage',
    fixedHours: 2.0,
    allowancePercent: 20,
    fixedItems: [
      { id: 'fx-1', title: 'การรับ-ส่งเวรและสรุปยอดผู้ป่วย (Handover)', minutes: 45, enabled: true },
      { id: 'fx-2', title: 'การตรวจนับยาควบคุม ยาเสพติด และตู้ยา (Medication Check)', minutes: 25, enabled: true },
      { id: 'fx-3', title: 'ประชุม Morning Brief / มอบหมายงาน', minutes: 20, enabled: true },
      { id: 'fx-4', title: 'ตรวจเช็คอุปกรณ์ช่วยชีวิต & Defibrillator', minutes: 30, enabled: true },
    ],
  };

  let indirectAndUnitHours = 0;
  let methodLabel = '';

  if (indirectConfig.method === 'fixed_hours') {
    // วิธีที่ 1: คิดเป็นเวลาคงที่ / กิจกรรมตามตารางจำแนกค่างานและเวลามาตรฐาน (Job Valuation Table)
    if (indirectConfig.selectedActivityCounts && Object.keys(indirectConfig.selectedActivityCounts).length > 0) {
      let sumMins = 0;
      for (const [actId, count] of Object.entries(indirectConfig.selectedActivityCounts)) {
        if (count > 0) {
          const act = activityMap.get(actId);
          if (act) {
            sumMins += act.standardMinutes * count;
          }
        }
      }
      indirectAndUnitHours = sumMins > 0 ? Number((sumMins / 60).toFixed(2)) : (indirectConfig.fixedHours || 2.0);
      methodLabel = `วิธีที่ 1: เลือกตามตารางค่างานมาตรฐาน (${indirectAndUnitHours.toFixed(1)} ชม./เวร)`;
    } else if (indirectConfig.fixedItems && indirectConfig.fixedItems.length > 0) {
      const activeItemsMins = indirectConfig.fixedItems
        .filter((it) => it.enabled)
        .reduce((sum, it) => sum + it.minutes, 0);
      indirectAndUnitHours = activeItemsMins > 0 ? Number((activeItemsMins / 60).toFixed(2)) : (indirectConfig.fixedHours || 2.0);
      methodLabel = `วิธีที่ 1: คิดเป็นเวลาคงที่ (${indirectAndUnitHours.toFixed(1)} ชม./เวร)`;
    } else {
      indirectAndUnitHours = indirectConfig.fixedHours || 2.0;
      methodLabel = `วิธีที่ 1: คิดเป็นเวลาคงที่ (${indirectAndUnitHours.toFixed(1)} ชม./เวร)`;
    }
  } else {
    // วิธีที่ 2: คิดเป็นเปอร์เซ็นต์บวกเพิ่ม (Allowance Percentage: 15% - 25% ของ Direct Care)
    const pct = Math.max(5, Math.min(50, indirectConfig.allowancePercent || 20));
    indirectAndUnitHours = baseDirectHours * (pct / 100);
    methodLabel = `วิธีที่ 2: คิดเป็นเปอร์เซ็นต์บวกเพิ่ม (${pct}% ของเวลา Direct Care)`;
  }

  // แยกสัดส่วนระหว่าง Indirect Care และ Unit-Related ตามหมวดหมู่กิจกรรมจริง
  let baseIndirectHours = 0;
  let baseUnitHours = 0;

  if (
    indirectConfig.method === 'fixed_hours' &&
    indirectConfig.selectedActivityCounts &&
    Object.keys(indirectConfig.selectedActivityCounts).length > 0
  ) {
    let indMins = 0;
    let untMins = 0;
    for (const [actId, count] of Object.entries(indirectConfig.selectedActivityCounts)) {
      if (count > 0) {
        const act = activityMap.get(actId);
        if (act?.category === 'unit_related') {
          untMins += act.standardMinutes * count;
        } else {
          indMins += (act?.standardMinutes || 0) * count;
        }
      }
    }
    if (indMins + untMins > 0) {
      baseIndirectHours = Number((indMins / 60).toFixed(2));
      baseUnitHours = Number((untMins / 60).toFixed(2));
    } else {
      baseIndirectHours = Number((indirectAndUnitHours * 0.65).toFixed(2));
      baseUnitHours = Number((indirectAndUnitHours * 0.35).toFixed(2));
    }
  } else {
    baseIndirectHours = Number((indirectAndUnitHours * 0.65).toFixed(2));
    baseUnitHours = Number((indirectAndUnitHours * 0.35).toFixed(2));
  }
  const baseWorkloadHours = baseDirectHours + indirectAndUnitHours;

  // Staff on duty: ONLY RN (เฉพาะพยาบาลวิชาชีพ RN เท่านั้น)
  const onDutyRN = shiftData.onDutyStaff.rn;
  const onDutyNA = 0;
  const totalStaffOnDuty = onDutyRN;
  const basePaidHours = onDutyRN * 8; // 8 ชั่วโมงต่อพยาบาลวิชาชีพ 1 อัตรา

  // Multiplier based on timeframe
  let timeframeMultiplier = 1;
  let periodLabel = `ประจำเวร${
    activeShift === 'morning' ? 'เช้า' : activeShift === 'afternoon' ? 'บ่าย' : 'ดึก'
  } (รายวัน)`;

  if (timeframe === 'monthly') {
    timeframeMultiplier = 30 / shiftWeight;
    periodLabel = 'ภาพรวมรายเดือน (30 วัน)';
  } else if (timeframe === 'yearly') {
    timeframeMultiplier = 365 / shiftWeight;
    periodLabel = 'ภาพรวมรายปี (365 วัน)';
  }

  const totalWorkloadHours = Number((baseWorkloadHours * timeframeMultiplier).toFixed(1));
  const totalWorkloadMinutes = Math.round(totalWorkloadHours * 60);
  const directCareHours = Number((baseDirectHours * timeframeMultiplier).toFixed(1));
  const indirectCareHours = Number((baseIndirectHours * timeframeMultiplier).toFixed(1));
  const unitRelatedHours = Number((baseUnitHours * timeframeMultiplier).toFixed(1));
  const totalPaidStaffHours = Number((basePaidHours * timeframeMultiplier).toFixed(1));

  // Productivity %
  const rawProductivity =
    totalPaidStaffHours > 0 ? (totalWorkloadHours / totalPaidStaffHours) * 100 : 0;
  const productivityPercent = Number(rawProductivity.toFixed(1));

  // NHPPD Actual
  const nhppdActual =
    shiftCensus > 0
      ? Number(((basePaidHours / shiftWeight) / shiftCensus).toFixed(2))
      : 0;
  const nhppdTarget = dept.targetNHPPD;
  const nhppdVariance = Number((nhppdActual - nhppdTarget).toFixed(2));

  // Status
  let status: ProductivityCalculationResult['status'] = 'Optimal';
  if (productivityPercent < 80) {
    status = 'Underutilized';
  } else if (productivityPercent >= 80 && productivityPercent <= 100) {
    status = 'Optimal';
  } else if (productivityPercent > 100 && productivityPercent <= 109) {
    status = 'Strained';
  } else {
    status = 'Critical_Overwork';
  }

  // FTE Calculation (Annualized)
  const dailyWorkloadHours = baseWorkloadHours / shiftWeight;
  const annualWorkloadHours = dailyWorkloadHours * 365;
  const fteRequired = Number(
    (annualWorkloadHours / SANGKHLABURI_HOSPITAL_META.annualProductiveHoursPerNurse).toFixed(1)
  );
  const currentTotalStaff = dept.currentStaffCount.rn;
  const fteActual = currentTotalStaff;
  const fteGap = Number((fteActual - fteRequired).toFixed(1));

  // อัตรากำลังปฏิบัติการจริง: พยาบาลวิชาชีพ 100%
  const rnPercent = 100;
  const naPercent = 0;

  const skillMixTarget = { rnPercent: 100, naPercent: 0 };

  let fatigueScore = 20;
  if (productivityPercent > 100) fatigueScore += (productivityPercent - 100) * 3;
  if (onDutyRN < 2 && dept.complexityLevel === 'Critical') fatigueScore += 25;
  if (shiftCensus > dept.bedCapacity && dept.bedCapacity > 0) fatigueScore += 20;
  const fatigueRiskScore = Math.min(100, Math.max(0, Math.round(fatigueScore)));

  const safeStaffingMet =
    productivityPercent <= 105 &&
    (deptId === 'er' ? onDutyRN >= 2 : onDutyRN >= 1);

  const timeframeData = {
    totalPatientsPeriod: Math.round(
      shiftCensus * (timeframe === 'yearly' ? 365 : timeframe === 'monthly' ? 30 : 1)
    ),
    totalEarnedHoursPeriod: totalWorkloadHours,
    avgDailyCensus: shiftCensus,
    peakShiftProductivity: Math.min(125, Number((productivityPercent * 1.15).toFixed(1))),
    lowestShiftProductivity: Math.max(65, Number((productivityPercent * 0.88).toFixed(1))),
    periodLabel,
  };

  return {
    departmentId: deptId,
    shiftType: activeShift,
    timeframe,
    totalCensus: shiftCensus,
    totalWorkloadMinutes,
    totalWorkloadHours,
    directCareHours,
    indirectCareHours,
    unitRelatedHours,
    totalPaidStaffHours,
    productivityPercent,
    nhppdActual,
    nhppdTarget,
    nhppdVariance,
    status,
    fteRequired,
    fteActual,
    fteGap,
    staffOnDutySummary: {
      rn: onDutyRN,
      na: onDutyNA,
      total: totalStaffOnDuty,
    },
    skillMixActual: { rnPercent, naPercent },
    skillMixTarget,
    fatigueRiskScore,
    safeStaffingMet,
    timeframeData,
    indirectConfigUsed: indirectConfig,
    indirectCalculationSummary: {
      method: indirectConfig.method,
      methodLabel,
      directCareHours: Number(baseDirectHours.toFixed(2)),
      indirectAndUnitHours: Number(indirectAndUnitHours.toFixed(2)),
      allowancePercentUsed: indirectConfig.method === 'allowance_percentage' ? (indirectConfig.allowancePercent || 20) : undefined,
      fixedHoursUsed: indirectConfig.method === 'fixed_hours' ? Number(indirectAndUnitHours.toFixed(2)) : undefined,
    },
  };
}

export function generateFourPillarReport(
  deptId: DepartmentId,
  result: ProductivityCalculationResult,
  authorName: string,
  authorRole: string,
  timeframe: ReportTimeframe = 'daily'
): FourPillarReport {
  const dept = DEPARTMENTS.find((d) => d.id === deptId) || DEPARTMENTS[0];
  const timeframeTh =
    timeframe === 'yearly'
      ? 'รายปี (Yearly)'
      : timeframe === 'monthly'
      ? 'รายเดือน (Monthly)'
      : 'รายวัน (Daily)';

  let execSummary = '';
  if (result.status === 'Critical_Overwork') {
    execSummary = `รายงาน${timeframeTh} ของ ${dept.name} บ่งชี้ภาระงานวิกฤต (Productivity ${result.productivityPercent}% สูงกว่าเพดานความปลอดภัย 100%) ส่งผลให้ดัชนีความเหนื่อยล้าพุ่งสูงถึง ${result.fatigueRiskScore}/100 มีความขาดแคลนอัตรากำลัง ${Math.abs(result.fteGap)} FTE จำเป็นต้องใช้นโยบายเกลี่ยเวรฉุกเฉินและขอรับพยาบาลวิชาชีพ (RN) เสริมทันที`;
  } else if (result.status === 'Strained') {
    execSummary = `รายงาน${timeframeTh} ของ ${dept.name} พบอัตราภาระงานตึงตัว (Productivity ${result.productivityPercent}%) เกินเกณฑ์มาตรฐานเล็กน้อย จากปริมาณผู้ป่วยพึ่งพาสูง (Acuity Type 3-4) ควรจัดลำดับความสำคัญของหัตถการและนำระบบ LEAN มาตัดขั้นตอนเอกสารซ้ำซ้อน`;
  } else if (result.status === 'Optimal') {
    execSummary = `รายงาน${timeframeTh} ของ ${dept.name} ดำเนินการได้อย่างมีประสิทธิภาพสูงสุด (Productivity ${result.productivityPercent}% อยู่ใน Safe Zone 85-100%) อัตราส่วน NHPPD (${result.nhppdActual} ชม.) สมดุลตามเกณฑ์มาตรฐานสากล ทีมพยาบาลวิชาชีพสามารถส่งมอบการดูแลได้อย่างมีคุณภาพและปลอดภัยตามมาตรฐานสากล`;
  } else {
    execSummary = `รายงาน${timeframeTh} ของ ${dept.name} มีอัตราการใช้ประโยชน์กำลังคนต่ำกว่าเกณฑ์ (Productivity ${result.productivityPercent}% < 80%) เกิดภาวะ Overstaffing ชั่วคราว ควรพิจารณาหมุนเวียนพยาบาล (Float Nurse) ไปช่วยสนับสนุนแผนกที่มีภาระงานวิกฤต เช่น ER หรือ IPD 2`;
  }

  const leanOpps: string[] = [
    'ยกเลิกการบันทึกข้อมูลซ้ำซ้อน (Duplicate Charting) ในสมุดเวรกระดาษ หันมาใช้ Electronic Nursing Focus Charting 100% ประหยัดเวลา 15-20 นาที/คน/เวร',
    'จัดระเบียบสถานีพยาบาลและตู้เวชภัณฑ์ด้วยระบบ 5S & Visual Management ลดระยะทางและเวลาเดินหาอุปกรณ์วัดสัญญาณชีพและ Infusion Pump (ลดเวลาสูญเปล่า 20 นาที/วัน)',
    'นำแผ่นคำศัพท์ทางการพยาบาล 3 ภาษา (ไทย-มอญ-กะเหรี่ยง) ในรูปแบบ Pictogram มาใช้ข้างเตียง ช่วยลดเวลาอธิบายการรักษาซ้ำซ้อนและลดความเข้าใจคลาดเคลื่อน',
    'ปรับกระบวนการส่งต่อผู้ป่วยฉุกเฉิน 220 กม. (Sangkhla-Kanchanaburi Fast Track) ให้มี Pre-referral Checklist ชัดเจน ลดความซ้ำซ้อนในการเตรียมยาและประสานงาน',
  ];

  const burnoutActions: string[] = [
    'บังคับใช้เกณฑ์ Fatigue Risk Threshold: ห้ามพยาบาลปฏิบัติงานเวรต่อเนื่องเกิน 16 ชั่วโมง (งดเวร ดึก-เช้า ติดต่อกันโดยไม่มีเวลาพักผ่อนอย่างน้อย 16 ชม.)',
    'จัดตั้งระบบ "Float Pool" (พยาบาลหมุนเวียนกองกลางของกลุ่มงานการพยาบาล) เข้าเสริมกำลังทันทีเมื่อ Productivity แผนกพุ่งเกิน 105% นานกว่า 2 วันติดต่อกัน',
    'จัดตารางเวรแบบ Forward-Rotating Shift Schedule (เช้า -> บ่าย -> ดึก -> พัก) เพื่อรักษาจังหวะวงจรการนอนหลับชีวภาพ (Circadian Rhythm) ของบุคลากร',
    'จัดมุมพักผ่อน Quiet Recovery Nook พร้อมเครื่องดื่มสุขภาพในหอผู้ป่วย และการทำ Mindful Pause 3 นาทีหลังเหตุการณ์วิกฤต/CPR',
  ];

  const safetyControls: string[] = [
    'ยึดมั่นอัตราส่วนความปลอดภัย (Safe Nurse-to-Patient Ratio): แผนกฉุกเฉินและผู้ป่วยกึ่งวิกฤตห้ามเกิน 1:2, ผู้ป่วยใส่ท่อช่วยหายใจ/ช็อก 1:1 อย่างเคร่งครัดตามเกณฑ์สภาการพยาบาล',
    'บังคับใช้มาตรการ Independent Double-Check ก่อนฉีดยากลุ่ม High Alert Drugs (HAD) เช่น Insulin, Heparin, Inotropes โดยพยาบาลวิชาชีพ 2 ท่านเซ็นชื่อกำกับ',
    'ยกระดับการส่งเวรข้างเตียง (Bedside Handover) ด้วยมาตรฐาน SBAR พร้อมให้ผู้ป่วยหรือญาติมีส่วนร่วมในการยืนยันแผนการดูแล เพื่อลดการสื่อสารคลาดเคลื่อน',
    'การเฝ้าระวังสัญญาณชีพทรุดตัวด้วยเกณฑ์คะแนนเตือนภัยล่วงหน้า (Early Warning Score - EWS) หากคะแนน >= 4 ต้องตามแพทย์ทันทีภายใน 15 นาที',
  ];

  return {
    generatedAt: new Date().toLocaleString('th-TH'),
    reportTitle: `รายงานการวิเคราะห์ค่างานและผลิตภาพ (${dept.name}) - ${timeframeTh}`,
    hospitalName: SANGKHLABURI_HOSPITAL_META.nameTh,
    targetDepartment: dept.name,
    timeframe,
    periodLabel: result.timeframeData?.periodLabel || timeframeTh,
    authorName,
    authorRole,
    executiveSummary: execSummary,
    jobValuationSummary: {
      totalActivities: MASTER_NURSING_ACTIVITIES.length,
      directSharePercent: Math.round(
        (result.directCareHours / (result.totalWorkloadHours || 1)) * 100
      ),
      indirectSharePercent: Math.round(
        (result.indirectCareHours / (result.totalWorkloadHours || 1)) * 100
      ),
      unitRelatedSharePercent: Math.round(
        (result.unitRelatedHours / (result.totalWorkloadHours || 1)) * 100
      ),
      highRiskProportionPercent: 42,
    },
    productivityMetrics: result,
    strategicRecommendations: {
      leanOpportunities: leanOpps,
      burnoutPreventionActions: burnoutActions,
      patientSafetyControls: safetyControls,
    },
  };
}
