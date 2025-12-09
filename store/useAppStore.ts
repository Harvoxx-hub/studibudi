import { create } from "zustand";
import { persist } from "zustand/middleware";
import { FlashcardSet, Quiz, Notification } from "@/types";

interface UsageStats {
  flashcardsCreated: number;
  quizzesCreated: number;
  lastResetDate: string; // ISO date string for monthly reset
}

interface AppState {
  // UI State
  darkMode: boolean;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "createdAt">) => void;
  removeNotification: (id: string) => void;
  markNotificationAsRead: (id: string) => void;

  // Recent Items (can be synced with backend later)
  recentFlashcardSets: FlashcardSet[];
  recentQuizzes: Quiz[];
  setRecentFlashcardSets: (sets: FlashcardSet[]) => void;
  setRecentQuizzes: (quizzes: Quiz[]) => void;

  // Usage Tracking
  usage: UsageStats;
  incrementFlashcardUsage: () => void;
  incrementQuizUsage: () => void;
  resetUsageIfNeeded: () => void;
  getUsageStats: () => UsageStats;
}

const getInitialUsage = (): UsageStats => {
  const today = new Date().toISOString().split("T")[0];
  return {
    flashcardsCreated: 0,
    quizzesCreated: 0,
    lastResetDate: today,
  };
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Dark Mode
      darkMode: false,
      setDarkMode: (enabled) => {
        set({ darkMode: enabled });
        if (typeof window !== "undefined") {
          const root = document.documentElement;
          if (enabled) {
            root.classList.add("dark");
            localStorage.setItem("studibudi_theme", "dark");
          } else {
            root.classList.remove("dark");
            localStorage.setItem("studibudi_theme", "light");
          }
        }
      },
      toggleDarkMode: () => {
        set((state) => {
          const newDarkMode = !state.darkMode;
          if (typeof window !== "undefined") {
            const root = document.documentElement;
            if (newDarkMode) {
              root.classList.add("dark");
              localStorage.setItem("studibudi_theme", "dark");
            } else {
              root.classList.remove("dark");
              localStorage.setItem("studibudi_theme", "light");
            }
          }
          return { darkMode: newDarkMode };
        });
      },

      // Notifications
      notifications: [],
      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
      markNotificationAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      // Recent Items
      recentFlashcardSets: [],
      recentQuizzes: [],
      setRecentFlashcardSets: (sets) => set({ recentFlashcardSets: sets }),
      setRecentQuizzes: (quizzes) => set({ recentQuizzes: quizzes }),

      // Usage Tracking
      usage: getInitialUsage(),
      incrementFlashcardUsage: () => {
        get().resetUsageIfNeeded();
        set((state) => ({
          usage: {
            ...state.usage,
            flashcardsCreated: state.usage.flashcardsCreated + 1,
          },
        }));
      },
      incrementQuizUsage: () => {
        get().resetUsageIfNeeded();
        set((state) => ({
          usage: {
            ...state.usage,
            quizzesCreated: state.usage.quizzesCreated + 1,
          },
        }));
      },
      resetUsageIfNeeded: () => {
        const today = new Date().toISOString().split("T")[0];
        const state = get();
        if (state.usage.lastResetDate !== today) {
          // Check if it's a new month (simple check - in production, use proper date comparison)
          const lastDate = new Date(state.usage.lastResetDate);
          const currentDate = new Date(today);
          if (
            lastDate.getMonth() !== currentDate.getMonth() ||
            lastDate.getFullYear() !== currentDate.getFullYear()
          ) {
            set({ usage: getInitialUsage() });
          } else {
            set({
              usage: { ...state.usage, lastResetDate: today },
            });
          }
        }
      },
      getUsageStats: () => {
        get().resetUsageIfNeeded();
        return get().usage;
      },
    }),
    {
      name: "studibudi-app",
      partialize: (state) => ({
        darkMode: state.darkMode,
        usage: state.usage,
        recentFlashcardSets: state.recentFlashcardSets,
        recentQuizzes: state.recentQuizzes,
      }),
    }
  )
);


