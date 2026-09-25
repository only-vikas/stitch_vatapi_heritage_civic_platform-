'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  roleTitle?: string;
  expectedOrganization?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  roleTitle = 'Authorized Personnel',
  expectedOrganization,
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, profile, loading, activePersona } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [deniedMessage, setDeniedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user || !profile) {
      setAuthorized(false);
      setDeniedMessage(`Please sign in to access the ${roleTitle} dashboard.`);
      const timeout = setTimeout(() => {
        router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      }, 1500);
      return () => clearTimeout(timeout);
    }

    const roleMatches = allowedRoles.includes(profile.role);
    const orgMatches = expectedOrganization 
      ? profile.organization?.toLowerCase().includes(expectedOrganization.toLowerCase()) 
      : true;

    if (roleMatches && orgMatches) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
      setDeniedMessage(`Access Denied. This dashboard is for ${roleTitle} only. Currently signed in as ${profile.full_name || profile.username} (${profile.role}).`);
      const timeout = setTimeout(() => {
        router.push('/login');
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [user, profile, loading, allowedRoles, expectedOrganization, roleTitle, router]);

  if (loading || authorized === null) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 rounded-2xl bg-[#00685f]/10 text-[#00685f] flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-2xl animate-spin">sync</span>
        </div>
        <p className="text-sm font-semibold text-[#1b1c1a]">Verifying Chalukya Civic Clearance...</p>
        <p className="text-xs text-[#6d7a77] mt-1">Authenticating role permissions for {roleTitle}</p>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#fbf9f6] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-[#ba1a1a]/30 rounded-2xl p-6 shadow-xl text-center">
          <div className="w-14 h-14 rounded-full bg-[#ffdad6] text-[#ba1a1a] mx-auto flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1b1c1a]">Access Restricted</h2>
          <p className="text-sm text-[#ba1a1a] mt-2 font-medium">
            {deniedMessage || `This dashboard is reserved for ${roleTitle}.`}
          </p>
          <p className="text-xs text-[#6d7a77] mt-3">
            Redirecting to Login & Role Switcher...
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-5 px-5 py-2.5 bg-[#9a452c] text-white rounded-xl text-xs font-semibold hover:bg-[#762b14] transition-all shadow-sm"
          >
            Switch to {roleTitle} Account
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
