'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export type UserRole = 'citizen' | 'volunteer' | 'official' | 'investor' | 'artisan' | 'admin';

export interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  role: UserRole;
  organization?: string | null;
  jurisdiction?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
}

export interface DemoPersona {
  role: UserRole;
  roleLabel: string;
  email: string;
  password: string;
  fullName: string;
  organization: string;
  jurisdiction?: string;
  bio: string;
  color: string;
  textColor: string;
  badgeBg: string;
  badgeBorder: string;
  icon: string;
  dashboardPath: string;
}

export const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: 'citizen',
    roleLabel: 'Citizen / Tourist',
    email: 'arjun@vatapi.demo',
    password: 'demo1234',
    fullName: 'Arjun Sharma',
    organization: 'Tourist',
    bio: 'Heritage traveler exploring Bagalkote.',
    color: '#0D9488', // Teal
    textColor: 'text-teal-700',
    badgeBg: 'bg-teal-50',
    badgeBorder: 'border-teal-300',
    icon: 'travel_explore',
    dashboardPath: '/',
  },
  {
    role: 'official',
    roleLabel: 'ASI Officer',
    email: 'asi.officer@vatapi.demo',
    password: 'demo1234',
    fullName: 'Dr. Basavaraj Hiremath',
    organization: 'ASI Dharwad Circle',
    jurisdiction: 'Badami Taluk',
    bio: 'Superintending Archaeologist. 22 years in Chalukyan conservation.',
    color: '#C2410C', // Deep Terracotta
    textColor: 'text-amber-800',
    badgeBg: 'bg-orange-50',
    badgeBorder: 'border-orange-300',
    icon: 'account_balance',
    dashboardPath: '/dashboard/asi',
  },
  {
    role: 'volunteer',
    roleLabel: 'Community Volunteer',
    email: 'volunteer@vatapi.demo',
    password: 'demo1234',
    fullName: 'Priya Kulkarni',
    organization: 'Eco-Sena Bagalkote',
    jurisdiction: 'Badami & Hungund',
    bio: 'Volunteer coordinator for weekend cleanup drives.',
    color: '#059669', // Emerald Green
    textColor: 'text-emerald-700',
    badgeBg: 'bg-emerald-50',
    badgeBorder: 'border-emerald-300',
    icon: 'volunteer_activism',
    dashboardPath: '/dashboard/volunteer',
  },
  {
    role: 'investor',
    roleLabel: 'Investor',
    email: 'investor@vatapi.demo',
    password: 'demo1234',
    fullName: 'R. Gaddigoudar',
    organization: 'Malaprabha Heritage Ventures',
    bio: 'Looking for tourism PPP opportunities in North Karnataka.',
    color: '#D97706', // Amber/Gold
    textColor: 'text-amber-700',
    badgeBg: 'bg-amber-50',
    badgeBorder: 'border-amber-300',
    icon: 'trending_up',
    dashboardPath: '/dashboard/investor',
  },
  {
    role: 'artisan',
    roleLabel: 'Weaver (Artisan)',
    email: 'weaver@vatapi.demo',
    password: 'demo1234',
    fullName: 'Kasturbai Ilkal',
    organization: 'Ilkal Weavers Colony',
    bio: 'National Awardee. 5th generation Kasuti weaver.',
    color: '#7C3AED', // Purple
    textColor: 'text-purple-700',
    badgeBg: 'bg-purple-50',
    badgeBorder: 'border-purple-300',
    icon: 'palette',
    dashboardPath: '/dashboard/artisan',
  },
  {
    role: 'official',
    roleLabel: 'Tourism Officer',
    email: 'tourism.officer@vatapi.demo',
    password: 'demo1234',
    fullName: 'Anjanadevi T.',
    organization: 'Dept. of Tourism, Bagalkote',
    jurisdiction: 'District-wide',
    bio: 'Deputy Director (I/C), managing sustainable tourism.',
    color: '#2563EB', // Blue
    textColor: 'text-blue-700',
    badgeBg: 'bg-blue-50',
    badgeBorder: 'border-blue-300',
    icon: 'analytics',
    dashboardPath: '/dashboard/tourism',
  },
  {
    role: 'admin',
    roleLabel: 'District Admin (DC)',
    email: 'dc@vatapi.demo',
    password: 'demo1234',
    fullName: 'District Commissioner',
    organization: 'Bagalkote District Administration',
    jurisdiction: 'Bagalkote District',
    bio: 'Overseeing all civic and heritage operations.',
    color: '#1E293B', // Deep Basalt
    textColor: 'text-slate-800',
    badgeBg: 'bg-slate-100',
    badgeBorder: 'border-slate-400',
    icon: 'admin_panel_settings',
    dashboardPath: '/dashboard/admin',
  },
];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  activePersona: DemoPersona | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, username?: string, role?: string) => Promise<{ error: any; data?: any }>;
  signInWithGoogle: () => Promise<{ error: any; data?: any }>;
  signInAsPersona: (email: string) => Promise<{ user: any; profile: UserProfile; targetPath: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  activePersona: null,
  loading: true,
  signIn: async () => ({ error: 'Not initialized' }),
  signUp: async () => ({ error: 'Not initialized' }),
  signInWithGoogle: async () => ({ error: 'Not initialized' }),
  signInAsPersona: async () => ({ user: null, profile: {} as any, targetPath: '/' }),
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activePersona, setActivePersona] = useState<DemoPersona | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, email?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
        const match = DEMO_PERSONAS.find((p) => p.email === (data.username || email));
        if (match) setActivePersona(match);
      } else {
        // Check if user email corresponds to a demo persona
        const persona = DEMO_PERSONAS.find((p) => p.email === email);
        if (persona) {
          const mockProfile: UserProfile = {
            id: userId,
            username: persona.email,
            full_name: persona.fullName,
            role: persona.role,
            organization: persona.organization,
            jurisdiction: persona.jurisdiction,
            bio: persona.bio,
          };
          setProfile(mockProfile);
          setActivePersona(persona);
        } else {
          setProfile({
            id: userId,
            username: email?.split('@')[0] || 'User',
            full_name: email?.split('@')[0] || 'User',
            role: 'citizen',
          });
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Check if a demo role is saved in localStorage
    if (typeof window !== 'undefined') {
      try {
        const savedDemo = localStorage.getItem('vatapi_demo_persona');
        if (savedDemo) {
          const parsed = JSON.parse(savedDemo);
          const found = DEMO_PERSONAS.find((p) => p.email === parsed.email);
          if (found) {
            setActivePersona(found);
            setProfile({
              id: `demo-${found.role}`,
              username: found.email,
              full_name: found.fullName,
              role: found.role,
              organization: found.organization,
              jurisdiction: found.jurisdiction,
              bio: found.bio,
            });
            setUser({
              id: `demo-${found.role}`,
              email: found.email,
              app_metadata: {},
              user_metadata: { full_name: found.fullName, role: found.role },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            } as any);
          }
        }
      } catch (e) {
        console.warn('Could not restore demo session', e);
      }
    }

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
        fetchProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // Listen to Auth State changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await fetchProfile(session.user.id, session.user.email);
        } else {
          // If no supabase session, keep demo persona if set
          const savedDemo = typeof window !== 'undefined' ? localStorage.getItem('vatapi_demo_persona') : null;
          if (!savedDemo) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setActivePersona(null);
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    // Check if it's one of the demo users
    const persona = DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email.toLowerCase());
    
    // Try Supabase auth first
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!result.error && result.data.user) {
        if (persona) {
          setActivePersona(persona);
          if (typeof window !== 'undefined') {
            localStorage.setItem('vatapi_demo_persona', JSON.stringify(persona));
          }
        }
        setLoading(false);
        return result;
      }
    } catch {
      // Fall through to demo check
    }

    // If Supabase didn't have user yet or offline, but matches Demo persona credentials
    if (persona && (password === persona.password || password === 'demo1234')) {
      const mockProfile: UserProfile = {
        id: `demo-${persona.role}`,
        username: persona.email,
        full_name: persona.fullName,
        role: persona.role,
        organization: persona.organization,
        jurisdiction: persona.jurisdiction,
        bio: persona.bio,
      };
      const mockUser: User = {
        id: `demo-${persona.role}`,
        email: persona.email,
        app_metadata: {},
        user_metadata: { full_name: persona.fullName, role: persona.role },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as any;

      setUser(mockUser);
      setProfile(mockProfile);
      setActivePersona(persona);
      if (typeof window !== 'undefined') {
        localStorage.setItem('vatapi_demo_persona', JSON.stringify(persona));
      }
      setLoading(false);
      return { error: null, data: { user: mockUser, session: null } };
    }

    setLoading(false);
    return { error: { message: 'Invalid credentials. Use demo1234 for demo users.' } };
  };

  const signInAsPersona = async (email: string) => {
    const persona = DEMO_PERSONAS.find((p) => p.email === email) || DEMO_PERSONAS[0];
    await signIn(persona.email, persona.password);
    return {
      user: { id: `demo-${persona.role}`, email: persona.email },
      profile: {
        id: `demo-${persona.role}`,
        username: persona.email,
        full_name: persona.fullName,
        role: persona.role,
        organization: persona.organization,
        jurisdiction: persona.jurisdiction,
        bio: persona.bio,
      },
      targetPath: persona.dashboardPath,
    };
  };

  const signUp = async (
    email: string,
    password: string,
    username?: string,
    role: string = 'citizen'
  ) => {
    setLoading(true);
    const result = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0],
          full_name: username || email.split('@')[0],
          role: role,
        },
      },
    });

    if (result.data?.user) {
      await supabase.from('profiles').upsert({
        id: result.data.user.id,
        username: username || email.split('@')[0],
        full_name: username || email.split('@')[0],
        role: role as any,
      });
    }

    setLoading(false);
    return result;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/home` : '';
    const result = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vatapi_demo_persona');
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setActivePersona(null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id, user.email);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        activePersona,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signInAsPersona,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
