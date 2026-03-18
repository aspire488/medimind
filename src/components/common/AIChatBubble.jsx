import React from 'react';
import MindieAvatar  from './MindieAvatar.jsx';
import { getTTSService } from '../../services/ai/TextToSpeechService.js';

const SOURCE_LABEL = { gemini: null, cache: 'Cached', fallback: 'Offline', system: null };

export default function AIChatBubble({ message, language = 'en', seniorMode = false }) {
  const isUser = message.role === 'user';
  const tag    = SOURCE_LABEL[message.source];

  const handleSpeak = () => {
    getTTSService().speak(message.text, language);
  };

  if (isUser) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
        <div style={{
          background: 'var(--blue)',
          borderRadius: '14px 14px 4px 14px',
          padding: seniorMode ? '12px 16px' : '9px 13px',
          maxWidth: '78%',
        }}>
          <p style={{ color: '#fff', fontSize: seniorMode ? 16 : 13, lineHeight: 1.5, margin: 0 }}>
            {message.text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}>
      <MindieAvatar size={seniorMode ? 34 : 28} />

      <div style={{ maxWidth: '82%' }}>
        <div style={{
          background: '#fff',
          border: '1px solid var(--border)',
          borderRadius: '4px 14px 14px 14px',
          padding: seniorMode ? '12px 16px' : '9px 13px',
        }}>
          <p
            style={{ fontSize: seniorMode ? 16 : 13, color: 'var(--text)', lineHeight: 1.6, margin: 0 }}
            dangerouslySetInnerHTML={{ __html: message.text }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
          {tag && (
            <span style={{
              fontSize: 9, color: 'var(--muted)',
              background: 'var(--gray)', borderRadius: 4, padding: '1px 6px',
            }}>
              {tag}
            </span>
          )}
          {!isUser && (
            <button onClick={handleSpeak} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 9, color: 'var(--blue)', padding: 0,
              fontFamily: 'var(--font)',
            }}>
              ▶ Speak
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
