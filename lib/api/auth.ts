import { api } from "./client";
import { User } from "@/types";

// Helper function to get network error message
const getNetworkErrorMessage = (): string => {
  if (typeof window === "undefined") {
    return "Cannot connect to the API server. Please check your configuration.";
  }
  
  // Try to get base URL from environment or default
  const baseURL = 
    process.env.NEXT_PUBLIC_API_URL || 
    "http://localhost:5001/student-budi/us-central1/api";
  
  const isLocal = baseURL.includes("localhost") || baseURL.includes("127.0.0.1");
  
  if (isLocal) {
    return "Cannot connect to the API server. Please make sure the Firebase Emulator is running on port 5001, or switch to the production API URL in your .env.local file.";
  }
  
  return "Cannot connect to the API server. Please check your internet connection or try again later.";
};

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

interface AuthResponse {
  user: User;
  token: string;
  customToken?: string; // For signup, backend returns customToken instead of token
}

interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

// Auth API Service
export const authApi = {
  // Health check
  health: async (): Promise<HealthResponse> => {
    const response = await api.get<ApiResponse<HealthResponse>>("/health");
    if (response.success && response.data) {
      return response.data as HealthResponse;
    }
    throw new Error(response.error?.message || "Health check failed");
  },

  // Sign up with email and password
  signup: async (
    email: string,
    password: string,
    name: string
  ): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/signup",
        {
          email,
          password,
          name,
        }
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || "Signup failed");
    } catch (error: any) {
      // Handle network errors (server not reachable)
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error(getNetworkErrorMessage());
      }
      // Handle axios errors
      if (error.response?.status === 409) {
        throw new Error("This email is already registered. Please sign in instead.");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Signup failed. Please try again.");
    }
  },

  // Sign in with ID token (from Firebase Auth)
  signin: async (idToken: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/signin",
        {
          idToken,
        }
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || "Sign in failed");
    } catch (error: any) {
      // Handle network errors (server not reachable)
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error(getNetworkErrorMessage());
      }
      // Handle rate limiting
      if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Sign in failed. Please try again.");
    }
  },

  // Google OAuth sign in
  googleSignIn: async (idToken: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/google",
        {
          idToken,
        }
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || "Google sign in failed");
    } catch (error: any) {
      // Handle network errors (server not reachable)
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error(getNetworkErrorMessage());
      }
      // Handle rate limiting
      if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Google sign in failed. Please try again.");
    }
  },


  // Forgot password
  forgotPassword: async (email: string): Promise<void> => {
    const response = await api.post<ApiResponse<{ message: string }>>(
      "/auth/forgot-password",
      {
        email,
      }
    );
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to send reset email");
    }
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    const response = await api.post<ApiResponse<{}>>(
      "/auth/change-password",
      {
        currentPassword,
        newPassword,
      }
    );
    if (!response.success) {
      throw new Error(response.error?.message || "Failed to change password");
    }
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/refresh-token",
        {
          refreshToken,
        }
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || "Token refresh failed");
    } catch (error: any) {
      // Handle rate limiting specifically
      if (error.response?.status === 429 || error.isRateLimited) {
        const errorMessage = error.response?.data?.error?.message || 
                           error.response?.data?.message || 
                           error.message ||
                           "Too many requests. Please wait a moment and try again.";
        const rateLimitError = new Error(errorMessage);
        (rateLimitError as any).isRateLimited = true;
        (rateLimitError as any).code = 429;
        throw rateLimitError;
      }
      // Handle network errors
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error(getNetworkErrorMessage());
      }
      // Re-throw other errors
      throw error;
    }
  },
};

