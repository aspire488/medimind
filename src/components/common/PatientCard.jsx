import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatTime } from '../../utils/helpers.js';

const ALERT_COLOR = { critical: 'var(--red)', warning: 'var(--amber)', resolved: 'var(--green)' };
const ALERT_BG    = { critical: 'var(--red-l)', warning: 'var(--amber-l)', resolved: 'var(--green-l)' };
const ALERT_LABEL = { critical: 'Missed', warning: 'Due soon', resolved: 'On track' };

export default function PatientCard({ patient, alertStatus, adherence, nextDose, dotStatuses = [] }) {
  const navigate = useNavigate();
  const color = ALERT_COLOR[alertStatus] || 'var(--border)';

  return (
    <div style={{
      background: '#fff',
      border: `1px solid var(--border)`,
      borderLeft: `3px solid ${color}`,
      borderRadius: 'var(--r-lg)',
      padding: '11px 14px',
      cursor: 'pointer',
    }}
      onClick={() => navigate(`/caregiver/patients/${patient.id}`)}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>
          {patient.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>{patient.name}</span>
            <span style={{
              background: ALERT_BG[alertStatus],
              color,
              fontSize: 10, fontWeight: 700,
              borderRadius: 999, padding: '2px 8px',
            }}>
              {ALERT_LABEL[alertStatus]}
            </span>
          </div>
          <span style={{ fontSize: 10, color: 'var(--muted)' }}>
            {adherence}% today
          </span>
        </div>
      </div>

      {/* Dot progress */}
      {dotStatuses.length > 0 && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 7, alignItems: 'center' }}>
          {dotStatuses.map((s, i) => (
            <div key={i} style={{
              width: 9, height: 9, borderRadius: '50%',
              background: s === 'taken' ? 'var(--green)' : s === 'missed' ? 'var(--red)' : 'var(--border)',
            }} />
          ))}
          <span style={{ fontSize: 10, color: 'var(--muted)', marginLeft: 4 }}>
            {dotStatuses.filter(s=>s==='taken').length}/{dotStatuses.length} taken
          </span>
        </div>
      )}

      {/* Next dose + view btn */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 600 }}>
          {nextDose ? `Next: ${nextDose.medicine.name} · ${formatTime(nextDose.time)}` : 'All done today'}
        </span>
        <button
          onClick={e => { e.stopPropagation(); navigate(`/caregiver/patients/${patient.id}`); }}
          style={{
            background: 'var(--navy)', border: 'none', borderRadius: 6,
            padding: '4px 10px', color: '#fff', fontSize: 10, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'var(--font)',
          }}
        >
          View
        </button>
      </div>
    </div>
  );
}
