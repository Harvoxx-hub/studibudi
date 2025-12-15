import { api } from "./client";
import { StudySet, Topic } from "@/types";

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

interface StudySetResponse {
  studySet: StudySet;
}

interface StudySetsResponse {
  studySets: StudySet[];
  total: number;
  limit: number;
  offset: number;
}

interface TopicResponse {
  topic: Topic;
}

interface TopicsResponse {
  topics: Topic[];
  total: number;
}

// Query parameters for listing
interface ListParams {
  limit?: number;
  offset?: number;
  sortBy?: "date" | "title";
  sortOrder?: "asc" | "desc";
  search?: string;
}

// Study Sets API Service
export const studySetsApi = {
  // Create study set
  create: async (
    title: string,
    description?: string
  ): Promise<StudySet> => {
    try {
      const response = await api.post<ApiResponse<StudySetResponse>>(
        "/study-sets",
        {
          title,
          description,
        }
      );
      if (response.success && response.data) {
        return response.data.studySet;
      }
      throw new Error(response.error?.message || "Failed to create study set");
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
      throw new Error("Failed to create study set");
    }
  },

  // List study sets
  list: async (params?: ListParams): Promise<StudySetsResponse> => {
    try {
      const response = await api.get<ApiResponse<StudySetsResponse>>(
        "/study-sets",
        { params }
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(
        response.error?.message || "Failed to get study sets"
      );
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get study sets");
    }
  },

  // Get study set with materials and topics
  get: async (studySetId: string): Promise<StudySet> => {
    try {
      const response = await api.get<ApiResponse<StudySetResponse>>(
        `/study-sets/${studySetId}`
      );
      if (response.success && response.data) {
        return response.data.studySet;
      }
      throw new Error(response.error?.message || "Failed to get study set");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Study set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get study set");
    }
  },

  // Update study set
  update: async (
    studySetId: string,
    updates: {
      title?: string;
      description?: string;
    }
  ): Promise<StudySet> => {
    try {
      const response = await api.patch<ApiResponse<StudySetResponse>>(
        `/study-sets/${studySetId}`,
        updates
      );
      if (response.success && response.data) {
        return response.data.studySet;
      }
      throw new Error(response.error?.message || "Failed to update study set");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Study set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to update study set");
    }
  },

  // Delete study set
  delete: async (studySetId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(
        `/study-sets/${studySetId}`
      );
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete study set");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Study set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to delete study set");
    }
  },

  // Get all topics for a study set
  getTopics: async (studySetId: string): Promise<Topic[]> => {
    try {
      const response = await api.get<ApiResponse<TopicsResponse>>(
        `/study-sets/${studySetId}/topics`
      );
      if (response.success && response.data) {
        return response.data.topics;
      }
      throw new Error(response.error?.message || "Failed to get topics");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Study set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get topics");
    }
  },

  // Trigger topic extraction for a study set
  extractTopics: async (studySetId: string): Promise<Topic[]> => {
    try {
      const response = await api.post<ApiResponse<TopicsResponse>>(
        `/study-sets/${studySetId}/topics/extract`
      );
      if (response.success && response.data) {
        return response.data.topics;
      }
      throw new Error(response.error?.message || "Failed to extract topics");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Study set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to extract topics");
    }
  },

  // Get all materials in a study set
  getMaterials: async (studySetId: string): Promise<any[]> => {
    try {
      const response = await api.get<ApiResponse<{ materials: any[] }>>(
        `/study-sets/${studySetId}/materials`
      );
      if (response.success && response.data) {
        return response.data.materials;
      }
      throw new Error(response.error?.message || "Failed to get materials");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Study set not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get materials");
    }
  },
};

// Topics API Service (can be used independently)
export const topicsApi = {
  // Get topic by ID
  get: async (topicId: string): Promise<Topic> => {
    try {
      const response = await api.get<ApiResponse<TopicResponse>>(
        `/topics/${topicId}`
      );
      if (response.success && response.data) {
        return response.data.topic;
      }
      throw new Error(response.error?.message || "Failed to get topic");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Topic not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get topic");
    }
  },

  // Update topic
  update: async (
    topicId: string,
    updates: {
      title?: string;
      content?: string;
    }
  ): Promise<Topic> => {
    try {
      const response = await api.patch<ApiResponse<TopicResponse>>(
        `/topics/${topicId}`,
        updates
      );
      if (response.success && response.data) {
        return response.data.topic;
      }
      throw new Error(response.error?.message || "Failed to update topic");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Topic not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to update topic");
    }
  },

  // Delete topic
  delete: async (topicId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(
        `/topics/${topicId}`
      );
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete topic");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Topic not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to delete topic");
    }
  },
};
