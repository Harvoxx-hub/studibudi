import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "accent" | "outline" | "ghost" | "white";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const baseStyles = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";
  
  const variantStyles = {
    primary: "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black hover:bg-neutral-gray900 dark:hover:bg-neutral-gray100 focus:ring-primary-black dark:focus:ring-primary-white",
    secondary: "bg-neutral-gray900 dark:bg-neutral-gray700 text-primary-white dark:text-primary-white hover:bg-neutral-gray800 dark:hover:bg-neutral-gray600 focus:ring-neutral-gray900 dark:focus:ring-neutral-gray700",
    accent: "bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black hover:bg-neutral-gray900 dark:hover:bg-neutral-gray100 focus:ring-primary-black dark:focus:ring-primary-white",
    outline: "border-2 border-primary-black dark:border-primary-white text-primary-black dark:text-primary-white hover:bg-primary-black dark:hover:bg-primary-white hover:text-primary-white dark:hover:text-primary-black focus:ring-primary-black dark:focus:ring-primary-white",
    ghost: "text-neutral-gray900 dark:text-neutral-gray100 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 focus:ring-neutral-gray900 dark:focus:ring-neutral-gray700",
    white: "bg-primary-white text-primary-black hover:bg-neutral-gray100 focus:ring-primary-white",
  };
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };
  
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

