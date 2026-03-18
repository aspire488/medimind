// Enhanced AddMedicine with: purpose, color tag, photo
import React, { useState, useRef } from 'react';
import { useNavigate }  from 'react-router-dom';
import { useMedicine }  from '../../contexts/MedicineContext.jsx';
import { useAuth }      from '../../contexts/AuthContext.jsx';

const FREQ_OPTIONS   = ['daily', 'twice', 'three times'];
const MEAL_OPTIONS   = ['before', 'after', 'with', 'any'];
const UNIT_OPTIONS   = ['mg', 'ml', 'tablet', 'capsule'];
const COLOR_TAGS     = [
  { id: 'blue',   hex: '#1A6FBD', label: 'Blue'   },
  { id: 'green',  hex: '#28A06E', label: 'Green'  },
  { id: 'red',    hex: '#D43A3A', label: 'Red'    },
  { id: 'amber',  hex: '#E8A020', label: 'Amber'  },
  { id: 'purple', hex: '#7c3abd', label: 'Purple' },
  { id: 'pink',   hex: '#d4537e', label: 'Pink'   },
  { id: 'white',  hex: '#e0e0e0', label: 'White'  },
];

export default function AddMedicineEnhanced() {
  const navigate       = useNavigate();
  const { addMedicine } = useMedicine();
  const { user }        = useAuth();
  const photoRef        = useRef(null);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', purpose: '', dose: '', unit: 'mg',
    frequency: 'daily', times: ['08:00'],
    mealContext: 'after', daysRemaining: 30,
    colorTag: 'blue', photoUrl: null,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('photoUrl', ev.target.result);
    reader.readAsDataURL(file);
  };

  const label = { fontSize: 13, color: 'var(--muted)', marginBottom: 6, fontWeight: 500 };
  const chipBtn = (active) => ({
    background: active ? 'var(--blue)' : 'var(--gray)',
    border: 'none', borderRadius: 10, padding: '9px 14px',
    fontSize: 12, fontWeight: 600,
    color: active ? '#fff' : 'var(--text)',
    cursor: 'pointer', fontFamily: 'var(--font)',
  });

  const STEPS = [
    // Step 0 — Name + Purpose
    <div key="0">
      <p style={label}>Medicine name</p>
      <input className="input input-lg" placeholder="e.g. Metformin"
        value={form.name} onChange={e => set('name', e.target.value)} autoFocus />
      <p style={{ ...label, marginTop: 14 }}>What is it for? (optional)</p>
      <input className="input" placeholder="e.g. Controls blood sugar"
        value={form.purpose} onChange={e => set('purpose', e.target.value)} />
      <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5 }}>
        This helps seniors recognise medicines easily.
      </p>
    </div>,

    // Step 1 — Dose + Unit
    <div key="1">
      <p style={label}>Dosage</p>
      <div style={{ display: 'flex', gap: 10 }}>
        <input className="input input-lg" style={{ flex: 1 }} placeholder="Amount"
          type="number" value={form.dose} onChange={e => set('dose', e.target.value)} />
        <select className="input input-lg" style={{ width: 110 }}
          value={form.unit} onChange={e => set('unit', e.target.value)}>
          {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
        </select>
      </div>
    </div>,

    // Step 2 — Frequency + Time
    <div key="2">
      <p style={label}>Frequency</p>
      <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
        {FREQ_OPTIONS.map(f => (
          <button key={f} onClick={() => set('frequency', f)} style={{ ...chipBtn(form.frequency === f), flex: 1, fontSize: 11 }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <p style={label}>Time</p>
      <input className="input input-lg" type="time"
        value={form.times[0]} onChange={e => set('times', [e.target.value])} />
      <p style={{ ...label, marginTop: 14 }}>Meal timing</p>
      <div style={{ display: 'flex', gap: 7 }}>
        {MEAL_OPTIONS.map(m => (
          <button key={m} onClick={() => set('mealContext', m)} style={{ ...chipBtn(form.mealContext === m), flex: 1, fontSize: 10 }}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </button>
        ))}
      </div>
    </div>,

    // Step 3 — Color tag + Photo
    <div key="3">
      <p style={label}>Tablet color (for identification)</p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
        {COLOR_TAGS.map(c => (
          <button key={c.id} onClick={() => set('colorTag', c.id)}
            title={c.label}
            style={{
              width: 38, height: 38, borderRadius: '50%',
              background: c.hex, border: form.colorTag === c.id ? '3px solid var(--navy)' : '2px solid transparent',
              cursor: 'pointer', transition: 'border .15s',
            }} />
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ width: 28, height: 14, borderRadius: 999, background: COLOR_TAGS.find(c=>c.id===form.colorTag)?.hex || 'var(--blue)' }} />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Selected: {COLOR_TAGS.find(c=>c.id===form.colorTag)?.label}</span>
      </div>

      <p style={{ ...label, marginTop: 16 }}>Tablet photo (optional)</p>
      <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8 }}>
        Helps seniors visually recognise the tablet.
      </p>
      <input ref={photoRef} type="file" accept="image/*" capture="environment"
        onChange={handlePhoto} style={{ display: 'none' }} />
      {form.photoUrl ? (
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <img src={form.photoUrl} alt="Tablet"
            style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border)' }} />
          <button onClick={() => set('photoUrl', null)}
            style={{ position: 'absolute', top: 8, right: 8, background: 'var(--red)', border: 'none', borderRadius: 6, width: 24, height: 24, color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>
            ×
          </button>
        </div>
      ) : (
        <button onClick={() => photoRef.current?.click()}
          style={{ width: '100%', height: 80, background: 'var(--gray)', border: '2px dashed var(--border)', borderRadius: 12, color: 'var(--muted)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font)' }}>
          📷 Take or upload photo
        </button>
      )}
    </div>,
  ];

  const canNext = [
    form.name.trim().length > 0,
    form.dose.trim().length > 0,
    form.times[0].length > 0,
    true,
  ];

  const handleFinish = () => {
    addMedicine({ ...form, patientId: user?.id });
    navigate(-1);
  };

  return (
    <div className="screen" style={{ background: '#fff' }}>
      {/* Header */}
      <div style={{ background: 'var(--navy)', padding: '14px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Add Medicine</p>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? 'var(--blue)' : 'rgba(255,255,255,.2)', transition: 'background .3s' }} />
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 10, marginTop: 6 }}>Step {step + 1} of {STEPS.length}</p>
      </div>

      <div style={{ padding: '22px 20px', flex: 1 }}>{STEPS[step]}</div>

      <div style={{ padding: '14px 20px 28px', display: 'flex', gap: 10 }}>
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn btn-ghost btn-lg" style={{ flex: 1 }}>Back</button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext[step]}
            className="btn btn-navy btn-lg" style={{ flex: 1, opacity: canNext[step] ? 1 : .5 }}>
            Continue
          </button>
        ) : (
          <button onClick={handleFinish} className="btn btn-green btn-lg" style={{ flex: 1 }}>
            Save Medicine
          </button>
        )}
      </div>
    </div>
  );
}
