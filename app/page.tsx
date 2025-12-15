"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AcademicCapIcon,
  LightBulbIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BoltIcon,
  DocumentArrowUpIcon,
  BookOpenIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { AcademicCapIcon as AcademicCapIconSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui";
import { QuickActionButton, RecentItemCard, ProgressCard, EmptyState } from "@/components/dashboard";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useAuthStore } from "@/store/useAuthStore";
import { studySessionsApi, studySetsApi } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { user, setUser, isAuthenticated } = useAuthStore();
  const [recentStudySets, setRecentStudySets] = useState<any[]>([]);
  const [showSplash, setShowSplash] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [stats, setStats] = useState<{
    streak: number;
    studyCountToday: number;
  } | null>(null);
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

  // Handle splash and welcome screens for new users
  useEffect(() => {
    if (!isAuthenticated) {
      const hasSeenWelcome = localStorage.getItem("studibudi_has_seen_welcome");
      if (!hasSeenWelcome) {
        const splashTimer = setTimeout(() => {
          setShowSplash(false);
          setShowWelcome(true);
        }, 2000);
        return () => clearTimeout(splashTimer);
      } else {
        router.push("/login");
      }
    } else {
      setShowSplash(false);
      setShowWelcome(false);
    }
  }, [isAuthenticated, router]);

  // Load stats from API
  useEffect(() => {
    const loadStats = async () => {
      if (!isAuthenticated || !user) return;

      try {
        const statsData = await studySessionsApi.getStats("all");
        setStats({
          streak: statsData.streak,
          studyCountToday: statsData.studyCountToday,
        });
        
        // Update user in store with latest stats only if they changed
        // This prevents infinite loops
        if (user && (user.streak !== statsData.streak || user.studyCountToday !== statsData.studyCountToday)) {
          setUser({
            ...user,
            streak: statsData.streak,
            studyCountToday: statsData.studyCountToday,
          });
        }
      } catch (error: any) {
        console.error("Failed to load stats:", error);
        // Fallback to user data from store if available, otherwise use defaults
        if (user) {
          setStats({
            streak: user.streak || 0,
            studyCountToday: user.studyCountToday || 0,
          });
        } else {
          // Set default stats if no user data available
          setStats({
            streak: 0,
            studyCountToday: 0,
          });
        }
      }
    };

    loadStats();
    // Only depend on isAuthenticated and user.id to prevent loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Load recent Study Sets from API
  useEffect(() => {
    const loadRecentItems = async () => {
      if (!isAuthenticated || !user) return;

      setIsLoadingRecent(true);
      try {
        // Load recent Study Sets
        const studySetsResponse = await studySetsApi.list({
          limit: 6,
          sortBy: 'date',
          sortOrder: 'desc',
        });
        setRecentStudySets(studySetsResponse.studySets || []);
      } catch (error: any) {
        console.error("Failed to load recent study sets:", error);
        // Fallback to empty array on error
        setRecentStudySets([]);
      } finally {
        setIsLoadingRecent(false);
      }
    };

    loadRecentItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]);

  // Show splash screen
  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary-black">
        <div className="text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <AcademicCapIconSolid className="w-24 h-24 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Studibudi</h2>
            <p className="text-white text-lg opacity-90">Your AI Study Assistant</p>
          </div>
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show welcome screen for new users
  if (showWelcome && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <AcademicCapIcon className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              Welcome to Studibudi
            </h1>
            <p className="text-xl text-white opacity-90">
              Transform your study materials into flashcards and quizzes with AI
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {[
              { icon: LightBulbIcon, title: "AI-Powered Flashcards", desc: "Transform your notes into interactive flashcards instantly" },
              { icon: DocumentTextIcon, title: "Smart Quizzes", desc: "Generate practice quizzes to test your knowledge" },
              { icon: ChartBarIcon, title: "Track Progress", desc: "Monitor your study streaks and improvement" },
              { icon: BoltIcon, title: "Study Faster", desc: "Learn more efficiently with AI-generated content" },
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white bg-opacity-95 rounded-lg p-6 hover:bg-opacity-100 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-neutral-gray100 rounded-lg">
                      <IconComponent className="w-8 h-8 text-primary-black" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-gray900 mb-1">{feature.title}</h3>
                      <p className="text-sm text-neutral-gray600">{feature.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="accent"
              size="lg"
              onClick={() => {
                localStorage.setItem("studibudi_has_seen_welcome", "true");
                router.push("/signup");
              }}
              className="px-8"
            >
              Get Started
            </Button>
            <Button
              variant="white"
              size="lg"
              onClick={() => {
                localStorage.setItem("studibudi_has_seen_welcome", "true");
                router.push("/login");
              }}
              className="px-8"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard for authenticated users
  if (isAuthenticated && user) {
    const displayUser = user;

    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Greeting */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
              Hi {displayUser.name} 👋
            </h2>
            <p className="text-neutral-gray600 dark:text-neutral-gray400 mt-1">
              Ready to continue your studies?
            </p>
          </div>

          {/* Progress Card */}
          <div className="mb-8">
            <ProgressCard
              streak={stats?.streak ?? displayUser.streak}
              studyCountToday={stats?.studyCountToday ?? displayUser.studyCountToday}
            />
          </div>

          {/* Quick Actions */}
          <section className="mb-8">
            <h3 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <QuickActionButton
                icon={<DocumentArrowUpIcon className="w-8 h-8" />}
                label="Upload Material"
                onClick={() => router.push("/upload")}
              />
              <QuickActionButton
                icon={<BookOpenIcon className="w-8 h-8" />}
                label="Create Study Set"
                onClick={() => router.push("/library")}
              />
            </div>
          </section>

          {/* Recent Study Sets */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                Recent Study Sets
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/library")}
              >
                View All
              </Button>
            </div>
            {isLoadingRecent ? (
              <div className="text-center py-8">
                <p className="text-neutral-gray600 dark:text-neutral-gray400">
                  Loading recent study sets...
                </p>
              </div>
            ) : recentStudySets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentStudySets.map((studySet) => (
                  <RecentItemCard
                    key={studySet.id}
                    title={studySet.title}
                    subtitle={`${studySet.materialCount ?? 0} materials • ${studySet.topicCount ?? 0} topics`}
                    badge={studySet.description ? undefined : undefined}
                    onClick={() => router.push(`/study-sets/${studySet.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FolderIcon className="w-16 h-16 text-neutral-gray400 dark:text-neutral-gray500" />}
                title="No Study Sets Yet"
                description="Create your first study set by uploading materials. Topics will be automatically extracted, and you can generate flashcards and quizzes from them."
                actionLabel="Create Study Set"
                onAction={() => router.push("/library")}
              />
            )}
          </section>
        </div>
      </DashboardLayout>
    );
  }

  // If we get here, user is not authenticated and not showing splash/welcome
  // This shouldn't happen due to the useEffect above, but return null as fallback
  return null;
}

