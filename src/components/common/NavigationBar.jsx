import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_STYLES = {
  position: 'fixed',
  bottom: 0,
  left: '50%',
  transform: 'translateX(-50%)',
  width: '100%',
  maxWidth: 430,
  height: 64,
  background: '#fff',
  borderTop: '1px solid var(--border)',
  display: 'flex',
  alignItems: 'center',
  zIndex: 50,
  paddingBottom: 'var(--safe-bottom)',
};

export default function NavigationBar({ tabs, seniorMode = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={NAV_STYLES}>
      {tabs.map(tab => {
        const active = location.pathname === tab.path ||
                       location.pathname.startsWith(tab.path + '/');
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            style={{
              flex: 1,
              height: '100%',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              color: active ? 'var(--blue)' : 'var(--muted)',
              transition: 'color .15s',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* Icon dot / shape */}
            <div style={{
              width:  seniorMode ? 22 : 18,
              height: seniorMode ? 22 : 18,
              borderRadius: 6,
              background: active ? 'var(--blue)' : 'var(--border)',
              transition: 'background .15s',
            }} />
            <span style={{
              fontSize: seniorMode ? 12 : 10,
              fontWeight: active ? 700 : 500,
              fontFamily: 'var(--font)',
            }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
