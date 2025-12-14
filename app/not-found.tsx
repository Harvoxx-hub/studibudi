"use client";

import { useRouter } from "next/navigation";
import { ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-neutral-gray50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* 404 Icon */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4">
            <ExclamationTriangleIcon className="w-24 h-24 text-neutral-gray400" />
          </div>
          <span className="text-7xl font-bold text-primary-black">404</span>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl font-bold text-neutral-gray900 mb-4">
          Page Not Found
        </h1>
        <p className="text-neutral-gray600 mb-8 text-lg">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/")}
            className="flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            Go to Dashboard
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Go Back
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-neutral-gray200">
          <p className="text-sm text-neutral-gray500 mb-4">
            You might be looking for:
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => router.push("/library")}
              className="text-sm text-primary-black hover:underline"
            >
              Study Sets
            </button>
            <button
              onClick={() => router.push("/upload")}
              className="text-sm text-primary-black hover:underline"
            >
              Upload Material
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="text-sm text-primary-black hover:underline"
            >
              Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

