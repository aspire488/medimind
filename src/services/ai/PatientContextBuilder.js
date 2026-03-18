// ═══════════════════════════════════════════════════
// PatientContextBuilder
// Builds a flat context summary from React state.
// THE AI NEVER TOUCHES THE DATABASE DIRECTLY.
// ═══════════════════════════════════════════════════

import { formatTime, nowMinutes, timeToMinutes, today, computeAdherence, computeStreak } from '../../utils/helpers.js';
import DataService from '../DataService.js';

export function buildPatientContext(user, medicines, intakeLogs, todaySchedule, todayAdherence) {
  if (!user || !medicines) return null;

  const nextSlot = todaySchedule?.find(s => s.status === 'upcoming');
  const takenToday = todaySchedule?.filter(s => s.status === 'taken') || [];
  const missedToday = todaySchedule?.filter(s => s.status === 'missed') || [];

  // Weekly adherence
  const allLogs = DataService.getLogsForPatient(user.id);
  const streak  = computeStreak(allLogs);
  const weeklyPct = allLogs.length ? computeAdherence(allLogs, allLogs.length) : 0;

  // Context hash — changes when schedule data changes → invalidates cache
  const hash = `${todayAdherence?.taken}-${nextSlot?.medicine?.id ?? 'none'}-${medicines.length}-${today()}`;

  const summary = [
    `Patient name: ${user.name}`,
    `Today (${today()}):`,
    `  Total medicines: ${todaySchedule?.length || 0}`,
    `  Taken: ${takenToday.length} (${takenToday.map(s => `${s.medicine.name} at ${formatTime(s.time)}`).join(', ') || 'none'})`,
    `  Missed: ${missedToday.length} (${missedToday.map(s => s.medicine.name).join(', ') || 'none'})`,
    `  Next dose: ${nextSlot ? `${nextSlot.medicine.name} ${nextSlot.medicine.dose}${nextSlot.medicine.unit} at ${formatTime(nextSlot.time)}` : 'None remaining today'}`,
    `Full medicine schedule:`,
    ...(medicines.map(m =>
      `  - ${m.name} ${m.dose}${m.unit}: ${(m.times||[]).map(formatTime).join(', ')} (${m.mealContext} food)`
    )),
    `Weekly adherence: ${weeklyPct}%`,
    `Current streak: ${streak} days`,
  ].join('\n');

  return {
    hash, summary,
    patientName: user.name,
    medicines,
    todaySchedule,
    todayAdherence,
    nextDose: nextSlot,
    streak,
    weeklyAdherence: weeklyPct,
    totalToday: todaySchedule?.length || 0,
    allLogs,
    scheduleSnooze: () => {}, // placeholder — wired up in ChatService
  };
}
