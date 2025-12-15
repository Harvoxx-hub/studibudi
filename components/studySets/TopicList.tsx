"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { TagIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Topic } from "@/types";

interface TopicListProps {
  topics: Topic[];
  onTopicClick?: (topic: Topic) => void;
}

export function TopicList({ topics, onTopicClick }: TopicListProps) {
  if (topics.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-gray600 dark:text-neutral-gray400">
        <p>No topics available.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic) => (
        <Card 
          key={topic.id} 
          hover 
          className={`p-4 ${onTopicClick ? 'cursor-pointer' : ''}`}
          onClick={() => onTopicClick && onTopicClick(topic)}
        >
          <div className="flex items-start gap-3">
            <TagIcon className="w-5 h-5 text-primary-black dark:text-primary-white flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-1 line-clamp-1">
                {topic.title}
              </h3>
              {topic.content && (
                <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 line-clamp-2">
                  {topic.content}
                </p>
              )}
              {topic.materialIds && topic.materialIds.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs text-neutral-gray500 dark:text-neutral-gray500">
                  <DocumentDuplicateIcon className="w-3 h-3" />
                  <span>
                    From {topic.materialIds.length} {topic.materialIds.length === 1 ? "material" : "materials"}
                  </span>
                </div>
              )}
              {onTopicClick && (
                <p className="text-xs text-primary-black dark:text-primary-white mt-2 font-medium">
                  Click to view details →
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

