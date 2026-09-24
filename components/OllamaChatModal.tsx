'use client';

import React, { useState, useRef, useEffect } from 'react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
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
        'Namaskara! I am your Vatapi AI Heritage & Civic Intelligence Guide, powered locally by DeepSeek-R1 via Ollama. How can I assist you with Bagalkote monuments, civic issue triage, Ooru Oota culinary discovery, or Guledgudda handloom weavers today?',
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
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
        throw new Error(data.error || 'Failed to contact Ollama');
      }

      const assistantMsgId = (Date.now() + 1).toString();
      const newAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: data.text || 'No response returned from DeepSeek.',
        thinking: data.thinking || '',
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
          content: `⚠️ Connection Error: ${err.message || 'Unable to connect to Ollama'}. Please verify that 'ollama run deepseek-r1:1.5b' is active.`,
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
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#89f5e7]/30 text-[#005049] text-[11px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-pulse"></span>
                  DeepSeek-R1 (Local Ollama)
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

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-[#6d7a77]">
                <span className="font-semibold text-[#3d4947]">
                  {msg.role === 'user' ? 'You' : 'DeepSeek AI'}
                </span>
                <span>•</span>
                <span>{msg.timestamp}</span>
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
                          <span className="material-symbols-outlined text-[15px] text-[#00685f]">psychology</span>
                          DeepSeek R1 Reasoning Chain
                        </span>
                        <span className="material-symbols-outlined text-[16px]">
                          {expandedThinking[msg.id] ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>

                      {expandedThinking[msg.id] && (
                        <div className="px-3 py-2.5 font-mono text-[11px] text-[#3d4947] border-t border-[#bcc9c6]/30 bg-white/60 whitespace-pre-wrap leading-relaxed">
                          {msg.thinking}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Final Text Answer */}
                  <div className="p-4 rounded-2xl bg-white border border-[#eae8e5] text-sm text-[#1b1c1a] shadow-sm leading-relaxed whitespace-pre-wrap">
                    {msg.content}
                  </div>
                </div>
              ) : (
                /* User Bubble */
                <div className="max-w-[80%] p-3.5 rounded-2xl bg-[#00685f] text-white text-sm shadow-md leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-white border border-[#eae8e5] shadow-sm text-xs text-[#00685f]">
                <span className="w-3.5 h-3.5 border-2 border-[#00685f] border-t-transparent rounded-full animate-spin"></span>
                <span className="font-medium">DeepSeek-R1 is thinking & synthesizing Bagalkote knowledge...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-6 py-2 bg-[#f5f3f0] border-t border-[#eae8e5] overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {samplePrompts.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(sample.replace(/^[^\s]+\s/, ''))}
                className="px-3 py-1 rounded-full bg-white hover:bg-[#efeeeb] text-[11px] font-medium text-[#3d4947] border border-[#bcc9c6]/40 transition-colors shadow-2xs whitespace-nowrap"
              >
                {sample}
              </button>
            ))}
          </div>
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
              placeholder="Ask DeepSeek anything about Badami heritage, civic triage, or local cuisine..."
              disabled={loading}
              className="flex-1 px-4 py-3 rounded-xl border border-[#bcc9c6] text-sm text-[#1b1c1a] bg-[#fbf9f6] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00685f] disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-5 py-3 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white font-medium text-sm flex items-center gap-1.5 shadow-md transition-all disabled:opacity-50"
            >
              <span>Send</span>
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
          <div className="mt-2 text-center text-[10px] text-[#6d7a77]">
            Running locally on your machine at http://127.0.0.1:11434 • Zero data leakage
          </div>
        </div>
      </div>
    </div>
  );
}
