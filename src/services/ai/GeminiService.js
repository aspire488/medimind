// GeminiService — browser-safe provider boundary.
//
// Provider credentials must never be placed in VITE_* variables: Vite embeds
// those values into client-side assets. External Gemini access is intentionally
// disabled until an authenticated, rate-limited server-side proxy is available.
//
// ChatService already catches the unavailable-provider result and uses the
// deterministic local fallback.

class GeminiService {
  startChat(_systemPrompt) {
    // Keep the public interface stable without initializing a client SDK.
  }

  async sendMessage(_userMessage) {
    throw { type: 'unavailable', reason: 'server_proxy_not_configured' };
  }
}

let _instance = null;

export const getGeminiService = () => {
  if (!_instance) _instance = new GeminiService();
  return _instance;
};
