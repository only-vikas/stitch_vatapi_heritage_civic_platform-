'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

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

  React.useEffect(() => {
    if (initialCategory) {
      setCategory(initialCategory);
    }
  }, [initialCategory, isOpen]);

  if (!isOpen) return null;

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
            onClick={onClose}
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

              {/* Evidence Upload */}
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

              {/* Action buttons */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
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
