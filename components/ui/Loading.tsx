import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  text,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const spinner = (
    <div
      className={`${sizeClasses[size]} border-4 border-neutral-gray200 border-t-primary-black rounded-full animate-spin`}
    />
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
        {spinner}
        {text && <p className="mt-4 text-neutral-darkGray">{text}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {spinner}
      {text && <p className="mt-2 text-sm text-neutral-darkGray">{text}</p>}
    </div>
  );
};

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div
      className={`border-4 border-neutral-gray200 border-t-primary-black rounded-full animate-spin ${className}`}
    />
  );
};

