import React, { useState, useEffect, useCallback } from 'react';

// ── Pattern lock grid ──────────────────────────────────
function PatternDot({ id, selected, order, onEnter }) {
  return (
    <div
      onPointerEnter={onEnter}
      style={{
        width: 48, height: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: selected ? 28 : 18,
        height: selected ? 28 : 18,
        borderRadius: '50%',
        background: selected ? 'var(--blue)' : 'rgba(255,255,255,.25)',
        border: selected ? '2px solid rgba(255,255,255,.8)' : '2px solid rgba(255,255,255,.4)',
        transition: 'all .15s',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 10, color: '#fff', fontWeight: 700,
      }}>
        {selected ? order : ''}
      </div>
    </div>
  );
}

// ── Main LockScreen ────────────────────────────────────
export default function LockScreen({ user, lockType = 'pin', onUnlock }) {
  const [pin, setPin]         = useState('');
  const [pattern, setPattern] = useState([]);
  const [error, setError]     = useState('');
  const [shake, setShake]     = useState(false);
  const [drawing, setDrawing] = useState(false);

  const correctPin     = user?.pin     || '1234';
  const correctPattern = user?.pattern || [1,4,7,8,9]; // default pattern

  const triggerError = useCallback((msg) => {
    setError(msg);
    setShake(true);
    setTimeout(() => {
      setShake(false);
      setPin('');
      setPattern([]);
    }, 700);
  }, []);

  // PIN submit
  useEffect(() => {
    if (pin.length === 4) {
      if (pin === correctPin) { onUnlock(); }
      else triggerError('Incorrect PIN');
    }
  }, [pin]);

  // Pattern submit
  const submitPattern = useCallback(() => {
    setDrawing(false);
    if (pattern.length < 4) { setPattern([]); return; }
    if (JSON.stringify(pattern) === JSON.stringify(correctPattern)) {
      onUnlock();
    } else {
      triggerError('Incorrect pattern');
    }
  }, [pattern, correctPattern, onUnlock, triggerError]);

  const KEYS = [1,2,3,4,5,6,7,8,9,null,0,'⌫'];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'var(--navy)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px',
      fontFamily: 'var(--font)',
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 60, height: 60, borderRadius: 16,
          background: 'rgba(26,111,189,.25)',
          border: '2px solid rgba(26,111,189,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 12px',
        }}>
          <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
            <rect x="0" y="6" width="32" height="8" rx="4" fill="#1A6FBD"/>
            <rect x="12" y="0" width="8" height="20" rx="4" fill="#28A06E"/>
          </svg>
        </div>
        <p style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>MediMind</p>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 12, marginTop: 3 }}>Care that reminds.</p>
      </div>

      <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 13, marginBottom: 24 }}>
        {lockType === 'pin' ? 'Enter your PIN to continue' : 'Draw your pattern to unlock'}
      </p>

      {/* PIN lock */}
      {lockType === 'pin' && (
        <div style={{ width: '100%', maxWidth: 280 }}>
          {/* Dots */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: 14,
            marginBottom: 8,
            transform: shake ? 'translateX(-8px)' : 'none',
            transition: 'transform .07s',
          }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{
                width: 14, height: 14, borderRadius: '50%',
                background: i < pin.length ? 'var(--blue)' : 'rgba(255,255,255,.25)',
                transition: 'background .15s',
              }} />
            ))}
          </div>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, textAlign: 'center', marginBottom: 8 }}>{error}</p>}

          {/* Keypad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>
            {KEYS.map((k, i) => {
              if (k === null) return <div key={i} />;
              const isBack = k === '⌫';
              return (
                <button key={i}
                  onClick={() => isBack ? setPin(p => p.slice(0,-1)) : (pin.length < 4 && setPin(p => p+k))}
                  style={{
                    background: isBack ? 'rgba(212,58,58,.2)' : 'rgba(255,255,255,.1)',
                    border: `1px solid ${isBack ? 'rgba(212,58,58,.3)' : 'rgba(255,255,255,.1)'}`,
                    borderRadius: 12, padding: '14px 0',
                    fontSize: 20, fontWeight: 700,
                    color: isBack ? 'var(--red)' : '#fff',
                    cursor: 'pointer', fontFamily: 'var(--font)',
                  }}
                >
                  {k}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pattern lock */}
      {lockType === 'pattern' && (
        <div>
          {error && <p style={{ color: 'var(--red)', fontSize: 12, textAlign: 'center', marginBottom: 12 }}>{error}</p>}
          <div
            onPointerDown={() => { setPattern([]); setDrawing(true); }}
            onPointerUp={submitPattern}
            onPointerLeave={() => { if (drawing) submitPattern(); }}
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
              gap: 16, userSelect: 'none',
              background: 'rgba(255,255,255,.05)',
              borderRadius: 20, padding: 20,
            }}
          >
            {[1,2,3,4,5,6,7,8,9].map(id => (
              <PatternDot
                key={id}
                id={id}
                selected={pattern.includes(id)}
                order={pattern.indexOf(id) + 1}
                onEnter={() => {
                  if (drawing && !pattern.includes(id)) {
                    setPattern(p => [...p, id]);
                  }
                }}
              />
            ))}
          </div>
          <p style={{ color: 'rgba(255,255,255,.35)', fontSize: 11, textAlign: 'center', marginTop: 12 }}>
            Draw to connect at least 4 dots
          </p>
        </div>
      )}

      {/* Switch lock type hint */}
      <button
        onClick={() => {}} // wired up by parent if needed
        style={{
          marginTop: 28, background: 'none', border: 'none',
          color: 'rgba(255,255,255,.35)', fontSize: 12,
          cursor: 'pointer', fontFamily: 'var(--font)',
        }}
      >
        Use different lock method
      </button>
    </div>
  );
}
