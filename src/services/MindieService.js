// ═══════════════════════════════════════════════════
// MindieService — local "brain" for Mindie AI
// Priority:
// 1) Safety guard
// 2) Medicine database lookup (OpenFDA)
// 3) Emotional support
// 4) Context questions (next medicine, streak, etc.) via existing fallback
// 5) Fallback response
// ═══════════════════════════════════════════════════

import { fetchMedicineLabel } from './MedicineKnowledgeService.js';
import { getFallbackService } from './ai/FallbackService.js';
import { PredictiveService } from './DataService.js';
import { normaliseLanguage }  from './LanguageNormalizer.js';
import { getAdherenceRisk }   from './PredictiveAdherenceService.js';

const SENIOR_TERMS = ['Acha', 'Amma', 'Ammachi', 'Appacha', 'Uncle', 'Aunty'];

function stableSeniorTerm(name) {
  const s = (name || '').trim();
  if (!s) return SENIOR_TERMS[0];
  const idx = s.charCodeAt(0) % SENIOR_TERMS.length;
  return SENIOR_TERMS[idx];
}

export function normalizeManglish(text) {
  const { normalised } = normaliseLanguage(text);
  return normalised || (text || '');
}

function isMalayalamScript(text) {
  return /[\u0D00-\u0D7F]/.test(text || '');
}

function inMalayalam(textEn) {
  // Minimal safe responses; keep short and clear.
  const map = new Map([
    ['SAFETY', 'മരുന്നിന്റെ അളവ് മാറ്റുകയോ നിർത്തുകയോ ചെയ്യുന്നതിന് മുമ്പ് ദയവായി ഡോക്ടറുമായി സംസാരിക്കുക.'],
    ['SAD', 'ഇങ്ങനെ തോന്നുന്നത് സ്വാഭാവികമാണ്. നിങ്ങൾ ഒറ്റയ്ക്കല്ല. നിങ്ങളെ സഹായിക്കാൻ ഞാൻ ഇവിടെ ഉണ്ട്.'],
    ['NUDGE_WATER', 'വെള്ളം കുടിക്കാൻ മറക്കരുത്.'],
    ['NUDGE_REST', 'കുറച്ച് വിശ്രമം എടുക്കൂ.'],
    ['NUDGE_GOOD', 'മരുന്നുകൾ കൃത്യമായി കഴിക്കുന്നതിൽ നിങ്ങൾ നന്നായി മുന്നോട്ടുപോകുന്നു.'],
  ]);
  return map.get(textEn) || textEn;
}

function detectUnsafeMedicalChange(q) {
  return /(double my dose|double the dose|increase (my )?dose|take extra|two tablets|stop (my )?medicine|can i stop|should i stop|skip (my )?medicine|change (my )?dose|reduce (my )?dose)/i.test(q || '');
}

function extractMedicineCandidate(raw) {
  const s = (raw || '').toLowerCase();
  // Very small heuristic: grab word after "what is" / "about"
  const m1 = s.match(/\bwhat is ([a-z0-9-]{3,})\b/i);
  if (m1?.[1]) return m1[1];
  const m2 = s.match(/\babout ([a-z0-9-]{3,})\b/i);
  if (m2?.[1]) return m2[1];
  // If user starts with a medicine name
  const first = s.split(/[\s,?.!]/).filter(Boolean)[0];
  return first && first.length >= 3 ? first : '';
}

function looksLikeMedicineQuestion(q) {
  return /(what is|used for|purpose|dosage|dose|warning|side effect|how to take)/i.test(q || '')
    || /enthinu|ഉപയോഗം|ഡോസ്|മുന്നറിയിപ്പ്/i.test(q || '');
}

function looksLikeEmotionalSupport(q) {
  return /(i('| a)m (sad|down|depressed|anxious|worried|stressed|lonely)|feeling sad|panic|crying)/i.test(q || '')
    || /(ദുഃഖം|ഉത്കണ്ഠ|പേടി|ഒറ്റപ്പെട്ട)/.test(q || '');
}

function shouldNudge(chatCount) {
  // Deterministic: every 5th message
  return chatCount > 0 && chatCount % 5 === 0;
}

function nudgeText(language, chatCount) {
  if (language === 'ml') {
    const opts = [inMalayalam('NUDGE_WATER'), inMalayalam('NUDGE_REST'), inMalayalam('NUDGE_GOOD')];
    return opts[chatCount % opts.length];
  }
  const opts = ['Drink some water.', 'Take some rest.', 'You are doing well with your medicines.'];
  return opts[chatCount % opts.length];
}

export function predictAdherenceRisk(ctx) {
  const logs = ctx?.allLogs || [];
  if (!logs.length) return null;
  const risk = getAdherenceRisk(logs);
  return risk.level === 'warn' ? risk : null;
}

class MindieService {
  constructor() {
    this._chatCount = 0;
  }

  async respond(message, ctx, options = {}) {
    const raw = (message || '').trim();
    if (!raw) return { skipped: true, text: '' };
    this._chatCount += 1;

    const language = options.language || 'en';
    const isSenior = options.mode === 'senior' || options.isSenior;
    const honorific = isSenior ? stableSeniorTerm(ctx?.patientName) : null;

    // Normalize Manglish for intent detection (still respond in chosen language)
    const normalized = normalizeManglish(raw);

    // 1) Safety guard
    if (detectUnsafeMedicalChange(normalized) || detectUnsafeMedicalChange(raw)) {
      const safe = language === 'ml'
        ? inMalayalam('SAFETY')
        : 'I recommend speaking with your doctor before changing your medicine.';
      return { text: safe, source: 'safety' };
    }

    // 1b) Adherence intelligence (warn + caregiver notification)
    const risk = predictAdherenceRisk(ctx);
    if (risk?.level === 'warn') {
      const warn = language === 'ml'
        ? 'ഇടുത്തകാലത്ത് ചില മരുന്നുകൾ നഷ്ടപ്പെട്ടതായി ഞാൻ ശ്രദ്ധിച്ചു. ഓർമ്മിപ്പിക്കൽ ക്രമീകരിക്കാൻ സഹായിക്കട്ടേ?'
        : 'I noticed some missed medicines recently. Would you like help setting reminders?';

      // If caregiver is currently using the app, store a lightweight risk alert (no private chat).
      if ((options.mode === 'caregiver' || options.role === 'caregiver') && ctx?.patientName) {
        try {
          PredictiveService.saveRiskAlert({
            id: `${Date.now()}`,
            createdAt: Date.now(),
            patientName: ctx.patientName,
            missedCount: risk.missedCount,
            message: `Adherence risk: ${risk.missedCount} missed doses in last 7 days.`,
          });
        } catch {}
      }
      return { text: warn, source: 'adherence' };
    }

    // 2) Medicine database lookup (OpenFDA)
    if (looksLikeMedicineQuestion(normalized) || looksLikeMedicineQuestion(raw) || isMalayalamScript(raw)) {
      const candidate = extractMedicineCandidate(normalized) || extractMedicineCandidate(raw);
      if (candidate && candidate !== 'medicine') {
        const res = await fetchMedicineLabel(candidate);
        if (res.ok) {
          const d = res.data;
          const linesEn = [
            d.usage ? `Used for: ${d.usage}` : (d.purpose ? `Purpose: ${d.purpose}` : ''),
            d.dosage ? `Dosage: ${d.dosage}` : '',
            d.warnings ? `Warnings: ${d.warnings}` : '',
          ].filter(Boolean);

          const prefix = isSenior && honorific ? `Okay, ${honorific}. ` : '';
          const text = language === 'ml'
            ? `${prefix}${candidate} സംബന്ധിച്ച പൊതുവിവരം:\n${linesEn.slice(0, 3).join('\n')}\nഡോക്ടറുടെ ഉപദേശം അനുസരിക്കുക.`
            : `${prefix}${candidate} (general info):\n${linesEn.slice(0, 3).join('\n')}\nFor personal medical decisions, please consult your doctor.`;

          return { text, source: 'openfda' };
        }
      }
    }

    // 3) Emotional support
    if (looksLikeEmotionalSupport(raw) || looksLikeEmotionalSupport(normalized)) {
      const t = language === 'ml'
        ? inMalayalam('SAD')
        : `I'm here with you. It’s okay to feel sad sometimes. Would you like to tell me what happened?`;
      return { text: t, source: 'wellness' };
    }

    // 4) Context questions (existing local rules)
    const fb = getFallbackService().answer(raw, ctx);
    if (fb?.text && fb.matched) {
      // Occasional wellness nudge appended (few chats)
      if (shouldNudge(this._chatCount)) {
        return { text: `${fb.text} ${nudgeText(language, this._chatCount)}`, source: fb.source };
      }
      return fb;
    }

    // No confident local match — let the API provider handle it.
    return { skipped: true, text: '' };
  }
}

let _mindie = null;
export const getMindieService = () => { if (!_mindie) _mindie = new MindieService(); return _mindie; };

