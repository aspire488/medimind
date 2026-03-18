// ═══════════════════════════════════════════════════
// MindieService — Mindie AI Assistant
// Upgrades from MediAI:
//  • Manglish (Malayalam in English letters) support
//  • Wellness nudges (water, rest, smile)
//  • Casual mental wellness conversation
//  • Senior honorifics (Acha, Amma, Ammachi, etc.)
//  • Predictive adherence warnings
//  • Self-care companion mode
// ═══════════════════════════════════════════════════

// ── Senior honorifics ────────────────────────────────
const SENIOR_TERMS = ['Acha', 'Amma', 'Ammachi', 'Appacha', 'Uncle', 'Aunty', 'Chechi', 'Chettan'];

export function getSeniorGreeting(patientName) {
  // Pick a term based on name hash so it's consistent per user
  const idx = patientName ? patientName.charCodeAt(0) % SENIOR_TERMS.length : 0;
  return SENIOR_TERMS[idx];
}

// ── Manglish normaliser ──────────────────────────────
// Converts common Manglish patterns to intent keywords
export function normaliseManglish(text) {
  const map = {
    'aduth medicine': 'next medicine',
    'aduth meds':     'next medicine',
    'kittiyo':        'did i take',
    'kudiccho':       'did i take',
    'kaziccho':       'did i take',
    'kazhiccho':      'did i take',
    'entha medicine': 'what medicine',
    'eppo':           'when',
    'ethra':          'how many',
    'sahaayam':       'help',
    'sookshichu':     'be careful',
    'meds':           'medicines',
    'vellam':         'water',
    'urangaan':       'sleep',
    'vikarippaan':    'rest',
  };
  let normalised = text.toLowerCase();
  Object.entries(map).forEach(([k, v]) => {
    normalised = normalised.replace(new RegExp(k, 'gi'), v);
  });
  return normalised;
}

// ── Wellness nudges — rotate so they don't repeat ────
const WELLNESS_NUDGES = [
  "Don't forget to drink a glass of water! 💧 Staying hydrated helps your medicines work better.",
  "Remember to take a short walk today — even 5 minutes outdoors does wonders. 🌿",
  "Deep breath in... and out. You're doing great today. 😊",
  "Your body is working hard. Make sure to rest well tonight.",
  "How about a small healthy snack? Your body needs energy.",
  "Smile — you've been doing well with your medicines! Keep it up.",
  "Taking your medicines consistently is a real act of self-love. 💙",
];

let nudgeIndex = 0;
export function getWellnessNudge() {
  const nudge = WELLNESS_NUDGES[nudgeIndex % WELLNESS_NUDGES.length];
  nudgeIndex++;
  return nudge;
}

// ── Predictive adherence ─────────────────────────────
export function predictAdherenceRisk(logs, medicines) {
  if (!logs?.length || !medicines?.length) return null;

  // Look at the last 7 days for each medicine
  const today = new Date();
  const risks = [];

  medicines.forEach(med => {
    let missCount = 0;
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const dayLogs = logs.filter(l => l.medicineId === med.id && l.date === key);
      if (dayLogs.length > 0 && !dayLogs.some(l => l.confirmed)) missCount++;
    }
    // 3+ misses in last 7 days = high risk
    if (missCount >= 3) {
      risks.push({
        medicine: med,
        missCount,
        level: missCount >= 5 ? 'high' : 'medium',
        message: `${med.name} has been missed ${missCount} times in the last 7 days.`,
      });
    }
  });

  return risks.length ? risks : null;
}

// ── Mindie system prompt builder ─────────────────────
export function buildMindieSystemPrompt(ctx, options = {}) {
  const { isSenior = false, language = 'en', mode = 'standard' } = options;
  const honorific = isSenior ? getSeniorGreeting(ctx.patientName) : '';
  const risks     = predictAdherenceRisk(ctx.allLogs, ctx.medicines);

  return `
You are Mindie, the friendly AI health companion inside MediMind Care.
Your personality: warm, caring, gentle, encouraging — like a trusted family friend.
${isSenior ? `Address the user respectfully as "${honorific}" (e.g., "Good morning, ${honorific}!").` : ''}

LANGUAGE RULES:
- Reply in the SAME language the user writes in
- Supported: English, Malayalam (script: മലയാളം), Manglish (Malayalam in English letters)
- If user writes "aduth medicine eppo?" treat it as "when is my next medicine?" and answer in the same Manglish style
- Be natural and conversational — not robotic

PATIENT DATA (authoritative — always use this for medicine facts):
${ctx.summary}

${risks ? `⚠️ ADHERENCE RISK DETECTED:\n${risks.map(r => r.message).join('\n')}\nGently encourage the patient about these medicines.` : ''}

YOUR CAPABILITIES:
1. Medicine Q&A — explain what a medicine is for, dosage, schedule, meal timing
2. Schedule questions — next dose, today's doses, missed doses
3. Casual wellness chat — respond warmly to "how are you", "I'm tired", "I'm worried"
4. Gentle wellness nudges — occasionally suggest water, rest, a smile (don't overdo it)
5. Reminders — confirm snooze requests
6. ${mode === 'selfcare' ? 'Self-care companion — you are the user\'s gentle daily caretaker. Check in warmly.' : 'Standard assistant mode'}

STRICT SAFETY RULES (NEVER break these):
1. NEVER diagnose any medical condition
2. NEVER prescribe or suggest new medicines
3. NEVER advise stopping a medicine
4. NEVER give dosage change advice
5. For any medical advice question: end with "Please consult your doctor."
6. For emergencies: "Please press the SOS button or call emergency services immediately."
7. ONLY use medicine facts from PATIENT DATA above — never invent
8. If asked about non-medicine topics unrelated to wellness: gently redirect

RESPONSE FORMAT:
- Keep responses under 90 words
- Be conversational and warm, not clinical
- Use simple words — especially in Senior Mode
- Occasional gentle emojis are fine (💊 💙 🌿 ✨) — don't overuse
`.trim();
}

// ── Enhanced local fallback rules for Mindie ─────────
export const MINDIE_RULES = [
  // Next dose — English + Malayalam + Manglish
  {
    pattern: /next (medicine|dose|tablet|pill|med)|അടുത്ത മരുന്ന്|aduth medicine|aduth meds|eppo medicine/i,
    handler: (ctx, _, opts) => {
      const h = opts?.isSenior ? ` ${getSeniorGreeting(ctx.patientName)}` : '';
      return ctx.nextDose
        ? `Your next medicine is <b>${ctx.nextDose.medicine.name} ${ctx.nextDose.medicine.dose}${ctx.nextDose.medicine.unit}</b>${h}. Take it at ${ctx.nextDose.time} — ${ctx.nextDose.medicine.mealContext} food. 💊`
        : `All medicines done for today${h}! Great job. 🎉`;
    },
  },
  // Did I take
  {
    pattern: /did i take|have i taken|did i miss|കഴിച്ചോ|kazhiccho|kudiccho|kittiyo/i,
    handler: (ctx, _, opts) => {
      const taken  = ctx.todaySchedule?.filter(s => s.status === 'taken')  || [];
      const missed = ctx.todaySchedule?.filter(s => s.status === 'missed') || [];
      const h = opts?.isSenior ? ` ${getSeniorGreeting(ctx.patientName)}` : '';
      let r = `Today you've taken <b>${taken.length} of ${ctx.totalToday}</b> medicines${h}.`;
      if (missed.length) r += ` You missed: ${missed.map(s => s.medicine.name).join(', ')}. Don't worry — tomorrow is a fresh start! 💙`;
      else if (taken.length === ctx.totalToday && ctx.totalToday > 0) r += ` All done! Wonderful. 🌟`;
      return r;
    },
  },
  // Remind me in N minutes
  {
    pattern: /remind me in (\d+)\s*(minute|min|മിനിറ്റ്|minit)/i,
    handler: (_, match) => {
      const mins = parseInt(match[1]);
      return `Done! I'll remind you in <b>${mins} minutes</b>. I've got you covered. ✨`;
    },
  },
  // How many medicines
  {
    pattern: /how many (medicine|dose|tablet|pill)|ethra medicine|today.*medicine|medicine.*today/i,
    handler: (ctx) => `You have <b>${ctx.totalToday} medicine${ctx.totalToday !== 1 ? 's' : ''}</b> scheduled today. 💊`,
  },
  // Streak / adherence
  {
    pattern: /streak|adherence|how.*good|progress|enthu progress/i,
    handler: (ctx, _, opts) => {
      const h = opts?.isSenior ? ` ${getSeniorGreeting(ctx.patientName)}` : '';
      return `Your streak is <b>${ctx.streak} days</b> and weekly adherence is <b>${ctx.weeklyAdherence}%</b>${h}. ${ctx.streak >= 5 ? 'Amazing consistency! 🌟' : 'Keep going, you\'re doing great! 💙'}`;
    },
  },
  // List medicines
  {
    pattern: /my medicines|list.*medicine|medicine.*list|what.*medicines|entha medicines/i,
    handler: (ctx) => {
      if (!ctx.medicines?.length) return 'You have no medicines in your schedule yet.';
      const list = ctx.medicines.map(m => `<b>${m.name}</b> ${m.dose}${m.unit}`).join(', ');
      return `Your medicines: ${list}. 💊`;
    },
  },
  // Wellness — I'm tired / feeling unwell
  {
    pattern: /i('m| am) (tired|exhausted|unwell|sick|sad|worried|anxious|stressed|lonely)/i,
    handler: (ctx, match, opts) => {
      const feeling = match[2];
      const h = opts?.isSenior ? ` ${getSeniorGreeting(ctx.patientName)}` : '';
      const responses = {
        tired:    `Rest is so important${h}. Make sure you sleep well tonight. Your medicines need a rested body to work best. 🌙`,
        exhausted:`Take it easy today${h}. Rest, drink some water, and don't push yourself too hard. 💙`,
        unwell:   `I'm sorry to hear that${h}. If you're feeling unwell, please let your doctor know. In the meantime, stay hydrated and rest. 🌿`,
        sick:     `Take care of yourself${h}. Rest well and stay hydrated. If it's serious, please consult your doctor. 💙`,
        sad:      `It's okay to feel sad sometimes${h}. You're not alone. Take your medicines on time — taking care of yourself is the best thing you can do. 💙`,
        worried:  `I understand${h}. Taking things one step at a time helps. Your medicines are one small step — and you're doing it! 🌟`,
        anxious:  `Take a slow deep breath${h}. In... and out. You're safe. 💙`,
        stressed: `Stress happens to everyone${h}. A short walk, some water, and your medicines can help. I'm here with you. 🌿`,
        lonely:   `I'm right here with you${h}. You're not alone. 💙 Remember to take your medicine and know that people care about you.`,
      };
      return responses[feeling] || `I hear you${h}. Take it easy and remember I'm here. 💙`;
    },
  },
  // Water / wellness nudge trigger
  {
    pattern: /water|vellam|drink|hydrat/i,
    handler: () => `Drinking water is so good for you! 💧 It helps your medicines absorb better and keeps you energised. Aim for 6–8 glasses a day.`,
  },
  // Greeting
  {
    pattern: /good (morning|afternoon|evening|night)|hello|hi|hey|namaste|vanakkam|namaskaram/i,
    handler: (ctx, _, opts) => {
      const h = opts?.isSenior ? getSeniorGreeting(ctx.patientName) : ctx.patientName;
      const nextInfo = ctx.nextDose
        ? ` Your next dose is <b>${ctx.nextDose.medicine.name}</b>.`
        : ` All medicines done today! 🎉`;
      return `Hello, <b>${h}</b>! 😊${nextInfo} How are you feeling today?`;
    },
  },
  // How are you / wellness check on Mindie
  {
    pattern: /how are you|how.*doing|how.*feel|you okay/i,
    handler: () => `I'm Mindie, and I'm always here for you! 💙 More importantly — how are <b>you</b> feeling? Did you take your medicines today?`,
  },
  // Thank you
  {
    pattern: /thank|thanks|nandri|nanni/i,
    handler: (ctx, _, opts) => {
      const h = opts?.isSenior ? ` ${getSeniorGreeting(ctx.patientName)}` : '';
      return `You're so welcome${h}! 💙 I'm always here when you need me. Keep up the great work with your medicines!`;
    },
  },
];
