import React, { createContext, useContext, useState, useCallback } from 'react';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'ai', text: "Hi! I'm <b>Mindie</b>, your medicine companion 💊 Ask me anything about your medicines, or just say hello!", source: 'system' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState(null);

  const addUserMessage = useCallback((text) => {
    const msg = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const addAIMessage = useCallback((text, source = 'gemini') => {
    const msg = { id: (Date.now()+1).toString(), role: 'ai', text, source };
    setMessages(prev => [...prev, msg]);
    return msg;
  }, []);

  const clearChat = useCallback(() => {
    setMessages([{ id: 'welcome', role: 'ai', text: 'Hi! I\'m MediAI. Ask me anything about your medicines.', source: 'system' }]);
  }, []);

  return (
    <ChatContext.Provider value={{ messages, isLoading, error, setIsLoading, setError, addUserMessage, addAIMessage, clearChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be inside ChatProvider');
  return ctx;
};
