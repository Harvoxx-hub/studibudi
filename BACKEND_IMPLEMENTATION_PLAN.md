# Studibudi Backend Implementation Plan

## 🔥 Firebase Services Overview

### Services to Use
- **Firebase Authentication** - User authentication (Email/Password, Google, Apple)
- **Cloud Firestore** - NoSQL database for all app data
- **Cloud Storage** - File storage for PDFs, images, and documents
- **Cloud Functions** - Serverless backend logic (AI generation, payments, webhooks)
- **Firebase Extensions** (Optional):
  - Resize Images
  - Trigger Email

---

## 📊 Firestore Database Schema

### Collections Structure

```
studibudi/
├── users/                          # User profiles
│   └── {userId}/
│       ├── email: string
│       ├── name: string
│       ├── subscriptionPlan: "free" | "premium"
│       ├── subscriptionId: string? (Stripe/Paystack subscription ID)
│       ├── subscriptionStatus: "active" | "canceled" | "past_due"
│       ├── subscriptionExpiresAt: timestamp?
│       ├── streak: number
│       ├── studyCountToday: number
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── usage/                  # Subcollection
│           └── {monthYear}/        # e.g., "2024-12"
│               ├── flashcardsCreated: number
│               ├── quizzesCreated: number
│               └── lastResetDate: timestamp
│
├── flashcardSets/                  # Flashcard sets
│   └── {setId}/
│       ├── userId: string
│       ├── title: string
│       ├── description: string?
│       ├── subject: string?
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── flashcards/             # Subcollection
│           └── {cardId}/
│               ├── front: string
│               ├── back: string
│               ├── isKnown: boolean
│               ├── isBookmarked: boolean
│               ├── lastStudied: timestamp?
│               └── createdAt: timestamp
│
├── quizzes/                        # Quizzes
│   └── {quizId}/
│       ├── userId: string
│       ├── title: string
│       ├── description: string?
│       ├── subject: string?
│       ├── createdAt: timestamp
│       ├── updatedAt: timestamp
│       └── questions/              # Subcollection
│           └── {questionId}/
│               ├── question: string
│               ├── options: string[]
│               ├── correctAnswer: number
│               └── explanation: string?
│
├── quizAttempts/                  # Quiz attempts
│   └── {attemptId}/
│       ├── quizId: string
│       ├── userId: string
│       ├── score: number
│       ├── totalQuestions: number
│       ├── percentage: number
│       ├── completedAt: timestamp
│       └── answers/                # Subcollection
│           └── {answerId}/
│               ├── questionId: string
│               ├── selectedAnswer: number
│               └── isCorrect: boolean
│
├── studySessions/                  # Study sessions
│   └── {sessionId}/
│       ├── userId: string
│       ├── type: "flashcard" | "quiz"
│       ├── itemId: string          # flashcardSetId or quizId
│       ├── completedAt: timestamp
│       ├── duration: number?       # in seconds
│       └── stats: {
│           ├── total: number
│           ├── known: number?
│           ├── unknown: number?
│           └── bookmarked: number?
│       }
│
├── uploads/                        # File uploads
│   └── {uploadId}/
│       ├── userId: string
│       ├── type: "pdf" | "text" | "image"
│       ├── fileUrl: string?        # Cloud Storage URL
│       ├── extractedText: string
│       ├── fileName: string?
│       ├── fileSize: number?
│       └── createdAt: timestamp
│
└── notifications/                  # User notifications
    └── {notificationId}/
        ├── userId: string
        ├── type: "success" | "info" | "warning" | "error"
        ├── title: string
        ├── message: string
        ├── read: boolean
        └── createdAt: timestamp
```

### Firestore Indexes Required

```javascript
// Composite indexes needed:
- flashcardSets: userId + updatedAt (descending)
- flashcardSets: userId + subject + updatedAt (descending)
- quizzes: userId + updatedAt (descending)
- quizzes: userId + subject + updatedAt (descending)
- quizAttempts: quizId + completedAt (descending)
- quizAttempts: userId + completedAt (descending)
- studySessions: userId + completedAt (descending)
- studySessions: userId + type + completedAt (descending)
- notifications: userId + read + createdAt (descending)
```

---

## 🔐 Authentication Endpoints

### 1. Sign Up (Email/Password)
**Cloud Function:** `authSignUp`
- **Method:** POST
- **Path:** `/auth/signup`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "name": "John Doe"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "user": {
      "id": "userId",
      "email": "user@example.com",
      "name": "John Doe",
      "subscriptionPlan": "free"
    },
    "token": "firebaseIdToken"
  }
  ```
- **Firebase:** `createUserWithEmailAndPassword()`
- **Firestore:** Create user document in `users/` collection

### 2. Sign In (Email/Password)
**Cloud Function:** `authSignIn`
- **Method:** POST
- **Path:** `/auth/signin`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "user": { ... },
    "token": "firebaseIdToken"
  }
  ```
- **Firebase:** `signInWithEmailAndPassword()`

### 3. Google OAuth
**Cloud Function:** `authGoogle`
- **Method:** POST
- **Path:** `/auth/google`
- **Body:**
  ```json
  {
    "idToken": "googleIdToken"
  }
  ```
- **Firebase:** `signInWithCredential(GoogleAuthProvider)`

### 4. Apple OAuth
**Cloud Function:** `authApple`
- **Method:** POST
- **Path:** `/auth/apple`
- **Body:**
  ```json
  {
    "idToken": "appleIdToken",
    "accessToken": "appleAccessToken"
  }
  ```
- **Firebase:** `signInWithCredential(OAuthProvider("apple.com"))`

### 5. Forgot Password
**Cloud Function:** `authForgotPassword`
- **Method:** POST
- **Path:** `/auth/forgot-password`
- **Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Firebase:** `sendPasswordResetEmail()`

### 6. Change Password
**Cloud Function:** `authChangePassword`
- **Method:** POST
- **Path:** `/auth/change-password`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "currentPassword": "oldPassword",
    "newPassword": "newPassword123"
  }
  ```
- **Firebase:** `reauthenticateWithCredential()` + `updatePassword()`

### 7. Refresh Token
**Cloud Function:** `authRefreshToken`
- **Method:** POST
- **Path:** `/auth/refresh-token`
- **Body:**
  ```json
  {
    "refreshToken": "firebaseRefreshToken"
  }
  ```
- **Firebase:** `getIdToken(true)` (force refresh)

### 8. Sign Out
**Client-side only** - Use Firebase SDK `signOut()`

---

## 👤 User Management Endpoints

### 1. Get Current User
**Cloud Function:** `getUser`
- **Method:** GET
- **Path:** `/users/me`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "success": true,
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
  ```

### 2. Update User Profile
**Cloud Function:** `updateUser`
- **Method:** PATCH
- **Path:** `/users/me`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "name": "John Updated",
    "email": "newemail@example.com"
  }
  ```
- **Firestore:** Update `users/{userId}` document

### 3. Get User Usage Stats
**Cloud Function:** `getUserUsage`
- **Method:** GET
- **Path:** `/users/me/usage`
- **Headers:** `Authorization: Bearer {token}`
- **Query:** `?month=2024-12` (optional, defaults to current month)
- **Response:**
  ```json
  {
    "success": true,
    "usage": {
      "flashcardsCreated": 3,
      "quizzesCreated": 2,
      "month": "2024-12",
      "lastResetDate": "2024-12-01T00:00:00Z"
    }
  }
  ```

### 4. Delete User Account
**Cloud Function:** `deleteUser`
- **Method:** DELETE
- **Path:** `/users/me`
- **Headers:** `Authorization: Bearer {token}`
- **Firebase:** Delete user from Auth
- **Firestore:** Delete user document and all related data (use batch delete)

---

## 📚 Flashcard Endpoints

### 1. Create Flashcard Set
**Cloud Function:** `createFlashcardSet`
- **Method:** POST
- **Path:** `/flashcards/sets`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
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
- **Response:**
  ```json
  {
    "success": true,
    "set": {
      "id": "setId",
      "userId": "userId",
      "title": "Biology Terms",
      "flashcards": [...],
      "createdAt": "..."
    }
  }
  ```
- **Firestore:** Create document in `flashcardSets/` and subcollection `flashcards/`
- **Usage Tracking:** Increment `users/{userId}/usage/{monthYear}/flashcardsCreated`

### 2. Get Flashcard Sets
**Cloud Function:** `getFlashcardSets`
- **Method:** GET
- **Path:** `/flashcards/sets`
- **Headers:** `Authorization: Bearer {token}`
- **Query:**
  - `limit`: number (default: 20)
  - `offset`: number (default: 0)
  - `subject`: string (optional filter)
  - `sortBy`: "date" | "title" | "subject" (default: "date")
  - `sortOrder`: "asc" | "desc" (default: "desc")
  - `search`: string (optional search query)
- **Response:**
  ```json
  {
    "success": true,
    "sets": [...],
    "total": 25,
    "limit": 20,
    "offset": 0
  }
  ```

### 3. Get Flashcard Set by ID
**Cloud Function:** `getFlashcardSet`
- **Method:** GET
- **Path:** `/flashcards/sets/{setId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "success": true,
    "set": {
      "id": "setId",
      "title": "...",
      "flashcards": [...]
    }
  }
  ```

### 4. Update Flashcard Set
**Cloud Function:** `updateFlashcardSet`
- **Method:** PATCH
- **Path:** `/flashcards/sets/{setId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description",
    "subject": "Updated Subject"
  }
  ```
- **Firestore:** Update `flashcardSets/{setId}` document

### 5. Delete Flashcard Set
**Cloud Function:** `deleteFlashcardSet`
- **Method:** DELETE
- **Path:** `/flashcards/sets/{setId}`
- **Headers:** `Authorization: Bearer {token}`
- **Firestore:** Delete set and all flashcards subcollection

### 6. Add Flashcard to Set
**Cloud Function:** `addFlashcard`
- **Method:** POST
- **Path:** `/flashcards/sets/{setId}/cards`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "front": "Question?",
    "back": "Answer"
  }
  ```
- **Firestore:** Create document in `flashcardSets/{setId}/flashcards/`

### 7. Update Flashcard
**Cloud Function:** `updateFlashcard`
- **Method:** PATCH
- **Path:** `/flashcards/sets/{setId}/cards/{cardId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "front": "Updated Question?",
    "back": "Updated Answer",
    "isKnown": true,
    "isBookmarked": false
  }
  ```
- **Firestore:** Update `flashcardSets/{setId}/flashcards/{cardId}`

### 8. Delete Flashcard
**Cloud Function:** `deleteFlashcard`
- **Method:** DELETE
- **Path:** `/flashcards/sets/{setId}/cards/{cardId}`
- **Headers:** `Authorization: Bearer {token}`
- **Firestore:** Delete `flashcardSets/{setId}/flashcards/{cardId}`

### 9. Bulk Update Flashcards
**Cloud Function:** `bulkUpdateFlashcards`
- **Method:** PATCH
- **Path:** `/flashcards/sets/{setId}/cards/bulk`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
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
- **Firestore:** Batch update multiple flashcards

---

## 📝 Quiz Endpoints

### 1. Create Quiz
**Cloud Function:** `createQuiz`
- **Method:** POST
- **Path:** `/quizzes`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
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
- **Response:**
  ```json
  {
    "success": true,
    "quiz": {
      "id": "quizId",
      "title": "...",
      "questions": [...]
    }
  }
  ```
- **Firestore:** Create document in `quizzes/` and subcollection `questions/`
- **Usage Tracking:** Increment `users/{userId}/usage/{monthYear}/quizzesCreated`

### 2. Get Quizzes
**Cloud Function:** `getQuizzes`
- **Method:** GET
- **Path:** `/quizzes`
- **Headers:** `Authorization: Bearer {token}`
- **Query:** Same as flashcard sets (limit, offset, subject, sortBy, sortOrder, search)
- **Response:**
  ```json
  {
    "success": true,
    "quizzes": [...],
    "total": 15
  }
  ```

### 3. Get Quiz by ID
**Cloud Function:** `getQuiz`
- **Method:** GET
- **Path:** `/quizzes/{quizId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "success": true,
    "quiz": {
      "id": "quizId",
      "title": "...",
      "questions": [...]
    }
  }
  ```

### 4. Update Quiz
**Cloud Function:** `updateQuiz`
- **Method:** PATCH
- **Path:** `/quizzes/{quizId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "title": "Updated Title",
    "description": "Updated description"
  }
  ```
- **Firestore:** Update `quizzes/{quizId}` document

### 5. Delete Quiz
**Cloud Function:** `deleteQuiz`
- **Method:** DELETE
- **Path:** `/quizzes/{quizId}`
- **Headers:** `Authorization: Bearer {token}`
- **Firestore:** Delete quiz and all questions subcollection

### 6. Submit Quiz Attempt
**Cloud Function:** `submitQuizAttempt`
- **Method:** POST
- **Path:** `/quizzes/{quizId}/attempts`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
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
- **Response:**
  ```json
  {
    "success": true,
    "attempt": {
      "id": "attemptId",
      "score": 8,
      "totalQuestions": 10,
      "percentage": 80,
      "answers": [...]
    }
  }
  ```
- **Firestore:** Create document in `quizAttempts/` and subcollection `answers/`

### 7. Get Quiz Attempts
**Cloud Function:** `getQuizAttempts`
- **Method:** GET
- **Path:** `/quizzes/{quizId}/attempts`
- **Headers:** `Authorization: Bearer {token}`
- **Query:**
  - `limit`: number (default: 10)
  - `offset`: number (default: 0)
- **Response:**
  ```json
  {
    "success": true,
    "attempts": [...],
    "total": 5
  }
  ```

### 8. Get User Quiz Attempts
**Cloud Function:** `getUserQuizAttempts`
- **Method:** GET
- **Path:** `/users/me/quiz-attempts`
- **Headers:** `Authorization: Bearer {token}`
- **Query:** Same as above
- **Response:**
  ```json
  {
    "success": true,
    "attempts": [...]
  }
  ```

---

## 📤 File Upload Endpoints

### 1. Upload PDF/Document
**Cloud Function:** `uploadFile`
- **Method:** POST
- **Path:** `/uploads/file`
- **Headers:** `Authorization: Bearer {token}`
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: File (PDF, DOC, DOCX)
  - `type`: "pdf" | "document"
- **Response:**
  ```json
  {
    "success": true,
    "upload": {
      "id": "uploadId",
      "fileUrl": "https://storage.googleapis.com/...",
      "extractedText": "Extracted text content...",
      "fileName": "document.pdf",
      "fileSize": 1024000
    }
  }
  ```
- **Cloud Storage:** Upload to `uploads/{userId}/{timestamp}-{filename}`
- **Cloud Function:** Trigger text extraction (PDF parsing)
- **Firestore:** Create document in `uploads/` collection

### 2. Upload Image (OCR)
**Cloud Function:** `uploadImage`
- **Method:** POST
- **Path:** `/uploads/image`
- **Headers:** `Authorization: Bearer {token}`
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: File (Image: JPG, PNG, etc.)
- **Response:**
  ```json
  {
    "success": true,
    "upload": {
      "id": "uploadId",
      "fileUrl": "https://storage.googleapis.com/...",
      "extractedText": "OCR extracted text...",
      "fileName": "image.jpg",
      "fileSize": 512000
    }
  }
  ```
- **Cloud Storage:** Upload to `images/{userId}/{timestamp}-{filename}`
- **Cloud Function:** Trigger OCR processing (Tesseract.js or Cloud Vision API)
- **Firestore:** Create document in `uploads/` collection

### 3. Upload Text (Direct)
**Cloud Function:** `uploadText`
- **Method:** POST
- **Path:** `/uploads/text`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "text": "Pasted text content here...",
    "title": "Optional title"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "upload": {
      "id": "uploadId",
      "extractedText": "Pasted text content here...",
      "type": "text"
    }
  }
  ```
- **Firestore:** Create document in `uploads/` collection (no file storage needed)

### 4. Get Upload History
**Cloud Function:** `getUploads`
- **Method:** GET
- **Path:** `/uploads`
- **Headers:** `Authorization: Bearer {token}`
- **Query:**
  - `limit`: number (default: 20)
  - `offset`: number (default: 0)
  - `type`: "pdf" | "text" | "image" (optional filter)
- **Response:**
  ```json
  {
    "success": true,
    "uploads": [...],
    "total": 10
  }
  ```

### 5. Delete Upload
**Cloud Function:** `deleteUpload`
- **Method:** DELETE
- **Path:** `/uploads/{uploadId}`
- **Headers:** `Authorization: Bearer {token}`
- **Cloud Storage:** Delete file if exists
- **Firestore:** Delete document from `uploads/` collection

---

## 🤖 AI Generation Endpoints

### 1. Generate Flashcards
**Cloud Function:** `generateFlashcards`
- **Method:** POST
- **Path:** `/generate/flashcards`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "content": "Text content to generate flashcards from...",
    "options": {
      "count": 10,
      "difficulty": "medium",
      "subject": "Biology"
    },
    "uploadId": "uploadId" (optional - link to source upload)
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "set": {
      "id": "setId",
      "title": "Generated Flashcard Set",
      "flashcards": [...]
    }
  }
  ```
- **Process:**
  1. Check user subscription and usage limits
  2. Call AI service (OpenAI/Anthropic/Gemini)
  3. Parse AI response into flashcard structure
  4. Create flashcard set in Firestore
  5. Increment usage counter
  6. Return created set

### 2. Generate Quiz
**Cloud Function:** `generateQuiz`
- **Method:** POST
- **Path:** `/generate/quiz`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "content": "Text content to generate quiz from...",
    "options": {
      "count": 10,
      "difficulty": "medium",
      "subject": "Biology"
    },
    "uploadId": "uploadId" (optional)
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "quiz": {
      "id": "quizId",
      "title": "Generated Quiz",
      "questions": [...]
    }
  }
  ```
- **Process:** Similar to flashcard generation

### 3. Get Generation Status
**Cloud Function:** `getGenerationStatus`
- **Method:** GET
- **Path:** `/generate/status/{jobId}`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "success": true,
    "status": "processing" | "completed" | "failed",
    "progress": 75,
    "result": { ... } (if completed)
  }
  ```
- **Note:** For long-running generations, use Firestore document to track status

---

## 💳 Payment & Subscription Endpoints

### 1. Create Payment Session
**Cloud Function:** `createPaymentSession`
- **Method:** POST
- **Path:** `/payments/create`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "planId": "monthly" | "quarterly" | "yearly"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "paymentUrl": "https://checkout.stripe.com/...",
    "sessionId": "sessionId"
  }
  ```
- **Process:**
  1. Create Stripe/Paystack checkout session
  2. Store session metadata in Firestore
  3. Return payment URL

### 2. Payment Webhook
**Cloud Function:** `paymentWebhook`
- **Method:** POST
- **Path:** `/payments/webhook`
- **Headers:** 
  - `stripe-signature` (for Stripe)
  - `x-paystack-signature` (for Paystack)
- **Body:** Webhook payload from payment provider
- **Process:**
  1. Verify webhook signature
  2. Handle event types:
     - `checkout.session.completed` - Activate subscription
     - `customer.subscription.updated` - Update subscription
     - `customer.subscription.deleted` - Cancel subscription
     - `invoice.payment_failed` - Handle failed payment
  3. Update user subscription in Firestore
  4. Send notification to user

### 3. Get Subscription Status
**Cloud Function:** `getSubscription`
- **Method:** GET
- **Path:** `/users/me/subscription`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "success": true,
    "subscription": {
      "plan": "premium",
      "status": "active",
      "currentPeriodEnd": "2025-01-01T00:00:00Z",
      "cancelAtPeriodEnd": false
    }
  }
  ```

### 4. Cancel Subscription
**Cloud Function:** `cancelSubscription`
- **Method:** POST
- **Path:** `/users/me/subscription/cancel`
- **Headers:** `Authorization: Bearer {token}`
- **Response:**
  ```json
  {
    "success": true,
    "message": "Subscription will cancel at end of billing period"
  }
  ```
- **Process:**
  1. Update Stripe/Paystack subscription to cancel at period end
  2. Update Firestore user document

### 5. Reactivate Subscription
**Cloud Function:** `reactivateSubscription`
- **Method:** POST
- **Path:** `/users/me/subscription/reactivate`
- **Headers:** `Authorization: Bearer {token}`
- **Process:** Remove cancellation from subscription

---

## 📊 Study Session Endpoints

### 1. Start Study Session
**Cloud Function:** `startStudySession`
- **Method:** POST
- **Path:** `/study-sessions`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
  ```json
  {
    "type": "flashcard" | "quiz",
    "itemId": "setId or quizId",
    "filterMode": "all" | "unknown" (for flashcards)
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "session": {
      "id": "sessionId",
      "type": "flashcard",
      "itemId": "setId",
      "startedAt": "2024-12-01T00:00:00Z"
    }
  }
  ```
- **Firestore:** Create document in `studySessions/` collection

### 2. Complete Study Session
**Cloud Function:** `completeStudySession`
- **Method:** PATCH
- **Path:** `/study-sessions/{sessionId}`
- **Headers:** `Authorization: Bearer {token}`
- **Body:**
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
- **Firestore:** Update `studySessions/{sessionId}` document
- **Update:** User streak and studyCountToday

### 3. Get Study Sessions
**Cloud Function:** `getStudySessions`
- **Method:** GET
- **Path:** `/study-sessions`
- **Headers:** `Authorization: Bearer {token}`
- **Query:**
  - `limit`: number (default: 20)
  - `offset`: number (default: 0)
  - `type`: "flashcard" | "quiz" (optional)
  - `itemId`: string (optional)
- **Response:**
  ```json
  {
    "success": true,
    "sessions": [...],
    "total": 50
  }
  ```

### 4. Get Study Statistics
**Cloud Function:** `getStudyStats`
- **Method:** GET
- **Path:** `/users/me/stats`
- **Headers:** `Authorization: Bearer {token}`
- **Query:**
  - `period`: "day" | "week" | "month" | "all" (default: "all")
- **Response:**
  ```json
  {
    "success": true,
    "stats": {
      "totalSessions": 50,
      "totalStudyTime": 3600,
      "flashcardsStudied": 200,
      "quizzesCompleted": 15,
      "streak": 5,
      "studyCountToday": 12
    }
  }
  ```

---

## 🔔 Notification Endpoints

### 1. Get Notifications
**Cloud Function:** `getNotifications`
- **Method:** GET
- **Path:** `/notifications`
- **Headers:** `Authorization: Bearer {token}`
- **Query:**
  - `limit`: number (default: 20)
  - `offset`: number (default: 0)
  - `read`: boolean (optional filter)
- **Response:**
  ```json
  {
    "success": true,
    "notifications": [...],
    "unreadCount": 5
  }
  ```

### 2. Mark Notification as Read
**Cloud Function:** `markNotificationRead`
- **Method:** PATCH
- **Path:** `/notifications/{notificationId}/read`
- **Headers:** `Authorization: Bearer {token}`
- **Firestore:** Update `notifications/{notificationId}` document

### 3. Mark All Notifications as Read
**Cloud Function:** `markAllNotificationsRead`
- **Method:** PATCH
- **Path:** `/notifications/read-all`
- **Headers:** `Authorization: Bearer {token}`
- **Firestore:** Batch update all user notifications

### 4. Delete Notification
**Cloud Function:** `deleteNotification`
- **Method:** DELETE
- **Path:** `/notifications/{notificationId}`
- **Headers:** `Authorization: Bearer {token}`
- **Firestore:** Delete `notifications/{notificationId}` document

---

## 🔒 Security & Middleware

### Authentication Middleware
All protected endpoints should:
1. Verify Firebase ID token
2. Extract user ID from token
3. Check if user exists in Firestore
4. Attach user context to request

### Rate Limiting
- Implement rate limiting for:
  - AI generation endpoints (prevent abuse)
  - File upload endpoints
  - Authentication endpoints (prevent brute force)

### Premium Limits Enforcement
- Check user subscription before:
  - Creating flashcards/quizzes
  - Uploading large files
  - Using premium features
- Return appropriate error messages

---

## 📦 Cloud Functions Structure

```
functions/
├── src/
│   ├── index.ts                    # Main entry point
│   ├── auth/
│   │   ├── signup.ts
│   │   ├── signin.ts
│   │   ├── google.ts
│   │   ├── apple.ts
│   │   └── password.ts
│   ├── users/
│   │   ├── get.ts
│   │   ├── update.ts
│   │   ├── usage.ts
│   │   └── delete.ts
│   ├── flashcards/
│   │   ├── create.ts
│   │   ├── get.ts
│   │   ├── update.ts
│   │   └── delete.ts
│   ├── quizzes/
│   │   ├── create.ts
│   │   ├── get.ts
│   │   ├── update.ts
│   │   └── attempts.ts
│   ├── uploads/
│   │   ├── file.ts
│   │   ├── image.ts
│   │   └── text.ts
│   ├── generate/
│   │   ├── flashcards.ts
│   │   └── quiz.ts
│   ├── payments/
│   │   ├── create.ts
│   │   └── webhook.ts
│   ├── study/
│   │   ├── sessions.ts
│   │   └── stats.ts
│   ├── notifications/
│   │   └── manage.ts
│   ├── utils/
│   │   ├── auth.ts                 # Auth middleware
│   │   ├── firestore.ts            # Firestore helpers
│   │   ├── storage.ts              # Cloud Storage helpers
│   │   ├── ai.ts                   # AI service integration
│   │   └── payments.ts             # Payment provider helpers
│   └── triggers/
│       ├── onUserCreate.ts         # Firestore trigger
│       ├── onFileUpload.ts         # Storage trigger
│       └── onSubscriptionUpdate.ts # Firestore trigger
├── package.json
└── tsconfig.json
```

---

## 🔄 Firestore Triggers

### 1. onUserCreate
- **Trigger:** When document created in `users/`
- **Action:**
  - Initialize usage tracking for current month
  - Send welcome notification
  - Create default preferences

### 2. onFileUpload
- **Trigger:** When file uploaded to Cloud Storage
- **Action:**
  - Extract text from PDF/image
  - Create upload document in Firestore
  - Send notification when extraction complete

### 3. onSubscriptionUpdate
- **Trigger:** When user subscription changes
- **Action:**
  - Send notification about subscription change
  - Update user access permissions

### 4. onStudySessionComplete
- **Trigger:** When study session completed
- **Action:**
  - Update user streak
  - Update studyCountToday
  - Calculate and update statistics

---

## 🛠️ Environment Variables

```env
# Firebase
FIREBASE_PROJECT_ID=studibudi-prod
FIREBASE_REGION=us-central1

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Payment Providers
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYSTACK_SECRET_KEY=sk_live_...
PAYSTACK_WEBHOOK_SECRET=...

# OCR Service (if using external)
GOOGLE_CLOUD_VISION_API_KEY=...
TESSERACT_CONFIG_PATH=...

# App URLs
NEXT_PUBLIC_APP_URL=https://studibudi.com
API_BASE_URL=https://us-central1-studibudi-prod.cloudfunctions.net

# Feature Flags
ENABLE_OCR=true
ENABLE_AI_GENERATION=true
ENABLE_PAYMENTS=true
```

---

## 📋 Implementation Priority

### Phase 1: Core Infrastructure (Week 1)
1. ✅ Set up Firebase project
2. ✅ Configure Firestore database
3. ✅ Set up Cloud Storage buckets
4. ✅ Create authentication functions
5. ✅ Implement auth middleware
6. ✅ Set up basic user management

### Phase 2: Content Management (Week 2)
1. ✅ Flashcard CRUD endpoints
2. ✅ Quiz CRUD endpoints
3. ✅ File upload endpoints
4. ✅ Text extraction (PDF)
5. ✅ OCR integration (Images)

### Phase 3: AI Generation (Week 3)
1. ✅ AI service integration
2. ✅ Flashcard generation endpoint
3. ✅ Quiz generation endpoint
4. ✅ Usage tracking
5. ✅ Premium limits enforcement

### Phase 4: Study Features (Week 4)
1. ✅ Study session tracking
2. ✅ Quiz attempt submission
3. ✅ Statistics calculation
4. ✅ Streak tracking

### Phase 5: Payments (Week 5)
1. ✅ Payment provider integration
2. ✅ Subscription management
3. ✅ Webhook handling
4. ✅ Subscription status updates

### Phase 6: Polish & Optimization (Week 6)
1. ✅ Notification system
2. ✅ Error handling improvements
3. ✅ Rate limiting
4. ✅ Performance optimization
5. ✅ Security hardening

---

## 🧪 Testing Strategy

### Unit Tests
- Test individual Cloud Functions
- Mock Firebase services
- Test business logic

### Integration Tests
- Test Firestore operations
- Test Cloud Storage operations
- Test AI service integration
- Test payment webhooks

### E2E Tests
- Test complete user flows
- Test authentication flows
- Test file upload → generation flow
- Test payment flow

---

## 📝 API Documentation

### Tools
- Use OpenAPI/Swagger for API documentation
- Generate client SDKs
- Provide Postman collection

### Documentation Structure
- Authentication guide
- Endpoint reference
- Request/response examples
- Error codes reference
- Rate limits documentation

---

## 🔐 Security Checklist

- [ ] All endpoints require authentication (except public ones)
- [ ] Input validation on all endpoints
- [ ] Rate limiting implemented
- [ ] CORS properly configured
- [ ] Firestore security rules set up
- [ ] Cloud Storage security rules set up
- [ ] API keys stored securely
- [ ] Webhook signatures verified
- [ ] User data isolation enforced
- [ ] SQL injection prevention (N/A for Firestore)
- [ ] XSS prevention
- [ ] CSRF protection

---

## 📊 Monitoring & Analytics

### Cloud Functions Monitoring
- Function execution time
- Error rates
- Invocation counts
- Memory usage

### Firestore Monitoring
- Read/write operations
- Document sizes
- Query performance

### Custom Metrics
- AI generation success rate
- Payment success rate
- User engagement metrics
- Error tracking (Sentry integration)

---

**Last Updated:** December 2024
**Version:** 1.0
**Status:** Planning Phase

