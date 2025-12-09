"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import {
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Quiz, QuizAttempt } from "@/types";
import { MathRenderer } from "@/components/shared/MathRenderer";

interface QuizReviewProps {
  quiz: Quiz;
  attempt: QuizAttempt;
}

export function QuizReview({ quiz, attempt }: QuizReviewProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="p-6 mb-6">
        <h2 className="text-2xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-6">
          Review Answers
        </h2>
        <div className="space-y-6">
          {quiz.questions?.map((question, index) => {
            const answer = attempt.answers.find(
              (a) => a.questionId === question.id
            );
            const isCorrect = answer?.isCorrect ?? false;

            return (
              <div
                key={question.id}
                className="pb-6 border-b border-neutral-gray200 dark:border-neutral-gray700 last:border-0"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircleIcon className="w-6 h-6 text-primary-black dark:text-primary-white flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-neutral-gray600 dark:text-neutral-gray400 flex-shrink-0" />
                    )}
                    <h3 className="text-lg font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                      Question {index + 1}
                    </h3>
                  </div>
                  <span
                    className={`text-sm font-semibold px-3 py-1 rounded ${
                      isCorrect
                        ? "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black"
                        : "bg-neutral-gray900 dark:bg-neutral-gray700 text-primary-white dark:text-primary-white"
                    }`}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <p className="text-base text-neutral-gray900 dark:text-neutral-gray100 mb-4">
                  <MathRenderer content={question.question} />
                </p>

                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIndex) => {
                    const isSelected = answer?.selectedAnswer === optIndex;
                    const isCorrectOption = optIndex === question.correctAnswer;

                    let optionClass = "p-3 rounded-lg border text-sm";
                    if (isCorrectOption) {
                      optionClass += " bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-primary-black dark:border-primary-white";
                    } else if (isSelected && !isCorrectOption) {
                      optionClass += " bg-neutral-gray900 dark:bg-neutral-gray700 text-primary-white dark:text-primary-white border-neutral-gray900 dark:border-neutral-gray700";
                    } else {
                      optionClass += " bg-neutral-gray50 dark:bg-neutral-gray800 border-neutral-gray200 dark:border-neutral-gray700 text-neutral-gray700 dark:text-neutral-gray300";
                    }

                    return (
                      <div key={optIndex} className={optionClass}>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span><MathRenderer content={option} /></span>
                          {isCorrectOption && (
                            <CheckCircleIcon className="w-5 h-5 ml-auto" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <div className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700">
                    <p className="text-xs font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-1">
                      Explanation:
                    </p>
                    <p className="text-sm text-neutral-gray700 dark:text-neutral-gray300">
                      <MathRenderer content={question.explanation} />
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

