import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<User>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('torq_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem('torq_token') || localStorage.getItem('token') || null;
    if (t) return t;
    try {
      const savedUser = localStorage.getItem('torq_user');
      if (savedUser) {
        const u = JSON.parse(savedUser);
        const tok = 'session_' + (u.id || 'usr') + '_' + Date.now();
        localStorage.setItem('torq_token', tok);
        return tok;
      }
    } catch (e) {}
    return null;
  });
  const [loading, setLoading] = useState<boolean>(() => {
    const hasToken = Boolean(localStorage.getItem('torq_token') || localStorage.getItem('token'));
    const hasUser = Boolean(localStorage.getItem('torq_user'));
    return hasToken && !hasUser;
  });

  useEffect(() => {
    if (user && !token) {
      const existingToken = localStorage.getItem('torq_token') || localStorage.getItem('token');
      const finalTok = existingToken || ('session_' + (user.id || 'usr') + '_' + Date.now());
      localStorage.setItem('torq_token', finalTok);
      setToken(finalTok);
    }
  }, [user, token]);

  useEffect(() => {
    if (token && !token.startsWith('session_')) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUserProfile = async () => {
    try {
      const res: any = await api.get('/auth/profile');
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('torq_user', JSON.stringify(res.user));
      }
    } catch (err: any) {
      console.warn('Profile refresh fallback:', err.message);
      // Don't log out if we already have a cached valid user
      const saved = localStorage.getItem('torq_user');
      if (!saved) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res: any = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      localStorage.setItem('torq_token', res.token);
      if (res.user) {
        localStorage.setItem('torq_user', JSON.stringify(res.user));
        setUser(res.user);
      }
      setToken(res.token);
      return res.user;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name: string, email: string, password: string, phone?: string): Promise<User> => {
    const res: any = await api.post('/auth/register', { name, email, password, phone });
    if (res.success && res.token) {
      localStorage.setItem('torq_token', res.token);
      if (res.user) {
        localStorage.setItem('torq_user', JSON.stringify(res.user));
        setUser(res.user);
      }
      setToken(res.token);
      return res.user;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('torq_token');
    localStorage.removeItem('torq_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        register,
        logout,
        refreshProfile: fetchUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

const fallbackAuthContext: AuthContextType = {
  user: null,
  token: null,
  loading: false,
  isAdmin: false,
  login: async () => { throw new Error('AuthProvider not ready'); },
  register: async () => { throw new Error('AuthProvider not ready'); },
  logout: () => {},
  refreshProfile: async () => {},
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  return context || fallbackAuthContext;
};
