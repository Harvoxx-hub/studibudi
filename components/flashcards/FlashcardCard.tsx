"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  PencilIcon,
  TrashIcon,
  BookmarkIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkIconSolid,
} from "@heroicons/react/24/solid";
import { Flashcard } from "@/types";
import { MathRenderer } from "@/components/shared/MathRenderer";

interface FlashcardCardProps {
  card: Flashcard;
  index: number;
  onEdit?: (card: Flashcard) => void;
  onDelete?: (cardId: string) => void;
  onBookmark?: (cardId: string, bookmarked: boolean) => void;
}

export function FlashcardCard({
  card,
  index,
  onEdit,
  onDelete,
  onBookmark,
}: FlashcardCardProps) {
  return (
    <Card className="p-4 hover:border-primary-black transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium text-neutral-gray500 bg-neutral-gray100 px-2 py-1 rounded">
              #{index + 1}
            </span>
            {card.isBookmarked && (
              <BookmarkIconSolid className="w-4 h-4 text-primary-black" />
            )}
            {card.isKnown && (
              <span className="text-xs text-neutral-gray600 bg-neutral-gray100 px-2 py-1 rounded">
                Known
              </span>
            )}
          </div>
          <h3 className="font-semibold text-neutral-gray900 mb-1 line-clamp-2">
            <MathRenderer content={card.front} />
          </h3>
          <p className="text-sm text-neutral-gray600 line-clamp-2">
            <MathRenderer content={card.back} />
          </p>
        </div>
        <div className="flex items-center gap-1">
          {onBookmark && (
            <button
              onClick={() => onBookmark(card.id, !card.isBookmarked)}
              className="p-2 hover:bg-neutral-gray100 rounded-lg transition-colors"
            >
              {card.isBookmarked ? (
                <BookmarkIconSolid className="w-5 h-5 text-primary-black" />
              ) : (
                <BookmarkIcon className="w-5 h-5 text-neutral-gray600" />
              )}
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(card)}
              className="p-2 hover:bg-neutral-gray100 rounded-lg transition-colors"
            >
              <PencilIcon className="w-5 h-5 text-neutral-gray600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(card.id)}
              className="p-2 hover:bg-neutral-gray100 rounded-lg transition-colors text-status-error"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
}

