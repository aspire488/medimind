// ═══════════════════════════════════════════════════
// SpeechRecognitionService
// Wraps Web Speech API with language support
// ═══════════════════════════════════════════════════

class SpeechRecognitionService {
  constructor() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this._supported = !!SR;
    if (this._supported) {
      this._recognition = new SR();
      this._recognition.continuous    = false;
      this._recognition.interimResults = false; // isFinal only — prevents partial-result API spam
      this._recognition.maxAlternatives = 1;
    }
    this._listening = false;
  }

  get isSupported() { return this._supported; }
  get isListening()  { return this._listening; }

  listen(lang = 'en-IN') {
    return new Promise((resolve, reject) => {
      if (!this._supported) { reject(new Error('Speech recognition not supported')); return; }
      if (this._listening)  { reject(new Error('Already listening'));                return; }
      this._recognition.lang = lang === 'ml' ? 'ml-IN' : 'en-IN';
      this._listening = true;
      this._recognition.onresult = (e) => {
        this._listening = false;
        const transcript = e.results[e.results.length - 1][0].transcript.trim();
        resolve(transcript);
      };
      this._recognition.onerror = (e) => {
        this._listening = false;
        reject(new Error(e.error));
      };
      this._recognition.onend = () => { this._listening = false; };
      try { this._recognition.start(); }
      catch(e) { this._listening = false; reject(e); }
    });
  }

  stop() {
    if (this._supported && this._listening) {
      this._recognition.stop();
      this._listening = false;
    }
  }
}

let _srs = null;
export const getSpeechService = () => { if(!_srs) _srs = new SpeechRecognitionService(); return _srs; };
