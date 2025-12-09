"use client";

import React from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <MagnifyingGlassIcon className="h-5 w-5 text-neutral-gray400 dark:text-neutral-gray500" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2 border border-neutral-gray200 dark:border-neutral-gray700 rounded-lg bg-neutral-white dark:bg-neutral-gray900 text-neutral-gray900 dark:text-neutral-gray100 placeholder:text-neutral-gray400 dark:placeholder:text-neutral-gray500 focus:outline-none focus:ring-2 focus:ring-primary-black dark:focus:ring-primary-white focus:border-transparent"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-gray400 dark:text-neutral-gray500 hover:text-primary-black dark:hover:text-primary-white"
          aria-label="Clear search"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

