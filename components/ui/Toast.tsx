"use client";

import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Notification } from "@/types";
import { Badge } from "./Badge";

interface ToastProps {
  notification: Notification;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  notification,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const variantMap = {
    success: "success",
    info: "default",
    warning: "warning",
    error: "error",
  } as const;

  return (
    <div className="bg-neutral-white rounded-lg shadow-lg p-4 mb-3 min-w-[300px] max-w-[400px] border-l-4 border-primary-black animate-slide-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-neutral-gray900">{notification.title}</h4>
            <Badge variant={variantMap[notification.type]} className="text-xs">
              {notification.type}
            </Badge>
          </div>
          <p className="text-sm text-neutral-gray600">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-neutral-gray400 hover:text-neutral-gray900 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ notifications, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          notification={notification}
          onClose={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
}
