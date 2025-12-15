"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import {
  DocumentTextIcon,
  PhotoIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { Upload } from "@/types";

interface MaterialListProps {
  materials: Upload[];
}

export function MaterialList({ materials }: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-gray600 dark:text-neutral-gray400">
        <p>No materials available.</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "document":
        return <DocumentIcon className="w-5 h-5" />;
      case "image":
        return <PhotoIcon className="w-5 h-5" />;
      case "text":
        return <DocumentTextIcon className="w-5 h-5" />;
      default:
        return <DocumentTextIcon className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "pdf":
        return "PDF";
      case "document":
        return "Document";
      case "image":
        return "Image";
      case "text":
        return "Text";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-3">
      {materials.map((material) => (
        <Card key={material.id} hover className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-primary-black dark:text-primary-white flex-shrink-0">
                {getIcon(material.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-1 line-clamp-1">
                  {material.fileName || `Material ${material.id.slice(0, 8)}`}
                </h3>
                <div className="flex items-center gap-3 text-sm text-neutral-gray600 dark:text-neutral-gray400">
                  <span className="px-2 py-1 bg-neutral-gray100 dark:bg-neutral-gray800 rounded text-xs">
                    {getTypeLabel(material.type)}
                  </span>
                  {material.status && (
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        material.status === "completed"
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200"
                          : material.status === "processing"
                          ? "bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200"
                          : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200"
                      }`}
                    >
                      {material.status}
                    </span>
                  )}
                  {material.createdAt && (
                    <span>{formatDate(material.createdAt)}</span>
                  )}
                </div>
              </div>
            </div>
            {material.extractedText && material.extractedText.length > 0 && (
              <div className="text-xs text-neutral-gray500 dark:text-neutral-gray500">
                {material.extractedText.length.toLocaleString()} chars
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

