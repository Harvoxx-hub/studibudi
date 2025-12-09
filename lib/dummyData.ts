import { User, FlashcardSet, Quiz, QuizAttempt, StudySession, Notification } from "@/types";

// Dummy User Data
export const dummyUser: User = {
  id: "user-1",
  name: "Sarah",
  email: "sarah@example.com",
  subscriptionPlan: "free",
  createdAt: "2024-01-15T10:00:00Z",
  streak: 3,
  studyCountToday: 12,
};

// Dummy Flashcard Sets
export const dummyFlashcardSets: FlashcardSet[] = [
  {
    id: "set-1",
    title: "Biology – Cell Structure",
    description: "Key concepts about cell organelles and their functions",
    userId: "user-1",
    subject: "Biology",
    createdAt: "2024-11-25T10:00:00Z",
    updatedAt: "2024-11-25T10:00:00Z",
    flashcards: [
      {
        id: "card-1",
        front: "What is the function of the mitochondria?",
        back: "The mitochondria is the powerhouse of the cell, responsible for producing ATP (adenosine triphosphate) through cellular respiration.",
        isKnown: false,
        isBookmarked: false,
        createdAt: "2024-11-25T10:00:00Z",
      },
      {
        id: "card-2",
        front: "What is the main function of the nucleus?",
        back: "The nucleus contains the cell's genetic material (DNA) and controls cell growth, metabolism, and reproduction.",
        isKnown: true,
        isBookmarked: false,
        createdAt: "2024-11-25T10:00:00Z",
      },
      {
        id: "card-3",
        front: "What is the difference between rough and smooth ER?",
        back: "Rough ER has ribosomes attached to its surface and is involved in protein synthesis. Smooth ER lacks ribosomes and is involved in lipid synthesis and detoxification.",
        isKnown: false,
        isBookmarked: true,
        createdAt: "2024-11-25T10:00:00Z",
      },
      {
        id: "card-4",
        front: "What is the function of chloroplasts?",
        back: "Chloroplasts are organelles found in plant cells that conduct photosynthesis, converting light energy into chemical energy stored in glucose.",
        isKnown: false,
        isBookmarked: false,
        createdAt: "2024-11-25T10:00:00Z",
      },
      {
        id: "card-5",
        front: "What is the cell membrane made of?",
        back: "The cell membrane is made of a phospholipid bilayer with embedded proteins, cholesterol, and carbohydrates. It acts as a selective barrier.",
        isKnown: true,
        isBookmarked: false,
        createdAt: "2024-11-25T10:00:00Z",
      },
    ],
  },
  {
    id: "set-2",
    title: "World History – Ancient Civilizations",
    description: "Important facts about ancient Egypt, Greece, and Rome",
    userId: "user-1",
    subject: "History",
    createdAt: "2024-11-24T14:30:00Z",
    updatedAt: "2024-11-24T14:30:00Z",
    flashcards: [
      {
        id: "card-6",
        front: "When did the Roman Empire fall?",
        back: "The Western Roman Empire fell in 476 CE when the last Roman emperor, Romulus Augustulus, was deposed by the Germanic chieftain Odoacer.",
        isKnown: false,
        isBookmarked: false,
        createdAt: "2024-11-24T14:30:00Z",
      },
      {
        id: "card-7",
        front: "Who built the Great Pyramid of Giza?",
        back: "The Great Pyramid of Giza was built during the reign of Pharaoh Khufu (Cheops) around 2580-2560 BCE. It is one of the Seven Wonders of the Ancient World.",
        isKnown: true,
        isBookmarked: false,
        createdAt: "2024-11-24T14:30:00Z",
      },
    ],
  },
  {
    id: "set-3",
    title: "Chemistry – Periodic Table Basics",
    description: "Fundamental concepts about elements and the periodic table",
    userId: "user-1",
    subject: "Chemistry",
    createdAt: "2024-11-23T09:15:00Z",
    updatedAt: "2024-11-23T09:15:00Z",
    flashcards: [
      {
        id: "card-8",
        front: "What is the atomic number?",
        back: "The atomic number is the number of protons in the nucleus of an atom. It determines the element's identity and its position in the periodic table.",
        isKnown: true,
        isBookmarked: false,
        createdAt: "2024-11-23T09:15:00Z",
      },
      {
        id: "card-9",
        front: "What are the noble gases?",
        back: "Noble gases are elements in Group 18 of the periodic table (He, Ne, Ar, Kr, Xe, Rn). They have full valence electron shells and are very stable and unreactive.",
        isKnown: false,
        isBookmarked: true,
        createdAt: "2024-11-23T09:15:00Z",
      },
    ],
  },
];

// Dummy Quizzes
export const dummyQuizzes: Quiz[] = [
  {
    id: "quiz-1",
    title: "Biology Quiz – Cell Biology",
    userId: "user-1",
    subject: "Biology",
    createdAt: "2024-11-26T11:00:00Z",
    updatedAt: "2024-11-26T11:00:00Z",
    questions: [
      {
        id: "q1",
        question: "Which organelle is known as the powerhouse of the cell?",
        options: [
          "Nucleus",
          "Mitochondria",
          "Ribosome",
          "Golgi Apparatus",
        ],
        correctAnswer: 1,
        explanation: "Mitochondria produce ATP through cellular respiration, making them the cell's powerhouse.",
      },
      {
        id: "q2",
        question: "What is the function of the ribosome?",
        options: [
          "DNA replication",
          "Protein synthesis",
          "Lipid production",
          "Waste removal",
        ],
        correctAnswer: 1,
        explanation: "Ribosomes are responsible for protein synthesis by translating mRNA into proteins.",
      },
      {
        id: "q3",
        question: "Which structure is found only in plant cells?",
        options: [
          "Mitochondria",
          "Chloroplast",
          "Endoplasmic Reticulum",
          "Nucleus",
        ],
        correctAnswer: 1,
        explanation: "Chloroplasts are unique to plant cells and are responsible for photosynthesis.",
      },
      {
        id: "q4",
        question: "What is the main component of the cell membrane?",
        options: [
          "Proteins only",
          "Phospholipid bilayer",
          "Carbohydrates only",
          "DNA",
        ],
        correctAnswer: 1,
        explanation: "The cell membrane is primarily composed of a phospholipid bilayer with embedded proteins.",
      },
    ],
  },
  {
    id: "quiz-2",
    title: "History Quiz – Ancient Rome",
    userId: "user-1",
    subject: "History",
    createdAt: "2024-11-25T15:00:00Z",
    updatedAt: "2024-11-25T15:00:00Z",
    questions: [
      {
        id: "q5",
        question: "Who was the first Roman Emperor?",
        options: [
          "Julius Caesar",
          "Augustus",
          "Nero",
          "Marcus Aurelius",
        ],
        correctAnswer: 1,
        explanation: "Augustus (originally Octavian) became the first Roman Emperor in 27 BCE.",
      },
      {
        id: "q6",
        question: "In what year did the Western Roman Empire fall?",
        options: [
          "410 CE",
          "476 CE",
          "500 CE",
          "312 CE",
        ],
        correctAnswer: 1,
        explanation: "The Western Roman Empire fell in 476 CE when Romulus Augustulus was deposed.",
      },
    ],
  },
];

// Dummy Quiz Attempts
export const dummyQuizAttempts: QuizAttempt[] = [
  {
    id: "attempt-1",
    quizId: "quiz-1",
    userId: "user-1",
    score: 3,
    totalQuestions: 4,
    percentage: 75,
    completedAt: "2024-11-26T12:00:00Z",
    answers: [
      {
        questionId: "q1",
        selectedAnswer: 1,
        isCorrect: true,
      },
      {
        questionId: "q2",
        selectedAnswer: 1,
        isCorrect: true,
      },
      {
        questionId: "q3",
        selectedAnswer: 0,
        isCorrect: false,
      },
      {
        questionId: "q4",
        selectedAnswer: 1,
        isCorrect: true,
      },
    ],
  },
  {
    id: "attempt-2",
    quizId: "quiz-2",
    userId: "user-1",
    score: 2,
    totalQuestions: 2,
    percentage: 100,
    completedAt: "2024-11-25T16:00:00Z",
    answers: [
      {
        questionId: "q5",
        selectedAnswer: 1,
        isCorrect: true,
      },
      {
        questionId: "q6",
        selectedAnswer: 1,
        isCorrect: true,
      },
    ],
  },
];

// Dummy Study Sessions
export const dummyStudySessions: StudySession[] = [
  {
    id: "session-1",
    userId: "user-1",
    type: "flashcard",
    itemId: "set-1",
    completedAt: "2024-11-28T10:00:00Z",
    duration: 1200,
  },
  {
    id: "session-2",
    userId: "user-1",
    type: "quiz",
    itemId: "quiz-1",
    completedAt: "2024-11-28T09:00:00Z",
    duration: 600,
  },
  {
    id: "session-3",
    userId: "user-1",
    type: "flashcard",
    itemId: "set-2",
    completedAt: "2024-11-27T15:00:00Z",
    duration: 900,
  },
];

// Dummy Notifications
export const dummyNotifications: Notification[] = [
  {
    id: "notif-1",
    userId: "user-1",
    type: "success",
    title: "Flashcards Ready!",
    message: "Your flashcards for 'Biology – Cell Structure' have been generated successfully.",
    read: false,
    createdAt: "2024-11-25T10:05:00Z",
  },
  {
    id: "notif-2",
    userId: "user-1",
    type: "success",
    title: "Quiz Complete!",
    message: "You scored 75% on 'Biology Quiz – Cell Biology'. Great job!",
    read: false,
    createdAt: "2024-11-26T12:00:00Z",
  },
  {
    id: "notif-3",
    userId: "user-1",
    type: "info",
    title: "Study Streak!",
    message: "You've studied for 3 days in a row. Keep it up! 🔥",
    read: true,
    createdAt: "2024-11-28T08:00:00Z",
  },
];

// Helper function to get recent flashcard sets
export const getRecentFlashcardSets = (limit: number = 3): FlashcardSet[] => {
  return dummyFlashcardSets
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
};

// Helper function to get recent quizzes
export const getRecentQuizzes = (limit: number = 3): Quiz[] => {
  return dummyQuizzes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, limit);
};

// Helper function to get quiz attempts for a quiz
export const getQuizAttempts = (quizId: string): QuizAttempt[] => {
  return dummyQuizAttempts.filter((attempt) => attempt.quizId === quizId);
};

// Helper function to get unread notifications
export const getUnreadNotifications = (): Notification[] => {
  return dummyNotifications.filter((notif) => !notif.read);
};


