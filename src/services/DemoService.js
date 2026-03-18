import DataService from './DataService.js';
import { today, nowTime, uid } from '../utils/helpers.js';

const DEMO_KEY = 'mm_demo_mode';

function readBool(key, fallback = false) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return raw === 'true';
  } catch {
    return fallback;
  }
}

function writeBool(key, value) {
  try {
    localStorage.setItem(key, value ? 'true' : 'false');
    return true;
  } catch {
    return false;
  }
}

function clampTimeToHHMM(t) {
  // nowTime() already returns HH:MM; keep small guard for safety.
  if (/^\d{2}:\d{2}$/.test(t || '')) return t;
  return nowTime();
}

function addMinutes(hhmm, mins) {
  const [h, m] = clampTimeToHHMM(hhmm).split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  d.setMinutes(d.getMinutes() + mins);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function seedDemoMedicines(patientId) {
  const base = nowTime();
  const meds = [
    {
      id: uid(),
      patientId,
      name: 'Metformin',
      purpose: 'Controls blood sugar',
      dose: '500',
      unit: 'mg',
      frequency: 'daily',
      times: [clampTimeToHHMM(base)],
      mealContext: 'after',
      daysRemaining: 30,
      colorTag: 'blue',
    },
    {
      id: uid(),
      patientId,
      name: 'Amlodipine',
      purpose: 'Blood pressure',
      dose: '5',
      unit: 'mg',
      frequency: 'daily',
      times: [addMinutes(base, 2)],
      mealContext: 'any',
      daysRemaining: 20,
      colorTag: 'green',
    },
    {
      id: uid(),
      patientId,
      name: 'Vitamin D3',
      purpose: 'Bone health',
      dose: '1',
      unit: 'tablet',
      frequency: 'daily',
      times: [addMinutes(base, 5)],
      mealContext: 'with',
      daysRemaining: 60,
      colorTag: 'amber',
    },
  ];

  meds.forEach(m => DataService.saveMedicine(m));
}

function seedDemoLogs(patientId) {
  // One "taken" log earlier today for nicer adherence widgets.
  const list = DataService.getAllMedicines().filter(m => m.patientId === patientId);
  if (!list.length) return;
  const first = list[0];
  const log = {
    id: uid(),
    patientId,
    medicineId: first.id,
    medicineName: first.name,
    date: today(),
    scheduledTime: first.times?.[0] || nowTime(),
    confirmed: true,
    status: 'taken',
    confirmedAt: nowTime(),
  };
  DataService.saveIntakeLog(log);
}

export const DemoService = {
  isEnabled: () => readBool(DEMO_KEY, false),
  setEnabled: (on) => writeBool(DEMO_KEY, !!on),

  ensureSeedForUser: (user) => {
    if (!DemoService.isEnabled()) return { seeded: false };
    const patientId = user?.id;
    if (!patientId) return { seeded: false };
    // Only seed for patient-like modes.
    const isPatient = user?.role === 'standard' || user?.role === 'senior' || user?.mode === 'selfcare' || user?.role === 'selfcare';
    if (!isPatient) return { seeded: false };

    const existing = DataService.getMedicines(patientId);
    if (existing.length > 0) return { seeded: false };

    seedDemoMedicines(patientId);
    seedDemoLogs(patientId);
    return { seeded: true };
  },
};

export default DemoService;

