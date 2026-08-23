"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "@/services/api";
import { queryClient } from "@/services/queries";
import type { User, UserRole } from "@/types";

type AuthContextValue = {
  user: User | null;
  role: UserRole;
  setRole: (role: UserRole) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function Providers({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("gestor");
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void api.getAuthenticatedUser(role).then(setUser);
  }, [role]);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, role, setRole }}>{children}</AuthContext.Provider>
    </QueryClientProvider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de Providers.");
  return context;
}
