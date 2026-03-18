// ═══════════════════════════════════════════════════
// FallbackService — Mindie local rule-based responses
// Zero API cost — handles most common queries
// Supports: English, Malayalam, Manglish
// ═══════════════════════════════════════════════════

const WELLNESS_NUDGES = [
  "Don't forget to drink some water today.",
  'Remember to take a short rest — you deserve it.',
  "You're doing great. Keep going!",
  'Have you eaten properly today?',
  'വെള്ളം കുടിക്കാൻ മറക്കരുത്.',
  'Njan ninne care cheyyunnu. Sheriyano?',
];

function getDeterministicNudge(seed = '') {
  const s = String(seed || '');
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum = (sum + s.charCodeAt(i)) % 997;
  return WELLNESS_NUDGES[sum % WELLNESS_NUDGES.length];
}

const RULES = [
  // ── Schedule queries ──
  {
    pattern: /next (medicine|dose|tablet|pill|med)|അടുത്ത മരുന്ന്|aduttha marunnu|next med|ethu marunnu|eppol/i,
    handler: (ctx) => ctx.nextDose
      ? `Your next medicine is <b>${ctx.nextDose.medicine.name} ${ctx.nextDose.medicine.dose}${ctx.nextDose.medicine.unit}</b>. Take it ${ctx.nextDose.medicine.mealContext} food.`
      : `All medicines done for today! Great job. 🎉`,
  },
  // ── Intake check ──
  {
    pattern: /did i take|have i taken|did i miss|കഴിച്ചോ|kazhincho|marunnu kazhincho|intake check/i,
    handler: (ctx) => {
      const taken  = ctx.todaySchedule?.filter(s => s.status === 'taken')  || [];
      const missed = ctx.todaySchedule?.filter(s => s.status === 'missed') || [];
      let resp = `Today you have taken <b>${taken.length} of ${ctx.totalToday}</b> medicines.`;
      if (missed.length) resp += ` Missed: ${missed.map(s => s.medicine.name).join(', ')}.`;
      else if (taken.length === ctx.totalToday && ctx.totalToday > 0) resp += ` All done! 🎉`;
      return resp;
    },
  },
  // ── Snooze / remind ──
  {
    pattern: /remind me in (\d+)\s*(minute|min|minutes|minis|mnt|മിനിറ്റ്)/i,
    handler: (ctx, match) => `Done! Mindie will remind you in <b>${match[1]} minutes</b>. 🔔`,
  },
  // ── Count today ──
  {
    pattern: /how many (medicine|dose|tablet|pill)|today.*medicine|medicine.*today|ethra marunnu/i,
    handler: (ctx) => `You have <b>${ctx.totalToday} medicine${ctx.totalToday !== 1 ? 's' : ''}</b> scheduled today.`,
  },
  // ── Adherence / streak ──
  {
    pattern: /streak|adherence|how.*good|progress|eppadi|evide ninnu|percentage/i,
    handler: (ctx) => `Your streak is <b>${ctx.streak} days</b> and weekly adherence is <b>${ctx.weeklyAdherence}%</b>. ${ctx.streak >= 5 ? 'Excellent! 🌟' : 'Keep going! 💪'}`,
  },
  // ── List medicines ──
  {
    pattern: /my medicines|list.*medicine|medicine.*list|what.*medicines|ente marunnu|ningalude marunnu/i,
    handler: (ctx) => {
      if (!ctx.medicines?.length) return 'No medicines in your schedule yet.';
      const list = ctx.medicines.map(m => `<b>${m.name}</b> ${m.dose}${m.unit}`).join(', ');
      return `Your medicines: ${list}.`;
    },
  },
  // ── Wellness / how are you ──
  {
    pattern: /how are you|sheriyano|sugham|feeling|health|welln|stress|tired|rest/i,
    handler: () => `Mindie is always here for you! 😊 ${getRandNudge()}`,
  },
  // ── Manglish greeting ──
  {
    pattern: /namaskaram|nmaskar|sugham ano|enthu vishesham|ningalku sugham/i,
    handler: (ctx) => `Namaskaram ${ctx.patientName}! Ente peru Mindie. Ningalkku enikkanu help cheyyaan? 😊`,
  },
  // ── General greetings ──
  {
    pattern: /good (morning|afternoon|evening|night)|hello|hi|hey|olla|hai/i,
    handler: (ctx) => {
      const hr = new Date().getHours();
      const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
      const nextInfo = ctx.nextDose
        ? ` Your next dose is <b>${ctx.nextDose.medicine.name}</b>.`
        : ` All medicines done today!`;
      return `${greet}, ${ctx.patientName}!${nextInfo} How can I help you? 😊`;
    },
  },
  // ── Water / wellness nudge request ──
  {
    pattern: /water|vellam|rest|aram|smile|mood|happy/i,
    handler: () => getRandNudge(),
  },
  // ── SOS / emergency ──
  {
    pattern: /emergency|sos|help me|chest pain|pain|attack|ambulance/i,
    handler: () => `🚨 Please press the <b>SOS button</b> in the app immediately or call emergency services. Do not delay!`,
  },
];

class FallbackService {
  answer(message, ctx) {
    for (const rule of RULES) {
      const match = message.match(rule.pattern);
      if (match) {
        return { text: rule.handler(ctx, match), source: 'fallback', matched: true };
      }
    }
    return {
      text: `I can help with your medicines, schedule, and wellness. ${getDeterministicNudge(ctx?.hash || '')} What would you like to know?`,
      source: 'fallback',
      matched: false,
    };
  }
}

let _fb = null;
export const getFallbackService = () => { if (!_fb) _fb = new FallbackService(); return _fb; };
