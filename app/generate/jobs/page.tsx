"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/dashboard";
import {
  LightBulbIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { generateApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

type JobStatus = "pending" | "processing" | "completed" | "failed";

export default function GenerationJobsPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<JobStatus | "all">("all");

  useEffect(() => {
    loadJobs();
  }, [filterStatus]);

  const loadJobs = async () => {
    setIsLoading(true);
    try {
      const params: {
        limit?: number;
        offset?: number;
        status?: JobStatus;
      } = {
        limit: 50,
      };
      if (filterStatus !== "all") {
        params.status = filterStatus;
      }
      const response = await generateApi.getJobs(params);
      setJobs(response.jobs);
    } catch (error: any) {
      console.error("Failed to load jobs:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to load generation jobs",
        read: false,
      });
    } finally {
      setIsLoading(false);
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

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "failed":
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case "processing":
        return <ClockIcon className="w-5 h-5 text-blue-600 animate-spin" />;
      case "pending":
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  const getStatusLabel = (status: JobStatus) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  const handleViewResult = (job: any) => {
    if (job.status === "completed" && job.result) {
      if (job.type === "flashcards" && job.result.setId) {
        router.push(`/flashcards/${job.result.setId}`);
      } else if (job.type === "quiz" && job.result.quizId) {
        router.push(`/quizzes/${job.result.quizId}`);
      }
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
                Generation History
              </h1>
              <p className="text-neutral-gray600 dark:text-neutral-gray400">
                View all your AI generation jobs
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => router.push("/upload")}
              className="flex items-center gap-2"
            >
              <LightBulbIcon className="w-5 h-5" />
              New Generation
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={filterStatus === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            All
          </Button>
          <Button
            variant={filterStatus === "pending" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("pending")}
          >
            Pending
          </Button>
          <Button
            variant={filterStatus === "processing" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("processing")}
          >
            Processing
          </Button>
          <Button
            variant={filterStatus === "completed" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("completed")}
          >
            Completed
          </Button>
          <Button
            variant={filterStatus === "failed" ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("failed")}
          >
            Failed
          </Button>
        </div>

        {/* Jobs List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Loading jobs...
            </p>
          </div>
        ) : jobs.length === 0 ? (
          <EmptyState
            icon={
              <LightBulbIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />
            }
            title="No Generation Jobs"
            description={
              filterStatus !== "all"
                ? `No ${getStatusLabel(filterStatus as JobStatus).toLowerCase()} jobs found.`
                : "You haven't generated any flashcards or quizzes yet. Get started by uploading content."
            }
            actionLabel="Start Generating"
            onAction={() => router.push("/upload")}
          />
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Card key={job.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-3 bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg">
                      {job.type === "flashcards" ? (
                        <LightBulbIcon className="w-5 h-5 text-primary-black dark:text-primary-white" />
                      ) : (
                        <DocumentTextIcon className="w-5 h-5 text-primary-black dark:text-primary-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                          {job.type === "flashcards" ? "Flashcard Generation" : "Quiz Generation"}
                        </span>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(job.status)}
                          <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                            {getStatusLabel(job.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-gray600 dark:text-neutral-gray400">
                        <span>Created: {formatDate(job.createdAt)}</span>
                        {job.completedAt && (
                          <span>Completed: {formatDate(job.completedAt)}</span>
                        )}
                      </div>
                      {job.error && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">
                            Error: {job.error}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {job.status === "completed" && job.result && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewResult(job)}
                    >
                      View Result
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

