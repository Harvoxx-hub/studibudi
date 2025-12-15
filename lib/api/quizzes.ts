import { api } from "./client";
import { Quiz, QuizAttempt, QuizQuestion } from "@/types";

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

interface QuizResponse {
  quiz: Quiz;
}

interface QuizzesResponse {
  quizzes: Quiz[];
  total: number;
  limit: number;
  offset: number;
}

interface QuizAttemptResponse {
  attempt: QuizAttempt;
}

interface QuizAttemptsResponse {
  attempts: QuizAttempt[];
  total: number;
  limit: number;
  offset: number;
}

// Query parameters for listing
interface ListParams {
  limit?: number;
  offset?: number;
  subject?: string;
  studySetId?: string;
  sortBy?: "date" | "title" | "subject";
  sortOrder?: "asc" | "desc";
  search?: string;
}

// Quiz attempt submission
interface SubmitAttemptRequest {
  answers: Array<{
    questionId: string;
    selectedAnswer: number;
  }>;
}

// Quizzes API Service
export const quizzesApi = {
  // Create quiz
  create: async (
    title: string,
    description: string | undefined,
    subject: string | undefined,
    questions: Array<{
      question: string;
      options: string[];
      correctAnswer: number;
      explanation?: string;
    }>
  ): Promise<Quiz> => {
    try {
      const response = await api.post<ApiResponse<QuizResponse>>("/quizzes", {
        title,
        description,
        subject,
        questions,
      });
      if (response.success && response.data) {
        return response.data.quiz;
      }
      throw new Error(response.error?.message || "Failed to create quiz");
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
      throw new Error("Failed to create quiz");
    }
  },

  // List quizzes
  list: async (params?: ListParams): Promise<QuizzesResponse> => {
    try {
      const response = await api.get<ApiResponse<QuizzesResponse>>("/quizzes", {
        params,
      });
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || "Failed to get quizzes");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get quizzes");
    }
  },

  // Get quiz
  get: async (quizId: string): Promise<Quiz> => {
    try {
      const response = await api.get<ApiResponse<QuizResponse>>(
        `/quizzes/${quizId}`
      );
      if (response.success && response.data) {
        return response.data.quiz;
      }
      throw new Error(response.error?.message || "Failed to get quiz");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Quiz not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get quiz");
    }
  },

  // Update quiz
  update: async (
    quizId: string,
    updates: {
      title?: string;
      description?: string;
      subject?: string;
      questions?: QuizQuestion[];
    }
  ): Promise<Quiz> => {
    try {
      const response = await api.patch<ApiResponse<QuizResponse>>(
        `/quizzes/${quizId}`,
        updates
      );
      if (response.success && response.data) {
        return response.data.quiz;
      }
      throw new Error(response.error?.message || "Failed to update quiz");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Quiz not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to update quiz");
    }
  },

  // Delete quiz
  delete: async (quizId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(`/quizzes/${quizId}`);
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete quiz");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Quiz not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to delete quiz");
    }
  },

  // Submit quiz attempt
  submitAttempt: async (
    quizId: string,
    answers: SubmitAttemptRequest["answers"]
  ): Promise<QuizAttempt> => {
    try {
      const response = await api.post<ApiResponse<QuizAttemptResponse>>(
        `/quizzes/${quizId}/attempts`,
        { answers }
      );
      if (response.success && response.data) {
        return response.data.attempt;
      }
      throw new Error(
        response.error?.message || "Failed to submit quiz attempt"
      );
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Quiz not found");
      }
      if (error.response?.status === 400) {
        throw new Error("Invalid answers. Please check your submission.");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to submit quiz attempt");
    }
  },

  // Get quiz attempts
  getAttempts: async (
    quizId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<QuizAttemptsResponse> => {
    try {
      const response = await api.get<ApiResponse<QuizAttemptsResponse>>(
        `/quizzes/${quizId}/attempts`,
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
      if (error.response?.status === 404) {
        throw new Error("Quiz not found");
      }
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

