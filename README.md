# Studibudi - AI Study Assistant

A Next.js application that helps students create flashcards and quizzes from their study materials using AI.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
studibudi/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home dashboard
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   └── dashboard/         # Dashboard-specific components
│       ├── QuickActionButton.tsx
│       ├── RecentItemCard.tsx
│       └── ProgressCard.tsx
├── lib/
│   └── dummyData.ts       # Dummy data for frontend development
├── types/
│   └── index.ts           # TypeScript type definitions
└── IMPLEMENTATION_PLAN.md # Detailed implementation roadmap
```

## 🎨 Design System

### Colors

- **Primary Blue:** `#4A90E2` - Headers, Navigation, Brand
- **Primary Green:** `#2ECC71` - Progress, Success, Badges
- **Accent Orange:** `#F5A623` - CTAs, Generate Buttons
- **Accent Gold:** `#FFD700` - Achievements, Streaks
- **Neutral White:** `#FFFFFF` - Primary Background
- **Neutral Light Gray:** `#F2F2F2` - Secondary Backgrounds
- **Neutral Dark Gray:** `#333333` - Text, Icons

## 📊 Dummy Data

The app currently uses dummy data located in `lib/dummyData.ts`:

- **User:** Sarah (free plan, 3-day streak)
- **Flashcard Sets:** 3 sets (Biology, History, Chemistry)
- **Quizzes:** 2 quizzes with questions
- **Quiz Attempts:** 2 completed attempts
- **Study Sessions:** 3 recent sessions
- **Notifications:** 3 sample notifications

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Hooks (will add Zustand later)

## 📝 Next Steps

See `IMPLEMENTATION_PLAN.md` for the complete implementation roadmap.

Current status: **Frontend foundation with dummy data** ✅

Next phases:
1. Authentication & Onboarding
2. Upload System
3. AI Generation
4. Flashcard Viewer
5. Quiz Player

## 🧪 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 📄 License

ISC


# studibudi
