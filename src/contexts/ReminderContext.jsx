import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { timeToMinutes, nowMinutes } from '../utils/helpers.js';

const ReminderContext = createContext(null);

export function ReminderProvider({ children, medicines, onConfirm, onMiss }) {
  const [activeReminder, setActiveReminder] = useState(null);
  const [snoozed, setSnoozed] = useState({}); // { "medId|time": snoozeUntilMinutes }
  const [justConfirmed, setJustConfirmed] = useState(null);
  const tickRef = useRef(null);
  const firedRef = useRef(new Set()); // "medId|time|date" — prevent double-fire

  const today = () => new Date().toISOString().slice(0,10);

  const fire = useCallback((medicine, time) => {
    setActiveReminder({ medicine, time });
  }, []);

  const confirm = useCallback(() => {
    if (!activeReminder) return;
    const { medicine, time } = activeReminder;
    const key = `${medicine.id}|${time}|${today()}`;
    firedRef.current.add(key);
    setActiveReminder(null);
    onConfirm?.(medicine.id, time);
    setJustConfirmed(medicine.name);
    setTimeout(() => setJustConfirmed(null), 3000);
  }, [activeReminder, onConfirm]);

  const snooze = useCallback((minutes = 10) => {
    if (!activeReminder) return;
    const { medicine, time } = activeReminder;
    const key = `${medicine.id}|${time}`;
    setSnoozed(prev => ({ ...prev, [key]: nowMinutes() + minutes }));
    setActiveReminder(null);
  }, [activeReminder]);

  const dismiss = useCallback(() => {
    if (!activeReminder) return;
    const { medicine, time } = activeReminder;
    const key = `${medicine.id}|${time}|${today()}`;
    firedRef.current.add(key); // won't refire
    onMiss?.(medicine.id, time);
    setActiveReminder(null);
  }, [activeReminder, onMiss]);

  // Ticker — check every 60s
  useEffect(() => {
    if (!medicines?.length) return;

    const check = () => {
      if (activeReminder) return; // already showing one
      const now = nowMinutes();
      const todayStr = today();

      for (const med of medicines) {
        for (const time of (med.times || [])) {
          const key       = `${med.id}|${time}|${todayStr}`;
          const snoozeKey = `${med.id}|${time}`;
          const scheduledMins = timeToMinutes(time);
          const diff = now - scheduledMins;

          if (firedRef.current.has(key)) continue; // already handled

          // Check snooze
          const snoozeUntil = snoozed[snoozeKey];
          if (snoozeUntil && now < snoozeUntil) continue;

          // Fire if within ±2 minutes window
          if (diff >= 0 && diff <= 2) {
            fire(med, time);
            return;
          }
          // Auto-miss after 10 min window
          if (diff > 10 && diff < 600) {
            firedRef.current.add(key);
            onMiss?.(med.id, time);
          }
        }
      }
    };

    check(); // immediate check on mount
    tickRef.current = setInterval(check, 60_000);
    return () => clearInterval(tickRef.current);
  }, [medicines, activeReminder, snoozed, fire, onMiss]);

  return (
    <ReminderContext.Provider value={{ activeReminder, justConfirmed, confirm, snooze, dismiss }}>
      {children}
    </ReminderContext.Provider>
  );
}

export const useReminder = () => {
  const ctx = useContext(ReminderContext);
  if (!ctx) throw new Error('useReminder must be inside ReminderProvider');
  return ctx;
};
