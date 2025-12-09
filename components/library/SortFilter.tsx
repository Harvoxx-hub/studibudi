"use client";

import React from "react";
import { FunnelIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

export type SortOption = "date" | "title" | "subject";
export type SortOrder = "asc" | "desc";

interface SortFilterProps {
  sortBy: SortOption;
  sortOrder: SortOrder;
  onSortChange: (option: SortOption) => void;
  onSortOrderChange: (order: SortOrder) => void;
  subjects?: string[];
  selectedSubject?: string;
  onSubjectFilter?: (subject: string | undefined) => void;
}

export function SortFilter({
  sortBy,
  sortOrder,
  onSortChange,
  onSortOrderChange,
  subjects = [],
  selectedSubject,
  onSubjectFilter,
}: SortFilterProps) {
  const sortOptions: { value: SortOption; label: string }[] = [
    { value: "date", label: "Date" },
    { value: "title", label: "Title" },
    { value: "subject", label: "Subject" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Sort By */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">Sort by:</span>
        <div className="flex gap-1 bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg p-1">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                if (sortBy === option.value) {
                  onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
                } else {
                  onSortChange(option.value);
                }
              }}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                sortBy === option.value
                  ? "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black"
                  : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
              }`}
            >
              {option.label}
              {sortBy === option.value && (
                <span className="ml-1">
                  {sortOrder === "asc" ? "↑" : "↓"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Subject Filter */}
      {subjects.length > 0 && onSubjectFilter && (
        <div className="flex items-center gap-2">
          <FunnelIcon className="w-4 h-4 text-neutral-gray600 dark:text-neutral-gray400" />
          <select
            value={selectedSubject || ""}
            onChange={(e) =>
              onSubjectFilter(e.target.value || undefined)
            }
            className="px-3 py-1 text-sm border border-neutral-gray200 dark:border-neutral-gray700 rounded-lg bg-neutral-white dark:bg-neutral-gray900 text-neutral-gray900 dark:text-neutral-gray100 focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white"
          >
            <option value="">All Subjects</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

