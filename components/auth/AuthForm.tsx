"use client";

import { useState } from "react";
import { 
  ArrowRightOnRectangleIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface AuthFormProps {
  mode: "signup" | "login";
  onSubmit: (email: string, password: string, name?: string) => void;
  onGoogleAuth?: () => void;
  isLoading?: boolean;
  error?: string;
}

export function AuthForm({
  mode,
  onSubmit,
  onGoogleAuth,
  isLoading = false,
  error,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (mode === "signup") {
      if (!name) {
        errors.name = "Name is required";
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(email, password, mode === "signup" ? name : undefined);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "signup" && (
          <Input
            label="Full Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={formErrors.name}
            placeholder="John Doe"
            disabled={isLoading}
          />
        )}

        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={formErrors.email}
          placeholder="you@example.com"
          disabled={isLoading}
        />

        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={formErrors.password}
          placeholder="••••••••"
          disabled={isLoading}
        />

        {mode === "signup" && (
          <Input
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={formErrors.confirmPassword}
            placeholder="••••••••"
            disabled={isLoading}
          />
        )}

        {error && (
          <div className="p-3 bg-neutral-gray100 dark:bg-neutral-gray800 border border-primary-black dark:border-primary-white rounded-lg">
            <p className="text-sm text-primary-black dark:text-primary-white">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? "Loading..."
            : mode === "signup"
            ? "Create Account"
            : "Sign In"}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-neutral-gray300 dark:border-neutral-gray700"></div>
        <span className="px-4 text-sm text-neutral-gray500 dark:text-neutral-gray400">OR</span>
        <div className="flex-1 border-t border-neutral-gray300 dark:border-neutral-gray700"></div>
      </div>

      {/* OAuth Buttons */}
      <div className="space-y-3">
        {onGoogleAuth && (
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full flex items-center justify-center"
            onClick={onGoogleAuth}
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </Button>
        )}

      </div>
    </Card>
  );
}

