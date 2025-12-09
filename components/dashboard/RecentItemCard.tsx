"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface RecentItemCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeVariant?: "default" | "success" | "warning" | "error" | "premium";
  onClick?: () => void;
}

export function RecentItemCard({
  title,
  subtitle,
  badge,
  badgeVariant = "default",
  onClick,
}: RecentItemCardProps) {
  return (
    <Card onClick={onClick} hover className="mb-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">{subtitle}</p>
          )}
        </div>
        {badge && (
          <Badge variant={badgeVariant}>{badge}</Badge>
        )}
      </div>
    </Card>
  );
}

