"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { XCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function PaymentFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center px-4">
      <Card className="p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
            <XCircleIcon className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-4">
          Payment Failed
        </h1>
        <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6">
          We couldn't process your payment. This could be due to insufficient funds, incorrect card details, or a temporary issue.
        </p>
        <div className="bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg p-4 mb-6">
          <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mb-2">
            What you can do:
          </p>
          <ul className="text-sm text-neutral-gray600 dark:text-neutral-gray400 space-y-1 text-left">
            <li>• Check your payment method details</li>
            <li>• Ensure you have sufficient funds</li>
            <li>• Try a different payment method</li>
            <li>• Contact support if the issue persists</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => router.push("/premium")}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Try Again
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

