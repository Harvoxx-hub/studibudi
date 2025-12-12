import { api } from "./client";
import { FlashcardSet, Quiz } from "@/types";

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

interface GenerationJob {
  id: string;
  type: "flashcards" | "quiz";
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    setId?: string;
    quizId?: string;
    set?: any; // Legacy format - full flashcard set object
    quiz?: any; // Legacy format - full quiz object
  };
  error?: string;
  createdAt: string;
  completedAt?: string;
}

interface GenerationJobResponse {
  job: GenerationJob;
}

interface GenerationJobsResponse {
  jobs: GenerationJob[];
  total: number;
  limit: number;
  offset: number;
}

interface CreditsResponse {
  limits: {
    credits: number;
    plan: "free" | "premium";
  };
}

// Generation options
interface GenerationOptions {
  count?: number;
  difficulty?: "easy" | "medium" | "hard";
  subject?: string;
  title?: string;
  description?: string;
}

// Generation API Service
export const generateApi = {
  // Generate flashcards
  generateFlashcards: async (
    content: string,
    options?: GenerationOptions,
    uploadId?: string
  ): Promise<GenerationJob> => {
    try {
      const response = await api.post<ApiResponse<GenerationJobResponse>>(
        "/generate/flashcards",
        {
          content,
          options: {
            count: options?.count || 10,
            difficulty: options?.difficulty || "medium",
            subject: options?.subject,
            title: options?.title,
            description: options?.description,
          },
          uploadId,
          async: true, // Always use async mode for job tracking
        }
      );

      if (response.success && response.data) {
        return response.data.job;
      }
      throw new Error(response.error?.message || "Failed to start flashcard generation");
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Invalid content. Please provide valid study material.");
      }
      if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      if (error.response?.status === 403) {
        const errorData = error.response?.data?.error;
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        throw new Error("Insufficient credits. Please purchase more credits to continue.");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to start flashcard generation");
    }
  },

  // Generate quiz
  generateQuiz: async (
    content: string,
    options?: GenerationOptions,
    uploadId?: string
  ): Promise<GenerationJob> => {
    try {
      const response = await api.post<ApiResponse<GenerationJobResponse>>(
        "/generate/quiz",
        {
          content,
          options: {
            count: options?.count || 10,
            difficulty: options?.difficulty || "medium",
            subject: options?.subject,
            title: options?.title,
            description: options?.description,
          },
          uploadId,
          async: true, // Always use async mode for job tracking
        }
      );

      if (response.success && response.data) {
        return response.data.job;
      }
      throw new Error(response.error?.message || "Failed to start quiz generation");
    } catch (error: any) {
      if (error.response?.status === 400) {
        throw new Error("Invalid content. Please provide valid study material.");
      }
      if (error.response?.status === 429) {
        throw new Error("Too many requests. Please wait a moment and try again.");
      }
      if (error.response?.status === 403) {
        const errorData = error.response?.data?.error;
        if (errorData?.message) {
          throw new Error(errorData.message);
        }
        throw new Error("Insufficient credits. Please purchase more credits to continue.");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to start quiz generation");
    }
  },

  // Get generation jobs
  getJobs: async (params?: {
    limit?: number;
    offset?: number;
    status?: "pending" | "processing" | "completed" | "failed";
  }): Promise<GenerationJobsResponse> => {
    try {
      const response = await api.get<ApiResponse<GenerationJobsResponse>>(
        "/generate/jobs",
        { params }
      );

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || "Failed to get generation jobs");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get generation jobs");
    }
  },

  // Get job status (filter jobs by ID from list)
  getJob: async (jobId: string): Promise<GenerationJob> => {
    try {
      // Since there's no direct GET /jobs/:jobId endpoint, we'll get all jobs and filter
      // In a real implementation, the backend should provide a direct endpoint
      const response = await api.get<ApiResponse<GenerationJobsResponse>>(
        "/generate/jobs",
        { params: { limit: 100 } }
      );

      if (response.success && response.data) {
        const job = response.data.jobs.find((j) => j.id === jobId);
        if (job) {
          return job;
        }
        throw new Error("Generation job not found");
      }
      throw new Error(response.error?.message || "Failed to get job status");
    } catch (error: any) {
      if (error.response?.status === 404 || error.message?.includes("not found")) {
        throw new Error("Generation job not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get job status");
    }
  },

  // Get credits balance
  getLimits: async (): Promise<CreditsResponse["limits"]> => {
    try {
      const response = await api.get<ApiResponse<CreditsResponse>>(
        "/generate/limits"
      );

      if (response.success && response.data) {
        return response.data.limits;
      }
      throw new Error(response.error?.message || "Failed to get credits");
    } catch (error: any) {
      // Handle network errors gracefully
      const errorMessage = typeof error?.message === 'string' ? error.message : '';
      const isNetworkError = 
        error?.code === "ERR_NETWORK" || 
        errorMessage === "Network Error" ||
        errorMessage.includes("Network error") ||
        errorMessage.includes("ECONNREFUSED") ||
        errorMessage.includes("timeout");

      if (isNetworkError) {
        // Create a network error with a helpful message
        const networkError = new Error("Cannot connect to the API server. Please check your connection or ensure the backend is running.");
        (networkError as any).isNetworkError = true;
        (networkError as any).code = "ERR_NETWORK";
        throw networkError;
      }

      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get credits");
    }
  },
};

