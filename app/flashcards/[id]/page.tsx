"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  FlashcardCard,
  FlashcardEditor,
} from "@/components/flashcards";
import {
  PlusIcon,
  PlayIcon,
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { FlashcardSet, Flashcard } from "@/types";
import { flashcardsApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function FlashcardSetPage() {
  const router = useRouter();
  const params = useParams();
  const setId = params.id as string;
  const { addNotification } = useAppStore();

  const [flashcardSet, setFlashcardSet] = useState<FlashcardSet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  useEffect(() => {
    const loadFlashcardSet = async () => {
      setIsLoading(true);
      try {
        const set = await flashcardsApi.getSet(setId);
        setFlashcardSet(set);
      } catch (error: any) {
        console.error("Failed to load flashcard set:", error);
        addNotification({
          userId: "temp",
          type: "error",
          title: "Error",
          message: error?.message || "Failed to load flashcard set",
          read: false,
        });
        router.push("/flashcards");
      } finally {
        setIsLoading(false);
      }
    };

    loadFlashcardSet();
  }, [setId]);

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card);
    setIsEditorOpen(true);
  };

  const handleCreate = () => {
    setEditingCard(null);
    setIsEditorOpen(true);
  };

  const handleSave = async (updates: Partial<Flashcard>) => {
    if (!flashcardSet) return;

    try {
      if (editingCard) {
        // Update existing card
        const updated = await flashcardsApi.updateCard(setId, editingCard.id, {
          front: updates.front,
          back: updates.back,
          isKnown: updates.isKnown,
          isBookmarked: updates.isBookmarked,
        });
        setFlashcardSet({
          ...flashcardSet,
          flashcards: flashcardSet.flashcards.map((card) =>
            card.id === editingCard.id ? updated : card
          ),
          updatedAt: new Date().toISOString(),
        });
        addNotification({
          userId: "temp",
          type: "success",
          title: "Updated",
          message: "Flashcard updated successfully",
          read: false,
        });
      } else {
        // Create new card
        if (!updates.front || !updates.back) {
          addNotification({
            userId: "temp",
            type: "error",
            title: "Error",
            message: "Front and back text are required",
            read: false,
          });
          return;
        }
        const newCard = await flashcardsApi.addCard(
          setId,
          updates.front,
          updates.back
        );
        setFlashcardSet({
          ...flashcardSet,
          flashcards: [...flashcardSet.flashcards, newCard],
          updatedAt: new Date().toISOString(),
        });
        addNotification({
          userId: "temp",
          type: "success",
          title: "Created",
          message: "Flashcard added successfully",
          read: false,
        });
      }
      setIsEditorOpen(false);
      setEditingCard(null);
    } catch (error: any) {
      console.error("Save error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to save flashcard",
        read: false,
      });
    }
  };

  const handleDelete = (cardId: string) => {
    setCardToDelete(cardId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!flashcardSet || !cardToDelete) return;

    try {
      await flashcardsApi.deleteCard(setId, cardToDelete);
      setFlashcardSet({
        ...flashcardSet,
        flashcards: flashcardSet.flashcards.filter(
          (card) => card.id !== cardToDelete
        ),
        updatedAt: new Date().toISOString(),
      });
      setIsDeleteModalOpen(false);
      setCardToDelete(null);
      addNotification({
        userId: "temp",
        type: "success",
        title: "Deleted",
        message: "Flashcard deleted successfully",
        read: false,
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to delete flashcard",
        read: false,
      });
    }
  };

  const handleBookmark = async (cardId: string, bookmarked: boolean) => {
    if (!flashcardSet) return;

    try {
      const updated = await flashcardsApi.updateCard(setId, cardId, {
        isBookmarked: bookmarked,
      });
      setFlashcardSet({
        ...flashcardSet,
        flashcards: flashcardSet.flashcards.map((card) =>
          card.id === cardId ? updated : card
        ),
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error("Bookmark error:", error);
      // Silently fail for bookmark updates
    }
  };

  if (isLoading || !flashcardSet) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              {isLoading ? "Loading flashcard set..." : "Flashcard set not found"}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                {flashcardSet.title}
              </h1>
              {flashcardSet.description && (
                <p className="text-neutral-gray600 dark:text-neutral-gray400">{flashcardSet.description}</p>
              )}
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => router.push(`/flashcards/${setId}/study`)}
              className="flex items-center gap-2"
            >
              <PlayIcon className="w-5 h-5" />
              Start Study
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
              {flashcardSet.flashcards.length}
            </p>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Total Cards</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
              {flashcardSet.flashcards.filter((c) => c.isKnown).length}
            </p>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Known</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
              {flashcardSet.flashcards.filter((c) => c.isBookmarked).length}
            </p>
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Bookmarked</p>
          </Card>
        </div>

        {/* Actions */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100">
            Flashcards ({flashcardSet.flashcards.length})
          </h2>
          <Button
            variant="outline"
            onClick={handleCreate}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            Add Card
          </Button>
        </div>

        {/* Flashcard List */}
        {flashcardSet.flashcards.length > 0 ? (
          <div className="space-y-3">
            {flashcardSet.flashcards.map((card, index) => (
              <FlashcardCard
                key={card.id}
                card={card}
                index={index}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onBookmark={handleBookmark}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-4">
              No flashcards in this set yet.
            </p>
            <Button variant="primary" onClick={handleCreate}>
              Add Your First Card
            </Button>
          </Card>
        )}

        {/* Editor Modal */}
        <FlashcardEditor
          card={editingCard}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingCard(null);
          }}
          onSave={handleSave}
          mode={editingCard ? "edit" : "create"}
        />

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setCardToDelete(null);
          }}
          title="Delete Flashcard"
        >
          <div className="space-y-4">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Are you sure you want to delete this flashcard? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setCardToDelete(null);
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
      </div>
    </DashboardLayout>
  );
}

