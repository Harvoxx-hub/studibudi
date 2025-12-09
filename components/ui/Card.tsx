import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hover = false,
  ...props
}) => {
  const baseStyles = "bg-neutral-white dark:bg-neutral-gray900 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700 p-4";
  const hoverStyles = hover || onClick ? "cursor-pointer hover:border-primary-black dark:hover:border-primary-white transition-all duration-200" : "";
  
  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};


