// ═══════════════════════════════════════════════════
// PredictiveAdherence — safe miss prediction
//
// DESIGN PRINCIPLES (medical safety first):
// 1. ONLY flags risk — never makes medical decisions
// 2. Always notifies caregiver, never the patient alone
// 3. Predictions are suggestions, not diagnoses
// 4. Threshold is conservative (avoid false alarms)
// 5. All output is clearly labelled "risk indicator"
// ═══════════════════════════════════════════════════

import { today, timeToMinutes, nowMinutes } from '../../utils/helpers.js';

const RISK_LEVELS = {
  LOW:    { label: 'Low risk',    color: '#28A06E', score: 0 },
  MEDIUM: { label: 'Watch',       color: '#E8A020', score: 1 },
  HIGH:   { label: 'High risk',   color: '#D43A3A', score: 2 },
};

/**
 * computeMissRisk
 * Returns a risk assessment for a specific medicine slot.
 * Uses only historical adherence data — no medical inference.
 *
 * @param {string} patientId
 * @param {object} medicine  - { id, name, times }
 * @param {string} slotTime  - "HH:MM"
 * @param {Array}  allLogs   - historical intake logs
 * @returns {{ level, score, reasons, recommendation }}
 */
export function computeMissRisk(patientId, medicine, slotTime, allLogs) {
  const reasons = [];
  let score = 0;

  // ── Factor 1: Missed this exact slot in past 3 days ──
  const past3 = [];
  for (let i = 1; i <= 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0,10);
    const log = allLogs.find(l =>
      l.medicineId === medicine.id &&
      l.scheduledTime === slotTime &&
      l.date === dateStr
    );
    if (log && !log.confirmed) past3.push(dateStr);
  }
  if (past3.length >= 2) {
    score += 2;
    reasons.push(`Missed ${past3.length} of last 3 days at this time`);
  } else if (past3.length === 1) {
    score += 1;
    reasons.push('Missed once in the last 3 days');
  }

  // ── Factor 2: Overall 7-day adherence below 60% ──
  const week = [];
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0,10);
    const log = allLogs.find(l =>
      l.medicineId === medicine.id &&
      l.scheduledTime === slotTime &&
      l.date === dateStr
    );
    if (log) week.push(log.confirmed);
  }
  if (week.length > 0) {
    const weekPct = week.filter(Boolean).length / week.length;
    if (weekPct < 0.4) {
      score += 2;
      reasons.push(`Only ${Math.round(weekPct * 100)}% adherence this week`);
    } else if (weekPct < 0.6) {
      score += 1;
      reasons.push(`Below-average adherence (${Math.round(weekPct * 100)}%) this week`);
    }
  }

  // ── Factor 3: Dose due soon and not yet confirmed today ──
  const nowMins = nowMinutes();
  const slotMins = timeToMinutes(slotTime);
  const minsUntilDue = slotMins - nowMins;
  const todayLog = allLogs.find(l =>
    l.medicineId === medicine.id &&
    l.scheduledTime === slotTime &&
    l.date === today()
  );

  if (!todayLog && minsUntilDue > 0 && minsUntilDue <= 30) {
    score += 1;
    reasons.push(`Due in ${minsUntilDue} min, not yet confirmed`);
  }

  // ── Determine level ──
  const level = score >= 4 ? 'HIGH' : score >= 2 ? 'MEDIUM' : 'LOW';

  return {
    level,
    score,
    reasons,
    medicine: medicine.name,
    slotTime,
    // Safe recommendation — always defer to caregiver
    recommendation: level === 'HIGH'
      ? `Notify caregiver: ${medicine.name} at ${slotTime} is high-risk for being missed today.`
      : level === 'MEDIUM'
      ? `Monitor: ${medicine.name} at ${slotTime} has shown inconsistent adherence.`
      : null,
    // IMPORTANT: This is a risk indicator only, not a medical assessment
    disclaimer: 'This is a behavioural risk indicator based on adherence history only. It is not a medical assessment.',
  };
}

/**
 * getHighRiskSlots
 * Returns only MEDIUM+ risk slots for all medicines.
 * Used by caregiver dashboard to surface early warnings.
 */
export function getHighRiskSlots(patientId, medicines, allLogs) {
  const results = [];
  for (const med of medicines) {
    for (const time of (med.times || [])) {
      const risk = computeMissRisk(patientId, med, time, allLogs);
      if (risk.level !== 'LOW') {
        results.push(risk);
      }
    }
  }
  return results.sort((a, b) => b.score - a.score);
}
