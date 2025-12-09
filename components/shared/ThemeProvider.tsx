"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { darkMode, setDarkMode } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem("studibudi_theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    const shouldBeDark = savedTheme 
      ? savedTheme === "dark" 
      : prefersDark;

    setDarkMode(shouldBeDark);
  }, [setDarkMode]);

  useEffect(() => {
    if (!mounted) return;
    
    // Save theme preference
    localStorage.setItem("studibudi_theme", darkMode ? "dark" : "light");
    
    // Apply theme to document
    if (typeof window !== "undefined") {
      if (darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, [darkMode, mounted]);

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
};


