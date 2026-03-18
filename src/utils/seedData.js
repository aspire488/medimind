// ═══════════════════════════════════════════
// Seed Data — realistic demo data
// ═══════════════════════════════════════════
import { uid, today } from './helpers.js';
import DataService from '../services/DataService.js';

export function seedDemoData() {
  const existing = DataService.getUsers();
  if (existing.length > 0) return; // already seeded

  const patientId   = 'patient-rajan';
  const seniorId    = 'patient-leela';
  const caregiverId = 'caregiver-priya';

  // ── Users ──
  DataService.saveUser({
    id: patientId, name: 'Arjun Nair', pin: '1234',
    role: 'standard', language: 'en', linkedPatients: [],
  });
  DataService.saveUser({
    id: seniorId, name: 'Leela Menon', pin: '0000',
    role: 'senior', language: 'ml', linkedPatients: [],
    accessibilityMode: true,
  });
  DataService.saveUser({
    id: caregiverId, name: 'Priya Nair', pin: '9999',
    role: 'caregiver', language: 'en',
    linkedPatients: [patientId, seniorId],
  });

  // ── Medicines — Arjun ──
  const meds = [
    { id: uid(), patientId, name:'Metformin',    dose:'500', unit:'mg', times:['08:00'], frequency:'daily', mealContext:'after', daysRemaining:28 },
    { id: uid(), patientId, name:'Amlodipine',   dose:'5',   unit:'mg', times:['13:00'], frequency:'daily', mealContext:'after', daysRemaining:14 },
    { id: uid(), patientId, name:'Atorvastatin', dose:'10',  unit:'mg', times:['21:00'], frequency:'daily', mealContext:'after', daysRemaining:20 },
  ];
  const seniorMeds = [
    { id: uid(), patientId: seniorId, name:'Lisinopril',  dose:'10', unit:'mg', times:['08:00','20:00'], frequency:'twice', mealContext:'after', daysRemaining:21 },
    { id: uid(), patientId: seniorId, name:'Aspirin',     dose:'75', unit:'mg', times:['09:00'],         frequency:'daily', mealContext:'after', daysRemaining:30 },
  ];
  [...meds, ...seniorMeds].forEach(m => DataService.saveMedicine(m));

  // ── Intake logs — past 7 days ──
  const d = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0,10);
    meds.forEach(m => {
      m.times.forEach(t => {
        const miss = (i===3 && m.name==='Metformin'); // Wednesday miss for demo
        DataService.saveIntakeLog({
          id: uid(), patientId, date: dateStr,
          medicineId: m.id, medicineName: m.name,
          scheduledTime: t, confirmedAt: miss ? null : t,
          confirmed: !miss, status: miss ? 'missed' : 'taken',
        });
      });
    });
  }
  // Today's logs — morning only (so afternoon is still pending)
  const todayStr = today();
  DataService.saveIntakeLog({ id:uid(), patientId, date:todayStr, medicineId:meds[0].id, medicineName:'Metformin', scheduledTime:'08:00', confirmed:true, status:'taken', confirmedAt:'08:14' });
}
