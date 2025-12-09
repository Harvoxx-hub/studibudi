"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { authStorage } from "@/lib/storage";
import { authApi } from "@/lib/api/auth";
import { Loading } from "@/components/ui/Loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, setLoading, setUser, logout } = useAuthStore();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(true);
  const [validationAttempted, setValidationAttempted] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      // If already loading from store, wait
      if (isLoading) {
        setIsValidating(false);
        return;
      }

      // If already authenticated, skip validation
      if (isAuthenticated) {
        setIsValidating(false);
        return;
      }

      // Prevent multiple validation attempts
      if (validationAttempted) {
        setIsValidating(false);
        return;
      }

      // Check if we have a token
      const token = authStorage.getToken();
      
      // If no token but user is marked as authenticated, logout
      if (!token && isAuthenticated) {
        logout();
        setIsValidating(false);
        return;
      }

      // If we have a token but user is not authenticated, try to validate
      if (token && !isAuthenticated) {
        setValidationAttempted(true);
        setLoading(true);
        try {
          // First, try to get a fresh Firebase ID token
          const { getCurrentUserToken } = await import("@/lib/firebase/auth");
          const freshIdToken = await getCurrentUserToken(false);
          
          if (freshIdToken) {
            // Use fresh token to validate with backend
            const response = await authApi.refreshToken(freshIdToken);
            // If refresh succeeds, update user state
            setUser(response.user);
            authStorage.setToken(response.token);
          } else {
            // No Firebase user, token is invalid
            console.error("No Firebase user found, token is invalid");
            logout();
          }
        } catch (error: any) {
          // Handle rate limiting - don't logout, just show error
          if (error.isRateLimited || error.code === 429) {
            console.warn("Rate limited during token validation:", error.message);
            // Don't logout on rate limit, just wait
            // The user can try again later
          } else {
            // Token is invalid for other reasons, logout
            console.error("Token validation failed:", error);
            logout();
          }
        } finally {
          setLoading(false);
        }
      }

      setIsValidating(false);
    };

    validateAuth();
  }, []); // Only run on mount

  useEffect(() => {
    // Redirect to login if not authenticated after validation
    if (!isValidating && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, isValidating, router]);

  // Show loading while validating or if store is loading
  if (isValidating || isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};


