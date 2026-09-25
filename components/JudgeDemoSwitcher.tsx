'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_PERSONAS, DemoPersona } from '@/context/AuthContext';

export default function JudgeDemoSwitcher() {
  const router = useRouter();
  const { profile, activePersona, signInAsPersona, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSwitching, setIsSwitching] = useState<string | null>(null);

  const handleRoleSelect = async (persona: DemoPersona) => {
    setIsSwitching(persona.email);
    try {
      const res = await signInAsPersona(persona.email);
      setIsOpen(false);
      router.push(res.targetPath);
    } catch (e) {
      console.error('Role switch error', e);
    } finally {
      setIsSwitching(null);
    }
  };

  const currentColor = activePersona?.color || '#00685f';
  const isNonCitizen = activePersona && activePersona.role !== 'citizen';

  return (
    <>
      {/* 5. VISUAL ROLE INDICATOR (Top strip for non-citizen roles) */}
      {isNonCitizen && (
        <div
          className="fixed top-0 left-0 right-0 h-1.5 z-50 pointer-events-none shadow-sm transition-all"
          style={{ backgroundColor: currentColor }}
        />
      )}

      {/* 1. FLOATING DEMO BANNER AT BOTTOM-LEFT */}
      <div className="fixed bottom-6 left-6 z-50 select-none">
        {/* Presenter Script Tooltip Popover */}
        {showTooltip && (
          <div className="absolute bottom-14 left-0 w-80 p-4 rounded-2xl bg-[#1b1c1a] text-white text-xs shadow-2xl border border-white/20 mb-2 animate-in fade-in duration-150 z-50">
            <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
              <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">lightbulb</span>
                Judge 3-Minute Demo Pitch
              </span>
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              "Start as <strong>Citizen</strong>. Report an issue. Switch to <strong>ASI Officer</strong>. See it appear with an SLA clock. Switch to <strong>Volunteer</strong>. Adopt it & upload cleanup proof. Switch to <strong>Investor</strong>. Fund a micro-project. Switch to <strong>DC</strong>. See the escalation."
            </p>
          </div>
        )}

        {/* The Role Switcher Menu Popover */}
        {isOpen && (
          <div className="absolute bottom-14 left-0 w-80 bg-white rounded-3xl shadow-2xl border border-[#eae8e5] p-4 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#eae8e5] mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1b1c1a]">
                  Instant Role Shift
                </h4>
                <p className="text-[10px] text-[#6d7a77]">Transform the entire platform in &lt;1s</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[#6d7a77] hover:text-[#1b1c1a] p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
              {DEMO_PERSONAS.map((p) => {
                const isActive = activePersona?.email === p.email;
                const isThisSwitching = isSwitching === p.email;
                return (
                  <button
                    key={p.roleLabel}
                    type="button"
                    disabled={isThisSwitching}
                    onClick={() => handleRoleSelect(p)}
                    className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left border transition-all text-xs ${
                      isActive
                        ? 'border-amber-400 bg-amber-50/70 font-bold shadow-xs'
                        : 'border-[#eae8e5] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 shadow-2xs"
                      style={{ backgroundColor: p.color }}
                    >
                      {isThisSwitching ? (
                        <span className="material-symbols-outlined text-[14px] animate-spin">sync</span>
                      ) : (
                        <span className="material-symbols-outlined text-[15px]">{p.icon}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#1b1c1a] truncate">{p.roleLabel}</span>
                        {isActive && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#6d7a77] truncate">{p.organization}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 mt-2 border-t border-[#eae8e5] flex justify-between items-center text-[10px] text-[#6d7a77]">
              <span>Current: <strong className="text-[#1b1c1a]">{activePersona?.roleLabel || 'Citizen'}</strong></span>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-[#ba1a1a] hover:underline font-semibold"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Main Floating Pill Button */}
        <div className="flex items-center gap-1.5 bg-[#1b1c1a] text-white pl-3.5 pr-2 py-2 rounded-full shadow-2xl border border-white/20 backdrop-blur-md hover:scale-[1.02] transition-transform">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 text-xs font-semibold focus:outline-none"
          >
            <span
              className="w-2.5 h-2.5 rounded-full animate-ping"
              style={{ backgroundColor: currentColor }}
            />
            <span className="hidden sm:inline">Judge Demo Mode •</span>
            <span className="font-bold underline decoration-amber-400 underline-offset-2">
              {activePersona?.roleLabel || 'Switch Role'}
            </span>
            <span className="material-symbols-outlined text-[16px] text-white/70">
              {isOpen ? 'expand_more' : 'expand_less'}
            </span>
          </button>

          {/* Script Tooltip Button */}
          <button
            type="button"
            onClick={() => setShowTooltip(!showTooltip)}
            onMouseEnter={() => setShowTooltip(true)}
            title="View 3-Minute Demo Pitch Script"
            className="w-6 h-6 rounded-full bg-white/15 hover:bg-white/30 text-amber-300 font-bold text-[11px] flex items-center justify-center shrink-0 ml-1 transition-colors"
          >
            ?
          </button>
        </div>
      </div>
    </>
  );
}
