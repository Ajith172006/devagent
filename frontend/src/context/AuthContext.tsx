import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase';
import { setCurrentUserId } from '../api/client';
import { usersApi } from '../api/modules';

export interface ResumeAnalysis {
  name?: string;
  profession?: string;
  summary?: string;
  skills?: string[];
  experience?: Array<{ role: string; company: string; duration: string; description: string }>;
  education?: Array<{ degree: string; school: string; duration: string; score?: string }>;
  projects?: Array<{ title: string; description: string; tech?: string[] }>;
  certifications?: Array<{ name: string; authority?: string; date?: string }>;
  contact?: {
    email?: string; phone?: string; location?: string;
    github?: string; linkedin?: string; portfolio?: string;
  };
}

export interface UserProfile {
  name: string;
  profession: string;
  age: string;
  gender: string;
  resumeText?: string;
  photoUrl?: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  resumeAnalysis: ResumeAnalysis | null;
  loading: boolean;
  firebaseReady: boolean;
  saveProfile: (p: UserProfile, forceAnalyze?: boolean) => Promise<void>;
  refreshResumeAnalysis: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PROFILE_KEY = 'devagent_profile';
const RESUME_KEY = 'devagent_resume_analysis';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumeAnalysis, setResumeAnalysis] = useState<ResumeAnalysis | null>(() => {
    try {
      const s = localStorage.getItem(RESUME_KEY);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(firebaseConfigured);

  const parseAndCacheResume = (raw: string | undefined | null) => {
    if (!raw) { setResumeAnalysis(null); return; }
    try {
      const parsed = JSON.parse(raw) as ResumeAnalysis;
      setResumeAnalysis(parsed);
      localStorage.setItem(RESUME_KEY, JSON.stringify(parsed));
    } catch { setResumeAnalysis(null); }
  };

  const fetchAndSyncProfile = async () => {
    const stored = localStorage.getItem(PROFILE_KEY);
    if (stored) {
      try { setProfile(JSON.parse(stored) as UserProfile); } catch {}
    }
    try {
      const data = await usersApi.me();
      if (data) {
        const dbProfile: UserProfile = {
          name: data.name || '',
          profession: data.profession || '',
          age: data.age || '',
          gender: data.gender || '',
          resumeText: data.resumeText,
          photoUrl: data.photoUrl,
        };
        localStorage.setItem(PROFILE_KEY, JSON.stringify(dbProfile));
        setProfile(dbProfile);
        parseAndCacheResume(data.resumeAnalysis);
      }
    } catch (err) {
      console.warn('Could not fetch user profile from backend:', err);
    }
  };

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      fetchAndSyncProfile().finally(() => setLoading(false));
      return;
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setCurrentUserId(firebaseUser?.uid ?? null);
      if (firebaseUser) {
        fetchAndSyncProfile();
      } else {
        setProfile(null);
        setResumeAnalysis(null);
        localStorage.removeItem(RESUME_KEY);
      }
      setLoading(false);
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = async (p: UserProfile, forceAnalyze?: boolean) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
    await usersApi.upsert({
      ...p,
      email: user?.email ?? undefined,
      photoUrl: p.photoUrl || user?.photoURL || undefined,
      forceAnalyze,
    });
    // After save, re-fetch so we get the latest resumeAnalysis from backend
    if (forceAnalyze || p.resumeText) {
      await fetchAndSyncProfile();
    }
  };

  const refreshResumeAnalysis = async () => {
    await fetchAndSyncProfile();
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setCurrentUserId(null);
    localStorage.removeItem(PROFILE_KEY);
    localStorage.removeItem(RESUME_KEY);
    setUser(null);
    setProfile(null);
    setResumeAnalysis(null);
  };

  return (
    <AuthContext.Provider value={{
      user, profile, resumeAnalysis, loading,
      firebaseReady: firebaseConfigured,
      saveProfile, refreshResumeAnalysis, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
