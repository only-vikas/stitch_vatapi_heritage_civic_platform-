'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { readOutLoud, stopReadingOutLoud, startLiveSpeechRecognition } from '@/lib/whisperService';

interface Character {
  id: string;
  name: string;
  role: string;
  era: string;
  bio: string;
  icon: string;
  accentColor: string;
  glowColor: string;
  avatarBg: string;
  avatarUrl: string;
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
    accentColor: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.35)',
    avatarBg: 'from-amber-600 to-amber-900',
    avatarUrl: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=300&q=80',
    initialGreeting:
      'Greetings, traveler from the far future. I am Mangalesha, servant of Lord Vishnu and ruler of Vatapi. You stand within the sacred rock halls I consecrated in 578 of the Saka era. What brings your soul to my sandstone sanctuary?',
    suggestedQuestions: [
      'Why did you build Cave 3?',
      'What was Badami like in 578 CE?',
      'Tell me about the inscription on the pillar.',
      'How did you defeat the Kadambas?',
    ],
  },
  {
    id: 'sculptor',
    name: 'Amarashilpi Master Sculptor',
    role: 'Chief Artisan of the Rock Shrines',
    era: '6th Century CE',
    bio: 'Master carver who spent 14 seasons chiseling the four-armed Vishnu, Narasimha, and celestial Gandharvas directly out of Badami sheer cliffside sandstone without mortar or iron.',
    icon: 'architecture',
    accentColor: '#9A452C',
    glowColor: 'rgba(154, 69, 44, 0.35)',
    avatarBg: 'from-rose-700 to-amber-950',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    initialGreeting:
      'Pranama! Mind your step, traveler—the stone dust still rises from my chisel. For fourteen monsoons I have drawn the living form of Lord Mahavishnu from this raw cliff. Ask me how we carved these pillars without mortar or iron beams.',
    suggestedQuestions: [
      'How did you carve Cave 3 into the cliff?',
      'What tools did you use on the sandstone?',
      'Who designed the 18-armed Shiva in Cave 1?',
      'How did you keep the ceilings from collapsing?',
    ],
  },
  {
    id: 'pilgrim',
    name: 'Yatri Someshwara',
    role: '7th-Century Pilgrim from Kanchi',
    era: '7th Century CE • Reign of Pulakeshin II',
    bio: 'Devout wanderer journeying across the Deccan from Kanchi to bathe in the sacred waters of Agastya Tirtha and seek audience at the cliff temples.',
    icon: 'hiking',
    accentColor: '#00685F',
    glowColor: 'rgba(0, 104, 95, 0.35)',
    avatarBg: 'from-teal-700 to-emerald-950',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    initialGreeting:
      'Hari Om, fellow pilgrim. I walked forty days from Kanchipuram through river gorges to reach Vatapi. When I first saw the saffron banners flying atop the North Fort and the red cliffs reflected in Agastya lake, my heart stood still. Are you also here for the holy darshan?',
    suggestedQuestions: [
      'What was the pilgrimage journey like?',
      'How sacred was Agastya Lake back then?',
      'Did you witness King Pulakeshin II in Vatapi?',
      'What food did you eat on the trail?',
    ],
  },
  {
    id: 'queen',
    name: 'Queen Lokamahadevi',
    role: 'Chief Queen of Vikramaditya II',
    era: '8th Century CE • 740 CE',
    bio: 'Patron of world-renowned temple architecture who commissioned the Lokeshwara (Virupaksha) Temple at Pattadakal to commemorate the victory over the Pallavas of Kanchipuram.',
    icon: 'diamond',
    accentColor: '#B45309',
    glowColor: 'rgba(180, 83, 9, 0.35)',
    avatarBg: 'from-amber-700 to-purple-950',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    initialGreeting:
      'Welcome, honored guest. I am Lokamahadevi, Mahadevi of the victorious Chalukya realm. At Pattadakal on the holy northern bend of Malaprabha, we raised towering stone sanctums that shall outlast mortal kingdoms. What truth do you seek from our royal court?',
    suggestedQuestions: [
      'Why did you build the Virupaksha Temple at Pattadakal?',
      'Who were the master architects Gunda and Sarvasiddhi?',
      'What was the significance of the northern river bend?',
      'Tell me about the victory over Kanchipuram.',
    ],
  },
];

const MONUMENTS = [
  { id: 'cave3', name: 'Badami Cave 3 (Vishnu Shrine)', period: '578 CE', type: 'Rock-Cut Cave' },
  { id: 'virupaksha', name: 'Pattadakal Virupaksha Complex', period: '740 CE', type: 'Dravidian Structural Temple' },
  { id: 'durga', name: 'Aihole Durga Temple', period: '7th–8th Century', type: 'Apsidal Sun Sanctuary' },
  { id: 'bhutanatha', name: 'Bhutanatha Lake Temple', period: '7th Century', type: 'Lakeside Sandstone Complex' },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  characterId: string;
  timestamp: string;
}

export default function GhostGuidePage() {
  const [selectedCharId, setSelectedCharId] = useState<string>('mangalesha');
  const [selectedMonument, setSelectedMonument] = useState<string>(MONUMENTS[0].name);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [modelLabel, setModelLabel] = useState('Ollama (llama3) / OpenRouter Fallback');

  const chatScrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const activeChar = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];

  // Initialize greeting on character switch
  useEffect(() => {
    setMessages([
      {
        id: `greeting-${activeChar.id}-${Date.now()}`,
        role: 'assistant',
        content: activeChar.initialGreeting,
        characterId: activeChar.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    stopReadingOutLoud();
    setIsSpeaking(false);
  }, [selectedCharId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Read message out loud
  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopReadingOutLoud();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    readOutLoud(text, {
      lang: 'en-IN',
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  // Toggle voice recognition
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
      setIsRecording(false);
    } else {
      setIsRecording(true);
      recognitionRef.current = startLiveSpeechRecognition((transcript) => {
        setInputPrompt(transcript);
      });
    }
  };

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      characterId: activeChar.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/ghost-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterId: activeChar.id,
          userMessage: text,
          monumentName: selectedMonument,
          history,
        }),
      });

      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      if (data.modelUsed) setModelLabel(data.modelUsed);

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.reply || "I am unable to answer from the annals of time at this moment.",
        characterId: activeChar.id,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Auto-read aloud in character voice
      handleSpeak(assistantMsg.content);
    } catch {
      // Local historical fallback response
      let fallbackText = '';
      if (activeChar.id === 'mangalesha') {
        fallbackText = `By the decree of the Saka year 500, we consecrated this magnificent cave to Mahavishnu. Even as monsoons fade, the memory of our sandstone citadel shall withstand eternity. Ask on, traveler.`;
      } else if (activeChar.id === 'sculptor') {
        fallbackText = `We chiseled the stone with tempered iron wedges and diorite mallets. No mortar bounds these stones; every column was birthed from the living red cliff of Vatapi.`;
      } else if (activeChar.id === 'queen') {
        fallbackText = `At Pattadakal, on the holy northern curve of Malaprabha, we brought together the grandest master carvers of the South to glorify our gods and commemorate sacred victory.`;
      } else {
        fallbackText = `I walked the mountain passes from the south. The temple bells echoed across Agastya Lake as the setting sun painted the cliff faces in royal saffron.`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `fallback-${Date.now()}`,
          role: 'assistant',
          content: fallbackText,
          characterId: activeChar.id,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      handleSpeak(fallbackText);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#130E0C] text-[#FAF8F5] flex flex-col font-sans selection:bg-[#9A452C] selection:text-white">
      {/* Top Navbar */}
      <Navbar activeSection="ghost-guide" />

      {/* Main Container */}
      <main className="flex-1 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col gap-6">
        {/* Hero Header Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#201511] via-[#2A1B16] to-[#1B1412] border border-[#3E2820] p-6 lg:p-8 shadow-2xl">
          <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-[#D97706]/10 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-72 h-72 rounded-full bg-[#00685F]/15 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D97706]/20 text-[#F59E0B] border border-[#D97706]/30 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px]">record_voice_over</span>
                  Conversational AI Historical Figures
                </span>
                <span className="text-xs text-stone-400 font-mono hidden sm:inline">
                  Deccan 6th–8th Century Lore
                </span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
                The Ghost Guide <span className="text-[#D97706]">Chamber</span>
              </h1>
              <p className="text-sm sm:text-base text-stone-300 max-w-2xl leading-relaxed">
                Step beyond static monument plaques. Speak directly with the emperors, master sculptors, royal queens, and pilgrims who built the Chalukyan empire—powered by neural conversational models and authentic historical epigraphy.
              </p>
            </div>

            {/* Monument Scene Selector */}
            <div className="bg-[#1A110E]/90 p-4 rounded-2xl border border-[#3E2820] flex flex-col gap-2 shrink-0 w-full sm:w-auto">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#D97706]">temple_hindu</span>
                Sacred Monument Context
              </span>
              <select
                value={selectedMonument}
                onChange={(e) => setSelectedMonument(e.target.value)}
                className="bg-[#241713] text-stone-100 text-xs sm:text-sm font-medium px-3.5 py-2.5 rounded-xl border border-[#4D3227] focus:outline-none focus:ring-2 focus:ring-[#D97706] cursor-pointer"
              >
                {MONUMENTS.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name} ({m.period})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Character Selector Grid */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {CHARACTERS.map((char) => {
              const isSelected = selectedCharId === char.id;
              return (
                <button
                  key={char.id}
                  type="button"
                  onClick={() => setSelectedCharId(char.id)}
                  className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#2E1D18] to-[#1E130F] border-[#D97706] shadow-lg ring-1 ring-[#D97706]'
                      : 'bg-[#1A120F]/80 hover:bg-[#251915] border-[#36231C]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl bg-gradient-to-tr ${char.avatarBg} flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <span className="material-symbols-outlined text-xl text-white">
                        {char.icon}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="font-serif font-bold text-sm text-stone-100 truncate">
                        {char.name}
                      </h2>
                      <p className="text-[11px] font-medium text-stone-400 truncate">
                        {char.role}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-stone-400">
                    <span className="font-mono">{char.era}</span>
                    <span
                      className={`font-semibold flex items-center gap-0.5 ${
                        isSelected ? 'text-[#F59E0B]' : 'text-stone-500'
                      }`}
                    >
                      {isSelected ? 'Active Guide' : 'Select'}
                      <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Chamber Grid: Chat Core (Left/Center) + Historical Archives (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Chat Interface Column */}
          <section className="lg:col-span-8 flex flex-col bg-[#1A120F] border border-[#3A261F] rounded-3xl overflow-hidden shadow-2xl h-[680px]">
            {/* Active Character Top Bar */}
            <div className="p-4 sm:px-6 bg-[#231713] border-b border-[#3A261F] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${activeChar.avatarBg} flex items-center justify-center text-white shrink-0 shadow-md`}
                >
                  <span className="material-symbols-outlined text-lg">{activeChar.icon}</span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-white truncate">
                      {activeChar.name}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 hidden sm:inline">
                      {activeChar.era}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 truncate">{activeChar.bio}</p>
                </div>
              </div>

              {/* Read Aloud Controller */}
              <button
                type="button"
                onClick={() => {
                  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
                  if (lastAssistantMsg) handleSpeak(lastAssistantMsg.content);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                  isSpeaking
                    ? 'bg-[#D97706] text-white animate-pulse'
                    : 'bg-[#2E1D18] hover:bg-[#3D2620] text-stone-200 border border-[#4A3026]'
                }`}
                title="Toggle regal voice readout"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isSpeaking ? 'volume_off' : 'volume_up'}
                </span>
                <span className="hidden sm:inline">{isSpeaking ? 'Mute' : 'Listen'}</span>
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div
              ref={chatScrollRef}
              className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-[#18100D] via-[#140D0B] to-[#120C0A]"
            >
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAssistant && (
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${activeChar.avatarBg} flex items-center justify-center text-white shrink-0 mt-1 shadow-md`}
                      >
                        <span className="material-symbols-outlined text-base">
                          {activeChar.icon}
                        </span>
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm leading-relaxed shadow-md ${
                        isAssistant
                          ? 'bg-[#231713] border border-[#3E2921] text-stone-100 rounded-tl-sm'
                          : 'bg-[#9A452C] text-white rounded-tr-sm'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`mt-2 flex items-center justify-between text-[10px] ${
                          isAssistant ? 'text-stone-400' : 'text-rose-200'
                        }`}
                      >
                        <span className="font-mono">{msg.timestamp}</span>
                        {isAssistant && (
                          <button
                            type="button"
                            onClick={() => handleSpeak(msg.content)}
                            className="hover:text-white flex items-center gap-0.5 ml-2 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[13px]">volume_up</span>
                            <span>Hear Voice</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {!isAssistant && (
                      <div className="w-8 h-8 rounded-xl bg-stone-700 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
                        You
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${activeChar.avatarBg} flex items-center justify-center text-white shrink-0`}
                  >
                    <span className="material-symbols-outlined text-base">{activeChar.icon}</span>
                  </div>
                  <div className="bg-[#231713] border border-[#3E2921] px-4 py-3 rounded-2xl flex items-center gap-2 text-xs text-stone-300">
                    <span className="material-symbols-outlined text-base text-[#D97706] animate-spin">
                      progress_activity
                    </span>
                    <span>Consulting Chalukyan royal archives...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggested Question Chips */}
            <div className="px-4 py-2.5 bg-[#1F1511] border-t border-[#35221B] flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-stone-400 shrink-0 uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px] text-[#D97706]">lightbulb</span>
                Ask:
              </span>
              {activeChar.suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#2B1D17] hover:bg-[#3D2921] text-stone-200 border border-[#442D23] whitespace-nowrap transition-all shadow-xs active:scale-95"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 sm:p-4 bg-[#231713] border-t border-[#3A261F] flex items-center gap-2">
              {/* Voice Input Toggle Button */}
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-3 rounded-2xl transition-all shadow-sm flex items-center justify-center ${
                  isRecording
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#2E1D18] hover:bg-[#3E2720] text-stone-200 border border-[#472E24]'
                }`}
                title="Speak to the Ghost Guide with Whisper Voice Recognition"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isRecording ? 'mic' : 'mic_none'}
                </span>
              </button>

              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={`Ask ${activeChar.name} anything about ${selectedMonument}...`}
                className="flex-1 bg-[#18100D] border border-[#3D2820] text-stone-100 placeholder:text-stone-500 text-sm px-4 py-3 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D97706]"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!inputPrompt.trim() || isLoading}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#D97706] to-[#9A452C] hover:brightness-110 disabled:opacity-50 text-white font-bold text-sm shadow-md transition-all flex items-center gap-1.5 active:scale-95 shrink-0"
              >
                <span>Send</span>
                <span className="material-symbols-outlined text-[17px]">send</span>
              </button>
            </div>
          </section>

          {/* Historical Epigraphy & Lore Side Panel */}
          <aside className="lg:col-span-4 flex flex-col gap-5">
            {/* Epigraph Archive Card */}
            <div className="p-5 rounded-3xl bg-[#1C1310] border border-[#3E2820] shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-[#D97706] font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">history_edu</span>
                  Mangalesha's Saka 500 Epigraph
                </span>
                <span className="font-mono text-[10px] bg-[#2E1D18] px-2 py-0.5 rounded border border-[#482E24]">
                  578 CE
                </span>
              </div>
              <p className="text-xs text-stone-300 leading-relaxed italic bg-[#150D0A] p-3 rounded-xl border border-[#2E1C15]">
                &quot;In the five-hundredth year of the Saka kings, this rock temple of Vishnu was created by King Mangalesha, brother of Kirtivarman, of extraordinary beauty...&quot;
              </p>
              <div className="text-[11px] text-stone-400 space-y-1">
                <p><strong>Script:</strong> Old Kannada / Southern Brahmi</p>
                <p><strong>Language:</strong> Sanskrit in Halegannada epigraphic verse</p>
                <p><strong>Location:</strong> Carved on the eastern portico pillar of Badami Cave 3</p>
              </div>
            </div>

            {/* Quick Lore & Timeline Card */}
            <div className="p-5 rounded-3xl bg-[#1C1310] border border-[#3E2820] shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#00685F]">timeline</span>
                Early Chalukya Architectural Arc
              </h3>
              <div className="space-y-2.5 text-xs text-stone-300">
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D97706] mt-1.5 shrink-0"></div>
                  <div>
                    <strong className="text-white font-semibold">543 CE:</strong> Pulakeshin I fortifies Vatapi cliff crag and establishes the dynasty.
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#9A452C] mt-1.5 shrink-0"></div>
                  <div>
                    <strong className="text-white font-semibold">578 CE:</strong> Mangalesha consecrates Cave 3 Mahavishnu shrine.
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00685F] mt-1.5 shrink-0"></div>
                  <div>
                    <strong className="text-white font-semibold">610–642 CE:</strong> Pulakeshin II expands the empire and receives Persian ambassadors.
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  <div>
                    <strong className="text-white font-semibold">740 CE:</strong> Queen Lokamahadevi builds Pattadakal Virupaksha.
                  </div>
                </div>
              </div>
            </div>

            {/* Engine & Status Card */}
            <div className="p-4 rounded-2xl bg-[#150D0A] border border-[#2D1B15] text-[11px] text-stone-400 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Lore Engine: <strong className="text-stone-200">{modelLabel}</strong></span>
              </div>
              <span className="text-stone-500 font-mono">Whisper TTS Active</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
