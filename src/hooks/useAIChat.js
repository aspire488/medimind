// ═══════════════════════════════════════════════════
// useAIChat — custom hook
// Wires: SpeechRecognition → ChatService (Mindie) → TTS
// Options: autoSpeak, isSenior, mode
// ═══════════════════════════════════════════════════

import { useState, useCallback } from 'react';
import { useAuth }     from '../contexts/AuthContext.jsx';
import { useMedicine } from '../contexts/MedicineContext.jsx';
import { useChat }     from '../contexts/ChatContext.jsx';
import { buildPatientContext } from '../services/ai/PatientContextBuilder.js';
import { getChatService }      from '../services/ai/ChatService.js';
import { getSpeechService }    from '../services/ai/SpeechRecognitionService.js';
import { getTTSService }       from '../services/ai/TextToSpeechService.js';

export function useAIChat({ autoSpeak = false, isSenior = false, mode = null, language = null } = {}) {
  const { user }                                                  = useAuth();
  const { medicines, intakeLogs, todaySchedule, todayAdherence } = useMedicine();
  const { messages, isLoading, setIsLoading, setError,
          addUserMessage, addAIMessage }                          = useChat();

  const [isListening, setIsListening] = useState(false);

  const buildCtx = useCallback(() =>
    buildPatientContext(user, medicines, intakeLogs, todaySchedule, todayAdherence),
  [user, medicines, intakeLogs, todaySchedule, todayAdherence]);

  const effectiveMode = mode || user?.mode || user?.role || 'standard';
  const effectiveLang = language || user?.language || 'en';
  const aiOptions = {
    isSenior: !!isSenior,
    mode: effectiveMode,
    language: effectiveLang,
    hardwareEnabled: user?.hardwareEnabled ?? (user?.hardwareMode === 'hardware'),
    role: user?.role,
  };

  const sendMessage = useCallback(async (text) => {
    if (!text?.trim() || isLoading) return;
    addUserMessage(text);
    setIsLoading(true);
    setError(null);
    try {
      const ctx    = buildCtx();
      const result = await getChatService().send(text, ctx, aiOptions);
      if (result && !result.skipped) {
        addAIMessage(result.text, result.source);
        if (autoSpeak && result.text) {
          isSenior
            ? getTTSService().speakSenior(result.text, effectiveLang)
            : getTTSService().speak(result.text, effectiveLang);
        }
      }
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, buildCtx, addUserMessage, addAIMessage, setIsLoading, setError, autoSpeak, isSenior, effectiveLang, aiOptions]);

  const startVoice = useCallback(async () => {
    const svc = getSpeechService();
    if (!svc.isSupported || isListening) return;
    setIsListening(true);
    try {
      const transcript = await svc.listen(effectiveLang);
      if (transcript) await sendMessage(transcript);
    } catch (e) {
      console.warn('[Voice] error', e.message);
    } finally {
      setIsListening(false);
    }
  }, [isListening, sendMessage, effectiveLang]);

  const stopVoice    = useCallback(() => { getSpeechService().stop(); setIsListening(false); }, []);
  const stopSpeaking = useCallback(() => getTTSService().stop(), []);

  return {
    messages, isLoading, isListening,
    sendMessage, startVoice, stopVoice, stopSpeaking,
    speechSupported: getSpeechService().isSupported,
  };
}
