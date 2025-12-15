"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  ArrowLeftIcon,
  PlusIcon,
  DocumentTextIcon,
  TagIcon,
  SparklesIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { StudySet, Topic, Upload, FlashcardSet, Quiz } from "@/types";
import { studySetsApi, uploadsApi, flashcardsApi, quizzesApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import { TopicList } from "@/components/studySets/TopicList";
import { MaterialList } from "@/components/studySets/MaterialList";
import { TopicSelectionModal } from "@/components/studySets/TopicSelectionModal";

export default function StudySetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const studySetId = params.id as string;
  const { addNotification } = useAppStore();

  const [studySet, setStudySet] = useState<StudySet | null>(null);
  const [materials, setMaterials] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [topicSelectionModalOpen, setTopicSelectionModalOpen] = useState(false);
  const [generationMode, setGenerationMode] = useState<"flashcards" | "quiz" | null>(null);
  const [isExtractingTopics, setIsExtractingTopics] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [topicDetailModalOpen, setTopicDetailModalOpen] = useState(false);
  const [isManuallyExtracting, setIsManuallyExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState<"topics" | "flashcards" | "quizzes">("topics");
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);
  const [isLoadingQuizzes, setIsLoadingQuizzes] = useState(false);
  
  // Refs to prevent infinite loops
  const topicPollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingTopicsRef = useRef(false);
  const lastTopicCountRef = useRef(0);

  // Poll for topics when extraction is in progress
  const startTopicPolling = () => {
    if (isPollingTopicsRef.current) return; // Already polling
    
    isPollingTopicsRef.current = true;
    setIsExtractingTopics(true);
    
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts = 2 minutes max
    const pollInterval = 2000; // 2 seconds

    const poll = async () => {
      if (!isPollingTopicsRef.current) return; // Stop if cancelled
      
      try {
        const loaded = await studySetsApi.get(studySetId);
        const currentTopicCount = loaded.topicCount ?? loaded.topics?.length ?? 0;
        
        // Update study set state (but don't trigger re-polling)
        setStudySet(loaded);
        
        // Only stop polling if we have topics AND the count is stable (not flickering)
        if (currentTopicCount > 0 && currentTopicCount >= lastTopicCountRef.current) {
          // Topics extracted! Stop polling immediately
          setIsExtractingTopics(false);
          isPollingTopicsRef.current = false;
          lastTopicCountRef.current = currentTopicCount;
          
          if (topicPollingTimeoutRef.current) {
            clearTimeout(topicPollingTimeoutRef.current);
            topicPollingTimeoutRef.current = null;
          }
          
          // Only show notification if this is a new extraction (count increased)
          if (currentTopicCount > 0) {
            addNotification({
              userId: "temp",
              type: "success",
              title: "Topics Extracted",
              message: `${currentTopicCount} topic${currentTopicCount === 1 ? "" : "s"} extracted from your material.`,
              read: false,
            });
          }
          return; // Stop polling
        }
        
        // Update last known count even if no change (to track stability)
        lastTopicCountRef.current = currentTopicCount;

        attempts++;
        if (attempts < maxAttempts && isPollingTopicsRef.current) {
          // Only continue polling if we haven't found topics and haven't exceeded max attempts
          topicPollingTimeoutRef.current = setTimeout(poll, pollInterval);
        } else {
          // Timeout or max attempts reached - stop polling
          setIsExtractingTopics(false);
          isPollingTopicsRef.current = false;
          if (topicPollingTimeoutRef.current) {
            clearTimeout(topicPollingTimeoutRef.current);
            topicPollingTimeoutRef.current = null;
          }
          if (attempts >= maxAttempts) {
            addNotification({
              userId: "temp",
              type: "info",
              title: "Topic Extraction",
              message: "Topic extraction is taking longer than expected. Please refresh the page to check for updates.",
              read: false,
            });
          }
        }
      } catch (error) {
        console.error("Error polling for topics:", error);
        setIsExtractingTopics(false);
        isPollingTopicsRef.current = false;
        if (topicPollingTimeoutRef.current) {
          clearTimeout(topicPollingTimeoutRef.current);
          topicPollingTimeoutRef.current = null;
        }
      }
    };

    // Start polling after a delay (give backend time to start extraction)
    topicPollingTimeoutRef.current = setTimeout(poll, pollInterval);
  };

  // Load study set data
  const loadStudySet = async () => {
    try {
      const loaded = await studySetsApi.get(studySetId);
      setStudySet(loaded);
      
      // Update topic count tracking
      const currentTopicCount = loaded.topicCount ?? loaded.topics?.length ?? 0;
      
      // Only stop polling and show notification if topics actually increased
      // Use a threshold to prevent flickering during topic creation/merging
      if (currentTopicCount > lastTopicCountRef.current && currentTopicCount > 0) {
        // Topics were added, stop polling
        setIsExtractingTopics(false);
        isPollingTopicsRef.current = false;
        if (topicPollingTimeoutRef.current) {
          clearTimeout(topicPollingTimeoutRef.current);
          topicPollingTimeoutRef.current = null;
        }
        
        // Only show notification if this is a significant change (not just a count update during merging)
        if (currentTopicCount - lastTopicCountRef.current >= 1) {
          addNotification({
            userId: "temp",
            type: "success",
            title: "Topics Extracted",
            message: `${currentTopicCount} topic${currentTopicCount === 1 ? "" : "s"} extracted from your material.`,
            read: false,
          });
        }
      }
      
      // Update last known count
      lastTopicCountRef.current = currentTopicCount;
      
      // Load materials if available
      let loadedMaterials: Upload[] = [];
      if (loaded.materials && Array.isArray(loaded.materials) && loaded.materials.length > 0) {
        // Check if materials are objects (Upload) or IDs (string)
        const firstMaterial = loaded.materials[0];
        if (typeof firstMaterial === 'object' && firstMaterial !== null && 'id' in firstMaterial) {
          // Materials are already objects
          loadedMaterials = loaded.materials as unknown as Upload[];
        } else {
          // Materials are IDs, fetch them separately
          try {
            loadedMaterials = await studySetsApi.getMaterials(studySetId);
          } catch (error) {
            console.error("Failed to load materials:", error);
          }
        }
      } else {
        // Fetch materials separately
        try {
          loadedMaterials = await studySetsApi.getMaterials(studySetId);
        } catch (error) {
          console.error("Failed to load materials:", error);
        }
      }
      setMaterials(loadedMaterials);
      
      // Check if we should trigger topic extraction (after materials are loaded)
      // Only trigger if:
      // 1. We have materials
      // 2. No topics exist yet
      // 3. Not already polling/extracting
      // 4. At least one material has completed text extraction (not just processing)
      const materialCount = loaded.materialCount ?? loadedMaterials.length;
      const hasCompletedMaterials = loadedMaterials.some(m => 
        m.status === 'completed' && m.extractedText && m.extractedText.trim().length > 0
      );
      
      if (materialCount > 0 && currentTopicCount === 0 && !isPollingTopicsRef.current && hasCompletedMaterials) {
        // Automatically trigger topic extraction, then start polling
        console.log("[loadStudySet] Conditions met - automatically triggering topic extraction");
        setIsExtractingTopics(true);
        
        // Actually trigger the extraction API call
        studySetsApi.extractTopics(studySetId)
          .then(() => {
            console.log("[loadStudySet] Topic extraction triggered successfully, starting polling");
            // Start polling to check for results
            startTopicPolling();
          })
          .catch((error) => {
            console.error("[loadStudySet] Failed to trigger topic extraction:", error);
            setIsExtractingTopics(false);
            addNotification({
              userId: "temp",
              type: "error",
              title: "Extraction Failed",
              message: error?.message || "Failed to start topic extraction. Please try the 'Extract Topics' button.",
              read: false,
            });
          });
      }
    } catch (error: any) {
      console.error("Failed to load study set:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to load study set",
        read: false,
      });
      router.push("/library");
    }
  };

  // Load flashcards for this study set
  const loadFlashcards = async () => {
    if (isLoadingFlashcards) return;
    setIsLoadingFlashcards(true);
    try {
      const response = await flashcardsApi.listSets({
        studySetId,
        limit: 100,
        sortBy: 'date',
        sortOrder: 'desc',
      });
      setFlashcardSets(response.sets || []);
    } catch (error: any) {
      console.error("Failed to load flashcards:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to load flashcards",
        read: false,
      });
    } finally {
      setIsLoadingFlashcards(false);
    }
  };

  // Load quizzes for this study set
  const loadQuizzes = async () => {
    if (isLoadingQuizzes) return;
    setIsLoadingQuizzes(true);
    try {
      const response = await quizzesApi.list({
        studySetId,
        limit: 100,
        sortBy: 'date',
        sortOrder: 'desc',
      });
      setQuizzes(response.quizzes || []);
    } catch (error: any) {
      console.error("Failed to load quizzes:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to load quizzes",
        read: false,
      });
    } finally {
      setIsLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadStudySet().finally(() => {
      setIsLoading(false);
    });
  }, [studySetId]);

  // Load flashcards/quizzes when tab changes
  useEffect(() => {
    if (activeTab === "flashcards" && flashcardSets.length === 0 && !isLoadingFlashcards) {
      loadFlashcards();
    } else if (activeTab === "quizzes" && quizzes.length === 0 && !isLoadingQuizzes) {
      loadQuizzes();
    }
  }, [activeTab, studySetId]);

  // Refresh flashcards/quizzes when returning to the page (e.g., after generation)
  useEffect(() => {
    const handleFocus = () => {
      if (activeTab === "flashcards") {
        loadFlashcards();
      } else if (activeTab === "quizzes") {
        loadQuizzes();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [activeTab]);

  // Auto-poll for topics when materials exist but topics haven't been extracted yet
  // This useEffect should NOT start polling if loadStudySet already handled it
  useEffect(() => {
    if (!studySet || isLoading) return;
    
    const materialCount = studySet.materialCount ?? materials.length;
    const topicCount = studySet.topicCount ?? studySet.topics?.length ?? 0;
    
    // Only start polling if:
    // 1. We have materials
    // 2. No topics exist yet
    // 3. Not already polling (critical check using ref)
    // 4. Not already extracting (critical check)
    // 5. Last topic count was 0 (to prevent restarting after topics are found)
    // 6. At least one material has completed extraction
    const hasCompletedMaterials = materials.some(m => 
      m.status === 'completed' && m.extractedText && m.extractedText.trim().length > 0
    );
    
    if (
      materialCount > 0 && 
      topicCount === 0 && 
      lastTopicCountRef.current === 0 &&
      !isPollingTopicsRef.current && 
      !isExtractingTopics &&
      hasCompletedMaterials
    ) {
      // Start polling - topics should be extracted automatically by backend trigger
      setIsExtractingTopics(true);
      startTopicPolling();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studySet, materials, isLoading, isExtractingTopics]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (topicPollingTimeoutRef.current) {
        clearTimeout(topicPollingTimeoutRef.current);
        topicPollingTimeoutRef.current = null;
      }
      isPollingTopicsRef.current = false;
    };
  }, []);

  const handleGenerate = (mode: "flashcards" | "quiz") => {
    if (!studySet || studySet.topics.length === 0) {
      addNotification({
        userId: "temp",
        type: "warning",
        title: "No Topics",
        message: "Please wait for topics to be extracted from your materials.",
        read: false,
      });
      return;
    }
    setGenerationMode(mode);
    setTopicSelectionModalOpen(true);
  };

  const handleGenerateWithTopics = async (selectedTopicIds: string[]) => {
    if (!studySet || !generationMode) return;

    setIsGenerating(true);
    setTopicSelectionModalOpen(false);

    try {
      // Navigate to generation page with studySetId and topicIds
      const params = new URLSearchParams({
        studySetId: studySet.id,
        topicIds: selectedTopicIds.join(","),
        mode: generationMode,
      });
      router.push(`/generate?${params.toString()}`);
      setIsGenerating(false);
      
      // After navigation, the user will come back to this page after generation
      // We'll refresh the appropriate tab when they return
    } catch (error: any) {
      console.error("Generation error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to start generation",
        read: false,
      });
      setIsGenerating(false);
    }
  };

  // Manually trigger topic extraction
  const handleManualTopicExtraction = async () => {
    if (!studySet) return;

    setIsManuallyExtracting(true);
    setIsExtractingTopics(true);
    
    try {
      // Call the API to trigger topic extraction
      await studySetsApi.extractTopics(studySetId);
      
      addNotification({
        userId: "temp",
        type: "success",
        title: "Topic Extraction Started",
        message: "Topics are being extracted from your materials. This may take a few moments.",
        read: false,
      });

      // Start polling to check for results
      if (!isPollingTopicsRef.current) {
        startTopicPolling();
      }
    } catch (error: any) {
      console.error("Error triggering topic extraction:", error);
      setIsExtractingTopics(false);
      setIsManuallyExtracting(false);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Extraction Failed",
        message: error?.message || "Failed to start topic extraction. Please try again.",
        read: false,
      });
    } finally {
      setIsManuallyExtracting(false);
    }
  };

  if (isLoading || !studySet) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              {isLoading ? "Loading study set..." : "Study set not found"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const materialCount = studySet.materialCount ?? materials.length;
  const topicCount = studySet.topicCount ?? studySet.topics?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                {studySet.title}
              </h1>
              {studySet.description && (
                <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-4">
                  {studySet.description}
                </p>
              )}
              <div className="flex items-center gap-6 text-sm text-neutral-gray600 dark:text-neutral-gray400">
                <span className="flex items-center gap-1">
                  <DocumentTextIcon className="w-4 h-4" />
                  {materialCount} {materialCount === 1 ? "material" : "materials"}
                </span>
                <span className="flex items-center gap-1">
                  <TagIcon className="w-4 h-4" />
                  {topicCount} {topicCount === 1 ? "topic" : "topics"}
                </span>
              </div>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push(`/upload?studySetId=${studySetId}`)}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Upload Material
            </Button>
          </div>
        </div>

        {/* Generate Actions */}
        {topicCount > 0 && (
          <Card className="p-6 mb-8 bg-neutral-gray50 dark:bg-neutral-gray800 border-2 border-primary-black dark:border-primary-white">
            <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
              Generate Study Materials
            </h2>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-4">
              Select topics to generate flashcards or quizzes from this study set.
            </p>
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={() => handleGenerate("flashcards")}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <SparklesIcon className="w-5 h-5" />
                Generate Flashcards
              </Button>
              <Button
                variant="accent"
                onClick={() => handleGenerate("quiz")}
                disabled={isGenerating}
                className="flex items-center gap-2"
              >
                <AcademicCapIcon className="w-5 h-5" />
                Generate Quiz
              </Button>
            </div>
          </Card>
        )}

        {/* Tabs Section */}
        <Card className="p-6 mb-8">
          {/* Tabs */}
          <div className="border-b border-neutral-gray200 dark:border-neutral-gray700 mb-6">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("topics")}
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "topics"
                    ? "text-primary-black dark:text-primary-white"
                    : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
                }`}
              >
                Topics
                {topicCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-gray100 dark:bg-neutral-gray800 rounded-full">
                    {topicCount}
                  </span>
                )}
                {activeTab === "topics" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-black dark:bg-primary-white" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("flashcards")}
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "flashcards"
                    ? "text-primary-black dark:text-primary-white"
                    : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
                }`}
              >
                Flashcards
                {flashcardSets.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-gray100 dark:bg-neutral-gray800 rounded-full">
                    {flashcardSets.length}
                  </span>
                )}
                {activeTab === "flashcards" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-black dark:bg-primary-white" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("quizzes")}
                className={`px-6 py-3 font-medium text-sm transition-colors relative ${
                  activeTab === "quizzes"
                    ? "text-primary-black dark:text-primary-white"
                    : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
                }`}
              >
                Quizzes
                {quizzes.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-gray100 dark:bg-neutral-gray800 rounded-full">
                    {quizzes.length}
                  </span>
                )}
                {activeTab === "quizzes" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-black dark:bg-primary-white" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "topics" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 flex items-center gap-2">
                  <TagIcon className="w-5 h-5" />
                  Topics
                </h2>
                {topicCount === 0 && materialCount > 0 && !isExtractingTopics && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleManualTopicExtraction}
                    disabled={isManuallyExtracting}
                    className="flex items-center gap-2"
                  >
                    {isManuallyExtracting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Extracting...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-4 h-4" />
                        Extract Topics
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {/* Topic Extraction Progress */}
              {isExtractingTopics && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                        Extracting topics from your materials...
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                        This may take a few moments. Topics will appear here automatically when ready.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {topicCount > 0 ? (
                <TopicList 
                  topics={studySet.topics || []} 
                  onTopicClick={(topic) => {
                    setSelectedTopic(topic);
                    setTopicDetailModalOpen(true);
                  }}
                />
              ) : !isExtractingTopics ? (
                <div className="text-center py-8 text-neutral-gray600 dark:text-neutral-gray400">
                  {materialCount > 0 ? (
                    <>
                      <p className="mb-2 font-medium">No topics extracted yet.</p>
                      <p className="text-sm mb-4">
                        {materials.some(m => m.status === 'completed' && m.extractedText && m.extractedText.trim().length > 0)
                          ? "Your materials are ready. Click 'Extract Topics' above to generate topics from your content."
                          : "Please wait for text extraction to complete on your materials, then you can extract topics."}
                      </p>
                      {materials.some(m => m.status === 'completed' && m.extractedText && m.extractedText.trim().length > 0) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleManualTopicExtraction}
                          disabled={isManuallyExtracting}
                          className="mt-2"
                        >
                          {isManuallyExtracting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2 inline-block"></div>
                              Extracting...
                            </>
                          ) : (
                            "Extract Topics Now"
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="mb-2">No topics extracted yet.</p>
                      <p className="text-sm">
                        Upload materials and wait for text extraction to complete, then topics will be automatically extracted.
                      </p>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )}

          {activeTab === "flashcards" && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4 flex items-center gap-2">
                <AcademicCapIcon className="w-5 h-5" />
                Flashcards
              </h2>
              {isLoadingFlashcards ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-black dark:border-primary-white mx-auto"></div>
                  <p className="mt-4 text-neutral-gray600 dark:text-neutral-gray400">Loading flashcards...</p>
                </div>
              ) : flashcardSets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {flashcardSets.map((set) => (
                    <Card key={set.id} hover className="p-4 cursor-pointer" onClick={() => router.push(`/flashcards/${set.id}`)}>
                      <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">{set.title || "Untitled"}</h3>
                      {set.description && (
                        <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-2 line-clamp-2">{set.description}</p>
                      )}
                      <p className="text-xs text-neutral-gray500 dark:text-neutral-gray500">
                        {set.flashcardCount || set.flashcards?.length || 0} cards
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-gray600 dark:text-neutral-gray400">
                  <p className="mb-2">No flashcards generated yet.</p>
                  <p className="text-sm">Generate flashcards from topics using the "Generate Flashcards" button above.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "quizzes" && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Quizzes
              </h2>
              {isLoadingQuizzes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-black dark:border-primary-white mx-auto"></div>
                  <p className="mt-4 text-neutral-gray600 dark:text-neutral-gray400">Loading quizzes...</p>
                </div>
              ) : quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {quizzes.map((quiz) => (
                    <Card key={quiz.id} hover className="p-4 cursor-pointer" onClick={() => router.push(`/quizzes/${quiz.id}`)}>
                      <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">{quiz.title || "Untitled"}</h3>
                      {quiz.description && (
                        <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-2 line-clamp-2">{quiz.description}</p>
                      )}
                      <p className="text-xs text-neutral-gray500 dark:text-neutral-gray500">
                        {quiz.questions?.length || 0} questions
                      </p>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-gray600 dark:text-neutral-gray400">
                  <p className="mb-2">No quizzes generated yet.</p>
                  <p className="text-sm">Generate quizzes from topics using the "Generate Quiz" button above.</p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Materials Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              Materials
            </h2>
          </div>
          {materialCount > 0 ? (
            <MaterialList materials={materials} />
          ) : (
            <div className="text-center py-8 text-neutral-gray600 dark:text-neutral-gray400">
              <p className="mb-2">No materials uploaded yet.</p>
              <Button
                variant="outline"
                onClick={() => router.push(`/upload?studySetId=${studySetId}`)}
                className="mt-4"
              >
                Upload Your First Material
              </Button>
            </div>
          )}
        </Card>

        {/* Topic Selection Modal */}
        {studySet.topics && studySet.topics.length > 0 && (
          <TopicSelectionModal
            isOpen={topicSelectionModalOpen}
            onClose={() => {
              setTopicSelectionModalOpen(false);
              setGenerationMode(null);
            }}
            topics={studySet.topics}
            onGenerate={handleGenerateWithTopics}
            mode={generationMode || "flashcards"}
          />
        )}

        {/* Topic Detail Modal */}
        {selectedTopic && (
          <Modal
            isOpen={topicDetailModalOpen}
            onClose={() => {
              setTopicDetailModalOpen(false);
              setSelectedTopic(null);
            }}
            title={selectedTopic.title}
          >
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                  Content Summary
                </h3>
                <div className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg">
                  <p className="text-sm text-neutral-gray700 dark:text-neutral-gray300 whitespace-pre-wrap">
                    {selectedTopic.content}
                  </p>
                </div>
              </div>
              
              {selectedTopic.materialIds && selectedTopic.materialIds.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                    Found in {selectedTopic.materialIds.length} {selectedTopic.materialIds.length === 1 ? "Material" : "Materials"}
                  </h3>
                  <div className="p-3 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg">
                    <p className="text-xs text-neutral-gray600 dark:text-neutral-gray400">
                      This topic was extracted from {selectedTopic.materialIds.length} {selectedTopic.materialIds.length === 1 ? "material" : "materials"} in this study set.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end gap-3 pt-4 border-t border-neutral-gray200 dark:border-neutral-gray700">
                <Button
                  variant="outline"
                  onClick={() => {
                    setTopicDetailModalOpen(false);
                    setSelectedTopic(null);
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}

