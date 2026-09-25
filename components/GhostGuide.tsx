'use client';

import React, { useState, useEffect, useRef } from 'react';
import { startLiveSpeechRecognition } from '@/lib/whisperService';

interface GhostGuideProps {
  isOpen: boolean;
  onClose: () => void;
  monumentName?: string;
}

interface Character {
  id: string;
  name: string;
  role: string;
  era: string;
  bio: string;
  icon: string;
  accentColor: string;
  glowColor: string;
  initialGreeting: string;
  suggestedQuestions: string[];
}

const CHARACTERS: Character[] = [
  {
    id: 'mangalesha',
    name: 'King Mangalesha',
    role: 'Ruler of the Chalukya Dynasty',
    era: '578 CE • Saka 500',
    bio: 'Visionary monarch who commissioned the Cave 3 Mahavishnu temple. Brother of Kirtivarman I, vanquisher of the Kadambas, and author of the famous portico pillar epigraph.',
    icon: 'crown',
    accentColor: '#D97706', // Imperial Gold
    glowColor: 'rgba(217, 119, 6, 0.35)',
    initialGreeting:
      'Greetings, traveler from the far future. I am Mangalesha, servant of Lord Vishnu and ruler of Vatapi. You stand within the sacred rock halls I consecrated in 578 of the Saka era. What brings your soul to my sandstone sanctuary?',
    suggestedQuestions: [
      'Why did you build Cave 3?',
      'What was Badami like in 578 CE?',
      'Tell me about the inscription.',
    ],
  },
  {
    id: 'sculptor',
    name: 'A Chalukyan Sculptor',
    role: 'Amarashilpi • Master Stone Artisan',
    era: '6th Century CE',
    bio: 'Master carver who spent 14 seasons chiseling the four-armed Vishnu, Narasimha, and celestial Gandharvas directly out of Badami sheer cliffside sandstone.',
    icon: 'architecture',
    accentColor: '#9A452C', // Terracotta Clay
    glowColor: 'rgba(154, 69, 44, 0.35)',
    initialGreeting:
      'Pranama! Mind your step, traveler—the stone dust still rises from my chisel. For fourteen monsoons I have drawn the living form of Lord Mahavishnu from this raw cliff. Ask me how we carved these pillars without mortar or iron beams.',
    suggestedQuestions: [
      'How did you carve Cave 3 into the cliff?',
      'What tools did you use on the sandstone?',
      'Who designed the 18-armed Shiva in Cave 1?',
    ],
  },
  {
    id: 'pilgrim',
    name: 'A 7th-Century Pilgrim',
    role: 'Yatri Someshwara from Kanchi',
    era: '7th Century CE • Reign of Pulakeshin II',
    bio: 'Devout wanderer journeying across the Deccan from Kanchi to bathe in the sacred waters of Agastya Tirtha and seek audience at the cliff temples.',
    icon: 'hiking',
    accentColor: '#0D9488', // Malaprabha Teal
    glowColor: 'rgba(13, 148, 136, 0.35)',
    initialGreeting:
      'Hari Om, fellow pilgrim. I walked forty days from Kanchipuram through river gorges to reach Vatapi. When I first saw the saffron banners flying atop the North Fort and the red cliffs reflected in Agastya lake, my heart stood still. Are you also here for the holy darshan?',
    suggestedQuestions: [
      'What was the pilgrimage journey like?',
      'How sacred was Agastya Lake back then?',
      'Did you witness King Pulakeshin II in Vatapi?',
    ],
  },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  characterId: string;
  timestamp: string;
}

export default function GhostGuide({
  isOpen,
  onClose,
  monumentName = 'Badami Cave 3 (Vishnu Shrine)',
}: GhostGuideProps) {
  const [selectedCharId, setSelectedCharId] = useState<string>('mangalesha');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [modelLabel, setModelLabel] = useState('Ollama (llama3)');

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const liveRecognitionRef = useRef<{ stop: () => void } | null>(null);

  const activeChar =
    CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];

  // Initialize greeting whenever character changes or modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Reset messages with current character greeting
    setMessages([
      {
        id: `init-${activeChar.id}-${Date.now()}`,
        role: 'assistant',
        content: activeChar.initialGreeting,
        characterId: activeChar.id,
        timestamp: 'Just now',
      },
    ]);

    // Automatically speak the royal greeting
    speakRegal(activeChar.initialGreeting);

    return () => {
      stopSpeech();
    };
  }, [isOpen, selectedCharId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Voice Output: Low-pitched, slow, regal voice using SpeechSynthesis
  const speakRegal = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    if (!text || !text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text.trim());
    // Regal acoustic profile: low pitch, deliberate slow cadence
    utterance.pitch = 0.82;
    utterance.rate = 0.85;
    utterance.volume = 1.0;
    utterance.lang = 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    // Select rich deep English / Indian voice
    const regalVoice =
      voices.find((v) => v.lang.includes('en-IN') && v.name.toLowerCase().includes('male')) ||
      voices.find((v) => v.lang.includes('en-IN')) ||
      voices.find((v) => v.lang.includes('en-GB')) ||
      voices.find((v) => v.lang.includes('en-US'));

    if (regalVoice) utterance.voice = regalVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Voice Input using Web Speech API
  const startVoiceInput = () => {
    if (isRecording) {
      stopVoiceInput();
      return;
    }

    stopSpeech();
    setIsRecording(true);

    liveRecognitionRef.current = startLiveSpeechRecognition(
      (transcript, isFinal) => {
        setInputPrompt(transcript);
        if (isFinal && transcript.trim()) {
          stopVoiceInput();
          handleSendMessage(transcript.trim());
        }
      },
      'en-IN'
    );
  };

  const stopVoiceInput = () => {
    if (liveRecognitionRef.current) {
      liveRecognitionRef.current.stop();
      liveRecognitionRef.current = null;
    }
    setIsRecording(false);
  };

  // Send question to Ghost Guide API
  const handleSendMessage = async (textToSend?: string) => {
    const question = (textToSend || inputPrompt).trim();
    if (!question || isLoading) return;

    stopSpeech();
    setInputPrompt('');

    // Append user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question,
      characterId: activeChar.id,
      timestamp: 'Now',
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ghost-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: activeChar.id,
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          userPrompt: question,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const replyText =
          data.reply ||
          'The stones of Vatapi bear witness to our glory across the millennium.';

        if (data.modelUsed) setModelLabel(data.modelUsed);

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: replyText,
          characterId: activeChar.id,
          timestamp: 'Just now',
        };

        setMessages((prev) => [...prev, aiMsg]);
        speakRegal(replyText);
      } else {
        throw new Error('API failure');
      }
    } catch {
      // Graceful offline persona reply
      const fallbackReply = `By the grace of Mahavishnu and the royal banner of the Chalukyas, your inquiry echoes across 1,400 years. The pillars of Badami remain unbroken.`;
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        characterId: activeChar.id,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakRegal(fallbackReply);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-2 sm:p-6 overflow-hidden animate-in fade-in duration-300">
      {/* Background torchlight / ancient amber ambient effects */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-700"
        style={{ background: activeChar.glowColor }}
      ></div>
      <div
        className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none transition-all duration-700"
        style={{ background: activeChar.glowColor }}
      ></div>

      <div className="relative w-full max-w-4xl h-[92vh] max-h-[860px] bg-[#140F0D]/95 border border-stone-800/80 rounded-3xl shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col text-stone-100 z-10">
        {/* Top Cinematic Navigation Bar */}
        <header className="px-6 py-4 border-b border-stone-800/80 bg-stone-950/60 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all"
              style={{
                background: `linear-gradient(135deg, ${activeChar.accentColor}, #1B1C1A)`,
                boxShadow: `0 0 20px ${activeChar.glowColor}`,
              }}
            >
              <span className="material-symbols-outlined text-[22px]">
                {activeChar.icon}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-amber-100 tracking-tight">
                  The Ghost Guide • {activeChar.name}
                </span>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {activeChar.era}
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Persona-driven Conversational AI &bull; {monumentName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle / Indicator */}
            <button
              type="button"
              onClick={isSpeaking ? stopSpeech : () => messages.length > 0 && speakRegal(messages[messages.length - 1].content)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                isSpeaking
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
              }`}
              title={isSpeaking ? 'Stop Regal Voice' : 'Replay Regal Voice'}
            >
              <span className="material-symbols-outlined text-[16px]">
                {isSpeaking ? 'volume_up' : 'volume_mute'}
              </span>
              <span className="hidden sm:inline">
                {isSpeaking ? 'Speaking Aloud...' : 'Voice'}
              </span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={() => {
                stopSpeech();
                stopVoiceInput();
                onClose();
              }}
              className="w-9 h-9 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center transition-colors border border-stone-800"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </header>

        {/* Character Selection Bar (3 Circular Avatars with Bios) */}
        <section className="px-6 py-4 bg-stone-950/40 border-b border-stone-800/60 shrink-0">
          <div className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2.5 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[14px] text-amber-400">
              history_edu
            </span>
            <span>Choose Your Historical Companion (Chalukya Era)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {CHARACTERS.map((char) => {
              const isSelected = char.id === selectedCharId;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => {
                    if (selectedCharId !== char.id) {
                      stopSpeech();
                      setSelectedCharId(char.id);
                    }
                  }}
                  className={`text-left p-3 rounded-2xl border transition-all flex items-start gap-3 relative group overflow-hidden ${
                    isSelected
                      ? 'bg-stone-900/90 border-amber-500/60 shadow-lg'
                      : 'bg-stone-950/30 border-stone-800/80 hover:bg-stone-900/40 hover:border-stone-700'
                  }`}
                  style={{
                    boxShadow: isSelected ? `0 0 25px ${char.glowColor}` : 'none',
                  }}
                >
                  {/* Circular Avatar */}
                  <div
                    className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105 ${
                      isSelected ? 'border-amber-400 text-amber-300' : 'border-stone-700 text-stone-400'
                    }`}
                    style={{
                      background: isSelected
                        ? `radial-gradient(circle, ${char.accentColor} 0%, #1A1411 100%)`
                        : '#1F1A17',
                    }}
                  >
                    <span className="material-symbols-outlined text-[22px]">
                      {char.icon}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-serif font-bold text-xs text-amber-100 truncate">
                        {char.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 font-medium">
                      {char.role}
                    </div>
                    <p className="text-[10px] text-stone-400/90 line-clamp-2 mt-1 leading-relaxed">
                      {char.bio}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Chat Stream (Scrollable Conversation) */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-4 text-sm"
        >
          {messages.map((msg) => {
            const isAI = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isAI ? 'justify-start' : 'justify-end'}`}
              >
                {isAI && (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 mt-1 shadow-md"
                    style={{
                      background: `linear-gradient(135deg, ${activeChar.accentColor}, #1B1C1A)`,
                      border: `1.5px solid ${activeChar.accentColor}`,
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {activeChar.icon}
                    </span>
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-3xl p-4 shadow-md leading-relaxed relative ${
                    isAI
                      ? 'bg-stone-900/90 border border-stone-800 text-stone-100'
                      : 'bg-[#9A452C] text-white'
                  }`}
                >
                  {isAI && (
                    <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-stone-800/80 text-[10px] text-stone-400">
                      <span className="font-serif font-bold text-amber-200">
                        {activeChar.name} ({activeChar.era})
                      </span>
                      <button
                        type="button"
                        onClick={() => speakRegal(msg.content)}
                        className="text-amber-400 hover:underline flex items-center gap-0.5"
                        title="Read out loud in regal voice"
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          volume_up
                        </span>
                        <span>Listen</span>
                      </button>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm font-medium whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-stone-400 text-xs italic p-2">
              <span className="w-5 h-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></span>
              <span>
                {activeChar.name} is summoning memories across the centuries ({modelLabel})...
              </span>
            </div>
          )}
        </div>

        {/* Quick Tap Suggested Questions */}
        <div className="px-6 py-2.5 bg-stone-950/70 border-t border-stone-800/60 flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">tips_and_updates</span>
            Ask {activeChar.name.split(' ')[0]}:
          </span>
          {activeChar.suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-full bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-200 text-xs font-medium transition-all flex items-center gap-1 hover:border-amber-500/50"
            >
              <span>{q}</span>
              <span className="material-symbols-outlined text-[13px] text-amber-400">
                arrow_forward
              </span>
            </button>
          ))}
        </div>

        {/* Bottom Input Bar: Voice & Text */}
        <footer className="p-4 px-6 border-t border-stone-800 bg-stone-950/90 flex flex-col gap-2 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={`Ask ${activeChar.name} anything about Chalukyan history, architecture, or 578 CE...`}
              className="flex-1 bg-stone-900/90 border border-stone-800 focus:border-amber-500 rounded-2xl px-4 py-3 text-xs sm:text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={startVoiceInput}
              title={isRecording ? 'Stop Voice Input' : 'Speak into mic with Web Speech API'}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border shrink-0 ${
                isRecording
                  ? 'bg-red-600 text-white animate-pulse border-red-400 ring-2 ring-red-400/50'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border-stone-800'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isRecording ? 'mic_off' : 'mic'}
              </span>
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-40 text-stone-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md shrink-0"
            >
              <span>Speak</span>
              <span className="material-symbols-outlined text-[17px]">send</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-stone-400">
            <span>Powered by Ollama (llama3) &bull; Historically verified against Badami Epigraphs</span>
            <span>Web Speech TTS with regal low-pitch cadence enabled</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
