// ═══════════════════════════════════════════════════
// GeminiService — Singleton
// Wraps @google/generative-ai with retry + backoff
// ═══════════════════════════════════════════════════

import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_RETRIES   = 3;
const BASE_DELAY_MS = 2000;
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

const SAFETY_SETTINGS = [
  { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
  { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
];

class GeminiService {
  constructor() {
    this._client = null;
    this._chat   = null;
    this._ready  = false;
  }

  _init() {
    if (this._ready) return;
    const key = import.meta.env.VITE_GEMINI_KEY;
    if (!key || key === 'your-gemini-api-key-here') {
      console.warn('[GeminiService] No API key — will use fallback');
      return;
    }
    try {
      this._client = new GoogleGenerativeAI(key);
      this._ready  = true;
    } catch (e) {
      console.error('[GeminiService] init failed', e);
    }
  }

  startChat(systemPrompt) {
    this._init();
    if (!this._ready) return;
    const model = this._client.getGenerativeModel({
      model: 'gemini-2.0-flash',
      safetySettings: SAFETY_SETTINGS,
    });
    this._chat = model.startChat({
      history: [
        { role: 'user',  parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I am MediAI, ready to help with medicine questions.' }] },
      ],
    });
  }

  async sendMessage(userMessage, attempt = 0) {
    if (!this._ready || !this._chat) {
      throw { type: 'unavailable' };
    }
    try {
      const result = await this._chat.sendMessage(userMessage);
      return { text: result.response.text(), source: 'gemini', attempts: attempt + 1 };
    } catch (error) {
      const is429 = error?.message?.includes('429') ||
                    error?.message?.toLowerCase().includes('quota') ||
                    error?.status === 429;
      if (is429 && attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[GeminiService] Rate limited. Retry ${attempt+1}/${MAX_RETRIES} in ${delay}ms`);
        await sleep(delay);
        return this.sendMessage(userMessage, attempt + 1);
      }
      throw { type: is429 ? 'quota' : 'error', original: error };
    }
  }
}

// ── Singleton — survives HMR ──
let _instance = null;
export const getGeminiService = () => {
  if (!_instance) _instance = new GeminiService();
  return _instance;
};
