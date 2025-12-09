"use client";

import React from "react";
import { Button } from "@/components/ui/Button";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="bg-neutral-white dark:bg-neutral-gray900 rounded-lg p-12 text-center border border-neutral-gray200 dark:border-neutral-gray700">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">{title}</h3>
      <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

