import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MissedDose({ medicineName, scheduledTime, caregiverNotified = true }) {
  const navigate = useNavigate();
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(15,27,53,.85)',
      display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px 20px 0 0',
        padding: '28px 24px 40px', width: '100%', maxWidth: 430,
        animation: 'fadeIn .3s ease',
      }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--red-l)', border: '2px solid var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <span style={{ color: 'var(--red)', fontSize: 22, fontWeight: 800 }}>!</span>
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: 8 }}>
          Dose missed
        </h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', textAlign: 'center', marginBottom: 20, lineHeight: 1.6 }}>
          You missed <strong>{medicineName}</strong> scheduled at{' '}
          <strong>{scheduledTime}</strong>.
        </p>
        {caregiverNotified && (
          <div style={{
            background: 'var(--amber-l)', border: '1px solid #FAC775',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
          }}>
            <p style={{ fontSize: 12, color: '#854F0B' }}>
              Your caregiver has been notified about this missed dose.
            </p>
          </div>
        )}
        <button
          onClick={() => navigate(-1)}
          style={{
            width: '100%', height: 52, background: 'var(--navy)',
            border: 'none', borderRadius: 14, color: '#fff',
            fontSize: 15, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'var(--font)',
          }}
        >
          OK, got it
        </button>
      </div>
    </div>
  );
}
