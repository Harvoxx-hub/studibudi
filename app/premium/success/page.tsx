"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CheckCircleIcon, SparklesIcon, CreditCardIcon } from "@heroicons/react/24/outline";
import { subscriptionsApi, usersApi } from "@/lib/api";

function PaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setUser } = useAuthStore();
  const { addNotification } = useAppStore();
  const [isVerifying, setIsVerifying] = useState(true);
  const [purchaseType, setPurchaseType] = useState<"credits" | "subscription" | null>(null);
  const [creditsAdded, setCreditsAdded] = useState<number | null>(null);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      // Check for Paystack reference in URL (trxref or reference)
      const reference = searchParams.get("trxref") || searchParams.get("reference");
      
      // Also check localStorage for pending purchase
      const storedReference = localStorage.getItem("pending_credit_purchase");

      const paymentReference = reference || storedReference;

      if (paymentReference) {
        // This is a credit purchase - verify with Paystack
        setPurchaseType("credits");
        
        try {
          const result = await subscriptionsApi.verifyCreditPurchase(paymentReference);
          
          // Clear stored reference
          localStorage.removeItem("pending_credit_purchase");
          
          setCreditsAdded(result.credits);
          setNewBalance(result.newBalance);
          setIsVerifying(false);

          // Update user credits in store
          if (user) {
            setUser({ ...user, credits: result.newBalance });
          }

          addNotification({
            userId: user?.id || "temp",
            type: "success",
            title: "Credits Added!",
            message: `${result.credits} credits have been added to your account.`,
            read: false,
          });
        } catch (err: any) {
          console.error("Error verifying credit purchase:", err);
          setError(err.message || "Failed to verify payment");
          setIsVerifying(false);
          
          // Clear stored reference on error too
          localStorage.removeItem("pending_credit_purchase");
        }
      } else {
        // This is a subscription purchase
        const plan = searchParams.get("plan");
        if (!plan) {
          router.push("/premium");
          return;
        }
        
        setPurchaseType("subscription");

        try {
          // Fetch updated subscription status from API
          await subscriptionsApi.getSubscription();
          
          // Fetch updated user profile
          const updatedUserData = await usersApi.getCurrentUser();
          
          if (updatedUserData) {
            setUser(updatedUserData);
          }
          
          setIsVerifying(false);
          
          addNotification({
            userId: user?.id || "temp",
            type: "success",
            title: "Premium Activated",
            message: "Your premium subscription is now active!",
            read: false,
          });
        } catch (err: any) {
          console.error("Error updating subscription:", err);
          // Still show success since payment was made
          setIsVerifying(false);
        }
      }
    };

    verifyPayment();
  }, [searchParams, router, user, setUser, addNotification]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            Payment Verification Failed
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6">
            {error}
          </p>
          <p className="text-sm text-neutral-gray500 dark:text-neutral-gray500 mb-6">
            If you were charged, please contact support with your transaction details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => router.push("/premium")}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              Go Home
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-black dark:border-primary-white mx-auto"></div>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">
              Verifying your payment...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Credit purchase success
  if (purchaseType === "credits") {
    return (
      <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center px-4">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-primary-black dark:bg-primary-white flex items-center justify-center">
              <CheckCircleIcon className="w-12 h-12 text-primary-white dark:text-primary-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
            Payment Successful!
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6">
            Your credits have been added to your account.
          </p>
          
          <div className="bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CreditCardIcon className="w-6 h-6 text-primary-black dark:text-primary-white" />
              <span className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                Credits Added
              </span>
            </div>
            <div className="text-4xl font-bold text-primary-black dark:text-primary-white mb-2">
              +{creditsAdded}
            </div>
            <div className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
              New Balance: <span className="font-semibold">{newBalance} credits</span>
            </div>
          </div>

          <div className="text-sm text-neutral-gray500 dark:text-neutral-gray500 mb-6">
            <p>• 1 credit = 1 flashcard</p>
            <p>• 1 credit = 1 quiz question</p>
            <p>• Credits never expire</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => router.push("/generate")}
            >
              Generate Content
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.push("/")}
            >
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Subscription success (existing flow)
  return (
    <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-black dark:bg-primary-white flex items-center justify-center">
            <CheckCircleIcon className="w-12 h-12 text-primary-white dark:text-primary-black" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
          Welcome to Premium!
        </h1>
        <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6">
          Your subscription has been activated successfully. You now have access to all premium features.
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
