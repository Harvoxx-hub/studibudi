"use client";

import { useState } from "react";
import Link from "next/link";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { useAppStore } from "@/store/useAppStore";
import { authApi } from "@/lib/api/auth";

export default function ForgotPasswordPage() {
  const { addNotification } = useAppStore();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(undefined);

    try {
      await authApi.forgotPassword(email);
      setIsSent(true);
      addNotification({
        userId: "temp",
        type: "success",
        title: "Email Sent",
        message: "Check your inbox for password reset instructions.",
        read: false,
      });
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to send reset email. Please try again.";
      setError(errorMessage);
      addNotification({
        userId: "temp",
        type: "error",
        title: "Error",
        message: errorMessage,
        read: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
            <div className="mb-4 flex justify-center">
              <div className="p-4 bg-neutral-gray100 dark:bg-neutral-gray800 rounded-full">
                <EnvelopeIcon className="w-12 h-12 text-primary-black dark:text-primary-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Check Your Email
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-6">
            We've sent password reset instructions to {email}
          </p>
          <Link href="/login">
            <Button variant="primary" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Forgot Password?
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">
            Enter your email and we'll send you reset instructions
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={isLoading}
              error={error}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="text-sm text-primary-black dark:text-primary-white hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

