"use client";

import React, { useState, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface TextPasteProps {
  onTextChange: (text: string) => void;
  initialText?: string;
  minLength?: number;
  maxLength?: number;
  isUploading?: boolean;
}

export function TextPaste({
  onTextChange,
  initialText = "",
  minLength = 50,
  maxLength = 10000,
  isUploading = false,
}: TextPasteProps) {
  const [text, setText] = useState(initialText);
  const [cleanedText, setCleanedText] = useState("");

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange(newText);
  };

  const cleanText = useCallback(() => {
    // Remove extra whitespace, normalize line breaks
    let cleaned = text
      .replace(/\r\n/g, "\n") // Normalize line breaks
      .replace(/\n{3,}/g, "\n\n") // Remove excessive line breaks
      .replace(/[ \t]+/g, " ") // Remove excessive spaces
      .trim();

    setCleanedText(cleaned);
    setText(cleaned);
    onTextChange(cleaned);
  }, [text, onTextChange]);

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const isValid = characterCount >= minLength && characterCount <= maxLength;

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="mb-4">
          <label
            htmlFor="text-input"
            className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-2"
          >
            Paste or type your study material
          </label>
          <textarea
            id="text-input"
            value={text}
            onChange={handleTextChange}
            placeholder="Paste your notes, textbook content, or any study material here..."
            className="w-full h-64 px-4 py-3 border border-neutral-gray200 dark:border-neutral-gray700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white focus:border-transparent text-neutral-gray900 dark:text-neutral-gray100 placeholder:text-neutral-gray400 dark:placeholder:text-neutral-gray500 bg-neutral-white dark:bg-neutral-gray800"
            maxLength={maxLength}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-neutral-gray600 dark:text-neutral-gray400">
            <span>
              {characterCount.toLocaleString()} / {maxLength.toLocaleString()}{" "}
              characters
            </span>
            <span>{wordCount.toLocaleString()} words</span>
            {!isValid && characterCount > 0 && (
              <span className="text-neutral-gray900 dark:text-neutral-gray100">
                {characterCount < minLength
                  ? `Minimum ${minLength} characters required`
                  : `Maximum ${maxLength} characters allowed`}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={cleanText}
            disabled={!text.trim()}
          >
            Clean Format
          </Button>
        </div>
      </Card>

      {cleanedText && cleanedText !== text && (
        <Card className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800 border border-neutral-gray200 dark:border-neutral-gray700">
          <p className="text-xs font-medium text-neutral-gray700 dark:text-neutral-gray300 mb-2">
            Cleaned Text Preview:
          </p>
          <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 line-clamp-4">
            {cleanedText.substring(0, 300)}
            {cleanedText.length > 300 && "..."}
          </p>
        </Card>
      )}

      {text && isValid && (
        <Card className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800 border border-neutral-gray200 dark:border-neutral-gray700">
          <p className="text-xs font-medium text-neutral-gray700 dark:text-neutral-gray300 mb-2">
            Text Preview:
          </p>
          <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 line-clamp-4">
            {text.substring(0, 300)}
            {text.length > 300 && "..."}
          </p>
        </Card>
      )}
    </div>
  );
}

