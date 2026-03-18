import React from 'react';

export default function AdherenceRing({ pct = 0, size = 56, strokeWidth = 4, color = '#28A06E', label, sublabel }) {
  const r   = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke="rgba(255,255,255,.18)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray .6s ease' }} />
      </svg>
      {label && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: size > 80 ? 18 : 12, fontWeight: 700, color: '#fff', lineHeight: 1 }}>{label}</span>
          {sublabel && <span style={{ fontSize: 9, color: 'rgba(255,255,255,.6)', marginTop: 2 }}>{sublabel}</span>}
        </div>
      )}
    </div>
  );
}
