"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { generateApi, subscriptionsApi } from "@/lib/api";
import {
  SparklesIcon,
  CreditCardIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus?: number;
  recommended?: boolean;
  pricePerCredit: number;
}

const creditPackages: CreditPackage[] = [
  {
    id: "starter",
    name: "Starter",
    credits: 100,
    price: 1000,
    pricePerCredit: 10,
  },
  {
    id: "popular",
    name: "Popular",
    credits: 500,
    price: 4000,
    bonus: 50,
    recommended: true,
    pricePerCredit: 8,
  },
  {
    id: "pro",
    name: "Pro",
    credits: 1000,
    price: 7000,
    bonus: 200,
    pricePerCredit: 7,
  },
];

export default function PremiumPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { addNotification } = useAppStore();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  // Load current credits
  useEffect(() => {
    const loadCredits = async () => {
      if (!user) return;

      setIsLoadingCredits(true);
      try {
        const limits = await generateApi.getLimits();
        setCredits(limits.credits);
      } catch (error: any) {
        console.error("Failed to load credits:", error);
        if (user?.credits !== undefined) {
          setCredits(user.credits);
        }
      } finally {
        setIsLoadingCredits(false);
      }
    };

    loadCredits();
  }, [user]);

  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      addNotification({
        userId: "temp",
        type: "error",
        title: "Login Required",
        message: "Please log in to purchase credits.",
        read: false,
      });
      return;
    }

    setIsPurchasing(packageId);
    try {
      // Initialize Paystack payment
      const callbackUrl = `${window.location.origin}/premium/success`;
      const result = await subscriptionsApi.initializeCreditPurchase(packageId, callbackUrl);
      
      // Store reference in localStorage for verification after redirect
      localStorage.setItem('pending_credit_purchase', result.reference);
      
      // Redirect to Paystack checkout
      window.location.href = result.authorizationUrl;
    } catch (error: any) {
      setIsPurchasing(null);
      addNotification({
        userId: user.id,
        type: "error",
        title: "Purchase Failed",
        message: error.message || "Failed to initialize payment. Please try again.",
        read: false,
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            Purchase Credits
          </h1>
          <p className="text-lg text-neutral-gray600 dark:text-neutral-gray400 mb-2">
            Buy credits to generate flashcards and quizzes
          </p>
          {credits !== null && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-black/10 dark:bg-primary-white/10 rounded-lg">
              <span className="text-sm font-medium text-neutral-gray600 dark:text-neutral-gray400">
                Current Balance:
              </span>
              <span className="text-xl font-bold text-primary-black dark:text-primary-white">
                {credits} Credits
              </span>
            </div>
          )}
        </div>

        {/* Credit Packages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {creditPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 relative ${
                pkg.recommended
                  ? "ring-2 ring-primary-black dark:ring-primary-white"
                  : ""
              }`}
            >
              {pkg.recommended && (
                <Badge
                  variant="premium"
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2"
                >
                  Most Popular
                </Badge>
              )}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-black dark:bg-primary-white flex items-center justify-center">
                    <SparklesIcon className="w-8 h-8 text-primary-white dark:text-primary-black" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                  {pkg.name}
                </h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-primary-black dark:text-primary-white">
                    {pkg.credits}
                  </span>
                  <span className="text-lg text-neutral-gray600 dark:text-neutral-gray400 ml-2">
                    Credits
                  </span>
                </div>
                {pkg.bonus && (
                  <div className="mb-2">
                    <Badge variant="premium" className="text-sm">
                      +{pkg.bonus} Bonus Credits
                    </Badge>
                  </div>
                )}
                <div className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-1">
                  ₦{pkg.price.toLocaleString()}
                </div>
                <div className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                  ₦{pkg.pricePerCredit} per credit
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-gray700 dark:text-neutral-gray300">
                  <CheckIcon className="w-5 h-5 text-primary-black dark:text-primary-white" />
                  <span>
                    {pkg.credits + (pkg.bonus || 0)} total credits
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-gray700 dark:text-neutral-gray300">
                  <CheckIcon className="w-5 h-5 text-primary-black dark:text-primary-white" />
                  <span>
                    {pkg.credits + (pkg.bonus || 0)} flashcards or{" "}
                    {Math.floor((pkg.credits + (pkg.bonus || 0)) / 10)}{" "}
                    quizzes (10 questions each)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-gray700 dark:text-neutral-gray300">
                  <CheckIcon className="w-5 h-5 text-primary-black dark:text-primary-white" />
                  <span>Credits never expire</span>
                </div>
              </div>

              <Button
                variant={pkg.recommended ? "primary" : "outline"}
                className="w-full"
                onClick={() => handlePurchase(pkg.id)}
                disabled={isPurchasing !== null}
              >
                {isPurchasing === pkg.id ? "Processing..." : "Purchase Credits"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            How Credits Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                Credit Usage
              </h3>
              <ul className="space-y-2 text-sm text-neutral-gray600 dark:text-neutral-gray400">
                <li>• 1 credit = 1 flashcard</li>
                <li>• 1 credit = 1 quiz question</li>
                <li>• Credits are deducted after successful generation</li>
                <li>• Failed generations don't consume credits</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                Benefits
              </h3>
              <ul className="space-y-2 text-sm text-neutral-gray600 dark:text-neutral-gray400">
                <li>• Pay only for what you use</li>
                <li>• Credits never expire</li>
                <li>• No subscription required</li>
                <li>• Purchase anytime, use anytime</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
