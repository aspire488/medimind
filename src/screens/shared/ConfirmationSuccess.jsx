import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConfirmationSuccess({ medicineName, onDone }) {
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => {
      if (onDone) onDone();
      else navigate(-1);
    }, 2800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'var(--green)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16, animation: 'fadeIn .3s ease',
    }}>
      <svg width="88" height="88" viewBox="0 0 88 88" fill="none">
        <circle cx="44" cy="44" r="42" stroke="rgba(255,255,255,.35)" strokeWidth="3"/>
        <polyline
          points="24,44 38,60 64,30"
          stroke="#fff" strokeWidth="5"
          strokeLinecap="round" strokeLinejoin="round"
          strokeDasharray="60" strokeDashoffset="60"
          style={{ animation: 'checkmark .5s ease .15s forwards' }}
        />
      </svg>
      <p style={{ color: '#fff', fontSize: 26, fontWeight: 700 }}>Medicine taken!</p>
      {medicineName && (
        <p style={{ color: 'rgba(255,255,255,.8)', fontSize: 16 }}>{medicineName}</p>
      )}
      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginTop: 8 }}>
        Keep up the great work
      </p>
    </div>
  );
}
