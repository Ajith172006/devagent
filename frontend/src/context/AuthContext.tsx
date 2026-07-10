import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase';
import { setCurrentUserId } from '../api/client';
import { usersApi } from '../api/modules';

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
  loading: boolean;
  firebaseReady: boolean;
  saveProfile: (p: UserProfile, forceAnalyze?: boolean) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const PROFILE_KEY = 'devagent_profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured);

  useEffect(() => {
    if (!firebaseConfigured || !auth) { setLoading(false); return; }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      // Inject UID into every API request
      setCurrentUserId(firebaseUser?.uid ?? null);

      if (firebaseUser) {
        const stored = localStorage.getItem(PROFILE_KEY);
        if (stored) {
          try {
            setProfile(JSON.parse(stored) as UserProfile);
          } catch {}
        }
        usersApi.me().then((data) => {
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
        }).catch(console.error);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveProfile = async (p: UserProfile, forceAnalyze?: boolean) => {
    if (!user) return;
    // Persist to localStorage immediately so the UI updates
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
    // Sync to backend — creates/updates the user row keyed by Firebase UID
    await usersApi.upsert({
      ...p,
      email: user.email ?? undefined,
      photoUrl: p.photoUrl || user.photoURL || undefined,
      forceAnalyze,
    });
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setCurrentUserId(null);
    localStorage.removeItem(PROFILE_KEY);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, firebaseReady: firebaseConfigured, saveProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
