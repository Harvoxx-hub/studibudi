"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  MoonIcon,
  SunIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { usersApi } from "@/lib/api";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { darkMode, setDarkMode, addNotification } = useAppStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      return;
    }

    try {
      await usersApi.deleteAccount();
      
      // Logout and redirect
      logout();
      router.push("/login");
    } catch (error: any) {
      const errorMessage = error?.message || "Failed to delete account. Please try again.";
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: errorMessage,
        read: false,
      });
      console.error("Delete account error:", error);
    }
  };

  const appVersion = "1.0.0";

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Settings
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">
            Manage your app preferences and account settings
          </p>
        </div>

        {/* Appearance */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            Appearance
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-gray900 dark:text-neutral-gray100 font-medium">Theme</p>
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                Choose your preferred theme
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-gray200 dark:border-neutral-gray700 rounded-lg hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 transition-colors"
            >
              {darkMode ? (
                <>
                  <MoonIcon className="w-5 h-5 text-neutral-gray900 dark:text-neutral-gray100" />
                  <span className="text-neutral-gray900 dark:text-neutral-gray100">Dark</span>
                </>
              ) : (
                <>
                  <SunIcon className="w-5 h-5 text-neutral-gray900 dark:text-neutral-gray100" />
                  <span className="text-neutral-gray900 dark:text-neutral-gray100">Light</span>
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Account Management */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            Account Management
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-gray900 dark:text-neutral-gray100 font-medium">Profile</p>
                <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                  Manage your account information
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push("/profile")}
              >
                Go to Profile
              </Button>
            </div>
            <div className="pt-4 border-t border-neutral-gray200 dark:border-neutral-gray700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-gray900 dark:text-neutral-gray100 font-medium text-red-600 dark:text-red-400">
                    Delete Account
                  </p>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalOpen(true)}
                  className="border-status-error text-status-error hover:bg-status-error hover:text-primary-white"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Help & Support */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            Help & Support
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <QuestionMarkCircleIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400" />
                <div>
                  <p className="text-neutral-gray900 dark:text-neutral-gray100 font-medium">Help Center</p>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                    Find answers to common questions
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  // Open help center (could be a modal or external link)
                  window.open("https://help.studibudi.com", "_blank");
                }}
              >
                Visit Help Center
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <EnvelopeIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400" />
                <div>
                  <p className="text-neutral-gray900 dark:text-neutral-gray100 font-medium">Contact Support</p>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                    Get help from our support team
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  window.location.href = "mailto:support@studibudi.com";
                }}
              >
                Contact Us
              </Button>
            </div>
          </div>
        </Card>

        {/* About */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            About
          </h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <InformationCircleIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400" />
              <div>
                <p className="text-neutral-gray900 dark:text-neutral-gray100 font-medium">App Version</p>
                <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">v{appVersion}</p>
              </div>
            </div>
            <div className="pt-3 border-t border-neutral-gray200 dark:border-neutral-gray700">
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                Studibudi - Your AI-powered study companion. Transform your study
                materials into flashcards and quizzes effortlessly.
              </p>
            </div>
          </div>
        </Card>

        {/* Delete Account Modal */}
        <Modal
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteConfirm("");
          }}
          title="Delete Account"
        >
          <div className="space-y-4">
            <div className="p-4 bg-status-error/10 dark:bg-red-900/20 border border-status-error dark:border-red-800 rounded-lg">
              <p className="text-sm text-neutral-gray900 dark:text-neutral-gray100 font-medium mb-2">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                Deleting your account will permanently remove all your data,
                including flashcards, quizzes, and study history. This action
                cannot be reversed.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                Type <span className="font-bold">DELETE</span> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 py-2 border border-neutral-gray200 dark:border-neutral-gray700 rounded-lg bg-neutral-white dark:bg-neutral-gray900 text-neutral-gray900 dark:text-neutral-gray100 focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteConfirm("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "DELETE"}
                className="bg-status-error hover:bg-status-error/90"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

