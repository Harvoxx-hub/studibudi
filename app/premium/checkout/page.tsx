"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading, LoadingSpinner } from "@/components/ui/Loading";
import { ArrowLeftIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { subscriptionsApi } from "@/lib/api";

const planDetails: Record<string, { name: string; price: number; period: string }> = {
  monthly: { name: "Monthly", price: 9.99, period: "month" },
  quarterly: { name: "Quarterly", price: 24.99, period: "3 months" },
  yearly: { name: "Yearly", price: 89.99, period: "year" },
};

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const { addNotification } = useAppStore();
  const [planId, setPlanId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const plan = searchParams.get("plan");
    if (!plan || !planDetails[plan]) {
      router.push("/premium");
      return;
    }
    setPlanId(plan);
  }, [searchParams, router]);

  const handlePayment = async () => {
    if (!planId) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Create payment session via API
      const paymentSession = await subscriptionsApi.createPaymentSession(
        planId as "monthly" | "quarterly" | "yearly"
      );

      // Redirect to Stripe checkout
      if (paymentSession.paymentUrl) {
        window.location.href = paymentSession.paymentUrl;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err?.message || "Payment processing failed. Please try again.");
      setIsProcessing(false);
      addNotification({
        userId: user?.id || "temp",
        type: "error",
        title: "Payment Failed",
        message: err?.message || "Failed to process payment",
        read: false,
      });
    }
  };

  if (!planId) {
    return (
      <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const plan = planDetails[planId];

  return (
    <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => router.push("/premium")}
          className="mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Plans
        </Button>

        <Card className="p-6 mb-6">
          <h1 className="text-2xl font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-6">
            Complete Your Purchase
          </h1>

          {/* Order Summary */}
          <div className="border-b border-neutral-gray200 dark:border-neutral-gray700 pb-6 mb-6">
            <h2 className="text-lg font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-gray600 dark:text-neutral-gray400">
                  {plan.name} Plan
                </span>
                <span className="text-neutral-gray900 dark:text-neutral-gray100 font-medium">
                  ${plan.price}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-gray600 dark:text-neutral-gray400">
                  Billing Period
                </span>
                <span className="text-neutral-gray600 dark:text-neutral-gray400">
                  {plan.period}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-neutral-gray200 dark:border-neutral-gray700">
                <span className="text-lg font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                  Total
                </span>
                <span className="text-lg font-semibold text-neutral-gray900 dark:text-neutral-gray100">
                  ${plan.price}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-4">
              Payment Method
            </h2>
            <div className="border border-neutral-gray200 dark:border-neutral-gray700 rounded-lg p-4">
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-2">
                Secure payment processing powered by Stripe/Paystack
              </p>
              <div className="flex items-center gap-2 text-sm text-neutral-gray600 dark:text-neutral-gray400">
                <LockClosedIcon className="w-4 h-4" />
                <span>Your payment information is encrypted and secure</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <Button
            variant="primary"
            className="w-full"
            onClick={handlePayment}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="w-4 h-4 mr-2" />
                Processing...
              </>
            ) : (
              `Pay $${plan.price}`
            )}
          </Button>

          <p className="text-xs text-neutral-gray500 dark:text-neutral-gray500 text-center mt-4">
            By proceeding, you agree to our Terms of Service and Privacy Policy.
            Your subscription will auto-renew unless cancelled.
          </p>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center">
        <Loading />
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}

