import React, { useState } from 'react';

const SLOTS = [
  { id: 'am',   label: 'Morning',  time: '08:00' },
  { id: 'noon', label: 'Noon',     time: '13:00' },
  { id: 'eve',  label: 'Evening',  time: '18:00' },
  { id: 'pm',   label: 'Night',    time: '21:00' },
];

const STATUS_COLOR = {
  taken:    'var(--green)',
  active:   'var(--amber)',
  missed:   'var(--red)',
  upcoming: 'var(--border)',
};

export default function DispenserView({ slotStatuses = {} }) {
  const [scanning, setScanning] = useState(null);
  const [scanned, setScanned]   = useState({});

  const simulateScan = (slotId) => {
    setScanning(slotId);
    setTimeout(() => {
      setScanning(null);
      setScanned(prev => ({ ...prev, [slotId]: true }));
    }, 2000);
  };

  return (
    <div style={{ padding: '20px 20px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
        Smart Dispenser
      </h2>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 20 }}>
        Simulated hardware view — LED indicators and slot status
      </p>

      {/* Tray grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
        {SLOTS.map(slot => {
          const status = scanned[slot.id] ? 'taken'
                       : slotStatuses[slot.id] || 'upcoming';
          const isActive  = scanning === slot.id;
          const ledColor  = STATUS_COLOR[status];

          return (
            <div key={slot.id} style={{
              background: '#fff',
              border: `1px solid ${status === 'active' ? 'var(--amber)' : 'var(--border)'}`,
              borderRadius: 14,
              padding: '14px 16px',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Slot label */}
              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)', marginBottom: 4 }}>
                {slot.label}
              </p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>
                {slot.time}
              </p>

              {/* LED indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <div style={{
                  width: 12, height: 12,
                  borderRadius: '50%',
                  background: ledColor,
                  animation: status === 'active' ? 'pulse 1s infinite' : 'none',
                  boxShadow: status === 'active' ? `0 0 6px ${ledColor}` : 'none',
                }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: ledColor === 'var(--border)' ? 'var(--muted)' : ledColor }}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              {/* QR scan button */}
              {status !== 'taken' && (
                <button
                  onClick={() => simulateScan(slot.id)}
                  disabled={isActive}
                  style={{
                    width: '100%',
                    background: isActive ? 'var(--blue-l)' : 'var(--gray)',
                    border: `1px solid ${isActive ? 'var(--blue)' : 'var(--border)'}`,
                    borderRadius: 8, padding: '7px 0',
                    fontSize: 11, fontWeight: 600,
                    color: isActive ? 'var(--blue)' : 'var(--muted)',
                    cursor: isActive ? 'default' : 'pointer',
                    fontFamily: 'var(--font)',
                  }}
                >
                  {isActive ? 'Scanning...' : 'Scan QR'}
                </button>
              )}

              {/* Scan animation overlay */}
              {isActive && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(26,111,189,.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: '80%', height: 2,
                    background: 'var(--blue)',
                    animation: 'scanLine 1s ease infinite',
                    opacity: .8,
                  }} />
                </div>
              )}

              {/* Confirmed check */}
              {scanned[slot.id] && (
                <div style={{
                  position: 'absolute', top: 10, right: 12,
                  fontSize: 16, color: 'var(--green)',
                }}>✓</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ background: 'var(--gray)', borderRadius: 10, padding: '10px 14px' }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', marginBottom: 8 }}>LED Status Guide</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {[
            { color: 'var(--green)', label: 'Green — medicine taken' },
            { color: 'var(--amber)', label: 'Amber — dose due now' },
            { color: 'var(--red)',   label: 'Red — dose missed' },
            { color: 'var(--border)',label: 'Off — upcoming dose' },
          ].map(i => (
            <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: i.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{i.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scanLine {
          0%   { transform: translateY(-40px); opacity: 1; }
          100% { transform: translateY(40px);  opacity: 0; }
        }
      `}</style>
    </div>
  );
}
