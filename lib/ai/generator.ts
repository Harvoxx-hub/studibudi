/**
 * AI Generation Service
 * Handles communication with AI services (OpenAI, Anthropic, etc.)
 * Currently uses mock data, but structured for easy integration
 * 
 * Note: This module is dynamically imported in client components
 */

import {
  generateFlashcardPrompt,
  generateQuizPrompt,
  parseFlashcardResponse,
  parseQuizResponse,
  GenerationRequest,
} from "./prompts";
import { FlashcardSet, Quiz } from "@/types";

// Mock AI service - replace with actual API calls
async function callAIService(prompt: string): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock response - in production, this would be an actual API call
  // Example: OpenAI, Anthropic, etc.
  return JSON.stringify({
    flashcards: [
      {
        front: "What is the capital of France?",
        back: "Paris is the capital and largest city of France.",
      },
      {
        front: "What is photosynthesis?",
        back: "Photosynthesis is the process by which plants convert light energy into chemical energy.",
      },
    ],
  });
}

/**
 * Generate flashcards from content
 */
export async function generateFlashcards(
  content: string,
  options?: GenerationRequest["options"]
): Promise<FlashcardSet> {
  const prompt = generateFlashcardPrompt(content, options);
  
  try {
    // In production: const response = await callOpenAI(prompt);
    // For now, use mock data
    const mockResponse = generateMockFlashcards(content, options);
    const parsed = parseFlashcardResponse(mockResponse);

    if (!parsed || !parsed.flashcards.length) {
      throw new Error("Failed to generate flashcards from AI response");
    }

    return {
      id: `flashcard-${Date.now()}`,
      title: `Generated Flashcards - ${new Date().toLocaleDateString()}`,
      description: `AI-generated flashcards from your study material`,
      userId: "current-user", // Will be replaced with actual user ID
      subject: options?.subject || "General",
      flashcards: parsed.flashcards.map((fc, index) => ({
        id: `card-${index}`,
        front: fc.front,
        back: fc.back,
        isKnown: false,
        isBookmarked: false,
        lastStudied: undefined,
        createdAt: new Date().toISOString(),
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards. Please try again.");
  }
}

/**
 * Generate quiz from content
 */
export async function generateQuiz(
  content: string,
  options?: GenerationRequest["options"]
): Promise<Quiz> {
  const prompt = generateQuizPrompt(content, options);
  
  try {
    // In production: const response = await callOpenAI(prompt);
    // For now, use mock data
    const mockResponse = generateMockQuiz(content, options);
    const parsed = parseQuizResponse(mockResponse);

    if (!parsed || !parsed.questions.length) {
      throw new Error("Failed to generate quiz from AI response");
    }

    return {
      id: `quiz-${Date.now()}`,
      title: `Generated Quiz - ${new Date().toLocaleDateString()}`,
      description: `AI-generated quiz from your study material`,
      userId: "current-user", // Will be replaced with actual user ID
      subject: options?.subject || "General",
      questions: parsed.questions.map((q, index) => ({
        id: `q-${index}`,
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz. Please try again.");
  }
}

/**
 * Mock flashcard generation (for development)
 */
function generateMockFlashcards(
  content: string,
  options?: GenerationRequest["options"]
): string {
  const count = options?.count || 10;
  const flashcards = [];

  // Extract key phrases from content
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const selectedSentences = sentences.slice(0, Math.min(count, sentences.length));

  for (let i = 0; i < count; i++) {
    const sentence = selectedSentences[i] || `Key concept ${i + 1} from your study material`;
    const words = sentence.trim().split(/\s+/);
    const midPoint = Math.floor(words.length / 2);

    flashcards.push({
      front: words.slice(0, midPoint).join(" ") + "?",
      back: sentence.trim(),
    });
  }

  return JSON.stringify({ flashcards });
}

/**
 * Mock quiz generation (for development)
 */
function generateMockQuiz(
  content: string,
  options?: GenerationRequest["options"]
): string {
  const count = options?.count || 10;
  const questions = [];

  // Extract key phrases from content
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const selectedSentences = sentences.slice(0, Math.min(count, sentences.length));

  for (let i = 0; i < count; i++) {
    const sentence = selectedSentences[i] || `Key concept ${i + 1} from your study material`;
    const words = sentence.trim().split(/\s+/);
    const keyWord = words[0] || "concept";

    // Vary the correct answer position (0, 1, 2, or 3)
    const correctAnswerIndex = i % 4;

    questions.push({
      question: `What is the main idea related to "${keyWord}"?`,
      options: [
        sentence.substring(0, 50) + "...",
        `Alternative explanation ${i + 1}`,
        `Different perspective ${i + 1}`,
        `Incorrect option ${i + 1}`,
      ],
      correctAnswer: correctAnswerIndex,
      explanation: `The correct answer is based on: ${sentence.substring(0, 100)}`,
    });
  }

  return JSON.stringify({ questions });
}

