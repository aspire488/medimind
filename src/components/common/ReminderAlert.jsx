import React, { useEffect } from 'react';
import { useReminder }  from '../../contexts/ReminderContext.jsx';
import { formatTime, mealLabel } from '../../utils/helpers.js';
import { getTTSService } from '../../services/ai/TextToSpeechService.js';

export default function ReminderAlert({ seniorMode = false, language = 'en' }) {
  const { activeReminder, justConfirmed, confirm, snooze, dismiss } = useReminder();

  // Auto-speak in senior mode
  useEffect(() => {
    if (seniorMode && activeReminder) {
      const { medicine: m, time } = activeReminder;
      const msg = language === 'ml'
        ? `${formatTime(time)}-ന് ${m.name} ${m.dose}${m.unit} കഴിക്കേണ്ട സമയമായി`
        : `Time to take ${m.name} ${m.dose} ${m.unit} at ${formatTime(time)}`;
      getTTSService().speakSenior(msg, language);
    }
  }, [activeReminder, seniorMode, language]);

  // Success flash
  if (justConfirmed) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'var(--green)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn .3s ease',
      }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <circle cx="40" cy="40" r="38" stroke="rgba(255,255,255,.4)" strokeWidth="3"/>
          <polyline points="22,40 34,54 58,28" stroke="#fff" strokeWidth="5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="50" strokeDashoffset="50"
            style={{ animation: 'checkmark .5s ease .1s forwards' }}/>
        </svg>
        <p style={{ color: '#fff', fontSize: 24, fontWeight: 700, marginTop: 16 }}>Medicine taken!</p>
        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 15, marginTop: 8 }}>{justConfirmed}</p>
      </div>
    );
  }

  if (!activeReminder) return null;

  const { medicine: m, time } = activeReminder;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: seniorMode ? 'var(--blue)' : 'var(--navy)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 24px',
      animation: 'fadeIn .3s ease',
    }}>
      {/* Header */}
      <p style={{ color: 'rgba(255,255,255,.7)', fontSize: seniorMode ? 15 : 12, marginBottom: 8 }}>
        Time to take your medicine
      </p>
      <h1 style={{ color: '#fff', fontSize: seniorMode ? 32 : 26, fontWeight: 800, textAlign: 'center', marginBottom: 6 }}>
        {m.name}
      </h1>
      <p style={{ color: 'rgba(255,255,255,.75)', fontSize: seniorMode ? 18 : 14, marginBottom: 28 }}>
        {m.dose}{m.unit} · {mealLabel(m.mealContext)}
      </p>

      {/* Pill icon */}
      <div style={{
        width: seniorMode ? 100 : 80,
        height: seniorMode ? 100 : 80,
        borderRadius: '50%',
        background: 'rgba(255,255,255,.15)',
        border: '3px solid rgba(255,255,255,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 28,
      }}>
        <div style={{
          width: seniorMode ? 52 : 42,
          height: seniorMode ? 26 : 21,
          borderRadius: 999,
          background: '#fff',
        }} />
      </div>

      {/* Time */}
      <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginBottom: 32 }}>
        Scheduled: {formatTime(time)}
      </p>

      {/* TAKE button */}
      <button
        onClick={confirm}
        style={{
          width: '100%',
          height: seniorMode ? 72 : 56,
          background: 'var(--green)',
          border: 'none',
          borderRadius: 16,
          color: '#fff',
          fontSize: seniorMode ? 22 : 17,
          fontWeight: 800,
          cursor: 'pointer',
          fontFamily: 'var(--font)',
          marginBottom: 16,
          transition: 'opacity .15s',
          animation: 'pulse 2s ease infinite',
        }}
      >
        TAKE MEDICINE
      </button>

      {/* Snooze */}
      <button
        onClick={() => snooze(10)}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,.55)',
          fontSize: seniorMode ? 16 : 13,
          cursor: 'pointer',
          fontFamily: 'var(--font)',
          marginBottom: 12,
        }}
      >
        Remind me in 10 minutes
      </button>

      {/* Dismiss */}
      <button
        onClick={dismiss}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,.3)',
          fontSize: 12, cursor: 'pointer',
          fontFamily: 'var(--font)',
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
