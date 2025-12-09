"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  UserIcon,
  EnvelopeIcon,
  PencilIcon,
  LockClosedIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { authApi, usersApi, generateApi } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { addNotification } = useAppStore();
  const [usage, setUsage] = useState<{
    flashcardsCreated: number;
    quizzesCreated: number;
    month: string;
    lastResetDate: string;
  } | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [changePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  // Load usage statistics
  useEffect(() => {
    const loadUsage = async () => {
      if (!user) return;
      
      setIsLoadingUsage(true);
      try {
        const usageData = await usersApi.getUsage();
        setUsage(usageData);
      } catch (error: any) {
        console.error("Failed to load usage:", error);
        // Show error notification instead of silently falling back to dummy data
        addNotification({
          userId: user.id,
          type: "error",
          title: "Failed to Load Usage",
          message: error?.message || "Unable to load usage statistics. Please try again later.",
          read: false,
        });
        // Set usage to null to show error state in UI
        setUsage(null);
      } finally {
        setIsLoadingUsage(false);
      }
    };

    loadUsage();
  }, [user, addNotification]);

  // Load credits balance
  useEffect(() => {
    const loadCredits = async () => {
      if (!user) return;

      setIsLoadingCredits(true);
      try {
        const limits = await generateApi.getLimits();
        setCredits(limits.credits);
        // Update user credits in store
        if (user && limits.credits !== user.credits) {
          setUser({ ...user, credits: limits.credits });
        }
      } catch (error: any) {
        console.error("Failed to load credits:", error);
        // Fallback to user credits if available
        if (user?.credits !== undefined) {
          setCredits(user.credits);
        }
      } finally {
        setIsLoadingCredits(false);
      }
    };

    loadCredits();
  }, [user, setUser]);


  const handleEdit = () => {
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || "",
      email: user?.email || "",
    });
    setErrors({});
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};

    if (!editForm.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!editForm.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editForm.email)) {
      newErrors.email = "Invalid email format";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      // Call API to update profile
      const updatedUser = await usersApi.updateProfile({
        name: editForm.name.trim(),
        email: editForm.email.trim(),
      });

      // Update user in store
      setUser(updatedUser);

      // Show success notification
      addNotification({
        userId: updatedUser.id,
        type: "success",
        title: "Profile Updated",
        message: "Your profile has been updated successfully.",
        read: false,
      });

      setIsEditing(false);
      setErrors({});
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update profile. Please try again.";
      setErrors({ general: errorMessage });
      console.error("Update profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const newErrors: Record<string, string> = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      await authApi.changePassword(
        passwordForm.currentPassword,
        passwordForm.newPassword
      );
      
      // Show success notification
      addNotification({
        userId: user?.id || "temp",
        type: "success",
        title: "Password Changed",
        message: "Your password has been changed successfully.",
        read: false,
      });

      setChangePasswordModalOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to change password. Please try again.";
      setErrors({ general: errorMessage });
      console.error("Change password error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <p className="text-neutral-gray600">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Profile
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Information */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100">
              Account Information
            </h2>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="flex items-center gap-2"
              >
                <PencilIcon className="w-4 h-4" />
                Edit
              </Button>
            )}
          </div>

            {isEditing ? (
            <div className="space-y-4">
              {errors.general && (
                <div className="p-3 bg-status-error/10 dark:bg-red-900/20 border border-status-error dark:border-red-800 rounded-lg">
                  <p className="text-sm text-status-error dark:text-red-400">
                    {errors.general}
                  </p>
                </div>
              )}
              <Input
                label="Name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                error={errors.name}
              />
              <Input
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                error={errors.email}
              />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary-black dark:bg-primary-white flex items-center justify-center">
                  <span className="text-primary-white dark:text-primary-black text-2xl font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-lg font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                    {user.name}
                  </p>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">{user.email}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-neutral-gray200 dark:border-neutral-gray700 space-y-3">
                <div className="flex items-center gap-3">
                  <UserIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400" />
                  <span className="text-neutral-gray900 dark:text-neutral-gray100">{user.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400" />
                  <span className="text-neutral-gray900 dark:text-neutral-gray100">{user.email}</span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Usage Statistics */}
        {(
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
              Usage This Month
            </h2>
            {isLoadingUsage ? (
              <div className="text-center py-4">
                <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                  Loading usage statistics...
                </p>
              </div>
            ) : usage ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-gray700 dark:text-neutral-gray300">
                      Flashcards Created
                    </span>
                    <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                      {usage.flashcardsCreated} total
                    </span>
                  </div>
                  <div className="w-full bg-neutral-gray200 dark:bg-neutral-gray700 rounded-full h-2">
                    <div
                      className="bg-primary-black dark:bg-primary-white h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((usage.flashcardsCreated / 100) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-neutral-gray700 dark:text-neutral-gray300">
                      Quizzes Created
                    </span>
                    <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                      {usage.quizzesCreated} total
                    </span>
                  </div>
                  <div className="w-full bg-neutral-gray200 dark:bg-neutral-gray700 rounded-full h-2">
                    <div
                      className="bg-primary-black dark:bg-primary-white h-2 rounded-full transition-all"
                      style={{
                        width: `${Math.min((usage.quizzesCreated / 100) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
                {/* Note: Usage tracking kept for analytics, but limits are now credit-based */}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                  Unable to load usage statistics
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Credits Balance */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100">
              Credits
            </h2>
            {isLoadingCredits ? (
              <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                Loading...
              </span>
            ) : credits !== null ? (
              <Badge variant={credits < 10 ? "warning" : "default"}>
                {credits} Credits
              </Badge>
            ) : null}
          </div>
          {isLoadingCredits ? (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                Loading credits...
              </p>
            </div>
          ) : credits !== null ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CreditCardIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400" />
                <div className="flex-1">
                  <p className="text-neutral-gray900 dark:text-neutral-gray100 font-medium">
                    Current Balance: {credits} Credits
                  </p>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                    {credits < 10 ? (
                      <span className="text-status-warning dark:text-yellow-400">
                        Low credits! Purchase more to continue generating content.
                      </span>
                    ) : (
                      "1 credit = 1 flashcard or 1 quiz question"
                    )}
                  </p>
                </div>
              </div>
              {credits < 10 && (
                <Button
                  variant="primary"
                  onClick={() => router.push("/premium")}
                  className="w-full sm:w-auto"
                >
                  Purchase Credits
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                Unable to load credits
              </p>
            </div>
          )}
        </Card>


        {/* Security */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            Security
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LockClosedIcon className="w-5 h-5 text-neutral-gray600 dark:text-neutral-gray400" />
                <div>
                  <p className="text-neutral-gray900 dark:text-neutral-gray100 font-medium">Password</p>
                  <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                    Last changed: Never
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setChangePasswordModalOpen(true)}
              >
                Change Password
              </Button>
            </div>
          </div>
        </Card>

        {/* Change Password Modal */}
        <Modal
          isOpen={changePasswordModalOpen}
          onClose={() => {
            setChangePasswordModalOpen(false);
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
            setErrors({});
          }}
          title="Change Password"
        >
          <div className="space-y-4">
            {errors.general && (
              <div className="p-3 bg-status-error/10 dark:bg-red-900/20 border border-status-error dark:border-red-800 rounded-lg">
                <p className="text-sm text-status-error dark:text-red-400">{errors.general}</p>
              </div>
            )}
            <Input
              label="Current Password"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  currentPassword: e.target.value,
                })
              }
              error={errors.currentPassword}
            />
            <Input
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  newPassword: e.target.value,
                })
              }
              error={errors.newPassword}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm({
                  ...passwordForm,
                  confirmPassword: e.target.value,
                })
              }
              error={errors.confirmPassword}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setChangePasswordModalOpen(false);
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setErrors({});
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleChangePassword}
                disabled={isSaving}
              >
                {isSaving ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}


