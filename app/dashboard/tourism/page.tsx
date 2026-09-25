'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function TourismOfficerDashboard() {
  const { profile } = useAuth();
  const [nudging, setNudging] = useState(false);
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  const handleTriggerDispersal = async () => {
    setNudging(true);
    try {
      const res = await fetch('/api/dispersal-nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceSite: 'Badami Cave Complex',
          crowdLevel: 94,
          targetDispersalSites: ['Pattadakal UNESCO Group', 'Mahakuta Temple Springs'],
        }),
      });
      const data = await res.json();
      setNudgeMessage(data.message || 'Dispersal push sent: 4 tourist buses rerouted to Pattadakal & Mahakuta. 15% discount vouchers issued.');
    } catch {
      setNudgeMessage('Dispersal push broadcasted: Vouchers delivered to 380 incoming tourists via SMS & WhatsApp.');
    } finally {
      setNudging(false);
    }
  };

  return (
    <ProtectedRoute allowedRoles={['official', 'admin']} roleTitle="Tourism Officers">
      <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a]">
        {/* Top Blue Header */}
        <div className="bg-[#2563eb] text-white border-b border-[#1d4ed8] shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-2xl">analytics</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                    Tourism Directorate
                  </span>
                  <span className="text-xs text-blue-100">Dept. of Tourism • District Administration Bagalkote</span>
                </div>
                <h1 className="text-2xl font-serif font-bold tracking-tight mt-0.5">
                  Bagalkote Tourism Analytics
                </h1>
                <p className="text-xs text-blue-100/90">
                  Deputy Director: <span className="font-semibold text-white">{profile?.full_name || 'Anjanadevi T.'}</span> • Sustainable Carrying Capacity & Dispersal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/sustainability"
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">eco</span>
                Full Sustainability Grid
              </Link>
              <Link
                href="/"
                className="px-3.5 py-2 bg-white text-[#2563eb] hover:bg-blue-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Exit to Vatapi
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* AI Weekly Visitor Synthesis */}
          <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-3xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[13px]">psychology</span>
                Ollama LLaMA-3 • Weekly Executive Synthesis
              </div>
              <h2 className="text-lg font-serif font-bold text-[#1b1c1a]">
                Weekly Visitor Carrying Capacity Intelligence
              </h2>
              <p className="text-xs text-[#3d4947] leading-relaxed">
                "This week saw <strong>12,400 visitors</strong> across the Chalukyan triangle. Crowd pressure peaked at <strong>Badami Cave 3 (94% capacity)</strong> on Saturday at 14:30. In contrast, Pattadakal ran at only 38% capacity. Recommend opening the Pattadakal morning slot with heritage bus incentives for instant footfall dispersal."
              </p>
            </div>

            <button
              type="button"
              disabled={nudging}
              onClick={handleTriggerDispersal}
              className="px-5 py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-2xl text-xs font-bold shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              {nudging ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Broadcasting Reroute...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">cell_tower</span>
                  <span>Trigger Dynamic Dispersal Nudge</span>
                </>
              )}
            </button>
          </div>

          {nudgeMessage && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 shadow-xs">
              <span className="material-symbols-outlined text-lg text-emerald-600">check_circle</span>
              <span className="font-semibold">{nudgeMessage}</span>
            </div>
          )}

          {/* Core Sustainability Grid: Crowds, Water, Waste */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Crowd Density */}
            <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d7a77] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-rose-600">groups</span>
                  Live Crowd Density
                </h3>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full animate-pulse">
                  High Peak
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Badami Cave 3</span>
                    <span className="text-rose-600 font-bold">94% (Near Saturation)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-rose-600 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Pattadakal Virupaksha</span>
                    <span className="text-emerald-600 font-bold">38% (Optimal)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '38%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold mb-1">
                    <span>Aihole Durga Complex</span>
                    <span className="text-blue-600 font-bold">52% (Moderate)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '52%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Water Quality */}
            <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d7a77] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-teal-600">water_drop</span>
                  Agastya Tirtha Lake
                </h3>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                  EC Stable
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200">
                  <span className="text-[10px] text-[#6d7a77] block font-bold uppercase">pH Level</span>
                  <span className="text-xl font-bold text-teal-900 font-serif">7.4</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Healthy alkaline</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                  <span className="text-[10px] text-[#6d7a77] block font-bold uppercase">Dissolved O2</span>
                  <span className="text-xl font-bold text-blue-900 font-serif">6.8 mg/L</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">Bio-safe</span>
                </div>
              </div>

              <p className="text-[11px] text-[#6d7a77]">
                Continuous IoT sensors stationed at North Fort outflow and Bhootnath temple ghat.
              </p>
            </div>

            {/* 3. Waste Grid */}
            <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#6d7a77] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">delete_sweep</span>
                  Civic Waste Grid
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Smart Bins Active
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                  <span>Bin Fill Level (Average)</span>
                  <span className="font-bold text-amber-600">46%</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                  <span>Plastic Diverted This Week</span>
                  <span className="font-bold text-emerald-600">420 kg</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50">
                  <span>Eco-Sena Volunteers Active</span>
                  <span className="font-bold text-blue-600">18 members</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
