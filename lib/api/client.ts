import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { authApi } from "./auth";
import { authStorage } from "@/lib/storage";

// Get base URL from environment or use default
const getBaseURL = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Default to local development emulator
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:5001/student-budi/us-central1/api";
  }
  // Production URL
  return "https://us-central1-student-budi.cloudfunctions.net/api";
};

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // Increased timeout for file uploads
  // Don't set Content-Type as default - set it conditionally in interceptor
});

// Request interceptor for adding auth token and handling Content-Type
apiClient.interceptors.request.use(
  (config) => {
    // Get token from authStorage (consistent with storage utility)
    const token = authStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle Content-Type based on data type
    if (config.data instanceof FormData) {
      // For FormData, completely remove Content-Type header
      // Axios will automatically detect FormData and set: multipart/form-data; boundary=...
      const headers = config.headers as any;
      
      // Remove from all possible locations
      delete headers["Content-Type"];
      delete headers["content-type"];
      
      // Remove from axios default headers
      if (headers.common) {
        delete headers.common["Content-Type"];
        delete headers.common["content-type"];
      }
      if (headers.post) {
        delete headers.post["Content-Type"];
        delete headers.post["content-type"];
      }
      
      // Log for debugging
      console.log("FormData request - Content-Type removed, axios will set boundary automatically");
    } else if (config.data && typeof config.data === "object" && !(config.data instanceof FormData)) {
      // For JSON data, set Content-Type if not already set
      if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        config.headers["Content-Type"] = "application/json";
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle rate limiting (429) - don't retry, just reject
    if (error.response?.status === 429) {
      const errorData = error.response?.data as any;
      const errorMessage = errorData?.error?.message || 
                          errorData?.message || 
                          "Too many requests. Please try again later.";
      
      // Don't retry rate-limited requests
      const rateLimitError = new Error(errorMessage);
      (rateLimitError as any).isRateLimited = true;
      (rateLimitError as any).code = 429;
      (rateLimitError as any).response = error.response;
      return Promise.reject(rateLimitError);
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Create a new config with updated token, preserving all original properties
            const retryConfig = {
              ...originalRequest,
            };
            if (retryConfig.headers) {
              retryConfig.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(retryConfig);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Try to refresh the token
      const currentToken = authStorage.getToken();

      if (currentToken) {
        try {
          // First, try to get a fresh ID token from Firebase Auth
          // This is the proper way to refresh tokens
          let freshIdToken: string | null = null;
          
          try {
            const { getCurrentUserToken } = await import("@/lib/firebase/auth");
            freshIdToken = await getCurrentUserToken(true); // Force refresh
          } catch (firebaseError) {
            console.warn("Failed to get fresh Firebase token:", firebaseError);
          }

          // If we got a fresh token, use it; otherwise logout (don't try with expired token)
          if (freshIdToken) {
            // Send fresh token to backend to get updated user info
            const response = await authApi.refreshToken(freshIdToken);
            const newToken = response.token;
            
            // Store new token using authStorage
            authStorage.setToken(newToken);

            // Create a new config with updated token, preserving all original properties
            const retryConfig = {
              ...originalRequest,
            };
            if (retryConfig.headers) {
              retryConfig.headers.Authorization = `Bearer ${newToken}`;
            }

            processQueue(null, newToken);
            isRefreshing = false;

            // Retry with updated token - all original properties (method, url, data) are preserved
            return apiClient(retryConfig);
          } else {
            // Firebase refresh failed - token is truly expired or user is logged out
            // Don't try backend refresh with expired token, just logout
            throw new Error("Token refresh failed - please login again");
          }
        } catch (refreshError: any) {
          // Don't retry if we got rate limited during refresh
          if (refreshError.isRateLimited || refreshError.code === 429) {
            processQueue(refreshError, null);
            isRefreshing = false;
            // Return the rate limit error instead of logging out
            return Promise.reject(refreshError);
          }
          // Refresh failed - clear token and logout
          processQueue(refreshError, null);
          isRefreshing = false;

          // Clear token using authStorage
          authStorage.removeToken();
          
          // Import and use auth store to logout properly
          if (typeof window !== "undefined") {
            // Only redirect if not already on auth pages
            const currentPath = window.location.pathname;
            if (
              !currentPath.startsWith("/login") &&
              !currentPath.startsWith("/signup") &&
              !currentPath.startsWith("/forgot-password")
            ) {
              // Use dynamic import to avoid circular dependency
              import("@/store/useAuthStore").then(({ useAuthStore }) => {
                useAuthStore.getState().logout();
                window.location.href = "/login";
              });
            }
          }
        }
      } else {
        // No token to refresh - logout and redirect to login
        isRefreshing = false;
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          if (
            !currentPath.startsWith("/login") &&
            !currentPath.startsWith("/signup") &&
            !currentPath.startsWith("/forgot-password")
          ) {
            // Use dynamic import to avoid circular dependency
            import("@/store/useAuthStore").then(({ useAuthStore }) => {
              useAuthStore.getState().logout();
              window.location.href = "/login";
            });
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API helper functions
export const api = {
  get: <T>(url: string, config?: any) =>
    apiClient.get<T>(url, config).then((res) => res.data),
  post: <T>(url: string, data?: any, config?: any) =>
    apiClient.post<T>(url, data, config).then((res) => res.data),
  put: <T>(url: string, data?: any, config?: any) =>
    apiClient.put<T>(url, data, config).then((res) => res.data),
  delete: <T>(url: string, config?: any) =>
    apiClient.delete<T>(url, config).then((res) => res.data),
  patch: <T>(url: string, data?: any, config?: any) =>
    apiClient.patch<T>(url, data, config).then((res) => res.data),
};


