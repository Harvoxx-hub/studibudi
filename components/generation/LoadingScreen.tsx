"use client";

import React from "react";
import { Loading } from "@/components/ui/Loading";
import { Card } from "@/components/ui/Card";
import {
  LightBulbIcon,
  DocumentTextIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

interface LoadingScreenProps {
  mode: "flashcards" | "quiz";
  progress: number;
  estimatedTime?: number;
  currentStep?: string;
}

export function LoadingScreen({
  mode,
  progress,
  estimatedTime,
  currentStep,
}: LoadingScreenProps) {
  const steps = [
    "Analyzing your content...",
    "Extracting key concepts...",
    mode === "flashcards"
      ? "Creating flashcards..."
      : "Generating questions...",
    "Finalizing your study materials...",
  ];

  const currentStepIndex = Math.floor((progress / 100) * steps.length);
  const displayStep = currentStep || steps[Math.min(currentStepIndex, steps.length - 1)];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center py-12">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary-black rounded-full animate-ping opacity-20" />
            <div className="relative p-6 bg-primary-black rounded-full">
              {mode === "flashcards" ? (
                <LightBulbIcon className="w-12 h-12 text-primary-white" />
              ) : (
                <DocumentTextIcon className="w-12 h-12 text-primary-white" />
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-neutral-gray900 mb-2">
          Generating {mode === "flashcards" ? "Flashcards" : "Quiz"}...
        </h2>
        <p className="text-neutral-gray600 mb-8 text-lg">
          AI is processing your content. This may take a few moments.
        </p>

        {/* Progress Card */}
        <Card className="p-6 bg-neutral-gray50 mb-6">
          {/* Progress Bar */}
          <div className="w-full bg-neutral-gray200 rounded-full h-3 mb-4">
            <div
              className="bg-primary-black h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Progress Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BoltIcon className="w-5 h-5 text-primary-black" />
              <span className="text-sm font-medium text-neutral-gray900">
                {displayStep}
              </span>
            </div>
            <span className="text-sm font-semibold text-primary-black">
              {progress}%
            </span>
          </div>

          {/* Estimated Time */}
          {estimatedTime && estimatedTime > 0 && (
            <p className="text-xs text-neutral-gray600 text-center">
              Estimated time remaining: {estimatedTime} seconds
            </p>
          )}
        </Card>

        {/* Loading Animation */}
        <div className="flex justify-center">
          <Loading />
        </div>

        {/* Tips */}
        <div className="mt-8">
          <Card className="p-4 bg-neutral-gray50">
            <p className="text-xs text-neutral-gray600 text-center">
              💡 Tip: Longer content may take more time to process
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

