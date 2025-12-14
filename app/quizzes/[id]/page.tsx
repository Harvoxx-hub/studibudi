"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  PlayIcon,
  ArrowLeftIcon,
  TrashIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Quiz } from "@/types";
import { quizzesApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function QuizDetailPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id as string;
  const { addNotification } = useAppStore();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

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

  const handleDelete = async () => {
    try {
      await quizzesApi.delete(quizId);
      addNotification({
        userId: "temp",
        type: "success",
        title: "Deleted",
        message: "Quiz deleted successfully",
        read: false,
      });
      router.push("/quizzes");
    } catch (error: any) {
      console.error("Delete error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to delete quiz",
        read: false,
      });
    }
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
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-neutral-gray600 dark:text-neutral-gray400">{quiz.description}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push(`/quizzes/${quizId}/take`)}
                className="flex items-center gap-2"
              >
                <PlayIcon className="w-5 h-5" />
                Start Quiz
              </Button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="p-2 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
              {quiz.questions?.length ?? 0}
            </p>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Questions</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <ChartBarIcon className="w-5 h-5 text-primary-black dark:text-primary-white" />
              <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">-</p>
            </div>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Best Score</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">-</p>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Attempts</p>
          </Card>
        </div>

        {/* Questions Preview */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            Questions ({quiz.questions?.length ?? 0})
          </h2>
          <div className="space-y-4">
            {quiz.questions?.map((question, index) => (
              <div
                key={question.id}
                className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-sm font-medium text-primary-black dark:text-primary-white bg-neutral-gray200 dark:bg-neutral-gray700 px-2 py-1 rounded">
                    {index + 1}
                  </span>
                  <p className="text-base font-medium text-neutral-gray900 dark:text-neutral-gray100 flex-1">
                    {question.question}
                  </p>
                </div>
                <div className="ml-11 space-y-1">
                  {question.options.map((option, optIndex) => (
                    <p
                      key={optIndex}
                      className={`text-sm ${
                        optIndex === question.correctAnswer
                          ? "text-primary-black dark:text-primary-white font-medium"
                          : "text-neutral-gray600 dark:text-neutral-gray400"
                      }`}
                    >
                      {String.fromCharCode(65 + optIndex)}. {option}
                      {optIndex === question.correctAnswer && " ✓"}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          title="Delete Quiz"
        >
          <div className="space-y-4">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

