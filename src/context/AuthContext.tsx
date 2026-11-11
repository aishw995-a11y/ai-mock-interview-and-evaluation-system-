import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Profile } from '../types/index.ts';
import { api, getAuthToken, setAuthToken, removeAuthToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setTokenState] = useState<string | null>(getAuthToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshProfile = async () => {
    try {
      const data = await api.profile.get();
      setProfile(data.profile);
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  useEffect(() => {
    async function initAuth() {
      const storedToken = getAuthToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.auth.me();
        setUser(data.user);
        setProfile(data.profile);
      } catch (err) {
        console.warn('Session expired or invalid token:', err);
        removeAuthToken();
        setTokenState(null);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password });
    setAuthToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    setProfile(data.profile);
  };

  const register = async (payload: { email: string; password: string; full_name: string; phone?: string }) => {
    const data = await api.auth.register(payload);
    setAuthToken(data.token);
    setTokenState(data.token);
    setUser(data.user);
    setProfile(data.profile);
  };

  const logout = () => {
    removeAuthToken();
    setTokenState(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    const data = await api.profile.update(updates);
    setProfile(data.profile);
    if (updates.full_name && user) {
      setUser({ ...user, full_name: updates.full_name });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
