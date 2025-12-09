"use client";

import { useEffect, useState } from "react";
import { AcademicCapIcon } from "@heroicons/react/24/solid";
import { Loading } from "@/components/ui/Loading";

interface SplashScreenProps {
  onComplete: () => void;
  minDisplayTime?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  minDisplayTime = 2000,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out animation
    }, minDisplayTime);

    return () => clearTimeout(timer);
  }, [minDisplayTime, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-primary-black transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
        <div className="text-center">
          <div className="mb-8">
            <div className="flex justify-center mb-4">
              <AcademicCapIcon className="w-24 h-24 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-white mb-2">Studibudi</h2>
            <p className="text-white text-lg opacity-90">Your AI Study Assistant</p>
          </div>
          <Loading size="lg" />
        </div>
    </div>
  );
};

