import React from 'react';
import { formatTime, mealLabel } from '../../utils/helpers.js';
import StatusBadge from './StatusBadge.jsx';
import { ColorTag } from './MedicineColorTag.jsx';

export default function MedicineCard({ slot, mode = 'standard', onClick }) {
  const { medicine: m, time, status } = slot;
  const isSenior = mode === 'senior';
  const borderColor = status === 'taken' ? 'var(--green)'
                    : status === 'due'   ? 'var(--amber)'
                    : status === 'missed'? 'var(--red)'
                    : 'var(--border)';

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: '#fff',
        border: `1px solid ${borderColor}`,
        borderLeft: `4px solid ${borderColor}`,
        borderRadius: 'var(--r-lg)',
        padding: isSenior ? '14px 16px' : '11px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'opacity .15s',
        fontFamily: 'var(--font)',
      }}
    >
      {/* Color identification dot */}
      {m.colorTag ? (
        <ColorTag colorId={m.colorTag} size={isSenior ? 14 : 11} />
      ) : (
        <div style={{
          width: isSenior ? 12 : 9,
          height: isSenior ? 12 : 9,
          borderRadius: '50%',
          background: borderColor,
          flexShrink: 0,
          marginTop: 2,
        }} />
      )}

      {/* Info */}
      <div style={{ flex: 1 }}>
        <div style={{
          fontWeight: 700,
          fontSize: isSenior ? 18 : 13,
          color: 'var(--text)',
          marginBottom: 3,
        }}>
          {m.name}
        </div>
        <div style={{ fontSize: isSenior ? 14 : 11, color: 'var(--muted)' }}>
          {m.dose}{m.unit} · {mealLabel(m.mealContext)}
        </div>
        {m.purpose && (
          <div style={{ fontSize: isSenior ? 13 : 10, color: 'var(--blue)', marginTop: 2, fontStyle: 'italic' }}>
            {m.purpose}
          </div>
        )}
      </div>

      {/* Time + status */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: isSenior ? 14 : 10, color: 'var(--muted)', marginBottom: 4 }}>
          {formatTime(time)}
        </div>
        <StatusBadge status={status} />
      </div>
    </button>
  );
}
