import React, { useState, useRef, useEffect } from 'react';
import { useNavigate }   from 'react-router-dom';
import { useAuth }       from '../../contexts/AuthContext.jsx';
import MindieAvatar      from '../../components/common/MindieAvatar.jsx';
import AIChatBubble      from '../../components/common/AIChatBubble.jsx';
import { useAIChat }     from '../../hooks/useAIChat.js';
import { getWellnessNudge } from '../../services/ai/MindieService.js';

const SELF_CARE_CHIPS = [
  { label: "I'm feeling lonely",   text: "I'm feeling lonely today." },
  { label: "I'm tired",            text: "I'm tired and need rest." },
  { label: "Check my medicines",   text: "What medicines do I have today?" },
  { label: "Wellness tip",         text: "Give me a wellness tip." },
  { label: "I'm worried",          text: "I'm feeling worried." },
  { label: "Motivate me",          text: "I need some motivation today." },
];

export default function SelfCareMode() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const { messages, isLoading, isListening, sendMessage, startVoice, stopVoice, speechSupported }
    = useAIChat({ autoSpeak: false });
  const [input, setInput] = useState('');
  const [nudge]           = useState(() => getWellnessNudge());
  const endRef            = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => { if (!input.trim()) return; sendMessage(input); setInput(''); };

  return (
    <div className="screen" style={{ background: 'var(--gray)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'var(--navy)', padding: '16px 18px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', fontSize: 20, cursor: 'pointer' }}>←</button>
          <MindieAvatar size={38} animated />
          <div>
            <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Mindie</p>
            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, marginTop: 1 }}>
              Your self-care companion 💙
            </p>
          </div>
        </div>
      </div>

      {/* Daily nudge banner */}
      <div style={{
        background: 'var(--green-l)',
        borderBottom: '1px solid rgba(40,160,110,.2)',
        padding: '10px 16px',
        display: 'flex', gap: 10, alignItems: 'flex-start',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 16 }}>🌿</span>
        <p style={{ fontSize: 12, color: 'var(--green)', lineHeight: 1.5 }}>{nudge}</p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, padding: '14px 16px', overflowY: 'auto' }}>
        {messages.map(m => (
          <AIChatBubble key={m.id} message={m} language={user?.language} />
        ))}
        {isLoading && (
          <div style={{ display: 'flex', gap: 5, padding: '6px 0' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'var(--blue)',
                animation: `pulse 1s ease ${i * .2}s infinite`,
              }} />
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Chips */}
      <div style={{
        padding: '8px 14px',
        display: 'flex', gap: 7, flexWrap: 'wrap',
        background: '#fff', borderTop: '1px solid var(--border)',
      }}>
        {SELF_CARE_CHIPS.map(c => (
          <button key={c.text}
            onClick={() => sendMessage(c.text)}
            style={{
              background: 'var(--blue-l)', border: '1px solid var(--blue)',
              borderRadius: 999, padding: '5px 11px',
              fontSize: 11, color: 'var(--blue)', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Input row */}
      <div style={{
        padding: '8px 14px 16px', background: '#fff',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        {speechSupported && (
          <button onClick={isListening ? stopVoice : startVoice} style={{
            width: 40, height: 40, borderRadius: 10, border: 'none',
            background: isListening ? 'var(--red-l)' : 'var(--gray)',
            cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: isListening ? 'var(--red)' : 'var(--blue)' }} />
          </button>
        )}
        <input
          className="input"
          style={{ flex: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Talk to Mindie..."
        />
        <button onClick={send} style={{
          height: 40, padding: '0 14px',
          background: 'var(--blue)', border: 'none', borderRadius: 8,
          color: '#fff', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', fontFamily: 'var(--font)',
        }}>
          Send
        </button>
      </div>
    </div>
  );
}
