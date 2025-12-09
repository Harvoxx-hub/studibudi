"use client";

import React, { useCallback, useState } from "react";
import {
  PhotoIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface ImageUploadProps {
  onImageSelect: (file: File) => void | Promise<void>;
  onImageRemove: () => void;
  image?: File | null;
  extractedText?: string;
  isUploading?: boolean;
  uploadProgress?: number;
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  image,
  extractedText,
  isUploading = false,
  uploadProgress = 0,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const acceptedTypes = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const maxSizeMB = 5;

  const validateImage = (file: File): string | null => {
    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `Image type not supported. Please upload ${acceptedTypes.join(", ")}`;
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `Image size exceeds ${maxSizeMB}MB limit`;
    }

    return null;
  };

  const handleImageSelect = useCallback(
    (selectedFile: File) => {
      const validationError = validateImage(selectedFile);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      
      onImageSelect(selectedFile);
    },
    [onImageSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleImageSelect(droppedFile);
    }
  };

  const handleImageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleImageSelect(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
  };

  if (image && preview) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg">
                <PhotoIcon className="w-6 h-6 text-primary-black dark:text-primary-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 truncate">
                    {image.name}
                  </h3>
                  {!isUploading && (
                    <CheckCircleIcon className="w-5 h-5 text-primary-black dark:text-primary-white flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                  {formatFileSize(image.size)}
                </p>
                
                {/* Upload Progress */}
                {isUploading && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-neutral-gray700 dark:text-neutral-gray300">
                        Uploading...
                      </span>
                      <span className="text-xs text-neutral-gray600 dark:text-neutral-gray400">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-neutral-gray200 dark:bg-neutral-gray700 rounded-full h-2">
                      <div
                        className="bg-primary-black dark:bg-primary-white h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            {!isUploading && (
              <button
                onClick={handleRemove}
                className="ml-4 p-2 text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="border border-neutral-gray200 dark:border-neutral-gray700 rounded-lg overflow-hidden">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full h-auto max-h-96 object-contain bg-neutral-gray50 dark:bg-neutral-gray800"
            />
          </div>

          {extractedText ? (
            <div className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700">
              <p className="text-xs font-medium text-neutral-gray700 dark:text-neutral-gray300 mb-2">
                Extracted Text (OCR):
              </p>
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 line-clamp-3">
                {extractedText.substring(0, 200)}
                {extractedText.length > 200 && "..."}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700">
              <p className="text-xs text-neutral-gray600 dark:text-neutral-gray400">
                OCR text extraction will be available after processing
              </p>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card
        className={`p-12 border-2 border-dashed transition-colors ${
          isDragging
            ? "border-primary-black dark:border-primary-white bg-neutral-gray50 dark:bg-neutral-gray800"
            : "border-neutral-gray300 dark:border-neutral-gray700 hover:border-neutral-gray400 dark:hover:border-neutral-gray600"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-neutral-gray100 dark:bg-neutral-gray800 rounded-full">
              <PhotoIcon className="w-12 h-12 text-primary-black dark:text-primary-white" />
            </div>
          </div>
          <h3 className="text-lg font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Drag and drop your image here
          </h3>
          <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-4">
            or click to browse
          </p>
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageInputChange}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload">
              <Button
                variant="outline"
                size="md"
                type="button"
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                Choose Image
              </Button>
            </label>
          </div>
          <p className="text-xs text-neutral-gray500 dark:text-neutral-gray500 mt-4">
            Supported formats: JPG, PNG, GIF, WebP (Max {maxSizeMB}MB)
          </p>
        </div>
      </Card>
      {error && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </div>
  );
}

