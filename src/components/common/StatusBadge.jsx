import React from 'react';
import { statusBg, statusColor, statusLabel } from '../../utils/helpers.js';

export default function StatusBadge({ status, style }) {
  return (
    <span style={{
      display: 'inline-block',
      borderRadius: 999,
      padding: '2px 9px',
      fontSize: 10,
      fontWeight: 700,
      color: statusColor(status),
      background: statusBg(status),
      lineHeight: 1.5,
      ...style,
    }}>
      {statusLabel(status)}
    </span>
  );
}
