// ═══════════════════════════════════════════════════
// DataService — localStorage abstraction
// All data access goes through this layer.
// Swap for SQLite/API without changing anything above.
// ═══════════════════════════════════════════════════

const KEYS = {
  USERS:       'mm_users',
  CURRENT_USER:'mm_current_user',
  MEDICINES:   'mm_medicines',
  INTAKE_LOGS: 'mm_intake_logs',
  ALERTS:      'mm_alerts',
  SETTINGS:    'mm_settings',
};

const read  = (key, fallback = null) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
};
const write = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
};

// ── Users ────────────────────────────────────────────
export const DataService = {
  // Users
  getUsers:       ()   => read(KEYS.USERS, []),
  saveUser:       (u)  => { const users = read(KEYS.USERS, []); const idx = users.findIndex(x => x.id === u.id); if(idx>=0) users[idx]=u; else users.push(u); write(KEYS.USERS, users); },
  getUserById:    (id) => read(KEYS.USERS,[]).find(u=>u.id===id) || null,
  getUserByPin:   (pin)=> read(KEYS.USERS,[]).find(u=>u.pin===pin) || null,

  // Session
  getCurrentUser: ()   => read(KEYS.CURRENT_USER, null),
  setCurrentUser: (u)  => write(KEYS.CURRENT_USER, u),
  clearSession:   ()   => { localStorage.removeItem(KEYS.CURRENT_USER); },

  // Medicines
  getMedicines:   (patientId) => read(KEYS.MEDICINES,[]).filter(m=>m.patientId===patientId),
  getAllMedicines: ()          => read(KEYS.MEDICINES,[]),
  saveMedicine:   (m)  => {
    const list = read(KEYS.MEDICINES,[]);
    const idx = list.findIndex(x=>x.id===m.id);
    if(idx>=0) list[idx]=m; else list.push(m);
    write(KEYS.MEDICINES, list);
  },
  deleteMedicine: (id) => { const list = read(KEYS.MEDICINES,[]).filter(m=>m.id!==id); write(KEYS.MEDICINES,list); },

  // Intake logs
  getIntakeLogs:    (patientId, date) => read(KEYS.INTAKE_LOGS,[]).filter(l=>l.patientId===patientId&&l.date===date),
  getAllLogs:        ()                => read(KEYS.INTAKE_LOGS,[]),
  getLogsForPatient:(patientId)       => read(KEYS.INTAKE_LOGS,[]).filter(l=>l.patientId===patientId),
  saveIntakeLog:    (log) => {
    const list = read(KEYS.INTAKE_LOGS,[]);
    const idx = list.findIndex(x=>x.id===log.id);
    if(idx>=0) list[idx]=log; else list.push(log);
    write(KEYS.INTAKE_LOGS, list);
  },

  // Alerts
  getAlerts:    (patientId) => read(KEYS.ALERTS,[]).filter(a=>a.patientId===patientId),
  getCaregiverAlerts: (caregiverId) => {
    const users = read(KEYS.USERS,[]);
    const cg = users.find(u=>u.id===caregiverId);
    if(!cg) return [];
    const patientIds = cg.linkedPatients || [];
    return read(KEYS.ALERTS,[]).filter(a=>patientIds.includes(a.patientId));
  },
  saveAlert: (alert) => {
    const list = read(KEYS.ALERTS,[]);
    const idx  = list.findIndex(a=>a.id===alert.id);
    if(idx>=0) list[idx]=alert; else list.push(alert);
    write(KEYS.ALERTS, list);
  },
  resolveAlert: (id) => {
    const list = read(KEYS.ALERTS,[]);
    const idx  = list.findIndex(a=>a.id===id);
    if(idx>=0){ list[idx].status='resolved'; list[idx].resolvedAt=Date.now(); }
    write(KEYS.ALERTS, list);
  },

  // Settings
  getSettings: (userId) => read(KEYS.SETTINGS,{})[userId] || {},
  saveSettings: (userId, settings) => {
    const all = read(KEYS.SETTINGS,{});
    all[userId] = {...(all[userId]||{}), ...settings};
    write(KEYS.SETTINGS, all);
  },

  // Caregiver: only adherence data — never AI chat / personal notes
  getPatientAdherenceData: (patientId) => {
    const medicines = read(KEYS.MEDICINES,[]).filter(m=>m.patientId===patientId);
    const logs      = read(KEYS.INTAKE_LOGS,[]).filter(l=>l.patientId===patientId);
    const alerts    = read(KEYS.ALERTS,[]).filter(a=>a.patientId===patientId);
    // NOTE: AI chat history and personal notes are intentionally excluded here
    return { medicines, logs, alerts };
  },
};

export default DataService;

// ── Extended medicine fields support ─────────────────
// New fields: purpose, colorTag, photoUrl (all optional)
// Existing saveMedicine handles these automatically via spread
// ────────────────────────────────────────────────────

// ── Predictive alerts ────────────────────────────────
// Stores caregiver early-warning predictions
export const PredictiveService = {
  saveRiskAlert: (alert) => {
    const RISK_KEY = 'mm_risk_alerts';
    const list = (() => { try { return JSON.parse(localStorage.getItem(RISK_KEY)) || []; } catch { return []; } })();
    list.push(alert);
    // Keep only last 50
    const trimmed = list.slice(-50);
    localStorage.setItem(RISK_KEY, JSON.stringify(trimmed));
  },
  getRiskAlerts: (caregiverId) => {
    const RISK_KEY = 'mm_risk_alerts';
    try { return JSON.parse(localStorage.getItem(RISK_KEY)) || []; } catch { return []; }
  },
};
