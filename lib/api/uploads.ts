import { api, default as apiClient } from "./client";
import { Upload } from "@/types";

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

interface UploadResponse {
  upload: Upload & {
    fileName?: string;
    fileSize?: number;
  };
}

interface UploadsResponse {
  uploads: Upload[];
  total: number;
  limit: number;
  offset: number;
}

// Query parameters for listing
interface ListParams {
  limit?: number;
  offset?: number;
  type?: "pdf" | "text" | "image";
}

// Uploads API Service
export const uploadsApi = {
  // Upload PDF/Document file
  uploadFile: async (
    file: File,
    type: "pdf" | "document",
    onProgress?: (progress: number) => void
  ): Promise<Upload & { fileName?: string; fileSize?: number }> => {
    try {
      // Log file details for debugging
      console.log("Uploading file:", {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadType: type,
      });

      const formData = new FormData();
      formData.append("file", file, file.name); // Include filename explicitly
      formData.append("type", type);

      // Log FormData contents for debugging
      console.log("FormData contents:", {
        hasFile: formData.has("file"),
        hasType: formData.has("type"),
        fileSize: file.size,
        fileName: file.name,
        fileType: file.type,
      });

      // Log what will be sent
      console.log("Sending FormData request to:", "/uploads/file");

      // Use apiClient directly to have full control over the request
      const response = await apiClient.post<ApiResponse<UploadResponse>>(
        "/uploads/file",
        formData,
        {
          // Don't set any headers - let axios/browser handle FormData automatically
          headers: {},
          // Increase timeout for large files
          timeout: 60000,
          // Ensure maxContentLength and maxBodyLength are set
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
          // Track upload progress
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data.upload;
      }
      throw new Error(response.data.error?.message || "Failed to upload file");
    } catch (error: any) {
      // Log full error for debugging
      console.error("Upload file error - Full details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        headers: error.response?.headers,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
        },
        message: error.message,
        stack: error.stack,
      });
      
      // Log the raw response if available
      if (error.response?.data) {
        console.error("Server error response:", JSON.stringify(error.response.data, null, 2));
      }

      // Handle network errors (server not reachable)
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error(getNetworkErrorMessage());
      }
      // Handle server errors
      if (error.response?.status === 500) {
        // Try to extract detailed error message
        let errorMessage = "Internal server error. The server encountered an issue processing your file.";
        
        if (error.response?.data) {
          const errorData = error.response.data;
          
          // Try different error message locations
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' 
              ? errorData.error 
              : JSON.stringify(errorData.error);
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
          
          // Add additional context if available
          if (errorData.stack) {
            console.error("Server error stack trace:", errorData.stack);
          }
          if (errorData.details) {
            console.error("Server error details:", errorData.details);
            errorMessage += ` Details: ${JSON.stringify(errorData.details)}`;
          }
        }
        
        console.error("500 Server Error - Full response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
        });
        
        throw new Error(
          `${errorMessage} Please check the browser console for more details or contact support if the problem persists.`
        );
      }
      if (error.response?.status === 400) {
        throw new Error("Invalid file. Please check file type and size.");
      }
      if (error.response?.status === 413) {
        throw new Error("File too large. Please upload a smaller file.");
      }
      if (error.response?.status === 429) {
        throw new Error("Too many uploads. Please wait a moment and try again.");
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
      throw new Error("Failed to upload file");
    }
  },

  // Upload Image (OCR)
  uploadImage: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<Upload & { fileName?: string; fileSize?: number }> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Explicitly configure headers to ensure FormData is sent correctly
      const response = await apiClient.post<ApiResponse<UploadResponse>>(
        "/uploads/image",
        formData,
        {
          headers: {
            // Don't set Content-Type - let browser set it with boundary
            // Axios will automatically handle FormData if Content-Type is not set
          },
          // Increase timeout for large files
          timeout: 60000,
          // Track upload progress
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(percentCompleted);
            }
          },
        }
      );

      if (response.data.success && response.data.data) {
        return response.data.data.upload;
      }
      throw new Error(response.data.error?.message || "Failed to upload image");
    } catch (error: any) {
      // Handle network errors (server not reachable)
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error(getNetworkErrorMessage());
      }
      // Handle server errors
      if (error.response?.status === 500) {
        throw new Error(
          error.response?.data?.error?.message || 
          error.response?.data?.message || 
          "Internal server error. Please try again later or contact support if the problem persists."
        );
      }
      if (error.response?.status === 400) {
        throw new Error("Invalid image. Please check file type and size.");
      }
      if (error.response?.status === 413) {
        throw new Error("Image too large. Please upload a smaller image.");
      }
      if (error.response?.status === 429) {
        throw new Error("Too many uploads. Please wait a moment and try again.");
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
      throw new Error("Failed to upload image");
    }
  },

  // Upload Text
  uploadText: async (
    text: string,
    title?: string
  ): Promise<Upload> => {
    try {
      const response = await api.post<ApiResponse<UploadResponse>>("/uploads/text", {
        text,
        title,
      });

      if (response.success && response.data) {
        return response.data.upload;
      }
      throw new Error(response.error?.message || "Failed to upload text");
    } catch (error: any) {
      // Handle network errors (server not reachable)
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        throw new Error(getNetworkErrorMessage());
      }
      // Handle server errors
      if (error.response?.status === 500) {
        throw new Error(
          error.response?.data?.error?.message || 
          error.response?.data?.message || 
          "Internal server error. Please try again later or contact support if the problem persists."
        );
      }
      if (error.response?.status === 400) {
        throw new Error("Invalid text. Please provide valid content.");
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
      throw new Error("Failed to upload text");
    }
  },

  // Get single upload by ID
  get: async (uploadId: string): Promise<Upload> => {
    try {
      const response = await api.get<ApiResponse<{ upload: Upload }>>(`/uploads/${uploadId}`);

      if (response.success && response.data) {
        return response.data.upload;
      }
      throw new Error(response.error?.message || "Failed to get upload");
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Upload not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get upload");
    }
  },

  // Get upload history
  list: async (params?: ListParams): Promise<UploadsResponse> => {
    try {
      const response = await api.get<ApiResponse<UploadsResponse>>("/uploads", {
        params,
      });

      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error?.message || "Failed to get uploads");
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to get uploads");
    }
  },

  // Delete upload
  delete: async (uploadId: string): Promise<void> => {
    try {
      const response = await api.delete<ApiResponse<{}>>(`/uploads/${uploadId}`);
      if (!response.success) {
        throw new Error(response.error?.message || "Failed to delete upload");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error("Upload not found");
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.message) {
        throw error;
      }
      throw new Error("Failed to delete upload");
    }
  },
};

