"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FolderIcon, PlusIcon } from "@heroicons/react/24/outline";
import { StudySet } from "@/types";
import { studySetsApi } from "@/lib/api";
import { CreateStudySetModal } from "@/components/library";

interface StudySetSelectorProps {
  selectedStudySetId: string | null;
  onSelect: (studySetId: string) => void;
  required?: boolean;
}

export function StudySetSelector({
  selectedStudySetId,
  onSelect,
  required = true,
}: StudySetSelectorProps) {
  const [studySets, setStudySets] = useState<StudySet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const loadStudySets = async () => {
      try {
        const response = await studySetsApi.list({ limit: 100 });
        setStudySets(response.studySets);
      } catch (error) {
        console.error("Failed to load study sets:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudySets();
  }, []);

  const handleCreateStudySet = async (title: string, description?: string) => {
    try {
      const newStudySet = await studySetsApi.create(title, description);
      setStudySets([newStudySet, ...studySets]);
      onSelect(newStudySet.id);
      setIsCreateModalOpen(false);
    } catch (error) {
      throw error;
    }
  };

  const selectedStudySet = studySets.find((s) => s.id === selectedStudySetId);

  if (isLoading) {
    return (
      <Card className="p-4">
        <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
          Loading study sets...
        </p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100">
          Study Set {required && <span className="text-red-500">*</span>}
        </label>
        <p className="text-xs text-neutral-gray600 dark:text-neutral-gray400 mb-3">
          Select a study set to organize this material, or create a new one.
        </p>

        {selectedStudySet ? (
          <Card className="p-4 border-2 border-primary-black dark:border-primary-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderIcon className="w-5 h-5 text-primary-black dark:text-primary-white" />
                <div>
                  <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                    {selectedStudySet.title}
                  </h3>
                  {selectedStudySet.description && (
                    <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                      {selectedStudySet.description}
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect("")}
              >
                Change
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            <select
              className="w-full px-4 py-2 border-2 border-neutral-gray300 dark:border-neutral-gray700 rounded-lg text-neutral-gray900 dark:text-neutral-gray100 bg-primary-white dark:bg-neutral-gray900 focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white focus:border-transparent"
              value={selectedStudySetId || ""}
              onChange={(e) => {
                if (e.target.value) {
                  onSelect(e.target.value);
                }
              }}
            >
              <option value="">Select a study set...</option>
              {studySets.map((studySet) => (
                <option key={studySet.id} value={studySet.id}>
                  {studySet.title}
                </option>
              ))}
            </select>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create New Study Set
            </Button>
          </div>
        )}
      </div>

      <CreateStudySetModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateStudySet}
      />
    </>
  );
}

