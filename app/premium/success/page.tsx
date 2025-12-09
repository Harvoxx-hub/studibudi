"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { subscriptionsApi, usersApi } from "@/lib/api";

const planDetails: Record<string, { name: string }> = {
  monthly: { name: "Monthly" },
  quarterly: { name: "Quarterly" },
  yearly: { name: "Yearly" },
};

function PaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const { addNotification } = useAppStore();
  const [planId, setPlanId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(true);

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (!plan) {
      router.push("/premium");
      return;
    }
    setPlanId(plan);

    // Update user subscription status from API
    const updateSubscription = async () => {
      try {
        // Fetch updated subscription status from API
        const subscription = await subscriptionsApi.getSubscription();
        
        // Fetch updated user profile
        const updatedUserData = await usersApi.getCurrentUser();
        
        if (updatedUserData) {
          setUser(updatedUserData);
        }
        
        setIsUpdating(false);
        
        addNotification({
          userId: user?.id || "temp",
          type: "success",
          title: "Premium Activated",
          message: "Your premium subscription is now active!",
          read: false,
        });
      } catch (error: any) {
        console.error("Error updating subscription:", error);
        // Still update local state as fallback
        if (user) {
          const updatedUser = {
            ...user,
            subscriptionPlan: "premium" as const,
          };
          setUser(updatedUser);
        }
        setIsUpdating(false);
        addNotification({
          userId: user?.id || "temp",
          type: "error",
          title: "Update Failed",
          message: "Subscription activated but failed to refresh status",
          read: false,
        });
      }
    };

    updateSubscription();
  }, [searchParams, router, user, setUser]);

  if (!planId) {
    return null;
  }

  const plan = planDetails[planId] || { name: "Premium" };

  return (
    <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full text-center">
        {isUpdating ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-black dark:border-primary-white mx-auto"></div>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Activating your premium subscription...
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-primary-black dark:bg-primary-white flex items-center justify-center">
                <CheckCircleIcon className="w-12 h-12 text-primary-white dark:text-primary-black" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
              Welcome to Premium!
            </h1>
            <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6">
              Your {plan.name} subscription has been activated successfully. You now have access to all premium features.
            </p>
            <div className="bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-primary-black dark:text-primary-white" />
                <span className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                  Premium Features Unlocked
                </span>
              </div>
              <ul className="text-sm text-neutral-gray600 dark:text-neutral-gray400 space-y-1 text-left">
                <li>• Unlimited AI flashcards</li>
                <li>• Unlimited quizzes</li>
                <li>• Larger file uploads</li>
                <li>• Faster generation</li>
                <li>• No ads</li>
              </ul>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                className="flex-1"
                onClick={() => router.push("/")}
              >
                Go to Dashboard
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => router.push("/library")}
              >
                Explore Library
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-black dark:border-primary-white mx-auto"></div>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Loading...
            </p>
          </div>
        </Card>
      </div>
    }>
      <PaymentSuccessPageContent />
    </Suspense>
  );
}

