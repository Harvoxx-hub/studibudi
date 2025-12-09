"use client";

import {
  AcademicCapIcon,
  BookOpenIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ChartBarIcon,
  BoltIcon,
  EnvelopeIcon,
  UserCircleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  AcademicCapIcon as AcademicCapIconSolid,
  BookOpenIcon as BookOpenIconSolid,
} from "@heroicons/react/24/solid";

// App-specific icon mappings
export const AppIcons = {
  // Brand/App
  logo: AcademicCapIcon,
  logoSolid: AcademicCapIconSolid,
  book: BookOpenIcon,
  bookSolid: BookOpenIconSolid,

  // Features
  flashcards: LightBulbIcon,
  quiz: DocumentTextIcon,
  progress: ChartBarIcon,
  fast: BoltIcon,

  // Actions
  upload: DocumentTextIcon,
  generate: BoltIcon,
  email: EnvelopeIcon,
  user: UserCircleIcon,
  arrowRight: ArrowRightIcon,

  // Status
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
};

// Icon component with size variants
interface IconProps {
  icon: keyof typeof AppIcons;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  solid?: boolean;
}

export const Icon: React.FC<IconProps> = ({
  icon,
  className = "",
  size = "md",
  solid = false,
}) => {
  const IconComponent = solid && icon.includes("logo")
    ? AppIcons[icon.replace("logo", "logoSolid") as keyof typeof AppIcons] || AppIcons[icon]
    : AppIcons[icon];

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8",
  };

  return <IconComponent className={`${sizeClasses[size]} ${className}`} />;
};


