// ═══════════════════════════════════════════
// MediMind Utilities
// ═══════════════════════════════════════════

export const uid = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36);

export const today = () => new Date().toISOString().slice(0,10); // YYYY-MM-DD

export const formatTime = (timeStr) => {
  // timeStr = "HH:MM" 24h → "8:00 AM"
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const h12    = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${period}`;
};

export const timeToMinutes = (timeStr) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};

export const nowTime = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
};

export const nowMinutes = () => {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
};

export const mealLabel = (ctx) => {
  const map = { before: 'Before food', after: 'After food', with: 'With food', any: 'Any time' };
  return map[ctx] || ctx;
};

export const statusColor = (status) => {
  const map = { taken:'var(--green)', due:'var(--amber)', missed:'var(--red)', upcoming:'var(--muted)' };
  return map[status] || 'var(--muted)';
};
export const statusBg = (status) => {
  const map = { taken:'var(--green-l)', due:'var(--amber-l)', missed:'var(--red-l)', upcoming:'var(--gray)' };
  return map[status] || 'var(--gray)';
};
export const statusLabel = (status) => {
  const map = { taken:'Taken', due:'Due now', missed:'Missed', upcoming:'Upcoming' };
  return map[status] || status;
};

export const computeAdherence = (logs, total) => {
  if (!total) return 0;
  const taken = logs.filter(l => l.confirmed).length;
  return Math.round((taken / total) * 100);
};

export const computeStreak = (logs) => {
  // Count consecutive days (backwards from today) where adherence === 100%
  const byDate = {};
  logs.forEach(l => {
    if (!byDate[l.date]) byDate[l.date] = { taken: 0, total: 0 };
    byDate[l.date].total++;
    if (l.confirmed) byDate[l.date].taken++;
  });
  let streak = 0;
  const d = new Date();
  for (let i = 0; i < 60; i++) {
    const key = d.toISOString().slice(0,10);
    const day = byDate[key];
    if (!day || day.taken < day.total) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
};

export const computeAlertStatus = (patientData) => {
  const { logs, medicines } = patientData;
  const todayStr = today();
  const todayLogs = logs.filter(l => l.date === todayStr);
  const missedToday = todayLogs.filter(l => l.status === 'missed').length;

  // Count consecutive daily misses
  const hasSOS = logs.some(l => l.type === 'sos' && l.date === todayStr);
  if (hasSOS) return 'critical';

  // Check missed 3+ consecutive days
  let consecutiveMisses = 0;
  const d = new Date();
  for (let i = 0; i < 7; i++) {
    const key = d.toISOString().slice(0,10);
    const dayLogs = logs.filter(l => l.date === key);
    if (dayLogs.length > 0 && dayLogs.every(l => !l.confirmed)) {
      consecutiveMisses++;
    } else { break; }
    d.setDate(d.getDate() - 1);
  }
  if (consecutiveMisses >= 3 || missedToday >= 2) return 'critical';

  // Check if any due now
  const now = nowMinutes();
  const hasDue = medicines.some(m =>
    m.times.some(t => Math.abs(timeToMinutes(t) - now) <= 15)
  );
  if (hasDue || missedToday === 1) return 'warning';

  return 'resolved';
};

export const getWeekAdherence = (logs) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    const day = logs.filter(l => l.date === key);
    const pct = day.length ? Math.round(day.filter(l=>l.confirmed).length / day.length * 100) : null;
    days.push({ date: key, pct, label: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()] });
  }
  return days;
};
