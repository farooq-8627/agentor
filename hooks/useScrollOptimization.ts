import { useEffect, useCallback, useRef } from "react";

interface ScrollOptimizationOptions {
  throttleMs?: number;
  enableRAF?: boolean;
  disablePointerEvents?: boolean;
}

export function useScrollOptimization(options: ScrollOptimizationOptions = {}) {
  const {
    throttleMs = 16, // ~60fps
    enableRAF = true,
    disablePointerEvents = true,
  } = options;

  const scrollingRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const handleScrollStart = useCallback(() => {
    if (!scrollingRef.current) {
      scrollingRef.current = true;

      // Disable pointer events during scroll for better performance
      if (disablePointerEvents) {
        document.body.style.pointerEvents = "none";
      }
    }
  }, [disablePointerEvents]);

  const handleScrollEnd = useCallback(() => {
    scrollingRef.current = false;

    // Re-enable pointer events
    if (disablePointerEvents) {
      document.body.style.pointerEvents = "auto";
    }
  }, [disablePointerEvents]);

  const throttledScrollHandler = useCallback(
    (callback: () => void) => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      handleScrollStart();

      if (enableRAF) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(callback);
      } else {
        callback();
      }

      timeoutRef.current = window.setTimeout(handleScrollEnd, throttleMs);
    },
    [handleScrollStart, handleScrollEnd, throttleMs, enableRAF]
  );

  useEffect(() => {
    const handleScroll = () => {
      throttledScrollHandler(() => {
        // Custom scroll logic can be added here
      });
    };

    // Passive event listeners for better performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleScroll, { passive: true });
    window.addEventListener("touchmove", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchmove", handleScroll);

      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [throttledScrollHandler]);

  return {
    isScrolling: scrollingRef.current,
    throttledScrollHandler,
  };
}
