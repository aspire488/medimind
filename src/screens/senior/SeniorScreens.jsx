import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar  from '../../components/common/NavigationBar.jsx';
import MedicineCard   from '../../components/common/MedicineCard.jsx';
import AIChatBubble   from '../../components/common/AIChatBubble.jsx';
import { useMedicine }from '../../contexts/MedicineContext.jsx';
import { useAuth }    from '../../contexts/AuthContext.jsx';
import { useAIChat }  from '../../hooks/useAIChat.js';
import DemoService    from '../../services/DemoService.js';

const SENIOR_TABS = [
  { path: '/senior',           label: 'Home'     },
  { path: '/senior/medicines', label: 'Medicines' },
  { path: '/senior/ai',        label: 'AI Help'   },
  { path: '/senior/profile',   label: 'Profile'   },
];

const CHIPS = [
  { label: 'Next dose?',     text: 'When is my next medicine?' },
  { label: 'Taken today?',   text: 'Did I take my medicines today?' },
  { label: 'Remind 10 min',  text: 'Remind me in 10 minutes' },
  { label: 'My medicines',   text: 'What medicines do I have?' },
];

// ── Senior Medicines ──────────────────────────────────
export function SeniorMedicines() {
  const { todaySchedule, medicines } = useMedicine();
  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        <div style={{ background: 'var(--blue)', padding: '20px 20px 16px' }}>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>My Medicines</h1>
          <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 14, marginTop: 4 }}>
            {medicines.length} active medicines
          </p>
        </div>
        <div style={{ padding: '16px 20px' }}>
          {todaySchedule.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 16 }}>No medicines yet. Ask your caregiver to add them.</p>
            : todaySchedule.map(slot => (
              <div key={`${slot.medicine.id}-${slot.time}`} style={{ marginBottom: 12 }}>
                <MedicineCard slot={slot} mode="senior" />
              </div>
            ))
          }
        </div>
      </div>
      <NavigationBar tabs={SENIOR_TABS} seniorMode />
    </>
  );
}

// ── Senior AI Help ────────────────────────────────────
export function SeniorAI() {
  const { user }   = useAuth();
  const { messages, isLoading, isListening, sendMessage, startVoice, stopVoice, speechSupported } = useAIChat({ autoSpeak: true, isSenior: true });
  const [input, setInput] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: 'var(--blue)', padding: '18px 20px 16px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="14" viewBox="0 0 20 14" fill="none"><rect x="0" y="4" width="20" height="6" rx="3" fill="#fff" opacity=".9"/><rect x="7" y="0" width="6" height="14" rx="3" fill="rgba(255,255,255,.7)"/></svg>
            </div>
            <div>
              <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Mindie</h1>
              <p style={{ color: 'rgba(255,255,255,.65)', fontSize: 12, marginTop: 2 }}>
                Your medicine companion
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto' }}>
          {messages.map(m => (
            <AIChatBubble key={m.id} message={m} language={user?.language} seniorMode />
          ))}
          {isLoading && (
            <div style={{ display: 'flex', gap: 6, padding: '8px 0' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)',
                  animation: `pulse 1s ease ${i*0.2}s infinite`,
                }} />
              ))}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Chips */}
        <div style={{ padding: '8px 16px', display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid var(--border)', background: '#fff' }}>
          {CHIPS.map(c => (
            <button key={c.text}
              onClick={() => sendMessage(c.text)}
              style={{
                background: 'var(--blue-l)', border: '1px solid var(--blue)',
                borderRadius: 999, padding: '7px 14px',
                fontSize: 13, color: 'var(--blue)', fontWeight: 600,
                cursor: 'pointer', fontFamily: 'var(--font)',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '10px 16px 16px', background: '#fff', display: 'flex', gap: 10, alignItems: 'center' }}>
          {speechSupported && (
            <button
              onClick={isListening ? stopVoice : startVoice}
              style={{
                width: 52, height: 52, borderRadius: 12, border: 'none',
                background: isListening ? 'var(--red-l)' : 'var(--blue-l)',
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: isListening ? 'pulse 1s infinite' : 'none',
              }}
            >
              <div style={{ width: 16, height: 16, borderRadius: '50%', background: isListening ? 'var(--red)' : 'var(--blue)' }} />
            </button>
          )}
          <input
            className="input input-lg"
            style={{ flex: 1 }}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Ask a question..."
          />
          <button onClick={send}
            style={{
              height: 52, padding: '0 18px',
              background: 'var(--blue)', border: 'none', borderRadius: 12,
              color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            Send
          </button>
        </div>
      </div>
      <NavigationBar tabs={SENIOR_TABS} seniorMode />
    </>
  );
}

// ── Senior Profile / Settings ───────────────────────────
export function SeniorProfile() {
  const { user, logout, updateUser, switchMode } = useAuth();
  const navigate = useNavigate();
  const [language, setLanguage] = useState(user?.language || 'en');
  const [demoMode, setDemoMode] = useState(() => DemoService.isEnabled());

  useEffect(() => {
    setLanguage(user?.language || 'en');
    setDemoMode(DemoService.isEnabled());
  }, [user]);

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };
  const handleStandardSwitch = () => { switchMode('standard'); navigate('/standard', { replace: true }); };

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)' }}>
        <div style={{ background: 'var(--blue)', padding: '20px 20px 16px' }}>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>Profile & Settings</h1>
          <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 13, marginTop: 4 }}>Senior mode</p>
        </div>

        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Profile card */}
          <div style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 800 }}>
              {user?.name?.[0] || 'U'}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{user?.name}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Senior Patient</p>
            </div>
          </div>

          {/* Accessibility */}
          <div style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <p style={{ padding: '10px 14px', fontSize: 10, fontWeight: 800, color: 'var(--muted)', background: 'var(--gray)', letterSpacing: '.06em' }}>ACCESSIBILITY</p>
            <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--text)' }}>Language</p>
              <select
                value={language}
                onChange={e => {
                  const next = e.target.value;
                  setLanguage(next);
                  updateUser({ language: next });
                }}
                style={{ border: 'none', background: 'none', color: 'var(--blue)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
              >
                <option value="en">English</option>
                <option value="ml">Malayalam</option>
              </select>
            </div>
            <div style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14, color: 'var(--text)' }}>Demo mode</p>
              <button
                type="button"
                onClick={() => {
                  const next = !demoMode;
                  DemoService.setEnabled(next);
                  setDemoMode(next);
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
            <button onClick={handleStandardSwitch} style={{
              width: '100%', padding: '12px 14px', background: 'none', border: 'none',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', fontFamily: 'var(--font)',
              borderTop: '1px solid var(--border)',
            }}>
              <p style={{ fontSize: 14, color: 'var(--text)' }}>Switch to Standard Mode</p>
              <p style={{ fontSize: 14, color: 'var(--blue)', fontWeight: 800 }}>Enable →</p>
            </button>
          </div>

          {/* Sign out */}
          <button onClick={handleLogout} style={{
            background: 'var(--red-l)', border: '1px solid var(--red)',
            borderRadius: 16, padding: 14, width: '100%',
            color: 'var(--red)', fontSize: 14, fontWeight: 800,
            cursor: 'pointer', fontFamily: 'var(--font)',
          }}>
            Sign Out
          </button>
        </div>
      </div>

      <NavigationBar tabs={SENIOR_TABS} seniorMode />
    </>
  );
}
