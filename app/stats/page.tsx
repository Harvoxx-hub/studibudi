"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ChartBarIcon,
  ClockIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { studySessionsApi } from "@/lib/api";
import { useAppStore } from "@/store/useAppStore";

type Period = "day" | "week" | "month" | "all";

export default function StatsPage() {
  const router = useRouter();
  const { addNotification } = useAppStore();
  const [stats, setStats] = useState<{
    totalSessions: number;
    totalStudyTime: number;
    flashcardsStudied: number;
    quizzesCompleted: number;
    streak: number;
    studyCountToday: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => {
    loadStats();
  }, [period]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const statsData = await studySessionsApi.getStats(period);
      setStats(statsData);
    } catch (error: any) {
      console.error("Failed to load stats:", error);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: error?.message || "Failed to load statistics",
        read: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
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
                Study Statistics
              </h1>
              <p className="text-neutral-gray600 dark:text-neutral-gray400">
                Track your learning progress and achievements
              </p>
            </div>
          </div>
        </div>

        {/* Period Filter */}
        <div className="mb-6 flex items-center gap-2">
          <Button
            variant={period === "day" ? "primary" : "outline"}
            size="sm"
            onClick={() => setPeriod("day")}
          >
            Today
          </Button>
          <Button
            variant={period === "week" ? "primary" : "outline"}
            size="sm"
            onClick={() => setPeriod("week")}
          >
            This Week
          </Button>
          <Button
            variant={period === "month" ? "primary" : "outline"}
            size="sm"
            onClick={() => setPeriod("month")}
          >
            This Month
          </Button>
          <Button
            variant={period === "all" ? "primary" : "outline"}
            size="sm"
            onClick={() => setPeriod("all")}
          >
            All Time
          </Button>
        </div>

        {/* Stats Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Loading statistics...
            </p>
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Total Sessions */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                  <ChartBarIcon className="w-6 h-6 text-primary-white dark:text-primary-black" />
                </div>
                <div>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-1">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                    {stats.totalSessions}
                  </p>
                </div>
              </div>
            </Card>

            {/* Total Study Time */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                  <ClockIcon className="w-6 h-6 text-primary-white dark:text-primary-black" />
                </div>
                <div>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-1">
                    Total Study Time
                  </p>
                  <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                    {formatTime(stats.totalStudyTime)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Study Streak */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                  <span className="text-2xl">🔥</span>
                </div>
                <div>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-1">
                    Study Streak
                  </p>
                  <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                    {stats.streak} days
                  </p>
                </div>
              </div>
            </Card>

            {/* Flashcards Studied */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                  <AcademicCapIcon className="w-6 h-6 text-primary-white dark:text-primary-black" />
                </div>
                <div>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-1">
                    Flashcards Studied
                  </p>
                  <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                    {stats.flashcardsStudied}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quizzes Completed */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                  <DocumentTextIcon className="w-6 h-6 text-primary-white dark:text-primary-black" />
                </div>
                <div>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-1">
                    Quizzes Completed
                  </p>
                  <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                    {stats.quizzesCompleted}
                  </p>
                </div>
              </div>
            </Card>

            {/* Study Count Today */}
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary-black dark:bg-primary-white rounded-lg">
                  <span className="text-2xl">📚</span>
                </div>
                <div>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-1">
                    Studied Today
                  </p>
                  <p className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                    {stats.studyCountToday} cards
                  </p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card className="p-12 text-center">
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              No statistics available
            </p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

