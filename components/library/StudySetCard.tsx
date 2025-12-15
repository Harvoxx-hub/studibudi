"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  PencilIcon,
  TrashIcon,
  FolderIcon,
  DocumentTextIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { StudySet } from "@/types";

interface StudySetCardProps {
  studySet: StudySet;
  viewMode?: "grid" | "list";
  onView?: () => void;
  onRename?: () => void;
  onDelete?: () => void;
}

export function StudySetCard({
  studySet,
  viewMode = "grid",
  onView,
  onRename,
  onDelete,
}: StudySetCardProps) {
  const materialCount = studySet.materialCount ?? studySet.materials?.length ?? 0;
  const topicCount = studySet.topicCount ?? studySet.topics?.length ?? 0;

  if (viewMode === "list") {
    return (
      <Card hover className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-1">
              {studySet.title}
            </h3>
            {studySet.description && (
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-2 line-clamp-1">
                {studySet.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-sm text-neutral-gray600 dark:text-neutral-gray400">
              <span className="flex items-center gap-1">
                <DocumentTextIcon className="w-4 h-4" />
                {materialCount} {materialCount === 1 ? "material" : "materials"}
              </span>
              <span className="flex items-center gap-1">
                <TagIcon className="w-4 h-4" />
                {topicCount} {topicCount === 1 ? "topic" : "topics"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onView && (
              <Button variant="outline" size="sm" onClick={onView}>
                View
              </Button>
            )}
            {onRename && (
              <button
                onClick={onRename}
                className="p-2 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="p-2 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  // Grid view
  return (
    <Card hover className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <FolderIcon className="w-5 h-5 text-primary-black dark:text-primary-white flex-shrink-0" />
            <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 line-clamp-1">
              {studySet.title}
            </h3>
          </div>
          {studySet.description && (
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-3 line-clamp-2">
              {studySet.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {onRename && (
            <button
              onClick={onRename}
              className="p-1.5 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors text-neutral-gray600 dark:text-neutral-gray400"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 text-neutral-gray600 dark:text-neutral-gray400">
            <DocumentTextIcon className="w-4 h-4" />
            {materialCount} {materialCount === 1 ? "material" : "materials"}
          </span>
          <span className="flex items-center gap-1 text-neutral-gray600 dark:text-neutral-gray400">
            <TagIcon className="w-4 h-4" />
            {topicCount} {topicCount === 1 ? "topic" : "topics"}
          </span>
        </div>

        {onView && (
          <Button
            variant="primary"
            size="sm"
            onClick={onView}
            className="w-full"
          >
            View Study Set
          </Button>
        )}
      </div>
    </Card>
  );
}

