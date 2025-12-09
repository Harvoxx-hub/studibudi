"use client";

import React from "react";

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

export function QuickActionButton({ icon, label, onClick }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center p-6 bg-neutral-white dark:bg-neutral-gray900 rounded-xl border border-neutral-gray200 dark:border-neutral-gray700 hover:border-primary-black dark:hover:border-primary-white hover:bg-neutral-gray50 dark:hover:bg-neutral-gray800 transition-all duration-200 hover:scale-105"
    >
      <div className="mb-2 text-primary-black dark:text-primary-white">{icon}</div>
      <span className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100">{label}</span>
    </button>
  );
}

