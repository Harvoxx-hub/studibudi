"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/dashboard";
import {
  DocumentTextIcon,
  PhotoIcon,
  TrashIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { Upload } from "@/types";
import { uploadsApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

export default function UploadsPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "pdf" | "text" | "image">("all");

  useEffect(() => {
    loadUploads();
  }, [filterType]);

  const loadUploads = async () => {
    setIsLoading(true);
    try {
      const params: { limit?: number; offset?: number; type?: "pdf" | "text" | "image" } = {
        limit: 50,
      };
      if (filterType !== "all") {
        params.type = filterType;
      }
      const response = await uploadsApi.list(params);
      setUploads(response.uploads);
    } catch (error: any) {
      console.error("Failed to load uploads:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to load uploads",
        read: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (uploadId: string) => {
    setUploadToDelete(uploadId);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!uploadToDelete) return;

    try {
      await uploadsApi.delete(uploadToDelete);
      setUploads(uploads.filter((u) => u.id !== uploadToDelete));
      setDeleteModalOpen(false);
      setUploadToDelete(null);
      addNotification({
        userId: "temp",
        type: "success",
        title: "Deleted",
        message: "Upload deleted successfully",
        read: false,
      });
    } catch (error: any) {
      console.error("Delete error:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to delete upload",
        read: false,
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <DocumentTextIcon className="w-5 h-5" />;
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
        return "PDF/Document";
      case "image":
        return "Image";
      case "text":
        return "Text";
      default:
        return type;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                Upload History
              </h1>
              <p className="text-neutral-gray600 dark:text-neutral-gray400">
                View and manage your uploaded files and text
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push("/upload")}
              className="flex items-center gap-2"
            >
              <DocumentTextIcon className="w-5 h-5" />
              New Upload
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={filterType === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          <Button
            variant={filterType === "pdf" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterType("pdf")}
          >
            PDF/Documents
          </Button>
          <Button
            variant={filterType === "image" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterType("image")}
          >
            Images
          </Button>
          <Button
            variant={filterType === "text" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterType("text")}
          >
            Text
          </Button>
        </div>

        {/* Uploads List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Loading uploads...
            </p>
          </div>
        ) : uploads.length === 0 ? (
          <EmptyState
            icon={
              <DocumentTextIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />
            }
            title="No Uploads Yet"
            description={
              filterType !== "all"
                ? `No ${getTypeLabel(filterType).toLowerCase()} uploads found.`
                : "You haven't uploaded any files or text yet. Get started by uploading content to generate study materials."
            }
            actionLabel="Upload Content"
            onAction={() => router.push("/upload")}
          />
        ) : (
          <div className="space-y-4">
            {uploads.map((upload) => (
              <Card key={upload.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg">
                      {getTypeIcon(upload.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium px-2 py-1 bg-neutral-gray100 dark:bg-neutral-gray800 rounded">
                          {getTypeLabel(upload.type)}
                        </span>
                        <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                          {formatDate(upload.createdAt)}
                        </span>
                      </div>
                      {upload.extractedText && (
                        <div className="mt-3 p-4 bg-neutral-gray50 dark:bg-neutral-gray800 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700">
                          <p className="text-xs font-medium text-neutral-gray700 dark:text-neutral-gray300 mb-2">
                            Extracted Text:
                          </p>
                          <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 line-clamp-3">
                            {upload.extractedText.substring(0, 300)}
                            {upload.extractedText.length > 300 && "..."}
                          </p>
                        </div>
                      )}
                      {upload.fileUrl && (
                        <a
                          href={upload.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 text-sm text-primary-black dark:text-primary-white hover:underline inline-block"
                        >
                          View File
                        </a>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(upload.id)}
                    className="ml-4 p-2 text-neutral-gray600 dark:text-neutral-gray400 hover:text-status-error dark:hover:text-red-400 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setUploadToDelete(null);
          }}
          title="Delete Upload"
        >
          <div className="space-y-4">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Are you sure you want to delete this upload? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setUploadToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={confirmDelete}
                className="bg-neutral-gray900 hover:bg-neutral-gray800"
              >
                Delete
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

