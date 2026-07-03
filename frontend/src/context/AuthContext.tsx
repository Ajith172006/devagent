import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth, firebaseConfigured } from '../firebase';

export interface UserProfile {
  name: string;
  profession: string;
  age: string;
  gender: string;
}

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  firebaseReady: boolean;
  saveProfile: (p: UserProfile) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const PROFILE_KEY = 'devagent_profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(firebaseConfigured); // only loading if firebase is set up

  useEffect(() => {
    if (!firebaseConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const stored = localStorage.getItem(PROFILE_KEY);
        setProfile(stored ? (JSON.parse(stored) as UserProfile) : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const saveProfile = (p: UserProfile) => {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
    setProfile(p);
  };

  const logout = async () => {
    if (auth) await signOut(auth);
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
