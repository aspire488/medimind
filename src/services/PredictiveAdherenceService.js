// ═══════════════════════════════════════════════════
// PredictiveAdherenceService — high-level wrapper
// Uses intake logs to detect 3+ misses in last 7 days.
// Safe: only flags behaviour, never medical decisions.
// ═══════════════════════════════════════════════════

export function countMissesLast7Days(allLogs) {
  if (!allLogs?.length) return 0;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  return allLogs.filter(l => {
    const d = new Date(l.date);
    return d >= cutoff && l.confirmed === false;
  }).length;
}

export function getAdherenceRisk(allLogs) {
  const missed = countMissesLast7Days(allLogs);
  if (missed >= 3) return { level: 'warn', missedCount: missed };
  return { level: 'ok', missedCount: missed };
}

