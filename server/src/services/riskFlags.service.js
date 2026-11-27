// Risk flagging is deliberately rule-based (not LLM-based): thresholds are
// explicit, auditable, and cheap to run on every extracted visit.

const BP_SYSTOLIC_HIGH = 140;
const BP_DIASTOLIC_HIGH = 90;
const FEVER_TEMP_C = 38;

export function applyRiskFlags(visit) {
  const flags = [];
  const vitals = visit.vitals || {};
  const symptoms = visit.symptoms || [];

  if (
    (vitals.bloodPressureSystolic ?? 0) >= BP_SYSTOLIC_HIGH ||
    (vitals.bloodPressureDiastolic ?? 0) >= BP_DIASTOLIC_HIGH
  ) {
    flags.push('High blood pressure — possible pre-eclampsia risk, escalate to PHC');
  }

  if ((vitals.temperatureC ?? 0) >= FEVER_TEMP_C) {
    flags.push('Fever detected — monitor closely, consider referral');
  }

  if (
    visit.visitType === 'ANC' &&
    symptoms.some((s) => /no (fetal )?movement|not moving|reduced movement/i.test(s))
  ) {
    flags.push('Reduced fetal movement reported — urgent referral recommended');
  }

  return { ...visit, riskFlags: flags };
}
