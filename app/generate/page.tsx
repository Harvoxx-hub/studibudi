"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { LoadingScreen, GenerationResult } from "@/components/generation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FlashcardSet, Quiz } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { canCreateFlashcards, canCreateQuizzes } from "@/lib/premium";
import { generateApi, flashcardsApi, quizzesApi } from "@/lib/api";

type GenerationMode = "flashcards" | "quiz";

function GeneratePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const { getUsageStats, addNotification } = useAppStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FlashcardSet | Quiz | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const mode = (searchParams.get("mode") || "flashcards") as GenerationMode;
  const studySetId = searchParams.get("studySetId") || undefined;
  const topicIdsParam = searchParams.get("topicIds");
  const topicIds = topicIdsParam ? topicIdsParam.split(",").filter(Boolean) : undefined;
  const content =
    typeof window !== "undefined"
      ? sessionStorage.getItem("generationContent") || ""
      : "";
  const uploadId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("generationUploadId") || undefined
      : undefined;

  // Load credits on mount
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const limits = await generateApi.getLimits();
        setCredits(limits.credits);
        // Update user credits in store
        if (user && limits.credits !== user.credits) {
          setUser({ ...user, credits: limits.credits });
        }
      } catch (err) {
        console.error("Failed to load credits:", err);
        // Fallback to user credits if available
        if (user?.credits !== undefined) {
          setCredits(user.credits);
        }
      }
    };

    if (user) {
      loadCredits();
    }
  }, [user, setUser]);

  useEffect(() => {
    // If using Study Set, content will be fetched from backend - no need to check content
    // Only check content if not using Study Set
    if (!studySetId && (!content || content.length < 50)) {
      setError("No content found. Please go back and upload your study material.");
      setIsGenerating(false);
      return;
    }
    // Don't auto-generate, wait for user to fill form and click generate
  }, [content, mode, user, studySetId]);

  const checkLimitsAndGenerate = async () => {
    // Allow generation if using Study Set (content fetched from backend) or if content exists
    if (!studySetId && (!content || content.length < 50)) {
      setError("No content found. Please go back and upload your study material.");
      return;
    }
    try {
      const limits = await generateApi.getLimits();
      
      // Check if user has enough credits
      const required = mode === "flashcards" ? count : count; // 1 credit per flashcard or per question
      const hasEnoughCredits = limits.credits >= required;

      if (!hasEnoughCredits) {
        const message = `Insufficient credits. You need ${required} credits but only have ${limits.credits}. Purchase more credits to continue.`;
        setError(message);
        setIsGenerating(false);
        return;
      }

      // Start generation
      generateContent();
    } catch (err: any) {
      // Fallback to local check if API fails
      const checkResult = mode === "flashcards"
        ? canCreateFlashcards(user, count)
        : canCreateQuizzes(user, count);

      if (!checkResult.allowed) {
        setError(checkResult.reason || "Insufficient credits. Please purchase more credits to continue.");
        setIsGenerating(false);
        return;
      }

      // If local check passes, proceed with generation
      generateContent();
    }
  };

  const handleStartGeneration = async () => {
    // Validate count
    if (count < 1 || count > 50) {
      setError("Count must be between 1 and 50");
      return;
    }

    // Check limits before starting
    await checkLimitsAndGenerate();
  };


  const generateContent = async () => {
    // Only run on client side
    if (typeof window === "undefined") return;

    try {
      setError(null);
      setIsGenerating(true);
      setProgress(0);

      // Start generation job
      const options = {
        count: Math.min(Math.max(count, 1), 50),
        difficulty,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        studySetId,
        topicIds,
      };

      let job;
      if (mode === "flashcards") {
        job = await generateApi.generateFlashcards(content || "", options, uploadId);
      } else {
        job = await generateApi.generateQuiz(content || "", options, uploadId);
      }

      setJobId(job.id);
      setProgress(10);

      // Poll job status until complete
      await pollJobStatus(job.id);
    } catch (err: any) {
      setError(
        err.message || "Failed to generate content. Please try again."
      );
      setIsGenerating(false);
      setProgress(0);
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Generation Failed",
        message: err.message || "Failed to generate content",
        read: false,
      });
    }
  };

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 60; // 5 minutes max (60 * 5 seconds)
    let attempts = 0;
    let currentProgress = 10;

    const pollInterval = setInterval(async () => {
      try {
        attempts++;
        const job = await generateApi.getJob(jobId);

        // Update progress (simulate based on status)
        if (job.status === "processing") {
          currentProgress = Math.min(90, currentProgress + 5);
          setProgress(currentProgress);
        } else if (job.status === "completed") {
          clearInterval(pollInterval);
          setProgress(100);

          // Fetch the generated content
          if (job.result) {
            // Handle both old format ({ set: {...}, quiz: {...} }) and new format ({ setId: string, quizId: string })
            let setId: string | undefined;
            let quizId: string | undefined;

            if (mode === "flashcards") {
              setId = job.result.setId || (job.result.set as any)?.id;
              if (setId) {
                const flashcardSet = await flashcardsApi.getSet(setId);
              setResult(flashcardSet);
              } else {
                throw new Error("Generated flashcard set not found in job result");
              }
            } else if (mode === "quiz") {
              quizId = job.result.quizId || (job.result.quiz as any)?.id;
              if (quizId) {
                const quiz = await quizzesApi.get(quizId);
              setResult(quiz);
              } else {
                throw new Error("Generated quiz not found in job result");
              }
            } else {
              throw new Error("Generated content not found");
            }
          } else {
            throw new Error("Job completed but no result found");
          }

          setIsGenerating(false);
          
          // Refresh credits after successful generation
          try {
            const limits = await generateApi.getLimits();
            setCredits(limits.credits);
            if (user) {
              setUser({ ...user, credits: limits.credits });
            }
          } catch (err) {
            console.error("Failed to refresh credits:", err);
          }

          addNotification({
            userId: user?.id || "temp",
            type: "success",
            title: "Generation Complete",
            message: `Successfully generated ${mode === "flashcards" ? "flashcards" : "quiz"}`,
            read: false,
          });
        } else if (job.status === "failed") {
          clearInterval(pollInterval);
          setError(job.error || "Generation failed. Please try again.");
          setIsGenerating(false);
          setProgress(0);
        }

        // Timeout after max attempts
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setError("Generation is taking longer than expected. Please check back later.");
          setIsGenerating(false);
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        // Continue polling on error (might be temporary)
        if (attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setError("Failed to check generation status. Please try again later.");
          setIsGenerating(false);
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const handleView = () => {
    if (!result) return;
    
    // Navigate to the correct route (no need to store in sessionStorage since we have the real data)
    if (mode === "flashcards") {
      router.push(`/flashcards/${result.id}`);
    } else {
      // For quiz, go to detail page first, then user can start quiz
      router.push(`/quizzes/${result.id}`);
    }
  };

  const handleGenerateMore = () => {
    router.push("/upload");
  };

  const handleRetry = () => {
    generateContent();
  };

  if (isGenerating) {
    return (
      <DashboardLayout>
        <LoadingScreen
          mode={mode}
          progress={Math.min(progress, 100)}
          estimatedTime={Math.max(0, Math.ceil((100 - progress) / 10))}
        />
      </DashboardLayout>
    );
  }

  if (error && !content) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
                No Content Found
              </h2>
              <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6">{error}</p>
              <Button variant="primary" onClick={handleGenerateMore}>
                Go Back to Upload
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !isGenerating && !result) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
                Generation Failed
              </h2>
              <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <Button variant="primary" onClick={handleRetry}>
                  Try Again
                </Button>
                <Button variant="outline" onClick={handleGenerateMore}>
                  Go Back
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (result) {
    return (
      <DashboardLayout>
        <GenerationResult
          mode={mode}
          data={result}
          onView={handleView}
          onGenerateMore={handleGenerateMore}
        />
      </DashboardLayout>
    );
  }

  // Show form before generating
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
              Generate {mode === "flashcards" ? "Flashcards" : "Quiz"}
            </h1>
            {credits !== null && (
              <div className="px-4 py-2 bg-primary-black/10 dark:bg-primary-white/10 rounded-lg">
                <span className="text-sm font-medium text-neutral-gray600 dark:text-neutral-gray400">
                  Credits:{" "}
                </span>
                <span className="text-lg font-bold text-primary-black dark:text-primary-white">
                  {credits}
                </span>
              </div>
            )}
          </div>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">
            Configure your generation options below. {mode === "flashcards" ? "Each flashcard" : "Each question"} costs 1 credit.
          </p>
        </div>

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleStartGeneration();
            }}
            className="space-y-6"
          >
            {/* Title */}
            <Input
              label="Title (Optional)"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Enter a title for your ${mode === "flashcards" ? "flashcard set" : "quiz"}`}
            />

            {/* Description */}
            <div className="w-full">
              <label className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-1">
                Description (Optional)
              </label>
              <textarea
                className="w-full px-4 py-2 border rounded-lg text-neutral-gray900 dark:text-neutral-gray100 placeholder:text-neutral-gray400 dark:placeholder:text-neutral-gray500 bg-neutral-white dark:bg-neutral-gray800 focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white focus:border-transparent border-neutral-gray300 dark:border-neutral-gray600 resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Enter a description for your ${mode === "flashcards" ? "flashcard set" : "quiz"}`}
              />
            </div>

            {/* Count */}
            <div className="w-full">
              <label className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-1">
                Number of {mode === "flashcards" ? "Flashcards" : "Questions"} (1-50)
              </label>
              <Input
                type="number"
                min={1}
                max={50}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 10)}
              />
              {credits !== null && (
                <p className="mt-1 text-sm text-neutral-gray600 dark:text-neutral-gray400">
                  Cost: {count} credit{count !== 1 ? "s" : ""} • You have {credits} credit{credits !== 1 ? "s" : ""}
                  {credits < count && (
                    <span className="text-red-600 dark:text-red-400 ml-1">
                      (Insufficient credits)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Difficulty */}
            <div className="w-full">
              <label className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-1">
                Difficulty
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg text-neutral-gray900 dark:text-neutral-gray100 bg-neutral-white dark:bg-neutral-gray800 focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white focus:border-transparent border-neutral-gray300 dark:border-neutral-gray600"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Error message */}
            {error && (
              <div className="p-4 bg-primary-black/10 dark:bg-primary-white/10 border border-primary-black/20 dark:border-primary-white/20 rounded-lg">
                <p className="text-sm text-primary-black dark:text-primary-white">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={isGenerating}
              >
                Generate {mode === "flashcards" ? "Flashcards" : "Quiz"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateMore}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default function GeneratePage() {
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
      <GeneratePageContent />
    </Suspense>
  );
}

