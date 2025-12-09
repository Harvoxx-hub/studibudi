"use client";

import React, { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import {
  CheckCircleIcon,
  XCircleIcon,
  BookmarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  BookmarkIcon as BookmarkIconSolid,
} from "@heroicons/react/24/solid";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Flashcard } from "@/types";
import { MathRenderer } from "@/components/shared/MathRenderer";

interface FlashcardViewerProps {
  flashcards: Flashcard[];
  onCardUpdate?: (cardId: string, updates: Partial<Flashcard>) => void;
  onSessionComplete?: (stats: SessionStats) => void;
  filterMode?: "all" | "unknown";
}

interface SessionStats {
  total: number;
  known: number;
  unknown: number;
  bookmarked: number;
}

export function FlashcardViewer({
  flashcards,
  onCardUpdate,
  onSessionComplete,
  filterMode = "all",
}: FlashcardViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    total: 0,
    known: 0,
    unknown: 0,
    bookmarked: 0,
  });

  // Filter cards based on mode
  const filteredCards = React.useMemo(() => {
    if (filterMode === "unknown") {
      return flashcards.filter((card) => !card.isKnown);
    }
    return flashcards;
  }, [flashcards, filterMode]);

  const currentCard = filteredCards[currentIndex];
  const totalCards = filteredCards.length;
  const progress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  useEffect(() => {
    if (filteredCards.length > 0 && currentIndex >= filteredCards.length) {
      // Session complete
      if (onSessionComplete) {
        onSessionComplete(sessionStats);
      }
    }
  }, [currentIndex, filteredCards.length, sessionStats, onSessionComplete]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleKnow = () => {
    if (!currentCard) return;

    const updates = {
      isKnown: true,
      lastStudied: new Date().toISOString(),
    };

    if (onCardUpdate) {
      onCardUpdate(currentCard.id, updates);
    }

    setSessionStats((prev) => ({
      ...prev,
      known: prev.known + 1,
    }));

    nextCard();
  };

  const handleDontKnow = () => {
    if (!currentCard) return;

    const updates = {
      isKnown: false,
      lastStudied: new Date().toISOString(),
    };

    if (onCardUpdate) {
      onCardUpdate(currentCard.id, updates);
    }

    setSessionStats((prev) => ({
      ...prev,
      unknown: prev.unknown + 1,
    }));

    nextCard();
  };

  const handleBookmark = () => {
    if (!currentCard) return;

    const updates = {
      isBookmarked: !currentCard.isBookmarked,
    };

    if (onCardUpdate) {
      onCardUpdate(currentCard.id, updates);
    }

    setSessionStats((prev) => ({
      ...prev,
      bookmarked: currentCard.isBookmarked
        ? prev.bookmarked - 1
        : prev.bookmarked + 1,
    }));
  };

  const nextCard = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      // Session complete
      if (onSessionComplete) {
        onSessionComplete(sessionStats);
      }
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  // Swipe handlers
  const swipeHandlers = useSwipeable({
    onSwiping: (eventData) => {
      setIsSwiping(true);
      // Only allow horizontal swipes when card is flipped
      if (isFlipped) {
        setSwipeOffset(eventData.deltaX);
      }
    },
    onSwipedLeft: () => {
      if (isFlipped) {
        setIsSwiping(false);
        setSwipeOffset(0);
        handleDontKnow();
      }
    },
    onSwipedRight: () => {
      if (isFlipped) {
        setIsSwiping(false);
        setSwipeOffset(0);
        handleKnow();
      }
    },
    onSwipedUp: () => {
      // Swipe up to go to next card
      setIsSwiping(false);
      setSwipeOffset(0);
      nextCard();
    },
    onSwipedDown: () => {
      // Swipe down to go to previous card
      setIsSwiping(false);
      setSwipeOffset(0);
      prevCard();
    },
    onTouchEndOrOnMouseUp: () => {
      setIsSwiping(false);
      setSwipeOffset(0);
    },
    trackMouse: true, // Enable mouse swipe for desktop
    trackTouch: true, // Enable touch swipe for mobile
    preventScrollOnSwipe: true,
    delta: 50, // Minimum distance for a swipe
  });

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-gray600 dark:text-neutral-gray400">
          {filterMode === "unknown"
            ? "No unknown cards to study!"
            : "No flashcards available."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-neutral-gray900 dark:text-neutral-gray100">
            Card {currentIndex + 1} of {totalCards}
          </span>
          <span className="text-sm text-neutral-gray600 dark:text-neutral-gray400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-neutral-gray200 dark:bg-neutral-gray700 rounded-full h-2">
          <div
            className="bg-primary-black dark:bg-primary-white h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div 
        className="mb-6 card-flip-container"
        style={{ 
          perspective: "1000px",
          WebkitPerspective: "1000px",
        }}
        {...swipeHandlers}
      >
        <div
          className="relative min-h-[400px] cursor-pointer select-none"
          onClick={(e) => {
            // Only flip on click if not swiping
            if (!isSwiping) {
              handleFlip();
            }
          }}
          style={{
            transform: isSwiping && isFlipped 
              ? `translateX(${swipeOffset}px) rotateY(180deg)`
              : isFlipped
              ? "rotateY(180deg)"
              : "rotateY(0deg)",
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transition: isSwiping ? "transform 0.1s ease-out" : "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
            {/* Front of Card */}
            <div 
              className="card-face absolute inset-0 bg-neutral-white dark:bg-neutral-gray900 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div className="p-8 text-center h-full min-h-[400px] flex flex-col justify-center">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark();
                    }}
                    className="p-2 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors"
                  >
                    {currentCard.isBookmarked ? (
                      <BookmarkIconSolid className="w-6 h-6 text-primary-black dark:text-primary-white" />
                    ) : (
                      <BookmarkIcon className="w-6 h-6 text-neutral-gray600 dark:text-neutral-gray400" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-neutral-gray500 dark:text-neutral-gray400 mb-4">Front</p>
                <h2 className="text-2xl font-bold text-neutral-gray900 dark:text-neutral-gray100">
                  <MathRenderer content={currentCard.front} />
                </h2>
                <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mt-6">
                  Tap to flip
                </p>
                <p className="text-xs text-neutral-gray400 dark:text-neutral-gray500 mt-2">
                  Swipe up/down to navigate
                </p>
              </div>
            </div>
            
            {/* Back of Card */}
            <div 
              className="card-face card-face-back absolute inset-0 bg-neutral-white dark:bg-neutral-gray900 rounded-lg border border-neutral-gray200 dark:border-neutral-gray700"
              style={{
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
                WebkitTransform: "rotateY(180deg)",
              }}
            >
              <div className="p-8 text-center h-full min-h-[400px] flex flex-col justify-center">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark();
                    }}
                    className="p-2 hover:bg-neutral-gray100 dark:hover:bg-neutral-gray800 rounded-lg transition-colors"
                  >
                    {currentCard.isBookmarked ? (
                      <BookmarkIconSolid className="w-6 h-6 text-primary-black dark:text-primary-white" />
                    ) : (
                      <BookmarkIcon className="w-6 h-6 text-neutral-gray600 dark:text-neutral-gray400" />
                    )}
                  </button>
                </div>
                
                {/* Swipe indicators (only show when swiping) */}
                {isSwiping && (
                  <>
                    {swipeOffset > 50 && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-primary-black dark:bg-primary-white text-primary-white dark:text-primary-black px-4 py-2 rounded-lg pointer-events-none z-20 shadow-lg">
                        <CheckCircleIcon className="w-5 h-5" />
                        <span className="font-semibold text-sm">I Know</span>
                      </div>
                    )}
                    {swipeOffset < -50 && (
                      <div className="absolute top-4 left-4 flex items-center gap-2 bg-neutral-gray900 dark:bg-neutral-gray700 text-primary-white dark:text-primary-white px-4 py-2 rounded-lg pointer-events-none z-20 shadow-lg">
                        <XCircleIcon className="w-5 h-5" />
                        <span className="font-semibold text-sm">I Don't Know</span>
                      </div>
                    )}
                  </>
                )}

                <p className="text-xs text-neutral-gray500 dark:text-neutral-gray400 mb-4">Back</p>
                <p className="text-xl text-neutral-gray900 dark:text-neutral-gray100 leading-relaxed">
                  <MathRenderer content={currentCard.back} />
                </p>
                <p className="text-sm text-neutral-gray600 dark:text-neutral-gray400 mt-6">
                  Tap to flip back
                </p>
                <p className="text-xs text-neutral-gray400 dark:text-neutral-gray500 mt-2">
                  Swipe left/right to answer • Swipe up/down to navigate
                </p>
              </div>
            </div>
          </div>
        </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="md"
          onClick={prevCard}
          disabled={currentIndex === 0}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Previous
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={handleFlip}
        >
          {isFlipped ? "Show Front" : "Flip Card"}
        </Button>
        <Button
          variant="ghost"
          size="md"
          onClick={nextCard}
          disabled={currentIndex >= filteredCards.length - 1}
        >
          Next
          <ArrowRightIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Action Buttons */}
      {isFlipped && (
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleDontKnow}
            className="flex items-center justify-center gap-2 border-neutral-gray900 dark:border-neutral-gray700 text-neutral-gray900 dark:text-neutral-gray100 hover:bg-neutral-gray900 dark:hover:bg-neutral-gray700 hover:text-primary-white dark:hover:text-primary-white"
          >
            <XCircleIcon className="w-5 h-5" />
            I Don't Know
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleKnow}
            className="flex items-center justify-center gap-2"
          >
            <CheckCircleIcon className="w-5 h-5" />
            I Know
          </Button>
        </div>
      )}

      {/* Session Stats */}
      <div className="mt-6 pt-6 border-t border-neutral-gray200 dark:border-neutral-gray700">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="text-center">
            <p className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
              {sessionStats.known}
            </p>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">Known</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
              {sessionStats.unknown}
            </p>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">Unknown</p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-neutral-gray900 dark:text-neutral-gray100">
              {sessionStats.bookmarked}
            </p>
            <p className="text-neutral-gray600 dark:text-neutral-gray400">Bookmarked</p>
          </div>
        </div>
      </div>
    </div>
  );
}

