"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  FlashcardViewer,
  SessionComplete,
} from "@/components/flashcards";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeftIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { FlashcardSet, Flashcard } from "@/types";
import { flashcardsApi, studySessionsApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

type FilterMode = "all" | "unknown";

export default function StudyPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.id as string;
  const { addNotification } = useAppStore();

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    known: 0,
    unknown: 0,
    bookmarked: 0,
  });

  useEffect(() => {
    const loadFlashcardSet = async () => {
      setIsLoading(true);
      try {
        const set = await flashcardsApi.getSet(setId);
        setFlashcardSet(set);
      } catch (error: any) {
        console.error("Failed to load flashcard set:", error);
        addNotification({
          userId: "temp",
          type: "error",
          title: "Error",
          message: error?.message || "Failed to load flashcard set",
          read: false,
        });
        router.push("/flashcards");
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcardSet();
  }, [setId, router]);

  // Start study session when component mounts
  useEffect(() => {
    const startSession = async () => {
      if (!flashcardSet) return;

      try {
        const session = await studySessionsApi.startSession(
          "flashcard",
          setId,
          filterMode
        );
        setSessionId(session.id);
        setSessionStartTime(Date.now());
      } catch (error: any) {
        console.error("Failed to start session:", error);
        // Continue even if session start fails
      }
    };

    if (flashcardSet && !sessionId) {
      startSession();
    }
  }, [flashcardSet, setId, filterMode, sessionId]);

  const handleCardUpdate = async (cardId: string, updates: Partial<Flashcard>) => {
    if (!flashcardSet) return;

    try {
      const updated = await flashcardsApi.updateCard(setId, cardId, {
        isKnown: updates.isKnown,
        isBookmarked: updates.isBookmarked,
        lastStudied: updates.lastStudied || new Date().toISOString(),
      });

      setFlashcardSet({
        ...flashcardSet,
        flashcards: flashcardSet.flashcards.map((card) =>
          card.id === cardId ? updated : card
        ),
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Update card error:", error);
      // Silently fail for study session updates
    }
  };

  const handleSessionComplete = async (stats: typeof sessionStats) => {
    if (!flashcardSet || !flashcardSet.id) {
      console.error("Cannot complete session: flashcard set not loaded");
      setSessionStats(stats);
      setSessionComplete(true);
      return;
    }

    try {
      // Calculate duration
      const duration = sessionStartTime
        ? Math.floor((Date.now() - sessionStartTime) / 1000)
        : 0;

      // Complete study session
      if (sessionId) {
        try {
          await studySessionsApi.completeSession(sessionId, stats, duration);
        } catch (error: any) {
          console.error("Failed to complete session:", error);
          // Continue even if session completion fails
        }
      }

      // Bulk update all cards that were studied
      // Only update cards that have actual changes (isKnown or isBookmarked set)
      const updates = (flashcardSet.flashcards || [])
        .filter((card) => {
          // Only include cards that have isKnown or isBookmarked explicitly set
          // (not undefined/null)
          return (
            (card.isKnown !== undefined && card.isKnown !== null) ||
            (card.isBookmarked !== undefined && card.isBookmarked !== null)
          );
        })
        .map((card) => ({
          cardId: card.id,
          ...(card.isKnown !== undefined && card.isKnown !== null && { isKnown: card.isKnown }),
          ...(card.isBookmarked !== undefined && card.isBookmarked !== null && { isBookmarked: card.isBookmarked }),
          lastStudied: new Date().toISOString(),
        }));

      if (updates.length > 0) {
        try {
          await flashcardsApi.bulkUpdateCards(flashcardSet.id, updates);
        } catch (updateError: any) {
          console.error("Failed to bulk update flashcards:", updateError);
          // Log more details for debugging
          if (updateError.message?.includes("not found")) {
            console.error("Flashcard set ID:", flashcardSet.id, "Updates count:", updates.length);
          }
          // Don't throw - allow session to complete even if update fails
          // The error is already logged and user can retry if needed
        }
      }

      setSessionStats(stats);
      setSessionComplete(true);
    } catch (error: any) {
      console.error("Session complete error:", error);
      // Still show completion even if update fails
      setSessionStats(stats);
      setSessionComplete(true);
    }
  };

  const handleRestart = () => {
    setSessionComplete(false);
    setSessionId(null);
    setSessionStartTime(null);
    setSessionStats({
      total: 0,
      known: 0,
      unknown: 0,
      bookmarked: 0,
    });
  };

  const handleReviewUnknown = () => {
    setFilterMode("unknown");
    setSessionComplete(false);
    setSessionId(null);
    setSessionStartTime(null);
    setSessionStats({
      total: 0,
      known: 0,
      unknown: 0,
      bookmarked: 0,
    });
  };

  if (isLoading || !flashcardSet) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              {isLoading ? "Loading..." : "Flashcard set not found"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (sessionComplete) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push(`/flashcards/${setId}`)}
            className="flex items-center gap-2 text-neutral-gray600 hover:text-primary-black mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Set</span>
          </button>
          <SessionComplete
            stats={sessionStats}
            onRestart={handleRestart}
            onReview={handleReviewUnknown}
            onFinish={() => router.push(`/flashcards/${setId}`)}
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push(`/flashcards/${setId}`)}
            className="flex items-center gap-2 text-neutral-gray600 hover:text-primary-black transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant={filterMode === "all" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterMode("all")}
            >
              All Cards
            </Button>
            <Button
              variant={filterMode === "unknown" ? "primary" : "outline"}
              size="sm"
              onClick={() => setFilterMode("unknown")}
              className="flex items-center gap-1"
            >
              <FunnelIcon className="w-4 h-4" />
              Unknown Only
            </Button>
          </div>
        </div>

        {/* Flashcard Viewer */}
        <FlashcardViewer
          flashcards={flashcardSet.flashcards}
          onCardUpdate={handleCardUpdate}
          onSessionComplete={handleSessionComplete}
          filterMode={filterMode}
        />
      </div>
    </DashboardLayout>
  );
}

