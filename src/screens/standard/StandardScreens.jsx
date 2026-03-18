import React, { useState, useRef, useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../../contexts/AuthContext.jsx';
import { useMedicine }  from '../../contexts/MedicineContext.jsx';
import NavigationBar    from '../../components/common/NavigationBar.jsx';
import MedicineCard     from '../../components/common/MedicineCard.jsx';
import AIChatBubble     from '../../components/common/AIChatBubble.jsx';
import { useAIChat }    from '../../hooks/useAIChat.js';

import { ColorTagSelector } from '../../components/common/MedicineColorTag.jsx';
import DemoService from '../../services/DemoService.js';

const STD_TABS = [
  { path: '/standard',           label: 'Home'     },
  { path: '/standard/medicines', label: 'Medicines' },
  { path: '/standard/ai',        label: 'AI Chat'   },
  { path: '/standard/profile',   label: 'Profile'   },
];

const CHIPS = [
  { label: 'Next dose?',    text: 'When is my next medicine?' },
  { label: 'Taken today?',  text: 'Did I take my medicines today?' },
  { label: 'Side effects?', text: 'What are the side effects of my medicine?' },
  { label: 'Streak',        text: 'What is my adherence streak?' },
];

const FREQ_OPTIONS  = ['daily','twice','three times'];
const MEAL_OPTIONS  = ['before','after','with','any'];
const UNIT_OPTIONS  = ['mg','ml','tablet','capsule'];

// ── Medicines List ─────────────────────────────────────
export function StandardMedicines() {
  const navigate = useNavigate();
  const { todaySchedule, medicines } = useMedicine();
  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        <div style={{ background: 'var(--navy)', padding: '14px 18px 14px' }}>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>My Medicines</p>
          <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, marginTop: 2 }}>
            {medicines.length} active · Today
          </p>
        </div>
        <div style={{ padding: '12px 16px' }}>
          {todaySchedule.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 14, padding: '20px 0' }}>No medicines yet.</p>
            : todaySchedule.map(slot => (
              <div key={`${slot.medicine.id}-${slot.time}`} style={{ marginBottom: 8 }}>
                <MedicineCard slot={slot} mode="standard" />
              </div>
            ))
          }
          <button
            onClick={() => navigate('/standard/medicines/add')}
            className="btn btn-navy btn-lg btn-full"
            style={{ marginTop: 8 }}
          >
            + Add Medicine
          </button>
        </div>
      </div>
      <NavigationBar tabs={STD_TABS} />
    </>
  );
}

// ── Add Medicine (4-step form) ─────────────────────────
export function AddMedicine() {
  const navigate = useNavigate();
  const { addMedicine } = useMedicine();
  const { user }        = useAuth();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', purpose: '', dose: '', unit: 'mg',
    frequency: 'daily', times: ['08:00'],
    mealContext: 'after', daysRemaining: 30,
    colorTag: 'blue',
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const STEPS = [
    // Step 0 — Name + Purpose
    <div key="0">
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>What is the medicine name?</p>
      <input className="input input-lg" placeholder="e.g. Metformin"
        value={form.name} onChange={e => set('name', e.target.value)} autoFocus style={{ marginBottom: 12 }} />
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>What is it for? <span style={{ fontSize: 12, opacity: .6 }}>(optional, helps seniors)</span></p>
      <input className="input" placeholder="e.g. Controls blood sugar"
        value={form.purpose} onChange={e => set('purpose', e.target.value)} style={{ marginBottom: 16 }} />
      <ColorTagSelector value={form.colorTag} onChange={v => set('colorTag', v)} />
    </div>,
    // Step 1 — Dose
    <div key="1">
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Dosage</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <input className="input input-lg" style={{ flex: 1 }} placeholder="Amount"
          type="number" value={form.dose} onChange={e => set('dose', e.target.value)} />
        <select className="input input-lg" style={{ width: 110 }}
          value={form.unit} onChange={e => set('unit', e.target.value)}>
          {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
    </div>,
    // Step 2 — Frequency + time
    <div key="2">
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>Frequency</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FREQ_OPTIONS.map(f => (
          <button key={f}
            onClick={() => set('frequency', f)}
            style={{
              flex: 1, padding: '10px 0', border: 'none', borderRadius: 10,
              background: form.frequency === f ? 'var(--blue)' : 'var(--gray)',
              color: form.frequency === f ? '#fff' : 'var(--text)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 6 }}>Time</p>
      <input className="input input-lg" type="time"
        value={form.times[0]} onChange={e => set('times', [e.target.value])} />
    </div>,
    // Step 3 — Meal context
    <div key="3">
      <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 8 }}>Meal timing</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {MEAL_OPTIONS.map(m => (
          <button key={m}
            onClick={() => set('mealContext', m)}
            style={{
              padding: '12px 0', border: 'none', borderRadius: 10,
              background: form.mealContext === m ? 'var(--blue)' : 'var(--gray)',
              color: form.mealContext === m ? '#fff' : 'var(--text)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)',
              textTransform: 'capitalize',
            }}
          >
            {m} food
          </button>
        ))}
      </div>
    </div>,
  ];

  const canNext = [
    form.name.trim().length > 0,
    form.dose.trim().length > 0,
    form.times[0].length > 0,
    true,
  ];

  const handleFinish = () => {
    addMedicine({ ...form, patientId: user?.id });
    navigate('/standard/medicines');
  };

  return (
    <>
      <div className="screen" style={{ background: 'var(--white)' }}>
        {/* Header */}
        <div style={{ background: 'var(--navy)', padding: '14px 18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Add Medicine</p>
            <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 20, cursor: 'pointer' }}>×</button>
          </div>
          {/* Progress bar */}
          <div style={{ display: 'flex', gap: 5 }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 3, borderRadius: 2,
                background: i <= step ? 'var(--blue)' : 'rgba(255,255,255,.2)',
                transition: 'background .3s',
              }} />
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 10, marginTop: 6 }}>
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        <div style={{ padding: '24px 20px', flex: 1 }}>
          {STEPS[step]}
        </div>

        {/* Navigation buttons */}
        <div style={{ padding: '16px 20px 24px', display: 'flex', gap: 10 }}>
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost btn-lg" style={{ flex: 1 }}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext[step]}
              className="btn btn-navy btn-lg"
              style={{ flex: 1, opacity: canNext[step] ? 1 : .5 }}
            >
              Continue
            </button>
          ) : (
            <button onClick={handleFinish} className="btn btn-green btn-lg" style={{ flex: 1 }}>
              Save Medicine
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ── AI Chat ────────────────────────────────────────────
export function StandardAI() {
  const { user } = useAuth();
  const { messages, isLoading, isListening, sendMessage, startVoice, stopVoice, speechSupported } = useAIChat();
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => { if (!input.trim()) return; sendMessage(input); setInput(''); };

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'var(--navy)', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-l)', border: '2px solid var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none"><rect x="0" y="3" width="16" height="5" rx="2.5" fill="#1A6FBD"/><rect x="5.5" y="0" width="5" height="10" rx="2.5" fill="#28A06E"/></svg>
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>Mindie</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Medicine assistant · English & Malayalam</p>
          </div>
        </div>

        <div style={{ flex: 1, padding: '10px 14px', overflowY: 'auto' }}>
          {messages.map(m => <AIChatBubble key={m.id} message={m} language={user?.language} />)}
          {isLoading && (
            <div style={{ display: 'flex', gap: 5, padding: '6px 0' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', animation: `pulse 1s ease ${i*.2}s infinite` }} />)}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Chips */}
        <div style={{ padding: '7px 12px', display: 'flex', gap: 6, flexWrap: 'wrap', background: '#fff', borderTop: '1px solid var(--border)' }}>
          {CHIPS.map(c => (
            <button key={c.text} onClick={() => sendMessage(c.text)} style={{
              background: '#fff', border: '1px solid var(--blue)',
              borderRadius: 999, padding: '4px 10px',
              fontSize: 10, color: 'var(--blue)', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>
              {c.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '8px 12px 12px', background: '#fff', display: 'flex', gap: 7, alignItems: 'center' }}>
          {speechSupported && (
            <button onClick={isListening ? stopVoice : startVoice} style={{
              width: 38, height: 38, borderRadius: 8, border: 'none',
              background: isListening ? 'var(--red-l)' : 'var(--gray)',
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: isListening ? 'var(--red)' : 'var(--blue)' }} />
            </button>
          )}
          <input className="input" style={{ flex: 1 }}
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask anything about your medicines..." />
          <button onClick={send} style={{
            height: 38, padding: '0 14px', background: 'var(--blue)',
            border: 'none', borderRadius: 8, color: '#fff',
            fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)',
          }}>Send</button>
        </div>
      </div>
      <NavigationBar tabs={STD_TABS} />
    </>
  );
}

// ── Profile / Settings ─────────────────────────────────
export function StandardProfile() {
  const { user, logout, switchMode, updateUser } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(user?.language || 'en');
  const [medicineReminders, setMedicineReminders] = useState(user?.medicineReminders ?? true);
  const [missedDoseAlerts, setMissedDoseAlerts] = useState(user?.missedDoseAlerts ?? true);
  const [refillReminders, setRefillReminders] = useState(user?.refillReminders ?? false);
  const [demoMode, setDemoMode] = useState(() => DemoService.isEnabled());

  useEffect(() => {
    setLanguage(user?.language || 'en');
    setMedicineReminders(user?.medicineReminders ?? true);
    setMissedDoseAlerts(user?.missedDoseAlerts ?? true);
    setRefillReminders(user?.refillReminders ?? false);
    setDemoMode(DemoService.isEnabled());
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleSeniorSwitch = () => { switchMode('senior'); navigate('/senior', { replace: true }); };

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        <div style={{ background: 'var(--navy)', padding: '14px 18px 14px' }}>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Profile & Settings</p>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Profile card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '12px 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 16, fontWeight: 700 }}>
              {user?.name?.[0]}
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{user?.name}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Standard Patient</p>
            </div>
          </div>

          {/* Notifications */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <p style={{ padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', background: 'var(--gray)', letterSpacing: '.06em' }}>NOTIFICATIONS</p>
            {[
              { key: 'medicineReminders', label: 'Medicine reminders', on: medicineReminders },
              { key: 'missedDoseAlerts',  label: 'Missed dose alerts', on: missedDoseAlerts },
              { key: 'refillReminders',   label: 'Refill reminders',   on: refillReminders },
            ].map(s => (
              <div key={s.label} style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                <p style={{ fontSize: 13, color: 'var(--text)' }}>{s.label}</p>
                <button
                  type="button"
                  onClick={() => {
                    if (s.key === 'medicineReminders') {
                      const next = !medicineReminders;
                      setMedicineReminders(next);
                      updateUser({ medicineReminders: next });
                    } else if (s.key === 'missedDoseAlerts') {
                      const next = !missedDoseAlerts;
                      setMissedDoseAlerts(next);
                      updateUser({ missedDoseAlerts: next });
                    } else if (s.key === 'refillReminders') {
                      const next = !refillReminders;
                      setRefillReminders(next);
                      updateUser({ refillReminders: next });
                    }
                  }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                  aria-label={s.label}
                >
                  <div className={`toggle ${s.on ? 'on' : ''}`} />
                </button>
              </div>
            ))}
          </div>

          {/* Accessibility */}
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <p style={{ padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', background: 'var(--gray)', letterSpacing: '.06em' }}>ACCESSIBILITY</p>
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Language</p>
              <select
                value={language}
                onChange={e => {
                  const next = e.target.value;
                  setLanguage(next);
                  updateUser({ language: next });
                }}
                style={{ border: 'none', background: 'none', color: 'var(--blue)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                <option value="en">English</option>
                <option value="ml">Malayalam</option>
              </select>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Demo mode</p>
              <button
                type="button"
                onClick={() => {
                  const next = !demoMode;
                  DemoService.setEnabled(next);
                  setDemoMode(next);
                  // Seed demo data immediately if enabling
                  if (next) {
                    try { DemoService.ensureSeedForUser(user); } catch {}
                  }
                  window.location.reload();
                }}
                style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                aria-label="Demo mode"
              >
                <div className={`toggle ${demoMode ? 'on' : ''}`} />
              </button>
            </div>
            <button onClick={handleSeniorSwitch} style={{
              width: '100%', padding: '10px 14px', background: 'none', border: 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>Switch to Senior Mode</p>
              <p style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>Enable →</p>
            </button>
          </div>

          {/* Sign out */}
          <button onClick={handleLogout} style={{
            background: 'var(--red-l)', border: '1px solid var(--red)',
            borderRadius: 12, padding: 12, width: '100%',
            color: 'var(--red)', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font)',
          }}>
            Sign Out
          </button>
        </div>
      </div>
      <NavigationBar tabs={STD_TABS} />
    </>
  );
}
