# Study Sets Feature - Implementation Plan

## Overview

The Study Sets feature transforms the upload and generation flow into a more organized, course-based system. Users create Study Sets (like "K101", "Biology 101") that act as containers for multiple materials, with automatic topic extraction and selective generation capabilities.

## Core Concepts

### 1. Study Set
A Study Set is a container representing a course or subject (e.g., "K101", "Biology 101", "Chemistry 201"). It:
- Contains multiple uploaded materials (PDFs, images, text)
- Has automatically extracted topics from all materials
- Allows generation of multiple flashcard sets and quizzes from different topic combinations
- Acts as the primary organizational unit for study materials

### 2. Topics
Topics are automatically extracted from uploaded materials using AI:
- Extracted after text extraction completes
- Organized and cleaned for optimal AI processing
- Displayed as a list on the Study Set page
- Selectable for generation (users can choose which topics to generate from)

### 3. Materials
Materials are uploaded files/content linked to a Study Set:
- PDFs, images (OCR), or pasted text
- Each material contributes to the Study Set's topic list
- Text is extracted and optimized for AI processing
- Materials accumulate over time in a Study Set

## User Flow

### Flow 1: Creating a Study Set
1. User navigates to "Study Sets" (formerly "Library")
2. Clicks "Create New Study Set"
3. Enters Study Set name (e.g., "K101")
4. Optionally adds description
5. Study Set is created and ready for materials

### Flow 2: Uploading Materials to Study Set
1. User selects or creates a Study Set
2. Uploads material (PDF/image/text)
3. System extracts text from material
4. **NEW**: System automatically extracts topics from extracted text
5. Material is linked to Study Set
6. Topics are added to Study Set's topic list
7. User can continue adding more materials

### Flow 3: Viewing Study Set
1. User navigates to Study Set detail page
2. Sees:
   - List of all extracted topics
   - All uploaded materials
   - Material count
   - Topic count
   - Last updated date
3. Can add more materials
4. Can generate flashcards or quizzes

### Flow 4: Generating from Study Set
1. User views Study Set
2. Clicks "Generate Flashcards" or "Generate Quiz"
3. **NEW**: Topic selection modal appears
4. User selects one or more topics
5. System combines content from selected topics
6. Generates flashcards/quiz from selected topics only
7. Can generate multiple flashcard sets from same Study Set (different topic combinations)

## Data Models

### Study Set
```typescript
interface StudySet {
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
```

### Topic
```typescript
interface Topic {
  id: string;
  title: string; // e.g., "Cell Structure", "Photosynthesis"
  studySetId: string;
  materialIds: string[]; // Which materials contributed to this topic
  content: string; // Optimized/cleaned content for this topic
  createdAt: string;
  updatedAt: string;
}
```

### Upload (Updated)
```typescript
interface Upload {
  id: string;
  userId: string;
  studySetId: string; // NEW: Links upload to Study Set
  type: "pdf" | "text" | "image";
  fileUrl?: string;
  extractedText: string;
  topics?: string[]; // NEW: Topic IDs extracted from this material
  createdAt: string;
  status?: "processing" | "completed" | "failed";
}
```

## API Endpoints

### Study Sets
- `POST /api/study-sets` - Create new Study Set
- `GET /api/study-sets` - List user's Study Sets
- `GET /api/study-sets/:id` - Get Study Set with materials and topics
- `PATCH /api/study-sets/:id` - Update Study Set (title, description)
- `DELETE /api/study-sets/:id` - Delete Study Set

### Topics
- `GET /api/study-sets/:id/topics` - Get all topics for a Study Set
- `POST /api/study-sets/:id/topics/extract` - Trigger topic extraction (usually automatic)
- `PATCH /api/topics/:id` - Update topic (manual edits)
- `DELETE /api/topics/:id` - Delete topic

### Materials (Updated)
- `POST /api/uploads` - Upload material (now requires `studySetId`)
- `GET /api/study-sets/:id/materials` - Get all materials in Study Set

### Generation (Updated)
- `POST /api/generate/flashcards` - Generate flashcards (now accepts `studySetId` and `topicIds[]`)
- `POST /api/generate/quiz` - Generate quiz (now accepts `studySetId` and `topicIds[]`)

## Implementation Phases

### Phase 1: Data Models & Backend
1. Update TypeScript types
2. Create Study Set API endpoints
3. Create Topic API endpoints
4. Update Upload model to include `studySetId`
5. Update generation endpoints to accept `studySetId` and `topicIds`

### Phase 2: Topic Extraction
1. Create AI service for topic extraction
2. Implement topic extraction after text extraction
3. Store topics in database
4. Link topics to materials

### Phase 3: UI - Study Sets List
1. Rename "Library" to "Study Sets"
2. Update library page to show Study Sets instead of flashcard sets/quizzes
3. Add "Create Study Set" functionality
4. Display Study Set cards with material/topic counts

### Phase 4: UI - Study Set Detail
1. Create Study Set detail page (`/study-sets/[id]`)
2. Display topics list
3. Display materials list
4. Add "Upload Material" button
5. Add "Generate" buttons

### Phase 5: UI - Upload Flow Update
1. Update upload page to require Study Set selection
2. Link uploads to Study Set
3. Show topic extraction progress
4. Update success flow

### Phase 6: UI - Topic Selection for Generation
1. Create topic selection modal/component
2. Multi-select topic functionality
3. Update generation flow to use selected topics
4. Show generation progress

### Phase 7: Integration & Testing
1. End-to-end flow testing
2. Error handling
3. Loading states
4. Edge cases (empty Study Sets, no topics, etc.)

## UI Components Needed

1. **StudySetCard** - Card component for Study Set list
2. **StudySetDetail** - Main detail page component
3. **TopicList** - List of topics with selection capability
4. **MaterialList** - List of uploaded materials
5. **TopicSelectionModal** - Modal for selecting topics before generation
6. **CreateStudySetModal** - Modal for creating new Study Set
7. **StudySetSelector** - Component for selecting Study Set during upload

## Key Features

### Automatic Topic Extraction
- After text extraction, AI analyzes content
- Extracts main topics/themes
- Organizes content by topic
- Cleans and optimizes content for generation

### Selective Generation
- Users can select specific topics
- Generate multiple flashcard sets from one Study Set
- Each generation uses only selected topic content
- Maintains relationship between Study Set and generated content

### Material Management
- View all materials in Study Set
- See which materials contributed to which topics
- Add materials over time
- Remove materials (with topic cleanup)

## Migration Strategy

### Existing Data
- Existing flashcard sets can remain as-is
- Optionally allow users to convert flashcard sets to Study Sets
- Existing uploads without Study Sets can be migrated to a "Default" Study Set

### Backward Compatibility
- Keep existing generation endpoints working
- Add new Study Set endpoints alongside
- Gradually migrate users to new flow

## Success Metrics

- Users create Study Sets for their courses
- Multiple materials per Study Set
- Topic extraction accuracy
- Generation from selected topics works correctly
- Multiple flashcard sets generated from same Study Set

## Future Enhancements

1. **Topic Merging** - Merge similar topics
2. **Manual Topic Editing** - Users can edit/rename topics
3. **Topic Hierarchies** - Sub-topics within topics
4. **Study Set Templates** - Pre-configured Study Sets for common courses
5. **Collaboration** - Share Study Sets with classmates
6. **Study Set Analytics** - Track progress across Study Set materials
