import React from 'react';
import { useAuth }     from '../../contexts/AuthContext.jsx';
import { useMedicine } from '../../contexts/MedicineContext.jsx';
import NavigationBar   from '../../components/common/NavigationBar.jsx';
import ReminderAlert   from '../../components/common/ReminderAlert.jsx';
import AdherenceRing   from '../../components/common/AdherenceRing.jsx';
import MedicineCard    from '../../components/common/MedicineCard.jsx';
import { ReminderProvider } from '../../contexts/ReminderContext.jsx';

const SENIOR_TABS = [
  { path: '/senior',           label: 'Home'     },
  { path: '/senior/medicines', label: 'Medicines' },
  { path: '/senior/ai',        label: 'AI Help'   },
];

function SeniorDashboardInner() {
  const { user }                              = useAuth();
  const { todaySchedule, todayAdherence, confirmIntake, markMissed } = useMedicine();
  const upcoming = todaySchedule.filter(s => s.status !== 'taken').slice(0, 3);

  return (
    <>
      <ReminderAlert seniorMode language={user?.language || 'en'} />

      <div className="screen" style={{ background: 'var(--gray)' }}>
        {/* Header */}
        <div style={{ background: 'var(--blue)', padding: '24px 20px 0' }}>
          <p style={{ color: 'rgba(255,255,255,.75)', fontSize: 15 }}>Good morning,</p>
          <h1 style={{ color: '#fff', fontSize: 28, fontWeight: 700, marginBottom: 18 }}>{user?.name}</h1>

          {/* Adherence card */}
          <div style={{
            background: 'rgba(255,255,255,.16)', borderRadius: 16,
            padding: '14px 16px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 0,
          }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 12, marginBottom: 4 }}>Today's adherence</p>
              <p style={{ color: '#fff', fontSize: 34, fontWeight: 800, lineHeight: 1 }}>{todayAdherence.pct}%</p>
              <p style={{ color: 'rgba(255,255,255,.6)', fontSize: 12, marginTop: 4 }}>
                {todayAdherence.taken} of {todayAdherence.total} taken
              </p>
            </div>
            <AdherenceRing pct={todayAdherence.pct} size={68}
              label={`${todayAdherence.pct}%`} />
          </div>
          <div style={{ height: 20 }} />
        </div>

        <div style={{ padding: '20px 20px 0' }}>
          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '12px 14px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--green)' }}>{todayAdherence.taken}</p>
              <p style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600, marginTop: 2 }}>Taken</p>
            </div>
            <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '12px 14px', textAlign: 'center', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--amber)' }}>
                {todaySchedule.filter(s => s.status === 'upcoming').length}
              </p>
              <p style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600, marginTop: 2 }}>Upcoming</p>
            </div>
            {/* SOS */}
            <button style={{
              width: 68, background: 'var(--red)', borderRadius: 12,
              border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontFamily: 'var(--font)',
            }}>
              <span style={{ fontSize: 22, fontWeight: 800 }}>!</span>
              <span style={{ fontSize: 10, fontWeight: 700, marginTop: 2 }}>SOS</span>
            </button>
          </div>

          {/* Today's schedule */}
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', marginBottom: 14 }}>Today's medicines</h2>
          {todaySchedule.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 15 }}>No medicines scheduled today.</p>
            : todaySchedule.map(slot => (
              <div key={`${slot.medicine.id}-${slot.time}`} style={{ marginBottom: 10 }}>
                <MedicineCard slot={slot} mode="senior" />
              </div>
            ))
          }
        </div>
      </div>

      <NavigationBar tabs={SENIOR_TABS} seniorMode />
    </>
  );
}

export default function SeniorDashboard() {
  const { medicines, confirmIntake, markMissed } = useMedicine();
  return (
    <ReminderProvider medicines={medicines} onConfirm={confirmIntake} onMiss={markMissed}>
      <SeniorDashboardInner />
    </ReminderProvider>
  );
}
