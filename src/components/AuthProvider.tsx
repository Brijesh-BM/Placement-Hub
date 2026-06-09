'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN' | 'RECRUITER' | 'COLLEGE_ADMIN';
  profile?: {
    id: string;
    collegeId: string | null;
    college: { id: string; name: string } | null;
    branch: string | null;
    gradYear: number | null;
    cgpa: number | null;
    targetRole: string | null;
    skills: Array<{ id: string; name: string }>;
    resumeUrl: string | null;
    resumeName: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    streak: number;
    readinessScore: any | null;
    onboardingProfile: any | null;
    badges: Array<{
      badge: { name: string; description: string; icon: string }
    }>;
  } | null;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  refreshSession: () => Promise<UserSession | null>;
  login: (userData: UserSession) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshSession = async (): Promise<UserSession | null> => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/auth/me?t=${timestamp}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          return data.user;
        }
      }
      setUser(null);
      return null;
    } catch (e) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = (userData: UserSession) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        setUser(null);
        router.push('/login');
      }
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshSession, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
