import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, User, UserProfile, setStoredToken, clearStoredToken, getStoredToken } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, acceptTerms: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; profile: Partial<UserProfile> }) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      setUser(data.user);
    } catch {
      clearStoredToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setStoredToken(res.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string, acceptTerms: boolean) => {
    const res = await api.register({ name, email, password, acceptTerms });
    setStoredToken(res.token);
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Continue even if network error
    } finally {
      clearStoredToken();
      setUser(null);
    }
  };

  const updateProfile = async (updates: { name?: string; profile: Partial<UserProfile> }) => {
    const res = await api.updateProfile(updates);
    setUser(res.user);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        refreshUser,
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
