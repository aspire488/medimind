// ═══════════════════════════════════════════════════
// QueryCache — session memory cache with TTL tiers
// ═══════════════════════════════════════════════════

const TTL = {
  schedule:  5  * 60 * 1000,  // 5 min — "next dose" queries
  adherence: 2  * 60 * 1000,  // 2 min — "did I take" queries
  general:   30 * 60 * 1000,  // 30 min — medicine info
};

const getTTL = (msg) => {
  const m = msg.toLowerCase();
  if (/next (dose|medicine|pill)|אdalutha/.test(m)) return TTL.schedule;
  if (/did i take|have i taken/.test(m))            return TTL.adherence;
  return TTL.general;
};

const normalize = (msg) =>
  msg.toLowerCase().trim().replace(/[?.,!]/g,'').replace(/\s+/g,' ');

class QueryCache {
  constructor() { this._cache = new Map(); }

  get(message, contextHash) {
    const key   = `${normalize(message)}|${contextHash}`;
    const entry = this._cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.ts > getTTL(message)) {
      this._cache.delete(key);
      return null;
    }
    console.log('[QueryCache] HIT', message.slice(0,40));
    return entry.text;
  }

  set(message, contextHash, text) {
    const key = `${normalize(message)}|${contextHash}`;
    this._cache.set(key, { text, ts: Date.now() });
  }

  invalidateSchedule() {
    for (const [k] of this._cache) {
      if (/next|take|dose|medicine/.test(k)) this._cache.delete(k);
    }
  }

  clear() { this._cache.clear(); }
}

let _qc = null;
export const getQueryCache = () => { if(!_qc) _qc = new QueryCache(); return _qc; };
