"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthStore } from "@/store/useAuthStore";
import { useAppStore } from "@/store/useAppStore";
import { authApi } from "@/lib/api/auth";
import { signInWithEmail } from "@/lib/firebase/auth";

function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addNotification } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Step 1: Sign in with Firebase Auth to get ID token
      const idToken = await signInWithEmail(email, password);
      
      // Step 2: Send ID token to backend API
      const response = await authApi.signin(idToken);
      
      // Step 3: Store user and token in app state
      login(response.user, response.token);
      
      addNotification({
        userId: response.user.id,
        type: "success",
        title: "Welcome back!",
        message: "You've successfully signed in.",
        read: false,
      });
      
      router.push("/");
    } catch (err: any) {
      const errorMessage = err?.message || "Invalid email or password. Please try again.";
      setError(errorMessage);
      console.error("Login error:", err);
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
        message: "You've successfully signed in with Google.",
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
            Welcome Back
          </h1>
          <p className="text-neutral-gray600 dark:text-neutral-gray400">Sign in to continue your studies</p>
        </div>

        <AuthForm
          mode="login"
          onSubmit={handleSubmit}
          onGoogleAuth={handleGoogleAuth}
          isLoading={isLoading}
          error={error}
        />

        <div className="mt-6 space-y-3 text-center">
          <Link
            href="/forgot-password"
            className="block text-sm text-primary-black dark:text-primary-white hover:underline"
          >
            Forgot your password?
          </Link>
          <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary-black dark:text-primary-white hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
