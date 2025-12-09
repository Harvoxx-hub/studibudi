"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Flashcard } from "@/types";
import { MathRenderer } from "@/components/shared/MathRenderer";

interface FlashcardEditorProps {
  card: Flashcard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: Partial<Flashcard>) => void;
  mode?: "edit" | "create";
}

export function FlashcardEditor({
  card,
  isOpen,
  onClose,
  onSave,
  mode = "edit",
}: FlashcardEditorProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  useEffect(() => {
    if (card) {
      setFront(card.front);
      setBack(card.back);
    } else {
      setFront("");
      setBack("");
    }
  }, [card, isOpen]);

  const handleSave = () => {
    if (!front.trim() || !back.trim()) {
      return;
    }

    onSave({
      front: front.trim(),
      back: back.trim(),
    });

    setFront("");
    setBack("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === "create" ? "Create Flashcard" : "Edit Flashcard"}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-gray900 mb-2">
            Front (Question/Term)
          </label>
          <input
            type="text"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            placeholder="Enter the question or term... Use $...$ for inline math or $$...$$ for display math"
            className="w-full px-4 py-3 border border-neutral-gray200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent text-neutral-gray900 placeholder:text-neutral-gray400 bg-neutral-white"
            required
          />
          {front && (
            <div className="mt-2 p-3 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700">
              <p className="text-xs text-neutral-gray500 dark:text-neutral-gray400 mb-1">Preview:</p>
              <div className="text-sm text-neutral-gray900 dark:text-neutral-gray100">
                <MathRenderer content={front} />
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-gray900 mb-2">
            Back (Answer/Definition)
          </label>
          <textarea
            value={back}
            onChange={(e) => setBack(e.target.value)}
            placeholder="Enter the answer or definition... Use $...$ for inline math or $$...$$ for display math"
            className="w-full px-4 py-3 border border-neutral-gray200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-black focus:border-transparent text-neutral-gray900 placeholder:text-neutral-gray400 bg-neutral-white"
            rows={4}
            required
          />
          {back && (
            <div className="mt-2 p-3 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700">
              <p className="text-xs text-neutral-gray500 dark:text-neutral-gray400 mb-1">Preview:</p>
              <div className="text-sm text-neutral-gray900 dark:text-neutral-gray100">
                <MathRenderer content={back} />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!front.trim() || !back.trim()}
          >
            {mode === "create" ? "Create" : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

