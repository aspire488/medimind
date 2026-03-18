import React, { useEffect } from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../../contexts/AuthContext.jsx';
import { seedDemoData } from '../../utils/seedData.js';

export default function SplashScreen() {
  const { user }   = useAuth();
  const navigate   = useNavigate();

  useEffect(() => {
    seedDemoData();
    const t = setTimeout(() => {
      if (user) {
        navigate(user.role === 'senior' ? '/senior' : user.role === 'caregiver' ? '/caregiver' : '/standard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 1800);
    return () => clearTimeout(t);
  }, [user, navigate]);

  return (
    <div style={{
      height: '100vh', background: 'var(--navy)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 16,
    }}>
      {/* Logo */}
      <div style={{
        width: 72, height: 72, borderRadius: 20,
        background: 'rgba(26,111,189,.3)',
        border: '2px solid rgba(26,111,189,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn .6s ease',
      }}>
        <div style={{ width: 38, height: 19, borderRadius: 999, background: 'var(--blue)' }} />
      </div>
      <div style={{ textAlign: 'center', animation: 'fadeIn .6s ease .2s both' }}>
        <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 800, letterSpacing: '-.5px' }}>MediMind Care</h1>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, marginTop: 6 }}>Your smart medicine companion</p>
      </div>
      {/* Loader */}
      <div style={{
        marginTop: 40,
        width: 32, height: 32,
        border: '3px solid rgba(255,255,255,.15)',
        borderTop: '3px solid var(--blue)',
        borderRadius: '50%',
        animation: 'spin .8s linear infinite',
      }} />
    </div>
  );
}
