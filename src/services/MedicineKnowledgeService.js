// ═══════════════════════════════════════════════════
// MedicineKnowledgeService — real-world medicine lookup
// Uses OpenFDA drug label API (public).
// Returns a small, safe summary for education only.
// ═══════════════════════════════════════════════════

const OPEN_FDA = 'https://api.fda.gov/drug/label.json';

function pickFirst(v) {
  if (!v) return '';
  if (Array.isArray(v)) return (v[0] || '').toString();
  return v.toString();
}

function cleanText(s) {
  return (s || '')
    .replace(/\s+/g, ' ')
    .replace(/\u00a0/g, ' ')
    .trim();
}

export async function fetchMedicineLabel(medicineName) {
  const med = (medicineName || '').trim();
  if (!med) return { ok: false, error: 'No medicine provided.' };

  const q = encodeURIComponent(`openfda.generic_name:${med}`);
  const url = `${OPEN_FDA}?search=${q}&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { ok: false, error: `OpenFDA lookup failed (${res.status}).` };
    }
    const json = await res.json();
    const r = json?.results?.[0] || null;
    if (!r) return { ok: false, error: 'No label data found.' };

    const purpose     = cleanText(pickFirst(r.purpose));
    const usage       = cleanText(pickFirst(r.indications_and_usage));
    const dosage      = cleanText(pickFirst(r.dosage_and_administration));
    const warnings    = cleanText(pickFirst(r.warnings_and_cautions || r.warnings));
    const sideEffects = cleanText(pickFirst(r.adverse_reactions));

    return {
      ok: true,
      data: {
        purpose,
        usage,
        dosage,
        warnings,
        sideEffects,
        source: 'openfda',
      },
    };
  } catch (e) {
    return { ok: false, error: 'Network error while fetching medicine data.' };
  }
}

