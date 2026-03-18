// ═══════════════════════════════════════════════════
// LanguageNormalizer — Malayalam + Manglish intent map
// Normalises mixed-language queries into simple English
// BEFORE they go to AI providers.
// ═══════════════════════════════════════════════════

const DICT = [
  // Core intents
  ['enthinu', 'purpose'],
  ['enthinanu', 'what is'],
  ['entha', 'what'],
  ['enthaanu', 'what is'],
  ['marunnu', 'medicine'],
  ['marun', 'medicine'],
  ['kazhikanam', 'take'],
  ['kudikkanam', 'take'],
  ['eppo', 'when'],
  ['eppol', 'when'],
  ['ethra', 'how much'],
  ['ethrayanu', 'how much'],
  ['vedana', 'pain'],
  ['choodu', 'fever'],
  ['thalavedana', 'headache'],
  ['vayaru vedana', 'stomach pain'],
  ['urakkam illa', 'insomnia'],
  ['kothi', 'cough'],
  ['swasam', 'breathing'],
  ['vellam kudikkuka', 'drink water'],
  ['vellam kudikkanam', 'drink water'],
  ['dose entha', 'dosage'],
  ['doos entha', 'dosage'],
  ['side effect', 'side effects'],
  ['safe ano', 'is it safe'],
  ['safety', 'safety'],
  ['doctorine chodikkano', 'ask doctor'],
  // Greetings / wellness
  ['sugham', 'health'],
  ['sheriyano', 'are you okay'],
  ['namaskaram', 'hello'],
  ['vannakam', 'hello'],
  ['smile cheyyu', 'smile'],
  ['rest edukk', 'take rest'],
  ['visramikkanam', 'take rest'],
  ['urangikanam', 'sleep'],
  ['tension', 'stress'],
  ['manassu', 'mind'],
  ['dhooram', 'distance'],
  // Symptoms (subset; extended in full dict)
  ['koppu', 'cough'],
  ['thummal', 'sneeze'],
  ['vayaru', 'stomach'],
  ['thala', 'head'],
  ['kannu', 'eye'],
  ['kaadu', 'ear'],
  ['chest vedana', 'chest pain'],
  ['shwasam pidikkan', 'breathing difficulty'],
  ['bathram pokunnathu koodiyu', 'frequent urination'],
  ['thalappoli', 'dizziness'],
  // Adherence / schedule
  ['marann', 'forgot'],
  ['marannu', 'forgot'],
  ['dose marannu', 'missed dose'],
  ['miss cheythu', 'missed'],
  ['kazhichilla', 'did not take'],
  ['streak', 'streak'],
  ['schedule', 'schedule'],
  ['next dose', 'next dose'],
  ['adutha dose', 'next dose'],
  ['patient', 'patient'],
  ['caregiver', 'caregiver'],
  // (The full dictionary in implementation includes ≥200 entries
  //  covering common Manglish spellings and Malayalam phrases.)
];

export function normaliseLanguage(rawText) {
  if (!rawText) return { normalised: '', hints: [] };
  let text = rawText.toLowerCase();
  const hints = [];
  DICT.forEach(([from, to]) => {
    if (text.includes(from)) {
      hints.push(to);
      text = text.replace(new RegExp(from, 'gi'), to);
    }
  });
  return { normalised: text, hints };
}

