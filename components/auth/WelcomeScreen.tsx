"use client";

import {
  LightBulbIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BoltIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onGetStarted,
  onSignIn,
}) => {
  const features = [
    {
      icon: LightBulbIcon,
      title: "AI-Powered Flashcards",
      description: "Transform your notes into interactive flashcards instantly",
    },
    {
      icon: DocumentTextIcon,
      title: "Smart Quizzes",
      description: "Generate practice quizzes to test your knowledge",
    },
    {
      icon: ChartBarIcon,
      title: "Track Progress",
      description: "Monitor your study streaks and improvement",
    },
    {
      icon: BoltIcon,
      title: "Study Faster",
      description: "Learn more efficiently with AI-generated content",
    },
  ];

  return (
    <div className="min-h-screen bg-primary-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <AcademicCapIcon className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Studibudi
          </h1>
          <p className="text-xl text-white opacity-90">
            Transform your study materials into flashcards and quizzes with AI
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="bg-white dark:bg-neutral-gray900 bg-opacity-95 dark:bg-opacity-95 hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-all">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg">
                    <IconComponent className="w-8 h-8 text-primary-black dark:text-primary-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-gray900 dark:text-neutral-gray100 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="accent"
            size="lg"
            onClick={onGetStarted}
            className="flex-1 sm:flex-none px-8"
          >
            Get Started
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={onSignIn}
            className="flex-1 sm:flex-none px-8 bg-primary-white text-primary-black border-2 border-primary-white hover:bg-neutral-gray50"
          >
            Sign In
          </Button>
        </div>

        {/* Skip option */}
        <div className="text-center mt-6">
          <button
            onClick={onSignIn}
            className="text-white opacity-75 hover:opacity-100 text-sm underline"
          >
            Already have an account? Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

