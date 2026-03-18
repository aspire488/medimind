import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth }     from '../../contexts/AuthContext.jsx';
import DataService     from '../../services/DataService.js';
import WeeklyBar       from '../../components/common/WeeklyBar.jsx';
import { computeAdherence, getWeekAdherence } from '../../utils/helpers.js';

export default function AdherenceHistory() {
  const { user }   = useAuth();
  const navigate   = useNavigate();
  const allLogs    = DataService.getLogsForPatient(user?.id || '');

  const weekDays = getWeekAdherence(allLogs);

  const monthData = useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key  = d.toISOString().slice(0,10);
      const logs = allLogs.filter(l => l.date === key);
      const pct  = logs.length ? computeAdherence(logs, logs.length) : null;
      days.push({ key, pct, day: d.getDate() });
    }
    return days;
  }, [allLogs]);

  const avgAdherence = useMemo(() => {
    const valid = monthData.filter(d => d.pct !== null);
    if (!valid.length) return 0;
    return Math.round(valid.reduce((s,d) => s + d.pct, 0) / valid.length);
  }, [monthData]);

  const bgForPct = (pct) => {
    if (pct === null) return 'var(--border)';
    if (pct >= 80) return 'var(--green)';
    if (pct >= 40) return 'var(--amber)';
    return 'var(--red)';
  };

  return (
    <div className="screen" style={{ background: 'var(--gray)' }}>
      {/* Header */}
      <div style={{ background: 'var(--navy)', padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.6)', fontSize: 20, cursor: 'pointer' }}>←</button>
          <p style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Adherence History</p>
        </div>
        <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 12, paddingLeft: 32 }}>
          30-day overview
        </p>
      </div>

      <div style={{ padding: '16px 18px' }}>
        {/* Summary */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--blue)' }}>{avgAdherence}%</p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>30-day average</p>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--green)' }}>
              {monthData.filter(d => d.pct !== null && d.pct >= 80).length}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Good days</p>
          </div>
          <div style={{ flex: 1, background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <p style={{ fontSize: 26, fontWeight: 800, color: 'var(--red)' }}>
              {monthData.filter(d => d.pct !== null && d.pct < 40).length}
            </p>
            <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>Missed days</p>
          </div>
        </div>

        {/* Weekly bar */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', border: '1px solid var(--border)', marginBottom: 16 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 10 }}>This week</p>
          <WeeklyBar days={weekDays} />
        </div>

        {/* Calendar grid */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '14px 16px', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 12 }}>Last 30 days</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
            {monthData.map(d => (
              <div key={d.key} style={{ textAlign: 'center' }}>
                <div style={{
                  width: '100%', aspectRatio: '1',
                  borderRadius: 6,
                  background: bgForPct(d.pct),
                  opacity: d.pct === null ? .25 : 1,
                  transition: 'opacity .2s',
                }} />
                <p style={{ fontSize: 8, color: 'var(--muted)', marginTop: 2 }}>{d.day}</p>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
            {[
              { color: 'var(--green)', label: '≥80%' },
              { color: 'var(--amber)', label: '40–79%' },
              { color: 'var(--red)',   label: '<40%' },
              { color: 'var(--border)',label: 'No data' },
            ].map(i => (
              <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: i.color }} />
                <span style={{ fontSize: 9, color: 'var(--muted)' }}>{i.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
