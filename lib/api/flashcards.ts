import { api } from "./client";
import { FlashcardSet, Flashcard } from "@/types";

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

interface FlashcardSetResponse {
  set: FlashcardSet;
}

interface FlashcardSetsResponse {
  sets: FlashcardSet[];
  total: number;
  limit: number;
  offset: number;
}

interface FlashcardResponse {
  card: Flashcard;
}

interface BulkUpdateRequest {
  updates: Array<{
    cardId: string;
    isKnown?: boolean;
    isBookmarked?: boolean;
    lastStudied?: string;
  }>;
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

// Flashcards API Service
export const flashcardsApi = {
  // Create flashcard set
  createSet: async (
    title: string,
    description: string | undefined,
    subject: string | undefined,
    flashcards: Array<{ front: string; back: string }>
  ): Promise<FlashcardSet> => {
    try {
      const response = await api.post<ApiResponse<FlashcardSetResponse>>(
        "/flashcards/sets",
        {
          title,
          description,
          subject,
          flashcards,
        }
      );
      if (response.success && response.data) {
        return response.data.set;
      }
      throw new Error(response.error?.message || "Failed to create flashcard set");
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
      throw new Error("Failed to create flashcard set");
    }
  },

  // List flashcard sets
  listSets: async (params?: ListParams): Promise<FlashcardSetsResponse> => {
    try {
      const response = await api.get<ApiResponse<FlashcardSetsResponse>>(
        "/flashcards/sets",
        { params }
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || "Failed to get flashcard sets"
      );
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get flashcard sets");
    }
  },

  // Get flashcard set
  getSet: async (setId: string): Promise<FlashcardSet> => {
    try {
      const response = await api.get<ApiResponse<FlashcardSetResponse>>(
        `/flashcards/sets/${setId}`
      );
      if (response.success && response.data) {
        return response.data.set;
      }
      throw new Error(response.error?.message || "Failed to get flashcard set");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Flashcard set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get flashcard set");
    }
  },

  // Update flashcard set
  updateSet: async (
    setId: string,
    updates: {
      title?: string;
      description?: string;
      subject?: string;
    }
  ): Promise<FlashcardSet> => {
    try {
      const response = await api.patch<ApiResponse<FlashcardSetResponse>>(
        `/flashcards/sets/${setId}`,
        updates
      );
      if (response.success && response.data) {
        return response.data.set;
      }
      throw new Error(response.error?.message || "Failed to update flashcard set");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Flashcard set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to update flashcard set");
    }
  },

  // Delete flashcard set
  deleteSet: async (setId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(
        `/flashcards/sets/${setId}`
      );
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete flashcard set");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Flashcard set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to delete flashcard set");
    }
  },

  // Add flashcard
  addCard: async (
    setId: string,
    front: string,
    back: string
  ): Promise<Flashcard> => {
    try {
      const response = await api.post<ApiResponse<FlashcardResponse>>(
        `/flashcards/sets/${setId}/cards`,
        { front, back }
      );
      if (response.success && response.data) {
        return response.data.card;
      }
      throw new Error(response.error?.message || "Failed to add flashcard");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Flashcard set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to add flashcard");
    }
  },

  // Update flashcard
  updateCard: async (
    setId: string,
    cardId: string,
    updates: {
      front?: string;
      back?: string;
      isKnown?: boolean;
      isBookmarked?: boolean;
      lastStudied?: string;
    }
  ): Promise<Flashcard> => {
    try {
      const response = await api.patch<ApiResponse<FlashcardResponse>>(
        `/flashcards/sets/${setId}/cards/${cardId}`,
        updates
      );
      if (response.success && response.data) {
        return response.data.card;
      }
      throw new Error(response.error?.message || "Failed to update flashcard");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Flashcard not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to update flashcard");
    }
  },

  // Delete flashcard
  deleteCard: async (setId: string, cardId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(
        `/flashcards/sets/${setId}/cards/${cardId}`
      );
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete flashcard");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Flashcard not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to delete flashcard");
    }
  },

  // Bulk update flashcards
  bulkUpdateCards: async (
    setId: string,
    updates: BulkUpdateRequest["updates"]
  ): Promise<void> => {
    try {
      const response = await api.patch<ApiResponse<{}>>(
        `/flashcards/sets/${setId}/cards/bulk`,
        { updates }
      );
      if (!response.success) {
        throw new Error(
          response.error?.message || "Failed to bulk update flashcards"
        );
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Flashcard set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to bulk update flashcards");
    }
  },
};

