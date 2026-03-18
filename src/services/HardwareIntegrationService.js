// ═══════════════════════════════════════════════════
// HardwareIntegrationService — optional pill dispenser bridge
// This file prepares the app to talk to an external
// hardware API (LEDs, sensors, confirmation buttons).
// All calls are NO-OP unless hardwareEnabled === true.
// ═══════════════════════════════════════════════════

class HardwareIntegrationService {
  constructor() {
    this._baseUrl = import.meta.env.VITE_HARDWARE_API_BASE || null;
  }

  get isEnabled() {
    return !!this._baseUrl;
  }

  async _post(path, payload) {
    if (!this.isEnabled) return { ok: false, skipped: true };
    try {
      const res = await fetch(`${this._baseUrl}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return { ok: res.ok };
    } catch {
      return { ok: false };
    }
  }

  async syncSchedule(patientId, medicines) {
    return this._post('/schedule', { patientId, medicines });
  }

  async setLedForMedicine(medicineId, color) {
    return this._post('/led', { medicineId, color });
  }

  async confirmDose(medicineId, time) {
    return this._post('/confirm', { medicineId, time });
  }
}

let _hw = null;
export const getHardwareIntegrationService = () => {
  if (!_hw) _hw = new HardwareIntegrationService();
  return _hw;
};

