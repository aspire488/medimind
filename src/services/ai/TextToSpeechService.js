// ═══════════════════════════════════════════════════
// TextToSpeechService
// speechSynthesis API — English + Malayalam
// ═══════════════════════════════════════════════════

class TextToSpeechService {
  constructor() {
    this._supported = 'speechSynthesis' in window;
    this._speaking  = false;
  }

  get isSupported() { return this._supported; }
  get isSpeaking()  { return this._speaking; }

  // Strip HTML tags before speaking
  _clean(text) { return text.replace(/<[^>]+>/g, ''); }

  speak(text, lang = 'en', rate = 0.9, pitch = 1) {
    if (!this._supported) return;
    this.stop();
    const clean = this._clean(text);
    if (!clean.trim()) return;

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang  = lang === 'ml' ? 'ml-IN' : 'en-IN';
    utter.rate  = rate;
    utter.pitch = pitch;
    utter.volume = 1;

    // Pick best voice for language
    const voices = window.speechSynthesis.getVoices();
    const match  = voices.find(v => v.lang.startsWith(lang === 'ml' ? 'ml' : 'en'));
    if (match) utter.voice = match;

    utter.onstart = () => { this._speaking = true; };
    utter.onend   = () => { this._speaking = false; };
    utter.onerror = () => { this._speaking = false; };

    window.speechSynthesis.speak(utter);
    this._speaking = true;
  }

  // Slower rate for senior mode
  speakSenior(text, lang = 'en') { this.speak(text, lang, 0.75, 1); }

  stop() {
    if (this._supported) {
      window.speechSynthesis.cancel();
      this._speaking = false;
    }
  }
}

let _tts = null;
export const getTTSService = () => { if(!_tts) _tts = new TextToSpeechService(); return _tts; };
