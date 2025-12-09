"use client";

import { ToastContainer } from "@/components/ui/Toast";
import { useAppStore } from "@/store/useAppStore";

export const NotificationProvider: React.FC = () => {
  const { notifications, removeNotification } = useAppStore();

  return <ToastContainer notifications={notifications} onRemove={removeNotification} />;
};

