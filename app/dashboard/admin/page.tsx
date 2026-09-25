'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DistrictAdminDashboard() {
  const { profile } = useAuth();

  const [activeLaneTab, setActiveLaneTab] = useState<'all' | 'government' | 'community' | 'investor'>('all');

  return (
    <ProtectedRoute allowedRoles={['admin']} roleTitle="District Commissioner">
      <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a]">
        {/* Top Deep Basalt Header */}
        <div className="bg-[#1e293b] text-white border-b border-[#0f172a] shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                    Apex Executive Authority
                  </span>
                  <span className="text-xs text-slate-300">Office of the Deputy Commissioner • Bagalkote District</span>
                </div>
                <h1 className="text-2xl font-serif font-bold tracking-tight mt-0.5">
                  Bagalkote District Command
                </h1>
                <p className="text-xs text-slate-300">
                  Magistrate: <span className="font-semibold text-white">{profile?.full_name || 'District Commissioner'}</span> • Unified Civic, Archaeological & Economic Oversight
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/heritage-watch"
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                Live Public Ledger
              </Link>
              <Link
                href="/"
                className="px-3.5 py-2 bg-white text-[#1e293b] hover:bg-slate-100 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Exit to Vatapi
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Top Urgent Alert: Escalated Issues */}
          <div className="border-2 border-red-500/80 bg-red-50/70 rounded-3xl p-6 shadow-md animate-pulse duration-1000">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">priority_high</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-red-700">
                      SLA Escalation Flagged to DC Desk
                    </span>
                    <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold">
                      Immediate Intervention
                    </span>
                  </div>
                  <h2 className="text-base font-serif font-bold text-red-950 mt-0.5">
                    ASI-BDM-1021: Micro-fissure expansion on Varaha Relief Base (Badami Cave 2)
                  </h2>
                  <p className="text-xs text-red-900 mt-0.5">
                    Elapsed 44 hours without chemical consolidation. ASI Dharwad field team has been issued statutory district notice.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  href="/dashboard/asi"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Intervene in ASI Lane
                </Link>
              </div>
            </div>
          </div>

          {/* District Health Score & 4 Pillar KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {/* Circular Gauge Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-xs flex flex-col items-center justify-center text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6d7a77] mb-2">
                District Health Score
              </span>
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#00685f]"
                    strokeDasharray="92, 100"
                    strokeWidth="3.8"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-serif font-bold text-[#1b1c1a]">92</span>
                  <span className="text-[10px] font-bold text-[#00685f] uppercase tracking-wider">A+ Robust</span>
                </div>
              </div>
              <p className="text-[10px] text-[#6d7a77] mt-3">
                Combined index: Heritage Stability, Water Purity, Carrying Capacity & Artisan Revenue.
              </p>
            </div>

            {/* Gov Lane KPI */}
            <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9a452c]">Government Lane</span>
                  <span className="material-symbols-outlined text-[#9a452c]">account_balance</span>
                </div>
                <p className="text-3xl font-serif font-bold text-[#1b1c1a] mt-2">24</p>
                <p className="text-xs text-[#6d7a77] mt-1">Active ASI Archaeological Alerts</p>
              </div>
              <Link href="/dashboard/asi" className="text-xs text-[#9a452c] font-bold mt-4 hover:underline">
                View ASI Dharwad →
              </Link>
            </div>

            {/* Community Lane KPI */}
            <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">Community Lane</span>
                  <span className="material-symbols-outlined text-[#059669]">volunteer_activism</span>
                </div>
                <p className="text-3xl font-serif font-bold text-[#1b1c1a] mt-2">18</p>
                <p className="text-xs text-[#6d7a77] mt-1">Eco-Sena Verified Cleanups</p>
              </div>
              <Link href="/dashboard/volunteer" className="text-xs text-[#059669] font-bold mt-4 hover:underline">
                View Volunteer Hub →
              </Link>
            </div>

            {/* Investor Lane KPI */}
            <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#d97706]">Investor Lane</span>
                  <span className="material-symbols-outlined text-[#d97706]">trending_up</span>
                </div>
                <p className="text-3xl font-serif font-bold text-[#1b1c1a] mt-2">₹19.5 L</p>
                <p className="text-xs text-[#6d7a77] mt-1">Civic PPP Pipeline Capital</p>
              </div>
              <Link href="/dashboard/investor" className="text-xs text-[#d97706] font-bold mt-4 hover:underline">
                View Investment Gaps →
              </Link>
            </div>
          </div>

          {/* Unified Cross-Lane Ledger */}
          <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#1b1c1a]">
                  Unified District Civic Ledger
                </h3>
                <p className="text-xs text-[#6d7a77]">
                  Aggregating all triaged reports across Government, Community, and Investment lanes
                </p>
              </div>

              {/* Filter Tabs */}
              <div className="flex p-1 bg-[#efeeeb] rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveLaneTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeLaneTab === 'all' ? 'bg-white text-[#1b1c1a] shadow-xs' : 'text-[#6d7a77]'
                  }`}
                >
                  All Lanes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLaneTab('government')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeLaneTab === 'government' ? 'bg-white text-[#9a452c] shadow-xs' : 'text-[#6d7a77]'
                  }`}
                >
                  Government (ASI)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLaneTab('community')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeLaneTab === 'community' ? 'bg-white text-[#059669] shadow-xs' : 'text-[#6d7a77]'
                  }`}
                >
                  Community
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLaneTab('investor')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeLaneTab === 'investor' ? 'bg-white text-[#d97706] shadow-xs' : 'text-[#6d7a77]'
                  }`}
                >
                  Investor
                </button>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#eae8e5] text-[11px] font-bold text-[#6d7a77] uppercase">
                    <th className="py-2.5">ID & Issue</th>
                    <th className="py-2.5">Lane</th>
                    <th className="py-2.5">Lead Stakeholder</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">District Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eae8e5]">
                  <tr>
                    <td className="py-3">
                      <span className="font-mono font-bold text-[#9a452c]">ASI-BDM-1021</span>
                      <p className="font-semibold text-[#1b1c1a]">Varaha Relief Base Fissure</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-orange-100 text-[#9a452c] font-bold text-[10px]">
                        Government
                      </span>
                    </td>
                    <td className="py-3 text-[#3d4947]">Dr. Basavaraj Hiremath (ASI)</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                        Escalated
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="px-3 py-1 bg-red-600 text-white rounded-lg font-bold text-[11px]">
                        Enforce SLA
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3">
                      <span className="font-mono font-bold text-emerald-700">VOL-ECO-101</span>
                      <p className="font-semibold text-[#1b1c1a]">Agastya Tirtha Plastic Bottle Clean</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[#059669] font-bold text-[10px]">
                        Community
                      </span>
                    </td>
                    <td className="py-3 text-[#3d4947]">Priya Kulkarni (Eco-Sena)</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        In Progress
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="px-3 py-1 bg-stone-100 text-[#1b1c1a] rounded-lg font-semibold text-[11px]">
                        Log Proof
                      </button>
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3">
                      <span className="font-mono font-bold text-amber-700">INV-GAP-01</span>
                      <p className="font-semibold text-[#1b1c1a]">Pattadakal Heritage Cafe PPP</p>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                        Investor
                      </span>
                    </td>
                    <td className="py-3 text-[#3d4947]">R. Gaddigoudar (Malaprabha)</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        PPP Clearance
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px]">
                        Approve Grant
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
