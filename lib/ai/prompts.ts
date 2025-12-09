/**
 * AI Prompt Engineering Utilities
 * Contains optimized prompts for generating flashcards and quizzes
 * 
 * Note: This module is used by generator.ts which is dynamically imported
 */

export interface GenerationRequest {
  content: string;
  mode: "flashcards" | "quiz";
  options?: {
    difficulty?: "easy" | "medium" | "hard";
    count?: number;
    subject?: string;
  };
}

/**
 * Generate prompt for flashcard creation
 */
export function generateFlashcardPrompt(
  content: string,
  options?: GenerationRequest["options"]
): string {
  const count = options?.count || 10;
  const difficulty = options?.difficulty || "medium";
  const subject = options?.subject || "general";

  return `You are an expert educational content creator. Generate ${count} high-quality flashcards from the following study material.

Subject: ${subject}
Difficulty Level: ${difficulty}

Study Material:
${content}

Instructions:
1. Create exactly ${count} flashcards
2. Each flashcard should have a clear, concise question or term on the front
3. The back should contain a comprehensive but concise answer
4. Focus on key concepts, definitions, and important facts
5. Ensure questions are appropriate for ${difficulty} difficulty level
6. Make the content engaging and memorable

Return the flashcards in JSON format:
{
  "flashcards": [
    {
      "front": "Question or term",
      "back": "Answer or definition"
    }
  ]
}`;
}

/**
 * Generate prompt for quiz creation
 */
export function generateQuizPrompt(
  content: string,
  options?: GenerationRequest["options"]
): string {
  const count = options?.count || 10;
  const difficulty = options?.difficulty || "medium";
  const subject = options?.subject || "general";

  return `You are an expert educational content creator. Generate a ${count}-question multiple choice quiz from the following study material.

Subject: ${subject}
Difficulty Level: ${difficulty}

Study Material:
${content}

Instructions:
1. Create exactly ${count} questions
2. Each question should have 4 multiple choice options (A, B, C, D)
3. Only one option should be correct
4. Include a brief explanation for the correct answer
5. Questions should test understanding, not just memorization
6. Ensure questions are appropriate for ${difficulty} difficulty level
7. Cover key concepts from the material

Return the quiz in JSON format:
{
  "questions": [
    {
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 1,
      "explanation": "Why this answer is correct"
    },
    {
      "question": "Another question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 2,
      "explanation": "Why this answer is correct"
    }
  ]
}

IMPORTANT: Vary the correctAnswer index across questions (use 0, 1, 2, or 3). Do NOT always use the same index. Distribute correct answers evenly across all four positions.`;
}

/**
 * Parse AI response for flashcards
 */
export function parseFlashcardResponse(response: string): {
  flashcards: Array<{ front: string; back: string }>;
} | null {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                     response.match(/```\s*([\s\S]*?)\s*```/) ||
                     [null, response];
    
    const jsonStr = jsonMatch[1] || response;
    const parsed = JSON.parse(jsonStr.trim());
    
    if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing flashcard response:", error);
    return null;
  }
}

/**
 * Parse AI response for quiz
 */
export function parseQuizResponse(response: string): {
  questions: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
} | null {
  try {
    // Try to extract JSON from markdown code blocks if present
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || 
                     response.match(/```\s*([\s\S]*?)\s*```/) ||
                     [null, response];
    
    const jsonStr = jsonMatch[1] || response;
    const parsed = JSON.parse(jsonStr.trim());
    
    if (parsed.questions && Array.isArray(parsed.questions)) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing quiz response:", error);
    return null;
  }
}

