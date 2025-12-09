"use client";

import React from "react";
import { Card } from "@/components/ui/Card";

interface ProgressCardProps {
  streak: number;
  studyCountToday: number;
}

export function ProgressCard({ streak, studyCountToday }: ProgressCardProps) {
  return (
    <Card className="bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black border-2 border-primary-black dark:border-primary-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90 mb-1">Study Streak</p>
          <p className="text-2xl font-bold">{streak} days 🔥</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90 mb-1">Today</p>
          <p className="text-2xl font-bold">{studyCountToday} cards</p>
        </div>
      </div>
    </Card>
  );
}

