"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { Quiz, QuizQuestion, QuizAttempt } from "@/types";
import { MathRenderer } from "@/components/shared/MathRenderer";

interface QuizResultsProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onTryAgain: () => void;
  onReview: () => void;
  onFinish: () => void;
}

export function QuizResults({
  quiz,
  attempt,
  onTryAgain,
  onReview,
  onFinish,
}: QuizResultsProps) {
  const getScoreColor = () => {
    if (attempt.percentage >= 80) return "text-primary-black";
    if (attempt.percentage >= 60) return "text-neutral-gray700";
    return "text-neutral-gray600";
  };

  const getScoreMessage = () => {
    if (attempt.percentage >= 90) return "Excellent! 🎉";
    if (attempt.percentage >= 80) return "Great job! 👏";
    if (attempt.percentage >= 70) return "Good work! 👍";
    if (attempt.percentage >= 60) return "Not bad! Keep practicing 💪";
    return "Keep studying! You'll get better 📚";
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Results Card */}
      <Card className="p-8 mb-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-6 bg-primary-black dark:bg-primary-white rounded-full">
            <ChartBarIcon className="w-12 h-12 text-primary-white dark:text-primary-black" />
          </div>
        </div>

        <h2 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
          Quiz Complete!
        </h2>
        <p className="text-lg text-neutral-gray600 dark:text-neutral-gray400 mb-8">
          {getScoreMessage()}
        </p>

        {/* Score Display */}
        <div className="mb-8">
          <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
            {attempt.percentage}%
          </div>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">
            {attempt.score} out of {attempt.totalQuestions} correct
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircleIcon className="w-6 h-6 text-primary-black dark:text-primary-white" />
              <span className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                {attempt.score}
              </span>
            </div>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Correct</p>
          </Card>
          <Card className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircleIcon className="w-6 h-6 text-neutral-gray600 dark:text-neutral-gray400" />
              <span className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                {attempt.totalQuestions - attempt.score}
              </span>
            </div>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Incorrect</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={onTryAgain}
            className="flex items-center justify-center gap-2"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Try Again
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onReview}
          >
            Review Answers
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={onFinish}
          >
            Finish
          </Button>
        </div>
      </Card>

      {/* Question Breakdown */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
          Question Breakdown
        </h3>
        <div className="space-y-3">
          {quiz.questions?.map((question, index) => {
            const answer = attempt.answers.find(
              (a) => a.questionId === question.id
            );
            const isCorrect = answer?.isCorrect ?? false;

            return (
              <div
                key={question.id}
                className={`p-4 rounded-lg border ${
                  isCorrect
                    ? "bg-neutral-gray50 dark:bg-neutral-gray800 border-neutral-gray200 dark:border-neutral-gray700"
                    : "bg-neutral-gray50 dark:bg-neutral-gray800 border-neutral-gray300 dark:border-neutral-gray600"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <CheckCircleIcon className="w-5 h-5 text-primary-black dark:text-primary-white flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400 flex-shrink-0" />
                    )}
                    <span className="font-medium text-neutral-gray900 dark:text-neutral-gray100">
                      Question {index + 1}
                    </span>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      isCorrect ? "text-primary-black dark:text-primary-white" : "text-neutral-gray600 dark:text-neutral-gray400"
                    }`}
                  >
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <p className="text-sm text-neutral-gray700 dark:text-neutral-gray300 mb-1">
                  <MathRenderer content={question.question} />
                </p>
                {answer && (
                  <p className="text-xs text-neutral-gray600 dark:text-neutral-gray400">
                    Your answer: {String.fromCharCode(65 + answer.selectedAnswer)}.{" "}
                    <MathRenderer content={question.options[answer.selectedAnswer]} />
                    {!isCorrect && (
                      <>
                        {" "}
                        • Correct: {String.fromCharCode(65 + question.correctAnswer)}.{" "}
                        <MathRenderer content={question.options[question.correctAnswer]} />
                      </>
                    )}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

