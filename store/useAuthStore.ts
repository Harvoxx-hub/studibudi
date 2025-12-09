import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { authStorage } from "@/lib/storage";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
        }),
      login: (user, token) => {
        authStorage.setToken(token);
        set({
          user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        authStorage.removeToken();
        set({
          user: null,
          isAuthenticated: false,
        });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: "studibudi-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);


