import React from 'react';

const COLORS = [
  { id: 'blue',   hex: '#1A6FBD', label: 'Blue'   },
  { id: 'green',  hex: '#28A06E', label: 'Green'  },
  { id: 'amber',  hex: '#E8A020', label: 'Orange' },
  { id: 'red',    hex: '#D43A3A', label: 'Red'    },
  { id: 'purple', hex: '#7c3abd', label: 'Purple' },
  { id: 'pink',   hex: '#e45fa0', label: 'Pink'   },
  { id: 'teal',   hex: '#0aa3a3', label: 'Teal'   },
  { id: 'gray',   hex: '#888',    label: 'Gray'   },
];

// Selector — used in Add/Edit medicine
export function ColorTagSelector({ value, onChange }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8 }}>
        Colour tag <span style={{ fontSize: 11, color: 'var(--muted)', opacity: .7 }}>(helps identify the pill visually)</span>
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {COLORS.map(c => (
          <button
            key={c.id}
            onClick={() => onChange(c.id)}
            title={c.label}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: c.hex,
              border: value === c.id ? '3px solid var(--text)' : '2px solid transparent',
              cursor: 'pointer',
              transform: value === c.id ? 'scale(1.15)' : 'scale(1)',
              transition: 'all .15s',
              outline: 'none',
              boxShadow: value === c.id ? `0 0 0 2px ${c.hex}40` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Display badge — used in MedicineCard
export function ColorTag({ colorId, size = 14 }) {
  const color = COLORS.find(c => c.id === colorId);
  if (!color) return null;
  return (
    <div
      title={color.label}
      style={{
        width: size, height: size,
        borderRadius: '50%',
        background: color.hex,
        flexShrink: 0,
        border: '1.5px solid rgba(0,0,0,.1)',
      }}
    />
  );
}

export { COLORS };
