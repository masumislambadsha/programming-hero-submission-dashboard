"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { LoginInput, SafeUser, SignupInput } from "@ph/shared";
import { http, ApiRequestError } from "@/lib/api";

type AuthContextValue = {
  user: SafeUser | null;
  /** True while the initial /me lookup is in flight. */
  loading: boolean;
  login: (input: LoginInput) => Promise<SafeUser>;
  signup: (input: SignupInput) => Promise<SafeUser>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    http
      .get<{ user: SafeUser }>("/api/auth/me")
      .then(({ user }) => !cancelled && setUser(user))
      .catch(() => {
        // 401 (not logged in) or API down — both mean "no user" for the UI.
        if (!cancelled) setUser(null);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { user } = await http.post<{ user: SafeUser }>("/api/auth/login", input);
    setUser(user);
    return user;
  }, []);

  const signup = useCallback(async (input: SignupInput) => {
    const { user } = await http.post<{ user: SafeUser }>("/api/auth/signup", input);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await http.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout }),
    [user, loading, login, signup, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

export { ApiRequestError };
