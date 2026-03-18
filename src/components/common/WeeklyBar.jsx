import React from 'react';

export default function WeeklyBar({ days = [] }) {
  const max = 100;
  return (
    <div style={{ display: 'flex', gap: 5, alignItems: 'flex-end', height: 52 }}>
      {days.map((d, i) => {
        const pct = d.pct ?? 0;
        const h   = d.pct === null ? 0 : Math.max(4, Math.round((pct / max) * 44));
        const bg  = d.pct === null ? 'var(--border)'
                  : pct >= 80 ? 'var(--green)'
                  : pct >= 40 ? 'var(--amber)'
                  : 'var(--red)';
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ width: '100%', background: bg, borderRadius: '4px 4px 0 0', height: h, transition: 'height .4s' }} />
            <span style={{ fontSize: 9, color: 'var(--muted)' }}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
