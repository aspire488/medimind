import React, { useState } from 'react';
import { useAuth }     from '../../contexts/AuthContext.jsx';
import DataService     from '../../services/DataService.js';
import { uid, today }  from '../../utils/helpers.js';

export default function SOSButton({ style }) {
  const { user } = useAuth();
  const [pressed, setPressed] = useState(false);

  const triggerSOS = () => {
    if (!user) return;
    // Log SOS alert for all linked caregivers
    DataService.saveAlert({
      id: uid(),
      patientId: user.id,
      type: 'sos',
      message: `SOS triggered by ${user.name}`,
      createdAt: Date.now(),
      status: 'active',
    });
    setPressed(true);
    setTimeout(() => setPressed(false), 5000);
    // Also log in intake_logs with type:'sos' for computeAlertStatus
    DataService.saveIntakeLog({
      id: uid(), patientId: user.id,
      date: today(), type: 'sos',
      confirmed: false, status: 'sos',
      medicineName: 'SOS Event',
    });
  };

  return (
    <button
      onClick={triggerSOS}
      style={{
        width: 48, height: 48,
        borderRadius: 12,
        background: pressed ? 'var(--green)' : 'var(--red)',
        border: 'none',
        color: '#fff',
        fontSize: pressed ? 20 : 18,
        fontWeight: 800,
        cursor: 'pointer',
        fontFamily: 'var(--font)',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background .3s',
        ...style,
      }}
      title="Emergency SOS"
    >
      {pressed ? '✓' : '!'}
    </button>
  );
}
