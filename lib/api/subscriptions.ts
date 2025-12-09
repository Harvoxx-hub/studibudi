import { api } from "./client";

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

interface PaymentSessionResponse {
  paymentUrl: string;
  sessionId: string;
}

interface SubscriptionResponse {
  subscription: {
    plan: "free" | "premium";
    status: "active" | "canceled" | "past_due" | "trialing";
    currentPeriodEnd?: string;
    cancelAtPeriodEnd?: boolean;
    details?: {
      id: string;
      status: string;
      currentPeriodStart: string;
      currentPeriodEnd: string;
    };
  };
}

// Subscriptions API Service
export const subscriptionsApi = {
  // Create payment session
  createPaymentSession: async (
    planId: "monthly" | "quarterly" | "yearly",
    successUrl?: string,
    cancelUrl?: string
  ): Promise<PaymentSessionResponse> => {
    try {
      // Get current URL for success/cancel URLs if not provided
      const baseUrl =
        typeof window !== "undefined" ? window.location.origin : "";
      const defaultSuccessUrl = `${baseUrl}/premium/success`;
      const defaultCancelUrl = `${baseUrl}/premium/failure`;

      const response = await api.post<ApiResponse<PaymentSessionResponse>>(
        "/payments/create",
        {
          planId,
          successUrl: successUrl || defaultSuccessUrl,
          cancelUrl: cancelUrl || defaultCancelUrl,
        }
      );

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || "Failed to create payment session"
      );
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Invalid plan. Please select a valid subscription plan.");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to create payment session");
    }
  },

  // Get subscription status
  getSubscription: async (): Promise<SubscriptionResponse["subscription"]> => {
    try {
      const response = await api.get<ApiResponse<SubscriptionResponse>>(
        "/users/me/subscription"
      );

      if (response.success && response.data) {
        return response.data.subscription;
      }
      throw new Error(
        response.error?.message || "Failed to get subscription status"
      );
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get subscription status");
    }
  },

  // Cancel subscription
  cancelSubscription: async (): Promise<void> => {
    try {
      const response = await api.post<ApiResponse<{}>>(
        "/users/me/subscription/cancel"
      );

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to cancel subscription"
        );
      }
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to cancel subscription");
    }
  },

  // Reactivate subscription
  reactivateSubscription: async (): Promise<void> => {
    try {
      const response = await api.post<ApiResponse<{}>>(
        "/users/me/subscription/reactivate"
      );

      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to reactivate subscription"
        );
      }
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to reactivate subscription");
    }
  },
};

