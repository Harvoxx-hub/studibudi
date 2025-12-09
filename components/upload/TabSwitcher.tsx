"use client";

import React from "react";

interface TabSwitcherProps {
  activeTab: "pdf" | "text" | "image";
  onTabChange: (tab: "pdf" | "text" | "image") => void;
}

export function TabSwitcher({ activeTab, onTabChange }: TabSwitcherProps) {
  const tabs = [
    { id: "pdf" as const, label: "PDF Upload" },
    { id: "text" as const, label: "Text Paste" },
    { id: "image" as const, label: "Image Upload" },
  ];

  return (
    <div className="flex gap-2 border-b border-neutral-gray200 dark:border-neutral-gray700 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === tab.id
              ? "text-primary-black dark:text-primary-white"
              : "text-neutral-gray600 dark:text-neutral-gray400 hover:text-neutral-gray900 dark:hover:text-neutral-gray100"
          }`}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-black dark:bg-primary-white" />
          )}
        </button>
      ))}
    </div>
  );
}

