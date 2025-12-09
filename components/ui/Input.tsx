import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-1">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2 border rounded-lg text-neutral-gray900 dark:text-neutral-gray100 placeholder:text-neutral-gray400 dark:placeholder:text-neutral-gray500 bg-neutral-white dark:bg-neutral-gray800 focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white focus:border-transparent ${
          error ? "border-primary-black dark:border-primary-white" : "border-neutral-gray300 dark:border-neutral-gray600"
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-primary-black dark:text-primary-white">{error}</p>
      )}
    </div>
  );
};

