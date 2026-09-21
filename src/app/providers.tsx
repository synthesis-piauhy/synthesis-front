"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import { clearSession, getSessionEpoch, loginWithPassword, logoutSession } from "@/services/auth";
import { queryClient } from "@/services/queries";
import type { User, UserRole } from "@/types";

type AuthContextValue = {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: User) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const reset = useCallback(() => {
    clearSession();
    setUser(null);
    queryClient.clear();
  }, []);

  const logout = useCallback(async () => {
    try { await logoutSession(); }
    finally { reset(); }
  }, [reset]);

  useEffect(() => {
    let cancelled = false;
    clearSession();
    const epoch = getSessionEpoch();
    const restore = async () => {
      try {
        const current = await api.getAuthenticatedUser();
        if (!cancelled && epoch === getSessionEpoch()) setUser(current);
      } catch {
        if (!cancelled) reset();
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void restore();
    return () => { cancelled = true; };
  }, [reset]);

  useEffect(() => {
    window.addEventListener("synthesis:unauthorized", reset);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("synthesis-session") : null;
    if (channel) channel.onmessage = () => reset();
    return () => { window.removeEventListener("synthesis:unauthorized", reset); channel?.close(); };
  }, [reset]);

  const login = async (email: string, password: string) => {
    await loginWithPassword(email, password);
    const epoch = getSessionEpoch();
    try {
      const current = await api.getAuthenticatedUser();
      if (epoch !== getSessionEpoch()) return;
      setUser(current);
      queryClient.clear();
    } catch (error) {
      reset();
      throw error;
    }
  };

  const updateUser = (updated: User) => {
    setUser((current) => current?.id === updated.id ? updated : current);
    void queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, role: user?.role ?? null, loading, login, logout, updateUser }}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de Providers.");
  return context;
}
