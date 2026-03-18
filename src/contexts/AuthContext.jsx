import React, { createContext, useContext, useState, useCallback } from 'react';
import DataService from '../services/DataService.js';
import DemoService from '../services/DemoService.js';

const AuthContext = createContext(null);

const USER_SETTINGS_KEYS = new Set([
  'language',
  'medicineReminders',
  'missedDoseAlerts',
  'refillReminders',
  'mode',
  'hardwareEnabled',
]);

function normaliseUser(u) {
  if (!u) return u;
  return {
    ...u,
    language: u.language || 'en',
    medicineReminders: u.medicineReminders ?? true,
    missedDoseAlerts: u.missedDoseAlerts ?? true,
    refillReminders: u.refillReminders ?? false,
    mode: u.mode || (u.isSelfCare ? 'selfcare' : (u.role || 'standard')),
    hardwareEnabled: u.hardwareEnabled ?? (u.hardwareMode === 'hardware'),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => normaliseUser(DataService.getCurrentUser()));

  const login = useCallback((pin) => {
    const found = DataService.getUserByPin(pin);
    if (!found) return { success: false, error: 'Invalid PIN' };
    const u = normaliseUser(found);
    DataService.setCurrentUser(u);
    setUser(u);
    try { DemoService.ensureSeedForUser(u); } catch {}
    return { success: true, user: found };
  }, []);

  const logout = useCallback(() => {
    DataService.clearSession();
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    if (!user) return;
    const safeUpdates = { ...updates };
    // Ensure settings are always persisted on the user object in localStorage
    // (and not lost if callers only update some fields).
    for (const k of Object.keys(safeUpdates)) {
      if (USER_SETTINGS_KEYS.has(k) && safeUpdates[k] === undefined) {
        delete safeUpdates[k];
      }
    }
    const updated = normaliseUser({ ...user, ...safeUpdates });
    DataService.saveUser(updated);
    DataService.setCurrentUser(updated);
    setUser(updated);
  }, [user]);

  const switchMode = useCallback((newRole) => {
    updateUser({
      role: newRole,
      mode: newRole === 'senior' ? 'senior'
         : newRole === 'caregiver' ? 'caregiver'
         : (user?.isSelfCare ? 'selfcare' : 'standard'),
    });
  }, [updateUser]);

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, switchMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
