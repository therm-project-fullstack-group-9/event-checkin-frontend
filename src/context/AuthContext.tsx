import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { getToken, setToken, clearToken } from '../lib/auth';
import type { AuthUser } from '../types';

interface RegisterInput {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber?: string;
  password: string;
}

interface AuthContextValue {
  /** มี token หรือไม่ (ตัดสินสถานะล็อกอินจากตรงนี้ เพราะ token ที่หมดอายุจะถูกล้างเมื่อ backend ตอบ 401) */
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (emailAddress: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  /** ใช้หลัง OAuth redirect กลับมาพร้อม token */
  loginWithToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [user, setUser] = useState<AuthUser | null>(null);

  // มี token แล้วโหลดข้อมูลผู้ใช้ปัจจุบันมาแสดง (ถ้า token เสีย interceptor จะพากลับหน้า Login เอง)
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    api
      .get('/auth/me')
      .then((res) => {
        if (!cancelled && res.data?.userId) setUser(res.data);
      })
      .catch(() => {
        /* ปล่อยให้ interceptor จัดการกรณี 401 */
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const applySession = useCallback((newToken: string, newUser?: AuthUser) => {
    setToken(newToken);
    setTokenState(newToken);
    if (newUser) setUser(newUser);
  }, []);

  const login = useCallback(
    async (emailAddress: string, password: string) => {
      const res = await api.post('/auth/login', { emailAddress, password });
      applySession(res.data.token, res.data.user);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const res = await api.post('/auth/register', input);
      applySession(res.data.token, res.data.user);
    },
    [applySession],
  );

  const loginWithToken = useCallback((newToken: string) => applySession(newToken), [applySession]);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ isAuthenticated: !!token, user, login, register, loginWithToken, logout }),
    [token, user, login, register, loginWithToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth ต้องใช้ภายใน <AuthProvider>');
  return ctx;
}
