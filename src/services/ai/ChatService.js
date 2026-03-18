// ═══════════════════════════════════════════════════
// ChatService — Mindie 5-layer orchestrator
// Updated to use MindiePrompt for persona
// ═══════════════════════════════════════════════════

import { getGeminiService }   from './GeminiService.js';
import { getFallbackService } from './FallbackService.js';
import { getQueryCache }      from './QueryCache.js';
import { buildMindiePrompt }  from './MindiePrompt.js';
import { getMindieService }   from '../MindieService.js';
import DemoService            from '../DemoService.js';

const IS_MOCK = import.meta.env.VITE_AI_MODE === 'mock';
const sleep   = (ms) => new Promise(res => setTimeout(res, ms));

class ChatService {
  constructor() {
    this._isPending     = false;
    this._debounceTimer = null;
    this._minInterval   = 1000;
    this._lastCallTime  = 0;
    this._chatStarted   = false;
    this._options       = {};
  }

  setOptions(options) {
    // Called once when user logs in with role/language
    if (JSON.stringify(options) !== JSON.stringify(this._options)) {
      this._options     = options;
      this._chatStarted = false; // force restart with new persona
      getQueryCache().clear();
    }
  }

  _ensureChat(ctx) {
    if (this._chatStarted) return;
    const prompt = buildMindiePrompt(ctx, this._options);
    getGeminiService().startChat(prompt);
    this._chatStarted = true;
  }

  resetChat() {
    this._chatStarted = false;
    getQueryCache().clear();
  }

  async send(message, ctx, options = null) {
    if (!message?.trim()) return null;
    if (options) this.setOptions(options);

    // Layer 1: Pending guard + throttle
    if (this._isPending) return { text: '', skipped: true };
    const now = Date.now();
    const elapsed = now - this._lastCallTime;
    if (elapsed < this._minInterval) await sleep(this._minInterval - elapsed);

    // Layer 2: Demo / DEV mock
    if (DemoService.isEnabled() || IS_MOCK) {
      await sleep(500);
      const fb = getFallbackService().answer(message, ctx);
      if (fb?.matched) return fb;
      return {
        text: `Demo mode: I can answer questions about your medicines and schedule. Try “When is my next medicine?”`,
        source: 'fallback',
        matched: true,
      };
    }

    // Layer 3: Local fallback pattern match
    try {
      const mindie = await getMindieService().respond(message, ctx, this._options);
      if (mindie && !mindie.skipped && mindie.text) return mindie;
    } catch {}

    const localAnswer = getFallbackService().answer(message, ctx);
    if (localAnswer.source === 'fallback' && localAnswer.matched && !localAnswer.text.includes('temporarily')) {
      return localAnswer;
    }

    // Layer 4: Cache
    const cache  = getQueryCache();
    const cached = cache.get(message, ctx.hash);
    if (cached) return { text: cached, source: 'cache' };

    // Layer 5: Gemini with Mindie persona
    this._isPending    = true;
    this._lastCallTime = Date.now();
    try {
      this._ensureChat(ctx);
      const result = await getGeminiService().sendMessage(message);
      cache.set(message, ctx.hash, result.text);
      return result;
    } catch (err) {
      console.error('[Mindie] Gemini failed', err);
      return getFallbackService().answer(message, ctx);
    } finally {
      this._isPending = false;
    }
  }
}

let _cs = null;
export const getChatService = () => { if (!_cs) _cs = new ChatService(); return _cs; };
