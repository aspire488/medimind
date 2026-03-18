// ═══════════════════════════════════════════════════
// DesktopBlock — shown when screen > 768px
// Global guard: every screen respects this
// ═══════════════════════════════════════════════════
import React from 'react';

export default function DesktopBlock() {
  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0F1B35',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 32px',
      zIndex: 9999,
      textAlign: 'center',
    }}>
      {/* Logo */}
      <div style={{
        width: 80, height: 80,
        borderRadius: 22,
        background: 'rgba(26,111,189,.25)',
        border: '2px solid rgba(26,111,189,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 24,
      }}>
        {/* Pill icon */}
        <div style={{
          width: 44, height: 22, borderRadius: 999,
          background: '#1A6FBD',
          display: 'flex', alignItems: 'center',
        }}>
          <div style={{ width: 2, height: '100%', background: 'rgba(255,255,255,.5)', marginLeft: 21 }} />
        </div>
      </div>

      {/* App name */}
      <h1 style={{
        color: '#fff',
        fontSize: 28, fontWeight: 800,
        letterSpacing: '-.5px',
        marginBottom: 6,
        fontFamily: 'system-ui, sans-serif',
      }}>
        MediMind
      </h1>
      <p style={{
        color: 'rgba(255,255,255,.45)',
        fontSize: 13,
        marginBottom: 32,
        fontFamily: 'system-ui, sans-serif',
      }}>
        Care that reminds.
      </p>

      {/* Phone illustration */}
      <div style={{
        width: 56, height: 96,
        border: '3px solid rgba(255,255,255,.2)',
        borderRadius: 16,
        marginBottom: 28,
        position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 20, height: 3, background: 'rgba(255,255,255,.3)', borderRadius: 2, position: 'absolute', top: 10 }} />
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A6FBD' }} />
        <div style={{ width: 20, height: 3, background: 'rgba(255,255,255,.2)', borderRadius: 2, position: 'absolute', bottom: 10 }} />
      </div>

      {/* Message */}
      <p style={{
        color: 'rgba(255,255,255,.8)',
        fontSize: 17, fontWeight: 600,
        lineHeight: 1.5,
        maxWidth: 340,
        marginBottom: 12,
        fontFamily: 'system-ui, sans-serif',
      }}>
        MediMind works best on mobile devices.
      </p>
      <p style={{
        color: 'rgba(255,255,255,.45)',
        fontSize: 14,
        lineHeight: 1.6,
        maxWidth: 320,
        fontFamily: 'system-ui, sans-serif',
      }}>
        Please open this app on a smartphone or reduce your browser window below 768px.
      </p>
    </div>
  );
}
