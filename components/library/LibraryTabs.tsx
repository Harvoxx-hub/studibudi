"use client";

import React from "react";

type TabType = "flashcards" | "quizzes";

interface LibraryTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  flashcardCount?: number;
  quizCount?: number;
}

export function LibraryTabs({
  activeTab,
  onTabChange,
  flashcardCount = 0,
  quizCount = 0,
}: LibraryTabsProps) {
  return (
    <div className="border-b border-neutral-gray200 dark:border-neutral-gray700">
      <div className="flex gap-1">
        <button
          onClick={() => onTabChange("flashcards")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "flashcards"
              ? "text-primary-black dark:text-primary-white"
              : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
          }`}
        >
          Flashcards
          {flashcardCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-gray100 dark:bg-neutral-gray800 rounded-full">
              {flashcardCount}
            </span>
          )}
          {activeTab === "flashcards" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-black dark:bg-primary-white" />
          )}
        </button>
        <button
          onClick={() => onTabChange("quizzes")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "quizzes"
              ? "text-primary-black dark:text-primary-white"
              : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
          }`}
        >
          Quizzes
          {quizCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-neutral-gray100 dark:bg-neutral-gray800 rounded-full">
              {quizCount}
            </span>
          )}
          {activeTab === "quizzes" && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-black dark:bg-primary-white" />
          )}
        </button>
      </div>
    </div>
  );
}

