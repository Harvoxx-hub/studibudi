"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/dashboard";
import {
  ViewToggle,
  SearchBar,
  SortFilter,
  LibraryTabs,
  RenameModal,
} from "@/components/library";
import { FlashcardSetCard } from "@/components/library/FlashcardSetCard";
import { QuizCard } from "@/components/quiz";
import {
  PlusIcon,
  BookOpenIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { FlashcardSet, Quiz } from "@/types";
import { flashcardsApi, quizzesApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import type { SortOption, SortOrder } from "@/components/library/SortFilter";

type TabType = "flashcards" | "quizzes";
type ViewMode = "grid" | "list";

export default function LibraryPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabType>("flashcards");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>();
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    type: "flashcard" | "quiz";
    id: string;
    title: string;
  } | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{
    type: "flashcard" | "quiz";
    id: string;
    currentName: string;
  } | null>(null);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [setsResponse, quizzesResponse] = await Promise.all([
          flashcardsApi.listSets({
            limit: 100,
            sortBy: sortBy === "date" ? "date" : sortBy === "title" ? "title" : "subject",
            sortOrder,
            ...(selectedSubject && { subject: selectedSubject }),
            ...(searchQuery && { search: searchQuery }),
          }),
          quizzesApi.list({
            limit: 100,
            sortBy: sortBy === "date" ? "date" : sortBy === "title" ? "title" : "subject",
            sortOrder,
            ...(selectedSubject && { subject: selectedSubject }),
            ...(searchQuery && { search: searchQuery }),
          }),
        ]);
        setFlashcardSets(setsResponse.sets);
        setQuizzes(quizzesResponse.quizzes);
      } catch (error: any) {
        console.error("Failed to load data:", error);
        addNotification({
          userId: "temp",
          type: "error",
          title: "Error",
          message: error?.message || "Failed to load study materials",
          read: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, selectedSubject, searchQuery]);

  // Get unique subjects
  const subjects = useMemo(() => {
    const allSubjects = new Set<string>();
    flashcardSets.forEach((set) => {
      if (set.subject) allSubjects.add(set.subject);
    });
    quizzes.forEach((quiz) => {
      if (quiz.subject) allSubjects.add(quiz.subject);
    });
    return Array.from(allSubjects).sort();
  }, [flashcardSets, quizzes]);

  // Display data (filtering and sorting is now done by the API)
  const displayData = useMemo(() => {
    const data =
      activeTab === "flashcards"
        ? flashcardSets.map((set) => ({
            type: "flashcard" as const,
            item: set,
            title: set.title,
            subject: set.subject,
            date: new Date(set.updatedAt).getTime(),
          }))
        : quizzes.map((quiz) => ({
            type: "quiz" as const,
            item: quiz,
            title: quiz.title,
            subject: quiz.subject,
            date: new Date(quiz.updatedAt).getTime(),
          }));

    return data;
  }, [activeTab, flashcardSets, quizzes]);

  const handleDelete = (type: "flashcard" | "quiz", id: string, title: string) => {
    setItemToDelete({ type, id, title });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === "flashcard") {
        await flashcardsApi.deleteSet(itemToDelete.id);
        setFlashcardSets(flashcardSets.filter((s) => s.id !== itemToDelete.id));
        addNotification({
          userId: "temp",
          type: "success",
          title: "Deleted",
          message: "Flashcard set deleted successfully",
          read: false,
        });
      } else {
        await quizzesApi.delete(itemToDelete.id);
        setQuizzes(quizzes.filter((q) => q.id !== itemToDelete.id));
        addNotification({
          userId: "temp",
          type: "success",
          title: "Deleted",
          message: "Quiz deleted successfully",
          read: false,
        });
      }
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to delete item",
        read: false,
      });
    }
  };

  const handleRename = (type: "flashcard" | "quiz", id: string, currentName: string) => {
    setItemToRename({ type, id, currentName });
    setRenameModalOpen(true);
  };

  const confirmRename = async (newName: string) => {
    if (!itemToRename) return;

    try {
      if (itemToRename.type === "flashcard") {
        const updated = await flashcardsApi.updateSet(itemToRename.id, {
          title: newName,
        });
        setFlashcardSets(
          flashcardSets.map((s) => (s.id === itemToRename.id ? updated : s))
        );
        addNotification({
          userId: "temp",
          type: "success",
          title: "Renamed",
          message: "Flashcard set renamed successfully",
          read: false,
        });
      } else {
        const updated = await quizzesApi.update(itemToRename.id, {
          title: newName,
        });
        setQuizzes(
          quizzes.map((q) => (q.id === itemToRename.id ? updated : q))
        );
        addNotification({
          userId: "temp",
          type: "success",
          title: "Renamed",
          message: "Quiz renamed successfully",
          read: false,
        });
      }
      setRenameModalOpen(false);
      setItemToRename(null);
    } catch (error: any) {
      console.error("Rename error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to rename item",
        read: false,
      });
    }
  };

  const displayItems = displayData;
  const isEmpty = displayItems.length === 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
              Study Library
            </h1>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Organize and manage your study materials
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => router.push("/upload")}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create New
          </Button>
        </div>

        {/* Tabs */}
        <LibraryTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          flashcardCount={flashcardSets.length}
          quizCount={quizzes.length}
        />

        {/* Controls */}
        <div className="mt-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={`Search ${activeTab}...`}
            />
          </div>
          <div className="flex items-center gap-4">
            <SortFilter
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={setSortBy}
              onSortOrderChange={setSortOrder}
              subjects={subjects}
              selectedSubject={selectedSubject}
              onSubjectFilter={setSelectedSubject}
            />
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Results Count */}
        {!isEmpty && (
          <div className="mb-4 text-sm text-neutral-gray600 dark:text-neutral-gray400">
            Showing {displayItems.length}{" "}
            {displayItems.length === 1
              ? activeTab === "flashcards"
                ? "flashcard set"
                : "quiz"
              : activeTab === "flashcards"
              ? "flashcard sets"
              : "quizzes"}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Loading...
            </p>
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={
              activeTab === "flashcards" ? (
                <BookOpenIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />
              ) : (
                <DocumentTextIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />
              )
            }
            title={`No ${activeTab} found`}
            description={
              searchQuery || selectedSubject
                ? `No ${activeTab} match your search criteria. Try adjusting your filters.`
                : `You haven't created any ${activeTab} yet. Get started by uploading content and generating study materials.`
            }
            actionLabel="Create New"
            onAction={() => router.push("/upload")}
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {displayItems.map((data) => {
              if (data.type === "flashcard") {
                const set = data.item as FlashcardSet;
                return (
                  <FlashcardSetCard
                    key={set.id}
                    set={set}
                    viewMode={viewMode}
                    onView={() => router.push(`/flashcards/${set.id}`)}
                    onStudy={() => router.push(`/flashcards/${set.id}/study`)}
                    onRename={() => handleRename("flashcard", set.id, set.title)}
                    onDelete={() => handleDelete("flashcard", set.id, set.title)}
                  />
                );
              } else {
                const quiz = data.item as Quiz;
                return (
                  <QuizCard
                    key={quiz.id}
                    quiz={quiz}
                    onAttempt={() => router.push(`/quizzes/${quiz.id}/take`)}
                    onDelete={() => handleDelete("quiz", quiz.id, quiz.title)}
                  />
                );
              }
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          title="Delete Item"
        >
          <div className="space-y-4">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Are you sure you want to delete "{itemToDelete?.title}"? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                className="bg-neutral-gray900 hover:bg-neutral-gray800"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>

        {/* Rename Modal */}
        {itemToRename && (
          <RenameModal
            isOpen={renameModalOpen}
            onClose={() => {
              setRenameModalOpen(false);
              setItemToRename(null);
            }}
            currentName={itemToRename.currentName}
            onRename={confirmRename}
            type={itemToRename.type}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

