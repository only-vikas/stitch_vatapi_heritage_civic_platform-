'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface MicroCrowdfundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue: {
    id: string;
    title: string;
    category?: string;
    jurisdiction?: string;
    photo_url?: string;
  } | null;
  onDonated?: (amount: number, campaignTitle: string) => void;
}

export default function MicroCrowdfundingModal({
  isOpen,
  onClose,
  issue,
  onDonated,
}: MicroCrowdfundingModalProps) {
  const [currentAmount, setCurrentAmount] = useState(2050);
  const [targetAmount, setTargetAmount] = useState(5000);
  const [backersCount, setBackersCount] = useState(41);
  const [campaignId, setCampaignId] = useState('camp-1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [justDonatedAmount, setJustDonatedAmount] = useState<number | null>(null);

  // Fetch campaign info when modal opens
  useEffect(() => {
    if (!isOpen || !issue) return;

    let isMounted = true;

    async function loadCampaign() {
      try {
        const res = await fetch(`/api/crowdfunding?issueId=${issue?.id || ''}`);
        if (res.ok) {
          const data = await res.json();
          if (data.campaigns && data.campaigns.length > 0 && isMounted) {
            const camp = data.campaigns[0];
            setCampaignId(camp.id);
            setCurrentAmount(Number(camp.current_amount) || 2050);
            setTargetAmount(Number(camp.target_amount) || 5000);
            setBackersCount(Number(camp.backers_count) || 41);
          }
        }
      } catch {
        // fallback to default initial state
      }
    }

    loadCampaign();

    // Subscribe to Supabase Realtime for instant live progress bar updates
    let channel: any = null;
    try {
      channel = supabase
        .channel(`crowdfunding-realtime-${issue.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'crowdfunding_campaigns' },
          (payload: any) => {
            if (payload.new && isMounted) {
              if (payload.new.current_amount !== undefined) {
                setCurrentAmount(Number(payload.new.current_amount));
              }
              if (payload.new.backers_count !== undefined) {
                setBackersCount(Number(payload.new.backers_count));
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription notice:', err);
    }

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [isOpen, issue]);

  if (!isOpen || !issue) return null;

  const percent = Math.min(100, Math.round((currentAmount / targetAmount) * 100));

  const handleDonate = async (amount: number) => {
    if (amount <= 0 || isSubmitting) return;

    setIsSubmitting(true);
    setJustDonatedAmount(amount);

    // Optimistic UI update
    setCurrentAmount((prev) => prev + amount);
    setBackersCount((prev) => prev + 1);

    try {
      const res = await fetch('/api/crowdfunding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          issueId: issue.id,
          title: issue.title,
          amount,
          donorName: 'Civic Guardian',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.campaign) {
          setCurrentAmount(Number(data.campaign.current_amount));
          setBackersCount(Number(data.campaign.backers_count));
        }
      }
    } catch (err) {
      console.warn('Donation sync notice:', err);
    } finally {
      setIsSubmitting(false);
      if (onDonated) {
        onDonated(amount, issue.title);
      }
      setTimeout(() => {
        setJustDonatedAmount(null);
        onClose();
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#faf8f5] border border-[#eae8e5] rounded-3xl shadow-[0_24px_60px_-12px_rgba(51,41,27,0.4)] overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <header className="px-6 py-5 bg-white border-b border-[#eae8e5] flex items-start justify-between">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#9a452c] to-[#ba1a1a] flex items-center justify-center text-white shrink-0 shadow-md">
              <span className="material-symbols-outlined text-[22px]">volunteer_activism</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffdbd1] text-[#762b14] border border-[#ffb5a0]">
                  Investor Lane • Micro-Crowdfunding
                </span>
                <span className="text-[11px] font-semibold text-[#00685f] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00685f] animate-ping"></span>
                  Live Realtime
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-[#1b1c1a] mt-1 leading-snug">
                Fund This Fix • Adopt A Crack
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-[#efeeeb] hover:bg-[#eae8e5] text-[#3d4947] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </header>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Issue Summary Card */}
          <div className="p-4 rounded-2xl bg-white border border-[#eae8e5] shadow-2xs space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#6d7a77]">
              Target Heritage Issue
            </div>
            <h4 className="font-serif text-base font-bold text-[#1b1c1a] leading-snug">
              {issue.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-[#6d7a77]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#9a452c]">
                  account_balance
                </span>
                {issue.jurisdiction || 'ASI Dharwad Circle'}
              </span>
              <span>•</span>
              <span className="text-[#00685f] font-semibold">1,400-Year-Old Chalukyan Monument</span>
            </div>
          </div>

          {/* Progress Section */}
          <div className="p-4 rounded-2xl bg-[#fff5f2] border border-[#ffdbd1] space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-serif font-bold text-[#9a452c]">
                  ₹{currentAmount.toLocaleString()}
                </span>
                <span className="text-xs text-[#762b14] font-medium ml-1">
                  / ₹{targetAmount.toLocaleString()} raised
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#9a452c]">{percent}%</span>
                <span className="text-[11px] text-[#6d7a77] block font-medium">
                  {backersCount} citizen backers
                </span>
              </div>
            </div>

            {/* Progress Bar with smooth animation */}
            <div className="w-full h-3 rounded-full bg-[#ffb5a0]/40 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[#9a452c] via-[#ba1a1a] to-[#00685f] rounded-full transition-all duration-700 ease-out shadow-xs"
                style={{ width: `${percent}%` }}
              ></div>
            </div>

            <p className="text-[11px] text-[#762b14] italic">
              Government conservation staff covers 45% of requirements. Your micro-donation directly funds local stonecraft micro-grouting &amp; non-invasive mortar repair.
            </p>
          </div>

          {/* Three Large Buttons (Prompt: ₹10, ₹50, ₹100) */}
          <div className="space-y-2.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#3d4947]">
              Select Contribution Amount
            </label>

            <div className="grid grid-cols-3 gap-3">
              {/* ₹10 Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDonate(10)}
                className="group relative p-4 rounded-2xl bg-white hover:bg-[#fff5f2] border-2 border-[#eae8e5] hover:border-[#9a452c] text-center transition-all shadow-xs hover:shadow-md flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="font-serif text-2xl font-bold text-[#9a452c] group-hover:scale-105 transition-transform">
                  ₹10
                </span>
                <span className="text-[11px] font-semibold text-[#1b1c1a]">Adopt a Crack</span>
                <span className="text-[9px] text-[#6d7a77]">Micro-patron</span>
              </button>

              {/* ₹50 Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDonate(50)}
                className="group relative p-4 rounded-2xl bg-white hover:bg-[#fff5f2] border-2 border-[#9a452c] text-center transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-1 active:scale-95 ring-2 ring-[#9a452c]/10"
              >
                <span className="absolute -top-2.5 px-2 py-0.2 rounded-full bg-[#9a452c] text-white text-[9px] font-bold uppercase tracking-wider">
                  Popular
                </span>
                <span className="font-serif text-2xl font-bold text-[#9a452c] group-hover:scale-105 transition-transform">
                  ₹50
                </span>
                <span className="text-[11px] font-semibold text-[#1b1c1a]">Mortar Seal</span>
                <span className="text-[9px] text-[#6d7a77]">Standard patch</span>
              </button>

              {/* ₹100 Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleDonate(100)}
                className="group relative p-4 rounded-2xl bg-white hover:bg-[#fff5f2] border-2 border-[#eae8e5] hover:border-[#9a452c] text-center transition-all shadow-xs hover:shadow-md flex flex-col items-center justify-center gap-1 active:scale-95"
              >
                <span className="font-serif text-2xl font-bold text-[#9a452c] group-hover:scale-105 transition-transform">
                  ₹100
                </span>
                <span className="text-[11px] font-semibold text-[#1b1c1a]">Guardian Patron</span>
                <span className="text-[9px] text-[#6d7a77]">Full bracket seal</span>
              </button>
            </div>

            {/* Custom Amount Toggle */}
            <div className="pt-2 text-center">
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="text-xs font-semibold text-[#00685f] hover:underline"
                >
                  Or enter custom amount
                </button>
              ) : (
                <div className="flex items-center gap-2 max-w-xs mx-auto">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-xs font-bold text-[#6d7a77]">
                      ₹
                    </span>
                    <input
                      type="number"
                      min={10}
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-[#bcc9c6] bg-white font-bold text-[#1b1c1a] focus:outline-none focus:ring-1 focus:ring-[#9a452c]"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isSubmitting || !customAmount || Number(customAmount) < 5}
                    onClick={() => handleDonate(Number(customAmount))}
                    className="px-4 py-2 rounded-xl bg-[#9a452c] text-white text-xs font-bold disabled:opacity-50"
                  >
                    Contribute
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Success State Indicator */}
          {justDonatedAmount && (
            <div className="p-3.5 rounded-2xl bg-[#e6f4ea] border border-[#a8dab5] text-[#137333] text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>₹{justDonatedAmount} micro-pledge logged to Karnataka Heritage Grid!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 bg-[#f5f3f0] border-t border-[#eae8e5] flex items-center justify-between text-[11px] text-[#6d7a77]">
          <span>Protected under Karnataka Ancient Monuments Act &bull; Instant Ledger Hash</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9a452c] hover:underline font-bold"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
