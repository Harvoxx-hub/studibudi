"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface RenameModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  onRename: (newName: string) => void;
  type?: "flashcard" | "quiz";
}

export function RenameModal({
  isOpen,
  onClose,
  currentName,
  onRename,
  type = "flashcard",
}: RenameModalProps) {
  const [newName, setNewName] = useState(currentName);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setError("");
    }
  }, [isOpen, currentName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newName.trim();

    if (!trimmedName) {
      setError("Name cannot be empty");
      return;
    }

    if (trimmedName === currentName) {
      onClose();
      return;
    }

    onRename(trimmedName);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Rename ${type === "flashcard" ? "Flashcard Set" : "Quiz"}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
            setError("");
          }}
          error={error}
          autoFocus
        />
        <div className="flex gap-3 justify-end">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}

