"use client";

import React from "react";
import { Squares2X2Icon, ListBulletIcon } from "@heroicons/react/24/outline";

type ViewMode = "grid" | "list";

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-2 p-1 bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg">
      <button
        onClick={() => onViewModeChange("grid")}
        className={`p-2 rounded transition-colors ${
          viewMode === "grid"
            ? "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black"
            : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
        }`}
        aria-label="Grid view"
      >
        <Squares2X2Icon className="w-5 h-5" />
      </button>
      <button
        onClick={() => onViewModeChange("list")}
        className={`p-2 rounded transition-colors ${
          viewMode === "list"
            ? "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black"
            : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
        }`}
        aria-label="List view"
      >
        <ListBulletIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

