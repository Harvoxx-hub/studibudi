"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/dashboard";
import { FlashcardCard } from "@/components/flashcards";
import {
  PlusIcon,
  PlayIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { FlashcardSet } from "@/types";
import { flashcardsApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function FlashcardsPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFlashcards = async () => {
      setIsLoading(true);
      try {
        const response = await flashcardsApi.listSets({ limit: 50 });
        setFlashcardSets(response.sets);
      } catch (error: any) {
        console.error("Failed to load flashcards:", error);
        addNotification({
          userId: "temp",
          type: "error",
          title: "Error",
          message: error?.message || "Failed to load flashcard sets",
          read: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcards();
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
              My Flashcards
            </h1>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Manage and study your flashcard sets
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/upload?mode=flashcards")}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create New Set
          </Button>
        </div>

        {/* Flashcard Sets */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Loading flashcard sets...
            </p>
          </div>
        ) : flashcardSets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcardSets.map((set) => (
              <Card
                key={set.id}
                hover
                onClick={() => router.push(`/flashcards/${set.id}`)}
                className="p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-1">
                      {set.title}
                    </h3>
                    {set.description && (
                      <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 line-clamp-2">
                        {set.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-neutral-gray200 dark:border-neutral-gray700">
                  <div className="flex items-center gap-4 text-sm text-neutral-gray600 dark:text-neutral-gray400">
                    <span>{set.flashcardCount ?? set.flashcards?.length ?? 0} cards</span>
                    {set.subject && (
                      <span className="px-2 py-1 bg-neutral-gray100 dark:bg-neutral-gray800 rounded text-xs">
                        {set.subject}
                      </span>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/flashcards/${set.id}/study`);
                    }}
                    className="flex items-center gap-1"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Study
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<AcademicCapIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />}
            title="No Flashcard Sets Yet"
            description="Create your first flashcard set by uploading content or generating flashcards with AI."
            actionLabel="Create Flashcard Set"
            onAction={() => router.push("/upload?mode=flashcards")}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

