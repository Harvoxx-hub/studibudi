import { api } from "./client";
import { User } from "@/types";

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

interface UserResponse {
  user: User;
}

interface UsageResponse {
  usage: {
    flashcardsCreated: number;
    quizzesCreated: number;
    month: string;
    lastResetDate: string;
  };
}

interface QuizAttemptsResponse {
  attempts: any[];
  total: number;
  limit: number;
  offset: number;
}

// Users API Service
export const usersApi = {
  // Get current user
  getCurrentUser: async (): Promise<User> => {
    try {
      const response = await api.get<ApiResponse<UserResponse>>("/users/me");
      if (response.success && response.data) {
        return response.data.user;
      }
      throw new Error(response.error?.message || "Failed to get user");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get user information");
    }
  },

  // Update user profile
  updateProfile: async (updates: {
    name?: string;
    email?: string;
  }): Promise<User> => {
    try {
      const response = await api.patch<ApiResponse<UserResponse>>(
        "/users/me",
        updates
      );
      if (response.success && response.data) {
        return response.data.user;
      }
      throw new Error(response.error?.message || "Failed to update profile");
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Invalid input. Please check your data.");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to update profile");
    }
  },

  // Get usage statistics
  getUsage: async (month?: string): Promise<UsageResponse["usage"]> => {
    try {
      const params = month ? { month } : {};
      const response = await api.get<ApiResponse<UsageResponse>>(
        "/users/me/usage",
        { params }
      );
      if (response.success && response.data) {
        return response.data.usage;
      }
      throw new Error(response.error?.message || "Failed to get usage statistics");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get usage statistics");
    }
  },

  // Delete account
  deleteAccount: async (): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>("/users/me");
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete account");
      }
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to delete account");
    }
  },

  // Get user quiz attempts
  getQuizAttempts: async (
    limit: number = 10,
    offset: number = 0
  ): Promise<QuizAttemptsResponse> => {
    try {
      const response = await api.get<ApiResponse<QuizAttemptsResponse>>(
        "/users/me/quiz-attempts",
        {
          params: { limit, offset },
        }
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || "Failed to get quiz attempts"
      );
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get quiz attempts");
    }
  },
};

