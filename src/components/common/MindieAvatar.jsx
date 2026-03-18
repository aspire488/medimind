import React from 'react';

// Mindie's friendly face — simple geometric avatar
export default function MindieAvatar({ size = 40, animated = false }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      background: 'var(--blue-l)',
      border: `${size > 50 ? 3 : 2}px solid var(--blue)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      animation: animated ? 'pulse 2s ease infinite' : 'none',
      overflow: 'hidden',
    }}>
      <svg
        width={size * 0.65}
        height={size * 0.65}
        viewBox="0 0 26 26"
        fill="none"
      >
        {/* Face circle */}
        <circle cx="13" cy="13" r="12" fill="#E8F4FD" />
        {/* Eyes */}
        <circle cx="9.5" cy="11" r="1.8" fill="#1A6FBD" />
        <circle cx="16.5" cy="11" r="1.8" fill="#1A6FBD" />
        {/* Smile */}
        <path d="M8.5 16 Q13 20 17.5 16" stroke="#1A6FBD" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
        {/* Pill highlight on forehead */}
        <rect x="9.5" y="5" width="7" height="3.5" rx="1.75" fill="#28A06E" opacity=".7"/>
      </svg>
    </div>
  );
}
