"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { authApi } from "@/lib/api/auth";

export default function SignUpPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addNotification } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Step 1: Call signup API to create user on backend
      const response = await authApi.signup(email, password, name || "");

      // Step 2: Exchange custom token for ID token
      if (response.customToken) {
        const { signInWithCustomTokenAuth } = await import("@/lib/firebase/auth");
        const idToken = await signInWithCustomTokenAuth(response.customToken);

        // Step 3: Store ID token and user
        login(response.user, idToken);

        addNotification({
          userId: response.user.id,
          type: "success",
          title: "Welcome!",
          message: "Your account has been created successfully.",
          read: false,
        });

        router.push("/");
      } else {
        throw new Error("No custom token received from server");
      }
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create account. Please try again.";
      setError(errorMessage);
      console.error("Signup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(undefined);
    
    try {
      // Step 1: Sign in with Google via Firebase Auth
      const { signInWithGoogle } = await import("@/lib/firebase/auth");
      const idToken = await signInWithGoogle();
      
      // Step 2: Send ID token to backend API
      const response = await authApi.googleSignIn(idToken);
      
      // Step 3: Store user and token in app state
      login(response.user, response.token);
      
      addNotification({
        userId: response.user.id,
        type: "success",
        title: "Welcome!",
        message: "Your account has been created with Google.",
        read: false,
      });
      
      router.push("/");
    } catch (err: any) {
      const errorMessage = err?.message || "Google sign in failed. Please try again.";
      setError(errorMessage);
      console.error("Google auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-neutral-gray50 dark:bg-neutral-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-gray900 dark:text-neutral-gray100 mb-2">
            Create Your Account
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">
            Start your learning journey with Studibudi
          </p>
        </div>

        <AuthForm
          mode="signup"
          onSubmit={handleSubmit}
          onGoogleAuth={handleGoogleAuth}
          isLoading={isLoading}
          error={error}
        />

        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-primary-black dark:text-primary-white hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

