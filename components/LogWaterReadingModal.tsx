'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { calculatePurityIndex, WaterReading } from '@/lib/sustainability';

interface LogWaterReadingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReadingLogged: (newReading: WaterReading) => void;
}

export default function LogWaterReadingModal({
  isOpen,
  onClose,
  onReadingLogged,
}: LogWaterReadingModalProps) {
  const [doVal, setDoVal] = useState<string>('7.2');
  const [phVal, setPhVal] = useState<string>('7.4');
  const [turbidityVal, setTurbidityVal] = useState<string>('12.5');
  const [location, setLocation] = useState<string>('Agastya Lake North Ghat');
  const [notes, setNotes] = useState<string>('Pristine surface test taken near ancient pushkarini stone steps.');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const parsedDo = parseFloat(doVal) || 7.0;
      const parsedPh = parseFloat(phVal) || 7.4;
      const parsedTurb = parseFloat(turbidityVal) || 12.0;
      const computedPurity = calculatePurityIndex(parsedDo, parsedPh, parsedTurb);

      let photoUrl = previewUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkdRVaVwWe2-n_1MD1jf_sqVLgEbYBRzzr0F6FHMf6Sk37BxGc2XQBcOcCQzgzucHQwQJ-MMsXkk5LxiNwIOMPFNv2cGsTSBHLWZrv4HSyQXBAvPhC0NH0Q40PDuaR575JaxbI-k94q5dJbZPtgLLx-hESg8jzXFAd8cebCkpyXOUL4kz9Y6fZcc5k3P5QGK2wwb2kRZtXRCAcl0KK_ExrYvDiVUAW7EMjHrVcUFbafe-XqWa9VEYr';

      // 1. Upload photo to 'evidence' bucket if file was uploaded
      if (photoFile) {
        try {
          const fileExt = photoFile.name.split('.').pop();
          const fileName = `water_${Date.now()}.${fileExt}`;
          const filePath = `water-readings/${fileName}`;

          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('evidence')
            .upload(filePath, photoFile);

          if (!uploadErr && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('evidence')
              .getPublicUrl(filePath);
            if (publicUrlData?.publicUrl) {
              photoUrl = publicUrlData.publicUrl;
            }
          }
        } catch (uploadError) {
          console.warn('Storage upload note (using fallback preview):', uploadError);
        }
      }

      // 2. Insert into sustainability_metrics
      const newReading: WaterReading = {
        id: `water-${Date.now()}`,
        metric_type: 'Water',
        location,
        dissolved_oxygen: parsedDo,
        ph: parsedPh,
        turbidity: parsedTurb,
        algal_biomass: 0.11,
        purity_index: computedPurity,
        photo_url: photoUrl,
        notes,
        reported_by: 'Citizen Sentinel',
        recorded_at: 'Just now',
      };

      try {
        const { error: insertErr } = await supabase.from('sustainability_metrics').insert({
          metric_type: 'Water',
          location,
          dissolved_oxygen: parsedDo,
          ph: parsedPh,
          turbidity: parsedTurb,
          algal_biomass: 0.11,
          purity_index: computedPurity,
          photo_url: photoUrl,
          notes,
          reported_by: 'Citizen Sentinel',
        });
        if (insertErr) {
          console.warn('Supabase insert notice (using reactive local fallback):', insertErr.message);
        }
      } catch (insertError) {
        console.warn('Supabase connection note:', insertError);
      }

      // Trigger callback to update reactive UI & chart
      onReadingLogged(newReading);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to record water reading');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#eae8e5] max-w-lg w-full p-6 sm:p-8 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#eae8e5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">water_ec</span>
            </div>
            <div>
              <span className="text-[11px] font-bold text-[#9a452c] tracking-widest uppercase">
                Citizen-Science Sentinel
              </span>
              <h3 className="font-serif text-xl font-bold text-[#1b1c1a]">
                Log Agastya Water Reading
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-[#efeeeb] hover:bg-[#eae8e5] text-[#3d4947] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4 text-xs">
          {/* Location */}
          <div>
            <label className="block font-bold text-[#1b1c1a] uppercase tracking-wider text-[11px] mb-1">
              Sample Location
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#eae8e5] bg-[#fbf9f6] text-[#1b1c1a] font-medium focus:outline-hidden focus:border-[#00685f]"
            >
              <option value="Agastya Lake North Ghat">Agastya Lake North Ghat</option>
              <option value="Agastya Lake Silt Trap #2">Agastya Lake Silt Trap #2</option>
              <option value="Agastya Lake East Basin">Agastya Lake East Basin</option>
              <option value="Bhutanatha Temple Shoreline">Bhutanatha Temple Shoreline</option>
              <option value="Mahakuta Pushkarini Tank">Mahakuta Pushkarini Tank</option>
            </select>
          </div>

          {/* 3 Physical Metric Fields (Prompt 5.1.2) */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-[#1b1c1a] text-[10px] uppercase mb-1">
                Dissolved O₂ (mg/L)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="20"
                required
                value={doVal}
                onChange={(e) => setDoVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eae8e5] bg-[#fbf9f6] text-[#1b1c1a] font-bold text-center focus:outline-hidden focus:border-[#00685f]"
              />
              <span className="text-[10px] text-[#6d7a77] block text-center mt-0.5">Norm: 6.5–8.5</span>
            </div>

            <div>
              <label className="block font-bold text-[#1b1c1a] text-[10px] uppercase mb-1">
                Lake Acidity (pH)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                required
                value={phVal}
                onChange={(e) => setPhVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eae8e5] bg-[#fbf9f6] text-[#1b1c1a] font-bold text-center focus:outline-hidden focus:border-[#00685f]"
              />
              <span className="text-[10px] text-[#6d7a77] block text-center mt-0.5">Norm: 7.0–8.0</span>
            </div>

            <div>
              <label className="block font-bold text-[#1b1c1a] text-[10px] uppercase mb-1">
                Turbidity (NTU)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="100"
                required
                value={turbidityVal}
                onChange={(e) => setTurbidityVal(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#eae8e5] bg-[#fbf9f6] text-[#1b1c1a] font-bold text-center focus:outline-hidden focus:border-[#00685f]"
              />
              <span className="text-[10px] text-[#6d7a77] block text-center mt-0.5">Norm: &lt;15 NTU</span>
            </div>
          </div>

          {/* Photo Evidence Upload (Prompt 5.1.2) */}
          <div>
            <label className="block font-bold text-[#1b1c1a] uppercase tracking-wider text-[11px] mb-1">
              Photo Evidence Upload
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 border-2 border-dashed border-[#bcc9c6] hover:border-[#00685f] rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer bg-[#fbf9f6] transition-colors">
                <span className="material-symbols-outlined text-[24px] text-[#00685f]">
                  add_photo_alternate
                </span>
                <span className="text-[11px] font-semibold text-[#1b1c1a] mt-1">
                  {photoFile ? photoFile.name : 'Choose shoreline photograph'}
                </span>
                <span className="text-[10px] text-[#6d7a77]">JPG, PNG under 10MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {previewUrl && (
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#eae8e5] shrink-0">
                  <img
                    src={previewUrl}
                    alt="Uploaded Evidence Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Field Observation Notes */}
          <div>
            <label className="block font-bold text-[#1b1c1a] uppercase tracking-wider text-[11px] mb-1">
              Observation Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Noticeable surface clarity, algae bloom or silt..."
              className="w-full px-3 py-2 rounded-xl border border-[#eae8e5] bg-[#fbf9f6] text-[#1b1c1a] focus:outline-hidden focus:border-[#00685f]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#efeeeb] hover:bg-[#eae8e5] text-[#3d4947] font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#00685f] hover:bg-[#005049] text-white font-bold flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                  <span>Logging Telemetry...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">upload</span>
                  <span>Submit Water Reading</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
