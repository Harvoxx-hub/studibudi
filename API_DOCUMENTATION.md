# Studibudi API Documentation

Simple and straightforward API reference organized by implementation phases.

---

## Quick Reference

| Endpoint | Method | Auth | Phase | Description |
|----------|--------|------|-------|-------------|
| `/health` | GET | ❌ | 1 | Health check |
| `/auth/signup` | POST | ❌ | 1 | Create account |
| `/auth/signin` | POST | ❌ | 1 | Sign in |
| `/auth/google` | POST | ❌ | 1 | Google OAuth |
| `/auth/apple` | POST | ❌ | 1 | Apple OAuth |
| `/auth/forgot-password` | POST | ❌ | 1 | Request password reset |
| `/auth/change-password` | POST | ✅ | 1 | Change password |
| `/auth/refresh-token` | POST | ❌ | 1 | Refresh token |
| `/users/me` | GET | ✅ | 1 | Get current user |
| `/users/me` | PATCH | ✅ | 1 | Update user profile |
| `/users/me/usage` | GET | ✅ | 1 | Get usage statistics |
| `/users/me` | DELETE | ✅ | 1 | Delete account |
| `/flashcards/sets` | POST | ✅ | 2 | Create flashcard set |
| `/flashcards/sets` | GET | ✅ | 2 | List flashcard sets |
| `/flashcards/sets/:setId` | GET | ✅ | 2 | Get flashcard set |
| `/flashcards/sets/:setId` | PATCH | ✅ | 2 | Update flashcard set |
| `/flashcards/sets/:setId` | DELETE | ✅ | 2 | Delete flashcard set |
| `/flashcards/sets/:setId/cards` | POST | ✅ | 2 | Add flashcard |
| `/flashcards/sets/:setId/cards/:cardId` | PATCH | ✅ | 2 | Update flashcard |
| `/flashcards/sets/:setId/cards/:cardId` | DELETE | ✅ | 2 | Delete flashcard |
| `/flashcards/sets/:setId/cards/bulk` | PATCH | ✅ | 2 | Bulk update flashcards |
| `/quizzes` | POST | ✅ | 2 | Create quiz |
| `/quizzes` | GET | ✅ | 2 | List quizzes |
| `/quizzes/:quizId` | GET | ✅ | 2 | Get quiz |
| `/quizzes/:quizId` | PATCH | ✅ | 2 | Update quiz |
| `/quizzes/:quizId` | DELETE | ✅ | 2 | Delete quiz |
| `/quizzes/:quizId/attempts` | POST | ✅ | 2 | Submit quiz attempt |
| `/quizzes/:quizId/attempts` | GET | ✅ | 2 | Get quiz attempts |
| `/users/me/quiz-attempts` | GET | ✅ | 2 | Get user quiz attempts |
| `/uploads/file` | POST | ✅ | 3 | Upload PDF/Document |
| `/uploads/image` | POST | ✅ | 3 | Upload Image (OCR) |
| `/uploads/text` | POST | ✅ | 3 | Upload Text |
| `/uploads` | GET | ✅ | 3 | Get upload history |
| `/uploads/:uploadId` | DELETE | ✅ | 3 | Delete upload |
| `/generate/flashcards` | POST | ✅ | 4 | Generate flashcards (AI) |
| `/generate/quiz` | POST | ✅ | 4 | Generate quiz (AI) |
| `/generate/jobs` | GET | ✅ | 4 | Get generation jobs |
| `/generate/limits` | GET | ✅ | 4 | Get usage limits |
| `/study-sessions` | POST | ✅ | 5 | Start study session |
| `/study-sessions/:sessionId` | PATCH | ✅ | 5 | Complete study session |
| `/study-sessions` | GET | ✅ | 5 | Get study sessions |
| `/users/me/stats` | GET | ✅ | 5 | Get study statistics |
| `/payments/create` | POST | ✅ | 6 | Create payment session |
| `/payments/webhook` | POST | ❌ | 6 | Stripe webhook (no auth) |
| `/users/me/subscription` | GET | ✅ | 6 | Get subscription status |
| `/users/me/subscription/cancel` | POST | ✅ | 6 | Cancel subscription |
| `/users/me/subscription/reactivate` | POST | ✅ | 6 | Reactivate subscription |
| `/notifications` | GET | ✅ | 7 | Get notifications |
| `/notifications/:notificationId/read` | PATCH | ✅ | 7 | Mark notification as read |
| `/notifications/read-all` | PATCH | ✅ | 7 | Mark all as read |
| `/notifications/:notificationId` | DELETE | ✅ | 7 | Delete notification |

**Total Endpoints:** 52

---

## Base URL

**Production:**
```
https://us-central1-student-budi.cloudfunctions.net/api
```

**Local Development (Emulator):**
```
http://localhost:5001/student-budi/us-central1/api
```

---

## Authentication

Most endpoints require authentication using a Bearer token in the Authorization header:

```
Authorization: Bearer {your-token}
```

Tokens are obtained from:
- Signup endpoint (returns custom token)
- Signin endpoint (returns ID token)
- OAuth endpoints (Google/Apple)

---

## API Documentation by Phase

---

# Phase 1: Core Infrastructure & Authentication

## Overview
Phase 1 includes authentication endpoints, user management, and core infrastructure setup.

**Endpoints:** 12  
**Status:** ✅ Complete

---

## Health Check

### GET `/health`
Check if the API is running.

**No authentication required**

**Response (200):**
```json
{
  "status": "ok",
  "message": "Studibudi API is running",
  "timestamp": "2024-12-01T10:00:00.000Z"
}
```

---

## Authentication Endpoints

### Sign Up

#### POST `/auth/signup`
Create a new user account with email and password.

**No authentication required**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "userId",
      "email": "user@example.com",
      "name": "John Doe",
      "subscriptionPlan": "free"
    },
    "token": "firebaseCustomToken"
  }
}
```

**Validation:**
- Email must be valid format
- Password must be at least 6 characters
- Name is required

---

### Sign In

#### POST `/auth/signin`
Sign in with email and password.

**No authentication required**

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Sign in successful",
  "data": {
    "user": {
      "id": "userId",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "token": "firebaseIdToken"
  }
}
```

---

### Google OAuth

#### POST `/auth/google`
Sign in or sign up with Google.

**No authentication required**

**Request Body:**
```json
{
  "idToken": "googleIdToken"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Google authentication successful",
  "data": {
    "user": { ... },
    "token": "firebaseIdToken"
  }
}
```

---

### Apple OAuth

#### POST `/auth/apple`
Sign in or sign up with Apple.

**No authentication required**

**Request Body:**
```json
{
  "idToken": "appleIdToken",
  "accessToken": "appleAccessToken"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Apple authentication successful",
  "data": {
    "user": { ... },
    "token": "firebaseIdToken"
  }
}
```

---

### Forgot Password

#### POST `/auth/forgot-password`
Request a password reset email.

**No authentication required**

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

---

### Change Password

#### POST `/auth/change-password`
Change user password.

**Authentication required**

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Refresh Token

#### POST `/auth/refresh-token`
Refresh authentication token.

**No authentication required**

**Request Body:**
```json
{
  "refreshToken": "firebaseRefreshToken"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "newFirebaseIdToken"
  }
}
```

---

## User Management Endpoints

### Get Current User

#### GET `/users/me`
Get the authenticated user's profile.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "userId",
      "email": "user@example.com",
      "name": "John Doe",
      "subscriptionPlan": "free",
      "streak": 5,
      "studyCountToday": 12,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### Update User Profile

#### PATCH `/users/me`
Update the authenticated user's profile.

**Authentication required**

**Request Body:**
```json
{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "user": { ... }
  }
}
```

---

### Get Usage Statistics

#### GET `/users/me/usage`
Get usage statistics for the current month.

**Authentication required**

**Query Parameters:**
- `month` (optional): Month in format "YYYY-MM" (default: current month)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "usage": {
      "flashcardsCreated": 3,
      "quizzesCreated": 2,
      "month": "2024-12",
      "lastResetDate": "2024-12-01T00:00:00Z"
    }
  }
}
```

---

### Delete Account

#### DELETE `/users/me`
Delete the authenticated user's account and all associated data.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "message": "User account deleted successfully"
}
```

**Note:** This permanently deletes:
- Firebase Auth user
- Firestore user document
- All flashcard sets
- All quizzes
- All uploads
- All study sessions
- All notifications

---

# Phase 2: Content Management (Flashcards & Quizzes)

## Overview
Phase 2 includes all endpoints for managing flashcards and quizzes.

**Endpoints:** 16  
**Status:** ✅ Complete

---

## Flashcard Endpoints

### Create Flashcard Set

#### POST `/flashcards/sets`
Create a new flashcard set.

**Authentication required**

**Request Body:**
```json
{
  "title": "Biology Terms",
  "description": "Key terms for biology exam",
  "subject": "Biology",
  "flashcards": [
    {
      "front": "What is DNA?",
      "back": "Deoxyribonucleic acid"
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "set": {
      "id": "setId",
      "userId": "userId",
      "title": "Biology Terms",
      "flashcards": [...],
      "createdAt": "..."
    }
  }
}
```

---

### Get Flashcard Sets

#### GET `/flashcards/sets`
Get all flashcard sets for the authenticated user.

**Authentication required**

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `subject` (optional): Filter by subject
- `sortBy` (optional): "date" | "title" | "subject" (default: "date")
- `sortOrder` (optional): "asc" | "desc" (default: "desc")
- `search` (optional): Search query

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sets": [...],
    "total": 25,
    "limit": 20,
    "offset": 0
  }
}
```

---

### Get Flashcard Set

#### GET `/flashcards/sets/:setId`
Get a specific flashcard set with all its cards.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "set": {
      "id": "setId",
      "title": "Biology Terms",
      "flashcards": [...]
    }
  }
}
```

---

### Update Flashcard Set

#### PATCH `/flashcards/sets/:setId`
Update a flashcard set.

**Authentication required**

**Request Body:**
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "subject": "Updated Subject"
}
```

---

### Delete Flashcard Set

#### DELETE `/flashcards/sets/:setId`
Delete a flashcard set and all its cards.

**Authentication required**

---

### Add Flashcard

#### POST `/flashcards/sets/:setId/cards`
Add a flashcard to a set.

**Authentication required**

**Request Body:**
```json
{
  "front": "Question?",
  "back": "Answer"
}
```

---

### Update Flashcard

#### PATCH `/flashcards/sets/:setId/cards/:cardId`
Update a flashcard.

**Authentication required**

**Request Body:**
```json
{
  "front": "Updated Question?",
  "back": "Updated Answer",
  "isKnown": true,
  "isBookmarked": false
}
```

---

### Delete Flashcard

#### DELETE `/flashcards/sets/:setId/cards/:cardId`
Delete a flashcard.

**Authentication required**

---

### Bulk Update Flashcards

#### PATCH `/flashcards/sets/:setId/cards/bulk`
Update multiple flashcards at once.

**Authentication required**

**Request Body:**
```json
{
  "updates": [
    {
      "cardId": "card1",
      "isKnown": true,
      "lastStudied": "2024-12-01T00:00:00Z"
    }
  ]
}
```

---

## Quiz Endpoints

### Create Quiz

#### POST `/quizzes`
Create a new quiz.

**Authentication required**

**Request Body:**
```json
{
  "title": "Biology Quiz 1",
  "description": "Test your knowledge",
  "subject": "Biology",
  "questions": [
    {
      "question": "What is DNA?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "DNA is..."
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "quiz": {
      "id": "quizId",
      "title": "Biology Quiz 1",
      "questions": [...]
    }
  }
}
```

---

### Get Quizzes

#### GET `/quizzes`
Get all quizzes for the authenticated user.

**Authentication required**

**Query Parameters:**
- Same as flashcard sets (limit, offset, subject, sortBy, sortOrder, search)

---

### Get Quiz

#### GET `/quizzes/:quizId`
Get a specific quiz with all its questions.

**Authentication required**

---

### Update Quiz

#### PATCH `/quizzes/:quizId`
Update a quiz.

**Authentication required**

---

### Delete Quiz

#### DELETE `/quizzes/:quizId`
Delete a quiz and all its questions.

**Authentication required**

---

### Submit Quiz Attempt

#### POST `/quizzes/:quizId/attempts`
Submit answers for a quiz.

**Authentication required**

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "q1",
      "selectedAnswer": 2
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attempt": {
      "id": "attemptId",
      "score": 8,
      "totalQuestions": 10,
      "percentage": 80,
      "answers": [...]
    }
  }
}
```

---

### Get Quiz Attempts

#### GET `/quizzes/:quizId/attempts`
Get all attempts for a quiz.

**Authentication required**

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

---

### Get User Quiz Attempts

#### GET `/users/me/quiz-attempts`
Get all quiz attempts for the authenticated user.

**Authentication required**

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)

---

# Phase 3: File Upload & Text Extraction

## Overview
Phase 3 includes endpoints for uploading files (PDF, images, text) and extracting text content.

**Endpoints:** 5  
**Status:** ✅ Complete

---

## Upload Endpoints

### Upload PDF/Document

#### POST `/uploads/file`
Upload a PDF or document file for text extraction.

**Authentication required**  
**Rate Limited:** 20 requests/hour

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (PDF, DOC, DOCX)
- `type`: "pdf" | "document"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "upload": {
      "id": "uploadId",
      "fileUrl": "https://storage.googleapis.com/...",
      "extractedText": "Extracted text content...",
      "fileName": "document.pdf",
      "fileSize": 1024000,
      "type": "pdf"
    }
  }
}
```

**Note:** Text extraction happens asynchronously via Cloud Storage trigger.

---

### Upload Image (OCR)

#### POST `/uploads/image`
Upload an image file for OCR text extraction.

**Authentication required**  
**Rate Limited:** 20 requests/hour

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: File (JPG, PNG, etc.)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "upload": {
      "id": "uploadId",
      "fileUrl": "https://storage.googleapis.com/...",
      "extractedText": "OCR extracted text...",
      "fileName": "image.jpg",
      "fileSize": 512000,
      "type": "image"
    }
  }
}
```

**Note:** OCR processing happens asynchronously via Cloud Storage trigger using Tesseract.js.

---

### Upload Text

#### POST `/uploads/text`
Upload text content directly.

**Authentication required**

**Request Body:**
```json
{
  "text": "Pasted text content here...",
  "title": "Optional title"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "upload": {
      "id": "uploadId",
      "extractedText": "Pasted text content here...",
      "type": "text"
    }
  }
}
```

---

### Get Upload History

#### GET `/uploads`
Get upload history for the authenticated user.

**Authentication required**

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): "pdf" | "text" | "image" (filter)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "uploads": [...],
    "total": 10
  }
}
```

---

### Delete Upload

#### DELETE `/uploads/:uploadId`
Delete an upload and its associated file.

**Authentication required**

---

# Phase 4: AI Generation Features

## Overview
Phase 4 includes AI-powered flashcard and quiz generation using DeepSeek API.

**Endpoints:** 4  
**Status:** ✅ Complete

---

## AI Generation Endpoints

### Generate Flashcards

#### POST `/generate/flashcards`
Generate flashcards from text content using AI.

**Authentication required**  
**Rate Limited:** 10 requests/hour  
**Usage Limits:** Enforced based on subscription plan

**Request Body:**
```json
{
  "content": "Text content to generate flashcards from...",
  "options": {
    "count": 10,
    "difficulty": "medium",
    "subject": "Biology"
  },
  "uploadId": "uploadId"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "jobId",
      "status": "processing",
      "type": "flashcards"
    }
  }
}
```

**Note:** Generation is asynchronous. Use `/generate/jobs/:jobId` to check status.

---

### Generate Quiz

#### POST `/generate/quiz`
Generate a quiz from text content using AI.

**Authentication required**  
**Rate Limited:** 10 requests/hour  
**Usage Limits:** Enforced based on subscription plan

**Request Body:**
```json
{
  "content": "Text content to generate quiz from...",
  "options": {
    "count": 10,
    "difficulty": "medium",
    "subject": "Biology"
  },
  "uploadId": "uploadId"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "job": {
      "id": "jobId",
      "status": "processing",
      "type": "quiz"
    }
  }
}
```

---

### Get Generation Jobs

#### GET `/generate/jobs`
Get all generation jobs for the authenticated user.

**Authentication required**

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): "pending" | "processing" | "completed" | "failed"

**Response (200):**
```json
{
  "success": true,
  "data": {
    "jobs": [
      {
        "id": "jobId",
        "type": "flashcards",
        "status": "completed",
        "result": {
          "setId": "setId"
        },
        "createdAt": "..."
      }
    ],
    "total": 5
  }
}
```

---

### Get Usage Limits

#### GET `/generate/limits`
Get AI generation usage limits for the authenticated user.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "limits": {
      "plan": "free",
      "flashcardsPerMonth": 5,
      "quizzesPerMonth": 3,
      "flashcardsUsed": 2,
      "quizzesUsed": 1,
      "flashcardsRemaining": 3,
      "quizzesRemaining": 2
    }
  }
}
```

**Usage Limits:**
- **Free Plan:**
  - 5 flashcards/month
  - 3 quizzes/month
- **Premium Plan:**
  - Unlimited flashcards
  - Unlimited quizzes

---

# Phase 5: Study Sessions & Statistics

## Overview
Phase 5 includes endpoints for tracking study sessions and calculating statistics.

**Endpoints:** 4  
**Status:** ✅ Complete

---

## Study Session Endpoints

### Start Study Session

#### POST `/study-sessions`
Start a new study session.

**Authentication required**

**Request Body:**
```json
{
  "type": "flashcard",
  "itemId": "setId",
  "filterMode": "all"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "sessionId",
      "type": "flashcard",
      "itemId": "setId",
      "startedAt": "2024-12-01T00:00:00Z"
    }
  }
}
```

**Types:**
- `flashcard` - Study flashcard set
- `quiz` - Take quiz

**Filter Modes (for flashcards):**
- `all` - All flashcards
- `unknown` - Only unknown flashcards

---

### Complete Study Session

#### PATCH `/study-sessions/:sessionId`
Complete a study session with statistics.

**Authentication required**

**Request Body:**
```json
{
  "stats": {
    "total": 20,
    "known": 15,
    "unknown": 5,
    "bookmarked": 3
  },
  "duration": 1200
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "sessionId",
      "completedAt": "2024-12-01T00:20:00Z",
      "duration": 1200,
      "stats": { ... }
    }
  }
}
```

**Note:** Completing a session automatically:
- Updates user streak
- Updates studyCountToday
- Triggers statistics recalculation

---

### Get Study Sessions

#### GET `/study-sessions`
Get all study sessions for the authenticated user.

**Authentication required**

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `type` (optional): "flashcard" | "quiz" (filter)
- `itemId` (optional): Filter by specific set/quiz

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessions": [...],
    "total": 50
  }
}
```

---

### Get Study Statistics

#### GET `/users/me/stats`
Get comprehensive study statistics.

**Authentication required**

**Query Parameters:**
- `period` (optional): "day" | "week" | "month" | "all" (default: "all")

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalSessions": 50,
      "totalStudyTime": 3600,
      "flashcardsStudied": 200,
      "quizzesCompleted": 15,
      "streak": 5,
      "studyCountToday": 12
    }
  }
}
```

---

# Phase 6: Payments & Subscriptions

## Overview
Phase 6 includes payment processing and subscription management using Stripe.

**Endpoints:** 5  
**Status:** ✅ Complete

---

## Payment Endpoints

### Create Payment Session

#### POST `/payments/create`
Create a Stripe checkout session for subscription payment.

**Authentication required**

**Request Body:**
```json
{
  "planId": "monthly",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "paymentUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_test_..."
  }
}
```

**Plan IDs:**
- `monthly` - $9.99/month
- `quarterly` - $24.99/3 months
- `yearly` - $89.99/year

---

### Payment Webhook

#### POST `/payments/webhook`
Handle Stripe webhook events (called by Stripe, not by users).

**No authentication required** (Stripe verifies via signature)

**Headers:**
- `stripe-signature`: Stripe webhook signature

**Process:**
- Verifies webhook signature
- Handles subscription events
- Updates user subscription in Firestore
- Sends notifications

**Note:** Configure this URL in Stripe Dashboard webhook settings.

---

## Subscription Endpoints

### Get Subscription Status

#### GET `/users/me/subscription`
Get the authenticated user's subscription status.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "data": {
    "subscription": {
      "plan": "premium",
      "status": "active",
      "currentPeriodEnd": "2025-01-01T00:00:00.000Z",
      "cancelAtPeriodEnd": false,
      "details": {
        "id": "sub_...",
        "status": "active",
        "currentPeriodStart": "2024-12-01T00:00:00.000Z",
        "currentPeriodEnd": "2025-01-01T00:00:00.000Z"
      }
    }
  }
}
```

---

### Cancel Subscription

#### POST `/users/me/subscription/cancel`
Cancel subscription at the end of the current billing period.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription will cancel at end of billing period"
}
```

**Note:** Subscription remains active until period end. User can reactivate before then.

---

### Reactivate Subscription

#### POST `/users/me/subscription/reactivate`
Reactivate a canceled subscription.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription reactivated successfully"
}
```

---

# Phase 7: Notifications & Polish

## Overview
Phase 7 includes notification management and system polish.

**Endpoints:** 4  
**Status:** ✅ Complete

---

## Notification Endpoints

### Get Notifications


#### GET `/notifications`
Get notifications for the authenticated user.

**Authentication required**

**Query Parameters:**
- `limit` (optional): Number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)
- `read` (optional): Filter by read status - "true" or "false"

**Response (200):**
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "data": {
    "notifications": [
      {
        "id": "notificationId",
        "userId": "userId",
        "type": "success",
        "title": "Welcome to Studibudi!",
        "message": "Get started by creating your first flashcard set.",
        "read": false,
        "createdAt": "2024-12-01T10:00:00.000Z"
      }
    ],
    "total": 15,
    "unreadCount": 5,
    "limit": 20,
    "offset": 0
  }
}
```

**Notification Types:**
- `success` - Success notifications (green)
- `info` - Information notifications (blue)
- `warning` - Warning notifications (yellow)
- `error` - Error notifications (red)

---

### Mark Notification as Read

#### PATCH `/notifications/:notificationId/read`
Mark a specific notification as read.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read",
  "data": {
    "notification": {
      "id": "notificationId",
      "read": true,
      "readAt": "2024-12-01T10:05:00.000Z"
    }
  }
}
```

---

### Mark All Notifications as Read

#### PATCH `/notifications/read-all`
Mark all notifications as read for the authenticated user.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "message": "3 notifications marked as read",
  "data": {
    "count": 3
  }
}
```

---

### Delete Notification

#### DELETE `/notifications/:notificationId`
Delete a notification.

**Authentication required**

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted successfully",
  "data": {}
}
```

---
err
**Last Updated:** December 2024  
**API Version:** 1.0