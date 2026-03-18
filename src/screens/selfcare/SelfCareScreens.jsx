import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../contexts/AuthContext.jsx';
import { useMedicine } from '../../contexts/MedicineContext.jsx';
import NavigationBar   from '../../components/common/NavigationBar.jsx';
import MedicineCard    from '../../components/common/MedicineCard.jsx';
import AIChatBubble    from '../../components/common/AIChatBubble.jsx';
import AdherenceRing   from '../../components/common/AdherenceRing.jsx';
import { useAIChat }   from '../../hooks/useAIChat.js';
import { ReminderProvider } from '../../contexts/ReminderContext.jsx';
import ReminderAlert   from '../../components/common/ReminderAlert.jsx';

const SC_TABS = [
  { path: '/selfcare',     label: 'Home'   },
  { path: '/selfcare/ai',  label: 'Mindie' },
];

const WELLNESS_TIPS = [
  '💧 Drink a glass of water',
  '🧘 Take 5 deep breaths',
  '🌿 Step outside for a moment',
  '😊 You\'re doing great today',
  '🌙 Rest well tonight',
];

const CHIPS = [
  { label: 'Next dose?',       text: 'When is my next medicine?' },
  { label: 'How are you?',     text: 'Mindie, how are you?' },
  { label: 'Wellness nudge',   text: 'Give me a wellness tip' },
  { label: 'Taken today?',     text: 'Did I take my medicines today?' },
];

function SelfCareDashboardInner() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const { todaySchedule, todayAdherence, medicines } = useMedicine();
  const tipIndex    = new Date().getHours() % WELLNESS_TIPS.length;

  return (
    <>
      <ReminderAlert />
      <div className="screen" style={{ background: 'var(--gray)' }}>
        {/* Header */}
        <div style={{ background: 'var(--blue)', padding: '22px 20px 0' }}>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 14, marginBottom: 2 }}>Good day,</p>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginBottom: 4 }}>{user?.name} 👋</h1>
          <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginBottom: 16 }}>MediMind — Care that reminds.</p>
          <div style={{ background: 'rgba(255,255,255,.16)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 0 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 11, marginBottom: 3 }}>Today</p>
              <p style={{ color: '#fff', fontSize: 28, fontWeight: 800 }}>{todayAdherence.pct}%</p>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 11, marginTop: 2 }}>{todayAdherence.taken}/{todayAdherence.total} taken</p>
            </div>
            <AdherenceRing pct={todayAdherence.pct} size={60} />
          </div>
          <div style={{ height: 18 }} />
        </div>

        <div style={{ padding: '18px 18px 0' }}>
          {/* Wellness tip card */}
          <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', border: '1px solid var(--border)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-l)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              🌟
            </div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginBottom: 3 }}>Mindie says</p>
              <p style={{ fontSize: 13, color: 'var(--text)' }}>{WELLNESS_TIPS[tipIndex]}</p>
            </div>
          </div>

          {/* Mindie chat shortcut */}
          <button onClick={() => navigate('/selfcare/ai')} style={{
            width: '100%', background: 'var(--blue)', border: 'none', borderRadius: 14,
            padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', marginBottom: 16, fontFamily: 'var(--font)',
          }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <div style={{ width: 16, height: 8, borderRadius: 3, background: '#fff' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>Chat with Mindie</p>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, margin: '2px 0 0' }}>Your companion is here</p>
            </div>
          </button>

          {/* Today's medicines */}
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>Today's medicines</h2>
          {todaySchedule.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>No medicines scheduled. Tap + to add one.</p>
            : todaySchedule.map(slot => (
              <div key={`${slot.medicine.id}-${slot.time}`} style={{ marginBottom: 9 }}>
                <MedicineCard slot={slot} mode="standard" />
              </div>
            ))
          }
        </div>
      </div>
      <NavigationBar tabs={SC_TABS} />
    </>
  );
}

export function SelfCareDashboard() {
  const { medicines, confirmIntake, markMissed } = useMedicine();
  return (
    <ReminderProvider medicines={medicines} onConfirm={confirmIntake} onMiss={markMissed}>
      <SelfCareDashboardInner />
    </ReminderProvider>
  );
}

export function SelfCareAI() {
  const { user } = useAuth();
  const { messages, isLoading, isListening, sendMessage, startVoice, stopVoice, speechSupported } = useAIChat({ autoSpeak: false });
  const [input, setInput] = useState('');
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  const send = () => { if (!input.trim()) return; sendMessage(input); setInput(''); };

  return (
    <>
      <div className="screen" style={{ background: 'var(--gray)', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ background: 'var(--blue)', padding: '16px 18px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 18, height: 9, borderRadius: 3, background: '#fff' }} />
          </div>
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>Mindie</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,.6)' }}>Your wellness companion</p>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, padding: '12px 16px', overflowY: 'auto' }}>
          {messages.map(m => <AIChatBubble key={m.id} message={m} language={user?.language} />)}
          {isLoading && (
            <div style={{ display: 'flex', gap: 5, padding: '6px 0' }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)', animation: `pulse 1s ease ${i*.2}s infinite` }} />)}
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Chips */}
        <div style={{ padding: '7px 14px', display: 'flex', gap: 6, flexWrap: 'wrap', background: '#fff', borderTop: '1px solid var(--border)' }}>
          {CHIPS.map(c => (
            <button key={c.text} onClick={() => sendMessage(c.text)} style={{
              background: 'var(--blue-l)', border: '1px solid var(--blue)',
              borderRadius: 999, padding: '5px 11px',
              fontSize: 11, color: 'var(--blue)', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>{c.label}</button>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '8px 14px 14px', background: '#fff', display: 'flex', gap: 7, alignItems: 'center' }}>
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
            placeholder="Talk to Mindie..." />
          <button onClick={send} style={{ height: 38, padding: '0 14px', background: 'var(--blue)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Send</button>
        </div>
      </div>
      <NavigationBar tabs={SC_TABS} />
    </>
  );
}
