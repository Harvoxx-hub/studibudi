"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/dashboard";
import { QuizCard } from "@/components/quiz";
import { Modal } from "@/components/ui/Modal";
import {
  PlusIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { Quiz } from "@/types";
import { quizzesApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function QuizzesPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadQuizzes = async () => {
      setIsLoading(true);
      try {
        const response = await quizzesApi.list({ limit: 50 });
        setQuizzes(response.quizzes);
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
        setIsLoading(false);
      }
    };

    loadQuizzes();
  }, []);

  const handleDelete = (quizId: string) => {
    setQuizToDelete(quizId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!quizToDelete) return;

    try {
      await quizzesApi.delete(quizToDelete);
      setQuizzes(quizzes.filter((q) => q.id !== quizToDelete));
      setDeleteModalOpen(false);
      setQuizToDelete(null);
      addNotification({
        userId: "temp",
        type: "success",
        title: "Deleted",
        message: "Quiz deleted successfully",
        read: false,
      });
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
              My Quizzes
            </h1>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Take quizzes to test your knowledge
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/upload?mode=quiz")}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Quiz
          </Button>
        </div>

        {/* Quizzes List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Loading quizzes...
            </p>
          </div>
        ) : quizzes.length > 0 ? (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onAttempt={() => router.push(`/quizzes/${quiz.id}/take`)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<DocumentTextIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />}
            title="No Quizzes Yet"
            description="Create your first quiz by uploading content or generating one with AI."
            actionLabel="Create Quiz"
            onAction={() => router.push("/upload?mode=quiz")}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setQuizToDelete(null);
          }}
          title="Delete Quiz"
        >
          <div className="space-y-4">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Are you sure you want to delete this quiz? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setQuizToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                className="bg-neutral-gray900 hover:bg-neutral-gray800"
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

