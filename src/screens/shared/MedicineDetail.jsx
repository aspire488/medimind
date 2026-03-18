import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMedicine }  from '../../contexts/MedicineContext.jsx';
import StatusBadge      from '../../components/common/StatusBadge.jsx';
import { formatTime, mealLabel, today } from '../../utils/helpers.js';
import DataService from '../../services/DataService.js';
import { useAuth } from '../../contexts/AuthContext.jsx';

export default function MedicineDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const { medicines, deleteMedicine, todaySchedule } = useMedicine();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const medicine = medicines.find(m => m.id === id);
  if (!medicine) return <div style={{ padding: 24, color: 'var(--muted)' }}>Medicine not found.</div>;

  const slot = todaySchedule.find(s => s.medicine.id === id);
  const allLogs = DataService.getLogsForPatient(user?.id || '').filter(l => l.medicineId === id);
  const takenCount = allLogs.filter(l => l.confirmed).length;
  const adherencePct = allLogs.length ? Math.round(takenCount / allLogs.length * 100) : 0;

  const handleDelete = () => {
    deleteMedicine(id);
    navigate(-1);
  };

  return (
    <div className="screen" style={{ background: 'var(--gray)' }}>
      {/* Header */}
      <div style={{ background: 'var(--navy)', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 20, cursor: 'pointer' }}>←</button>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{medicine.name}</p>
        </div>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 12, paddingLeft: 32 }}>
          {medicine.dose}{medicine.unit} · {medicine.frequency}
        </p>
      </div>

      <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Today's status */}
        {slot && (
          <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>Today's status</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 14, color: 'var(--muted)' }}>
                Scheduled: {formatTime(slot.time)}
              </span>
              <StatusBadge status={slot.status} />
            </div>
          </div>
        )}

        {/* Medicine info */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden' }}>
          <p style={{ padding: '9px 16px', fontSize: 10, fontWeight: 700, color: 'var(--muted)', background: 'var(--gray)', letterSpacing: '.06em' }}>DETAILS</p>
          {[
            { label: 'Dose',        value: `${medicine.dose} ${medicine.unit}` },
            { label: 'Schedule',    value: (medicine.times||[]).map(formatTime).join(', ') },
            { label: 'Frequency',   value: medicine.frequency },
            { label: 'Meal timing', value: mealLabel(medicine.mealContext) },
            { label: 'Days left',   value: `${medicine.daysRemaining || '—'} days` },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              padding: '11px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              borderBottom: i < arr.length-1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ fontSize: 13, color: 'var(--muted)' }}>{row.label}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Adherence stats */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>Adherence</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--blue)' }}>{adherencePct}%</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Overall</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--green)' }}>{takenCount}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Times taken</p>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--amber)' }}>{allLogs.length - takenCount}</p>
              <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>Missed</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <button
          onClick={() => navigate(`/standard/medicines/${id}/edit`)}
          style={{ width: '100%', height: 48, background: 'var(--navy)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
        >
          Edit Medicine
        </button>

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ width: '100%', height: 44, background: 'var(--red-l)', border: '1px solid var(--red)', borderRadius: 12, color: 'var(--red)', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}
          >
            Delete Medicine
          </button>
        ) : (
          <div style={{ background: 'var(--red-l)', border: '1px solid var(--red)', borderRadius: 12, padding: '14px 16px' }}>
            <p style={{ fontSize: 13, color: 'var(--red)', fontWeight: 600, marginBottom: 10, textAlign: 'center' }}>
              Are you sure? This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setConfirmDelete(false)} style={{ flex: 1, height: 40, background: 'var(--gray)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>Cancel</button>
              <button onClick={handleDelete} style={{ flex: 1, height: 40, background: 'var(--red)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font)' }}>Delete</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
