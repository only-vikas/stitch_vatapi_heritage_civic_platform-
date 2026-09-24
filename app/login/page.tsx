'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { user, profile, signIn, signUp, signOut, loading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<'citizen' | 'official' | 'artisan'>('citizen');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          setErrorMsg(error.message || 'Login failed. Please check your credentials.');
        } else {
          setSuccessMsg('Logged in successfully!');
          setTimeout(() => router.push('/'), 1200);
        }
      } else {
        const { error, data } = await signUp(email, password, username, role);
        if (error) {
          setErrorMsg(error.message || 'Signup failed.');
        } else {
          if (data?.session) {
            setSuccessMsg('Account created and signed in! Redirecting...');
            setTimeout(() => router.push('/'), 1200);
          } else {
            setSuccessMsg('Account registered! Please check your email to confirm your account (if email confirmation is enabled) or log in.');
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

  return (
    <div className="min-h-screen bg-[#fbf9f6] flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-[#eae8e5] bg-[#ffffff]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00685f] flex items-center justify-center text-white font-bold text-xl shadow-sm">
              V
            </div>
            <div>
              <span className="font-serif text-2xl font-bold text-[#9a452c] tracking-tight">Vatapi</span>
              <span className="block text-xs uppercase tracking-wider text-[#6d7a77] font-medium">Bagalkote Heritage AI</span>
            </div>
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-[#3d4947] hover:text-[#00685f] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Platform
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#eae8e5] p-8">
          {/* User already logged in banner */}
          {user ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-[#00685f]/10 text-[#00685f] mx-auto flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl">verified_user</span>
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#1b1c1a]">Signed In</h2>
              <p className="text-sm text-[#6d7a77] mt-1">{user.email}</p>
              
              <div className="mt-4 p-4 rounded-xl bg-[#f5f3f0] text-left text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#6d7a77]">Role:</span>
                  <span className="font-semibold text-[#00685f] uppercase tracking-wide">{profile?.role || 'Citizen'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6d7a77]">User ID:</span>
                  <span className="font-mono text-[10px] text-[#3d4947] truncate max-w-[200px]">{user.id}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/"
                  className="w-full py-3 px-4 bg-[#00685f] hover:bg-[#008378] text-white font-medium rounded-xl text-center shadow-md transition-all"
                >
                  Go to Vatapi Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full py-2.5 px-4 bg-transparent border border-[#eae8e5] hover:bg-[#f5f3f0] text-[#ba1a1a] font-medium rounded-xl transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Header Title */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbd1] text-[#9a452c] text-xs font-semibold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-[#9a452c]"></span>
                  Supabase Auth
                </div>
                <h1 className="text-3xl font-serif font-bold text-[#1b1c1a]">
                  {mode === 'login' ? 'Welcome Back' : 'Join the Vatapi Grid'}
                </h1>
                <p className="text-sm text-[#6d7a77] mt-1.5">
                  {mode === 'login'
                    ? 'Sign in to triage issues, record culinary spots & access heritage logs'
                    : 'Create your civic account for Bagalkote heritage preservation'}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex p-1 bg-[#efeeeb] rounded-xl mb-6">
                <button
                  type="button"
                  onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
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
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === 'signup'
                      ? 'bg-white text-[#1b1c1a] shadow-sm'
                      : 'text-[#6d7a77] hover:text-[#1b1c1a]'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Alert Feedback */}
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
                      <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1.5">
                        Username / Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. chalukya_scholar"
                        className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f] text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1.5">
                        Your Civic Role
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
                  <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#bcc9c6] bg-white text-[#1b1c1a] focus:outline-none focus:ring-2 focus:ring-[#00685f] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3d4947] uppercase tracking-wider mb-1.5">
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
                  <p className="text-[11px] text-[#6d7a77] mt-1">Minimum 6 characters</p>
                </div>

                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="w-full mt-2 py-3 px-4 bg-[#00685f] hover:bg-[#008378] text-white font-medium rounded-xl text-center shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{mode === 'login' ? 'Sign In with Supabase' : 'Create Supabase Account'}</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center text-xs text-[#6d7a77]">
                Protected by Supabase Auth with Row-Level Security (RLS) policies.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-[#6d7a77] border-t border-[#eae8e5]">
        Vatapi Civic & Heritage AI Platform • Bagalkote District, Karnataka
      </footer>
    </div>
  );
}
