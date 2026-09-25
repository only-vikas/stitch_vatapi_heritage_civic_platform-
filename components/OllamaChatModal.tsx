'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  provider?: string;
  providerLabel?: string;
  timestamp: string;
}

interface OllamaChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPrompt?: string;
}

export default function OllamaChatModal({ isOpen, onClose, defaultPrompt }: OllamaChatModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Namaskara! I am your Vatapi AI Heritage & Civic Intelligence Guide. I support dual AI engines: Local Ollama (DeepSeek-R1) and OpenRouter AI Cloud Fallback for 100% cloud reliability on Render. How can I assist you with Bagalkote monuments, civic issue triage, Ooru Oota culinary discovery, or Guledgudda handloom weavers today?',
      provider: 'openrouter',
      providerLabel: '☁️ OpenRouter & Ollama Ready',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);
  const [activeProviderLabel, setActiveProviderLabel] = useState<string | null>(null);
  const [expandedThinking, setExpandedThinking] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (defaultPrompt && isOpen) {
      setInput(defaultPrompt);
    }
  }, [defaultPrompt, isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleThinking = (id: string) => {
    setExpandedThinking((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSend = async (textToSend?: string) => {
    const promptText = textToSend || input;
    if (!promptText.trim() || loading) return;

    const userMsgId = Date.now().toString();
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: promptText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      // Prepare conversation history
      const history = [...messages, newUserMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, messages: history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to contact AI service');
      }

      setActiveProvider(data.provider || 'openrouter');
      setActiveProviderLabel(data.providerLabel || '☁️ OpenRouter AI Cloud Active');

      const assistantMsgId = (Date.now() + 1).toString();
      const newAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: data.text || 'No response returned from AI.',
        thinking: data.thinking || '',
        provider: data.provider,
        providerLabel: data.providerLabel,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, newAssistantMsg]);
      // Auto expand thinking if present
      if (data.thinking) {
        setExpandedThinking((prev) => ({ ...prev, [assistantMsgId]: true }));
      }
    } catch (err: any) {
      const errorMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [
        ...prev,
        {
          id: errorMsgId,
          role: 'assistant',
          content: `⚠️ Note: ${err.message || 'Connecting to fallback...'}. Running on Vatapi offline heritage intelligence.`,
          provider: 'offline',
          providerLabel: '💾 Vatapi Offline Heritage Grid',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    '🏛️ Analyze weathering risks on Badami Cave 3 sandstone columns',
    '🍲 Recommend authentic Jolada Rotti Khanavalis near Agastya Lake',
    '🧵 Explain the GI-certified Guledgudda Khana handloom weave',
    '📋 Draft an urgent preservation triage report for ASI Dharwad',
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#fbf9f6] rounded-2xl shadow-2xl border border-[#eae8e5] flex flex-col h-[85vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-white border-b border-[#eae8e5] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00685f] to-[#008378] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-2xl">neurology</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-[#1b1c1a]">Vatapi AI Intelligence</h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#89f5e7]/30 text-[#005049] text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-pulse"></span>
                  Dual AI: Ollama + OpenRouter
                </span>
              </div>
              <p className="text-xs text-[#6d7a77]">Bagalkote Heritage & Civic Triage Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMessages([
                  {
                    id: 'welcome',
                    role: 'assistant',
                    content: 'Chat cleared. How can I help you explore or preserve Bagalkote?',
                    timestamp: 'Just now',
                  },
                ]);
              }}
              title="Clear chat"
              className="p-2 rounded-lg text-[#6d7a77] hover:text-[#1b1c1a] hover:bg-[#efeeeb] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#6d7a77] hover:text-[#1b1c1a] hover:bg-[#efeeeb] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* Live Model Status Bar */}
        <div className="px-6 py-2 bg-[#f4f1ed] border-b border-[#eae8e5] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#5c6764]">Active AI Status:</span>
            {loading ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-medium text-[11px] animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                Querying Ollama (Local) ... auto-failover to OpenRouter Cloud
              </span>
            ) : activeProviderLabel ? (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                  activeProvider === 'ollama'
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : activeProvider === 'openrouter'
                    ? 'bg-sky-100 text-sky-900 border-sky-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {activeProviderLabel}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200 font-medium text-[11px]">
                ⚡ Ollama DeepSeek-R1 (Local) • ☁️ OpenRouter (Cloud Active)
              </span>
            )}
          </div>
          <span className="font-mono text-[10px] text-[#6d7a77] hidden sm:inline">
            Render Cloud Compatible
          </span>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-[#6d7a77]">
                <span className="font-semibold text-[#3d4947]">
                  {msg.role === 'user' ? 'You' : 'Vatapi AI'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
                {msg.providerLabel && (
                  <>
                    <span>•</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        msg.provider === 'ollama'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : msg.provider === 'openrouter'
                          ? 'bg-sky-50 text-sky-700 border border-sky-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {msg.providerLabel}
                    </span>
                  </>
                )}
              </div>

              {/* Assistant Message with Thinking Accordion */}
              {msg.role === 'assistant' ? (
                <div className="max-w-[85%] space-y-2">
                  {/* Thinking Section */}
                  {msg.thinking && (
                    <div className="rounded-xl border border-[#bcc9c6]/50 bg-[#efeeeb]/70 text-xs overflow-hidden">
                      <button
                        type="button"
                        onClick={() => toggleThinking(msg.id)}
                        className="w-full px-3 py-2 flex items-center justify-between font-mono text-[11px] text-[#3d4947] hover:bg-[#eae8e5] transition-colors"
                      >
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="material-symbols-outlined text-[15px] text-[#00685f]">
                            psychology
                          </span>
                          Chain of Thought Reasoning ({msg.thinking.length} chars)
                        </span>
                        <span className="material-symbols-outlined text-[16px]">
                          {expandedThinking[msg.id] ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>
                      {expandedThinking[msg.id] && (
                        <div className="p-3 font-mono text-[11px] text-[#3d4947] border-t border-[#bcc9c6]/30 bg-white/60 whitespace-pre-wrap leading-relaxed">
                          {msg.thinking}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Answer Bubble */}
                  <div className="p-4 bg-white rounded-2xl rounded-tl-sm border border-[#eae8e5] text-sm text-[#1b1c1a] leading-relaxed shadow-sm whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* User Message Bubble */
                <div className="max-w-[80%] p-4 bg-[#00685f] text-white rounded-2xl rounded-tr-sm text-sm leading-relaxed shadow-sm">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center gap-1.5 px-1 text-[11px] text-[#6d7a77]">
                <span className="font-semibold text-[#00685f]">Vatapi AI Thinking</span>
                <span>•</span>
                <span>Dual Engine Active</span>
              </div>
              <div className="p-4 bg-white rounded-2xl rounded-tl-sm border border-[#eae8e5] shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce"></span>
                <span
                  className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-[#00685f] animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></span>
                <span className="text-xs text-[#6d7a77] ml-2">
                  Evaluating with Ollama & OpenRouter...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Prompt Pills */}
        <div className="px-6 py-2 bg-white/80 border-t border-[#eae8e5] flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
          <span className="text-[11px] font-semibold text-[#6d7a77] shrink-0">Suggestions:</span>
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSend(p.replace(/^[^\s]+\s/, ''))}
              disabled={loading}
              className="px-3 py-1 bg-[#efeeeb] hover:bg-[#00685f]/10 hover:text-[#00685f] text-[#3d4947] text-xs rounded-full whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-[#eae8e5] shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Badami temples, cave art, weavers, or preservation reports..."
              disabled={loading}
              className="flex-1 px-4 py-3 bg-[#fbf9f6] border border-[#bcc9c6] rounded-xl text-sm text-[#1b1c1a] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00685f] transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 bg-[#00685f] hover:bg-[#008378] text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50 shrink-0"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
