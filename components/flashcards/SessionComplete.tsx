"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckCircleIcon,
  XCircleIcon,
  BookmarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface SessionStats {
  total: number;
  known: number;
  unknown: number;
  bookmarked: number;
}

interface SessionCompleteProps {
  stats: SessionStats;
  onRestart?: () => void;
  onReview?: () => void;
  onFinish?: () => void;
}

export function SessionComplete({
  stats,
  onRestart,
  onReview,
  onFinish,
}: SessionCompleteProps) {
  const percentage = stats.total > 0
    ? Math.round((stats.known / stats.total) * 100)
    : 0;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-black rounded-full">
            <CheckCircleIcon className="w-12 h-12 text-primary-white" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-neutral-gray900 mb-2">
          Session Complete! 🎉
        </h2>
        <p className="text-neutral-gray600 mb-8">
          Great job studying your flashcards!
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-neutral-gray50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircleIcon className="w-6 h-6 text-primary-black" />
              <span className="text-2xl font-bold text-neutral-gray900">
                {stats.known}
              </span>
            </div>
            <p className="text-sm text-neutral-gray600">Known</p>
          </div>
          <div className="p-4 bg-neutral-gray50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircleIcon className="w-6 h-6 text-neutral-gray600" />
              <span className="text-2xl font-bold text-neutral-gray900">
                {stats.unknown}
              </span>
            </div>
            <p className="text-sm text-neutral-gray600">Unknown</p>
          </div>
          <div className="p-4 bg-neutral-gray50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookmarkIcon className="w-6 h-6 text-primary-black" />
              <span className="text-2xl font-bold text-neutral-gray900">
                {stats.bookmarked}
              </span>
            </div>
            <p className="text-sm text-neutral-gray600">Bookmarked</p>
          </div>
          <div className="p-4 bg-neutral-gray50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-2xl font-bold text-primary-black">
                {percentage}%
              </span>
            </div>
            <p className="text-sm text-neutral-gray600">Score</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {onRestart && (
            <Button
              variant="primary"
              size="lg"
              onClick={onRestart}
              className="flex items-center justify-center gap-2"
            >
              <ArrowPathIcon className="w-5 h-5" />
              Study Again
            </Button>
          )}
          {onReview && stats.unknown > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={onReview}
            >
              Review Unknown
            </Button>
          )}
          {onFinish && (
            <Button
              variant="ghost"
              size="lg"
              onClick={onFinish}
            >
              Finish
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

