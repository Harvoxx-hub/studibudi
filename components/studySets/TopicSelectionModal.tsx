"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { TagIcon } from "@heroicons/react/24/outline";
import { Topic } from "@/types";

interface TopicSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  topics: Topic[];
  onGenerate: (selectedTopicIds: string[]) => Promise<void>;
  mode: "flashcards" | "quiz";
}

export function TopicSelectionModal({
  isOpen,
  onClose,
  topics,
  onGenerate,
  mode,
}: TopicSelectionModalProps) {
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Select all topics by default
      setSelectedTopicIds(new Set(topics.map((t) => t.id)));
    }
  }, [isOpen, topics]);

  const toggleTopic = (topicId: string) => {
    const newSelected = new Set(selectedTopicIds);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopicIds(newSelected);
  };

  const handleGenerate = async () => {
    if (selectedTopicIds.size === 0) {
      return;
    }
    setIsGenerating(true);
    try {
      await onGenerate(Array.from(selectedTopicIds));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedTopicIds.size === topics.length) {
      setSelectedTopicIds(new Set());
    } else {
      setSelectedTopicIds(new Set(topics.map((t) => t.id)));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Generate ${mode === "flashcards" ? "Flashcards" : "Quiz"} from Topics`}
    >
      <div className="space-y-4">
        <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
          Select one or more topics to generate {mode === "flashcards" ? "flashcards" : "a quiz"} from.
        </p>

        <div className="flex items-center justify-between mb-4">
          <Button variant="outline" size="sm" onClick={handleSelectAll}>
            {selectedTopicIds.size === topics.length ? "Deselect All" : "Select All"}
          </Button>
          <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
            {selectedTopicIds.size} of {topics.length} selected
          </span>
        </div>

        <div className="max-h-96 overflow-y-auto space-y-2">
          {topics.map((topic) => {
            const isSelected = selectedTopicIds.has(topic.id);
            return (
              <Card
                key={topic.id}
                hover
                onClick={() => toggleTopic(topic.id)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "border-2 border-primary-black dark:border-primary-white bg-neutral-gray50 dark:bg-neutral-gray800"
                    : "border-2 border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleTopic(topic.id)}
                    className="mt-1 w-4 h-4 text-primary-black dark:text-primary-white border-neutral-gray300 dark:border-neutral-gray600 rounded focus:ring-primary-black dark:focus:ring-primary-white"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <TagIcon className="w-4 h-4 text-primary-black dark:text-primary-white" />
                      <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                        {topic.title}
                      </h3>
                    </div>
                    {topic.content && (
                      <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 line-clamp-2">
                        {topic.content}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end pt-4 border-t border-neutral-gray200 dark:border-neutral-gray700">
          <Button variant="outline" onClick={onClose} disabled={isGenerating}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={isGenerating || selectedTopicIds.size === 0}
          >
            {isGenerating
              ? "Generating..."
              : `Generate ${mode === "flashcards" ? "Flashcards" : "Quiz"}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

