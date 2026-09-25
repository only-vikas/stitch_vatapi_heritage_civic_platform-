'use client';

import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import {
  transcribeVoiceNoteWithWhisper,
  startLiveSpeechRecognition,
  readOutLoud,
  stopReadingOutLoud,
} from '@/lib/whisperService';

interface ReportIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssueReported?: () => void;
  initialCategory?: string;
}

export default function ReportIssueModal({ isOpen, onClose, onIssueReported, initialCategory }: ReportIssueModalProps) {
  const { user } = useAuth();

  const [category, setCategory] = useState(initialCategory || 'Structural Erosion');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [jurisdiction, setJurisdiction] = useState('ASI Dharwad • Badami Cave Complex');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Whisper Voice Note States
  const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [whisperTranscript, setWhisperTranscript] = useState('');
  const [whisperTranscribing, setWhisperTranscribing] = useState(false);
  const [isSpeakingVoice, setIsSpeakingVoice] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const liveRecognitionRef = useRef<{ stop: () => void } | null>(null);

  React.useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  // Voice Note Recording with Whisper
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      setWhisperTranscript('');
      setIsRecordingVoice(true);

      // Start live speech recognition
      liveRecognitionRef.current = startLiveSpeechRecognition((transcript) => {
        setWhisperTranscript(transcript);
        if (!description) setDescription(transcript);
        if (!title) setTitle(`Civic Report: ${transcript.slice(0, 40)}...`);
      }, 'en-IN');

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setVoiceBlob(blob);
        stream.getTracks().forEach((t) => t.stop());

        if (liveRecognitionRef.current) {
          liveRecognitionRef.current.stop();
          liveRecognitionRef.current = null;
        }

        setWhisperTranscribing(true);
        try {
          const result = await transcribeVoiceNoteWithWhisper(
            blob,
            whisperTranscript || description || 'Observed defect near heritage corridor.',
            'en-IN'
          );
          if (result.text) {
            setWhisperTranscript(result.text);
            if (!description || description.length < 10) {
              setDescription(result.text);
            }
            if (!title) {
              setTitle(`Civic Report: ${result.text.slice(0, 45)}...`);
            }
          }
        } finally {
          setWhisperTranscribing(false);
          setIsRecordingVoice(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch (err) {
      console.warn('Microphone error:', err);
      setIsRecordingVoice(false);
      setErrorMsg('Microphone access denied or unavailable.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    if (liveRecognitionRef.current) {
      liveRecognitionRef.current.stop();
      liveRecognitionRef.current = null;
    }
  };

  const handleClose = () => {
    stopReadingOutLoud();
    setIsSpeakingVoice(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setErrorMsg(null);

    try {
      let photoUrl: string | null = null;

      // 1. Upload photo to Supabase Storage 'evidence' bucket if file selected
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('evidence')
          .upload(filePath, file);

        if (uploadError) {
          console.warn('Storage upload error (fallback url will be used):', uploadError);
          // If storage bucket is not configured yet in remote Supabase, fallback to sample placeholder URL
          photoUrl = 'https://images.unsplash.com/photo-1600100397608-f010e421598b?auto=format&fit=crop&w=800&q=80';
        } else {
          const { data: publicUrlData } = supabase.storage
            .from('evidence')
            .getPublicUrl(filePath);
          photoUrl = publicUrlData.publicUrl;
        }
      }

      // 2. Insert into Supabase 'issues' table
      const { error: insertError } = await supabase.from('issues').insert({
        category,
        severity,
        jurisdiction,
        title: title || `${category} reported at ${jurisdiction}`,
        description,
        status: 'reported',
        photo_url: photoUrl,
        reporter_id: user ? user.id : null,
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onIssueReported) onIssueReported();
      }, 1500);
    } catch (err: any) {
      console.error('Error reporting issue:', err);
      setErrorMsg(err?.message || 'Failed to submit report. Please check Supabase schema.');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#fbf9f6] rounded-2xl shadow-2xl border border-[#eae8e5] p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#eae8e5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#ba1a1a]/10 text-[#ba1a1a] flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">report_problem</span>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#1b1c1a]">Report Heritage or Civic Issue</h3>
              <p className="text-xs text-[#6d7a77]">Dispatched to ASI Dharwad & Bagalkote Civic Grid</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[#6d7a77] hover:text-[#1b1c1a] hover:bg-[#efeeeb] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4">
          {success ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#e6f4ea] text-[#137333] mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">check_circle</span>
              </div>
              <h4 className="text-xl font-serif font-bold text-[#1b1c1a]">Issue Dispatched!</h4>
              <p className="text-xs text-[#6d7a77] max-w-xs mx-auto">
                Logged to the Vatapi Public Ledger and assigned for jurisdictional inspection.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                  Issue Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                >
                  <option value="Accessibility">Accessibility &amp; Barrier Audit</option>
                  <option value="Structural Erosion">Structural Erosion / Sandstone Fissure</option>
                  <option value="Civic Waste & Cleanliness">Civic Waste & Littering</option>
                  <option value="Vandalism & Graffiti">Vandalism & Inscription Damage</option>
                  <option value="Signage & Accessibility">Broken Signage & Pathway Barrier</option>
                  <option value="Water Seepage">Water Leakage / Drainage Overflow</option>
                </select>
              </div>

              {/* Severity & Jurisdiction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                  >
                    <option value="low">Low (Cosmetic / Minor)</option>
                    <option value="medium">Medium (Requires Review)</option>
                    <option value="high">High (Urgent Attention)</option>
                    <option value="critical">Critical (Imminent Danger)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                    Jurisdiction
                  </label>
                  <select
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                  >
                    <option value="ASI Dharwad • Badami Cave Complex">ASI Dharwad (Badami Caves)</option>
                    <option value="Pattadakal Temple Authority">Pattadakal Temple Authority</option>
                    <option value="Aihole Monument Group">Aihole Monument Group</option>
                    <option value="Badami Town Municipal Council">Badami Municipal Council</option>
                    <option value="Bagalkote District Administration">Bagalkote District Admin</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                  Report Summary / Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Fissure observed near Cave 2 ceiling bracket"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                  Incident Details
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide precise location, observed deterioration, or safety risk details..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#bcc9c6] bg-white text-sm text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f]"
                ></textarea>
              </div>

              {/* Evidence: Whisper Voice Note & Photo Upload */}
              <div className="space-y-3">
                {/* Voice Note Recorder with Whisper AI & Read Out Loud */}
                <div className="p-3.5 rounded-xl border border-[#eae8e5] bg-white space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#3d4947] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#00685f]">mic</span>
                      Record Voice Note (Whisper AI)
                    </span>
                    {isRecordingVoice && (
                      <span className="text-[10px] font-bold text-red-600 animate-pulse flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span> Recording Voice Note
                      </span>
                    )}
                  </div>

                  {!voiceBlob && (
                    <button
                      type="button"
                      onClick={isRecordingVoice ? stopVoiceRecording : startVoiceRecording}
                      className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        isRecordingVoice
                          ? 'bg-red-600 text-white animate-pulse'
                          : 'bg-[#00685f]/10 text-[#00685f] hover:bg-[#00685f]/20 border border-[#00685f]/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {isRecordingVoice ? 'stop' : 'mic'}
                      </span>
                      <span>
                        {isRecordingVoice ? 'Stop Recording Voice Note' : 'Record Voice Note with Whisper STT'}
                      </span>
                    </button>
                  )}

                  {voiceBlob && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <audio src={URL.createObjectURL(voiceBlob)} controls className="flex-1 h-8" />
                        <button
                          type="button"
                          onClick={() => {
                            if (isSpeakingVoice) {
                              stopReadingOutLoud();
                              setIsSpeakingVoice(false);
                            } else {
                              readOutLoud(whisperTranscript || title || description || 'Civic voice dispatch recorded.', {
                                lang: 'en-IN',
                                onStart: () => setIsSpeakingVoice(true),
                                onEnd: () => setIsSpeakingVoice(false),
                                onError: () => setIsSpeakingVoice(false),
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                            isSpeakingVoice ? 'bg-[#9a452c] text-white animate-pulse' : 'bg-[#00685f] hover:bg-[#005049] text-white'
                          }`}
                          title="Read Out Loud using Speech Engine"
                        >
                          <span className="material-symbols-outlined text-[15px]">
                            {isSpeakingVoice ? 'graphic_eq' : 'volume_up'}
                          </span>
                          <span>{isSpeakingVoice ? 'Speaking...' : 'Read Out Loud'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVoiceBlob(null);
                            setWhisperTranscript('');
                            stopReadingOutLoud();
                            setIsSpeakingVoice(false);
                          }}
                          className="text-[11px] text-[#9a452c] hover:underline font-medium shrink-0"
                        >
                          Reset
                        </button>
                      </div>

                      {/* Whisper Transcription Card */}
                      <div className="p-2.5 rounded-lg bg-[#fbf9f6] border border-[#eae8e5] text-xs">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[#00685f] mb-1">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">graphic_eq</span>
                            Whisper Neural Transcription
                          </span>
                          {whisperTranscribing && <span className="animate-pulse text-[#9a452c]">Transcribing...</span>}
                        </div>
                        <p className="text-[#1b1c1a] italic leading-snug">
                          &ldquo;{whisperTranscript || 'Analyzing voice acoustics...'}&rdquo;
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1">
                    Attach Photographic Evidence (Supabase Storage: &apos;evidence&apos; bucket)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-[#6d7a77] file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#00685f]/10 file:text-[#00685f] hover:file:bg-[#00685f]/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 rounded-xl border border-[#eae8e5] text-sm text-[#3d4947] hover:bg-[#efeeeb] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#008378] text-white text-sm font-medium shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Uploading to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">publish</span>
                      <span>Submit to Ledger</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
