"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/Button";
import {
  QuizPlayer,
  QuizResults,
  QuizReview,
} from "@/components/quiz";
import {
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Quiz, QuizAttempt } from "@/types";
import { quizzesApi, studySessionsApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

type ViewMode = "quiz" | "results" | "review";

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { addNotification } = useAppStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("quiz");
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      setIsLoading(true);
      try {
        const loadedQuiz = await quizzesApi.get(quizId);
        setQuiz(loadedQuiz);
      } catch (error: any) {
        console.error("Failed to load quiz:", error);
        addNotification({
          userId: "temp",
          type: "error",
          title: "Error",
          message: error?.message || "Failed to load quiz",
          read: false,
        });
        router.push("/quizzes");
      } finally {
        setIsLoading(false);
      }
    };

    loadQuiz();
  }, [quizId, router]);

  // Start study session when quiz loads
  useEffect(() => {
    const startSession = async () => {
      if (!quiz) return;

      try {
        const session = await studySessionsApi.startSession("quiz", quizId);
        setSessionId(session.id);
        setSessionStartTime(Date.now());
      } catch (error: any) {
        console.error("Failed to start session:", error);
        // Continue even if session start fails
      }
    };

    if (quiz && !sessionId) {
      startSession();
    }
  }, [quiz, quizId, sessionId]);

  const handleComplete = async (answers: Array<{
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }>) => {
    if (!quiz) return;

    try {
      // Submit answers to API
      const submittedAttempt = await quizzesApi.submitAttempt(
        quizId,
        answers.map((a) => ({
          questionId: a.questionId,
          selectedAnswer: a.selectedAnswer,
        }))
      );

      // Complete study session
      if (sessionId) {
        const duration = sessionStartTime
          ? Math.floor((Date.now() - sessionStartTime) / 1000)
          : 0;
        const correctCount = answers.filter((a) => a.isCorrect).length;
        
        try {
          await studySessionsApi.completeSession(
            sessionId,
            {
              total: answers.length,
              known: correctCount,
              unknown: answers.length - correctCount,
            },
            duration
          );
        } catch (error: any) {
          console.error("Failed to complete session:", error);
          // Continue even if session completion fails
        }
      }

      setAttempt(submittedAttempt);
      setViewMode("results");

      addNotification({
        userId: "temp",
        type: "success",
        title: "Quiz Completed",
        message: `You scored ${submittedAttempt.score}/${submittedAttempt.totalQuestions}`,
        read: false,
      });
    } catch (error: any) {
      console.error("Submit attempt error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to submit quiz attempt",
        read: false,
      });
    }
  };

  const handleTryAgain = () => {
    setViewMode("quiz");
    setAttempt(null);
  };

  const handleReview = () => {
    setViewMode("review");
  };

  const handleFinish = () => {
    router.push(`/quizzes/${quizId}`);
  };

  if (isLoading || !quiz) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              {isLoading ? "Loading quiz..." : "Quiz not found"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
            {quiz.title}
          </h1>
        </div>

        {/* Content based on view mode */}
        {viewMode === "quiz" && (
          <QuizPlayer quiz={quiz} onComplete={handleComplete} />
        )}

        {viewMode === "results" && attempt && (
          <QuizResults
            quiz={quiz}
            attempt={attempt}
            onTryAgain={handleTryAgain}
            onReview={handleReview}
            onFinish={handleFinish}
          />
        )}

        {viewMode === "review" && attempt && (
          <>
            <div className="mb-6">
              <Button variant="outline" onClick={() => setViewMode("results")}>
                Back to Results
              </Button>
            </div>
            <QuizReview quiz={quiz} attempt={attempt} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

