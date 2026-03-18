// ═══════════════════════════════════════════════════
// AutomationService — n8n webhook integration
// Sends events for:
//  - medicine refill reminders
//  - caregiver alerts
//  - adherence notifications
// All endpoints are configured via env.
// ═══════════════════════════════════════════════════

class AutomationService {
  constructor() {
    this._base = import.meta.env.VITE_N8N_BASE || '';
  }

  async _fire(path, payload) {
    if (!this._base) return { ok: false, skipped: true };
    try {
      const res = await fetch(`${this._base}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  }

  medicineRefillReminder(data) {
    return this._fire('/medicine-refill', data);
  }

  caregiverAlert(data) {
    return this._fire('/caregiver-alert', data);
  }

  adherenceNotification(data) {
    return this._fire('/adherence-notification', data);
  }
}

let _auto = null;
export const getAutomationService = () => {
  if (!_auto) _auto = new AutomationService();
  return _auto;
};

