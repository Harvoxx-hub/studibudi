import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { NotificationProvider } from "@/components/shared/NotificationProvider";

export const metadata: Metadata = {
  title: "Studibudi - Your AI Study Assistant",
  description: "Transform your study materials into flashcards and quizzes with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="bg-neutral-gray50 dark:bg-neutral-black">
      <body 
        className="antialiased bg-neutral-gray50 dark:bg-neutral-black text-neutral-gray900 dark:text-neutral-gray100"
        suppressHydrationWarning
      >
        <ThemeProvider>
          {children}
          <NotificationProvider />
        </ThemeProvider>
      </body>
    </html>
  );
}

