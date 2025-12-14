"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckCircleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { FlashcardSet, Quiz } from "@/types";

interface GenerationResultProps {
  mode: "flashcards" | "quiz";
  data: FlashcardSet | Quiz;
  onView: () => void;
  onGenerateMore: () => void;
}

export function GenerationResult({
  mode,
  data,
  onView,
  onGenerateMore,
}: GenerationResultProps) {
  const count =
    mode === "flashcards"
      ? (data as FlashcardSet).flashcards.length
      : (data as Quiz).questions.length;

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary-black dark:bg-primary-white rounded-full">
            <CheckCircleIcon className="w-12 h-12 text-primary-white dark:text-primary-black" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 text-center mb-2">
          Generation Complete! 🎉
        </h2>
        <p className="text-neutral-gray600 dark:text-neutral-gray400 text-center mb-8">
          Your {mode === "flashcards" ? "flashcards" : "quiz"} have been generated
          successfully.
        </p>

        {/* Stats */}
        <Card className="p-6 bg-neutral-gray50 dark:bg-neutral-gray800 mb-6">
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                {mode === "flashcards" ? (
                  <LightBulbIcon className="w-6 h-6 text-primary-black dark:text-primary-white" />
                ) : (
                  <DocumentTextIcon className="w-6 h-6 text-primary-black dark:text-primary-white" />
                )}
                <span className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                  {count}
                </span>
              </div>
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                {mode === "flashcards" ? "Flashcards" : "Questions"} Created
              </p>
            </div>
            <div className="w-px h-12 bg-neutral-gray300 dark:bg-neutral-gray700" />
            <div className="text-center">
              <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                {data.title}
              </p>
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Study Set</p>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onView}
            className="flex items-center justify-center gap-2"
          >
            View {mode === "flashcards" ? "Flashcards" : "Quiz"}
            <ArrowRightIcon className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onGenerateMore}
          >
            Generate More
          </Button>
        </div>

        {/* Preview */}
        <div className="mt-8 pt-6 border-t border-neutral-gray200 dark:border-neutral-gray700">
          <p className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-3">
            Preview:
          </p>
          {mode === "flashcards" ? (
            <div className="space-y-2">
              {(data as FlashcardSet).flashcards.slice(0, 3).map((card, index) => (
                <Card key={card.id} className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-primary-black dark:text-primary-white bg-neutral-gray200 dark:bg-neutral-gray700 px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-1">
                        {card.front}
                      </p>
                      <p className="text-xs text-neutral-gray600 dark:text-neutral-gray400 line-clamp-2">
                        {card.back}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
              {(data as FlashcardSet).flashcards.length > 3 && (
                <p className="text-xs text-neutral-gray500 dark:text-neutral-gray500 text-center">
                  + {(data as FlashcardSet).flashcards.length - 3} more flashcards
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {(data as Quiz).questions.slice(0, 2).map((question, index) => (
                <Card key={question.id} className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-medium text-primary-black dark:text-primary-white bg-neutral-gray200 dark:bg-neutral-gray700 px-2 py-1 rounded">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                        {question.question}
                      </p>
                      <div className="space-y-1">
                        {question.options.slice(0, 2).map((option, optIndex) => (
                          <p
                            key={optIndex}
                            className={`text-xs ${
                              optIndex === question.correctAnswer
                                ? "text-primary-black dark:text-primary-white font-medium"
                                : "text-neutral-gray600 dark:text-neutral-gray400"
                            }`}
                          >
                            {String.fromCharCode(65 + optIndex)}. {option}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              {(data as Quiz).questions.length > 2 && (
                <p className="text-xs text-neutral-gray500 dark:text-neutral-gray500 text-center">
                  + {(data as Quiz).questions.length - 2} more questions
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

