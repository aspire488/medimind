import React from 'react';
import { useNavigate }  from 'react-router-dom';
import { useAuth }      from '../../contexts/AuthContext.jsx';
import { useMedicine }  from '../../contexts/MedicineContext.jsx';
import NavigationBar    from '../../components/common/NavigationBar.jsx';
import ReminderAlert    from '../../components/common/ReminderAlert.jsx';
import AdherenceRing    from '../../components/common/AdherenceRing.jsx';
import MedicineCard     from '../../components/common/MedicineCard.jsx';
import WeeklyBar        from '../../components/common/WeeklyBar.jsx';
import { ReminderProvider } from '../../contexts/ReminderContext.jsx';
import { getWeekAdherence, computeStreak } from '../../utils/helpers.js';
import DataService from '../../services/DataService.js';

const STD_TABS = [
  { path: '/standard',           label: 'Home'      },
  { path: '/standard/medicines', label: 'Medicines'  },
  { path: '/standard/ai',        label: 'AI Chat'    },
  { path: '/standard/profile',   label: 'Profile'    },
];

function StandardDashboardInner() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const { medicines, todaySchedule, todayAdherence, confirmIntake, markMissed } = useMedicine();

  const allLogs  = DataService.getLogsForPatient(user?.id);
  const weekDays = getWeekAdherence(allLogs);
  const streak   = computeStreak(allLogs);

  return (
    <>
      <ReminderAlert seniorMode={false} />

      <div className="screen" style={{ background: 'var(--gray)' }}>
        {/* Navy header */}
        <div style={{ background: 'var(--navy)', padding: '16px 18px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 11 }}>Good afternoon</p>
              <p style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginTop: 2 }}>{user?.name}</p>
            </div>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'var(--blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700,
            }}>
              {user?.name?.[0] || 'U'}
            </div>
          </div>

          {/* Adherence widget */}
          <div style={{
            background: 'rgba(255,255,255,.07)',
            borderRadius: 14, padding: '12px 14px',
            display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
          }}>
            <div style={{ flex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 10, marginBottom: 4 }}>Today's adherence</p>
              <p style={{ color: '#fff', fontSize: 28, fontWeight: 800, lineHeight: 1 }}>
                {todayAdherence.pct}<span style={{ fontSize: 14, fontWeight: 500, opacity: .6 }}>%</span>
              </p>
              <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 10, marginTop: 4 }}>
                {todayAdherence.taken} of {todayAdherence.total} taken
              </p>
            </div>
            <AdherenceRing pct={todayAdherence.pct} size={56} color="var(--green)" />
          </div>

          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 6, paddingBottom: 14 }}>
            {[
              { n: todayAdherence.taken,  l: 'Taken',   c: 'var(--green)', b: 'rgba(40,160,110,.15)', bdr: 'rgba(40,160,110,.3)' },
              { n: todaySchedule.filter(s=>s.status==='upcoming').length, l: 'Pending', c: 'var(--amber)', b: 'rgba(232,160,32,.15)', bdr: 'rgba(232,160,32,.3)' },
              { n: todayAdherence.missed, l: 'Missed',  c: 'var(--red)',   b: 'rgba(212,58,58,.15)',   bdr: 'rgba(212,58,58,.3)'   },
            ].map(s => (
              <div key={s.l} style={{
                flex: 1, background: s.b, borderRadius: 10,
                padding: '8px 0', textAlign: 'center',
                border: `1px solid ${s.bdr}`,
              }}>
                <p style={{ fontSize: 18, fontWeight: 800, color: s.c }}>{s.n}</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '14px 16px' }}>
          {/* Schedule */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <h2 style={{ fontSize: 13, fontWeight: 700, color: 'var(--navy)' }}>Today's schedule</h2>
            <button onClick={() => navigate('/standard/medicines')} style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font)' }}>
              See all
            </button>
          </div>
          {todaySchedule.slice(0,4).map(slot => (
            <div key={`${slot.medicine.id}-${slot.time}`} style={{ marginBottom: 7 }}>
              <MedicineCard slot={slot} mode="standard" />
            </div>
          ))}

          {/* Streak + SOS */}
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, background: 'var(--navy)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{streak} day streak</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginTop: 1 }}>Keep it going!</p>
              </div>
            </div>
            <button style={{
              width: 52, background: 'var(--red)', border: 'none',
              borderRadius: 12, color: '#fff', fontSize: 13, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'var(--font)',
            }}>!</button>
          </div>

          {/* Weekly chart */}
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px', marginTop: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>This week</p>
            <WeeklyBar days={weekDays} />
          </div>
        </div>
      </div>

      <NavigationBar tabs={STD_TABS} />
    </>
  );
}

export default function StandardDashboard() {
  const { medicines, confirmIntake, markMissed } = useMedicine();
  return (
    <ReminderProvider medicines={medicines} onConfirm={confirmIntake} onMiss={markMissed}>
      <StandardDashboardInner />
    </ReminderProvider>
  );
}
