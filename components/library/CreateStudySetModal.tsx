"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CreateStudySetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (title: string, description?: string) => Promise<void>;
}

export function CreateStudySetModal({
  isOpen,
  onClose,
  onCreate,
}: CreateStudySetModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await onCreate(title.trim(), description.trim() || undefined);
      // Reset form
      setTitle("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to create study set");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      setTitle("");
      setDescription("");
      setError(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Study Set">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., K101, Biology 101"
            disabled={isCreating}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description for this study set..."
            disabled={isCreating}
            rows={3}
            className="w-full px-3 py-2 border-2 border-neutral-gray300 dark:border-neutral-gray700 rounded-lg bg-primary-white dark:bg-neutral-gray900 text-neutral-gray900 dark:text-neutral-gray100 focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            disabled={isCreating || !title.trim()}
          >
            {isCreating ? "Creating..." : "Create Study Set"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

