import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';
import {
  chefAiService,
  ChefAIMessage,
  ChefAIChatResponse,
  RecipeSuggestion,
  FridgeIngredient,
} from '../../services/chefAiService';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

interface ChefAiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'chat' | 'fridge';

export const ChefAiDrawer: React.FC<ChefAiDrawerProps> = ({ isOpen, onClose }) => {
  const { t, i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  // Voice Recognition Hook
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    hasSupport: hasVoiceSupport,
    permissionError,
  } = useVoiceRecognition();

  // Read Aloud State (Persisted)
  const [isReadAloud, setIsReadAloud] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chef_ai_read_aloud') === 'true';
    }
    return false;
  });

  // States
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  
  // Chat States
  const [messages, setMessages] = useState<ChefAIMessage[]>([
    {
      role: 'assistant',
      content: t('chefai.welcome', 'Hello! I am your AI Chef Assistant. Ask me about recipe substitutions, cooking safety, or culinary tips!'),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chef_ai_session_id') || undefined;
    }
    return undefined;
  });

  // Sync voice transcript to input message
  useEffect(() => {
    if (isListening && transcript) {
      setInputMessage(transcript);
    }
  }, [transcript, isListening]);

  // Clean up speech synthesis when drawer closes or read aloud is disabled
  useEffect(() => {
    if ((!isOpen || !isReadAloud) && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen, isReadAloud]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Persist read aloud preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chef_ai_read_aloud', String(isReadAloud));
    }
  }, [isReadAloud]);

  // Helper to read text aloud
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();

    // Remove markdown symbols for clean speech
    const cleanText = text
      .replace(/\*\*/g, '')
      .replace(/_/g, '')
      .replace(/[*#-]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = i18n.language || 'en-US';
    window.speechSynthesis.speak(utterance);
  };
  
  // Feedback states (messageIndex -> 'up' | 'down')
  const [feedback, setFeedback] = useState<Record<number, 'up' | 'down'>>({});

  // Flagged messages state (messageIndex -> boolean)
  const [flaggedMessages, setFlaggedMessages] = useState<Record<number, boolean>>({});

  const handleFlagResponse = (index: number, content: string) => {
    console.warn(`[Halal / Content Compliance Flagged] Message Index: ${index}. Content: "${content}"`);
    setFlaggedMessages((prev) => ({ ...prev, [index]: true }));
    alert(t('chefai.flag.success', 'Thank you. This response has been flagged for compliance review.'));
  };

  // Fridge Logic States
  const [fridgeIngredients, setFridgeIngredients] = useState<FridgeIngredient[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chef_ai_fridge_ingredients');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [newIngredient, setNewIngredient] = useState('');
  const [recipeSuggestions, setRecipeSuggestions] = useState<RecipeSuggestion[]>([]);
  const [isFridgeLoading, setIsFridgeLoading] = useState(false);

  // Refs
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Persist fridge ingredients to local storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chef_ai_fridge_ingredients', JSON.stringify(fridgeIngredients));
    }
  }, [fridgeIngredients]);

  // Trigger recipe search if inventory changes
  useEffect(() => {
    if (fridgeIngredients.length > 0 && activeTab === 'fridge') {
      fetchFridgeSuggestions();
    } else {
      setRecipeSuggestions([]);
    }
  }, [fridgeIngredients, activeTab]);

  // Send message API Call
  const handleSendMessage = async (textToSend?: string) => {
    const messageText = textToSend || inputMessage;
    if (!messageText.trim() || isLoading) return;

    if (!textToSend) {
      setInputMessage('');
    }

    const newUserMessage: ChefAIMessage = {
      role: 'user',
      content: messageText,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await chefAiService.sendMessage({
        session_id: sessionId,
        message: messageText,
        dietary_restrictions: ['halal'],
        conversation_history: messages.slice(1), // Exclude welcome message
      });

      if (response.session_id) {
        setSessionId(response.session_id);
        if (typeof window !== 'undefined') {
          localStorage.setItem('chef_ai_session_id', response.session_id);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.reply,
          timestamp: new Date().toISOString(),
          // Embed citation information directly inside the message object for rendering
          citations: response.citations,
        } as any,
      ]);

      if (isReadAloud) {
        speakText(response.reply);
      }
    } catch (error) {
      console.error('Chef AI Chat Error:', error);
      const errorMessage = t('chefai.error', 'Sorry, I am having trouble processing your query right now. Please try again!');
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errorMessage,
        },
      ]);
      if (isReadAloud) {
        speakText(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add ingredient to fridge inventory
  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngredient.trim()) return;

    const exists = fridgeIngredients.some(
      (ing) => ing.name.toLowerCase() === newIngredient.toLowerCase().trim()
    );

    if (!exists) {
      setFridgeIngredients((prev) => [...prev, { name: newIngredient.trim().toLowerCase() }]);
    }
    setNewIngredient('');
  };

  // Remove ingredient from fridge inventory
  const handleRemoveIngredient = (index: number) => {
    setFridgeIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  // Fetch recipe suggestions from fridge logic
  const fetchFridgeSuggestions = async () => {
    if (fridgeIngredients.length === 0) return;
    setIsFridgeLoading(true);
    try {
      const res = await chefAiService.getFridgeSuggestions({
        available_ingredients: fridgeIngredients,
        dietary_restrictions: ['halal'],
        max_results: 5,
      });
      setRecipeSuggestions(res.suggestions);
    } catch (err) {
      console.error('Fridge Logic Error:', err);
    } finally {
      setIsFridgeLoading(false);
    }
  };

  // Safe markdown style text formatter
  const formatReply = (text: string) => {
    if (!text) return '';
    return text.split('\n').map((line, idx) => {
      // Bold patterns **text**
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const content = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="text-violet-300 font-semibold">
              {part.slice(2, -2)}
            </strong>
          );
        }
        
        // Italic patterns _text_
        const subParts = part.split(/(_[^_]+_)/g);
        return subParts.map((subPart, sIdx) => {
          if (subPart.startsWith('_') && subPart.endsWith('_')) {
            return (
              <em key={sIdx} className="text-slate-300 italic">
                {subPart.slice(1, -1)}
              </em>
            );
          }
          return subPart;
        });
      });

      return (
        <div key={idx} className="min-h-[1.25rem] mb-1">
          {content}
        </div>
      );
    });
  };

  // Helper to trigger navigation using locale-friendly URL
  const handleRecipeClick = (recipeId: string) => {
    if (typeof window === 'undefined') return;
    const currentLocale = i18n.language === 'en' ? '' : `/${i18n.language}`;
    window.location.href = `${currentLocale}/recipes/${recipeId}`;
  };

  return (
    <div
      className={`
        fixed
        top-0
        bottom-0
        ${isRtl ? 'left-0 border-r' : 'right-0 border-l'}
        z-40
        w-[440px]
        max-w-full
        bg-slate-950/98
        backdrop-blur-md
        text-slate-100
        border-slate-800/80
        shadow-2xl
        transition-transform
        duration-300
        ease-out
        ${isOpen ? 'translate-x-0' : isRtl ? '-translate-x-full' : 'translate-x-full'}
        flex
        flex-col
        font-sans
      `}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            AI
          </div>
          <div>
            <h2 className="text-base font-semibold leading-none">{t('chefai.title', 'Chef AI Assistant')}</h2>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t('chefai.status', 'Halal Guard Active')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Read Aloud Toggle Button */}
          <button
            type="button"
            onClick={() => setIsReadAloud(!isReadAloud)}
            className={`p-1.5 rounded-lg transition-colors ${
              isReadAloud
                ? 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30'
                : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
            title={isReadAloud ? t('chefai.voice.read_aloud_disable', 'Disable Read Aloud') : t('chefai.voice.read_aloud_enable', 'Enable Read Aloud')}
            aria-label="Toggle Read Aloud"
          >
            {isReadAloud ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25M12 18.75V5.25L7.75 9.5H4.5v5h3.25L12 18.75z" />
              </svg>
            )}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Close panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 bg-slate-900/40 p-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`
            flex-1
            py-2
            text-sm
            font-medium
            rounded-md
            transition-all
            ${activeTab === 'chat'
              ? 'bg-slate-800 text-violet-300 shadow-sm border border-slate-700/50'
              : 'text-slate-400 hover:text-slate-200'
            }
          `}
        >
          💬 {t('chefai.tabs.chat', 'Culinary Chat')}
        </button>
        <button
          onClick={() => setActiveTab('fridge')}
          className={`
            flex-1
            py-2
            text-sm
            font-medium
            rounded-md
            transition-all
            ${activeTab === 'fridge'
              ? 'bg-slate-800 text-violet-300 shadow-sm border border-slate-700/50'
              : 'text-slate-400 hover:text-slate-200'
            }
          `}
        >
          🍳 {t('chefai.tabs.fridge', 'Fridge Scanner')}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-4">
        {activeTab === 'chat' ? (
          <>
            {/* Conversation Messages */}
            <div className="flex-1 flex flex-col space-y-4 overflow-y-auto pr-1">
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={index}
                    className={`flex flex-col max-w-[85%] ${
                      isUser ? 'self-end' : 'self-start'
                    }`}
                  >
                    <div
                      className={`
                        rounded-2xl
                        px-4
                        py-3
                        text-sm
                        leading-relaxed
                        border
                        shadow-sm
                        ${
                          isUser
                            ? 'bg-indigo-600/20 text-indigo-100 border-indigo-500/20 rounded-tr-none'
                            : 'bg-slate-900/60 text-slate-100 border-slate-800/80 rounded-tl-none'
                        }
                      `}
                    >
                      {isUser ? msg.content : formatReply(msg.content)}

                      {/* Display Badged Citations */}
                      {!isUser && (msg as any).citations && (msg as any).citations.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-800 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                            🛡️ {t('chefai.citations', 'Citations')}:
                          </span>
                          {(msg as any).citations.map((cite: any, cIdx: number) => (
                            <a
                              key={cIdx}
                              href={cite.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-950/40 hover:bg-indigo-950 border border-indigo-900/30 rounded-full px-2.5 py-0.5 inline-flex items-center transition-colors"
                            >
                              {cite.text}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Interactive Feedback Buttons (For AI Responses) */}
                    {!isUser && index > 0 && (
                      <div className="flex items-center gap-2 mt-1 px-1 self-start">
                        <button
                          onClick={() => setFeedback((prev) => ({ ...prev, [index]: 'up' }))}
                          aria-label="Thumbs up"
                          className={`
                            p-1
                            rounded
                            hover:bg-slate-800
                            transition-colors
                            ${feedback[index] === 'up' ? 'text-emerald-400' : 'text-slate-500'}
                          `}
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M2 10.5a1.5 1.5 0 011.5-1.5h3a1.5 1.5 0 011.5 1.5v9A1.5 1.5 0 016.5 21h-3A1.5 1.5 0 012 19.5v-9zM20 10a3 3 0 00-3-3h-4.5l.75-2.25c.18-.54-.09-1.14-.6-1.35-.51-.21-1.11.03-1.32.54l-2.08 4.96V19c1.67 0 3.2-.8 4.15-2.1L19 11.2a3 3 0 001-1.2V10z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setFeedback((prev) => ({ ...prev, [index]: 'down' }))}
                          aria-label="Thumbs down"
                          className={`
                            p-1
                            rounded
                            hover:bg-slate-800
                            transition-colors
                            ${feedback[index] === 'down' ? 'text-rose-400' : 'text-slate-500'}
                          `}
                        >
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M22 13.5a1.5 1.5 0 01-1.5 1.5h-3a1.5 1.5 0 01-1.5-1.5v-9A1.5 1.5 0 0117.5 3h3A1.5 1.5 0 0122 4.5v9zM4 14a3 3 0 003 3h4.5l-.75 2.25c-.18.54.09 1.14.6 1.35.51.21 1.11-.03 1.32-.54l2.08-4.96V5c-1.67 0-3.2.8-4.15 2.1L5 12.8a3 3 0 00-1 1.2V14z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleFlagResponse(index, msg.content)}
                          aria-label="Flag response"
                          title="Report inappropriate or non-Halal response"
                          className={`
                            p-1
                            rounded
                            hover:bg-slate-800
                            transition-colors
                            ${flaggedMessages[index] ? 'text-amber-500 hover:text-amber-400' : 'text-slate-500 hover:text-amber-500'}
                          `}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a4.859 4.859 0 003.413-3.413V8.04A4.857 4.857 0 0019 3.536l-3.136.738a9 9 0 01-6.208-.682l-.108-.054A9 9 0 003.462 2.83L3 3z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing Loader animation */}
              {isLoading && (
                <div className="self-start bg-slate-900/60 text-slate-400 border border-slate-800/80 rounded-2xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messageEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              <button
                onClick={() => handleSendMessage(t('chefai.chips.substitute', 'What can I substitute for buttermilk?'))}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-full px-3 py-1.5 transition-all active:scale-95"
              >
                🥛 {t('chefai.chips.substitute_short', 'Substitute Buttermilk')}
              </button>
              <button
                onClick={() => handleSendMessage(t('chefai.chips.sake', 'Substitute for sake wine?'))}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-full px-3 py-1.5 transition-all active:scale-95"
              >
                🍶 {t('chefai.chips.sake_short', 'Halal Sake Substitute')}
              </button>
            </div>

            {/* Chat Input form */}
            <div className="mt-auto border-t border-slate-900 pt-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex flex-col gap-2"
              >
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t('chefai.input_placeholder', 'Ask about substitutions...')}
                    disabled={isLoading}
                    dir="auto"
                    className="flex-1 bg-slate-900 text-slate-200 placeholder-slate-500 text-sm border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-all disabled:opacity-50"
                  />

                  {/* Microphone Button */}
                  {hasVoiceSupport && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (isListening) {
                          stopListening();
                        } else {
                          startListening();
                        }
                      }}
                      disabled={isLoading}
                      className={`px-3.5 rounded-xl border flex items-center justify-center transition-all duration-200 ${
                        isListening
                          ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                      }`}
                      title={isListening ? t('chefai.voice.mic_stop', 'Stop Listening') : t('chefai.voice.mic_start', 'Start Listening')}
                      aria-label="Toggle voice input"
                    >
                      {isListening ? (
                        <span className="relative flex h-4 w-4 items-center justify-center">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 flex items-center justify-center">
                            <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M6 19h12v2H6z" />
                            </svg>
                          </span>
                        </span>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
                        </svg>
                      )}
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium text-sm transition-colors duration-200 disabled:opacity-40 flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 transform rotate-90" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </div>
                {permissionError && (
                  <span className="text-xs text-rose-400 px-1 font-medium transition-all">
                    ⚠️ {permissionError}
                  </span>
                )}
              </form>
            </div>
          </>
        ) : (
          /* Fridge Inventory Tab */
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto">
            <p className="text-xs text-slate-400 leading-normal">
              {t('chefai.fridge_description', 'Add the ingredients you currently have. We will search active recipes in the database and rank matches without any non-Halal items.')}
            </p>

            {/* Form to add inventory */}
            <form onSubmit={handleAddIngredient} className="flex gap-2">
              <input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder={t('chefai.add_ingredient_placeholder', 'e.g. chicken, onion')}
                dir="auto"
                className="flex-1 bg-slate-900 text-slate-200 placeholder-slate-500 text-sm border border-slate-800 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 focus:outline-none transition-all"
              />
              <button
                type="submit"
                className="px-4 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-700/30 text-white rounded-xl font-semibold text-sm transition-all"
              >
                +
              </button>
            </form>

            {/* Inventory Tag Chips */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/30 rounded-xl border border-slate-900 min-h-[60px]">
              {fridgeIngredients.length === 0 ? (
                <span className="text-xs text-slate-600 m-auto">
                  {t('chefai.no_ingredients', 'Fridge is empty')}
                </span>
              ) : (
                fridgeIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded-full text-xs font-medium"
                  >
                    {ing.name}
                    <button
                      type="button"
                      onClick={() => handleRemoveIngredient(idx)}
                      className="text-slate-500 hover:text-rose-400 font-bold ml-1.5 focus:outline-none transition-colors"
                      aria-label={`Remove ${ing.name}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Clear all helper */}
            {fridgeIngredients.length > 0 && (
              <button
                type="button"
                onClick={() => setFridgeIngredients([])}
                className="text-xs text-rose-400/80 hover:text-rose-400 font-medium self-end transition-colors"
              >
                🗑️ {t('chefai.clear_fridge', 'Clear All')}
              </button>
            )}

            {/* Ranked Recipe Matches suggestions list */}
            <div className="flex-1 flex flex-col space-y-3 overflow-y-auto">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-900 pb-1.5">
                🎯 {t('chefai.matching_recipes', 'Matching Recipes')}
              </h3>

              {isFridgeLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500" />
                  <p className="mt-2 text-xs text-slate-500">{t('chefai.matching_recipes_loading', 'Evaluating Jaccard scores...')}</p>
                </div>
              ) : fridgeIngredients.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">
                  {t('chefai.no_ingredients_prompt', 'Add items above to view recipe matches.')}
                </p>
              ) : recipeSuggestions.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6">
                  {t('chefai.no_suggestions', 'No recipes found with these ingredients.')}
                </p>
              ) : (
                <div className="space-y-3">
                  {recipeSuggestions.map((recipe) => (
                    <div
                      key={recipe.recipe_id}
                      onClick={() => handleRecipeClick(recipe.recipe_id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRecipeClick(recipe.recipe_id);
                        }
                      }}
                      tabIndex={0}
                      className="group p-3 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 rounded-xl cursor-pointer transition-all duration-200 hover:translate-x-0.5 flex flex-col space-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="text-sm font-medium text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {recipe.name}
                        </h4>
                        <span className="text-[10px] font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md">
                          {Math.round(recipe.match_score * 100)}% Match
                        </span>
                      </div>

                      <div className="flex gap-2 text-[11px] text-slate-400">
                        <span>🌍 {recipe.origin_country}</span>
                        <span>•</span>
                        <span>⚡ {recipe.difficulty}</span>
                      </div>

                      {/* Overlap inventory checklist rendering */}
                      <div className="text-[11px] space-y-1 pt-1 border-t border-slate-950">
                        <div>
                          <span className="text-emerald-400 font-medium">✓ Have: </span>
                          <span className="text-slate-300">{recipe.matched_ingredients.join(', ')}</span>
                        </div>
                        {recipe.missing_ingredients.length > 0 && (
                          <div>
                            <span className="text-slate-500 font-medium">✗ Need: </span>
                            <span className="text-slate-400">{recipe.missing_ingredients.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefAiDrawer;
