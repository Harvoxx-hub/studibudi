import { api } from "./client";
import { Notification } from "@/types";

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

interface NotificationsListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
  limit: number;
  offset: number;
}

interface MarkReadResponse {
  notification: Notification;
}

interface MarkAllReadResponse {
  count: number;
}

// Notifications API Service
export const notificationsApi = {
  // Get notifications
  getNotifications: async (params?: {
    limit?: number;
    offset?: number;
    read?: boolean;
  }): Promise<NotificationsListResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.limit) queryParams.append("limit", params.limit.toString());
      if (params?.offset) queryParams.append("offset", params.offset.toString());
      if (params?.read !== undefined) queryParams.append("read", params.read.toString());

      const queryString = queryParams.toString();
      const url = `/notifications${queryString ? `?${queryString}` : ""}`;

      const response = await api.get<ApiResponse<NotificationsListResponse>>(url);

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || "Failed to get notifications"
      );
    } catch (error: any) {
      // Handle network errors - don't throw for non-critical features
      // Let the caller decide how to handle it
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        const networkError = new Error("Network error. Please check your connection.");
        (networkError as any).code = "ERR_NETWORK";
        (networkError as any).isNetworkError = true;
        throw networkError;
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get notifications");
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId: string): Promise<Notification> => {
    try {
      const response = await api.patch<ApiResponse<MarkReadResponse>>(
        `/notifications/${notificationId}/read`
      );

      if (response.success && response.data) {
        return response.data.notification;
      }
      throw new Error(
        response.error?.message || "Failed to mark notification as read"
      );
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to mark notification as read");
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<number> => {
    try {
      const response = await api.patch<ApiResponse<MarkAllReadResponse>>(
        "/notifications/read-all"
      );

      if (response.success && response.data) {
        return response.data.count;
      }
      throw new Error(
        response.error?.message || "Failed to mark all notifications as read"
      );
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to mark all notifications as read");
    }
  },

  // Delete notification
  deleteNotification: async (notificationId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(
        `/notifications/${notificationId}`
      );

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to delete notification"
        );
      }
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to delete notification");
    }
  },
};

