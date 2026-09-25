'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

interface ArtisanOrder {
  id: string;
  customerName: string;
  item: string;
  motif: string;
  price: number;
  date: string;
  status: 'weaving' | 'quality_check' | 'ready_to_ship';
}

const SEED_ORDERS: ArtisanOrder[] = [
  {
    id: 'ORD-ILK-501',
    customerName: 'Meera Rao (Bengaluru)',
    item: 'Traditional Ilkal Silk Saree with Chikki Paras Border',
    motif: 'Badami Cave 1 Lotus Medallion',
    price: 6800,
    date: '2026-09-24',
    status: 'weaving',
  },
  {
    id: 'ORD-ILK-502',
    customerName: 'Sunil Hedge (Mumbai)',
    item: 'Handloom Cotton Kasuti Embroidered Dupatta',
    motif: 'Gopura Stupa Temple Motif',
    price: 3200,
    date: '2026-09-22',
    status: 'quality_check',
  },
  {
    id: 'ORD-ILK-503',
    customerName: 'Elena V. (Berlin)',
    item: 'Pure Zari Topeli Teni Pallu Heritage Drape',
    motif: 'Aihole Durga Temple Rosette',
    price: 8400,
    date: '2026-09-20',
    status: 'ready_to_ship',
  },
];

export default function ArtisanDashboard() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<ArtisanOrder[]>(SEED_ORDERS);
  const [selectedMotif, setSelectedMotif] = useState('Cave 1 Ceiling Lotus');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<any>(null);

  const handleRunDesignAssist = () => {
    setAiGenerating(true);
    setTimeout(() => {
      setGeneratedDraft({
        motifName: selectedMotif,
        warpCount: '2/120s Combed Mercerized Cotton',
        weftZari: 'Real Silver Tested Zari (Grade 1)',
        loomSetting: 'Jacquard 240 Hooks • Pit Loom Tie-up',
        colorPalette: ['Crimson Terracotta (#9a452c)', 'Badami Ochre (#d97706)', 'Forest Green (#00685f)'],
        aiNote: 'Ollama Design Assist: Symmetrical rotation calibrated to avoid warp tension slippage on traditional Ilkal pit looms.',
      });
      setAiGenerating(false);
    }, 1200);
  };

  return (
    <ProtectedRoute allowedRoles={['artisan', 'admin']} roleTitle="Handloom Artisans">
      <div className="min-h-screen bg-[#fbf9f6] text-[#1b1c1a]">
        {/* Top Purple Header */}
        <div className="bg-[#7c3aed] text-white border-b border-[#6d28d9] shadow-md">
          <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-2xl">palette</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                    Artisan Weaver Guild
                  </span>
                  <span className="text-xs text-purple-100">Ilkal & Guledgudda Khadi Cooperative</span>
                </div>
                <h1 className="text-2xl font-serif font-bold tracking-tight mt-0.5">
                  Kasturbai Ilkal • Weaver Studio
                </h1>
                <p className="text-xs text-purple-100/90">
                  Master Artisan: <span className="font-semibold text-white">{profile?.full_name || 'Kasturbai Ilkal'}</span> • 5th Generation Kasuti & Ilkal Saree Weaver
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/weavers"
                className="px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">storefront</span>
                Public Guild Store
              </Link>
              <Link
                href="/"
                className="px-3.5 py-2 bg-white text-[#7c3aed] hover:bg-purple-50 rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">home</span>
                Exit to Vatapi
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* 3 KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-[#eae8e5] shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6d7a77]">This Month's Earnings</p>
                  <p className="text-3xl font-serif font-bold text-[#7c3aed] mt-1">₹18,400</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7c3aed] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">payments</span>
                </div>
              </div>
              <p className="text-[11px] text-emerald-600 font-semibold mt-3 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                100% direct buyer payout (0% middleman margin)
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#eae8e5] shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6d7a77]">Pending Orders</p>
                  <p className="text-3xl font-serif font-bold text-amber-600 mt-1">3</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">hourglass_top</span>
                </div>
              </div>
              <p className="text-[11px] text-[#6d7a77] mt-3">
                All 3 orders commissioned directly via Vatapi Weavers portal
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#eae8e5] shadow-xs">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#6d7a77]">Loom Visits Booked</p>
                  <p className="text-3xl font-serif font-bold text-[#00685f] mt-1">2</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#00685f] flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">event_available</span>
                </div>
              </div>
              <p className="text-[11px] text-[#6d7a77] mt-3">
                Next visit: Saturday 11:00 AM (Tourists from Bengaluru)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Cols: Orders & Fair-Price Ledger */}
            <div className="lg:col-span-2 space-y-6">
              {/* Incoming Orders */}
              <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-serif font-bold text-[#1b1c1a]">
                      Incoming Loom Commissions
                    </h2>
                    <p className="text-xs text-[#6d7a77]">Direct customer orders waiting on your loom</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-50 text-[#7c3aed] text-xs font-bold border border-purple-200">
                    Live Queue
                  </span>
                </div>

                <div className="space-y-3">
                  {orders.map((ord) => {
                    const statusBadge =
                      ord.status === 'weaving'
                        ? 'bg-amber-100 text-amber-800'
                        : ord.status === 'quality_check'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800';

                    return (
                      <div
                        key={ord.id}
                        className="p-4 rounded-2xl border border-[#eae8e5] hover:border-purple-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                              {ord.id}
                            </span>
                            <span className="text-xs font-bold text-[#1b1c1a]">{ord.customerName}</span>
                          </div>
                          <p className="text-xs font-semibold text-[#3d4947] mt-1">{ord.item}</p>
                          <p className="text-[11px] text-[#6d7a77] mt-0.5">
                            Motif: <span className="text-purple-700 font-medium">{ord.motif}</span>
                          </p>
                        </div>

                        <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 shrink-0">
                          <span className="font-serif font-bold text-base text-[#1b1c1a]">
                            ₹{ord.price.toLocaleString()}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge}`}>
                            {ord.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fair-Price Ledger */}
              <div className="bg-white rounded-3xl p-6 border border-[#eae8e5] shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-serif font-bold text-[#1b1c1a]">
                      Fair-Price Ledger (Zero-Middleman Transparency)
                    </h3>
                    <p className="text-xs text-[#6d7a77]">
                      Every rupee deposited directly into Kasturbai's Canara Bank account
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-emerald-600">verified</span>
                </div>

                <div className="overflow-x-auto text-xs">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#eae8e5] text-[11px] font-bold text-[#6d7a77] uppercase">
                        <th className="py-2">Date</th>
                        <th className="py-2">Description</th>
                        <th className="py-2">Customer / Source</th>
                        <th className="py-2 text-right">Direct Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eae8e5]">
                      <tr>
                        <td className="py-2.5 text-[#6d7a77] font-mono">2026-09-24</td>
                        <td className="py-2.5 font-semibold text-[#1b1c1a]">Advance Payout • ORD-ILK-501</td>
                        <td className="py-2.5 text-[#3d4947]">Meera Rao (UPI)</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700 font-mono">+₹3,400</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-[#6d7a77] font-mono">2026-09-21</td>
                        <td className="py-2.5 font-semibold text-[#1b1c1a]">Loom Experiential Tour Fee</td>
                        <td className="py-2.5 text-[#3d4947]">Tourist Group (2 Visitors)</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700 font-mono">+₹1,200</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 text-[#6d7a77] font-mono">2026-09-18</td>
                        <td className="py-2.5 font-semibold text-[#1b1c1a]">Full Settlement • ORD-ILK-498</td>
                        <td className="py-2.5 text-[#3d4947]">Heritage Store Hubli</td>
                        <td className="py-2.5 text-right font-bold text-emerald-700 font-mono">+₹13,800</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Chitra-Sutra AI Design Assist */}
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-6 border-2 border-purple-200 shadow-md">
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-[#7c3aed] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">auto_awesome</span>
                    Chitra-Sutra AI
                  </span>
                  <span className="text-[11px] text-[#6d7a77]">Loom Design Assist</span>
                </div>

                <h3 className="text-base font-serif font-bold text-[#1b1c1a]">
                  Temple Motif to Loom Graph
                </h3>
                <p className="text-xs text-[#6d7a77] mt-1">
                  Select a Chalukyan archaeological carving to generate weave draft parameters:
                </p>

                <div className="mt-4 space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4947]">
                    Choose Monument Motif
                  </label>
                  <select
                    value={selectedMotif}
                    onChange={(e) => setSelectedMotif(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#bcc9c6] bg-white text-xs font-semibold text-[#1b1c1a]"
                  >
                    <option value="Cave 1 Ceiling Lotus">Badami Cave 1 • Symmetrical Ceiling Lotus</option>
                    <option value="Cave 3 Adisesha Wave">Badami Cave 3 • Serpent Coils of Adisesha</option>
                    <option value="Aihole Durga Rosette">Aihole Durga Temple • Apsidal Rosette</option>
                    <option value="Pattadakal Kasuti Ganda Bherunda">Pattadakal • Double-Headed Eagle</option>
                  </select>

                  <button
                    type="button"
                    disabled={aiGenerating}
                    onClick={handleRunDesignAssist}
                    className="w-full py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#9a452c] text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-95 transition-all flex items-center justify-center gap-1.5"
                  >
                    {aiGenerating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Computing Weave Geometry...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">draw</span>
                        Generate Loom Draft
                      </>
                    )}
                  </button>
                </div>

                {generatedDraft && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs space-y-2 animate-in fade-in duration-150">
                    <p className="font-bold text-purple-900">{generatedDraft.motifName}</p>
                    <div className="space-y-1 text-[11px] text-[#3d4947]">
                      <div><strong>Warp:</strong> {generatedDraft.warpCount}</div>
                      <div><strong>Weft:</strong> {generatedDraft.weftZari}</div>
                      <div><strong>Loom:</strong> {generatedDraft.loomSetting}</div>
                    </div>
                    <div className="pt-1">
                      <span className="text-[10px] uppercase font-bold text-[#6d7a77] block mb-1">Color Palette:</span>
                      <div className="flex gap-1.5">
                        {generatedDraft.colorPalette.map((c: string) => (
                          <span key={c} className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-purple-200 text-[#1b1c1a]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-purple-800 italic pt-1">{generatedDraft.aiNote}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
