import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

const KEYS = [1,2,3,4,5,6,7,8,9,null,0,'⌫'];

export default function LockScreen() {
  const { user, login } = useAuth();
  const navigate        = useNavigate();
  const [pin, setPin]   = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');

  const lockType = user?.lockType || 'pin';

  // No lock — skip immediately
  useEffect(() => {
    if (lockType === 'none') {
      const dest = { senior:'/senior', standard:'/standard', caregiver:'/caregiver', selfcare:'/selfcare' }[user?.role] || '/standard';
      navigate(dest, { replace: true });
    }
  }, []);

  const tryUnlock = (enteredPin) => {
    const storedPin = user?.pin || '0000';
    if (enteredPin === storedPin) {
      const dest = { senior:'/senior', standard:'/standard', caregiver:'/caregiver', selfcare:'/selfcare' }[user?.role] || '/standard';
      navigate(dest, { replace: true });
    } else {
      setError('Incorrect. Try again.');
      setTimeout(() => { setError(''); setPin(''); }, 900);
    }
  };

  const press = (d) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) setTimeout(() => tryUnlock(next), 100);
  };
  const del = () => setPin(p => p.slice(0, -1));

  // Biometric / pattern placeholder
  if (lockType === 'biometric') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: 'rgba(26,111,189,.3)', border: '2px solid rgba(26,111,189,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 38, height: 19, borderRadius: 999, background: '#1A6FBD' }} />
        </div>
        <p style={{ color: '#fff', fontSize: 20, fontWeight: 700, marginBottom: 8 }}>MediMind</p>
        <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginBottom: 48 }}>Care that reminds.</p>
        <div style={{ width: 72, height: 72, borderRadius: '50%', border: '3px solid rgba(255,255,255,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, animation: 'pulse 2s infinite' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(26,111,189,.5)' }} />
        </div>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14 }}>Touch fingerprint or Face ID</p>
        <button onClick={() => tryUnlock(user?.pin || '0000')}
          style={{ marginTop: 32, background: 'var(--blue)', border: 'none', borderRadius: 12, padding: '12px 28px', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
          Simulate Unlock
        </button>
      </div>
    );
  }

  if (lockType === 'password') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <p style={{ color: '#fff', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>MediMind</p>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, marginBottom: 40 }}>Care that reminds.</p>
        <input type="password" className="input input-lg"
          style={{ marginBottom: 12, background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)', color: '#fff' }}
          placeholder="Enter password"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && tryUnlock(password)} />
        {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={() => tryUnlock(password)}
          style={{ width: '100%', height: 52, background: 'var(--blue)', border: 'none', borderRadius: 14, color: '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>
          Unlock
        </button>
      </div>
    );
  }

  // Default: PIN
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '48px 24px 28px', textAlign: 'center' }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(26,111,189,.3)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 26, height: 13, borderRadius: 999, background: 'var(--blue)' }} />
        </div>
        <p style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>MediMind</p>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 12, marginTop: 4 }}>Care that reminds.</p>
        <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 14, marginTop: 20 }}>
          {user?.name ? `Welcome back, ${user.name}` : 'Enter your PIN'}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: error ? 6 : 20 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < pin.length ? 'var(--blue)' : 'rgba(255,255,255,.25)', transition: 'background .15s' }} />
        ))}
      </div>
      {error && <p style={{ color: 'var(--red)', textAlign: 'center', fontSize: 13, marginBottom: 12 }}>{error}</p>}

      <div style={{ flex: 1, background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {KEYS.map((k, i) => {
            if (k === null) return <div key={i} />;
            const isBack = k === '⌫';
            return (
              <button key={i} onClick={() => isBack ? del() : press(String(k))}
                style={{ background: isBack ? 'var(--red-l)' : 'var(--gray)', border: 'none', borderRadius: 12, padding: '16px 0', fontSize: 22, fontWeight: 700, color: isBack ? 'var(--red)' : 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                {k}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
