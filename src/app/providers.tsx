"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import { clearSession, hasSession, loginWithPassword, refreshSession, verifyAccessToken } from "@/services/auth";
import { queryClient } from "@/services/queries";
import type { User, UserRole } from "@/types";

type AuthContextValue = {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    queryClient.clear();
  }, []);

  useEffect(() => {
    const restore = async () => {
      if (!hasSession()) {
        setLoading(false);
        return;
      }
      try {
        if (!(await verifyAccessToken())) await refreshSession();
        setUser(await api.getAuthenticatedUser());
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    void restore();
  }, [logout]);

  useEffect(() => {
    window.addEventListener("synthesis:unauthorized", logout);
    return () => window.removeEventListener("synthesis:unauthorized", logout);
  }, [logout]);

  const login = async (email: string, password: string) => {
    await loginWithPassword(email, password);
    try {
      setUser(await api.getAuthenticatedUser());
      queryClient.clear();
    } catch (error) {
      logout();
      throw error;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, role: user?.role ?? null, loading, login, logout }}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de Providers.");
  return context;
}

