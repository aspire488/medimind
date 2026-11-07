// AIProviderRouter — browser-safe provider boundary.
//
// Direct calls to OpenAI and Anthropic from the browser would expose API
// credentials in the built assets. These integrations remain deliberately
// unavailable until authenticated, rate-limited server-side endpoints exist.
// routeAI catches these errors and uses the deterministic local fallback.

import { getGeminiService }   from './ai/GeminiService.js';
import { getFallbackService } from './ai/FallbackService.js';
import { normaliseLanguage }  from './LanguageNormalizer.js';

async function callGPT(_prompt, _opts = {}) {
  throw new Error('gpt_server_proxy_unavailable');
}

async function callClaude(_prompt, _opts = {}) {
  throw new Error('claude_server_proxy_unavailable');
}

function classifyIntent(text, ctx) {
  const t = text.toLowerCase();
  if (/next dose|next medicine|adutha dose|schedule|today.*medicine/.test(t)) {
    return 'schedule';
  }
  if (/streak|adherence|missed/i.test(t)) {
    return 'adherence';
  }
  if (/what is|used for|side effect|safe|dosage|purpose|tablet|capsule|syrup|mg|ml/.test(t)) {
    return 'medicine';
  }
  if (/sad|worried|anxious|lonely|depressed|tired|stress|tension|i feel/i.test(t)) {
    return 'mood';
  }
  return 'chat';
}

export async function routeAI(message, ctx, options = {}) {
  const { normalised } = normaliseLanguage(message);
  const input = normalised || message;
  const intent = classifyIntent(input, ctx);
  const cacheKey = `${intent}:${ctx?.hash || 'noctx'}:${input}`;

  if (!routeAI._cache) routeAI._cache = new Map();
  if (routeAI._cache.has(cacheKey)) {
    return { text: routeAI._cache.get(cacheKey), source: 'cache' };
  }

  const fallbackSvc = getFallbackService();

  try {
    if (intent === 'medicine') {
      const res = await getGeminiService().sendMessage(input);
      routeAI._cache.set(cacheKey, res.text);
      return res;
    }

    if (intent === 'mood' || intent === 'chat') {
      const res = await callGPT(input, { maxTokens: 220 });
      routeAI._cache.set(cacheKey, res.text);
      return res;
    }

    if (intent === 'adherence') {
      const enriched = `${ctx?.summary || ''}\n\nQuestion: ${input}`;
      const res = await callClaude(enriched, { maxTokens: 220 });
      routeAI._cache.set(cacheKey, res.text);
      return res;
    }
  } catch (e) {
    console.warn('[AIProviderRouter] remote provider unavailable; using local fallback', e?.message || e);
  }

  const fb = fallbackSvc.answer(message, ctx);
  routeAI._cache.set(cacheKey, fb.text);
  return fb;
}
