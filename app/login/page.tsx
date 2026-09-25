'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, DEMO_PERSONAS, DemoPersona } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, signIn, signUp, signOut, signInAsPersona, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'citizen' | 'official' | 'artisan'>('citizen');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [switchingPersona, setSwitchingPersona] = useState<string | null>(null);

  const getRedirectForRole = (userRole: string, organization?: string | null, email?: string) => {
    if (email?.includes('tourism') || organization?.toLowerCase().includes('tourism')) {
      return '/dashboard/tourism';
    }
    if (userRole === 'official' || organization?.toLowerCase().includes('asi')) {
      return '/dashboard/asi';
    }
    if (userRole === 'volunteer') {
      return '/dashboard/volunteer';
    }
    if (userRole === 'investor') {
      return '/dashboard/investor';
    }
    if (userRole === 'artisan') {
      return '/dashboard/artisan';
    }
    if (userRole === 'admin') {
      return '/dashboard/admin';
    }
    return '/';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error, data } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Login failed. Please check your credentials.');
        } else {
          setSuccessMsg('Signed in successfully! Redirecting...');
          const target = getRedirectForRole(profile?.role || 'citizen', profile?.organization, email);
          setTimeout(() => router.push(target), 800);
        }
      } else {
        const { error, data } = await signUp(email, password, username, role);
        if (error) {
          setErrorMsg(error.message || 'Signup failed.');
        } else {
          if (data?.session) {
            setSuccessMsg('Account created and signed in! Redirecting...');
            const target = getRedirectForRole(role);
            setTimeout(() => router.push(target), 800);
          } else {
            setSuccessMsg('Account registered! Please sign in with your credentials.');
            setMode('login');
          }
        }
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = async (persona: DemoPersona) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setSwitchingPersona(persona.email);
    try {
      const res = await signInAsPersona(persona.email);
      setSuccessMsg(`Signed in as ${persona.roleLabel} (${persona.fullName})!`);
      setTimeout(() => {
        router.push(persona.dashboardPath);
      }, 500);
    } catch (err: any) {
      setErrorMsg('Could not switch role. Please try again.');
    } finally {
      setSwitchingPersona(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col justify-between selection:bg-[#9a452c]/20">
      {/* Top Header */}
      <header className="border-b border-[#eae8e5] bg-[#ffffff]/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9a452c] to-[#00685f] flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm transition-transform group-hover:scale-105">
              V
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-[#9a452c] tracking-tight">Vatapi</span>
              <span className="block text-[11px] uppercase tracking-wider text-[#6d7a77] font-semibold">
                Multi-Stakeholder Heritage Grid
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-xs font-semibold uppercase tracking-wider text-[#3d4947] hover:text-[#00685f] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Platform
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-[#eae8e5] p-6 sm:p-10 transition-all">
          {/* Active Session Card */}
          {user ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#9a452c]/10 to-[#00685f]/15 text-[#00685f] mx-auto flex items-center justify-center mb-3 border border-[#00685f]/20">
                <span className="material-symbols-outlined text-3xl text-[#00685f]">verified_user</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1b1c1a]">Active Persona</h2>
              <p className="text-sm text-[#6d7a77] mt-0.5">{profile?.full_name || user.email}</p>
              
              <div className="mt-5 p-4 rounded-2xl bg-[#f5f3f0] border border-[#eae8e5] text-left text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#6d7a77] font-medium">Role:</span>
                  <span className="font-bold text-[#00685f] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#00685f]/10">
                    {profile?.role || 'Citizen'}
                  </span>
                </div>
                {profile?.organization && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#6d7a77] font-medium">Organization:</span>
                    <span className="font-semibold text-[#1b1c1a]">{profile.organization}</span>
                  </div>
                )}
                {profile?.jurisdiction && (
                  <div className="flex justify-between items-center">
                    <span className="text-[#6d7a77] font-medium">Jurisdiction:</span>
                    <span className="font-semibold text-[#1b1c1a]">{profile.jurisdiction}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[#6d7a77] font-medium">Email / ID:</span>
                  <span className="font-mono text-[11px] text-[#3d4947] truncate max-w-[220px]">{user.email || profile?.username}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const target = getRedirectForRole(profile?.role || 'citizen', profile?.organization, user.email);
                    router.push(target);
                  }}
                  className="w-full py-3 px-4 bg-[#00685f] hover:bg-[#008378] text-white font-semibold rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  Enter Role Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full py-2.5 px-4 bg-transparent border border-[#eae8e5] hover:bg-[#ffdad6]/30 text-[#ba1a1a] font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-xs"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  Sign Out
                </button>
              </div>

              {/* Demo Quick Switcher in active state */}
              <div className="mt-8 pt-6 border-t border-[#eae8e5]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#3d4947]">
                    Judge Demo Mode • Switch Role
                  </span>
                  <span className="text-[11px] text-[#6d7a77]">Instant 1-Click</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {DEMO_PERSONAS.map((p) => (
                    <button
                      key={p.roleLabel}
                      type="button"
                      disabled={switchingPersona === p.email}
                      onClick={() => handleQuickLogin(p)}
                      style={{ borderColor: p.color }}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all text-xs font-medium hover:shadow-sm ${
                        profile?.username === p.email ? 'bg-amber-50 shadow-inner' : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px] shrink-0" style={{ color: p.color }}>
                        {p.icon}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-[#1b1c1a] leading-none truncate">{p.roleLabel}</div>
                        <div className="text-[10px] text-[#6d7a77] truncate mt-0.5">{p.organization}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              {/* Header Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbd1] text-[#9a452c] text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#9a452c] animate-pulse"></span>
                  Multi-Perspective Civic Access
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#1b1c1a]">
                  {mode === 'login' ? 'Sign in to Vatapi' : 'Join the Vatapi Grid'}
                </h1>
                <p className="text-xs sm:text-sm text-[#6d7a77] mt-1.5">
                  Access tailored views for Citizens, ASI Conservators, Weavers, Volunteers & District Administrators.
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex p-1 bg-[#efeeeb] rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    mode === 'login'
                      ? 'bg-white text-[#1b1c1a] shadow-sm'
                      : 'text-[#6d7a77] hover:text-[#1b1c1a]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-[#1b1c1a] shadow-sm'
                      : 'text-[#6d7a77] hover:text-[#1b1c1a]'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Feedback messages */}
              {errorMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/30 text-[#93000a] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3.5 rounded-xl bg-[#e6f4ea] border border-[#137333]/30 text-[#137333] text-xs flex items-center gap-2">
                  <span className="material-symbols-outlined text-base shrink-0">check_circle</span>
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#3d4947] uppercase tracking-wider mb-1.5">
                        Display Name / Organization
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. Dr. Hiremath / Eco-Sena"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#3d4947] uppercase tracking-wider mb-1.5">
                        Your Platform Role
                      </label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value as any)}
                        className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f] text-sm"
                      >
                        <option value="citizen">Citizen / Heritage Traveller</option>
                        <option value="official">ASI / Municipal Civic Official</option>
                        <option value="artisan">Guledgudda / Ilkal Handloom Artisan</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#3d4947] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="asi.officer@vatapi.demo"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#3d4947] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f] text-sm"
                  />
                  <div className="flex justify-between items-center text-[11px] text-[#6d7a77] mt-1">
                    <span>Default demo password: <code>demo1234</code></span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full mt-2 py-3 px-4 bg-[#00685f] hover:bg-[#008378] text-white font-semibold rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>{mode === 'login' ? 'Sign In with Supabase' : 'Create Supabase Account'}</span>
                  )}
                </button>
              </form>

              {/* DEMO QUICK LOGIN SECTION */}
              <div className="mt-8 pt-6 border-t border-[#eae8e5]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#9a452c]">bolt</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9a452c]">
                      Judge Demo Quick Login
                    </span>
                  </div>
                  <span className="text-[11px] text-[#6d7a77] font-medium">1-Tap Role Shift</span>
                </div>
                <p className="text-xs text-[#6d7a77] mb-3">
                  Select any persona to immediately transform the platform into that role's dedicated workflow:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {DEMO_PERSONAS.map((p) => {
                    const isBusy = switchingPersona === p.email;
                    return (
                      <button
                        key={p.roleLabel}
                        type="button"
                        disabled={isBusy}
                        onClick={() => handleQuickLogin(p)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-xl text-left border transition-all hover:scale-[1.01] hover:shadow-md ${p.badgeBg} ${p.badgeBorder}`}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: p.color }}
                        >
                          {isBusy ? (
                            <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                          ) : (
                            <span className="material-symbols-outlined text-[17px]">{p.icon}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-[#1b1c1a] truncate">{p.roleLabel}</span>
                          </div>
                          <p className="text-[11px] text-[#6d7a77] truncate font-medium">{p.fullName}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#6d7a77] border-t border-[#eae8e5]">
        Vatapi Multi-Role Civic Architecture • ASI Dharwad, Handloom Guilds & District Governance
      </footer>
    </div>
  );
}
