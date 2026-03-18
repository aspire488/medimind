import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth }   from '../../contexts/AuthContext.jsx';
import NavigationBar from '../../components/common/NavigationBar.jsx';
import PatientCard   from '../../components/common/PatientCard.jsx';
import WeeklyBar     from '../../components/common/WeeklyBar.jsx';
import StatusBadge   from '../../components/common/StatusBadge.jsx';
import DataService   from '../../services/DataService.js';
import DemoService   from '../../services/DemoService.js';
import {
  computeAlertStatus, computeAdherence, getWeekAdherence,
  today, formatTime, nowMinutes, timeToMinutes,
} from '../../utils/helpers.js';

const CG_TABS = [
  { path: '/caregiver',          label: 'Dashboard' },
  { path: '/caregiver/patients', label: 'Patients'  },
  { path: '/caregiver/alerts',   label: 'Alerts'    },
  { path: '/caregiver/profile',  label: 'Profile'   },
];

// ── Load patient summary ──────────────────────────────
function usePatients(caregiverId) {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    if (!caregiverId) return;
    const cg = DataService.getUserById(caregiverId);
    if (!cg) return;
    const linked = (cg.linkedPatients || []).map(pid => {
      const user     = DataService.getUserById(pid);
      if (!user) return null;
      const { medicines, logs, alerts } = DataService.getPatientAdherenceData(pid);
      const todayLogs = logs.filter(l => l.date === today());
      const alertStatus = computeAlertStatus({ logs, medicines });
      const adherence   = computeAdherence(todayLogs, medicines.reduce((a,m)=>a+(m.times||[]).length,0));
      const now = nowMinutes();
      const nextSlot = medicines
        .flatMap(m => (m.times||[]).map(t => ({ medicine: m, time: t })))
        .filter(s => timeToMinutes(s.time) > now)
        .sort((a,b) => timeToMinutes(a.time) - timeToMinutes(b.time))[0] || null;
      const todaySlots = medicines.flatMap(m => (m.times||[]).map(t => {
        const log = todayLogs.find(l => l.medicineId===m.id && l.scheduledTime===t);
        return log ? (log.confirmed ? 'taken' : 'missed') : 'upcoming';
      }));
      return { user, medicines, logs, alerts, alertStatus, adherence, nextSlot, dotStatuses: todaySlots };
    }).filter(Boolean);

    // Sort: critical → warning → resolved
    const order = { critical: 0, warning: 1, resolved: 2 };
    linked.sort((a,b) => (order[a.alertStatus]||3) - (order[b.alertStatus]||3));
    setPatients(linked);
  }, [caregiverId]);

  return patients;
}

// ── Caregiver Dashboard ────────────────────────────────
export function CaregiverDashboard() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const patients    = usePatients(user?.id);
  const critical    = patients.filter(p => p.alertStatus === 'critical').length;
  const warning     = patients.filter(p => p.alertStatus === 'warning').length;
  const onTrack     = patients.filter(p => p.alertStatus === 'resolved').length;

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '14px 16px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{new Date().toDateString()}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginTop: 2 }}>Patient Overview</p>
            </div>
            {critical > 0 && (
              <div style={{ background: 'rgba(212,58,58,.25)', border: '1px solid rgba(212,58,58,.4)', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)' }} />
                <p style={{ fontSize: 11, color: 'var(--red)', fontWeight: 700 }}>{critical} critical</p>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { n: patients.length, l: 'Patients',  c: '#fff',         b: 'rgba(255,255,255,.07)', bdr: 'transparent' },
              { n: onTrack,         l: 'On track',  c: 'var(--green)', b: 'rgba(40,160,110,.15)',  bdr: 'rgba(40,160,110,.3)' },
              { n: critical+warning,l: 'Attention', c: 'var(--red)',   b: 'rgba(212,58,58,.15)',   bdr: 'rgba(212,58,58,.3)'  },
            ].map(s => (
              <div key={s.l} style={{ flex: 1, background: s.b, border: `1px solid ${s.bdr}`, borderRadius: 9, padding: '7px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.n}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>All patients</p>
            <button onClick={() => navigate('/caregiver/patients')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              See all
            </button>
          </div>
          {patients.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>No linked patients yet.</p>
            : patients.slice(0,4).map(p => (
              <div key={p.user.id} style={{ marginBottom: 8 }}>
                <PatientCard
                  patient={p.user}
                  alertStatus={p.alertStatus}
                  adherence={p.adherence}
                  nextDose={p.nextSlot}
                  dotStatuses={p.dotStatuses}
                />
              </div>
            ))
          }
        </div>
      </div>
      <NavigationBar tabs={CG_TABS} />
    </>
  );
}

// ── Patient List ───────────────────────────────────────
const FILTER_OPTS = ['All','Missed','Due soon','Good'];

export function CaregiverPatients() {
  const { user } = useAuth();
  const patients = usePatients(user?.id);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = patients.filter(p => {
    const matchSearch = p.user.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All'
      || (filter === 'Missed' && p.alertStatus === 'critical')
      || (filter === 'Due soon' && p.alertStatus === 'warning')
      || (filter === 'Good'   && p.alertStatus === 'resolved');
    return matchSearch && matchFilter;
  });

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        <div style={{ background: 'var(--navy)', padding: '12px 14px 12px' }}>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 8 }}>All Patients</p>
          <div style={{ background: 'rgba(255,255,255,.1)', borderRadius: 9, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid rgba(255,255,255,.4)' }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patients..."
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: 13, outline: 'none', flex: 1, fontFamily: 'var(--font)' }}
            />
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ padding: '8px 14px', display: 'flex', gap: 6, background: 'var(--gray)', borderBottom: '1px solid var(--border)' }}>
          {FILTER_OPTS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              background: filter === f ? 'var(--blue)' : '#fff',
              border: `1px solid ${filter === f ? 'var(--blue)' : 'var(--border)'}`,
              borderRadius: 999, padding: '4px 12px',
              fontSize: 11, fontWeight: 700,
              color: filter === f ? '#fff' : 'var(--muted)',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>
              {f}
            </button>
          ))}
        </div>

        <div style={{ padding: '10px 14px' }}>
          {filtered.map(p => (
            <div key={p.user.id} style={{ marginBottom: 7 }}>
              <PatientCard
                patient={p.user}
                alertStatus={p.alertStatus}
                adherence={p.adherence}
                nextDose={p.nextSlot}
                dotStatuses={p.dotStatuses}
              />
            </div>
          ))}
          {filtered.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13, padding: '20px 0' }}>No patients match.</p>}
        </div>
      </div>
      <NavigationBar tabs={CG_TABS} />
    </>
  );
}

// ── Alert Panel ────────────────────────────────────────
export function CaregiverAlerts() {
  const { user } = useAuth();
  const alerts   = DataService.getCaregiverAlerts(user?.id || '');
  const active   = alerts.filter(a => a.status === 'active');
  const resolved = alerts.filter(a => a.status === 'resolved');

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        <div style={{ background: 'var(--navy)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Alerts</p>
          <div style={{ display: 'flex', gap: 6 }}>
            {active.length > 0 && (
              <div style={{ background: 'rgba(212,58,58,.25)', border: '1px solid rgba(212,58,58,.4)', borderRadius: 6, padding: '3px 8px' }}>
                <p style={{ fontSize: 10, color: 'var(--red)', fontWeight: 700 }}>{active.length} active</p>
              </div>
            )}
          </div>
        </div>

        <div style={{ padding: '10px 14px' }}>
          {active.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--red)', letterSpacing: '.05em', marginBottom: 8 }}>ACTIVE</p>
              {active.map(a => (
                <div key={a.id} style={{
                  background: '#fff', borderRadius: 12, padding: '10px 13px',
                  border: '1px solid var(--red-l)', borderLeft: '3px solid var(--red)',
                  marginBottom: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--red)' }} />
                      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--red)' }}>Missed dose</p>
                    </div>
                    <p style={{ fontSize: 9, color: 'var(--muted)' }}>
                      {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{a.message}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => { DataService.resolveAlert(a.id); window.location.reload(); }}
                      style={{ flex: 1, background: 'var(--blue)', border: 'none', borderRadius: 7, padding: '6px 0', color: '#fff', fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                      Resolve
                    </button>
                    <button style={{ flex: 1, background: 'var(--gray)', border: 'none', borderRadius: 7, padding: '6px 0', color: 'var(--text)', fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                      View patient
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {resolved.length > 0 && (
            <>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', letterSpacing: '.05em', marginBottom: 8, marginTop: 8 }}>RESOLVED</p>
              {resolved.slice(0,5).map(a => (
                <div key={a.id} style={{
                  background: '#fff', borderRadius: 12, padding: '10px 13px',
                  border: '1px solid var(--green-l)', borderLeft: '3px solid var(--green)',
                  marginBottom: 7, opacity: .7,
                }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', marginBottom: 3 }}>Resolved</p>
                  <p style={{ fontSize: 12, color: 'var(--muted)' }}>{a.message}</p>
                </div>
              ))}
            </>
          )}

          {alerts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
              <p style={{ color: 'var(--green)', fontSize: 15, fontWeight: 600 }}>All clear!</p>
              <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>No alerts at this time.</p>
            </div>
          )}
        </div>
      </div>
      <NavigationBar tabs={CG_TABS} />
    </>
  );
}

// ── Patient Detail ─────────────────────────────────────
export function PatientDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const patient  = DataService.getUserById(id);
  const { medicines, logs } = DataService.getPatientAdherenceData(id);
  const todayLogs  = logs.filter(l => l.date === today());
  const alertStatus = computeAlertStatus({ logs, medicines });
  const adherence   = computeAdherence(todayLogs, medicines.reduce((a,m)=>a+(m.times||[]).length,0));
  const weekDays    = getWeekAdherence(logs);
  const ALERT_C = { critical: 'var(--red)', warning: 'var(--amber)', resolved: 'var(--green)' };

  // Build today's timeline
  const timeline = medicines.flatMap(m =>
    (m.times||[]).map(t => {
      const log = todayLogs.find(l => l.medicineId===m.id && l.scheduledTime===t);
      const status = log ? (log.confirmed ? 'taken' : 'missed') : 'upcoming';
      return { medicine: m, time: t, status };
    })
  ).sort((a,b) => a.time.localeCompare(b.time));

  if (!patient) return <div style={{ padding: 24 }}>Patient not found.</div>;

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '12px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 20, cursor: 'pointer' }}>←</button>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: ALERT_C[alertStatus], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
              {patient.name?.[0]}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{patient.name}</p>
            </div>
            <span style={{ background: 'rgba(255,255,255,.1)', color: ALERT_C[alertStatus], fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '3px 9px' }}>
              {alertStatus.charAt(0).toUpperCase() + alertStatus.slice(1)}
            </span>
          </div>
          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 5 }}>
            {[
              { l: 'Today',    v: `${adherence}%` },
              { l: 'Medicines',v: medicines.length },
            ].map(s => (
              <div key={s.l} style={{ flex: 1, background: 'rgba(255,255,255,.08)', borderRadius: 8, padding: '7px 0', textAlign: 'center' }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{s.v}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '12px 14px' }}>
          {/* Quick actions */}
          <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
            {[
              { label: 'Call patient',   bg: 'var(--red)',  action: () => {} },
              { label: 'Send reminder',  bg: 'var(--blue)', action: () => {} },
              { label: 'Edit medicines', bg: 'var(--navy)', action: () => {} },
            ].map(a => (
              <button key={a.label} onClick={a.action} style={{
                flex: 1, background: a.bg, border: 'none', borderRadius: 9,
                padding: '9px 0', color: '#fff', fontSize: 10, fontWeight: 700,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}>
                {a.label}
              </button>
            ))}
          </div>

          {/* Timeline */}
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>Today's timeline</p>
          <div style={{ background: '#fff', borderRadius: 12, padding: '10px 12px', border: '1px solid var(--border)', marginBottom: 12 }}>
            {timeline.map((s, i) => (
              <div key={i}>
                {i > 0 && <div className="sep" />}
                <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 38, textAlign: 'right' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: s.status==='taken'?'var(--green)':s.status==='missed'?'var(--red)':'var(--amber)' }}>
                      {formatTime(s.time)}
                    </p>
                  </div>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', flexShrink: 0, marginTop: 3,
                    background: s.status==='taken'?'var(--green)':s.status==='missed'?'var(--red)':'var(--border)' }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{s.medicine.name} {s.medicine.dose}{s.medicine.unit}</p>
                    <StatusBadge status={s.status} style={{ marginTop: 3 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Weekly chart */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>This week</p>
            <WeeklyBar days={weekDays} />
          </div>

          {/* Privacy notice */}
          <div style={{ background: 'var(--amber-l)', border: '1px solid #FAC775', borderRadius: 10, padding: '10px 13px' }}>
            <p style={{ fontSize: 10, color: '#854F0B', lineHeight: 1.5 }}>
              <strong>Privacy:</strong> AI chat history and personal notes are private to the patient and are not visible here.
            </p>
          </div>
        </div>
      </div>
      <NavigationBar tabs={CG_TABS} />
    </>
  );
}

// ── Caregiver Profile ──────────────────────────────────
export function CaregiverProfile() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const cg = DataService.getUserById(user?.id);
  const linkedCount = (cg?.linkedPatients || []).length;
  const [missedDoseAlerts, setMissedDoseAlerts] = useState(user?.missedDoseAlerts ?? true);
  const [language, setLanguage] = useState(user?.language || 'en');
  const [demoMode, setDemoMode] = useState(() => DemoService.isEnabled());

  useEffect(() => {
    setMissedDoseAlerts(user?.missedDoseAlerts ?? true);
    setLanguage(user?.language || 'en');
    setDemoMode(DemoService.isEnabled());
  }, [user]);

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        <div style={{ background: 'var(--navy)', padding: '12px 14px' }}>
          <p style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>Profile</p>
        </div>
        <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: '13px 15px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
              {user?.name?.[0]}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Caregiver · {linkedCount} patients linked</p>
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <p style={{ padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', background: 'var(--gray)', letterSpacing: '.06em' }}>NOTIFICATIONS</p>
            {/* Missed dose alerts */}
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Missed dose alerts</p>
              <button
                type="button"
                onClick={() => {
                  const next = !missedDoseAlerts;
                  setMissedDoseAlerts(next);
                  updateUser({ missedDoseAlerts: next });
                }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                aria-label="Missed dose alerts"
              >
                <div className={`toggle ${missedDoseAlerts ? 'on' : ''}`} />
              </button>
            </div>
            {/* Emergency SOS alerts (placeholder toggle, persisted for consistency) */}
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Emergency SOS alerts</p>
              <div className="toggle on" />
            </div>
            {/* Daily summary (placeholder toggle, persisted for consistency) */}
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Daily summary</p>
              <div className="toggle on" />
            </div>
          </div>

          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <p style={{ padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', background: 'var(--gray)', letterSpacing: '.06em' }}>ACCESSIBILITY</p>
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Language</p>
              <select
                value={language}
                onChange={e => {
                  const next = e.target.value;
                  setLanguage(next);
                  updateUser({ language: next });
                }}
                style={{ border: 'none', background: 'none', color: 'var(--blue)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}
              >
                <option value="en">English</option>
                <option value="ml">Malayalam</option>
              </select>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Demo mode</p>
              <button
                type="button"
                onClick={() => {
                  const next = !demoMode;
                  DemoService.setEnabled(next);
                  setDemoMode(next);
                  window.location.reload();
                }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                aria-label="Demo mode"
              >
                <div className={`toggle ${demoMode ? 'on' : ''}`} />
              </button>
            </div>
          </div>

          <div style={{ background: 'var(--amber-l)', borderRadius: 12, padding: '10px 14px', border: '1px solid #FAC775' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#854F0B', marginBottom: 4 }}>Privacy settings</p>
            <p style={{ fontSize: 11, color: '#854F0B', lineHeight: 1.5 }}>
              You have access to medicine schedules, adherence logs, and alerts only. Patient AI chat and personal notes are always private.
            </p>
          </div>

          <button onClick={() => { logout(); navigate('/login', { replace: true }); }} style={{
            background: 'var(--red-l)', border: '1px solid var(--red)',
            borderRadius: 12, padding: 12, color: 'var(--red)',
            fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
          }}>
            Sign Out
          </button>
        </div>
      </div>
      <NavigationBar tabs={CG_TABS} />
    </>
  );
}
