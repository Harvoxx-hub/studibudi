"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeIcon,
  BookOpenIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
  BellIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/useAuthStore";
import { generateApi } from "@/lib/api";
// import { notificationsApi } from "@/lib/api"; // COMMENTED OUT: Temporarily disabled notifications

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, setUser } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [credits, setCredits] = useState<number | null>(null);

  // Load credits balance
  useEffect(() => {
    const loadCredits = async () => {
      if (!user?.id) return;

      try {
        const limits = await generateApi.getLimits();
        setCredits(limits.credits);
        // Update user credits in store
        if (user && limits.credits !== user.credits) {
          setUser({ ...user, credits: limits.credits });
        }
      } catch (error: any) {
        // Silently fail network errors - they're common when backend isn't running
        const errorMessage = typeof error?.message === 'string' ? error.message : '';
        const isNetworkError = 
          error?.isNetworkError ||
          error?.code === "ERR_NETWORK" || 
          errorMessage === "Network Error" ||
          errorMessage.includes("Network error") ||
          errorMessage.includes("Cannot connect to the API server");
        
        if (!isNetworkError) {
          console.error("Failed to load credits:", error);
        }
        // Fallback to user credits if available
        if (user?.credits !== undefined) {
          setCredits(user.credits);
        }
      }
    };

    loadCredits();
    // Refresh credits every 30 seconds
    const interval = setInterval(loadCredits, 30000);
    return () => clearInterval(interval);
  }, [user, setUser]);

  // Load unread notification count
  // COMMENTED OUT: Temporarily disabled notifications
  // useEffect(() => {
  //   if (!user?.id) return;

  //   let isMounted = true;
  //   let intervalId: NodeJS.Timeout | null = null;

  //   const loadUnreadCount = async () => {
  //     if (!user?.id || !isMounted) return;
      
  //     try {
  //       const response = await notificationsApi.getNotifications({
  //         limit: 1,
  //         offset: 0,
  //         read: false,
  //       });
      
  //       if (isMounted) {
  //         setUnreadCount(response.unreadCount);
  //       }
  //     } catch (error: any) {
  //       // Silently fail - notifications are not critical for layout
  //       // Don't log network errors as they're common and temporary
  //       // Only log unexpected errors
  //       const isNetworkError = 
  //         error?.code === "ERR_NETWORK" || 
  //         error?.message === "Network Error" ||
  //         error?.message?.includes("Network error");
      
  //       if (!isNetworkError) {
  //         console.error("Failed to load unread count:", error);
  //       }
  //       // Don't throw - just fail silently and keep unreadCount at 0
  //     }
  //   };

  //   // Initial load
  //   loadUnreadCount();
  
  //   // Refresh every 30 seconds
  //   intervalId = setInterval(loadUnreadCount, 30000);
  
  //   return () => {
  //     isMounted = false;
  //     if (intervalId) {
  //       clearInterval(intervalId);
  //     }
  //   };
  //   // Only depend on user.id to prevent loops when user object changes
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [user?.id]);

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Study Library", href: "/library", icon: BookOpenIcon },
    { name: "Flashcards", href: "/flashcards", icon: AcademicCapIcon },
    { name: "Quizzes", href: "/quizzes", icon: DocumentTextIcon },
    { name: "Notifications", href: "/notifications", icon: BellIcon, badge: unreadCount > 0 ? unreadCount : undefined },
    { name: "Profile", href: "/profile", icon: UserIcon },
    { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  ];

  const getPageTitle = () => {
    const currentNav = navigation.find((nav) => nav.href === pathname);
    return currentNav?.name || "Dashboard";
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-neutral-white dark:bg-neutral-gray900 border-r border-neutral-gray200 dark:border-neutral-gray700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-gray200 dark:border-neutral-gray700">
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="w-8 h-8 text-primary-black dark:text-primary-white" />
              <h1 className="text-xl font-bold text-primary-black dark:text-primary-white">Studibudi</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    pathname === item.href
                      ? "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black"
                      : "text-neutral-gray700 dark:text-neutral-gray300 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 hover:text-primary-black dark:hover:text-primary-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium flex-1">{item.name}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge variant="default" className="bg-blue-600 text-white text-xs min-w-[20px] text-center">
                      {item.badge > 99 ? "99+" : item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-neutral-gray200 dark:border-neutral-gray700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-black dark:bg-primary-white flex items-center justify-center">
                <span className="text-primary-white dark:text-primary-black font-semibold">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-xs text-neutral-gray500 dark:text-neutral-gray400 truncate">
                  {user?.email || ""}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-neutral-white dark:bg-neutral-gray900 border-b border-neutral-gray200 dark:border-neutral-gray700 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-neutral-gray600 dark:text-neutral-gray400 hover:text-primary-black dark:hover:text-primary-white"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>
                <div className="hidden lg:block">
                  <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                    {getPageTitle()}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* Credits Display */}
                {credits !== null && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-black/10 dark:bg-primary-white/10 rounded-lg">
                    <span className="text-sm font-medium text-neutral-gray600 dark:text-neutral-gray400">
                      Credits:
                    </span>
                    <span className="text-base font-bold text-primary-black dark:text-primary-white">
                      {credits}
                    </span>
                    {credits < 10 && (
                      <span className="text-xs text-status-warning dark:text-yellow-400 ml-1">
                        (Low)
                      </span>
                    )}
                  </div>
                )}
                {credits !== null && credits < 10 && (
                  <Button
                    variant="accent"
                    size="sm"
                    onClick={() => router.push("/premium")}
                  >
                    Purchase Credits
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8 bg-neutral-gray50 dark:bg-neutral-black min-h-[calc(100vh-64px)]">{children}</main>
      </div>
    </div>
  );
}

