import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "premium";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  className = "",
}) => {
  const variantStyles = {
    default: "bg-neutral-gray200 dark:bg-neutral-gray700 text-neutral-gray900 dark:text-neutral-gray100",
    success: "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black",
    warning: "bg-neutral-gray800 dark:bg-neutral-gray600 text-primary-white dark:text-primary-white",
    error: "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black",
    premium: "bg-neutral-gray900 dark:bg-neutral-gray700 text-primary-white dark:text-primary-white",
  };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

