import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import DataService from '../services/DataService.js';
import { useAuth } from './AuthContext.jsx';
import { today, uid, nowMinutes, timeToMinutes } from '../utils/helpers.js';

const MedicineContext = createContext(null);

export function MedicineProvider({ children }) {
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [intakeLogs, setIntakeLogs] = useState([]);

  const patientId = user?.id;

  useEffect(() => {
    if (!patientId) return;
    setMedicines(DataService.getMedicines(patientId));
    setIntakeLogs(DataService.getIntakeLogs(patientId, today()));
  }, [patientId]);

  const refreshMedicines = useCallback(() => {
    if (!patientId) return;
    setMedicines(DataService.getMedicines(patientId));
  }, [patientId]);

  const refreshLogs = useCallback(() => {
    if (!patientId) return;
    setIntakeLogs(DataService.getIntakeLogs(patientId, today()));
  }, [patientId]);

  const addMedicine = useCallback((med) => {
    const newMed = { ...med, id: uid(), patientId };
    DataService.saveMedicine(newMed);
    setMedicines(prev => [...prev, newMed]);
    return newMed;
  }, [patientId]);

  const updateMedicine = useCallback((id, updates) => {
    const updated = { ...DataService.getMedicines(patientId).find(m=>m.id===id), ...updates };
    DataService.saveMedicine(updated);
    setMedicines(prev => prev.map(m => m.id===id ? updated : m));
  }, [patientId]);

  const deleteMedicine = useCallback((id) => {
    DataService.deleteMedicine(id);
    setMedicines(prev => prev.filter(m => m.id!==id));
  }, []);

  const confirmIntake = useCallback((medicineId, scheduledTime) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;
    const log = {
      id: uid(), patientId, medicineId,
      medicineName: med.name, date: today(),
      scheduledTime, confirmed: true,
      status: 'taken', confirmedAt: new Date().toTimeString().slice(0,5),
    };
    DataService.saveIntakeLog(log);
    setIntakeLogs(prev => {
      const filtered = prev.filter(l => !(l.medicineId===medicineId && l.scheduledTime===scheduledTime));
      return [...filtered, log];
    });
    return log;
  }, [medicines, patientId]);

  const markMissed = useCallback((medicineId, scheduledTime) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;
    const log = {
      id: uid(), patientId, medicineId,
      medicineName: med.name, date: today(),
      scheduledTime, confirmed: false,
      status: 'missed', confirmedAt: null,
    };
    DataService.saveIntakeLog(log);
    setIntakeLogs(prev => {
      const filtered = prev.filter(l => !(l.medicineId===medicineId && l.scheduledTime===scheduledTime));
      return [...filtered, log];
    });
    // Save alert for caregiver
    DataService.saveAlert({
      id: uid(), patientId, type: 'missed',
      message: `${med.name} ${med.dose}${med.unit} missed at ${scheduledTime}`,
      createdAt: Date.now(), status: 'active',
    });
  }, [medicines, patientId]);

  // Build today's schedule with status
  const todaySchedule = React.useMemo(() => {
    const now = nowMinutes();
    const slots = [];
    medicines.forEach(med => {
      (med.times || []).forEach(time => {
        const log = intakeLogs.find(l => l.medicineId===med.id && l.scheduledTime===time);
        slots.push({
          medicine: med, time,
          status: log
            ? (log.confirmed ? 'taken' : 'missed')
            : (Math.abs(timeToMinutes(time) - now) <= 15 ? 'due' : 'upcoming'),
          log,
        });
      });
    });
    return slots.sort((a,b) => a.time.localeCompare(b.time));
  }, [medicines, intakeLogs]);

  const todayAdherence = React.useMemo(() => {
    const total  = todaySchedule.length;
    const taken  = todaySchedule.filter(s => s.status==='taken').length;
    return { total, taken, missed: todaySchedule.filter(s=>s.status==='missed').length, pct: total ? Math.round(taken/total*100) : 0 };
  }, [todaySchedule]);

  return (
    <MedicineContext.Provider value={{
      medicines, intakeLogs, todaySchedule, todayAdherence,
      addMedicine, updateMedicine, deleteMedicine,
      confirmIntake, markMissed,
      refreshMedicines, refreshLogs,
    }}>
      {children}
    </MedicineContext.Provider>
  );
}

export const useMedicine = () => {
  const ctx = useContext(MedicineContext);
  if (!ctx) throw new Error('useMedicine must be inside MedicineProvider');
  return ctx;
};
