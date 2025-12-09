"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SparklesIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  feature?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  title = "Upgrade to Premium",
  message = "You've reached the limit for free users. Upgrade to Premium to continue.",
  feature,
}: UpgradeModalProps) {
  const router = useRouter();

  const handleUpgrade = () => {
    onClose();
    router.push("/premium");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-primary-black dark:text-primary-white" />
            <h2 className="text-xl font-semibold text-neutral-gray900 dark:text-neutral-gray100">
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-gray400 hover:text-neutral-gray600 dark:hover:text-neutral-gray300"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-neutral-gray600 dark:text-neutral-gray400 mb-4">
            {message}
          </p>

          {feature && (
            <div className="bg-neutral-gray100 dark:bg-neutral-gray800 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100 mb-2">
                Premium Feature:
              </p>
              <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
                {feature}
              </p>
            </div>
          )}

          <div className="bg-primary-black dark:bg-primary-white rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-primary-white dark:text-primary-black mb-2">
              Premium Benefits:
            </p>
            <ul className="text-sm text-primary-white dark:text-primary-black space-y-1">
              <li>• Unlimited AI flashcards</li>
              <li>• Unlimited quizzes</li>
              <li>• Larger file uploads (50MB)</li>
              <li>• Faster generation</li>
              <li>• No ads</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onClose}
          >
            Maybe Later
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={handleUpgrade}
          >
            Upgrade Now
          </Button>
        </div>
      </div>
    </Modal>
  );
}

