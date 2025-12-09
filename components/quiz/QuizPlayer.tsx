"use client";

import React, { useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Quiz, QuizQuestion } from "@/types";
import { MathRenderer } from "@/components/shared/MathRenderer";

interface QuizPlayerProps {
  quiz: Quiz;
  onComplete: (answers: QuizAnswer[]) => void;
}

interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
}

export function QuizPlayer({ quiz, onComplete }: QuizPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [checkedAnswer, setCheckedAnswer] = useState<boolean>(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-neutral-gray600 dark:text-neutral-gray400">
          This quiz has no questions available.
        </p>
      </Card>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const totalQuestions = quiz.questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  const handleSelectAnswer = (index: number) => {
    if (!checkedAnswer) {
      setSelectedAnswer(index);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const answer: QuizAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer,
      isCorrect,
    };

    setAnswers([...answers, answer]);
    setCheckedAnswer(true);
  };

  const handleNext = () => {
    if (isLastQuestion) {
      // Quiz complete
      onComplete(answers);
    } else {
      // Move to next question
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setCheckedAnswer(false);
    }
  };

  const getOptionClass = (index: number): string => {
    if (!checkedAnswer) {
      return selectedAnswer === index
        ? "bg-neutral-gray100 dark:bg-neutral-gray800 border-2 border-primary-black dark:border-primary-white"
        : "border border-neutral-gray200 dark:border-neutral-gray700 hover:border-neutral-gray400 dark:hover:border-neutral-gray500";
    }

    // After checking
    if (index === currentQuestion.correctAnswer) {
      return "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white";
    }
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      // Wrong answer - use red/error colors for better visibility
      return "bg-red-600 dark:bg-red-700 text-white border-2 border-red-600 dark:border-red-700";
    }
    return "border border-neutral-gray200 dark:border-neutral-gray700 bg-neutral-gray50 dark:bg-neutral-gray800";
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-neutral-gray200 dark:bg-neutral-gray700 rounded-full h-2">
          <div
            className="bg-primary-black dark:bg-primary-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8 mb-6">
        <h2 className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-6">
          <MathRenderer content={currentQuestion.question} />
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelectAnswer(index)}
              disabled={checkedAnswer}
              className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                checkedAnswer ? "cursor-default" : "cursor-pointer"
              } ${getOptionClass(index)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`font-semibold text-sm w-8 h-8 flex items-center justify-center rounded-full ${
                    checkedAnswer && index === currentQuestion.correctAnswer
                      ? "bg-white dark:bg-black text-primary-black dark:text-primary-white"
                      : checkedAnswer && index === selectedAnswer && index !== currentQuestion.correctAnswer
                      ? "bg-white dark:bg-red-800 text-red-600 dark:text-white"
                      : checkedAnswer
                      ? "bg-neutral-gray200 dark:bg-neutral-gray700 text-neutral-gray600 dark:text-neutral-gray400"
                      : "bg-neutral-gray200 dark:bg-neutral-gray700 text-neutral-gray900 dark:text-neutral-gray100"
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className={`text-base ${
                    checkedAnswer && index === currentQuestion.correctAnswer
                      ? "text-white dark:text-black"
                      : checkedAnswer && index === selectedAnswer && index !== currentQuestion.correctAnswer
                      ? "text-white dark:text-white"
                      : checkedAnswer
                      ? "text-neutral-gray600 dark:text-neutral-gray400"
                      : "text-neutral-gray900 dark:text-neutral-gray100"
                  }`}>
                    <MathRenderer content={option} />
                  </span>
                </div>
                {checkedAnswer && index === currentQuestion.correctAnswer && (
                  <CheckCircleIcon className="w-6 h-6 flex-shrink-0 text-white dark:text-black" />
                )}
                {checkedAnswer &&
                  index === selectedAnswer &&
                  index !== currentQuestion.correctAnswer && (
                    <XCircleIcon className="w-6 h-6 flex-shrink-0 text-white dark:text-white" />
                  )}
              </div>
            </button>
          ))}
        </div>

        {/* Explanation (shown after checking) */}
        {checkedAnswer && currentQuestion.explanation && (
          <div className="mt-6 p-4 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700">
            <p className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-2">
              Explanation:
            </p>
            <p className="text-sm text-neutral-gray700 dark:text-neutral-gray300">
              <MathRenderer content={currentQuestion.explanation} />
            </p>
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end">
        {!checkedAnswer ? (
          <Button
            variant="primary"
            size="lg"
            onClick={handleCheckAnswer}
            disabled={selectedAnswer === null}
            className="flex items-center gap-2"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {isLastQuestion ? "Finish Quiz" : "Next Question"}
            <ArrowRightIcon className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

