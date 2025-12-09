import { User } from "@/types";

/**
 * Credit cost per generation
 */
export const CREDIT_COSTS = {
  flashcard: 1, // 1 credit per flashcard
  quiz: 1, // 1 credit per question
} as const;

/**
 * File upload limits (same for all users)
 */
export const FILE_LIMITS = {
  maxFileSizeMB: 10, // 10MB limit for all users
} as const;

/**
 * Check if user has enough credits for flashcard generation
 */
export function canCreateFlashcards(user: User | null, count: number = 1): {
  allowed: boolean;
  reason?: string;
  credits?: number;
  required?: number;
} {
  if (!user) {
    return { allowed: false, reason: "Please log in to create flashcards" };
  }

  const credits = user.credits || 0;
  const required = count * CREDIT_COSTS.flashcard;

  if (credits < required) {
    return {
      allowed: false,
      reason: `Insufficient credits. You need ${required} credits but only have ${credits}. Purchase more credits to continue.`,
      credits,
      required,
    };
  }

  return { allowed: true, credits, required };
}

/**
 * Check if user has enough credits for quiz generation
 */
export function canCreateQuizzes(user: User | null, questionCount: number = 1): {
  allowed: boolean;
  reason?: string;
  credits?: number;
  required?: number;
} {
  if (!user) {
    return { allowed: false, reason: "Please log in to create quizzes" };
  }

  const credits = user.credits || 0;
  const required = questionCount * CREDIT_COSTS.quiz;

  if (credits < required) {
    return {
      allowed: false,
      reason: `Insufficient credits. You need ${required} credits but only have ${credits}. Purchase more credits to continue.`,
      credits,
      required,
    };
  }

  return { allowed: true, credits, required };
}

/**
 * Get max file size for user (same for all users)
 */
export function getMaxFileSize(user: User | null): number {
  return FILE_LIMITS.maxFileSizeMB;
}

