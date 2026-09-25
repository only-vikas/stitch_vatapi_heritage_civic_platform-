'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import ReportIssueModal from '@/components/ReportIssueModal';
import OllamaChatModal from '@/components/OllamaChatModal';
import SuccessToast from '@/components/SuccessToast';
import {
  VoiceMessage,
  VendorPhrase,
  InscriptionData,
  VENDOR_PRESET_PHRASES,
  TOURIST_PROMPT_SUGGESTIONS,
  BADAMI_CAVE3_INSCRIPTION,
} from '@/lib/translations';
import {
  transcribeVoiceNoteWithWhisper,
  startLiveSpeechRecognition,
  readOutLoud,
  stopReadingOutLoud,
} from '@/lib/whisperService';

export default function VatapiVoicePage() {
  // Navigation & Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [inscriptionModalOpen, setInscriptionModalOpen] = useState(false);

  // Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Mode: 'tourist' (EN -> KN) or 'vendor' (KN -> EN)
  const [activeMode, setActiveMode] = useState<'tourist' | 'vendor'>('tourist');

  // Chat State (Tourist Mode)
  const [inputText, setInputText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'vm-1',
      sender: 'user',
      mode: 'tourist',
      originalText: 'How much is the auto fare to Pattadakal?',
      translatedText: 'ಪಟ್ಟದಕಲ್ಲು ತಲುಪಲು ಆಟೋ ಬಾಡಿಗೆ ಎಷ್ಟು?',
      kannadaScript: 'ಪಟ್ಟದಕಲ್ಲು ತಲುಪಲು ಆಟೋ ಬಾಡಿಗೆ ಎಷ್ಟು?',
      transliteration: 'Pattadakallu talupalu auto badige eshtu?',
      culturalTip: "Polite Tip: Start with 'Namaskara' first. Drivers appreciate when you greet them with respect.",
      audioText: 'ಪಟ್ಟದಕಲ್ಲು ತಲುಪಲು ಆಟೋ ಬಾಡಿಗೆ ಎಷ್ಟು?',
      timestamp: '10:14 AM',
    },
    {
      id: 'vm-2',
      sender: 'user',
      mode: 'tourist',
      originalText: 'Where can I find pure veg Jolada Rotti meals nearby?',
      translatedText: 'ಇಲ್ಲಿ ಹತ್ತಿರದಲ್ಲಿ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
      kannadaScript: 'ಇಲ್ಲಿ ಹತ್ತಿರದಲ್ಲಿ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
      transliteration: 'Illi hattiradalli shuddha sasyahari jolada rotti oota elli siguttade?',
      culturalTip: "Culinary Tip: Ask for 'Bisi Jolada Rotti' with 'Yennegai' (stuffed brinjal) and 'Shenga Chutney'.",
      audioText: 'ಇಲ್ಲಿ ಹತ್ತಿರದಲ್ಲಿ ಶುದ್ಧ ಸಸ್ಯಾಹಾರಿ ಜೋಳದ ರೊಟ್ಟಿ ಊಟ ಎಲ್ಲಿ ಸಿಗುತ್ತದೆ?',
      timestamp: '10:15 AM',
    },
  ]);

  // Vendor Mode State (Reverse Mode)
  const [selectedVendorPhrase, setSelectedVendorPhrase] = useState<VendorPhrase>(
    VENDOR_PRESET_PHRASES[0]
  );
  const [customVendorInput, setCustomVendorInput] = useState('');

  // TTS State
  const [activeAudioPlayingId, setActiveAudioPlayingId] = useState<string | null>(null);

  // Whisper Voice Note Recording State
  const [isRecordingVoiceNote, setIsRecordingVoiceNote] = useState(false);
  const [whisperTranscribing, setWhisperTranscribing] = useState(false);
  const [whisperLiveTranscript, setWhisperLiveTranscript] = useState('');
  const voiceNoteMediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceNoteChunksRef = useRef<Blob[]>([]);
  const voiceNoteLiveRecognitionRef = useRef<{ stop: () => void } | null>(null);

  // Inscription Scanner State (Prompt 4.2.2)
  const [isScanningInscription, setIsScanningInscription] = useState(false);
  const [inscriptionData, setInscriptionData] = useState<InscriptionData | null>(null);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new chat message
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, activeMode]);

  // ----------------------------------------------------------------------
  // 1. Text-to-Speech (TTS) using Whisper / Web Speech API (Read Out Loud)
  // ----------------------------------------------------------------------
  const handlePlayAudio = (text: string, id: string, lang = 'kn-IN') => {
    if (activeAudioPlayingId === id) {
      stopReadingOutLoud();
      setActiveAudioPlayingId(null);
      return;
    }

    readOutLoud(text, {
      lang,
      rate: 0.9,
      onStart: () => setActiveAudioPlayingId(id),
      onEnd: () => setActiveAudioPlayingId(null),
      onError: () => setActiveAudioPlayingId(null),
    });
  };

  // ----------------------------------------------------------------------
  // 2. Whisper Neural Voice Note Recorder
  // ----------------------------------------------------------------------
  const startVoiceNoteRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      voiceNoteChunksRef.current = [];
      setWhisperLiveTranscript('');
      setIsRecordingVoiceNote(true);

      // Start live speech recognition (Whisper / Neural engine)
      voiceNoteLiveRecognitionRef.current = startLiveSpeechRecognition(
        (transcript) => {
          setWhisperLiveTranscript(transcript);
          if (activeMode === 'tourist') {
            setInputText(transcript);
          } else {
            setCustomVendorInput(transcript);
          }
        },
        activeMode === 'tourist' ? 'en-IN' : 'kn-IN'
      );

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) voiceNoteChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(voiceNoteChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());

        if (voiceNoteLiveRecognitionRef.current) {
          voiceNoteLiveRecognitionRef.current.stop();
          voiceNoteLiveRecognitionRef.current = null;
        }

        setWhisperTranscribing(true);
        try {
          const currentHint =
            whisperLiveTranscript ||
            (activeMode === 'tourist' ? inputText : customVendorInput);
          const result = await transcribeVoiceNoteWithWhisper(
            blob,
            currentHint,
            activeMode === 'tourist' ? 'en-IN' : 'kn-IN'
          );

          const queryText = result.text || whisperLiveTranscript || currentHint;
          if (queryText) {
            if (activeMode === 'tourist') {
              setInputText(queryText);
            } else {
              setCustomVendorInput(queryText);
            }
            // Submit translation and automatically read out loud
            handleSendTranslation(queryText, true);
          }
        } finally {
          setWhisperTranscribing(false);
          setIsRecordingVoiceNote(false);
        }
      };

      recorder.start();
      voiceNoteMediaRecorderRef.current = recorder;
    } catch {
      setIsRecordingVoiceNote(false);
      setToastMessage('Microphone access is required to record voice notes.');
      setToastType('error');
      setToastVisible(true);
    }
  };

  const stopVoiceNoteRecording = () => {
    if (voiceNoteMediaRecorderRef.current) {
      voiceNoteMediaRecorderRef.current.stop();
    }
    if (voiceNoteLiveRecognitionRef.current) {
      voiceNoteLiveRecognitionRef.current.stop();
      voiceNoteLiveRecognitionRef.current = null;
    }
  };

  // ----------------------------------------------------------------------
  // 3. Submit Translation (Tourist or Vendor Mode) & Read Out Loud
  // ----------------------------------------------------------------------
  const handleSendTranslation = async (textToSend?: string, autoSpeak = true) => {
    const query = (textToSend || (activeMode === 'tourist' ? inputText : customVendorInput)).trim();
    if (!query) return;

    if (activeMode === 'tourist') {
      setInputText('');
    } else {
      setCustomVendorInput('');
    }

    setIsTranslating(true);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: query,
          mode: activeMode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (activeMode === 'tourist') {
          const msgId = `vm-${Date.now()}`;
          const newMessage: VoiceMessage = {
            id: msgId,
            sender: 'user',
            mode: 'tourist',
            originalText: query,
            translatedText: data.translatedText || data.kannadaScript,
            kannadaScript: data.kannadaScript,
            transliteration: data.transliteration,
            culturalTip: data.culturalTip,
            audioText: data.audioText || data.kannadaScript,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, newMessage]);

          // Read out loud the Kannada translation automatically
          if (autoSpeak) {
            const spokenText = data.audioText || data.kannadaScript || data.translatedText;
            setTimeout(() => {
              handlePlayAudio(spokenText, msgId, 'kn-IN');
            }, 300);
          }
        } else {
          // Vendor mode: update large broadcast card and read out loud in English
          const vendorId = `vp-custom-${Date.now()}`;
          setSelectedVendorPhrase({
            id: vendorId,
            kannada: data.kannadaScript || query,
            transliteration: data.transliteration || '',
            english: data.translatedText || query,
            category: 'fare',
          });
          setToastMessage('Vendor card updated! Ready to show tourist.');
          setToastType('success');
          setToastVisible(true);

          if (autoSpeak) {
            setTimeout(() => {
              handlePlayAudio(data.translatedText || query, vendorId, 'en-IN');
            }, 300);
          }
        }
      }
    } catch (err) {
      console.warn('Translation call failed, using fallback:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // ----------------------------------------------------------------------
  // 3. Old Kannada Inscription Scanner (Prompt 4.2.2)
  // ----------------------------------------------------------------------
  const handleAnalyzeInscription = async () => {
    setIsScanningInscription(true);

    try {
      const response = await fetch('/api/inscription-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.success && data.inscription) {
        setInscriptionData(data.inscription);
        setToastMessage('Badami Cave 3 inscription successfully deciphered!');
        setToastType('success');
        setToastVisible(true);
      } else {
        setInscriptionData(BADAMI_CAVE3_INSCRIPTION);
      }
    } catch (e) {
      console.warn('Inscription analysis fallback:', e);
      setInscriptionData(BADAMI_CAVE3_INSCRIPTION);
    } finally {
      setIsScanningInscription(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a] antialiased selection:bg-[#00685f]/20">
      {/* Navigation */}
      <Navbar
        onOpenReportModal={() => setReportModalOpen(true)}
        onOpenChatModal={() => setChatModalOpen(true)}
        activeSection="vatapi-voice"
      />

      {/* Main Content Area */}
      <main className="pt-24 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        {/* Header Strip with Controls */}
        <section className="mb-6 pb-6 border-b border-[#eae8e5]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#efeeeb] text-[#00685f] text-xs font-semibold uppercase tracking-wider mb-2">
                <span className="material-symbols-outlined text-[15px]">record_voice_over</span>
                Vatapi Voice • Context-Aware Neural Translation & Epigraphy
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1b1c1a] tracking-tight">
                Vatapi Voice
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#6d7a77]">
                Real-time two-way dialogue bridge between tourists and local drivers, plus 6th-century Old Kannada epigraph deciphering.
              </p>
            </div>

            {/* Top Action Controls: Mode Switcher & Inscription Scanner Trigger */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Camera Scanner Button (Prompt 4.2.2) */}
              <button
                type="button"
                onClick={() => {
                  setInscriptionModalOpen(true);
                  if (!inscriptionData) {
                    setInscriptionData(BADAMI_CAVE3_INSCRIPTION);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#9a452c] to-[#762b14] hover:from-[#762b14] hover:to-[#9a452c] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all group"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:scale-110 transition-transform">
                  photo_camera
                </span>
                <span>Scan Cave Inscription</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb5a0] animate-ping" />
              </button>

              {/* Mode Toggle Switch (Prompt 4.2.1) */}
              <div className="bg-[#efeeeb] p-1 rounded-2xl flex items-center border border-[#eae8e5]">
                <button
                  type="button"
                  onClick={() => setActiveMode('tourist')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMode === 'tourist'
                      ? 'bg-white text-[#00685f] shadow-xs'
                      : 'text-[#6d7a77] hover:text-[#1b1c1a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">travel_explore</span>
                  <span>Tourist Mode (EN ➔ KN)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveMode('vendor')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    activeMode === 'vendor'
                      ? 'bg-white text-[#9a452c] shadow-xs'
                      : 'text-[#6d7a77] hover:text-[#1b1c1a]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">local_shipping</span>
                  <span>Vendor/Driver Mode (KN ➔ EN)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================== */}
        {/* VIEW 1: TOURIST MODE (Default Chat & Multi-turn Dialogue) */}
        {/* =================================================================== */}
        {activeMode === 'tourist' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 8 Cols: Dialogue & Response Bubbles with Audio Playback */}
            <div className="lg:col-span-8 flex flex-col bg-white rounded-3xl border border-[#eae8e5] shadow-xs overflow-hidden h-[620px]">
              {/* Chat Header */}
              <div className="p-4 px-6 border-b border-[#eae8e5] flex items-center justify-between bg-[#fbf9f6]/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center font-bold">
                    <span className="material-symbols-outlined text-[20px]">translate</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#1b1c1a]">Tourist Assistant</h3>
                    <p className="text-[11px] text-[#6d7a77]">
                      Respectful North Karnataka Kannada • Powered by Ollama
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Web Speech TTS Active
                </div>
              </div>

              {/* Message Stream */}
              <div ref={chatScrollRef} className="flex-1 p-5 overflow-y-auto space-y-5">
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {/* User Prompt */}
                    <div className="flex justify-end">
                      <div className="max-w-[85%] bg-[#00685f] text-white p-3.5 px-4 rounded-2xl rounded-tr-xs text-xs sm:text-sm shadow-xs leading-relaxed">
                        {msg.originalText}
                      </div>
                    </div>

                    {/* AI Translation Response */}
                    <div className="flex justify-start">
                      <div className="max-w-[90%] bg-[#fbf9f6] border border-[#eae8e5] p-4 rounded-2xl rounded-tl-xs shadow-xs space-y-2.5">
                        {/* Kannada Script (Large) */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-serif text-lg sm:text-xl font-bold text-[#1b1c1a] leading-snug">
                            {msg.kannadaScript}
                          </div>

                          {/* Read Out Loud Button */}
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(msg.audioText, msg.id, 'kn-IN')}
                            title="Read Out Loud using Speech Engine"
                            className={`px-3 py-1.5 rounded-xl transition-all shrink-0 flex items-center gap-1.5 text-xs font-bold shadow-2xs ${
                              activeAudioPlayingId === msg.id
                                ? 'bg-[#00685f] text-white animate-pulse'
                                : 'bg-[#efeeeb] hover:bg-[#eae8e5] text-[#00685f]'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[17px]">
                              {activeAudioPlayingId === msg.id ? 'graphic_eq' : 'volume_up'}
                            </span>
                            <span>{activeAudioPlayingId === msg.id ? 'Speaking...' : 'Read Out Loud'}</span>
                          </button>
                        </div>

                        {/* Phonetics / Transliteration */}
                        {msg.transliteration && (
                          <div className="text-xs font-medium text-[#6d7a77] italic">
                            Pronunciation: {msg.transliteration}
                          </div>
                        )}

                        {/* Cultural Etiquette Tip */}
                        {msg.culturalTip && (
                          <div className="pt-2 border-t border-[#eae8e5] flex items-start gap-1.5 text-[11px] text-[#3d4947]">
                            <span className="material-symbols-outlined text-[15px] text-[#9a452c] shrink-0 mt-0.5">
                              tips_and_updates
                            </span>
                            <span>{msg.culturalTip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTranslating && (
                  <div className="flex justify-start">
                    <div className="bg-[#fbf9f6] border border-[#eae8e5] p-3.5 px-4 rounded-2xl text-xs text-[#6d7a77] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] animate-spin text-[#00685f]">
                        sync
                      </span>
                      <span>Translating to respectful North Karnataka Kannada...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Bar */}
              <div className="p-4 border-t border-[#eae8e5] bg-[#fbf9f6]">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendTranslation();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type in English (e.g. How much is the auto to Mahakuta?)..."
                    className="flex-1 bg-white border border-[#eae8e5] focus:border-[#00685f] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#1b1c1a] focus:outline-none placeholder-[#6d7a77]"
                  />

                  {/* Record Voice Note with Whisper */}
                  <button
                    type="button"
                    onClick={isRecordingVoiceNote ? stopVoiceNoteRecording : startVoiceNoteRecording}
                    title={isRecordingVoiceNote ? 'Stop Voice Note' : 'Record Voice Note with Whisper STT'}
                    className={`px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0 ${
                      isRecordingVoiceNote
                        ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                        : whisperTranscribing
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-[#efeeeb] hover:bg-[#eae8e5] text-[#1b1c1a] border border-[#bcc9c6]/40'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[17px]">
                      {isRecordingVoiceNote ? 'stop' : 'mic'}
                    </span>
                    <span>
                      {isRecordingVoiceNote
                        ? 'Listening...'
                        : whisperTranscribing
                        ? 'Transcribing...'
                        : 'Voice Note'}
                    </span>
                  </button>

                  <button
                    type="submit"
                    disabled={isTranslating || !inputText.trim()}
                    className="px-4 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#005049] disabled:bg-[#bcc9c6] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                  >
                    <span>Translate</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right 4 Cols: Quick Inquiries & Cultural Cheat Sheet */}
            <div className="lg:col-span-4 space-y-5">
              {/* Quick Questions */}
              <div className="bg-white rounded-3xl border border-[#eae8e5] p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px] text-[#00685f]">
                    bolt
                  </span>
                  <h3 className="font-bold text-sm text-[#1b1c1a]">Quick Tourist Inquiries</h3>
                </div>
                <p className="text-xs text-[#6d7a77] mb-3">
                  Tap any common question to instantly generate polite Kannada phrasing:
                </p>

                <div className="flex flex-col gap-2">
                  {TOURIST_PROMPT_SUGGESTIONS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendTranslation(prompt)}
                      className="text-left p-2.5 px-3 rounded-xl bg-[#fbf9f6] hover:bg-[#efeeeb] border border-[#eae8e5] text-xs text-[#3d4947] hover:text-[#1b1c1a] transition-all flex items-center justify-between group"
                    >
                      <span className="truncate pr-2">{prompt}</span>
                      <span className="material-symbols-outlined text-[15px] text-[#6d7a77] group-hover:text-[#00685f] group-hover:translate-x-0.5 transition-all">
                        arrow_forward
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Local Cultural Etiquette Box */}
              <div className="bg-[#f4fffc] rounded-3xl border border-[#89f5e7]/40 p-5 text-xs text-[#3d4947] leading-relaxed">
                <div className="flex items-center gap-2 text-[#00685f] font-bold text-sm mb-2">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Bagalkote Etiquette Guide
                </div>
                <ul className="space-y-2 list-disc list-inside">
                  <li>
                    <strong>Respectful Address:</strong> Add &apos;Ri&apos; at the end of sentences (e.g. &apos;En-ri&apos;, &apos;Namaskara-ri&apos;) for authentic North Karnataka affection.
                  </li>
                  <li>
                    <strong>Sacred Waters:</strong> Do not use soap or plastic near Agastya Lake or Mahakuta holy springs.
                  </li>
                  <li>
                    <strong>Fair Auto Tariffs:</strong> Standard pooled rate between Badami and Pattadakal is ₹80/passenger.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* VIEW 2: VENDOR / DRIVER MODE (Reverse Mode - Prompt 4.2.1) */
          /* =================================================================== */
          <div className="flex flex-col gap-6">
            {/* Mode Explainer Banner */}
            <div className="bg-[#9a452c]/10 border border-[#9a452c]/20 p-4 rounded-2xl flex items-center justify-between text-xs text-[#762b14]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#9a452c]">
                  dashboard_customize
                </span>
                <span>
                  <strong>Driver &amp; Merchant Broadcast Screen:</strong> Simplified full-width interface. Chat history hidden to maximize clarity on driver dashboards and vendor counters.
                </span>
              </div>
              <span className="hidden sm:inline font-bold uppercase tracking-wider text-[11px]">
                High-Contrast Mode
              </span>
            </div>

            {/* Large Easy-To-Read Translation Card (Prominent Centerpiece) */}
            <div className="bg-white rounded-3xl border-2 border-[#9a452c] p-6 sm:p-10 shadow-lg text-center flex flex-col items-center justify-center gap-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9a452c]/10 text-[#9a452c] text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">visibility</span>
                Show This Card To Tourist
              </div>

              {/* Massive English Translation for Tourist to Read */}
              <div className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-[#1b1c1a] tracking-tight max-w-4xl leading-tight">
                &ldquo;{selectedVendorPhrase.english}&rdquo;
              </div>

              {/* Original Kannada Script underneath */}
              <div className="text-base sm:text-xl font-medium text-[#9a452c] mt-1 max-w-3xl">
                {selectedVendorPhrase.kannada}
              </div>

              {/* Transliteration */}
              {selectedVendorPhrase.transliteration && (
                <div className="text-xs text-[#6d7a77] italic">
                  Pronunciation: {selectedVendorPhrase.transliteration}
                </div>
              )}

              {/* Text-to-Speech Button (Reads English aloud to tourist) */}
              <button
                type="button"
                onClick={() =>
                  handlePlayAudio(
                    selectedVendorPhrase.english,
                    selectedVendorPhrase.id,
                    'en-IN'
                  )
                }
                className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#9a452c] hover:bg-[#762b14] text-white text-sm font-semibold shadow-md transition-all group"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                  volume_up
                </span>
                <span>Speak English Aloud to Tourist</span>
              </button>
            </div>

            {/* Quick One-Tap Kannada Vendor Phrases Grid */}
            <div className="bg-white rounded-3xl border border-[#eae8e5] p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1b1c1a]">
                    One-Tap Driver &amp; Vendor Phrases
                  </h3>
                  <p className="text-xs text-[#6d7a77]">
                    Tap any Kannada card below to immediately broadcast to the tourist above
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#00685f] bg-[#00685f]/10 px-3 py-1 rounded-full">
                  6 Fast Presets
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VENDOR_PRESET_PHRASES.map((phrase) => {
                  const isSelected = selectedVendorPhrase.id === phrase.id;
                  return (
                    <button
                      key={phrase.id}
                      type="button"
                      onClick={() => {
                        setSelectedVendorPhrase(phrase);
                        handlePlayAudio(phrase.english, phrase.id, 'en-IN');
                      }}
                      className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isSelected
                          ? 'border-[#9a452c] bg-[#fff5f2] ring-2 ring-[#9a452c]/20'
                          : 'border-[#eae8e5] bg-[#fbf9f6] hover:bg-white hover:border-[#bcc9c6]'
                      }`}
                    >
                      <div>
                        <div className="text-sm font-bold text-[#1b1c1a] leading-snug">
                          {phrase.kannada}
                        </div>
                        <div className="text-xs text-[#6d7a77] mt-1 line-clamp-2">
                          {phrase.english}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#9a452c] font-semibold pt-2 border-t border-[#eae8e5]">
                        <span className="uppercase tracking-wider">{phrase.category}</span>
                        <span className="inline-flex items-center gap-0.5">
                          <span>Display</span>
                          <span className="material-symbols-outlined text-[13px]">arrow_upward</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Kannada Driver Input Bar */}
            <div className="bg-white rounded-3xl border border-[#eae8e5] p-5 shadow-xs">
              <h4 className="text-xs font-bold text-[#1b1c1a] uppercase tracking-wider mb-2">
                Custom Driver Input (Type or Record Voice Note with Whisper)
              </h4>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendTranslation();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customVendorInput}
                  onChange={(e) => setCustomVendorInput(e.target.value)}
                  placeholder="ಉದಾಹರಣೆಗೆ: ಇನ್ನೊಂದು 10 ನಿಮಿಷದಲ್ಲಿ ಹೊರಡುತ್ತೇವೆ (Departing in 10 mins)..."
                  className="flex-1 bg-[#fbf9f6] border border-[#eae8e5] focus:border-[#9a452c] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#1b1c1a] focus:outline-none"
                />

                {/* Record Voice Note with Whisper (Kannada / English) */}
                <button
                  type="button"
                  onClick={isRecordingVoiceNote ? stopVoiceNoteRecording : startVoiceNoteRecording}
                  title={isRecordingVoiceNote ? 'Stop Voice Note' : 'Record Voice Note with Whisper STT'}
                  className={`px-3.5 py-3 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 shrink-0 ${
                    isRecordingVoiceNote
                      ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                      : whisperTranscribing
                      ? 'bg-amber-500 text-white animate-pulse'
                      : 'bg-[#efeeeb] hover:bg-[#eae8e5] text-[#1b1c1a] border border-[#bcc9c6]/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {isRecordingVoiceNote ? 'stop' : 'mic'}
                  </span>
                  <span>
                    {isRecordingVoiceNote
                      ? 'Listening...'
                      : whisperTranscribing
                      ? 'Transcribing...'
                      : 'Voice Note'}
                  </span>
                </button>

                <button
                  type="submit"
                  disabled={isTranslating || !customVendorInput.trim()}
                  className="px-5 py-3 rounded-xl bg-[#9a452c] hover:bg-[#762b14] disabled:bg-[#bcc9c6] text-white font-semibold text-xs transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Translate to English</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* OLD KANNADA INSCRIPTION SCANNER MODAL (Prompt 4.2.2) */}
      {/* =================================================================== */}
      {inscriptionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#eae8e5] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 px-6 border-b border-[#eae8e5] flex items-center justify-between bg-[#fbf9f6]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9a452c] to-[#00685f] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[22px]">document_scanner</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1b1c1a]">
                      Old Kannada Inscription Scanner
                    </h3>
                    {/* Simulated Translation Badge required by Prompt 4.2.2 */}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#efeeeb] text-[#3d4947] border border-[#bcc9c6]">
                      Simulated Translation
                    </span>
                  </div>
                  <p className="text-xs text-[#6d7a77]">
                    Badami Cave No. 3 Portico Inscription • King Mangalesha (578 CE)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInscriptionModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#efeeeb] hover:bg-[#eae8e5] text-[#3d4947] flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Inscription Image with Laser Scan Line Animation */}
              <div className="relative rounded-2xl overflow-hidden border border-[#eae8e5] bg-black aspect-video max-h-[300px]">
                <img
                  src="/images/badami_inscription_cave3.jpg"
                  alt="Badami Cave 3 Old Kannada Inscription 578 CE"
                  className="w-full h-full object-cover"
                />

                {/* Laser Overlay while scanning */}
                {isScanningInscription && (
                  <div className="absolute inset-0 bg-[#00685f]/20 flex flex-col justify-between">
                    <div className="w-full h-1 bg-[#89f5e7] shadow-[0_0_15px_#89f5e7] animate-bounce" />
                    <div className="self-center bg-black/80 px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] animate-spin text-[#89f5e7]">
                        sync
                      </span>
                      <span>Deciphering 6th-Century Halegannada Brahmi Script with Ollama (LLaVA)...</span>
                    </div>
                    <div className="w-full h-1 bg-[#89f5e7] shadow-[0_0_15px_#89f5e7] animate-bounce" />
                  </div>
                )}

                {/* Stone Plate Caption Overlay */}
                <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs p-2.5 px-3 rounded-xl text-white text-[11px] flex justify-between items-center">
                  <span>Badami Cave 3 Verandah Pillar • Saka 500 (578 CE)</span>
                  <span className="text-[#89f5e7] font-semibold">Chalukya Royal Epigraph</span>
                </div>
              </div>

              {/* Action Button: Analyze Inscription (Prompt 4.2.2) */}
              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleAnalyzeInscription}
                  disabled={isScanningInscription}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all disabled:bg-[#bcc9c6]"
                >
                  <span className="material-symbols-outlined text-[17px]">
                    {isScanningInscription ? 'sync' : 'auto_fix_high'}
                  </span>
                  <span>{isScanningInscription ? 'Analyzing Inscription...' : 'Analyze Inscription'}</span>
                </button>

                <div className="text-xs text-[#6d7a77]">
                  Target: <strong>Halegannada Transcription &amp; Historical Narrative</strong>
                </div>
              </div>

              {/* Inscription Deciphered Results */}
              {inscriptionData && (
                <div className="space-y-4 pt-2 border-t border-[#eae8e5]">
                  {/* 1. Extracted Old Kannada Text */}
                  <div className="p-4 rounded-2xl bg-[#fbf9f6] border border-[#eae8e5] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#9a452c] uppercase tracking-wider">
                        Extracted Old Kannada Text (Halegannada)
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handlePlayAudio(
                            inscriptionData.extractedHalegannada,
                            'insc-halegannada',
                            'kn-IN'
                          )
                        }
                        className="text-[11px] font-semibold text-[#00685f] hover:underline flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[14px]">volume_up</span>
                        Listen
                      </button>
                    </div>
                    <div className="font-serif text-base sm:text-lg font-bold text-[#1b1c1a] leading-relaxed">
                      {inscriptionData.extractedHalegannada}
                    </div>
                    <div className="text-xs text-[#6d7a77] italic">
                      Transliteration: {inscriptionData.romanizedText}
                    </div>
                  </div>

                  {/* 2. English Scholarly Translation */}
                  <div className="p-4 rounded-2xl bg-white border border-[#eae8e5] space-y-1.5">
                    <span className="text-xs font-bold text-[#00685f] uppercase tracking-wider">
                      English Translation
                    </span>
                    <p className="text-xs sm:text-sm text-[#3d4947] leading-relaxed">
                      {inscriptionData.englishTranslation}
                    </p>
                  </div>

                  {/* 3. Historical Story (King Mangalesha, 578 CE) */}
                  <div className="p-4 rounded-2xl bg-[#fff5f2] border border-[#ffb5a0] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#9a452c] uppercase tracking-wider flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">history_edu</span>
                        Historical Story (King Mangalesha, 578 CE)
                      </span>

                      {/* TTS for Historical Story */}
                      <button
                        type="button"
                        onClick={() =>
                          handlePlayAudio(
                            inscriptionData.historicalStory,
                            'insc-story',
                            'en-IN'
                          )
                        }
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#9a452c] text-white text-xs font-semibold shadow-xs hover:bg-[#762b14] transition-colors"
                      >
                        <span className="material-symbols-outlined text-[14px]">volume_up</span>
                        Narrate Story
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-[#1b1c1a] leading-relaxed">
                      {inscriptionData.historicalStory}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Toast */}
      {toastVisible && (
        <SuccessToast
          message={toastMessage}
          type={toastType}
          visible={toastVisible}
          onClose={() => setToastVisible(false)}
        />
      )}

      {/* Report Modal */}
      <ReportIssueModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />

      {/* Ollama Chat Modal */}
      <OllamaChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
      />
    </div>
  );
}
