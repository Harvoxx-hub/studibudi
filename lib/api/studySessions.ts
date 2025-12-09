import { api } from "./client";
import { StudySession } from "@/types";

// API Response Types
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: number;
    message: string;
  };
}

interface StudySessionResponse {
  session: StudySession & {
    startedAt?: string;
    completedAt?: string;
    stats?: {
      total: number;
      known: number;
      unknown: number;
      bookmarked?: number;
    };
  };
}

interface StudySessionsResponse {
  sessions: StudySession[];
  total: number;
  limit: number;
  offset: number;
}

interface StudyStatsResponse {
  stats: {
    totalSessions: number;
    totalStudyTime: number;
    flashcardsStudied: number;
    quizzesCompleted: number;
    streak: number;
    studyCountToday: number;
  };
}

// Study Sessions API Service
export const studySessionsApi = {
  // Start study session
  startSession: async (
    type: "flashcard" | "quiz",
    itemId: string,
    filterMode?: "all" | "unknown"
  ): Promise<StudySession & { startedAt?: string }> => {
    try {
      const response = await api.post<ApiResponse<StudySessionResponse>>(
        "/study-sessions",
        {
          type,
          itemId,
          ...(type === "flashcard" && filterMode && { filterMode }),
        }
      );

      if (response.success && response.data) {
        return response.data.session;
      }
      throw new Error(response.error?.message || "Failed to start study session");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to start study session");
    }
  },

  // Complete study session
  completeSession: async (
    sessionId: string,
    stats: {
      total: number;
      known: number;
      unknown: number;
      bookmarked?: number;
    },
    duration: number
  ): Promise<StudySession & { completedAt?: string; duration?: number }> => {
    try {
      const response = await api.patch<ApiResponse<StudySessionResponse>>(
        `/study-sessions/${sessionId}`,
        {
          stats,
          duration,
        }
      );

      if (response.success && response.data) {
        return response.data.session;
      }
      throw new Error(response.error?.message || "Failed to complete study session");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to complete study session");
    }
  },

  // Get study sessions
  getSessions: async (params?: {
    limit?: number;
    offset?: number;
    type?: "flashcard" | "quiz";
    itemId?: string;
  }): Promise<StudySessionsResponse> => {
    try {
      const response = await api.get<ApiResponse<StudySessionsResponse>>(
        "/study-sessions",
        { params }
      );

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || "Failed to get study sessions");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get study sessions");
    }
  },

  // Get study statistics
  getStats: async (period?: "day" | "week" | "month" | "all"): Promise<StudyStatsResponse["stats"]> => {
    try {
      const response = await api.get<ApiResponse<StudyStatsResponse>>(
        "/users/me/stats",
        {
          params: period ? { period } : undefined,
        }
      );

      if (response.success && response.data) {
        return response.data.stats;
      }
      throw new Error(response.error?.message || "Failed to get study statistics");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get study statistics");
    }
  },
};

