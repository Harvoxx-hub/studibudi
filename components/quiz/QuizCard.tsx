"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  PlayIcon,
  TrashIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Quiz } from "@/types";

interface QuizCardProps {
  quiz: Quiz;
  onAttempt?: () => void;
  onDelete?: (quizId: string) => void;
  pastScores?: number[];
}

export function QuizCard({
  quiz,
  onAttempt,
  onDelete,
  pastScores = [],
}: QuizCardProps) {
  const averageScore =
    pastScores.length > 0
      ? Math.round(
          pastScores.reduce((sum, score) => sum + score, 0) / pastScores.length
        )
      : null;

  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-1">
            {quiz.title}
          </h3>
          {quiz.description && (
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-3 line-clamp-2">
              {quiz.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-neutral-gray600 dark:text-neutral-gray400">
            <span>
              {quiz.questions?.length ?? 0} question{quiz.questions?.length !== 1 ? 's' : ''}
            </span>
            {quiz.subject && (
              <span className="px-2 py-1 bg-neutral-gray100 dark:bg-neutral-gray800 rounded text-xs">
                {quiz.subject}
              </span>
            )}
            {averageScore !== null && (
              <div className="flex items-center gap-1">
                <ChartBarIcon className="w-4 h-4" />
                <span>Avg: {averageScore}%</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onAttempt && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAttempt}
              className="flex items-center gap-1"
            >
              <PlayIcon className="w-4 h-4" />
              Attempt
            </Button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(quiz.id)}
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

