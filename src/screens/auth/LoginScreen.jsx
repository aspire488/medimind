import React, { useState } from 'react';
import { useNavigate }   from 'react-router-dom';
import { useAuth }       from '../../contexts/AuthContext.jsx';

const HINT_USERS = [
  { label: 'Arjun (Standard)',  pin: '1234' },
  { label: 'Leela (Senior)',    pin: '0000' },
  { label: 'Priya (Caregiver)', pin: '9999' },
];

export default function LoginScreen() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const [pin, setPin]     = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const press = (d) => { if (pin.length >= 4) return; setPin(prev => prev + d); setError(''); };
  const del   = () => setPin(prev => prev.slice(0, -1));
  const clear = () => setPin('');

  const submit = (p = pin) => {
    if (p.length < 4) return;
    const result = login(p);
    if (!result.success) {
      setShake(true);
      setError('Incorrect PIN. Try the demo accounts below.');
      setTimeout(() => { setShake(false); clear(); }, 700);
      return;
    }
    const u = result.user;
    // Check lock screen
    if (u.lockType && u.lockType !== 'none') {
      navigate('/lock', { replace: true });
      return;
    }
    const dest = { senior:'/senior', standard:'/standard', caregiver:'/caregiver', selfcare:'/selfcare' }[u.role] || '/standard';
    navigate(dest, { replace: true });
  };

  React.useEffect(() => { if (pin.length === 4) submit(pin); }, [pin]);

  const KEYS = [1,2,3,4,5,6,7,8,9,null,0,'⌫'];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '48px 24px 28px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(26,111,189,.3)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 30, height: 15, borderRadius: 999, background: 'var(--blue)' }} />
        </div>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>MediMind</h1>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 13, marginTop: 5 }}>Care that reminds.</p>
      </div>

      {/* PIN dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginBottom: 8, transform: shake ? 'translateX(-8px)' : 'none', transition: 'transform .1s' }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: i < pin.length ? 'var(--blue)' : 'rgba(255,255,255,.2)', transition: 'background .15s' }} />
        ))}
      </div>
      {error && <p style={{ color: '#ff7b72', textAlign: 'center', fontSize: 12, marginBottom: 4 }}>{error}</p>}

      {/* Keypad */}
      <div style={{ flex: 1, background: '#fff', borderRadius: '24px 24px 0 0', padding: '28px 22px 24px', marginTop: 16 }}>
        <p style={{ textAlign: 'center', fontSize: 14, fontWeight: 600, color: 'var(--navy)', marginBottom: 18 }}>Enter your PIN</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 18 }}>
          {KEYS.map((k, i) => {
            if (k === null) return <div key={i} />;
            const isBack = k === '⌫';
            return (
              <button key={i} onClick={() => isBack ? del() : press(String(k))}
                style={{ background: isBack ? 'var(--red-l)' : 'var(--gray)', border: 'none', borderRadius: 12, padding: '15px 0', fontSize: 22, fontWeight: 700, color: isBack ? 'var(--red)' : 'var(--text)', cursor: 'pointer', fontFamily: 'var(--font)' }}>
                {k}
              </button>
            );
          })}
        </div>

        {/* Demo hints */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <p style={{ fontSize: 11, color: 'var(--muted)', textAlign: 'center', marginBottom: 10 }}>Demo accounts (tap to fill):</p>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
            {HINT_USERS.map(u => (
              <button key={u.pin} onClick={() => setPin(u.pin)}
                style={{ background: 'var(--blue-l)', border: '1px solid var(--blue)', borderRadius: 8, padding: '4px 12px', fontSize: 11, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
                {u.label} ({u.pin})
              </button>
            ))}
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', marginTop: 16 }}>
          New user?{' '}
          <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
            Create account →
          </button>
        </p>
      </div>
    </div>
  );
}
