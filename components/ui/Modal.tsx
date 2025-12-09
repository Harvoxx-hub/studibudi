"use client";

import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "./Button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-neutral-white dark:bg-neutral-gray900 rounded-lg shadow-xl border border-neutral-gray200 dark:border-neutral-gray700 w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-neutral-gray200 dark:border-neutral-gray700">
            <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100">{title}</h2>
            <button
              onClick={onClose}
              className="text-neutral-gray400 dark:text-neutral-gray500 hover:text-neutral-gray900 dark:hover:text-neutral-gray100 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
        {footer && (
          <div className="p-6 border-t border-neutral-gray200 dark:border-neutral-gray700 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

