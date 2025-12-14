// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  /** @deprecated Subscription system deprecated - using credits only */
  subscriptionPlan?: "free" | "premium";
  /** @deprecated Subscription system deprecated - using credits only */
  subscriptionStatus?: "active" | "canceled" | "past_due";
  credits?: number; // User's credit balance (primary monetization)
  createdAt: string;
  updatedAt?: string;
  streak: number;
  studyCountToday: number;
}

// Flashcard Types
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  isKnown: boolean;
  isBookmarked: boolean;
  lastStudied?: string;
  createdAt: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description?: string;
  userId: string;
  flashcards: Flashcard[];
  createdAt: string;
  updatedAt: string;
  subject?: string;
  flashcardCount?: number;
}

// Quiz Types
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  userId: string;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
  subject?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  answers: {
    questionId: string;
    selectedAnswer: number;
    isCorrect: boolean;
  }[];
}

// Study Session Types
export interface StudySession {
  id: string;
  userId: string;
  type: "flashcard" | "quiz";
  itemId: string;
  completedAt: string;
  duration?: number;
}

// Study Set Types
export interface Topic {
  id: string;
  title: string; // e.g., "Cell Structure", "Photosynthesis"
  studySetId: string;
  materialIds: string[]; // Which materials contributed to this topic
  content: string; // Optimized/cleaned content for this topic
  createdAt: string;
  updatedAt: string;
}

export interface StudySet {
  id: string;
  title: string; // e.g., "K101"
  description?: string;
  userId: string;
  materials: string[]; // Array of upload IDs
  topics: Topic[]; // Extracted topics
  createdAt: string;
  updatedAt: string;
  materialCount?: number;
  topicCount?: number;
}

// Upload Types
export interface Upload {
  id: string;
  userId: string;
  studySetId?: string; // NEW: Links upload to Study Set
  type: "pdf" | "text" | "image";
  fileUrl?: string;
  extractedText: string;
  topics?: string[]; // NEW: Topic IDs extracted from this material
  createdAt: string;
  status?: "processing" | "completed" | "failed";
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}


