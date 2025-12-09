"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  PencilIcon,
  TrashIcon,
  PlayIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import { FlashcardSet } from "@/types";

interface FlashcardSetCardProps {
  set: FlashcardSet;
  viewMode?: "grid" | "list";
  onView?: () => void;
  onStudy?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export function FlashcardSetCard({
  set,
  viewMode = "grid",
  onView,
  onStudy,
  onRename,
  onDelete,
}: FlashcardSetCardProps) {
  const flashcardCount = set.flashcardCount ?? set.flashcards?.length ?? 0;
  // Filter out null placeholders (from list view) and only count actual flashcard objects
  const actualFlashcards = set.flashcards?.filter((c) => c !== null && c !== undefined) ?? [];
  const knownCount = actualFlashcards.filter((c) => c.isKnown).length;
  const bookmarkedCount = actualFlashcards.filter((c) => c.isBookmarked).length;

  if (viewMode === "list") {
    return (
      <Card hover className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-1">
              {set.title}
            </h3>
            {set.description && (
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-2 line-clamp-1">
                {set.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-neutral-gray600 dark:text-neutral-gray400">
              <span>{flashcardCount} cards</span>
              {set.subject && (
                <span className="px-2 py-1 bg-neutral-gray100 dark:bg-neutral-gray800 rounded text-xs">
                  {set.subject}
                </span>
              )}
              {knownCount > 0 && (
                <span className="text-xs">✓ {knownCount} known</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                View
              </Button>
            )}
            {onStudy && (
              <Button
                variant="primary"
                size="sm"
                onClick={onStudy}
                className="flex items-center gap-1"
              >
                <PlayIcon className="w-4 h-4" />
                Study
              </Button>
            )}
            {onRename && (
              <button
                onClick={onRename}
                className="p-2 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <BookOpenIcon className="w-5 h-5 text-primary-black dark:text-primary-white flex-shrink-0" />
            <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 line-clamp-1">
              {set.title}
            </h3>
          </div>
          {set.description && (
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-3 line-clamp-2">
              {set.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onRename && (
            <button
              onClick={onRename}
              className="p-1.5 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-neutral-gray600 dark:text-neutral-gray400">
            {flashcardCount} cards
          </span>
          {set.subject && (
            <span className="px-2 py-1 bg-neutral-gray100 dark:bg-neutral-gray800 rounded text-xs text-neutral-gray700 dark:text-neutral-gray300">
              {set.subject}
            </span>
          )}
        </div>

        {knownCount > 0 && (
          <div className="text-xs text-neutral-gray600 dark:text-neutral-gray400">
            ✓ {knownCount} marked as known
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              onClick={onView}
              className="flex-1"
            >
              View
            </Button>
          )}
          {onStudy && (
            <Button
              variant="primary"
              size="sm"
              onClick={onStudy}
              className="flex-1 flex items-center justify-center gap-1"
            >
              <PlayIcon className="w-4 h-4" />
              Study
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

