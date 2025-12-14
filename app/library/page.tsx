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
  StudySetCard,
  CreateStudySetModal,
  RenameModal,
} from "@/components/library";
import {
  PlusIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { StudySet } from "@/types";
import { studySetsApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";
import type { SortOption, SortOrder } from "@/components/library/SortFilter";

type ViewMode = "grid" | "list";

export default function LibraryPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [itemToRename, setItemToRename] = useState<{
    id: string;
    currentName: string;
  } | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Load Study Sets from API
  useEffect(() => {
    const loadStudySets = async () => {
      setIsLoading(true);
      try {
        const response = await studySetsApi.list({
          limit: 100,
          sortBy: sortBy === "date" ? "date" : "title",
          sortOrder,
          ...(searchQuery && { search: searchQuery }),
        });
        setStudySets(response.studySets);
      } catch (error: any) {
        console.error("Failed to load study sets:", error);
        addNotification({
          userId: "temp",
          type: "error",
          title: "Error",
          message: error?.message || "Failed to load study sets",
          read: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStudySets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortBy, sortOrder, searchQuery]);

  // Handle create Study Set
  const handleCreateStudySet = async (title: string, description?: string) => {
    try {
      const newStudySet = await studySetsApi.create(title, description);
      setStudySets([newStudySet, ...studySets]);
      addNotification({
        userId: "temp",
        type: "success",
        title: "Created",
        message: "Study set created successfully",
        read: false,
      });
    } catch (error: any) {
      throw error;
    }
  };

  // Handle delete Study Set
  const handleDelete = (id: string, title: string) => {
    setItemToDelete({ id, title });
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await studySetsApi.delete(itemToDelete.id);
      setStudySets(studySets.filter((s) => s.id !== itemToDelete.id));
      addNotification({
        userId: "temp",
        type: "success",
        title: "Deleted",
        message: "Study set deleted successfully",
        read: false,
      });
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error("Delete error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to delete study set",
        read: false,
      });
    }
  };

  // Handle rename Study Set
  const handleRename = (id: string, currentName: string) => {
    setItemToRename({ id, currentName });
    setRenameModalOpen(true);
  };

  const confirmRename = async (newName: string) => {
    if (!itemToRename) return;

    try {
      const updated = await studySetsApi.update(itemToRename.id, {
        title: newName,
      });
      setStudySets(
        studySets.map((s) => (s.id === itemToRename.id ? updated : s))
      );
      addNotification({
        userId: "temp",
        type: "success",
        title: "Renamed",
        message: "Study set renamed successfully",
        read: false,
      });
      setRenameModalOpen(false);
      setItemToRename(null);
    } catch (error: any) {
      console.error("Rename error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to rename study set",
        read: false,
      });
    }
  };

  // Filter Study Sets client-side (since API search might not be perfect)
  const filteredStudySets = useMemo(() => {
    if (!searchQuery) return studySets;
    const query = searchQuery.toLowerCase();
    return studySets.filter(
      (set) =>
        set.title.toLowerCase().includes(query) ||
        set.description?.toLowerCase().includes(query)
    );
  }, [studySets, searchQuery]);

  const isEmpty = filteredStudySets.length === 0;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
              Study Sets
            </h1>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Organize and manage your course study materials
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Create Study Set
          </Button>
        </div>

        {/* Controls */}
        <div className="mt-6 mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 w-full sm:max-w-md">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search study sets..."
            />
          </div>
          <div className="flex items-center gap-4">
            <SortFilter
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={setSortBy}
              onSortOrderChange={setSortOrder}
              subjects={[]}
              selectedSubject={undefined}
              onSubjectFilter={() => {}}
            />
            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* Results Count */}
        {!isEmpty && (
          <div className="mb-4 text-sm text-neutral-gray600 dark:text-neutral-gray400">
            Showing {filteredStudySets.length}{" "}
            {filteredStudySets.length === 1 ? "study set" : "study sets"}
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
              <FolderIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />
            }
            title="No study sets found"
            description={
              searchQuery
                ? "No study sets match your search criteria. Try adjusting your search."
                : "You haven't created any study sets yet. Create one to start organizing your study materials."
            }
            actionLabel="Create Study Set"
            onAction={() => setCreateModalOpen(true)}
          />
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredStudySets.map((studySet) => (
              <StudySetCard
                key={studySet.id}
                studySet={studySet}
                viewMode={viewMode}
                onView={() => router.push(`/study-sets/${studySet.id}`)}
                onRename={() => handleRename(studySet.id, studySet.title)}
                onDelete={() => handleDelete(studySet.id, studySet.title)}
              />
            ))}
          </div>
        )}

        {/* Create Study Set Modal */}
        <CreateStudySetModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onCreate={handleCreateStudySet}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setItemToDelete(null);
          }}
          title="Delete Study Set"
        >
          <div className="space-y-4">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Are you sure you want to delete "{itemToDelete?.title}"? This
              action cannot be undone and will delete all materials and topics
              in this study set.
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
            type="study-set"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
