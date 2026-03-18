// ═══════════════════════════════════════════════════
// AIProviderRouter — multi-provider Mindie backbone
// Routes queries to: Gemini, GPT, Claude, or local rules.
//  - Medicine knowledge  → Gemini
//  - Conversation / mood → GPT
//  - Adherence reasoning → Claude
//  - Offline             → local fallback
// ═══════════════════════════════════════════════════

import { getGeminiService }   from './ai/GeminiService.js';
import { getFallbackService } from './ai/FallbackService.js';
import { normaliseLanguage }  from './LanguageNormalizer.js';

// NOTE: GPT & Claude HTTP calls are sketched as stubs; wire in your keys/endpoints.

async function callGPT(prompt, opts = {}) {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  const baseUrl = import.meta.env.VITE_OPENAI_API_BASE || 'https://api.openai.com/v1/chat/completions';
  if (!key) throw new Error('gpt_missing');
  const body = {
    model: import.meta.env.VITE_OPENAI_MODEL || 'gpt-4.1-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: Math.min(opts.maxTokens || 256, 512),
  };
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`gpt_${res.status}`);
  const json = await res.json();
  const text = json.choices?.[0]?.message?.content || '';
  return { text, source: 'gpt' };
}

async function callClaude(prompt, opts = {}) {
  const key = import.meta.env.VITE_CLAUDE_API_KEY;
  const baseUrl = import.meta.env.VITE_CLAUDE_API_BASE || 'https://api.anthropic.com/v1/messages';
  if (!key) throw new Error('claude_missing');
  const body = {
    model: import.meta.env.VITE_CLAUDE_MODEL || 'claude-3-5-sonnet-latest',
    max_tokens: Math.min(opts.maxTokens || 256, 512),
    messages: [{ role: 'user', content: prompt }],
  };
  const res = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`claude_${res.status}`);
  const json = await res.json();
  const text = json.content?.[0]?.text || '';
  return { text, source: 'claude' };
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

  // Very small in-memory cache to avoid duplicate calls in-session.
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
    console.warn('[AIProviderRouter] primary provider failed, falling back', e?.message || e);
  }

  // Final safety net: local rules
  const fb = fallbackSvc.answer(message, ctx);
  routeAI._cache.set(cacheKey, fb.text);
  return fb;
}

