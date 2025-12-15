"use client";

import { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  LightBulbIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  TabSwitcher,
  FileUpload,
  TextPaste,
  ImageUpload,
} from "@/components/upload";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { canCreateFlashcards, canCreateQuizzes, getMaxFileSize } from "@/lib/premium";
import { generateApi, uploadsApi, studySetsApi } from "@/lib/api";
import { StudySetSelector } from "@/components/studySets";

type UploadTab = "pdf" | "text" | "image";
type GenerationMode = "flashcards" | "quiz" | null;

function UploadPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { getUsageStats } = useAppStore();
  const [activeTab, setActiveTab] = useState<UploadTab>("pdf");
  const [generationMode, setGenerationMode] = useState<GenerationMode>(null);
  const [credits, setCredits] = useState<number | null>(null);

  // File/Content state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfText, setPdfText] = useState<string>("");
  const [textContent, setTextContent] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageText, setImageText] = useState<string>("");
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentUploadId, setCurrentUploadId] = useState<string | null>(null);
  const [isExtractingText, setIsExtractingText] = useState(false);
  const [studySetId, setStudySetId] = useState<string | null>(null);
  const [isExtractingTopics, setIsExtractingTopics] = useState(false);
  const { addNotification } = useAppStore();
  
  // Refs to prevent infinite loops and track polling
  const topicPollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingTopicsRef = useRef(false);
  const textPollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check URL params for mode and studySetId
  useEffect(() => {
    const mode = searchParams.get("mode");
    if (mode === "flashcards" || mode === "quiz") {
      setGenerationMode(mode);
    }
    const urlStudySetId = searchParams.get("studySetId");
    if (urlStudySetId) {
      setStudySetId(urlStudySetId);
    }
  }, [searchParams]);

  // Get current content based on active tab
  const getCurrentContent = (): string => {
    switch (activeTab) {
      case "pdf":
        return pdfText;
      case "text":
        return textContent;
      case "image":
        return imageText;
      default:
        return "";
    }
  };

  const hasContent = (): boolean => {
    // Only allow generation when text is actually extracted
    // Don't show buttons if text extraction is still in progress
    if (isExtractingText) {
      return false;
    }
    
    const content = getCurrentContent();
    return content.trim().length >= 50; // Minimum 50 characters
  };

  const handlePdfSelect = async (file: File) => {
    setPdfFile(file);
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Validate file before upload
      const fileSizeMB = file.size / (1024 * 1024);
      const maxSizeMB = getMaxFileSize(user);
      
      if (fileSizeMB > maxSizeMB) {
        throw new Error(`File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum allowed size (${maxSizeMB}MB). Please upload a smaller file.`);
      }

      // Determine file type
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      const type = fileExtension === "pdf" ? "pdf" : "document";
      
      console.log("Starting file upload:", {
        fileName: file.name,
        fileSize: `${fileSizeMB.toFixed(2)}MB`,
        fileType: type,
        maxSize: `${maxSizeMB}MB`,
      });
      
      if (!studySetId) {
        throw new Error("Please select a Study Set before uploading.");
      }

      const upload = await uploadsApi.uploadFile(file, type, (progress) => {
        setUploadProgress(progress);
      }, studySetId);
      setCurrentUploadId(upload.id);
      setUploadProgress(100);
      
      // If extracted text is empty, poll for it (extraction happens asynchronously)
      if (!upload.extractedText || upload.extractedText.trim().length === 0) {
        setIsExtractingText(true);
        
        // Poll for extracted text
        let attempts = 0;
        const maxAttempts = 60; // 60 attempts = 60 seconds max
        const pollInterval = 1000; // 1 second
        
        const pollForText = async () => {
          try {
            // Try to get the upload directly by ID (if endpoint exists) or from list
            let currentUpload;
            try {
              currentUpload = await uploadsApi.get(upload.id);
            } catch {
              // Fallback to listing if get endpoint doesn't exist
              const uploads = await uploadsApi.list({ limit: 100, offset: 0 });
              currentUpload = uploads.uploads.find(u => u.id === upload.id);
            }
            
            if (currentUpload) {
              if (currentUpload.extractedText && currentUpload.extractedText.trim().length > 0) {
                // Text extraction completed
                setPdfText(currentUpload.extractedText);
                setIsExtractingText(false);
                
                // Navigate to Study Set page where topic extraction will be shown
                if (studySetId && currentUpload.studySetId === studySetId) {
                  addNotification({
                    userId: user?.id || "temp",
                    type: "success",
                    title: "Text Extracted",
                    message: `Text extraction completed. Navigating to Study Set to show topic extraction progress...`,
                    read: false,
                  });
                  // Small delay to show notification, then navigate
                  setTimeout(() => {
                    navigateToStudySet(studySetId);
                  }, 1000);
                } else {
                  addNotification({
                    userId: user?.id || "temp",
                    type: "success",
                    title: "File Processed",
                    message: `Text extraction completed for ${file.name}`,
                    read: false,
                  });
                }
                return;
              } else if (currentUpload.status === 'failed') {
                // Extraction failed - still allow generation with upload ID
                setIsExtractingText(false);
                setUploadError("Text extraction failed. You can still generate with the uploaded file.");
                setPdfText(""); // Allow generation with upload ID
                return;
              }
            }
            
            // Continue polling if not done
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollForText, pollInterval);
            } else {
              // Timeout - still allow generation with upload ID
              setIsExtractingText(false);
              setUploadError("Text extraction is taking longer than expected. You can still generate with the uploaded file.");
              setPdfText(""); // Allow generation with upload ID
            }
          } catch (error) {
            console.error("Error polling for extracted text:", error);
            setIsExtractingText(false);
            // Allow generation anyway with upload ID
            setPdfText("");
          }
        };
        
        // Start polling after a short delay
        setTimeout(pollForText, pollInterval);
        
        addNotification({
          userId: user?.id || "temp",
          type: "success",
          title: "File Uploaded",
          message: `Successfully uploaded ${file.name}. Extracting text...`,
          read: false,
        });
      } else {
        // Text already extracted
        setPdfText(upload.extractedText);
        setIsExtractingText(false);
        addNotification({
          userId: user?.id || "temp",
          type: "success",
          title: "File Uploaded",
          message: `Successfully uploaded ${file.name}`,
          read: false,
        });
      }
    } catch (error: any) {
      console.error("Upload error:", {
        error,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      });
      setUploadError(error?.message || "Failed to upload file");
      setPdfFile(null);
      setUploadProgress(0);
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Upload Failed",
        message: error?.message || "Failed to upload file. Please check the file and try again.",
        read: false,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = async (file: File) => {
    setImageFile(file);
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      if (!studySetId) {
        throw new Error("Please select a Study Set before uploading.");
      }

      const upload = await uploadsApi.uploadImage(file, (progress) => {
        setUploadProgress(progress);
      }, studySetId);
      setCurrentUploadId(upload.id);
      setUploadProgress(100);
      
      // If extracted text is empty, poll for it (extraction happens asynchronously)
      if (!upload.extractedText || upload.extractedText.trim().length === 0) {
        setIsExtractingText(true);
        
        // Poll for extracted text
        let attempts = 0;
        const maxAttempts = 60; // 60 attempts = 60 seconds max
        const pollInterval = 1000; // 1 second
        
        const pollForText = async () => {
          try {
            let currentUpload;
            try {
              currentUpload = await uploadsApi.get(upload.id);
            } catch {
              const uploads = await uploadsApi.list({ limit: 100, offset: 0 });
              currentUpload = uploads.uploads.find(u => u.id === upload.id);
            }
            
            if (currentUpload) {
              if (currentUpload.extractedText && currentUpload.extractedText.trim().length > 0) {
                // Text extraction completed
                setImageText(currentUpload.extractedText);
                setIsExtractingText(false);
                
                // Navigate to Study Set page where topic extraction will be shown
                if (studySetId && currentUpload.studySetId === studySetId) {
                  addNotification({
                    userId: user?.id || "temp",
                    type: "success",
                    title: "Text Extracted",
                    message: `Text extraction completed. Navigating to Study Set to show topic extraction progress...`,
                    read: false,
                  });
                  // Small delay to show notification, then navigate
                  setTimeout(() => {
                    navigateToStudySet(studySetId);
                  }, 1000);
                } else {
                  addNotification({
                    userId: user?.id || "temp",
                    type: "success",
                    title: "Image Processed",
                    message: `Text extraction completed for ${file.name}`,
                    read: false,
                  });
                }
                return;
              } else if (currentUpload.status === 'failed') {
                // Extraction failed - still allow generation with upload ID
                setIsExtractingText(false);
                setUploadError("Text extraction failed. You can still generate with the uploaded file.");
                setImageText("");
                return;
              }
            }
            
            // Continue polling if not done
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollForText, pollInterval);
            } else {
              // Timeout - still allow generation with upload ID
              setIsExtractingText(false);
              setUploadError("Text extraction is taking longer than expected. You can still generate with the uploaded file.");
              setImageText("");
            }
          } catch (error) {
            console.error("Error polling for extracted text:", error);
            setIsExtractingText(false);
            setImageText("");
          }
        };
        
        // Start polling after a short delay
        setTimeout(pollForText, pollInterval);
        
        addNotification({
          userId: user?.id || "temp",
          type: "success",
          title: "Image Uploaded",
          message: `Successfully uploaded ${file.name}. Extracting text...`,
          read: false,
        });
      } else {
        // Text already extracted
        setImageText(upload.extractedText);
        setIsExtractingText(false);
        addNotification({
          userId: user?.id || "temp",
          type: "success",
          title: "Image Uploaded",
          message: `Successfully uploaded ${file.name}`,
          read: false,
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error?.message || "Failed to upload image");
      setImageFile(null);
      setUploadProgress(0);
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Upload Failed",
        message: error?.message || "Failed to upload image",
        read: false,
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleTextUpload = async () => {
    if (!textContent.trim() || textContent.trim().length < 50) {
      setUploadError("Text must be at least 50 characters");
      return;
    }
    
    setUploadError(null);
    setIsUploading(true);
    
    try {
      if (!studySetId) {
        throw new Error("Please select a Study Set before uploading.");
      }

      const upload = await uploadsApi.uploadText(textContent, undefined, studySetId);
      setCurrentUploadId(upload.id);
      
      // Navigate to Study Set page where topic extraction will be shown
      if (studySetId) {
        addNotification({
          userId: user?.id || "temp",
          type: "success",
          title: "Text Uploaded",
          message: "Text uploaded successfully. Navigating to Study Set to show topic extraction progress...",
          read: false,
        });
        // Small delay to show notification, then navigate
        setTimeout(() => {
          navigateToStudySet(studySetId);
        }, 1000);
      } else {
        addNotification({
          userId: user?.id || "temp",
          type: "success",
          title: "Text Uploaded",
          message: "Successfully uploaded text content",
          read: false,
        });
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(error?.message || "Failed to upload text");
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Upload Failed",
        message: error?.message || "Failed to upload text",
        read: false,
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (topicPollingTimeoutRef.current) {
        clearTimeout(topicPollingTimeoutRef.current);
        topicPollingTimeoutRef.current = null;
      }
      if (textPollingTimeoutRef.current) {
        clearTimeout(textPollingTimeoutRef.current);
        textPollingTimeoutRef.current = null;
      }
      isPollingTopicsRef.current = false;
    };
  }, []);

  // Navigate to Study Set page after text extraction completes
  const navigateToStudySet = useCallback((targetStudySetId: string) => {
    if (targetStudySetId) {
      // Navigate to Study Set page where topic extraction will be shown
      router.push(`/study-sets/${targetStudySetId}`);
    }
  }, [router]);

  // Load credits on mount
  useEffect(() => {
    const loadCredits = async () => {
      if (!user) return;
      try {
        const limits = await generateApi.getLimits();
        setCredits(limits.credits);
      } catch (error) {
        console.error("Failed to load credits:", error);
        if (user?.credits !== undefined) {
          setCredits(user.credits);
        }
      }
    };
    loadCredits();
  }, [user]);

  const handleGenerate = async (mode: "flashcards" | "quiz") => {
    // If text extraction is in progress, wait for it to complete
    if (isExtractingText && currentUploadId) {
      addNotification({
        userId: user?.id || "temp",
        type: "info",
        title: "Please Wait",
        message: "Text extraction is in progress. Please wait for it to complete before generating.",
        read: false,
      });
      
      // Wait for text extraction to complete
      let attempts = 0;
      const maxAttempts = 60; // 60 seconds max
      const pollInterval = 1000; // 1 second
      
      const waitForText = async (): Promise<boolean> => {
        try {
          let currentUpload;
          try {
            currentUpload = await uploadsApi.get(currentUploadId);
          } catch {
            const uploads = await uploadsApi.list({ limit: 100, offset: 0 });
            currentUpload = uploads.uploads.find(u => u.id === currentUploadId);
          }
          
          if (currentUpload) {
            if (currentUpload.extractedText && currentUpload.extractedText.trim().length > 0) {
              // Text extraction completed
              if (activeTab === "pdf") {
                setPdfText(currentUpload.extractedText);
              } else if (activeTab === "image") {
                setImageText(currentUpload.extractedText);
              }
              setIsExtractingText(false);
              return true;
            } else if (currentUpload.status === 'failed') {
              // Extraction failed - proceed anyway
              setIsExtractingText(false);
              return true;
            }
          }
          
          attempts++;
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, pollInterval));
            return waitForText();
          } else {
            // Timeout - proceed anyway
            setIsExtractingText(false);
            return true;
          }
        } catch (error) {
          console.error("Error waiting for text extraction:", error);
          setIsExtractingText(false);
          return true; // Proceed anyway
        }
      };
      
      await waitForText();
    }
    
    const content = getCurrentContent();
    if (!hasContent()) {
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Content Required",
        message: "Please provide content before generating. Minimum 50 characters required.",
        read: false,
      });
      return;
    }

    // Check credits (estimate: 10 items for flashcards, 10 questions for quiz)
    const estimatedCost = 10; // Default estimate
    const checkResult = mode === "flashcards"
      ? canCreateFlashcards(user, estimatedCost)
      : canCreateQuizzes(user, estimatedCost);

    if (!checkResult.allowed) {
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Insufficient Credits",
        message: checkResult.reason || "You don't have enough credits. Please purchase more credits to continue.",
        read: false,
      });
      router.push("/premium");
      return;
    }

    // Store content and upload ID in sessionStorage for the loading/generation page
    sessionStorage.setItem("generationContent", content);
    sessionStorage.setItem("generationMode", mode);
    sessionStorage.setItem("generationSource", activeTab);
    if (currentUploadId) {
      sessionStorage.setItem("generationUploadId", currentUploadId);
    }

    // Navigate to generation page
    router.push(`/generate?mode=${mode}`);
  };
  
  // Auto-upload text when user pastes/enters text (disabled for now - user can manually trigger)
  // useEffect(() => {
  //   if (activeTab === "text" && textContent.trim().length >= 50 && !isUploading) {
  //     // Debounce text upload
  //     const timer = setTimeout(() => {
  //       handleTextUpload();
  //     }, 2000); // Wait 2 seconds after user stops typing
  //     
  //     return () => clearTimeout(timer);
  //   }
  // }, [textContent, activeTab, isUploading]);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Upload Study Material
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">
            Upload your notes, PDFs, or paste text to generate flashcards or quizzes
          </p>
        </div>

        {/* Generation Mode Indicator */}
        {generationMode && (
          <Card className="mb-6 p-4 bg-neutral-gray50 dark:bg-neutral-gray800 border-2 border-primary-black dark:border-primary-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {generationMode === "flashcards" ? (
                  <LightBulbIcon className="w-6 h-6 text-primary-black dark:text-primary-white" />
                ) : (
                  <DocumentTextIcon className="w-6 h-6 text-primary-black dark:text-primary-white" />
                )}
                <div>
                  <p className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                    Generating {generationMode === "flashcards" ? "Flashcards" : "Quiz"}
                  </p>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                    Upload your content below to get started
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setGenerationMode(null)}
              >
                Change Mode
              </Button>
            </div>
          </Card>
        )}

        {/* Study Set Selector */}
        <Card className="mb-6 p-6">
          <StudySetSelector
            selectedStudySetId={studySetId}
            onSelect={setStudySetId}
            required={true}
          />
        </Card>

        {/* Tab Switcher */}
        <TabSwitcher activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Upload Error */}
        {uploadError && (
          <Card className="mb-6 p-4 bg-status-error/10 dark:bg-red-900/20 border border-status-error dark:border-red-800">
            <p className="text-sm text-status-error dark:text-red-400">
              {uploadError}
            </p>
          </Card>
        )}

        {/* Content Upload Areas */}
        <div className="mb-8">
          {activeTab === "pdf" && (
            <FileUpload
              onFileSelect={handlePdfSelect}
              onFileRemove={() => {
                setPdfFile(null);
                setPdfText("");
                setCurrentUploadId(null);
                setUploadError(null);
                setUploadProgress(0);
                setIsExtractingText(false);
              }}
              file={pdfFile}
              extractedText={pdfText}
              acceptedTypes={[".pdf", ".doc", ".docx"]}
              maxSizeMB={getMaxFileSize(user)}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          )}

          {activeTab === "text" && (
            <TextPaste
              onTextChange={setTextContent}
              initialText={textContent}
              minLength={50}
              maxLength={10000}
              isUploading={isUploading}
            />
          )}

          {activeTab === "image" && (
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={() => {
                setImageFile(null);
                setImageText("");
                setCurrentUploadId(null);
                setUploadError(null);
                setUploadProgress(0);
                setIsExtractingText(false);
              }}
              image={imageFile}
              extractedText={imageText}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
            />
          )}
        </div>

        {/* Generation Actions */}
        {isExtractingText && (
          <Card className="p-6 bg-neutral-gray50 dark:bg-neutral-gray800 border-2 border-primary-black dark:border-primary-white">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-black dark:border-primary-white mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                Extracting Text...
              </h3>
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                Please wait while we extract text from your file. Generation options will appear once extraction is complete.
              </p>
            </div>
          </Card>
        )}
        
        {/* Generation Actions - Show when text is ready */}
        {hasContent() && !isExtractingText && (
          <Card className="p-6 bg-neutral-gray50 dark:bg-neutral-gray800 border-2 border-primary-black dark:border-primary-white">
            <h3 className="text-lg font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
              Ready to Generate
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleGenerate("flashcards")}
                className="flex items-center justify-center gap-2"
              >
                <LightBulbIcon className="w-5 h-5" />
                Generate Flashcards
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => handleGenerate("quiz")}
                className="flex items-center justify-center gap-2"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Generate Quiz
              </Button>
            </div>
            <p className="text-xs text-neutral-gray600 dark:text-neutral-gray400 mt-4">
              Your content will be processed by AI to create study materials
            </p>
          </Card>
        )}

        {/* Help Text */}
        {!hasContent() && (
          <Card className="p-6 bg-neutral-gray50 dark:bg-neutral-gray800">
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 text-center">
              {activeTab === "pdf" &&
                "Upload a PDF, DOC, or DOCX file to extract text and generate study materials"}
              {activeTab === "text" &&
                "Paste or type your study material (minimum 50 characters)"}
              {activeTab === "image" &&
                "Upload an image with text to extract content using OCR"}
            </p>
          </Card>
        )}
      </div>

    </DashboardLayout>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-gray900 mb-4">
                Loading...
              </h2>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    }>
      <UploadPageContent />
    </Suspense>
  );
}

